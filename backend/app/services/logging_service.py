from datetime import datetime
from typing import Any, Dict
from app.db.mongodb import get_database


async def log_booking_event(
    booking_id: int,
    user_id: int,
    flight_id: int,
    seat_id: str,
    event_type: str,
    status: str,
    metadata: Dict[str, Any] = None
):
    """Log booking events to MongoDB"""
    db = get_database()
    
    doc = {
        "booking_id": booking_id,
        "user_id": user_id,
        "flight_id": flight_id,
        "seat_id": seat_id,
        "event_type": event_type,  # created, confirmed, cancelled
        "status": status,
        "metadata": metadata or {},
        "timestamp": datetime.utcnow()
    }
    
    await db.booking_logs.insert_one(doc)


async def log_payment_event(
    payment_id: int,
    booking_id: int,
    amount: float,
    event_type: str,
    payment_status: str,
    reason: str = None,
    metadata: Dict[str, Any] = None
):
    """Log payment events to MongoDB"""
    db = get_database()
    
    doc = {
        "payment_id": payment_id,
        "booking_id": booking_id,
        "amount": amount,
        "event_type": event_type,  # initiated, authorized, captured, failed, refunded
        "payment_status": payment_status,
        "reason": reason,
        "metadata": metadata or {},
        "timestamp": datetime.utcnow()
    }
    
    await db.payment_logs.insert_one(doc)


async def log_user_activity(
    user_id: int,
    action_type: str,
    description: str,
    ip_address: str = None,
    metadata: Dict[str, Any] = None
):
    """Log user activities to MongoDB"""
    db = get_database()
    
    doc = {
        "user_id": user_id,
        "action_type": action_type,  # login, logout, search, book, cancel
        "description": description,
        "ip_address": ip_address,
        "metadata": metadata or {},
        "timestamp": datetime.utcnow()
    }
    
    await db.user_activity_logs.insert_one(doc)


async def log_system_event(
    level: str,
    module_name: str,
    message: str,
    stack_trace: str = None,
    metadata: Dict[str, Any] = None
):
    """Log system events to MongoDB"""
    db = get_database()
    
    doc = {
        "level": level,  # info, warning, error, critical
        "module_name": module_name,
        "message": message,
        "stack_trace": stack_trace,
        "metadata": metadata or {},
        "timestamp": datetime.utcnow()
    }
    
    await db.system_event_logs.insert_one(doc)