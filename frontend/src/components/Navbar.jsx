import React from 'react';
import './Navbar.css';

const Navbar = ({ goHome, user, onLogout, currentPage, onNavigate }) => {
  return (
    <nav className="app-navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-left">
            <div className="navbar-brand" onClick={goHome}>
              <span className="brand-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                </svg>
              </span>
              <span className="brand-text">PricePulse</span>
            </div>
            
            <div className="navbar-nav">
              <button 
                onClick={() => onNavigate('dashboard')} 
                className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
              >
                <span className="nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </span>
                Dashboard
              </button>
              <button 
                onClick={() => onNavigate('alerts')} 
                className={`nav-item ${currentPage === 'alerts' ? 'active' : ''}`}
              >
                <span className="nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </span>
                Alerts
              </button>
              <button 
                onClick={() => onNavigate('saved')} 
                className={`nav-item ${currentPage === 'saved' ? 'active' : ''}`}
              >
                <span className="nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </span>
                Saved Items
              </button>
            </div>
          </div>
          
          <div className="navbar-right">
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.name || 'User'}</span>
                  <span className="user-email">{user?.email}</span>
                </div>
              </div>
              
              <button onClick={onLogout} className="logout-btn">
                <span className="logout-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;