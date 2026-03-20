from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        settings.mongodb_url,
        maxPoolSize=10,
        minPoolSize=2,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=10000,
    )
    db = client[settings.database_name]
    await client.admin.command("ping")
    print(f"Connected to MongoDB: {settings.database_name}")


async def close_db():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")


def get_db():
    return db
