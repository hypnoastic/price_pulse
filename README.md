# PricePulse 2.0 - Modern Amazon Price Tracker

A modern, full-stack SaaS application for tracking Amazon product prices with intelligent alerts and beautiful data visualization.

## 🚀 Features

- **Modern SaaS Landing Page** - Beautiful, responsive design with floating navbar
- **JWT Authentication** - Secure user authentication without Firebase dependency
- **PostgreSQL + Prisma** - Modern database stack with type-safe ORM
- **Scrapy Integration** - Robust web scraping with better reliability
- **Interactive Charts** - Beautiful price history visualization with Chart.js
- **Real-time Alerts** - Email notifications when prices hit target amounts
- **Responsive Design** - Works perfectly on all devices
- **Fast Performance** - Built with modern technologies for speed

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **Chart.js** - Interactive price charts
- **React Router** - Client-side routing
- **Modern CSS** - Custom CSS with gradients and animations

### Backend
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Reliable, scalable database
- **Prisma** - Type-safe database ORM
- **Scrapy** - Professional web scraping framework
- **JWT Authentication** - Secure token-based auth
- **APScheduler** - Automated price checking
- **SMTP Email** - Price alert notifications

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database (recommend Neon for cloud)
- Gmail account for email notifications

## 🚀 Quick Start

### 1. Database Setup

Create a PostgreSQL database (we recommend [Neon](https://neon.tech) for easy cloud setup):

```bash
# Get your DATABASE_URL from Neon dashboard
# Format: postgresql://username:password@host:port/database
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your database URL and email credentials

# Generate Prisma client and run migrations
prisma generate
prisma db push

# Start the server
uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API URL (default: http://localhost:8000)

# Start development server
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@host:port/database"
SECRET_KEY="your-super-secret-jwt-key-here"
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📊 Database Schema

The application uses the following main models:

- **User** - User accounts with JWT authentication
- **Product** - Tracked Amazon products
- **PriceHistory** - Historical price data for charts
- **Alert** - Price alert configurations

## 🕷️ Web Scraping

The application uses Scrapy for robust Amazon product scraping:

- **Rotating User Agents** - Avoid detection
- **Retry Logic** - Handle failed requests
- **Rate Limiting** - Respect server resources
- **Data Validation** - Clean and validate scraped data

## 📧 Email Notifications

Price alerts are sent via Gmail SMTP:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password for PricePulse
3. Use the App Password in your environment variables

## 🎨 UI/UX Features

- **Floating Navigation** - Modern glassmorphism design
- **Gradient Backgrounds** - Beautiful color schemes
- **Interactive Charts** - Hover effects and animations
- **Responsive Grid** - Perfect on all screen sizes
- **Loading States** - Smooth user experience
- **Error Handling** - User-friendly error messages

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `POST /api/products/track` - Track new product
- `GET /api/products` - Get user's tracked products
- `GET /api/products/{id}` - Get product details with history

### Alerts
- `POST /api/alerts` - Create price alert

## 🔄 Automated Price Checking

The system automatically checks prices every 20 minutes:

1. Fetches all tracked products from database
2. Scrapes current prices using Scrapy
3. Updates price history
4. Checks for price alerts
5. Sends email notifications if targets are met

## 🚀 Deployment

### Backend Deployment (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with automatic builds

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy with automatic builds

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt password security
- **CORS Protection** - Controlled cross-origin requests
- **Input Validation** - Pydantic model validation
- **SQL Injection Protection** - Prisma ORM safety

## 🎯 Performance Optimizations

- **Database Indexing** - Fast query performance
- **Connection Pooling** - Efficient database connections
- **Lazy Loading** - Load data when needed
- **Caching** - Reduce redundant API calls
- **Optimized Images** - Fast loading product images

## 🐛 Troubleshooting

### Common Issues

1. **Scraping Failures**
   - Amazon may block requests temporarily
   - Try different user agents
   - Implement longer delays

2. **Database Connection**
   - Check DATABASE_URL format
   - Ensure database is accessible
   - Verify credentials

3. **Email Notifications**
   - Use Gmail App Password, not regular password
   - Enable 2-factor authentication
   - Check spam folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **FastAPI** - Amazing Python web framework
- **Prisma** - Excellent database toolkit
- **Scrapy** - Powerful scraping framework
- **Chart.js** - Beautiful charting library
- **React** - Fantastic frontend framework

---

Built with ❤️ for smart shoppers who never want to overpay again!