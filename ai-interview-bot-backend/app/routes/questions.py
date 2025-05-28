from bson import ObjectId
from fastapi import APIRouter
from app.database import db
from app.evaluator import evaluate_answer

question_collection = db["questions"]
user_answers_collection = db["user_answers"]

router = APIRouter()

def serialize_mongo_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# ✅ NEW: Filter by topic and difficulty
@router.get("/questions/{topic}/{difficulty}/{count}")
async def get_questions(topic: str, difficulty: str, count: int):
    cursor = question_collection.find({
        "topic": {"$regex": f"^{topic}$", "$options": "i"},
        "difficulty": {"$regex": f"^{difficulty}$", "$options": "i"}
    }).limit(int(count))
    questions = []
    async for q in cursor:
        q["_id"] = str(q["_id"])
        questions.append(q)
    return questions


@router.post("/save-answer")
async def save_answer(data: dict):
    data["session_id"] = data.get("session_id", "default_session")
    await user_answers_collection.insert_one(data)
    return {"message": "Answer saved"}


@router.post("/evaluate-session/{session_id}")
async def evaluate_session(session_id: str):
    answers = await user_answers_collection.find({"session_id": session_id}).to_list(length=100)

    results = []
    for ans in answers:
        question = await question_collection.find_one({"_id": ObjectId(ans["questionId"])})
        if not question:
            continue
        eval_result = evaluate_answer(ans["user_answer"], question["ideal_answer"])
        results.append({
            "questionId": str(ans["questionId"]),
            "question": question["question"],
            "response": ans["user_answer"] if ans["user_answer"] else "Question skipped by user",
            "timeSpent": ans["time_spent"],
            "score": eval_result["score"] if ans["user_answer"] else 0,
            "feedback": eval_result["feedback"] if ans["user_answer"] else "Skipped question, no feedback"
        })

    return {"results": results}
