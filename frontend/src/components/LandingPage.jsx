import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Floating Navbar */}
      <nav className="floating-navbar">
        <div className="container">
          <div className="navbar-content">
            <div className="navbar-brand">
              <span className="brand-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                </svg>
              </span>
              <span className="brand-text">PricePulse</span>
            </div>
            
            <div className="navbar-links">
              <a href="#home" className="nav-link">Home</a>
              <a href="#features" className="nav-link">Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#contact" className="nav-link">Contact</a>
            </div>
            
            <div className="navbar-actions">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text fade-in">
              <h1 className="hero-title">
                Track Prices. Save Money. <br />
                <span className="gradient-text">Shop Smarter.</span>
              </h1>
              <p className="hero-subtitle">
                PricePulse monitors prices across major e-commerce platforms and alerts you instantly when the price drops.
              </p>
              <div className="hero-actions">
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Get Started — It's Free
                  <span className="btn-arrow">→</span>
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Login
                </Link>
              </div>
            </div>
            
            <div className="hero-visual slide-in">
              <div className="dashboard-mockup">
                <div className="mockup-header">
                  <div className="mockup-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="mockup-content">
                  <div className="price-card">
                    <div className="product-info">
                      <div className="product-image"></div>
                      <div className="product-details">
                        <h4>iPhone 15 Pro</h4>
                        <div className="price-info">
                          <span className="current-price">₹89,999</span>
                          <span className="price-drop">-12% ↓</span>
                        </div>
                      </div>
                    </div>
                    <div className="price-chart">
                      <svg viewBox="0 0 200 60" className="chart-svg">
                        <path d="M10,50 Q50,30 100,35 T190,20" stroke="var(--primary)" strokeWidth="2" fill="none"/>
                        <circle cx="190" cy="20" r="3" fill="var(--primary)"/>
                      </svg>
                    </div>
                  </div>
                  <div className="alert-notification">
                    <span className="notification-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                    </span>
                    <div className="notification-text">
                      <strong>Price Alert!</strong>
                      <p>MacBook dropped to ₹89,999</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header text-center mb-12">
            <h2>Everything you need to save money</h2>
            <p>Powerful features that make price tracking effortless</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card card fade-in">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                </svg>
              </div>
              <h3>Real-Time Price Tracking</h3>
              <p>Track product prices across Amazon, Flipkart, and more in real time.</p>
            </div>
            
            <div className="feature-card card fade-in">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <h3>Beautiful Price History Graphs</h3>
              <p>Understand trends with clean, interactive charts.</p>
            </div>
            
            <div className="feature-card card fade-in">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <h3>Smart Price Alerts</h3>
              <p>Set your target price — get notified instantly when it drops.</p>
            </div>
            
            <div className="feature-card card fade-in">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <h3>Multi-Store Comparison</h3>
              <p>Automatically compare prices across platforms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header text-center mb-12">
            <h2>How It Works</h2>
            <p>Get started in just 3 simple steps</p>
          </div>
          
          <div className="steps-grid">
            <div className="step-card fade-in">
              <div className="step-number">1</div>
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <h3>Paste the product link</h3>
              <p>Simply copy and paste any Amazon or Flipkart product URL</p>
            </div>
            
            <div className="step-card fade-in">
              <div className="step-number">2</div>
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <h3>View detailed price history</h3>
              <p>See comprehensive price trends and analytics</p>
            </div>
            
            <div className="step-card fade-in">
              <div className="step-number">3</div>
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <h3>Set a price alert & get notified</h3>
              <p>Receive instant notifications when prices drop</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="section-header text-center mb-12">
            <h2>Simple, transparent pricing</h2>
            <p>Choose the plan that's right for you</p>
          </div>
          
          <div className="pricing-grid">
            <div className="pricing-card card">
              <div className="pricing-header">
                <h3>Free</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">0</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>✓ Track up to 5 products</li>
                <li>✓ Basic price alerts</li>
                <li>✓ 30-day price history</li>
                <li>✓ Email notifications</li>
              </ul>
              <Link to="/signup" className="btn btn-outline w-full">Get Started</Link>
            </div>
            
            <div className="pricing-card card featured">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Pro</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">299</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>✓ Unlimited product tracking</li>
                <li>✓ Advanced price alerts</li>
                <li>✓ Complete price history</li>
                <li>✓ SMS + Email notifications</li>
                <li>✓ Price prediction AI</li>
                <li>✓ Priority support</li>
              </ul>
              <Link to="/signup" className="btn btn-primary w-full">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand">
                <span className="brand-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                </span>
                <span className="brand-text">PricePulse</span>
              </div>
              <p>Smart price tracking for smarter shopping</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#api">API</a>
              </div>
              
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#blog">Blog</a>
                <a href="#careers">Careers</a>
              </div>
              
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#contact">Contact</a>
                <a href="#status">Status</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 PricePulse. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#terms">Terms</a>
              <a href="#privacy">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;