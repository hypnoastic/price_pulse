import React, { useState, useEffect } from 'react';
import './AlertsPage.css';

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      setError('Failed to delete alert');
    }
  };

  if (loading) {
    return (
      <div className="alerts-page">
        <div className="container">
          <div className="loading-container card">
            <div className="loading-spinner"></div>
            <p>Loading alerts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-page">
      <div className="container">
        <div className="page-header fade-in">
          <h1>Price Alerts</h1>
          <p>Manage your price notifications and alert preferences</p>
        </div>

        {error && (
          <div className="error-message card">
            {error}
          </div>
        )}

        <div className="alerts-section">
          <div className="section-header">
            <h2>Active Alerts</h2>
            <div className="alert-stats">
              <span className="stat-badge">{alerts.length} Active</span>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <h3>No alerts set up yet</h3>
              <p>Start tracking products to set up price alerts and get notified when prices drop</p>
              <div className="empty-features">
                <div className="empty-feature">
                  <span className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                    </svg>
                  </span>
                  <span>Real-time notifications</span>
                </div>
                <div className="empty-feature">
                  <span className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <span>Email notifications</span>
                </div>
                <div className="empty-feature">
                  <span className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3l8-8"/>
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.51 0 2.93.37 4.18 1.03"/>
                    </svg>
                  </span>
                  <span>Custom price targets</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="alerts-grid">
              {alerts.map((alert) => (
                <div key={alert.id} className="alert-card card">
                  <div className="alert-header">
                    <div className="alert-status">
                      <span className="status-indicator active"></span>
                      <span className="status-text">Active</span>
                    </div>
                    <button 
                      onClick={() => deleteAlert(alert.id)}
                      className="delete-btn"
                      title="Delete alert"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="alert-content">
                    <h3 className="product-name">{alert.product?.name || 'Product'}</h3>
                    
                    <div className="price-info">
                      <div className="target-price">
                        <span className="label">Target Price</span>
                        <span className="price">₹{alert.targetPrice?.toLocaleString()}</span>
                      </div>
                      <div className="current-price">
                        <span className="label">Current Price</span>
                        <span className="price">₹{alert.product?.currentPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="alert-meta">
                      <span className="email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        {alert.email}
                      </span>
                      <span className="created-date">
                        Created {new Date(alert.createdAt).toLocaleDateString()}
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

export default AlertsPage;