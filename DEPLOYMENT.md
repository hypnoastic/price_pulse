# 🚀 PricePulse Deployment Guide

## Quick Deployment Checklist

### 1. Database Setup (Neon)
- [ ] Create account at [neon.tech](https://neon.tech)
- [ ] Create new database
- [ ] Copy DATABASE_URL

### 2. Google OAuth Setup
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Create project and enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add production URLs to authorized origins/redirects

### 3. Backend Deployment (Render)
- [ ] Connect GitHub repository
- [ ] Set build command: `pip install -r requirements.txt && python -m prisma generate && python -m prisma db push`
- [ ] Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Add environment variables from .env.example
- [ ] Deploy

### 4. Frontend Deployment (Vercel)
- [ ] Connect GitHub repository
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Add VITE_API_URL environment variable
- [ ] Deploy

### 5. Keep Server Alive
- [ ] Set up cron job at [cron-job.org](https://cron-job.org)
- [ ] URL: `https://your-backend.onrender.com/keep-alive`
- [ ] Interval: Every 10 minutes

### 6. Update OAuth URLs
- [ ] Update Google Cloud Console with production URLs
- [ ] Update GOOGLE_REDIRECT_URI in backend environment

## Environment Variables

### Production Backend
```env
DATABASE_URL="your-neon-database-url"
SECRET_KEY="generate-strong-secret-key"
GMAIL_USER="your-gmail@gmail.com"
GMAIL_CLIENT_ID="your-google-client-id"
GMAIL_CLIENT_SECRET="your-google-client-secret"
GMAIL_REFRESH_TOKEN="your-gmail-refresh-token"
GOOGLE_OAUTH_CLIENT_ID="your-google-client-id"
GOOGLE_OAUTH_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="https://your-frontend.vercel.app/auth/callback"
```

### Production Frontend
```env
VITE_API_URL=https://your-backend.onrender.com
```

## Post-Deployment Testing
- [ ] Test user registration
- [ ] Test Google OAuth login
- [ ] Test product tracking
- [ ] Test price alerts
- [ ] Verify email notifications
- [ ] Check automated price updates

## Monitoring
- [ ] Set up uptime monitoring
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Verify cron job execution