from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.database import db
from passlib.context import CryptContext

router = APIRouter()
user_collection = db["users"]
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(user: UserCreate):
    existing_user = await user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
    }

    await user_collection.insert_one(new_user)
    return {"message": "Signup successful", "user": {"name": user.name, "email": user.email}}

@router.post("/login")
async def login(credentials: UserLogin):
    user = await user_collection.find_one({"email": credentials.email})
    if not user or not pwd_context.verify(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"message": "Login successful", "user": {"name": user["name"], "email": user["email"]}}
