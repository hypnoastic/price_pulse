import React, { useState, useEffect } from 'react';
import './SavedItemsPage.css';

function SavedItemsPage({ onTrack }) {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSavedItems(data.products || []);
      }
    } catch (error) {
      setError('Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSavedItems(savedItems.filter(item => item.id !== itemId));
      }
    } catch (error) {
      setError('Failed to remove item');
    }
  };

  const toggleTracking = async (itemId, isTracking) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products/${itemId}/tracking`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tracking: !isTracking }),
      });

      if (response.ok) {
        setSavedItems(savedItems.map(item => 
          item.id === itemId ? { ...item, tracking: !isTracking } : item
        ));
      }
    } catch (error) {
      setError('Failed to update tracking status');
    }
  };

  if (loading) {
    return (
      <div className="saved-items-page">
        <div className="container">
          <div className="loading-container card">
            <div className="loading-spinner"></div>
            <p>Loading saved items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-items-page">
      <div className="container">
        <div className="page-header fade-in">
          <h1>Saved Items</h1>
          <p>Manage your tracked products and monitoring preferences</p>
        </div>

        {error && (
          <div className="error-message card">
            {error}
          </div>
        )}

        <div className="items-section">
          <div className="section-header">
            <h2>Your Products</h2>
            <div className="item-stats">
              <span className="stat-badge">{savedItems.length} Items</span>
              <span className="stat-badge secondary">
                {savedItems.filter(item => item.tracking !== false).length} Tracking
              </span>
            </div>
          </div>

          {savedItems.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <h3>No saved items yet</h3>
              <p>Start adding products to track their prices and build your watchlist</p>
              <div className="empty-features">
                <div className="empty-feature">
                  <span className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3l8-8"/>
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.51 0 2.93.37 4.18 1.03"/>
                    </svg>
                  </span>
                  <span>Track unlimited products</span>
                </div>
                <div className="empty-feature">
                  <span className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                    </svg>
                  </span>
                  <span>Monitor price changes</span>
                </div>
                <div className="empty-feature">
                  <span className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </span>
                  <span>Get price alerts</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="items-grid">
              {savedItems.map((item) => (
                <div key={item.id} className="item-card card">
                  <div className="item-header">
                    <div className="item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="placeholder-image">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="item-actions">
                      <button 
                        onClick={() => toggleTracking(item.id, item.tracking !== false)}
                        className={`tracking-btn ${item.tracking !== false ? 'active' : ''}`}
                        title={item.tracking !== false ? 'Pause tracking' : 'Resume tracking'}
                      >
                        {item.tracking !== false ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="6" y="4" width="4" height="16"/>
                            <rect x="14" y="4" width="4" height="16"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5,3 19,12 5,21"/>
                          </svg>
                        )}
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="remove-btn"
                        title="Remove item"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="item-content" onClick={() => onTrack(item.id)}>
                    <h3 className="item-name">{item.name}</h3>
                    
                    <div className="price-section">
                      <div className="current-price">
                        ₹{item.currentPrice?.toLocaleString()}
                      </div>
                      {item.priceHistory && item.priceHistory.length > 1 && (
                        <div className={`price-trend ${
                          item.priceHistory[0].price > item.currentPrice ? 'down' : 'up'
                        }`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {item.priceHistory[0].price > item.currentPrice ? (
                              <polyline points="7,13 12,8 17,13"/>
                            ) : (
                              <polyline points="7,11 12,16 17,11"/>
                            )}
                          </svg>
                          <span>
                            {Math.abs(
                              ((item.currentPrice - item.priceHistory[0].price) / item.priceHistory[0].price) * 100
                            ).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="item-status">
                      <span className={`status-badge ${item.tracking !== false ? 'active' : 'paused'}`}>
                        <span className="status-dot"></span>
                        {item.tracking !== false ? 'Tracking' : 'Paused'}
                      </span>
                      <span className="last-updated">
                        Updated {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
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

export default SavedItemsPage;