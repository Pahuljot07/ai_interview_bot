from sentence_transformers import SentenceTransformer, util

# Use a more robust model for semantic similarity
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

def evaluate_answer(user_answer: str, ideal_answer: str) -> dict:
    # Clean inputs
    user_answer_clean = user_answer.strip().lower()
    ideal_answer_clean = ideal_answer.strip().lower()

    # Exact match or near match fallback (for short answers)
    if user_answer_clean == ideal_answer_clean:
        return {"score": 100.0, "feedback": "Perfect match!"}
    
    # Compute embeddings
    emb_user = model.encode(user_answer, convert_to_tensor=True)
    emb_ideal = model.encode(ideal_answer, convert_to_tensor=True)

    # Cosine similarity and scale to percentage
    similarity = util.pytorch_cos_sim(emb_user, emb_ideal).item()
    score = round(similarity * 100, 2)
    score = min(score, 100)

    # Feedback rules
    if score >= 85:
        feedback = "Great!"
    elif score >= 65:
        feedback = "Good effort!"
    elif score >= 40:
        feedback = "Fair, but can be improved."
    else:
        feedback = "Needs improvement."

    return {"score": score, "feedback": feedback}
