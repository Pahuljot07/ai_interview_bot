import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Topic normalization mapping
TOPIC_MAP = {
    "AI/ML": "AI-ML",
}

async def normalize_topics():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["interview_bot"]
    collection = db["questions"]

    updates = 0

    for old_value, new_value in TOPIC_MAP.items():
        result = await collection.update_many(
            {"topic": {"$regex": f"^{old_value}$", "$options": "i"}},
            {"$set": {"topic": new_value}}
        )
        print(f"Updated {result.modified_count} documents from '{old_value}' to '{new_value}'")
        updates += result.modified_count

    print(f"✅ Done. Total updates: {updates}")

if __name__ == "__main__":
    asyncio.run(normalize_topics())
