import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import ProductPage from './components/ProductPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import LandingPage from './components/LandingPage';
import { auth } from './firebase';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [productId, setProductId] = useState(null);
  const [user, setUser] = useState(() => auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const goHome = () => setProductId(null);

  // Set your backend URL here for easy switching
  window.BACKEND_URL = "http://127.0.0.1:8000";

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage onLogin={setUser} />} />
          <Route path="/signup" element={user ? <Navigate to="/home" /> : <SignUpPage onSignUp={setUser} />} />
          <Route path="/home" element={user ? (
            <>
              <Navbar goHome={goHome} user={user} />
              {!productId ? (
                <HomePage onTrack={setProductId} goHome={goHome} user={user} />
              ) : (
                <ProductPage productId={productId} goHome={goHome} user={user} />
              )}
            </>
          ) : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

