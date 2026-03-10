from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.api.deps import get_db
from app.api.deps_auth import get_current_user
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.schemas.payment import PaymentCreate, PaymentOut
from app.utils.payment_validator import (
    validate_card_number,
    validate_expiry,
    validate_cvv,
    parse_expiry,
    CardValidationError
)
from app.utils.payment_gateway import get_payment_gateway
from app.utils.websocket_manager import manager
from app.services.logging_service import log_payment_event
from app.services.email_service import send_cancellation_email

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/", response_model=PaymentOut)
async def process_payment(
        data: PaymentCreate,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user),
):
    """
    Process payment for a booking

    Flow:
    1. Validate booking exists and belongs to user
    2. Validate card details
    3. Process payment via gateway
    4. Update booking status
    5. Create payment record
    """

    # 1. Validate booking
    booking = db.query(Booking).filter(
        Booking.id == data.booking_id,
        Booking.user_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Check if already paid
    existing_payment = db.query(Payment).filter(
        Payment.booking_id == data.booking_id,
        Payment.status == PaymentStatus.SUCCESS
    ).first()

    if existing_payment:
        raise HTTPException(status_code=400, detail="Booking already paid")

    # Verify amount matches booking
    if abs(float(data.amount) - float(booking.total_amount)) > 0.01:
        raise HTTPException(
            status_code=400,
            detail=f"Payment amount ({data.amount}) does not match booking total ({booking.total_amount})"
        )

    # 2. Validate card details
    try:
        # Validate card number
        is_valid, card_brand, last_4 = validate_card_number(data.card_number)

        # Parse and validate expiry
        expiry_month, expiry_year = parse_expiry(data.card_expiry)
        validate_expiry(expiry_month, expiry_year)

        # Validate CVV
        validate_cvv(data.card_cvv, card_brand)

    except CardValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 3. Process payment via gateway
    gateway = get_payment_gateway()

    payment_result = gateway.charge(
        amount=float(data.amount),
        currency=data.currency,
        card_number=data.card_number,
        card_expiry=data.card_expiry,
        card_cvv=data.card_cvv,
        cardholder_name=booking.passenger_name,
        description=f"Flight booking {booking.booking_reference}",
        metadata={
            "booking_id": booking.id,
            "booking_reference": booking.booking_reference,
            "user_id": current_user.id,
            "flight_id": booking.flight_id
        }
    )

    # 4. Create payment record
    payment = Payment(
        booking_id=booking.id,
        amount=data.amount,
        currency=data.currency,
        payment_method=data.payment_method,
        card_last4=last_4,
        card_brand=card_brand,
        transaction_id=payment_result.transaction_id,
        status=PaymentStatus.SUCCESS if payment_result.success else PaymentStatus.FAILED,
        failure_reason=payment_result.error_message if not payment_result.success else None
    )

    db.add(payment)

    # Log payment event
    await log_payment_event(
        payment_id=payment.id,
        booking_id=booking.id,
        amount=float(data.amount),
        event_type="captured" if payment_result.success else "failed",
        payment_status=payment.status.value,
        reason=payment_result.error_message if not payment_result.success else None,
        metadata={
            "card_brand": card_brand,
            "card_last4": last_4,
            "transaction_id": payment_result.transaction_id
        }
    )

    db.commit()
    db.refresh(payment)

    # If payment failed, raise exception with details
    if not payment_result.success:
        raise HTTPException(
            status_code=402,  # Payment Required
            detail=payment_result.error_message
        )

    return payment


@router.get("/{booking_id}", response_model=list[PaymentOut])
def get_booking_payments(
        booking_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user),
):
    """Get all payment attempts for a booking"""

    # Verify booking belongs to user
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    payments = db.query(Payment).filter(Payment.booking_id == booking_id).all()
    return payments


@router.post("/{payment_id}/refund", response_model=PaymentOut)
async def refund_payment(  # ← CHANGED to async
    payment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Refund a payment (admin or user who made booking)
    
    TODO: Add admin-only check if needed
    """
    
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Verify user owns the booking
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if booking.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if already refunded
    if payment.status == PaymentStatus.REFUNDED:
        raise HTTPException(status_code=400, detail="Payment already refunded")
    
    # Check if payment was successful
    if payment.status != PaymentStatus.SUCCESS:
        raise HTTPException(status_code=400, detail="Can only refund successful payments")
    
    # Process refund via gateway
    gateway = get_payment_gateway()
    refund_result = gateway.refund(
        transaction_id=payment.transaction_id,
        amount=float(payment.amount)
    )
    
    if not refund_result.success:
        raise HTTPException(status_code=500, detail=f"Refund failed: {refund_result.error_message}")
    
    # Update payment status
    payment.status = PaymentStatus.REFUNDED
    payment.transaction_id = refund_result.transaction_id  # Store refund transaction ID
    
    # Update booking status
    booking.status = BookingStatus.CANCELLED
    
    # Store seat_number and flight_id before commit
    seat_number = booking.seat_number
    flight_id = booking.flight_id
    
    db.commit()
    db.refresh(payment)

    # Log refund
    await log_payment_event(
        payment_id=payment.id,
        booking_id=booking.id,
        amount=float(payment.amount),
        event_type="refunded",
        payment_status="refunded",
        metadata={"refund_transaction_id": refund_result.transaction_id}
    )
    await log_payment_event(...)

    # Send cancellation email
    await send_cancellation_email(
        to_email=booking.passenger_email,
        booking_reference=booking.booking_reference,
        passenger_name=booking.passenger_name,
        refund_amount=float(payment.amount),
        currency=payment.currency
    )

    await manager.broadcast_to_flight(...)
    
    return payment