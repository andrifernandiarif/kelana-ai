from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional

from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation_recommendation,
    get_travel_season,
)

from services.bedrock_service import get_ai_recommendation
from services.kb_service import ask_knowledge_base
from services.auth_service import (
    register_user,
    authenticate_user,
    create_access_token,
    decode_access_token,
    get_user_by_id,
)
from services.conversation_service import (
    create_conversation as svc_create_conversation,
    list_conversations as svc_list_conversations,
    get_conversation as svc_get_conversation,
    get_messages as svc_get_messages,
    send_message as svc_send_message,
)

from database import SessionLocal, init_db
from models.trip import Trip
from models.user import User
from models.conversation import Conversation, Message

from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()



# Pydantic models
class AskRequest(BaseModel):
    question: str

class TripRequest(BaseModel):
    destination:  str
    days:         int
    budget:       float
    month:        str
    travel_style: str

class TripUpdate(BaseModel):
    budget: float

class RegisterRequest(BaseModel):
    name:     str
    email:    str
    password: str

class LoginRequest(BaseModel):
    email:    str
    password: str

class ConversationCreateRequest(BaseModel):
    title: Optional[str] = "New Conversation"

class MessageRequest(BaseModel):
    content: str



# App + middleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()



# Auth dependency — extract & validate JWT from Authorization header
def get_current_user(authorization: Optional[str] = Header(default=None)) -> User:
    """FastAPI dependency: decode JWT and return the authenticated User.

    Raises 401 if the header is missing, malformed, or the token is invalid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Not authenticated. Please log in.",
        )

    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Token is invalid or has expired.",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload.")

    db = SessionLocal()
    try:
        user = get_user_by_id(db, int(user_id))
    finally:
        db.close()

    if user is None:
        raise HTTPException(status_code=401, detail="User not found.")

    return user



# Public endpoints
@app.get("/")
def home():
    return {"message": "Welcome to KelanaAI"}


@app.get("/health")
def health():
    return {"status": "Ok"}


@app.get("/trip-categories")
def trip_category():
    return ["Backpacker", "Standart", "Luxury"]


@app.get("/api/v1/recommendations")
def recommendations():
    return ["Tokyo Tower", "Mount Fuji", "Shibuya"]


@app.get("/api/v1/transportations")
def transportations():
    return ["Bus", "Train", "Flight"]



# RAG / Knowledge Base endpoint
@app.post("/api/v1/ask")
def ask(request: AskRequest):
    """
    RAG endpoint — retrieve context from the AWS Bedrock Knowledge Base
    and generate a grounded answer for the given question.

    Body:
        question (str): The natural language question to answer.

    Returns:
        answer    (str):  AI-generated answer grounded in the Knowledge Base.
        citations (list): Source references used to produce the answer.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="'question' must not be empty.")

    try:
        result = ask_knowledge_base(question=request.question.strip())
        return {
            "question": request.question.strip(),
            "answer": result["answer"],
            "citations": result["citations"],
        }
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to query Knowledge Base: {str(e)}",
        )



# Auth endpoints
@app.post("/api/v1/auth/register")
def register(request: RegisterRequest):
    db = SessionLocal()
    try:
        user = register_user(
            db=db,
            name=request.name,
            email=request.email,
            password=request.password,
        )
        return {
            "message": "Registration successful",
            "user": {"id": user.id, "name": user.name, "email": user.email},
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    finally:
        db.close()


@app.post("/api/v1/auth/login")
def login(request: LoginRequest):
    db = SessionLocal()
    try:
        user = authenticate_user(db=db, email=request.email, password=request.password)
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        access_token = create_access_token(data={"sub": str(user.id)})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email},
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
    finally:
        db.close()


