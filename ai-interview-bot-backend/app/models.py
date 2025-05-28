from pydantic import BaseModel
from typing import Optional

class Question(BaseModel):
    question_id: str
    question: str
    ideal_answer: str
    topic: str
    difficulty: str

class EvaluateRequest(BaseModel):
    question_id: str
    user_answer: str

class EvaluateResponse(BaseModel):
    score: float
    feedback: str

