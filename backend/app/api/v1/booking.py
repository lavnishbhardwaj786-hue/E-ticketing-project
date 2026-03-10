from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random
import string
from datetime import datetime

from app.api.deps import get_db
from app.api.deps_auth import get_current_user
from app.models.booking import Booking, BookingStatus
from app.models.flight import Flight
from app.schemas.booking import BookingCreate, BookingOut

from app.schemas.booking import BookingWithPaymentCreate, BookingWithPaymentOut
from app.schemas.payment import PaymentCreate
from app.utils.payment_validator import (
    validate_card_number,
    validate_expiry,
    validate_cvv,
    parse_expiry,
    CardValidationError
)
from app.utils.payment_gateway import get_payment_gateway
from app.models.payment import Payment, PaymentStatus
from app.utils.websocket_manager import manager
from app.services.logging_service import log_booking_event
from app.services.email_service import send_booking_confirmation

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def generate_booking_reference():
    """Generate random 6-character alphanumeric reference"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


@router.post("/", response_model=BookingOut)
async def create_booking(  # ← CHANGED to async
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    # Check if flight exists
    flight = db.query(Flight).filter(Flight.id == data.flight_id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    # Check if seat is already booked (CRITICAL: prevents race condition)
    existing_booking = db.query(Booking).filter(
        Booking.flight_id == data.flight_id,
        Booking.seat_number == data.seat_number,
    ).first()
    
    if existing_booking:
        raise HTTPException(status_code=409, detail=f"Seat {data.seat_number} already booked")
    
    # Check if seat number is valid (exists in aircraft seat map)
    seat_map = flight.aircraft.seat_map
    valid_seat_numbers = []
    if "rows" in seat_map:
        for row in seat_map["rows"]:
            if "seats" in row:
                for seat in row["seats"]:
                    valid_seat_numbers.append(seat["number"])
    
    if data.seat_number not in valid_seat_numbers:
        raise HTTPException(status_code=400, detail=f"Invalid seat number: {data.seat_number}")
    
    # Generate unique booking reference
    booking_ref = generate_booking_reference()
    while db.query(Booking).filter(Booking.booking_reference == booking_ref).first():
        booking_ref = generate_booking_reference()
    
    # Create booking
    booking = Booking(
        booking_reference=booking_ref,
        user_id=current_user.id,
        flight_id=data.flight_id,
        seat_number=data.seat_number,
        passenger_name=data.passenger_name,
        passenger_email=data.passenger_email,
        passenger_phone=data.passenger_phone,
        passenger_id_number=data.passenger_id_number,
        passenger_id_type=data.passenger_id_type,
        total_amount=data.total_amount,
        status=BookingStatus.CONFIRMED,  # Will change to PENDING once payment is added
        issued_time=datetime.utcnow(),
    )
    
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # Broadcast seat unavailable ← NEW
    await manager.broadcast_to_flight(
        flight_id=data.flight_id,
        message={
            "type": "seat_booked",
            "seat_number": data.seat_number,
            "flight_id": data.flight_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    
    return booking


@router.get("/", response_model=list[BookingOut])
def list_my_bookings(
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user),
):
    """Get all bookings for current user"""
    return db.query(Booking).filter(Booking.user_id == current_user.id).all()


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(
        booking_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user),
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id,  # Only owner can view
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return booking


@router.post("/with-payment", response_model=BookingWithPaymentOut)
async def create_booking_with_payment(  # ← CHANGED to async
    data: BookingWithPaymentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Create booking and process payment in a single transaction
    
    This is the recommended endpoint for frontend to use.
    Ensures atomicity: if payment fails, booking is not created.
    """
    
    # 1. Validate flight and seat (same as create_booking)
    flight = db.query(Flight).filter(Flight.id == data.flight_id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    existing_booking = db.query(Booking).filter(
        Booking.flight_id == data.flight_id,
        Booking.seat_number == data.seat_number,
    ).first()
    
    if existing_booking:
        raise HTTPException(status_code=409, detail=f"Seat {data.seat_number} already booked")
    
    seat_map = flight.aircraft.seat_map
    valid_seat_numbers = []
    if "rows" in seat_map:
        for row in seat_map["rows"]:
            if "seats" in row:
                for seat in row["seats"]:
                    valid_seat_numbers.append(seat["number"])
    
    if data.seat_number not in valid_seat_numbers:
        raise HTTPException(status_code=400, detail=f"Invalid seat number: {data.seat_number}")
    
    # 2. Validate card details
    try:
        is_valid, card_brand, last_4 = validate_card_number(data.card_number)
        expiry_month, expiry_year = parse_expiry(data.card_expiry)
        validate_expiry(expiry_month, expiry_year)
        validate_cvv(data.card_cvv, card_brand)
    except CardValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # 3. Process payment BEFORE creating booking
    gateway = get_payment_gateway()
    
    booking_ref = generate_booking_reference()
    while db.query(Booking).filter(Booking.booking_reference == booking_ref).first():
        booking_ref = generate_booking_reference()
    
    payment_result = gateway.charge(
        amount=float(data.total_amount),
        currency=data.currency,
        card_number=data.card_number,
        card_expiry=data.card_expiry,
        card_cvv=data.card_cvv,
        cardholder_name=data.passenger_name,
        description=f"Flight booking {booking_ref}",
        metadata={
            "user_id": current_user.id,
            "flight_id": data.flight_id,
            "seat": data.seat_number
        }
    )
    
    # 4. If payment failed, don't create booking
    if not payment_result.success:
        raise HTTPException(
            status_code=402,
            detail=f"Payment failed: {payment_result.error_message}"
        )
    
    # 5. Payment succeeded, create booking
    booking = Booking(
        booking_reference=booking_ref,
        user_id=current_user.id,
        flight_id=data.flight_id,
        seat_number=data.seat_number,
        passenger_name=data.passenger_name,
        passenger_email=data.passenger_email,
        passenger_phone=data.passenger_phone,
        passenger_id_number=data.passenger_id_number,
        passenger_id_type=data.passenger_id_type,
        total_amount=data.total_amount,
        status=BookingStatus.CONFIRMED,
        issued_time=datetime.utcnow(),
        ticket_number=f"{flight.airline.code}-{booking_ref}"
    )
    
    db.add(booking)
    db.flush()  # Get booking.id without committing
    
    # 6. Create payment record
    payment = Payment(
        booking_id=booking.id,
        amount=data.total_amount,
        currency=data.currency,
        payment_method=data.payment_method,
        card_last4=last_4,
        card_brand=card_brand,
        transaction_id=payment_result.transaction_id,
        status=PaymentStatus.SUCCESS
    )
    
    db.add(payment)
    db.commit()
    db.refresh(booking)
    db.refresh(payment)

    # Log booking creation
    await log_booking_event(
        booking_id=booking.id,
        user_id=current_user.id,
        flight_id=data.flight_id,
        seat_id=data.seat_number,
        event_type="created",
        status="confirmed",
        metadata={
            "booking_reference": booking.booking_reference,
            "total_amount": float(data.total_amount)
        }
    )

    await log_booking_event(...)

    # Send confirmation email
    flight = booking.flight
    route_str = f"{flight.route.source_airport.city} → {flight.route.destination_airport.city}"
    await send_booking_confirmation(
        to_email=data.passenger_email,
        booking_reference=booking.booking_reference,
        ticket_number=booking.ticket_number,
        passenger_name=data.passenger_name,
        flight_number=flight.flight_number,
        route=route_str,
        departure_time=flight.departure_time.strftime("%B %d, %Y at %H:%M"),
        seat_number=data.seat_number,
        total_amount=float(data.total_amount),
        currency=data.currency
    )

    await manager.broadcast_to_flight(...)

    # Broadcast WebSocket
    await manager.broadcast_to_flight(...)
    
    return {
        "booking": booking,
        "payment_status": payment.status,
        "payment_id": payment.id,
        "transaction_id": payment.transaction_id
    }