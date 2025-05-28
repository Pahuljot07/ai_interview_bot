from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)

client = AsyncIOMotorClient("mongodb://localhost:27017")  # or from .env
db = client["interview_bot"]
question_collection = db["questions"]