@app.post("/api/v1/auth/logout")
def logout(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header.")

    token = authorization.split(" ", 1)[1]
    if decode_access_token(token) is None:
        raise HTTPException(status_code=401, detail="Token is invalid or has expired.")

    return {"message": "Logout successful"}



# Trip endpoints (protected)
@app.get("/api/v1/trips")
def list_trips(current_user: User = Depends(get_current_user)):
    """Return only the trips that belong to the authenticated user."""
    db = SessionLocal()
    try:
        trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
        return trips
    finally:
        db.close()


@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(
            Trip.id == trip_id,
            Trip.user_id == current_user.id,
        ).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found.")
        return trip
    finally:
        db.close()


@app.post("/api/v1/trips")
def create_trip(
    request: TripRequest,
    current_user: User = Depends(get_current_user),
):
    """Create a new AI trip and associate it with the authenticated user."""
    daily_budget    = calculate_daily_budget(request.budget, request.days)
    category        = get_trip_category(request.budget)
    travel_season   = get_travel_season(request.month)

    ai_recommendation = get_ai_recommendation(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        month=request.month,
        travel_style=request.travel_style,
        travel_season=travel_season,
    )

    trip = Trip(
        user_id           = current_user.id,
        destination       = request.destination,
        days              = request.days,
        month             = request.month,
        travel_season     = travel_season,
        budget            = request.budget,
        daily_budget      = daily_budget,
        travel_style      = request.travel_style,
        category          = category,
        ai_recommendation = ai_recommendation,
    )

    db = SessionLocal()
    try:
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save trip: {str(e)}")
    finally:
        db.close()


@app.post("/api/v1/trips/{id}/generate")
def generate_trip_recommendation(
    id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(
            Trip.id == id,
            Trip.user_id == current_user.id,
        ).first()

        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip {id} not found.")

        recommendation = get_ai_recommendation(
            destination=trip.destination,
            days=trip.days,
            budget=trip.budget,
            month=trip.month,
            travel_style=trip.travel_style,
            travel_season=trip.travel_season,
        )

        trip.ai_recommendation = recommendation
        db.commit()
        db.refresh(trip)

        return {
            "id": trip.id,
            "destination": trip.destination,
            "ai_recommendation": trip.ai_recommendation,
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI recommendation: {str(e)}",
        )
    finally:
        db.close()


@app.put("/api/v1/trips/{trip_id}")
def update_trip(
    trip_id: int,
    trip_data: TripUpdate,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        # Cek apakah trip ada
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found.")

        # Cek ownership — 403 jika bukan milik user yang login
        if trip.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: you do not have permission to update this trip.",
            )

        trip.budget       = trip_data.budget
        trip.category     = get_trip_category(trip_data.budget)
        trip.daily_budget = calculate_daily_budget(trip_data.budget, trip.days)

        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()


@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        # Cek apakah trip ada
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found.")

        # Cek ownership — 403 jika bukan milik user yang login
        if trip.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: you do not have permission to delete this trip.",
            )

        db.delete(trip)
        db.commit()
        return {"message": f"Trip {trip_id} successfully deleted."}
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Conversation endpoints (protected)
# ---------------------------------------------------------------------------

@app.post("/api/v1/conversations", status_code=201)
def create_conversation(
    request: ConversationCreateRequest,
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/v1/conversations

    Create a new conversation row for the authenticated user and return
    its identifier.

    Response 201:
        {"conversation_id": 1}
    """
    db = SessionLocal()
    try:
        conversation = svc_create_conversation(
            db=db,
            user_id=current_user.id,
            title=request.title or "New Conversation",
        )
        return {"conversation_id": conversation.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create conversation: {str(e)}")
    finally:
        db.close()


@app.get("/api/v1/conversations")
def list_conversations(current_user: User = Depends(get_current_user)):
    """
    GET /api/v1/conversations

    List previous conversations for the authenticated user, newest first.

    Response:
        [
            {"id": 1, "title": "Japan Family Trip", "created_at": "2025-07-01T09:10:00Z"},
            ...
        ]
    """
    db = SessionLocal()
    try:
        conversations = svc_list_conversations(db=db, user_id=current_user.id)
        return [
            {
                "id": c.id,
                "title": c.title,
                "created_at": c.created_at.strftime("%Y-%m-%d %H:%M"),
            }
            for c in conversations
        ]
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Message endpoint (protected)
# ---------------------------------------------------------------------------

@app.post("/api/v1/conversations/{conversation_id}/messages", status_code=201)
def send_message(
    conversation_id: int,
    request: MessageRequest,
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/v1/conversations/{conversation_id}/messages

    Send a user message and get an AI reply.

    Orchestration (all happens in the backend):
      1. Verify the conversation belongs to the authenticated user.
      2. Load full message history.
      3. Persist the user message.
      4. Build a context-aware prompt from the complete thread.
      5. Call Amazon Bedrock (Nova) via Converse API.
      6. Persist and return the assistant reply.

    Response 201:
        {
            "message_id": 42,
            "role": "assistant",
            "content": "Here is a 5-day itinerary for Japan…",
            "created_at": "2025-07-01T09:12:00Z"
        }
    """
    if not request.content or not request.content.strip():
        raise HTTPException(status_code=400, detail="'content' must not be empty.")

    db = SessionLocal()
    try:
        # Verify ownership
        conversation = svc_get_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id,
        )
        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found.",
            )

        # Orchestrate: persist user message → build prompt → call LLM → persist reply
        assistant_msg = svc_send_message(
            db=db,
            conversation_id=conversation_id,
            user_content=request.content.strip(),
        )

        return {
            "message_id": assistant_msg.id,
            "role": assistant_msg.role,
            "content": assistant_msg.content,
            "created_at": assistant_msg.created_at.isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send message: {str(e)}",
        )
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Rename conversation endpoint (protected)
# ---------------------------------------------------------------------------

