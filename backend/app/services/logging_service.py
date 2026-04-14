from datetime import datetime
from typing import Any, Dict

from app.db.mongodb import get_database


async def _insert_log(collection_name: str, doc: Dict[str, Any]):
    db = get_database()
    if db is None:
        return

    try:
        await db[collection_name].insert_one(doc)
    except Exception as exc:
        print(f"Mongo logging skipped for {collection_name}: {exc}")


async def log_booking_event(
    booking_id: int,
    user_id: int,
    flight_id: int,
    seat_id: str,
    event_type: str,
    status: str,
    metadata: Dict[str, Any] = None
):
    """Log booking events to MongoDB when available."""
    doc = {
        "booking_id": booking_id,
        "user_id": user_id,
        "flight_id": flight_id,
        "seat_id": seat_id,
        "event_type": event_type,
        "status": status,
        "metadata": metadata or {},
        "timestamp": datetime.utcnow()
    }
    await _insert_log("booking_logs", doc)


async def log_payment_event(
    payment_id: int,
    booking_id: int,
    amount: float,
    event_type: str,
    payment_status: str,
    reason: str = None,
    metadata: Dict[str, Any] = None
):
    """Log payment events to MongoDB when available."""
    doc = {
        "payment_id": payment_id,
        "booking_id": booking_id,
        "amount": amount,
        "event_type": event_type,
        "payment_status": payment_status,
        "reason": reason,
        "metadata": metadata or {},
        "timestamp": datetime.utcnow()
    }
    await _insert_log("payment_logs", doc)


async def log_user_activity(
    user_id: int,
    action_type: str,
    description: str,
    ip_address: str = None,
    metadata: Dict[str, Any] = None
):
    """Log user activity to MongoDB when available."""
    doc = {
        "user_id": user_id,
        "action_type": action_type,
        "description": description,
        "ip_address": ip_address,
        "metadata": metadata or {},
        "timestamp": datetime.utcnow()
    }
    await _insert_log("user_activity_logs", doc)


async def log_system_event(
    level: str,
    module_name: str,
    message: str,
    stack_trace: str = None,
    metadata: Dict[str, Any] = None
):
    """Log system events to MongoDB when available."""
    doc = {
        "level": level,
        "module_name": module_name,
        "message": message,
        "stack_trace": stack_trace,
        "metadata": metadata or {},
        "timestamp": datetime.utcnow()
    }
    await _insert_log("system_event_logs", doc)
