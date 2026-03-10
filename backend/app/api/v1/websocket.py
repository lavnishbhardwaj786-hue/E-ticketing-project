from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.utils.websocket_manager import manager

router = APIRouter()


@router.websocket("/ws/flights/{flight_id}")
async def websocket_flight_updates(websocket: WebSocket, flight_id: int):
    """
    WebSocket endpoint for real-time flight updates
    
    Clients subscribe to a specific flight and receive:
    - seat_booked: When a seat is booked
    - seat_released: When a booking is cancelled
    """
    await manager.connect(websocket, flight_id)
    
    try:
        # Keep connection alive
        while True:
            # Wait for client messages (ping/pong for keepalive)
            data = await websocket.receive_text()
            
            # Echo back for heartbeat
            if data == "ping":
                await websocket.send_text("pong")
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, flight_id)