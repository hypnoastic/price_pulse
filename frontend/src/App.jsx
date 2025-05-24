import React, { useState } from 'react';
import Navbar from './components/Navbar';  // Import Navbar component
import HomePage from './components/HomePage';
import ProductPage from './components/ProductPage';
import './App.css';

function App() {
  const [productId, setProductId] = useState(null);

  // Function to reset productId (go home)
  const goHome = () => setProductId(null);

  return (
      <div className="app-container">
        <Navbar goHome={goHome} />

        {!productId ? (
            <HomePage onTrack={setProductId} goHome={goHome} />
        ) : (
            <ProductPage productId={productId} goHome={goHome} />
        )}
      </div>
  );
}

export default App;

