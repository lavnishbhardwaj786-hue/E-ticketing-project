"""
Seed endpoint for database initialization.
This endpoint populates the database with airlines, airports, routes, and flights.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import random
from app.db.session import SessionLocal
from app.models.user import User
from app.models.airline import Airline
from app.models.airport import Airport
from app.models.aircraft import Aircraft
from app.models.route import Route
from app.models.flight import Flight
from app.core.security import hash_password

router = APIRouter(prefix="/seed", tags=["seed"])

# Import seed data from seed_data.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from seed_data import (
    AIRLINES_DATA, AIRPORTS_DATA, AIRCRAFT_DATA, 
    ROUTES_DATA, DEP_HOURS
)


@router.post("/initialize")
def seed_database():
    """
    Initialize database with airlines, airports, aircraft, routes, and flights.
    WARNING: This will clear existing data!
    """
    db = SessionLocal()
    
    try:
        print("🌱 Starting database seeding...")
        
        # Clear existing data
        print("  Clearing existing data...")
        db.query(Flight).delete()
        db.query(Route).delete()
        db.query(Aircraft).delete()
        db.query(Airport).delete()
        db.query(Airline).delete()
        db.query(User).delete()
        db.commit()
        
        # Create test users
        print("  Creating test users...")
        users = [
            User(
                username="admin",
                email="admin@eticket.com",
                hashed_password=hash_password("Admin@123"),
                is_admin=True,
            ),
            User(
                username="johndoe",
                email="john@example.com",
                hashed_password=hash_password("Test@1234"),
                is_admin=False,
            ),
            User(
                username="janesmith",
                email="jane@example.com",
                hashed_password=hash_password("Test@1234"),
                is_admin=False,
            ),
        ]
        for user in users:
            db.add(user)
        db.commit()
        print(f"  ✓ Created {len(users)} users")
        
        # Create airlines
        print("  Creating airlines...")
        airline_objs = {}
        for name, code, multiplier in AIRLINES_DATA:
            airline = Airline(name=name, code=code, price_multiplier=multiplier)
            db.add(airline)
            airline_objs[code] = airline
        db.commit()
        print(f"  ✓ Created {len(AIRLINES_DATA)} airlines")
        
        # Create airports
        print("  Creating airports...")
        airport_objs = {}
        for code, name, city, country, lat, lon in AIRPORTS_DATA:
            airport = Airport(
                code=code,
                name=name,
                city=city,
                country=country,
                latitude=lat,
                longitude=lon,
            )
            db.add(airport)
            airport_objs[code] = airport
        db.commit()
        print(f"  ✓ Created {len(AIRPORTS_DATA)} airports")
        
        # Create aircraft
        print("  Creating aircraft...")
        aircraft_objs = []
        for aircraft_type, capacity, economy_seats, business_seats, first_seats in AIRCRAFT_DATA:
            aircraft = Aircraft(
                aircraft_type=aircraft_type,
                capacity=capacity,
                economy_seats=economy_seats,
                business_seats=business_seats,
                first_class_seats=first_seats,
            )
            db.add(aircraft)
            aircraft_objs.append(aircraft)
        db.commit()
        print(f"  ✓ Created {len(AIRCRAFT_DATA)} aircraft types")
        
        # Create routes
        print("  Creating routes...")
        route_objs = []
        for origin, destination, flight_hours, base_price_eco in ROUTES_DATA:
            route = Route(
                origin_airport_code=origin,
                destination_airport_code=destination,
                flight_duration_hours=flight_hours,
                base_price_economy=base_price_eco,
            )
            db.add(route)
            route_objs.append(route)
        db.commit()
        print(f"  ✓ Created {len(ROUTES_DATA)} routes")
        
        # Create flights
        print("  Creating flights...")
        flight_count = 0
        base_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        for route in route_objs:
            aircraft = random.choice(aircraft_objs)
            flight_hours = route.flight_duration_hours
            base_price_eco = route.base_price_economy
            base_price_bus = int(base_price_eco * 1.5)
            base_price_fst = int(base_price_eco * 2.5)
            
            chosen_airlines = random.sample(list(airline_objs.keys()), k=min(3, len(airline_objs)))
            dep_hours = DEP_HOURS
            
            for day in range(14):
                date = base_date + timedelta(days=day)
                for ai, airline_code in enumerate(chosen_airlines):
                    hour = dep_hours[ai % len(dep_hours)]
                    dep_time = date.replace(hour=hour, minute=random.choice([0, 15, 30, 45]))
                    arr_time = dep_time + timedelta(hours=flight_hours, minutes=random.randint(0, 30))
                    
                    fn = f"{airline_code}{random.randint(100, 9999)}"
                    flight = Flight(
                        flight_number=fn,
                        route_id=route.id,
                        airline_id=airline_objs[airline_code].id,
                        aircraft_id=aircraft.id,
                        departure_time=dep_time,
                        arrival_time=arr_time,
                        base_price_economy=base_price_eco,
                        base_price_business=base_price_bus,
                        base_price_first=base_price_fst,
                    )
                    db.add(flight)
                    flight_count += 1
        
        db.commit()
        print(f"  ✓ Created {flight_count:,} flights across 14 days")
        print()
        print("✅ Database seeded successfully!")
        print(f"   Airlines : {len(AIRLINES_DATA)}")
        print(f"   Airports : {len(AIRPORTS_DATA)}")
        print(f"   Routes   : {len(route_objs)}")
        print(f"   Flights  : {flight_count:,}")
        print()
        
        return {
            "status": "success",
            "message": "Database seeded successfully",
            "data": {
                "airlines": len(AIRLINES_DATA),
                "airports": len(AIRPORTS_DATA),
                "routes": len(route_objs),
                "flights": flight_count,
                "test_credentials": {
                    "admin": {"username": "admin", "password": "Admin@123"},
                    "user1": {"username": "johndoe", "password": "Test@1234"},
                    "user2": {"username": "janesmith", "password": "Test@1234"},
                }
            }
        }
        
    except Exception as e:
        db.rollback()
        import traceback
        print(f"❌ Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
