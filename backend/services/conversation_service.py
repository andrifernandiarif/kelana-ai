"""
conversation_service.py
-----------------------
Business logic for conversations and messages.

Responsibilities:
  1. Create / list conversations.
  2. Persist user messages and AI replies.
  3. Build a context-aware prompt from conversation history.
  4. Trim the context window before calling the LLM  ← Part 8
  5. Call Bedrock and return the assistant reply.

────────────────────────────────────────────────────────────────
Part 8 — Trim Context Window
────────────────────────────────────────────────────────────────
Problem:
  500+ messages in a long thread → ~8 K tokens per call → cost grows with
  every turn because the full history is sent each time.

Strategy implemented here — "Recent Messages" (cheapest, usually sufficient):
  Send only the last CONTEXT_WINDOW_TURNS *complete turns* (user + assistant
  pairs) to the model.  Full history is always stored in the DB — only the
  slice sent to Bedrock is trimmed.

Tradeoffs (mentioned in the slides):
  • Summarization  — compress older turns into a single summary message.
                     More context preserved, higher implementation cost.
  • Token Limits   — every model has a hard max context window; never exceed it.

CONTEXT_WINDOW_TURNS is read from the environment so it can be tuned without
a code change.  Default: 20 turns = 40 messages (user + assistant each).
"""

from sqlalchemy.orm import Session

import models  # noqa: F401 — registers all models in dependency order
from models.conversation import Conversation, Message
from services.bedrock_service import get_bedrock_client

import os


# ---------------------------------------------------------------------------
# Part 8 — Context window configuration
# ---------------------------------------------------------------------------

# Number of recent *complete turns* (user + assistant pairs) to include in the
# prompt.  Each turn = 2 messages, so 20 turns = up to 40 messages sent to LLM.
# Set CONTEXT_WINDOW_TURNS=0 in .env to send the full history (no trimming).
CONTEXT_WINDOW_TURNS: int = int(os.getenv("CONTEXT_WINDOW_TURNS", "20"))


# ---------------------------------------------------------------------------
# Conversation helpers
# ---------------------------------------------------------------------------

def create_conversation(db: Session, user_id: int, title: str = "New Conversation") -> Conversation:
    """Insert a new conversation row and return it."""
    conversation = Conversation(user_id=user_id, title=title)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def list_conversations(db: Session, user_id: int) -> list[Conversation]:
    """Return all conversations for a user, newest first."""
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.created_at.desc())
        .all()
    )


def get_conversation(db: Session, conversation_id: int, user_id: int) -> Conversation | None:
    """Fetch a single conversation, scoped to the authenticated user."""
    return (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        .first()
    )


# ---------------------------------------------------------------------------
# Message helpers
# ---------------------------------------------------------------------------

def get_messages(db: Session, conversation_id: int) -> list[Message]:
    """Return ALL messages in a conversation, ordered by created_at ASC.

    This is the source-of-truth for the DB.  Trimming happens later in
    trim_history() before the slice is sent to the LLM.
    """
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )


