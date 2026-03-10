from pydantic import BaseModel, EmailStr
from datetime import datetime


class BookingCreate(BaseModel):
    flight_id: int
    seat_number: str
    passenger_name: str
    passenger_email: EmailStr
    passenger_phone: str
    passenger_id_number: str | None = None
    passenger_id_type: str | None = None
    total_amount: float


class BookingOut(BaseModel):
    id: int
    booking_reference: str
    ticket_number: str | None
    flight_id: int
    seat_number: str
    passenger_name: str
    passenger_email: str
    total_amount: float
    status: str
    booking_time: datetime
    issued_time: datetime | None

    class Config:
        from_attributes = True


# NEW: For combined booking + payment flow
class BookingWithPaymentCreate(BaseModel):
    """Create booking and process payment in one request"""
    # Booking details
    flight_id: int
    seat_number: str
    passenger_name: str
    passenger_email: EmailStr
    passenger_phone: str
    passenger_id_number: str | None = None
    passenger_id_type: str | None = None
    total_amount: float

    # Payment details
    currency: str = "USD"
    payment_method: str = "credit_card"
    card_number: str
    card_expiry: str
    card_cvv: str


class BookingWithPaymentOut(BaseModel):
    """Response with booking and payment details"""
    booking: BookingOut
    payment_status: str
    payment_id: int | None
    transaction_id: str | None