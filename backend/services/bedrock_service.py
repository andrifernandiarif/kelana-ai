import os
import json
import boto3
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()


def get_bedrock_client():
    """
    Configure and return a Bedrock Runtime client using the bearer token
    and region from environment variables.
    """
    bearer_token = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
    region = os.getenv("AWS_REGION", "ap-southeast-2")

    if not bearer_token:
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK is not set in environment variables.")

    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=region,
        aws_access_key_id="Bearer",
        aws_secret_access_key=bearer_token,
    )

    return client


def get_ai_recommendation(
    destination: str, 
    days: int, 
    budget: float, 
    month:str, 
    travel_style: str,
    travel_season: str) -> str:
    """
    Generate a travel itinerary using AWS Bedrock (Amazon Nova Lite).

    Args:
        destination:  The travel destination (e.g. "Bali, Indonesia").
        days:         Number of days for the trip.
        budget:       Total budget in USD.
        travel_style: Travel style (e.g. "backpacker", "luxury", "family").

    Returns:
        The AI-generated itinerary as a string.
    """
    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    prompt = (
        f"You are an experienced travel planner.\n "
        f"Plan a {days}-day itinerary for {destination}.\n "
        f"Budget: USD{budget}.\n "
        f"Travel Style: {travel_style}.\n"
        f"Month: {month}.\n"
        f"Travel Season: {travel_season}.\n"

        f"Consider the travel season when creating the itinerary.\n"
        f"Provide Transportation recommendation.\n"
        f"Provide local food recommendation.\n"

        f"Format your response as Markdown with headers (##) and bullet lists (-)."
    )


    # Amazon Nova uses the Converse API
    client = get_bedrock_client()

    response = client.converse(
        modelId=model_id,
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ],
        inferenceConfig={
            "maxTokens": 2048,
            "temperature": 0.2,
            "topP": 0.9,
        },
    )

    # Extract the assistant's reply from the response
    output_message = response["output"]["message"]
    recommendation = "".join(
        block["text"]
        for block in output_message["content"]
        if "text" in block
    )

    return recommendation
