from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.questions import router as questions_router
from app.routes.reports import router as reports_router
from app.routes.speech import router as speech_router

app = FastAPI()

app.include_router(questions_router)
app.include_router(reports_router)
app.include_router(speech_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
