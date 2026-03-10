from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)

    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)  # ISO 4217 code

    payment_method = Column(String(50), nullable=False)  # "credit_card", "debit_card"
    card_last4 = Column(String(4), nullable=True)
    card_brand = Column(String(20), nullable=True)  # "Visa", "Mastercard", "Amex"

    transaction_id = Column(String(255), nullable=True)  # Payment gateway reference

    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    failure_reason = Column(Text, nullable=True)  # Only if status = FAILED

    payment_time = Column(DateTime, server_default=func.now())

    # Relationship
    booking = relationship("Booking")