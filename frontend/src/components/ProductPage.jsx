import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './ProductPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ProductPage({ productId, user }) {
  const [product, setProduct] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [alertLoading, setAlertLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        setMessage('Product not found');
      }
    } catch (error) {
      setMessage('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const handleAlert = async (e) => {
    e.preventDefault();
    setAlertLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          target_price: parseFloat(targetPrice),
          email
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setTargetPrice('');
      } else {
        setMessage(data.detail || 'Failed to set alert');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setAlertLoading(false);
    }
  };

  const getFilteredData = () => {
    if (!product?.priceHistory || product.priceHistory.length === 0) {
      return null;
    }

    const sortedHistory = [...product.priceHistory].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredHistory = days === 0 
      ? sortedHistory 
      : sortedHistory.filter(item => new Date(item.timestamp) >= cutoffDate);

    return filteredHistory;
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    if (!filteredData || filteredData.length === 0) {
      return null;
    }

    return {
      labels: filteredData.map(item => 
        new Date(item.timestamp).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      ),
      datasets: [
        {
          label: 'Price (₹)',
          data: filteredData.map(item => item.price),
          borderColor: 'var(--primary)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'var(--primary)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'var(--primary)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `₹${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          },
          color: 'var(--text-secondary)',
          font: {
            size: 12,
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: {
            size: 12,
          },
          maxRotation: 45,
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  if (loading) {
    return (
      <div className="product-page">
        <div className="container">
          <div className="loading-container card">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page">
        <div className="container">
          <div className="error-container card">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h2>Product not found</h2>
            <p>The product you're looking for doesn't exist or you don't have access to it.</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const currentPrice = product.currentPrice;
  const priceHistory = product.priceHistory || [];
  const priceChange = priceHistory.length > 1 
    ? currentPrice - priceHistory[priceHistory.length - 2].price 
    : 0;

  return (
    <div className="product-page">
      <div className="container">
        {/* Product Information Card */}
        <div className="product-info-card card fade-in">
          <div className="product-header">
            <div className="product-image">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <div className="placeholder-image">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="product-details">
              <h1 className="product-title">{product.name}</h1>
              
              <div className="price-info">
                <div className="current-price">
                  ₹{currentPrice?.toLocaleString()}
                </div>
                {priceChange !== 0 && (
                  <div className={`price-change ${priceChange > 0 ? 'increase' : 'decrease'}`}>
                    <span className="change-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {priceChange > 0 ? (
                          <polyline points="7,11 12,16 17,11"/>
                        ) : (
                          <polyline points="7,13 12,8 17,13"/>
                        )}
                      </svg>
                    </span>
                    <span className="change-text">
                      {priceChange > 0 ? '+' : ''}₹{Math.abs(priceChange).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="product-actions">
                <a 
                  href={product.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                >
                  <span className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  </span>
                  View on Amazon
                </a>
                <div className="product-status">
                  <span className="status-badge active">
                    <span className="status-dot"></span>
                    Tracking Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price History Graph */}
        <div className="chart-section card fade-in">
          <div className="chart-header">
            <h2>Price History</h2>
            <div className="time-range-selector">
              <button 
                className={`range-btn ${timeRange === '7' ? 'active' : ''}`}
                onClick={() => setTimeRange('7')}
              >
                7 days
              </button>
              <button 
                className={`range-btn ${timeRange === '30' ? 'active' : ''}`}
                onClick={() => setTimeRange('30')}
              >
                30 days
              </button>
              <button 
                className={`range-btn ${timeRange === '90' ? 'active' : ''}`}
                onClick={() => setTimeRange('90')}
              >
                90 days
              </button>
              <button 
                className={`range-btn ${timeRange === '0' ? 'active' : ''}`}
                onClick={() => setTimeRange('0')}
              >
                All time
              </button>
            </div>
          </div>
          
          <div className="chart-container">
            {chartData ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="no-chart">
                <div className="no-chart-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                </div>
                <h3>Price history not available yet</h3>
                <p>Price history will appear after the next scheduled update (within 20 minutes)</p>
              </div>
            )}
          </div>
        </div>

        {/* Set Price Alert */}
        <div className="alert-section card fade-in">
          <div className="alert-header">
            <div className="alert-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div className="alert-text">
              <h2>Set Price Alert</h2>
              <p>Get notified instantly when the price drops below your target</p>
            </div>
          </div>
          
          <form onSubmit={handleAlert} className="alert-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="targetPrice">Target Price (₹)</label>
                <input
                  type="number"
                  id="targetPrice"
                  min="1"
                  step="0.01"
                  placeholder="Enter target price"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  required
                  className="input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                />
              </div>
            </div>
            
            <button type="submit" disabled={alertLoading} className="btn btn-primary">
              {alertLoading ? (
                <>
                  <div className="spinner"></div>
                  Setting Alert...
                </>
              ) : (
                <>
                  <span className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="6"/>
                      <circle cx="12" cy="12" r="2"/>
                    </svg>
                  </span>
                  Set Price Alert
                </>
              )}
            </button>
          </form>

          {message && (
            <div className={`message ${message.includes('successfully') || message.includes('immediately') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;