from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation_recommendation,
    get_travel_season,
)
from services.bedrock_service import get_ai_recommendation
from database import SessionLocal, init_db
from models.trip import Trip
from fastapi.middleware.cors import CORSMiddleware


class TripRequest(BaseModel):
    destination:    str
    days:           int
    budget:         float
    month:          str
    travel_style:   str

class TripUpdate(BaseModel):
    budget: float

# FastAPI validates the JSON body against this model
# If a field is missing or wrong type, it returns 422 automatically


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

# a GET endpoint at the root path
@app.get("/")
def home():
  return {
    "message" : "Welcome to KelanaAI"
  }

# a GET health endpoint at the root path
@app.get("/health")
def home():
  return {
    "status" : "Ok"
  }

  # a GET trip categories list endpoint at the root path
@app.get("/trip-categories")
def trip_category():
    return ["Backpacker", "Standart", "Luxury"]

# a GET recommendations place list endpoint at the root path
@app.get("/api/v1/recommendations")
def recommendations():
    return ["Tokyo Tower", "Mount Fuji", "Shibuya"]

# a GET transportations list endpoint at the root path
@app.get("/api/v1/transportations")
def transportations():
    return ["Bus", "Train", "Flight"]

@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()

    # error handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip



# POST endpoint — receives JSON, returns JSON
@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    #reuse Session 2 bussines logic
    daily_budget = calculate_daily_budget(
        request.budget, request.days
    )
    category = get_trip_category(
        request.budget
    )
    travel_season = get_travel_season(
        request.month
    )
    ai_recommendation = get_ai_recommendation(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        month=request.month,
        travel_style=request.travel_style,
        travel_season=travel_season,
    )
    
    # create a Trip ORM object
    trip = Trip(
        destination         = request.destination,
        days                = request.days,
        month               = request.month,
        travel_season       = travel_season,
        budget              = request.budget,
        daily_budget        = daily_budget,
        travel_style        = request.travel_style,
        category            = category,        
        ai_recommendation   = ai_recommendation,
    )

    # save to PostgreSQL
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip) # get the auto generated id
    db.close()
    return trip

# POST endpoint — receives JSON, returns JSON
@app.post("/api/v1/trips/{id}/generate")
def generate_trip_recommendatian(id: int):

    db = SessionLocal()

    trip = db.query(Trip).filter(Trip.id == id).first()

    if trip is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail=f"Trip with id {id} not found"
    )

    try:

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
            "ai_recommendation": trip.ai_recommendation
        }
        
    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI recommendation: {str(e)}"
        )

    finally:
        db.close()


# PUT endpoint
@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, trip_data: TripUpdate):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    
    # error handling not found
    if trip is None:
        raise HTTPException(status_code=404,
        detail=f"Trip with id {trip_id} not found"
        )

    # update budget
    trip.budget = trip_data.budget

    # recalculate business logic
    trip.category = get_trip_category(trip_data.budget)

    trip.daily_budget = calculate_daily_budget(
        trip_data.budget,
        trip.days
    )

    # save changes to PostgeSQL 
    db.commit()
    db.refresh(trip)
    db.close()

    return trip


# Delete endpoint
@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    # error handling not found
    if trip is None:
        db.close()

        raise HTTPException(
            status_code=404, 
            detail=f"Trip with id {trip_id} not found"
        )

    db.delete(trip)
    db.commit()
    db.close()

    return {
        "message":f"Trip with id {trip_id} succesfully deleted"
    }

        
