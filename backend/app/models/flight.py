from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True)
    flight_number = Column(String(10), nullable=False)  # e.g., "AA123"

    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    airline_id = Column(Integer, ForeignKey("airlines.id"), nullable=False)
    aircraft_id = Column(Integer, ForeignKey("aircraft.id"), nullable=False)

    departure_time = Column(DateTime, nullable=False, index=True)
    arrival_time = Column(DateTime, nullable=False)

    base_price_economy = Column(Numeric(10, 2), nullable=False)
    base_price_business = Column(Numeric(10, 2), nullable=True)
    base_price_first = Column(Numeric(10, 2), nullable=True)

    # Relationships
    route = relationship("Route")
    airline = relationship("Airline")
    aircraft = relationship("Aircraft")