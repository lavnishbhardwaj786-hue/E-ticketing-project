import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/flights/1"
    
    async with websockets.connect(uri) as websocket:
        print("✅ Connected to WebSocket")
        
        # Listen for messages
        while True:
            try:
                message = await websocket.recv()
                data = json.loads(message)
                print(f"📨 Received: {data}")
            except Exception as e:
                print(f"❌ Error: {e}")
                break

if __name__ == "__main__":
    asyncio.run(test_websocket())