import React, { useState, useEffect } from 'react';
import './HomePage.css';

function HomePage({ onTrack, user }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackedProducts, setTrackedProducts] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchTrackedProducts();
    const interval = setInterval(fetchTrackedProducts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchTrackedProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrackedProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setUrl('');
        fetchTrackedProducts();
        onTrack(data.product_id);
      } else {
        setError(data.detail || 'Failed to track product');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header fade-in">
          <h1>Track Price History</h1>
          <p>Monitor your favorite products and get notified when prices drop</p>
        </div>

        {/* Link Input Section */}
        <div className="input-section card fade-in">
          <div className="input-content">
            <h2>Add Product to Track</h2>
            <p>Paste any Amazon or Flipkart product link to start monitoring</p>
            
            <form onSubmit={handleSubmit} className="track-form">
              <div className="input-wrapper">
                <input
                  type="url"
                  placeholder="Paste any Amazon or Flipkart product link..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="input url-input"
                />
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="M21 21l-4.35-4.35"/>
                        </svg>
                      </span>
                      Analyze Price
                    </>
                  )}
                </button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </form>
          </div>
        </div>

        {/* Tracked Products Section */}
        <div className="products-section">
          <div className="section-header">
            <h2>Your Tracked Products</h2>
            <div className="product-stats">
              <span className="stat-badge">{trackedProducts.length} Products</span>
            </div>
          </div>

          {trackedProducts.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <h3>No products tracked yet</h3>
              <p>Start by adding a product link above to begin price monitoring</p>
              <div className="empty-features">
                <div className="empty-feature">
                  <span className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      <polyline points="17 6 23 6 23 12"/>
                    </svg>
                  </span>
                  <span>Real-time price tracking</span>
                </div>
                <div className="empty-feature">
                  <span className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </span>
                  <span>Instant price alerts</span>
                </div>
                <div className="empty-feature">
                  <span className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <rect x="7" y="7" width="3" height="9"/>
                      <rect x="14" y="7" width="3" height="5"/>
                    </svg>
                  </span>
                  <span>Historical price charts</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="products-grid">
              {trackedProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card card"
                  onClick={() => onTrack(product.id)}
                >
                  <div className="product-header">
                    <div className="product-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="placeholder-image">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="product-status">
                      <span className="status-badge active">Active</span>
                    </div>
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    
                    <div className="price-section">
                      <div className="current-price">
                        ₹{product.currentPrice?.toLocaleString()}
                      </div>
                      {product.priceHistory && product.priceHistory.length > 1 && (
                        <div className={`price-trend ${
                          product.priceHistory[0].price > product.currentPrice ? 'down' : 'up'
                        }`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {product.priceHistory[0].price > product.currentPrice ? (
                              <polyline points="7,13 12,8 17,13"/>
                            ) : (
                              <polyline points="7,11 12,16 17,11"/>
                            )}
                          </svg>
                          <span>
                            {Math.abs(
                              ((product.currentPrice - product.priceHistory[0].price) / product.priceHistory[0].price) * 100
                            ).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="product-meta">
                      <span className="last-updated">
                        Updated {new Date(product.updatedAt).toLocaleDateString()}
                      </span>
                      <span className="view-details">View Details →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;