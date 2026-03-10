"""
Seed database with sample data for testing
Run: python seed_data.py
"""
from datetime import datetime, timedelta
from app.db.session import SessionLocal
from app.models.user import User
from app.models.airline import Airline
from app.models.airport import Airport
from app.models.aircraft import Aircraft
from app.models.route import Route
from app.models.flight import Flight
from app.core.security import hash_password


def seed_database():
    db = SessionLocal()

    try:
        # 1. Create admin user
        admin = User(
            name="Admin User",
            email="admin@eticket.com",
            username="admin",
            password_hash=hash_password("admin123"),
            is_admin=True
        )
        db.add(admin)

        # 2. Create regular user
        user = User(
            name="John Doe",
            email="john@example.com",
            username="johndoe",
            password_hash=hash_password("password123"),
            is_admin=False
        )
        db.add(user)

        # 3. Create airlines
        airlines = [
            Airline(name="American Airlines", code="AA", price_factor=1.2),
            Airline(name="Delta Air Lines", code="DL", price_factor=1.1),
            Airline(name="United Airlines", code="UA", price_factor=1.0),
            Airline(name="Southwest Airlines", code="WN", price_factor=0.9),
        ]
        for airline in airlines:
            db.add(airline)

        # 4. Create airports
        airports = [
            Airport(name="John F. Kennedy International", city="New York", country="USA", iata_code="JFK"),
            Airport(name="Los Angeles International", city="Los Angeles", country="USA", iata_code="LAX"),
            Airport(name="O'Hare International", city="Chicago", country="USA", iata_code="ORD"),
            Airport(name="Hartsfield-Jackson Atlanta", city="Atlanta", country="USA", iata_code="ATL"),
            Airport(name="San Francisco International", city="San Francisco", country="USA", iata_code="SFO"),
            Airport(name="Indira Gandhi International", city="New Delhi", country="India", iata_code="DEL"),
        ]
        for airport in airports:
            db.add(airport)

        db.flush()  # Get IDs

        # 5. Create aircraft with seat maps
        aircraft_737 = Aircraft(
            model="Boeing 737-800",
            total_capacity=180,
            seat_map={
                "layout": "3-3",
                "rows": [
                    {
                        "row_number": i,
                        "class": "economy" if i > 5 else "business",
                        "seats": [
                            {"number": f"{i}A", "type": "window", "premium": i in [12, 13, 14]},
                            {"number": f"{i}B", "type": "middle", "premium": False},
                            {"number": f"{i}C", "type": "aisle", "premium": i in [12, 13, 14]},
                            {"number": f"{i}D", "type": "aisle", "premium": i in [12, 13, 14]},
                            {"number": f"{i}E", "type": "middle", "premium": False},
                            {"number": f"{i}F", "type": "window", "premium": i in [12, 13, 14]},
                        ]
                    }
                    for i in range(1, 31)
                ]
            }
        )

        aircraft_320 = Aircraft(
            model="Airbus A320",
            total_capacity=150,
            seat_map={
                "layout": "3-3",
                "rows": [
                    {
                        "row_number": i,
                        "class": "economy" if i > 4 else "business",
                        "seats": [
                            {"number": f"{i}A", "type": "window", "premium": False},
                            {"number": f"{i}B", "type": "middle", "premium": False},
                            {"number": f"{i}C", "type": "aisle", "premium": False},
                            {"number": f"{i}D", "type": "aisle", "premium": False},
                            {"number": f"{i}E", "type": "middle", "premium": False},
                            {"number": f"{i}F", "type": "window", "premium": False},
                        ]
                    }
                    for i in range(1, 26)
                ]
            }
        )

        db.add(aircraft_737)
        db.add(aircraft_320)
        db.flush()

        # 6. Create routes
        routes = [
            Route(source_airport_id=airports[0].id, destination_airport_id=airports[1].id, distance_km=3944),  # JFK-LAX
            Route(source_airport_id=airports[1].id, destination_airport_id=airports[0].id, distance_km=3944),  # LAX-JFK
            Route(source_airport_id=airports[0].id, destination_airport_id=airports[2].id, distance_km=1185),  # JFK-ORD
            Route(source_airport_id=airports[2].id, destination_airport_id=airports[4].id, distance_km=2960),  # ORD-SFO
            Route(source_airport_id=airports[0].id, destination_airport_id=airports[5].id, distance_km=11762),
            # JFK-DEL
        ]
        for route in routes:
            db.add(route)

        db.flush()

        # 7. Create flights (next 7 days)
        base_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

        flights = []
        for day in range(7):
            date = base_date + timedelta(days=day)

            # JFK to LAX - multiple flights per day
            for hour, airline_idx in [(6, 0), (10, 1), (14, 2), (18, 3)]:
                flights.append(Flight(
                    flight_number=f"{airlines[airline_idx].code}{100 + day * 10 + hour}",
                    route_id=routes[0].id,
                    airline_id=airlines[airline_idx].id,
                    aircraft_id=aircraft_737.id,
                    departure_time=date.replace(hour=hour),
                    arrival_time=date.replace(hour=hour + 5),
                    base_price_economy=250.00,
                    base_price_business=650.00,
                    base_price_first=1200.00
                ))

            # LAX to JFK
            for hour, airline_idx in [(8, 1), (15, 2)]:
                flights.append(Flight(
                    flight_number=f"{airlines[airline_idx].code}{200 + day * 10 + hour}",
                    route_id=routes[1].id,
                    airline_id=airlines[airline_idx].id,
                    aircraft_id=aircraft_320.id,
                    departure_time=date.replace(hour=hour),
                    arrival_time=date.replace(hour=hour + 5),
                    base_price_economy=280.00,
                    base_price_business=700.00
                ))

            # JFK to ORD
            flights.append(Flight(
                flight_number=f"{airlines[0].code}{300 + day}",
                route_id=routes[2].id,
                airline_id=airlines[0].id,
                aircraft_id=aircraft_320.id,
                departure_time=date.replace(hour=9),
                arrival_time=date.replace(hour=11),
                base_price_economy=180.00,
                base_price_business=450.00
            ))

        for flight in flights:
            db.add(flight)

        db.commit()
        print("✅ Database seeded successfully!")
        print(
            f"Created: {len(airlines)} airlines, {len(airports)} airports, 2 aircraft, {len(routes)} routes, {len(flights)} flights")
        print("\nTest credentials:")
        print("Admin: username=admin, password=admin123")
        print("User: username=johndoe, password=password123")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()