from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGODB_URL, MONGODB_DB_NAME

class MongoDB:
    client: AsyncIOMotorClient = None
    
mongodb = MongoDB()

async def connect_to_mongo():
    mongodb.client = AsyncIOMotorClient(MONGODB_URL)
    print(f"✅ Connected to MongoDB: {MONGODB_DB_NAME}")

async def close_mongo_connection():
    mongodb.client.close()
    print("❌ Closed MongoDB connection")

def get_database():
    return mongodb.client[MONGODB_DB_NAME]