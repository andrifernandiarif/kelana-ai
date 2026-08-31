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
from services.auth_service import (
    register_user,
    authenticate_user,
    create_access_token,
    decode_access_token,
    get_user_by_id,
)

from database import SessionLocal, init_db
from models.trip import Trip
from models.user import User

from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()


# ===========================================================================
# Pydantic models
# ===========================================================================

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


# ===========================================================================
# App + middleware
# ===========================================================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ===========================================================================
# Auth dependency — extract & validate JWT from Authorization header
# ===========================================================================

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


# ===========================================================================
# Public endpoints
# ===========================================================================

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


# ===========================================================================
# Auth endpoints
# ===========================================================================

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


# ===========================================================================
# Trip endpoints (protected)
# ===========================================================================

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
