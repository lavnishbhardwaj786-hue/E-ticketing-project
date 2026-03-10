from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.api.deps import get_db
from app.api.deps_auth import get_admin_user
from app.models.flight import Flight
from app.models.route import Route
from app.models.airport import Airport
from app.models.airline import Airline
from app.models.aircraft import Aircraft
from app.models.booking import Booking
from app.schemas.flight import FlightCreate, FlightUpdate, FlightOut, FlightSearchResult

router = APIRouter(prefix="/flights", tags=["Flights"])


# ADMIN ENDPOINTS (CRUD)
@router.post("/", response_model=FlightOut)
def create_flight(
        data: FlightCreate,
        db: Session = Depends(get_db),
        user=Depends(get_admin_user),
):
    flight = Flight(**data.model_dump())
    db.add(flight)
    db.commit()
    db.refresh(flight)
    return flight


@router.put("/{flight_id}", response_model=FlightOut)
def update_flight(
        flight_id: int,
        data: FlightUpdate,
        db: Session = Depends(get_db),
        user=Depends(get_admin_user),
):
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(flight, key, value)

    db.commit()
    db.refresh(flight)
    return flight


@router.delete("/{flight_id}")
def delete_flight(
        flight_id: int,
        db: Session = Depends(get_db),
        user=Depends(get_admin_user),
):
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    db.delete(flight)
    db.commit()
    return {"message": "Flight deleted"}


# PUBLIC ENDPOINTS (Search)
@router.get("/search", response_model=list[FlightSearchResult])
def search_flights(
        origin_iata: str = Query(..., description="Origin airport IATA code (e.g., JFK)"),
        destination_iata: str = Query(..., description="Destination airport IATA code (e.g., LAX)"),
        date: str = Query(..., description="Departure date (YYYY-MM-DD)"),
        time_window: str | None = Query(None, description="morning/afternoon/evening/night"),
        max_price: float | None = Query(None, description="Maximum price filter"),
        db: Session = Depends(get_db),
):
    # Parse date
    try:
        search_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Get airports
    origin = db.query(Airport).filter(Airport.iata_code == origin_iata.upper()).first()
    destination = db.query(Airport).filter(Airport.iata_code == destination_iata.upper()).first()

    if not origin or not destination:
        raise HTTPException(status_code=404, detail="Airport not found")

    # Get routes matching origin/destination
    routes = db.query(Route).filter(
        Route.source_airport_id == origin.id,
        Route.destination_airport_id == destination.id
    ).all()

    if not routes:
        return []  # No routes available

    route_ids = [r.id for r in routes]

    # Build flight query
    query = db.query(Flight).filter(
        Flight.route_id.in_(route_ids),
        Flight.departure_time >= search_date,
        Flight.departure_time < search_date + timedelta(days=1),
    )

    # Apply time window filter
    if time_window:
        if time_window == "morning":
            start = search_date.replace(hour=6, minute=0)
            end = search_date.replace(hour=12, minute=0)
        elif time_window == "afternoon":
            start = search_date.replace(hour=12, minute=0)
            end = search_date.replace(hour=18, minute=0)
        elif time_window == "evening":
            start = search_date.replace(hour=18, minute=0)
            end = search_date.replace(hour=22, minute=0)
        elif time_window == "night":
            start = search_date.replace(hour=22, minute=0)
            end = search_date.replace(hour=23, minute=59)
        else:
            raise HTTPException(status_code=400, detail="Invalid time_window")

        query = query.filter(
            Flight.departure_time >= start,
            Flight.departure_time < end
        )

    # Apply price filter
    if max_price:
        query = query.filter(Flight.base_price_economy <= max_price)

    flights = query.all()

    # Build results with joined data
    results = []
    for flight in flights:
        # Count booked seats
        booked_count = db.query(Booking).filter(Booking.flight_id == flight.id).count()
        available_seats = flight.aircraft.total_capacity - booked_count

        results.append({
            "id": flight.id,
            "flight_number": flight.flight_number,
            "departure_time": flight.departure_time,
            "arrival_time": flight.arrival_time,
            "base_price_economy": float(flight.base_price_economy),
            "base_price_business": float(flight.base_price_business) if flight.base_price_business else None,
            "base_price_first": float(flight.base_price_first) if flight.base_price_first else None,
            "available_seats": available_seats,
            "airline_name": flight.airline.name,
            "airline_code": flight.airline.code,
            "aircraft_model": flight.aircraft.model,
            "origin_city": origin.city,
            "origin_iata": origin.iata_code,
            "destination_city": destination.city,
            "destination_iata": destination.iata_code,
        })

    return results


@router.get("/{flight_id}/seats")
def get_seat_map(
        flight_id: int,
        db: Session = Depends(get_db),
):
    """Get seat map with availability for a specific flight"""
    flight = db.query(Flight).filter(Flight.id == flight_id).first()

    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    # Get booked seats
    booked_seats = db.query(Booking.seat_number).filter(
        Booking.flight_id == flight_id
    ).all()
    booked_seat_numbers = [seat[0] for seat in booked_seats]

    # Get seat map from aircraft
    seat_map = flight.aircraft.seat_map

    # Mark unavailable seats
    if "rows" in seat_map:
        for row in seat_map["rows"]:
            if "seats" in row:
                for seat in row["seats"]:
                    seat["available"] = seat["number"] not in booked_seat_numbers

    return {
        "flight_id": flight_id,
        "flight_number": flight.flight_number,
        "aircraft_model": flight.aircraft.model,
        "total_capacity": flight.aircraft.total_capacity,
        "booked_seats": len(booked_seat_numbers),
        "seat_map": seat_map,
    }