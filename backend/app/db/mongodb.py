from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import MONGODB_DB_NAME, MONGODB_URL


class MongoDB:
    client: AsyncIOMotorClient = None


mongodb = MongoDB()


async def connect_to_mongo():
    try:
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        await client.admin.command("ping")
        mongodb.client = client
        print(f"Connected to MongoDB: {MONGODB_DB_NAME}")
    except Exception as exc:
        mongodb.client = None
        print(f"MongoDB unavailable, continuing without logging: {exc}")


async def close_mongo_connection():
    if mongodb.client is not None:
        mongodb.client.close()
        mongodb.client = None
        print("Closed MongoDB connection")


def get_database():
    if mongodb.client is None:
        return None
    return mongodb.client[MONGODB_DB_NAME]
