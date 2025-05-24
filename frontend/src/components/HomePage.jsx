import React, { useState } from 'react';
import './HomePage.css';

function HomePage({ onTrack }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://price-pulse-os14.onrender.com/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.product_id) {
        onTrack(data.product_id);
      } else {
        setError(data.error || 'Failed to track product.');
      }
    } catch {
      setError('Server error.');
    }
    setLoading(false);
  };

  return (
      <div className="main-bg">
        <div className="home-container">
          <h1 className="main-title">Amazon Product Tracker</h1>
          <p className="subtitle">Track any Amazon product and get notified when the price drops!</p>
          <form onSubmit={handleSubmit} className="track-form">
            <input
                type="url"
                placeholder="Paste Amazon product URL"
                value={url}
                onChange={e => setUrl(e.target.value)}
                required
                className="animated-input"
            />
            <button type="submit" disabled={loading} className="animated-btn">
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </form>
          {error && <div className="error">{error}</div>}
        </div>
      </div>
  );
}

export default HomePage;