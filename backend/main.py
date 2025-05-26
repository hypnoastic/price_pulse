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
from datetime import datetime

# Load environment variables from .env file
dotenv.load_dotenv(override=True)

# Firebase setup
cred = credentials.Certificate("cred.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

print("[FIREBASE] Project ID:", firebase_admin.get_app().project_id)
print("[SCHEDULER] Top-level collections in Firestore:")
for col in db.collections():
    print(f" - {col.id}")

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
    try:
        doc_ref = db.collection('products').document(product_id).collection('history').add({
            'price': price,
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        print(f"[SAVE_PRICE] Successfully saved price {price} for product {product_id}")
        return doc_ref
    except Exception as e:
        print(f"[SAVE_PRICE] Error saving price: {e}")
        return None

def check_alerts(product_id, price, name, url):
    # Check if there are any alerts for this product
    alerts = db.collection('alerts').where('product_id', '==', product_id).stream()
    for alert in alerts:
        alert_data = alert.to_dict()
        if price <= alert_data['target_price']:
            # Send email and delete the alert
            send_email(alert_data['email'], name, price, url)
            db.collection('alerts').document(alert.id).delete()
            print(f"[ALERTS] Sent alert email for {product_id} to {alert_data['email']}")

def scheduled_scrape():
    print("[SCHEDULER] Running scheduled_scrape...")
    print("[SCHEDULER] Listing document paths for all collection groups:")
    collections = list(db.collection_group('products').get())
    print(f"[SCHEDULER] Found {len(collections)} documents in products collection group")
    
    try:
        users = list(db.collection('users').stream())
        print("[SCHEDULER] User collection stream successful")
    except Exception as e:
        print(f"[SCHEDULER] Error getting users collection: {e}")
        return

    print(f"[SCHEDULER] User IDs found: {[u.id for u in users]}")
    user_count = len(users)
    product_count = 0
    print(f"[SCHEDULER] Found {user_count} users to process.")
    
    for user_doc in users:
        user_id = user_doc.id
        print(f"[SCHEDULER] Processing user {user_id}")
        try:
            user_ref = db.collection('users').document(user_id)
            user_data = user_ref.get().to_dict()
            print(f"[SCHEDULER] User data: {user_data}")
        except Exception as e:
            print(f"[SCHEDULER] Error getting user data for {user_id}: {e}")
            continue

        try:
            products = db.collection('users').document(user_id).collection('products').stream()
            product_list = list(products)
            print(f"[SCHEDULER] Successfully got products for user {user_id}")
        except Exception as e:
            print(f"[SCHEDULER] Error getting products for user {user_id}: {e}")
            continue
            
        print(f"[SCHEDULER] User {user_id} has {len(product_list)} products.")
        for doc_ in product_list:
            product_count += 1
            data = doc_.to_dict()
            print(f"[SCHEDULER] Scraping {data.get('name')} for user {user_id} (product id: {doc_.id})")
            # Try scraping up to 20 times (with a short delay) until price is found
            max_attempts = 20
            attempt = 0
            price_found = False
            scraped = None
            while attempt < max_attempts and not price_found:
                scraped = scrape_amazon(data['url'])
                if scraped['price']:
                    price_found = True
                else:
                    attempt += 1
                    import time
                    time.sleep(2)
            if price_found:
                prod_ref = db.collection('users').document(user_id).collection('products').document(doc_.id)
                prod_data = prod_ref.get().to_dict()
                price_array = prod_data.get('price_array', [])
                if not isinstance(price_array, list):
                    price_array = []
                try:
                    price_val = float(scraped['price'])
                    # Check price alerts before updating the price
                    check_alerts(doc_.id, price_val, data['name'], data['url'])
                    
                    from datetime import datetime
                    now = datetime.now()
                    price_array.append({'price': price_val, 'timestamp': now})
                    
                    prod_ref.update({'price_array': price_array, 'price': price_val})
                    print(f"[SCHEDULER] Updated price_array for {data.get('name')} (user {user_id}) with price {price_val}")
                except Exception as e:
                    print(f"[SCHEDULER] Error updating price: {e}")
            else:
                print(f"[SCHEDULER] Failed to scrape price for {data.get('name')} (user {user_id}) after {max_attempts} attempts")
    print(f"[SCHEDULER] Processed {user_count} users and {product_count} products.")

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
scheduler.add_job(scheduled_scrape, 'interval', minutes=20)
scheduler.start()

print("[DEBUG] Listing all user document IDs in Firestore at startup:")
user_docs = list(db.collection('users').stream())
for doc in user_docs:
    print(f" - {doc.id}")
print(f"[DEBUG] Total user docs found: {len(user_docs)}")

@app.post("/api/track")
async def track_product(request: Request):
    print("[TRACK] Starting product tracking")
    data = await request.json()
    url = data.get('url')
    uid = data.get('uid')
    print(f"[TRACK] Received request with url={url} and uid={uid}")
    
    if not url or not uid:
        print("[TRACK] Missing url or uid")
        return JSONResponse(status_code=422, content={"error": "Missing url or uid"})
        
    try:
        scraped = scrape_amazon(url)
        print(f"[TRACK] Scrape results: {scraped}")
    except Exception as e:
        print(f"[TRACK] Scraping failed: {e}")
        return {"error": f"Failed to scrape product: {str(e)}"}
        
    if not scraped['name'] or not scraped['price']:
        print("[TRACK] Scrape incomplete - missing name or price")
        return {"error": "Could not fetch product info."}
    
    now = datetime.now()
    print(f"[TRACK] Adding product to Firestore for user {uid}")
    
    try:
        # First verify the user document exists
        user_ref = db.collection('users').document(uid)
        if not user_ref.get().exists:
            print(f"[TRACK] Creating new user document for {uid}")
            user_ref.set({'created_at': firestore.SERVER_TIMESTAMP})
            
        # Add the product
        doc_ref = db.collection('users').document(uid).collection('products').add({
            'url': str(url),
            'name': scraped['name'],
            'image': scraped['image'],
            'price': scraped['price'],
            'price_array': [
                {'price': scraped['price'], 'timestamp': now}
            ]
        })
        product_id = doc_ref[1].id
        print(f"[TRACK] Successfully added product {product_id} for user {uid}")
        
        # Add initial history entry
        history_ref = db.collection('users').document(uid).collection('products').document(product_id).collection('history').add({
            'price': scraped['price'],
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        print(f"[TRACK] Added initial history entry for product {product_id}")
        
        return {"product_id": product_id, "title": scraped['name']}
        
    except Exception as e:
        print(f"[TRACK] Error adding product to Firestore: {e}")
        return {"error": f"Database error: {str(e)}"}

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
    if uid:
        doc = db.collection('users').document(uid).collection('products').document(product_id).get()
        if doc.exists:
            data = doc.to_dict()
            # Use price_array for graph
            price_array = data.get('price_array', [])
            prices = [p['price'] for p in price_array]
            times = [p['timestamp'] for p in price_array]
            # If no price_array, fallback to history subcollection
            if not prices:
                history = db.collection('users').document(uid).collection('products').document(product_id).collection('history').order_by('timestamp').stream()
                for h in history:
                    d = h.to_dict()
                    prices.append(d['price'])
                    times.append(d['timestamp'])
            # If still no data, use current price and now
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
async def set_alert(req: AlertRequest):
    print(f"[ALERT] Setting alert for product {req.product_id} at target price {req.target_price}")
    
    # First verify the product exists and get its current price
    found = False
    current_price = None
    product_name = None
    product_url = None
    
    # Search in all users' products
    users = db.collection('users').stream()
    for user in users:
        product_ref = db.collection('users').document(user.id).collection('products').document(req.product_id)
        product_doc = product_ref.get()
        if product_doc.exists:
            data = product_doc.to_dict()
            found = True
            current_price = data.get('price')
            product_name = data.get('name')
            product_url = data.get('url')
            break
    
    if not found:
        return JSONResponse(status_code=404, content={"error": "Product not found"})
        
    # Save the alert
    alert_ref = db.collection('alerts').document()
    alert_ref.set({
        'product_id': req.product_id,
        'target_price': req.target_price,
        'email': req.email
    })
    
    # Check if current price already meets the target
    if current_price and current_price <= req.target_price:
        send_email(req.email, product_name, current_price, product_url)
        alert_ref.delete()
        return {"message": "Alert set and email sent immediately!"}
        
    return {"message": "Alert set!"}