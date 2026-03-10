from typing import Dict, Set
from fastapi import WebSocket


class ConnectionManager:
    """Manages WebSocket connections per flight"""
    
    def __init__(self):
        # flight_id -> set of WebSocket connections
        self.active_connections: Dict[int, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, flight_id: int):
        await websocket.accept()
        if flight_id not in self.active_connections:
            self.active_connections[flight_id] = set()
        self.active_connections[flight_id].add(websocket)
    
    def disconnect(self, websocket: WebSocket, flight_id: int):
        if flight_id in self.active_connections:
            self.active_connections[flight_id].discard(websocket)
            if not self.active_connections[flight_id]:
                del self.active_connections[flight_id]
    
    async def broadcast_to_flight(self, flight_id: int, message: dict):
        """Send message to all users viewing this flight"""
        if flight_id not in self.active_connections:
            return
        
        dead_connections = set()
        for connection in self.active_connections[flight_id]:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.add(connection)
        
        # Clean up dead connections
        for connection in dead_connections:
            self.disconnect(connection, flight_id)


# Global instance
manager = ConnectionManager()