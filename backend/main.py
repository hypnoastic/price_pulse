import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

import asyncio
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from prisma import Prisma
from apscheduler.schedulers.background import BackgroundScheduler

from auth import create_access_token, verify_token, verify_password, get_password_hash
from scraper import scraper
from email_service import send_otp_email, send_price_alert_email, generate_otp
from google_auth import GoogleAuth

# Initialize FastAPI app
app = FastAPI(
    title="PricePulse API",
    version="2.0.0",
    description="Smart Amazon Price Tracker with Google OAuth"
)
security = HTTPBearer()
db = Prisma()
scheduler = None

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
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

class GoogleAuthCode(BaseModel):
    code: str

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_id = verify_token(token)
    
    # Ensure database connection
    if not db.is_connected():
        await db.connect()
        
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.on_event("startup")
async def startup():
    try:
        # Try to fetch binaries if connection fails
        try:
            await db.connect()
            print("Database connected successfully")
        except Exception as db_error:
            print(f"Database connection failed: {db_error}")
            print("Attempting to fetch Prisma binaries...")
            
            import subprocess
            try:
                subprocess.run(["python", "-m", "prisma", "py", "fetch"], check=True)
                print("Prisma binaries fetched successfully")
                await db.connect()
                print("Database connected after fetching binaries")
            except Exception as fetch_error:
                print(f"Failed to fetch binaries: {fetch_error}")
                raise db_error
        
        # Start scheduler (optional for deployment)
        global scheduler
        try:
            scheduler = BackgroundScheduler()
            scheduler.add_job(scheduled_price_check, 'interval', hours=1)  # Every hour
            scheduler.start()
            print("Price tracking scheduler started - checking every hour")
        except Exception as e:
            print(f"Warning: Could not start scheduler: {e}")
            
    except Exception as e:
        print(f"Startup error: {e}")
        # Don't raise to allow app to start without scheduler
        pass

@app.on_event("shutdown")
async def shutdown():
    global scheduler
    if scheduler:
        scheduler.shutdown()
    await db.disconnect()

