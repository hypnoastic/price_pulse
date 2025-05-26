# Price Pulse - Amazon Price Tracker

Price Pulse is a full-stack web application that helps users track Amazon product prices and get email notifications when prices drop to their target amount. Built with React, FastAPI, and Firebase.

## Features

- 🔍 Track any Amazon product by URL
- 📊 View price history charts
- 📧 Set email alerts for price drops
- 🔄 Automatic price updates every 20 minutes
- 📱 Responsive design
- 🔐 User authentication
- 💾 Real-time data sync with Firebase

## Tech Stack

### Frontend
- React 18
- Vite
- Firebase Authentication
- Firebase Firestore
- React Router
- Chart.js
- CSS3 with modern animations

### Backend
- FastAPI
- Firebase Admin SDK
- APScheduler for automated price checks
- BeautifulSoup4 for web scraping
- Matplotlib for chart generation
- SMTP for email notifications

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Firebase account
- Gmail account (for sending notifications)

### Frontend Setup

1. Navigate to the frontend directory:
   ```zsh
   cd frontend
   ```

2. Install dependencies:
   ```zsh
   npm install
   ```

3. Create a Firebase project and update `src/firebase.js` with your Firebase configuration.

4. Start the development server:
   ```zsh
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```zsh
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```zsh
   python -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```zsh
   pip install -r requirements.txt
   ```

4. Set up environment variables in `.env`:
   ```
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_gmail_app_password
   ```

5. Add your Firebase Admin SDK credentials in `cred.json`

6. Start the backend server:
   ```zsh
   uvicorn main:app --reload
   ```

## Project Structure

```
price_pulse/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── firebase.js
│   └── package.json
└── backend/
    ├── main.py
    ├── requirements.txt
    └── cred.json
```

## How It Works

1. **User Authentication**:
   - Users sign up/login using Firebase Authentication
   - Each user has their own product tracking list

2. **Product Tracking**:
   - Users paste Amazon product URLs
   - Backend scrapes initial product data
   - Data is stored in Firebase Firestore

3. **Price Monitoring**:
   - Backend scheduler runs every 20 minutes
   - Scrapes latest prices for all tracked products
   - Updates price history in Firestore

4. **Price Alerts**:
   - Users set target prices for products
   - When price drops below target:
     - User receives email notification
     - Alert is automatically removed

5. **Data Visualization**:
   - Price history displayed as interactive charts
   - Real-time updates when new prices are fetched

## Security Features

- Firebase Authentication for user management
- Secure CORS policy
- Environment variables for sensitive data
- Firebase security rules for data access

## Production Deployment

The application is currently deployed at:
- Frontend: Your frontend URL
- Backend: https://price-pulse-os14.onrender.com

## Known Limitations

- Amazon may block IPs with too many requests
- Price updates are limited to 20-minute intervals
- Some Amazon products may not be scrapable


