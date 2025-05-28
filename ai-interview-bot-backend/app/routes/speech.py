import os
import whisper
from fastapi import APIRouter, UploadFile, File

router = APIRouter()
model = whisper.load_model("base")  # you can use 'tiny' for speed

@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    filename = f"temp_{audio.filename}"
    with open(filename, "wb") as f:
        f.write(await audio.read())

    result = model.transcribe(filename)
    os.remove(filename)

    return {"transcript": result["text"]}