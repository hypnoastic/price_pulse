import base64
import os
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

class GmailService:
    def __init__(self):
        self.service = None
        self.setup_gmail_service()
    
    def setup_gmail_service(self):
        """Setup Gmail API service using refresh token"""
        try:
            # Get credentials from environment variables
            client_id = os.getenv('GMAIL_CLIENT_ID')
            client_secret = os.getenv('GMAIL_CLIENT_SECRET')
            refresh_token = os.getenv('GMAIL_REFRESH_TOKEN')
            
            if not all([client_id, client_secret, refresh_token]):
                print("Gmail credentials not found in environment variables")
                return
            
            # Create credentials object
            creds = Credentials(
                token=None,
                refresh_token=refresh_token,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=client_id,
                client_secret=client_secret,
                scopes=SCOPES
            )
            
            # Refresh the token
            creds.refresh(Request())
            
            # Build the service
            self.service = build('gmail', 'v1', credentials=creds)
            print("Gmail API service initialized successfully")
            
        except Exception as e:
            print(f"Failed to setup Gmail service: {e}")
    
    def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None):
        """Send email using Gmail API"""
        if not self.service:
            print("Gmail service not initialized")
            return False
            
        try:
            message = MIMEMultipart('alternative')
            message['to'] = to_email
            message['from'] = os.getenv('GMAIL_USER', 'noreply@pricepulse.com')
            message['subject'] = subject
            
            # Add text version if provided
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                message.attach(text_part)
            
            # Add HTML version
            html_part = MIMEText(html_content, 'html')
            message.attach(html_part)
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            # Send message
            send_message = self.service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()
            
            print(f"Email sent successfully to {to_email}. Message ID: {send_message['id']}")
            return True
            
        except HttpError as error:
            print(f"Gmail API error: {error}")
            return False
        except Exception as error:
            print(f"Email sending error: {error}")
            return False

def generate_otp():
    """Generate 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def send_otp_email(email: str, otp: str):
    """Send OTP verification email"""
    gmail_service = GmailService()
    
    subject = "Verify Your PricePulse Account"
    
    html_content = f"""
    <div style='font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;'>
        <div style='background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);'>
            <div style='text-align: center; margin-bottom: 32px;'>
                <h1 style='color: #4F46E5; font-size: 24px; font-weight: 800; margin: 0;'>PricePulse</h1>
                <p style='color: #6B7280; margin: 8px 0 0 0;'>Smart price tracking for smarter shopping</p>
            </div>
            
            <h2 style='color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;'>Verify Your Account</h2>
            
            <p style='color: #6B7280; font-size: 16px; line-height: 1.6; margin-bottom: 24px;'>
                Welcome to PricePulse! Please use the verification code below to complete your account setup:
            </p>
            
            <div style='background: #F3F4F6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;'>
                <div style='font-size: 32px; font-weight: 800; color: #4F46E5; letter-spacing: 8px; font-family: monospace;'>
                    {otp}
                </div>
                <p style='color: #6B7280; font-size: 14px; margin: 8px 0 0 0;'>This code expires in 10 minutes</p>
            </div>
            
            <p style='color: #6B7280; font-size: 14px; line-height: 1.6; margin-bottom: 24px;'>
                If you didn't create an account with PricePulse, please ignore this email.
            </p>
            
            <div style='border-top: 1px solid #E5E7EB; padding-top: 24px; text-align: center;'>
                <p style='color: #9CA3AF; font-size: 12px; margin: 0;'>
                    © 2024 PricePulse. All rights reserved.
                </p>
            </div>
        </div>
    </div>
    """
    
    text_content = f"""
    PricePulse - Verify Your Account
    
    Welcome to PricePulse! Please use the verification code below to complete your account setup:
    
    Verification Code: {otp}
    
    This code expires in 10 minutes.
    
    If you didn't create an account with PricePulse, please ignore this email.
    """
    
    return gmail_service.send_email(email, subject, html_content, text_content)

def send_price_alert_email(email: str, product_name: str, price: float, url: str):
    """Send price alert email"""
    gmail_service = GmailService()
    
    subject = f"Price Alert: {product_name} dropped to ₹{price:,.2f}!"
    
    html_content = f"""
    <div style='font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;'>
        <div style='background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);'>
            <div style='text-align: center; margin-bottom: 32px;'>
                <h1 style='color: #4F46E5; font-size: 24px; font-weight: 800; margin: 0;'>PricePulse</h1>
                <p style='color: #6B7280; margin: 8px 0 0 0;'>Price Alert Notification</p>
            </div>
            
            <div style='background: #DCFCE7; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;'>
                <h2 style='color: #10B981; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;'>Great News!</h2>
                <p style='color: #059669; margin: 0; font-weight: 600;'>The price has dropped to your target!</p>
            </div>
            
            <h3 style='color: #111827; font-size: 18px; font-weight: 600; margin-bottom: 16px;'>{product_name}</h3>
            
            <div style='background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 20px 0;'>
                <div style='display: flex; justify-content: space-between; align-items: center;'>
                    <span style='color: #6B7280; font-size: 14px;'>Current Price:</span>
                    <span style='color: #10B981; font-size: 24px; font-weight: 800;'>₹{price:,.2f}</span>
                </div>
            </div>
            
            <div style='text-align: center; margin: 32px 0;'>
                <a href='{url}' style='display: inline-block; background: #4F46E5; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;'>
                    View on Amazon
                </a>
            </div>
            
            <div style='border-top: 1px solid #E5E7EB; padding-top: 24px;'>
                <p style='color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0;'>
                    You're receiving this alert because you set a price target for this product. 
                    <br>Happy shopping with PricePulse!
                </p>
            </div>
            
            <div style='text-align: center; margin-top: 24px;'>
                <p style='color: #9CA3AF; font-size: 12px; margin: 0;'>
                    © 2024 PricePulse. All rights reserved.
                </p>
            </div>
        </div>
    </div>
    """
    
    text_content = f"""
    PricePulse - Price Alert!
    
    Great News! The price has dropped to your target!
    
    Product: {product_name}
    Current Price: ₹{price:,.2f}
    
    View on Amazon: {url}
    
    You're receiving this alert because you set a price target for this product.
    Happy shopping with PricePulse!
    """
    
    return gmail_service.send_email(email, subject, html_content, text_content)