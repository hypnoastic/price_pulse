# 🛒 PricePulse - Smart Amazon Price Tracker

A modern, full-stack SaaS application for tracking Amazon product prices with intelligent alerts, Google OAuth authentication, and beautiful data visualization.

![PricePulse Banner](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=PricePulse+-+Smart+Price+Tracking)

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure login with Google accounts
- 📧 **Email OTP Verification** - Alternative registration with email verification
- 🕷️ **Robust Web Scraping** - Scrapy-powered Amazon product tracking
- 📊 **Interactive Price Charts** - Beautiful Chart.js visualizations
- 🚨 **Smart Price Alerts** - Email notifications when prices drop
- 📱 **Responsive Design** - Perfect on all devices
- ⚡ **Real-time Updates** - Automated price checking every hour
- 🎨 **Modern UI/UX** - Glassmorphism design with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Chart.js** for price visualization
- **React Router** for navigation
- **Axios** for API calls
- **Modern CSS** with gradients and animations

### Backend
- **FastAPI** - High-performance Python framework
- **PostgreSQL** with Prisma ORM
- **Scrapy** - Professional web scraping
- **JWT Authentication** - Secure token-based auth
- **Google OAuth 2.0** - Social login integration
- **APScheduler** - Automated background tasks
- **Gmail API** - Email notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database (recommend [Neon](https://neon.tech))
- Google Cloud Console project for OAuth

### 1. Clone Repository
```bash
git clone <repository-url>
cd price_pulse
```

### 2. Database Setup
Create a PostgreSQL database on [Neon](https://neon.tech):
```bash
# Get your DATABASE_URL from Neon dashboard
# Format: postgresql://username:password@host:port/database
```

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins and redirect URIs:
   - **Origins**: `http://localhost:3000`, `https://your-domain.com`
   - **Redirect URIs**: `http://localhost:3000/auth/callback`, `https://your-domain.com/auth/callback`

### 4. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)

# Generate Prisma client and push schema
python -m prisma generate
python -m prisma db push

# Start server
uvicorn main:app --reload
```

### 5. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with API URL

# Start development server
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Security
SECRET_KEY="your-super-secret-jwt-key-here"

# Gmail for notifications
GMAIL_USER="your-email@gmail.com"
GMAIL_CLIENT_ID="your-google-client-id"
GMAIL_CLIENT_SECRET="your-google-client-secret"
GMAIL_REFRESH_TOKEN="your-gmail-refresh-token"

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID="your-google-client-id"
GOOGLE_OAUTH_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/auth/callback"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📊 Database Schema

```sql
-- Users with Google OAuth support
User {
  id, email, password?, name?, picture?
  googleId?, refreshToken?, verified
  products[], alerts[]
}

-- Tracked products
Product {
  id, url, name, image?, currentPrice
  userId, priceHistory[], alerts[]
}

-- Price history for charts
PriceHistory {
  id, price, timestamp, productId
}

-- Price alerts
Alert {
  id, targetPrice, email, userId, productId
}

-- OTP verification
OTPVerification {
  id, email, otp, expiresAt, verified
}
```

## 🔌 API Endpoints

### Authentication
```http
POST /api/auth/register          # Email registration
POST /api/auth/login             # Email login
POST /api/auth/send-otp          # Send OTP for verification
POST /api/auth/verify-otp        # Verify OTP and create account
GET  /api/auth/google/url        # Get Google OAuth URL
POST /api/auth/google/callback   # Handle Google OAuth callback
POST /api/auth/logout            # Logout and revoke tokens
```

### Products
```http
POST /api/products/track         # Track new product
GET  /api/products               # Get user's products
GET  /api/products/{id}          # Get product with price history
DELETE /api/products/{id}        # Delete tracked product
```

### Alerts
```http
GET  /api/alerts                 # Get user's alerts
POST /api/alerts                 # Create price alert
DELETE /api/alerts/{id}          # Delete alert
```

### System
```http
GET  /health                     # Health check
GET  /keep-alive                 # Keep server alive (for cron jobs)
```

## 🕷️ Web Scraping Features

- **Rotating User Agents** - Avoid detection
- **Retry Logic** - Handle failed requests gracefully
- **Rate Limiting** - Respect server resources
- **Data Validation** - Clean and validate scraped data
- **Error Handling** - Robust error recovery

## 📧 Email Setup

### Gmail Configuration
1. Enable 2-factor authentication
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use App Password in `GMAIL_CLIENT_SECRET`

### Gmail API Setup (for OAuth)
1. Enable Gmail API in Google Cloud Console
2. Get refresh token using OAuth 2.0 Playground
3. Add refresh token to environment variables

## 🚀 Deployment

### Backend (Render/Railway)
```bash
# Build command
pip install -r requirements.txt && python -m prisma generate && python -m prisma db push

# Start command
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel/Netlify)
```bash
# Build command
npm run build

# Output directory
dist
```

### Environment Variables for Production
Update redirect URIs in Google Cloud Console:
```
https://your-frontend.vercel.app/auth/callback
https://your-backend.onrender.com
```

## 🔄 Automated Price Checking

The system automatically checks prices every hour:
1. Fetches all tracked products
2. Scrapes current prices using Scrapy
3. Updates price history
4. Checks for price alerts
5. Sends email notifications

### Keep Server Alive
For free hosting tiers, use a cron job to hit `/keep-alive` every 10 minutes:
```bash
# Using cron-job.org or similar service
curl https://your-backend.onrender.com/keep-alive
```

## 🎨 UI Components

- **LandingPage** - Hero section with features
- **AuthPages** - Login/Register with Google OAuth
- **GoogleAuth** - Google sign-in button
- **OTPVerification** - Email verification flow
- **HomePage** - Dashboard with tracked products
- **ProductPage** - Individual product with price chart
- **SavedItemsPage** - All tracked products grid
- **AlertsPage** - Manage price alerts
- **Navbar** - Floating navigation with glassmorphism

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Google OAuth 2.0** - Industry-standard social login
- **Password Hashing** - Bcrypt encryption
- **CORS Protection** - Controlled cross-origin requests
- **Input Validation** - Pydantic model validation
- **SQL Injection Protection** - Prisma ORM safety

## 🎯 Performance Optimizations

- **Database Indexing** - Fast query performance
- **Connection Pooling** - Efficient database connections
- **Lazy Loading** - Load data when needed
- **Optimized Images** - Fast loading product images
- **Background Tasks** - Non-blocking price updates

## 🐛 Troubleshooting

### Common Issues

**Scraping Failures**
```bash
# Amazon may temporarily block requests
# Solution: Implement longer delays, rotate user agents
```

**Database Connection**
```bash
# Check DATABASE_URL format
# Ensure database is accessible
python -m prisma db push
```

**Google OAuth Errors**
```bash
# Verify redirect URIs in Google Cloud Console
# Check client ID and secret
# Ensure APIs are enabled
```

**Email Notifications**
```bash
# Use Gmail App Password, not regular password
# Enable 2-factor authentication
# Check spam folder
```

## 📁 Project Structure

```
price_pulse/
├── backend/
│   ├── prisma/schema.prisma     # Database schema
│   ├── scrapy_spider/           # Web scraping logic
│   ├── main.py                  # FastAPI application
│   ├── auth.py                  # JWT authentication
│   ├── google_auth.py           # Google OAuth logic
│   ├── scraper.py               # Scraping interface
│   ├── email_service.py         # Email notifications
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── App.jsx             # Main application
│   │   └── main.jsx            # Entry point
│   ├── package.json            # Node dependencies
│   └── vite.config.js          # Vite configuration
└── README.md                   # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** - Amazing Python web framework
- **Prisma** - Excellent database toolkit
- **Scrapy** - Powerful scraping framework
- **Chart.js** - Beautiful charting library
- **React** - Fantastic frontend framework
- **Google** - OAuth 2.0 and Gmail APIs

---

**Built with ❤️ for smart shoppers who never want to overpay again!**

For support, email: [your-email@domain.com](mailto:your-email@domain.com)