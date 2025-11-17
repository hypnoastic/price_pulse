import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import ProductPage from './components/ProductPage';
import AlertsPage from './components/AlertsPage';
import SavedItemsPage from './components/SavedItemsPage';
import { LoginPage, SignUpPage } from './components/AuthPages';
import LandingPage from './components/LandingPage';
import GoogleCallback from './components/GoogleCallback';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [productId, setProductId] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user and token
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProductId(null);
  };

  const goHome = () => {
    setProductId(null);
    setCurrentPage('dashboard');
  };

  const navigateToPage = (page) => {
    setProductId(null);
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={user ? <Navigate to="/home" /> : <SignUpPage onSignUp={handleLogin} />} />
          <Route path="/auth/callback" element={<GoogleCallback onLogin={handleLogin} />} />
          <Route path="/home" element={user ? (
            <>
              <Navbar 
                goHome={goHome} 
                user={user} 
                onLogout={handleLogout}
                currentPage={currentPage}
                onNavigate={navigateToPage}
              />
              {productId ? (
                <ProductPage productId={productId} goHome={goHome} user={user} />
              ) : currentPage === 'dashboard' ? (
                <HomePage onTrack={setProductId} goHome={goHome} user={user} />
              ) : currentPage === 'alerts' ? (
                <AlertsPage />
              ) : currentPage === 'saved' ? (
                <SavedItemsPage onTrack={setProductId} />
              ) : (
                <HomePage onTrack={setProductId} goHome={goHome} user={user} />
              )}
            </>
          ) : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;