@app.post("/api/auth/send-otp")
async def send_otp(otp_request: OTPRequest):
    # Check if user already exists
    existing_user = await db.user.find_unique(where={"email": otp_request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate OTP
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Delete any existing OTP for this email
    await db.otpverification.delete_many(where={"email": otp_request.email})
    
    # Save OTP
    await db.otpverification.create(
        data={
            "email": otp_request.email,
            "otp": otp,
            "expiresAt": expires_at
        }
    )
    
    # Send OTP email
    if send_otp_email(otp_request.email, otp):
        return {"message": "OTP sent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send OTP")

@app.post("/api/auth/verify-otp")
async def verify_otp(otp_verify: OTPVerify):
    # Find OTP record
    otp_record = await db.otpverification.find_first(
        where={
            "email": otp_verify.email,
            "otp": otp_verify.otp,
            "verified": False,
            "expiresAt": {"gt": datetime.utcnow()}
        }
    )
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Check if user already exists
    existing_user = await db.user.find_unique(where={"email": otp_verify.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user account
    hashed_password = get_password_hash(otp_verify.password)
    new_user = await db.user.create(
        data={
            "email": otp_verify.email,
            "password": hashed_password,
            "name": otp_verify.name,
            "verified": True
        }
    )
    
    # Clean up OTP records
    await db.otpverification.delete_many(where={"email": otp_verify.email})
    
    # Create token
    access_token = create_access_token(data={"sub": new_user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": new_user.id, "email": new_user.email, "name": new_user.name, "verified": new_user.verified}
    }

@app.post("/api/auth/register")
async def register(user: UserCreate):
    # Check if user exists
    existing_user = await db.user.find_unique(where={"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if OTP is verified
    verified_otp = await db.otpverification.find_first(
        where={
            "email": user.email,
            "verified": True,
            "expiresAt": {"gt": datetime.utcnow()}
        }
    )
    
    if not verified_otp:
        raise HTTPException(status_code=400, detail="Email not verified. Please verify your email first.")
    
    # Create user
    hashed_password = get_password_hash(user.password)
    new_user = await db.user.create(
        data={
            "email": user.email,
            "password": hashed_password,
            "name": user.name,
            "verified": True
        }
    )
    
    # Clean up OTP records
    await db.otpverification.delete_many(where={"email": user.email})
    
    # Create token
    access_token = create_access_token(data={"sub": new_user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": new_user.id, "email": new_user.email, "name": new_user.name, "verified": new_user.verified}
    }

@app.post("/api/auth/login")
async def login(user: UserLogin):
    # Find user
    db_user = await db.user.find_unique(where={"email": user.email})
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    access_token = create_access_token(data={"sub": db_user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": db_user.id, "email": db_user.email, "name": db_user.name}
    }

@app.get("/api/auth/google/url")
async def get_google_auth_url():
    """Get Google OAuth URL"""
    auth_url = GoogleAuth.get_auth_url()
    return {"auth_url": auth_url}

@app.post("/api/auth/google/callback")
async def google_auth_callback(auth_data: GoogleAuthCode):
    """Handle Google OAuth callback"""
    print(f"DEBUG: Received callback with code: {auth_data.code[:20]}...")
    try:
        # Ensure database connection
        if not db.is_connected():
            await db.connect()
            
        # Exchange code for tokens
        print("DEBUG: About to exchange code for tokens")
        tokens = await GoogleAuth.exchange_code_for_tokens(auth_data.code)
        print(f"DEBUG: Token exchange successful, got tokens: {list(tokens.keys())}")
        
        # Decode ID token to get user info
        user_info = GoogleAuth.decode_id_token(tokens["id_token"])
        print(f"DEBUG: Decoded user info: {user_info.get('email')}")
        
        google_id = user_info["sub"]
        email = user_info["email"]
        name = user_info.get("name")
        picture = user_info.get("picture")
        
        # Check if user exists by Google ID or email
        existing_user = await db.user.find_first(
            where={
                "OR": [
                    {"googleId": google_id},
                    {"email": email}
                ]
            }
        )
        
        if existing_user:
            print(f"DEBUG: Updating existing user: {email}")
            # Update existing user with Google info
            user = await db.user.update(
                where={"id": existing_user.id},
                data={
                    "googleId": google_id,
                    "name": name or existing_user.name,
                    "picture": picture,
                    "refreshToken": tokens.get("refresh_token"),
                    "verified": True
                }
            )
        else:
            print(f"DEBUG: Creating new user: {email}")
            # Create new user
            user = await db.user.create(
                data={
                    "email": email,
                    "googleId": google_id,
                    "name": name,
                    "picture": picture,
                    "refreshToken": tokens.get("refresh_token"),
                    "verified": True
                }
            )
        
        # Create our own JWT token
        access_token = create_access_token(data={"sub": user.id})
        print(f"DEBUG: Successfully created JWT token for user: {user.id}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "picture": user.picture,
                "verified": user.verified
            }
        }
        
    except Exception as e:
        print(f"DEBUG: Google auth callback error: {str(e)}")
        import traceback
        print(f"DEBUG: Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")

@app.post("/api/auth/refresh-google-token")
async def refresh_google_token(current_user = Depends(get_current_user)):
    """Refresh Google access token"""
    if not current_user.refreshToken:
        raise HTTPException(status_code=400, detail="No refresh token available")
    
    try:
        tokens = await GoogleAuth.refresh_access_token(current_user.refreshToken)
        return {"access_token": tokens["access_token"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token refresh failed: {str(e)}")

@app.post("/api/auth/logout")
async def logout(current_user = Depends(get_current_user)):
    """Logout user and revoke Google tokens"""
    try:
        # Revoke Google refresh token if exists
        if current_user.refreshToken:
            await GoogleAuth.revoke_token(current_user.refreshToken)
            
            # Clear refresh token from database
            await db.user.update(
                where={"id": current_user.id},
                data={"refreshToken": None}
            )
        
        return {"message": "Logged out successfully"}
    except Exception as e:
        # Still return success even if revocation fails
        return {"message": "Logged out successfully"}

@app.post("/api/products/track")
async def track_product(product: ProductTrack, current_user = Depends(get_current_user)):
    # Scrape product data
    scraped_data = await scraper.scrape_amazon(product.url)
    
    if not scraped_data or not scraped_data.get('name') or not scraped_data.get('price'):
        raise HTTPException(status_code=400, detail="Could not scrape product data")
    
    # Create product
    new_product = await db.product.create(
        data={
            "url": product.url,
            "name": scraped_data['name'],
            "image": scraped_data.get('image'),
            "currentPrice": scraped_data['price'],
            "userId": current_user.id
        }
    )
    
    # Add initial price history
    await db.pricehistory.create(
        data={
            "price": scraped_data['price'],
            "productId": new_product.id
        }
    )
    
    return {"product_id": new_product.id, "name": new_product.name}

@app.get("/api/products")
async def get_products(current_user = Depends(get_current_user)):
    products = await db.product.find_many(
        where={"userId": current_user.id},
        include={"priceHistory": {"order_by": {"timestamp": "desc"}, "take": 1}}
    )
    return {"products": products}

@app.get("/api/products/{product_id}")
async def get_product(product_id: str, current_user = Depends(get_current_user)):
    product = await db.product.find_unique(
        where={"id": product_id, "userId": current_user.id},
        include={"priceHistory": {"order_by": {"timestamp": "asc"}}}
    )
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

@app.get("/api/alerts")
async def get_alerts(current_user = Depends(get_current_user)):
    alerts = await db.alert.find_many(
        where={"userId": current_user.id},
        include={"product": True}
    )
    return {"alerts": alerts}

@app.post("/api/alerts")
async def create_alert(alert: AlertCreate, current_user = Depends(get_current_user)):
    # Verify product belongs to user
    product = await db.product.find_unique(
        where={"id": alert.product_id, "userId": current_user.id}
    )
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Create alert
    new_alert = await db.alert.create(
        data={
            "targetPrice": alert.target_price,
            "email": alert.email,
            "userId": current_user.id,
            "productId": alert.product_id
        }
    )
    
    # Check if current price meets target
    if product.currentPrice <= alert.target_price:
        await send_price_alert(alert.email, product.name, product.currentPrice, product.url)
        await db.alert.delete(where={"id": new_alert.id})
        return {"message": "Alert triggered immediately!"}
    
    return {"message": "Alert created successfully"}

@app.delete("/api/alerts/{alert_id}")
async def delete_alert(alert_id: str, current_user = Depends(get_current_user)):
    alert = await db.alert.find_unique(
        where={"id": alert_id, "userId": current_user.id}
    )
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    await db.alert.delete(where={"id": alert_id})
    return {"message": "Alert deleted successfully"}

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str, current_user = Depends(get_current_user)):
    product = await db.product.find_unique(
        where={"id": product_id, "userId": current_user.id}
    )
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.product.delete(where={"id": product_id})
    return {"message": "Product deleted successfully"}

@app.patch("/api/products/{product_id}/tracking")
async def toggle_tracking(product_id: str, tracking_data: dict, current_user = Depends(get_current_user)):
    product = await db.product.find_unique(
        where={"id": product_id, "userId": current_user.id}
    )
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Tracking status updated"}

async def send_price_alert(email: str, product_name: str, price: float, url: str):
    """Send price alert email using Gmail API"""
    try:
        success = send_price_alert_email(email, product_name, price, url)
        if success:
            print(f"Alert email sent to {email}")
        else:
            print(f"Failed to send email to {email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

def scheduled_price_check():
    """Check prices for all products and send alerts - runs in background thread"""
    import asyncio
    
    async def async_price_check():
        # Create new database connection for scheduler
        scheduler_db = Prisma()
        try:
            await scheduler_db.connect()
            
            products = await scheduler_db.product.find_many(include={"alerts": True})
            print(f"Checking prices for {len(products)} products...")
            
            for product in products:
                try:
                    # Scrape current price
                    scraped_data = await scraper.scrape_amazon(product.url)
                    
                    if scraped_data and scraped_data.get('price'):
                        new_price = scraped_data['price']
                        
                        # Update product price
                        await scheduler_db.product.update(
                            where={"id": product.id},
                            data={"currentPrice": new_price}
                        )
                        
                        # Add to price history
                        await scheduler_db.pricehistory.create(
                            data={
                                "price": new_price,
                                "productId": product.id
                            }
                        )
                        
                        # Check alerts
                        for alert in product.alerts:
                            if new_price <= alert.targetPrice:
                                await send_price_alert(alert.email, product.name, new_price, product.url)
                                await scheduler_db.alert.delete(where={"id": alert.id})
                        
                        print(f"Updated price for {product.name}: ${new_price}")
                    else:
                        print(f"Failed to scrape price for {product.name}")
                        
                except Exception as e:
                    print(f"Error processing product {product.name}: {e}")
                    
        except Exception as e:
            print(f"Scheduled price check error: {e}")
        finally:
            await scheduler_db.disconnect()
    
    # Run async function in new event loop
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(async_price_check())
    except Exception as e:
        print(f"Scheduler loop error: {e}")
    finally:
        loop.close()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Ensure database connection
        if not db.is_connected():
            await db.connect()
            
        # Check database connection
        await db.user.count()
        
        # Check scheduler status
        global scheduler
        scheduler_status = "running" if scheduler and scheduler.running else "stopped"
        
        return {
            "status": "healthy",
            "database": "connected",
            "scheduler": scheduler_status,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.get("/keep-alive")
async def keep_alive():
    """Simple endpoint to keep server alive - for cron jobs"""
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Server is running"
    }



if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)