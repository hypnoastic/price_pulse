import os
from fastapi import FastAPI, UploadFile, Form, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, EmailStr
from apscheduler.schedulers.background import BackgroundScheduler
import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, firestore
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from io import BytesIO
import base64
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import dotenv
from fastapi.responses import JSONResponse
import asyncio

# Load environment variables from .env file
dotenv.load_dotenv(override=True)

# Firebase setup
cred = credentials.Certificate("cred.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrackRequest(BaseModel):
    url: HttpUrl

class AlertRequest(BaseModel):
    product_id: str
    target_price: float
    email: EmailStr

# Scrape product info from Amazon
def scrape_amazon(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, "html.parser")
    name = soup.select_one('#productTitle')
    image = soup.select_one('#imgTagWrapperId img')
    price = soup.select_one('span.a-price span.a-offscreen')
    return {
        "name": name.text.strip() if name else None,
        "image": image['src'] if image else None,
        "price": float(price.text.replace('₹','').replace(',','').strip()) if price else None
    }

def save_price_history(product_id, price):
    db.collection('products').document(product_id).collection('history').add({
        'price': price,
        'timestamp': firestore.SERVER_TIMESTAMP
    })

def scheduled_scrape():
    products = db.collection('products').stream()
    for doc in products:
        data = doc.to_dict()
        scraped = scrape_amazon(data['url'])
        if scraped['price']:
            save_price_history(doc.id, scraped['price'])
            # Check for alert
            alert = db.collection('alerts').document(doc.id).get()
            if alert.exists:
                alert_data = alert.to_dict()
                if scraped['price'] <= alert_data['target_price']:
                    send_email(alert_data['email'], data['name'], scraped['price'], data['url'])
                    db.collection('alerts').document(doc.id).delete()

def send_email(email, name, price, url):
    # Real email sender using Gmail SMTP
    sender_email = os.environ.get("GMAIL_USER")
    sender_password = os.environ.get("GMAIL_APP_PASSWORD")
    if not sender_email or not sender_password:
        print("Gmail credentials not set in environment variables.")
        return
    subject = f"🔔 Price Alert: {name} is now ₹{price:,.2f}!"
    body = f"""
    <div style='font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; padding: 24px; border: 1px solid #e0e0e0;'>
      <h2 style='color: #0070f3; margin-bottom: 8px;'>{name}</h2>
      <p style='font-size: 1.1rem; color: #222;'>Current price: <b style='color: #27ae60; font-size: 1.2rem;'>₹{price:,.2f}</b></p>
      <a href='{url}' style='display: inline-block; margin: 18px 0 12px 0; padding: 12px 24px; background: #0070f3; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;'>View Product on Amazon</a>
      <hr style='margin: 24px 0; border: none; border-top: 1px solid #eee;'>
      <p style='font-size: 0.95rem; color: #888;'>You are receiving this alert because you set a target price for this product.<br>Thank you for using PricePulse!</p>
    </div>
    """
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, msg.as_string())
        print(f"Sent email to {email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_scrape, 'interval', minutes=30)
scheduler.start()

@app.post("/api/track")
async def track_product(request: Request):
    data = await request.json()
    url = data.get('url')
    uid = data.get('uid')
    if not url or not uid:
        return JSONResponse(status_code=422, content={"error": "Missing url or uid"})
    scraped = scrape_amazon(url)
    if not scraped['name'] or not scraped['price']:
        return {"error": "Could not fetch product info."}
    doc_ref = db.collection('users').document(uid).collection('products').add({
        'url': str(url),
        'name': scraped['name'],
        'image': scraped['image'],
        'price': scraped['price']
    })
    product_id = doc_ref[1].id
    # Save price history immediately so chart has at least one point
    db.collection('users').document(uid).collection('products').document(product_id).collection('history').add({
        'price': scraped['price'],
        'timestamp': firestore.SERVER_TIMESTAMP
    })
    return {"product_id": product_id, "title": scraped['name']}

@app.get("/api/tracked")
def get_tracked(uid: str):
    products_ref = db.collection('users').document(uid).collection('products').stream()
    products = []
    for doc_ in products_ref:
        data = doc_.to_dict()
        data['product_id'] = doc_.id
        products.append(data)
    return {"products": products}

@app.get("/api/product/{product_id}")
def get_product(product_id: str, uid: str = None):
    # Try user-specific product first
    if uid:
        doc = db.collection('users').document(uid).collection('products').document(product_id).get()
        if doc.exists:
            data = doc.to_dict()
            # Get price history
            history = db.collection('users').document(uid).collection('products').document(product_id).collection('history').order_by('timestamp').stream()
            prices = []
            times = []
            for h in history:
                d = h.to_dict()
                prices.append(d['price'])
                times.append(d['timestamp'])
            # If no price history, use current price and now
            if not prices:
                prices = [data['price']]
                from datetime import datetime
                times = [datetime.now()]
            # Generate chart
            if prices and times:
                fig, ax = plt.subplots()
                ax.plot(times, prices, marker='o')
                ax.set_title('Price History')
                ax.set_xlabel('Time')
                ax.set_ylabel('Price')
                buf = BytesIO()
                plt.savefig(buf, format='png')
                buf.seek(0)
                img_b64 = base64.b64encode(buf.read()).decode('utf-8')
                plt.close(fig)
            else:
                img_b64 = None
            return {
                "name": data['name'],
                "image": data['image'],
                "price": data['price'],
                "chart": img_b64,
                "url": data['url']
            }
    # fallback to global products if not found
    doc = db.collection('products').document(product_id).get()
    if not doc.exists:
        return {"error": "Product not found."}
    data = doc.to_dict()
    # Get price history
    history = db.collection('products').document(product_id).collection('history').order_by('timestamp').stream()
    prices = []
    times = []
    for h in history:
        d = h.to_dict()
        prices.append(d['price'])
        times.append(d['timestamp'])
    # Generate chart
    fig, ax = plt.subplots()
    ax.plot(times, prices, marker='o')
    ax.set_title('Price History')
    ax.set_xlabel('Time')
    ax.set_ylabel('Price')
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_b64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return {
        "name": data['name'],
        "image": data['image'],
        "price": data['price'],
        "chart": img_b64
    }

@app.post("/api/alert")
def set_alert(req: AlertRequest):
    db.collection('alerts').document(req.product_id).set({
        'target_price': req.target_price,
        'email': req.email
    })
    # Immediately check if the current price already satisfies the alert
    doc = db.collection('products').document(req.product_id).get()
    if doc.exists:
        data = doc.to_dict()
        if data.get('price') is not None and data['price'] <= req.target_price:
            send_email(req.email, data['name'], data['price'], data['url'])
            db.collection('alerts').document(req.product_id).delete()
            return {"message": "Alert set and email sent immediately!"}
    return {"message": "Alert set!"}