class ConversationRenameRequest(BaseModel):
    title: str

@app.patch("/api/v1/conversations/{conversation_id}")
def rename_conversation(
    conversation_id: int,
    request: ConversationRenameRequest,
    current_user: User = Depends(get_current_user),
):
    """
    PATCH /api/v1/conversations/{conversation_id}

    Rename a conversation title.

    Body:  {"title": "Japan Family Trip"}
    Response: {"id": 1, "title": "Japan Family Trip"}
    """
    if not request.title or not request.title.strip():
        raise HTTPException(status_code=400, detail="'title' must not be empty.")

    db = SessionLocal()
    try:
        conversation = svc_get_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id,
        )
        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found.",
            )
        conversation.title = request.title.strip()[:100]
        db.commit()
        db.refresh(conversation)
        return {"id": conversation.id, "title": conversation.title}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to rename conversation: {str(e)}")
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Get messages for a conversation (protected)
# ---------------------------------------------------------------------------

@app.get("/api/v1/conversations/{conversation_id}/messages")
def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/v1/conversations/{conversation_id}/messages

    Return all messages for a conversation ordered by created_at ASC.

    Response:
        [
            {"id": 1, "role": "user",      "content": "...", "created_at": "..."},
            {"id": 2, "role": "assistant", "content": "...", "created_at": "..."},
        ]
    """
    db = SessionLocal()
    try:
        conversation = svc_get_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id,
        )
        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found.",
            )
        messages = svc_get_messages(db=db, conversation_id=conversation_id)
        return [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load messages: {str(e)}")
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Delete conversation endpoint (protected)
# ---------------------------------------------------------------------------

@app.delete("/api/v1/conversations/{conversation_id}", status_code=200)
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
):
    """
    DELETE /api/v1/conversations/{conversation_id}

    Delete a conversation and all its messages (cascade).
    Only the owner can delete their own conversation.

    Response 200:
        {"message": "Conversation 1 successfully deleted."}
    """
    db = SessionLocal()
    try:
        conversation = svc_get_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id,
        )
        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found.",
            )
        db.delete(conversation)
        db.commit()
        return {"message": f"Conversation {conversation_id} successfully deleted."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete conversation: {str(e)}",
        )
    finally:
        db.close()
