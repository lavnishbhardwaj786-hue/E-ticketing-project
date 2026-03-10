from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(10), unique=True, nullable=False, index=True)
    ticket_number = Column(String(50), nullable=True)  # Generated after payment success

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)

    seat_number = Column(String(5), nullable=False)  # e.g., "12A"

    passenger_name = Column(String(100), nullable=False)
    passenger_email = Column(String(255), nullable=False)
    passenger_phone = Column(String(20), nullable=False)
    passenger_id_number = Column(String(50), nullable=True)
    passenger_id_type = Column(String(20), nullable=True)

    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False)

    booking_time = Column(DateTime, server_default=func.now())
    issued_time = Column(DateTime, nullable=True)  # When ticket was issued

    # Relationships
    user = relationship("User")
    flight = relationship("Flight")