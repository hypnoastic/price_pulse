import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="auth-bg">
      <div className="landing-container">
        <h1 className="landing-title">Price Pulse</h1>
        <p className="landing-info">
          Track Amazon products and get notified when prices drop.<br />
          Sign up to start tracking your favorite products and never miss a deal!
        </p>
        <div className="landing-btn-group">
          <button onClick={() => navigate('/login')} className="auth-btn landing-btn">Login</button>
          <button onClick={() => navigate('/signup')} className="auth-btn landing-btn">Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
