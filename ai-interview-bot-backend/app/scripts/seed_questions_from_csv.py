# scripts/seed_questions_from_csv.py
import asyncio
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient

CSV_PATH = "app/data/Final_MongoDB_Questions.csv"  # Adjust path as needed

async def insert_questions_from_csv():
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["interview_bot"]
    collection = db["questions"]

    # Load CSV
    df = pd.read_csv(CSV_PATH)
    df.columns = df.columns.str.strip().str.lower()  # Normalize headers

    # Convert to dictionary format
    questions = df.to_dict(orient="records")

    # Optional: Clear existing data
    await collection.delete_many({})
    
    # Insert into MongoDB
    await collection.insert_many(questions)
    print(f"{len(questions)} questions inserted.")

if __name__ == "__main__":
    asyncio.run(insert_questions_from_csv())
