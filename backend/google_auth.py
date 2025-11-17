import os
import httpx
import jwt
from urllib.parse import urlencode
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

GOOGLE_CLIENT_ID = os.getenv("GMAIL_CLIENT_ID") or "72758212540-jb1u4toarbq99vscm8j4uffu1e4p9th8.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = os.getenv("GMAIL_CLIENT_SECRET") or "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"
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/callback")

print(f"Debug - GMAIL_CLIENT_ID from env: {os.getenv('GMAIL_CLIENT_ID')}")
print(f"Debug - All env vars with GMAIL: {[(k, v) for k, v in os.environ.items() if 'GMAIL' in k]}")

class GoogleAuth:
    @staticmethod
    def get_auth_url() -> str:
        """Generate Google OAuth URL"""
        print(f"Using Client ID: {GOOGLE_CLIENT_ID}")
        print(f"Using Client Secret: {GOOGLE_CLIENT_SECRET[:10]}..." if GOOGLE_CLIENT_SECRET else "None")
        print(f"Using Redirect URI: {GOOGLE_REDIRECT_URI}")
        
        params = {
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "scope": "openid email profile",
            "response_type": "code",
            "access_type": "offline",
            "prompt": "consent"
        }
        auth_url = f"https://accounts.google.com/o/oauth2/auth?{urlencode(params)}"
        print(f"Generated Auth URL: {auth_url}")
        return auth_url
    
    @staticmethod
    async def exchange_code_for_tokens(code: str) -> Dict[str, Any]:
        """Exchange authorization code for tokens"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": GOOGLE_REDIRECT_URI,
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Token exchange failed: {response.text}")
            
            return response.json()
    
    @staticmethod
    def decode_id_token(id_token: str) -> Dict[str, Any]:
        """Decode and verify ID token"""
        try:
            # Decode without verification for now (in production, verify signature)
            decoded = jwt.decode(id_token, options={"verify_signature": False})
            return decoded
        except Exception as e:
            raise Exception(f"Invalid ID token: {str(e)}")
    
    @staticmethod
    async def refresh_access_token(refresh_token: str) -> Dict[str, Any]:
        """Refresh Google access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token",
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Token refresh failed: {response.text}")
            
            return response.json()
    
    @staticmethod
    async def revoke_token(token: str) -> bool:
        """Revoke Google token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://oauth2.googleapis.com/revoke?token={token}"
            )
            return response.status_code == 200