def _save_message(db: Session, conversation_id: int, role: str, content: str) -> Message:
    """Persist a single message row."""
    msg = Message(conversation_id=conversation_id, role=role, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


# ---------------------------------------------------------------------------
# Part 8 — Context window trimmer
# ---------------------------------------------------------------------------

def trim_history(history: list[Message], max_turns: int) -> list[Message]:
    """
    Return the most-recent `max_turns` complete turns from history.

    A "turn" is one user message + its following assistant reply (2 messages).
    Keeping only complete turns avoids sending a dangling user message without
    a matching assistant reply, which confuses most LLMs.

    Rules:
      • max_turns == 0  → return full history (trimming disabled).
      • If history is shorter than max_turns turns, return it unchanged.
      • The slice always starts on a user message to preserve turn integrity.

    Example (max_turns=2, history has 6 messages = 3 turns):
        Before: [U1, A1, U2, A2, U3, A3]
        After:  [U2, A2, U3, A3]          ← last 2 turns = 4 messages

    The full history is still stored in the DB — only the prompt is trimmed.
    """
    if max_turns == 0 or len(history) == 0:
        return history

    # Each turn = 2 messages (user + assistant).  Take the tail.
    max_messages = max_turns * 2
    if len(history) <= max_messages:
        return history

    trimmed = history[-max_messages:]

    # Guarantee we start on a user message (turn integrity)
    if trimmed and trimmed[0].role != "user":
        trimmed = trimmed[1:]

    return trimmed


# ---------------------------------------------------------------------------
# Prompt builder  —  the key responsibility of AI-native applications
# ---------------------------------------------------------------------------

def build_prompt(history: list[Message], new_user_content: str) -> list[dict]:
    """
    Convert a (possibly trimmed) message history + the new user input into
    the list-of-dicts format expected by the Bedrock Converse API.

    Each turn becomes:
        {"role": "user" | "assistant", "content": [{"text": "..."}]}

    The new user message is appended at the end so the model always sees
    the most recent question last.

    Example result:
        [
            {"role": "user",      "content": [{"text": "Plan a family trip to Japan."}]},
            {"role": "assistant", "content": [{"text": "Here is a 5-day itinerary…"}]},
            {"role": "user",      "content": [{"text": "What should we do on Day 2?"}]},
        ]
    """
    prompt: list[dict] = [
        {"role": msg.role, "content": [{"text": msg.content}]}
        for msg in history
    ]

    # Append the new incoming user message
    prompt.append({
        "role": "user",
        "content": [{"text": new_user_content}],
    })

    return prompt


# ---------------------------------------------------------------------------
# Orchestration  —  send message + get AI reply
# ---------------------------------------------------------------------------

def send_message(db: Session, conversation_id: int, user_content: str) -> Message:
    """
    Full pipeline for one conversational turn:

      1. Load the full message history from the DB.
      2. Persist the new user message.
      3. Trim history to the last N turns  ← Part 8
      4. Build a context-aware prompt from the trimmed slice.
      5. Call Amazon Bedrock (Nova) via the Converse API.
      6. Persist the assistant reply.
      7. Auto-update the conversation title from the first user message.
      8. Return the assistant Message row.
    """
    client   = get_bedrock_client()
    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    # ── 1. Load full history from DB ─────────────────────────────────────────
    history = get_messages(db, conversation_id)

    # ── 2. Persist the incoming user message ─────────────────────────────────
    _save_message(db, conversation_id, role="user", content=user_content)

    # ── 3. Part 8: Trim to last N turns before building the prompt ───────────
    #
    #   500+ messages → ~8 K tokens → cost grows every call.
    #   Solution: send only the last CONTEXT_WINDOW_TURNS turns.
    #   Full history is safe in the DB — only the LLM slice is trimmed.
    #
    recent_history = trim_history(history, max_turns=CONTEXT_WINDOW_TURNS)

    # ── 4. Build context-aware prompt from trimmed slice ─────────────────────
    messages_for_llm = build_prompt(recent_history, user_content)

    # ── 5. Call Bedrock Converse API ─────────────────────────────────────────
    response = client.converse(
        modelId=model_id,
        system=[
            {
                "text": (
                    "You are KelanaAI, a friendly and knowledgeable travel assistant. "
                    "Help users plan trips, build itineraries, recommend destinations, "
                    "and answer travel-related questions. "
                    "Keep answers clear and practical."
                )
            }
        ],
        messages=messages_for_llm,
        inferenceConfig={
            "maxTokens": 2048,
            "temperature": 0.7,
            "topP": 0.9,
        },
    )

    # Extract the assistant's text reply
    output_message  = response["output"]["message"]
    assistant_content = "".join(
        block["text"]
        for block in output_message["content"]
        if "text" in block
    )

    # ── 6. Persist the assistant reply ───────────────────────────────────────
    assistant_msg = _save_message(
        db,
        conversation_id,
        role="assistant",
        content=assistant_content,
    )

    # ── 7. Auto-title: use first user message (truncated to 60 chars) ─────────
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation and conversation.title == "New Conversation":
        conversation.title = user_content[:60].strip()
        db.commit()

    # ── 8. Return the assistant message row ──────────────────────────────────
    return assistant_msg
