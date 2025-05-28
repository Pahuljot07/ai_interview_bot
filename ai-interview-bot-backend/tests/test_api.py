from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fetch_question():
    res = client.get("/api/question/Easy")
    assert res.status_code == 200
    assert "question" in res.json()

def test_evaluate_answer():
    data = {
        "question_id": "Q001",
        "user_answer": "Overfitting means model learns training data too much"
    }
    res = client.post("/api/evaluate", json=data)
    assert res.status_code == 200
    assert "score" in res.json()
