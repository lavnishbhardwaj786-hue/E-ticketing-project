from pydantic import BaseModel, Field
from datetime import datetime


class PaymentCreate(BaseModel):
    booking_id: int
    amount: float = Field(..., gt=0, description="Payment amount (must be positive)")
    currency: str = Field(default="USD", pattern="^[A-Z]{3}$", description="ISO 4217 currency code")
    payment_method: str = Field(default="credit_card", description="Payment method type")
    card_number: str = Field(..., min_length=13, max_length=19, description="Card number (13-19 digits)")
    card_expiry: str = Field(..., description="Card expiry (MM/YY or MM/YYYY)")
    card_cvv: str = Field(..., min_length=3, max_length=4, description="CVV code (3-4 digits)")


class PaymentOut(BaseModel):
    id: int
    booking_id: int
    amount: float
    currency: str
    payment_method: str
    card_last4: str | None
    card_brand: str | None
    transaction_id: str | None
    status: str
    failure_reason: str | None
    payment_time: datetime

    class Config:
        from_attributes = True