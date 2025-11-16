"""
Deployment version without scheduler for initial deployment
"""
import os
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from prisma import Prisma
from auth import create_access_token, verify_token, verify_password, get_password_hash
from scraper import scraper
from email_service import send_otp_email, send_price_alert_email, generate_otp
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PricePulse API", version="2.0.0")
security = HTTPBearer()
db = Prisma()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProductTrack(BaseModel):
    url: str

class AlertCreate(BaseModel):
    product_id: str
    target_price: float
    email: EmailStr

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str
    password: str
    name: str = None

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_id = verify_token(token)
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.on_event("startup")
async def startup():
    await db.connect()
    print("Database connected successfully")

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        await db.user.count()
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

# Include all your existing endpoints here...
# (Copy from main.py but without scheduler)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)