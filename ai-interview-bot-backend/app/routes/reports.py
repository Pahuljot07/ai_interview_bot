from fastapi import APIRouter
from bson import ObjectId
from app.database import db
from app.evaluator import evaluate_answer
from fpdf import FPDF
import tempfile
from fastapi.responses import FileResponse


router = APIRouter()

question_collection = db["questions"]
user_answers_collection = db["user_answers"]
report_collection = db["reports"]

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
            "question": question["question"],
            "user_answer": ans["user_answer"],
            "score": eval_result["score"],
            "feedback": eval_result["feedback"]
        })

    report_data = {
        "session_id": session_id,
        "user_id": answers[0].get("user_id", "anonymous") if answers else "unknown",
        "results": results
    }
    await report_collection.insert_one(report_data)

    return {"message": "Evaluation complete", "results": results}

@router.get("/get-report/{session_id}")
async def get_report(session_id: str):
    report = await report_collection.find_one({"session_id": session_id})
    if not report:
        return {"message": "No report found"}
    report["_id"] = str(report["_id"])
    return report

@router.get("/download-report/{session_id}")
async def download_report(session_id: str):
    report = await report_collection.find_one({"session_id": session_id})
    if not report:
        return {"message": "No report found"}

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Interview Report - Session: {session_id}", ln=True, align="C")
    pdf.ln(10)

    for item in report.get("results", []):
        pdf.multi_cell(0, 10, f"Q: {item['question']}\nAnswer: {item['user_answer']}\nScore: {item['score']}\nFeedback: {item['feedback']}\n", border=1)
        pdf.ln(2)

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf.output(temp_file.name)
    return FileResponse(temp_file.name, filename=f"report_{session_id}.pdf")