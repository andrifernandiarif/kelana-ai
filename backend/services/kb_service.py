import os
import boto3

from dotenv import load_dotenv

load_dotenv()


def get_bedrock_agent_client():
    """
    Create AWS Bedrock Agent Runtime client.
    Used specifically for Knowledge Base (RAG) retrieval and generation.
    """
    region = os.getenv("AWS_REGION", "ap-southeast-2")
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")

    if not access_key or not secret_key:
        raise ValueError(
            "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be configured."
        )

    client = boto3.client(
        service_name="bedrock-agent-runtime",
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )

    return client


def retrieve_from_knowledge_base(question: str, num_results: int = 5) -> list[dict]:
    """
    Retrieve relevant documents/chunks from the AWS Bedrock Knowledge Base
    based on the user's question (pure retrieval — no generation).

    Args:
        question:    The user's question or query string.
        num_results: Maximum number of document chunks to retrieve.

    Returns:
        A list of dicts, each containing:
          - text:  The retrieved text chunk.
          - score: Relevance score (0–1).
          - source: The original source URI of the document (if available).
    """
    client = get_bedrock_agent_client()
    knowledge_base_id = os.getenv("KNOWLEDGE_BASE_ID")

    if not knowledge_base_id:
        raise ValueError("KNOWLEDGE_BASE_ID is not configured in environment.")

    response = client.retrieve(
        knowledgeBaseId=knowledge_base_id,
        retrievalQuery={"text": question},
        retrievalConfiguration={
            "managedSearchConfiguration": {}
        },
    )

    results = []
    for result in response.get("retrievalResults", []):
        content = result.get("content", {})
        location = result.get("location", {})
        score = result.get("score", 0.0)

        # Extract source URI (S3 or web, depending on KB data source type)
        source_uri = (
            location.get("s3Location", {}).get("uri")
            or location.get("webLocation", {}).get("url")
            or "Unknown source"
        )

        results.append({
            "text": content.get("text", ""),
            "score": score,
            "source": source_uri,
        })

    return results


def ask_knowledge_base(question: str) -> dict:
    """
    Full RAG pipeline using 2-step manual approach:
      1. retrieve() — fetch relevant chunks from the managed Knowledge Base.
      2. converse() — send retrieved context + question to Bedrock LLM to generate answer.

    This approach works with all Knowledge Base types including managed KBs,
    which do NOT support the RetrieveAndGenerate API.

    Args:
        question: The user's natural language question.

    Returns:
        A dict containing:
          - answer:     The AI-generated answer grounded in the KB.
          - citations:  List of source references used to generate the answer.
    """
    # ── Step 1: Retrieve relevant chunks from the Knowledge Base ──────────────
    chunks = retrieve_from_knowledge_base(question, num_results=5)

    citations = [
        {"source": c["source"], "snippet": c["text"]}
        for c in chunks
    ]

    # Build a single context block from retrieved chunks
    if chunks:
        context_text = "\n\n---\n\n".join(
            f"[Source: {c['source']}]\n{c['text']}" for c in chunks
        )
    else:
        context_text = "No relevant information found in the knowledge base."

    # ── Step 2: Generate grounded answer via Bedrock converse() ───────────────
    region = os.getenv("AWS_REGION", "ap-southeast-2")
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    bedrock_runtime = boto3.client(
        service_name="bedrock-runtime",
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )

    prompt = (
        "You are a helpful travel assistant for KelanaAI.\n"
        "Answer the user's question using ONLY the context provided below.\n"
        "If the context does not contain enough information, say so clearly.\n\n"
        f"## Context from Knowledge Base\n{context_text}\n\n"
        f"## User Question\n{question}"
    )

    response = bedrock_runtime.converse(
        modelId=model_id,
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ],
        inferenceConfig={
            "maxTokens": 1024,
            "temperature": 0.2,
            "topP": 0.9,
        },
    )

    output_message = response["output"]["message"]
    answer = "".join(
        block["text"]
        for block in output_message["content"]
        if "text" in block
    )

    return {
        "answer": answer,
        "citations": citations,
    }
