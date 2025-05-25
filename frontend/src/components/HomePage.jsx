import React, { useState, useEffect } from 'react';
import { getFirestore, collection, doc, setDoc, getDocs, query } from 'firebase/firestore';
import './HomePage.css';
import { app } from '../firebase';

function HomePage({ onTrack, user }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackedProducts, setTrackedProducts] = useState([]);
  const db = getFirestore(app);

  // Fetch all tracked products for the user from Firestore
  useEffect(() => {
    let intervalId;
    async function fetchTracked() {
      let attempts = 0;
      let success = false;
      while (attempts < 20 && !success) {
        try {
          const q = query(collection(db, 'users', user.uid, 'products'));
          const querySnapshot = await getDocs(q);
          const products = [];
          querySnapshot.forEach(doc => {
            products.push({ product_id: doc.id, ...doc.data() });
          });
          setTrackedProducts(products);
          success = true;
        } catch {
          // ignore error, will retry
        }
        attempts++;
        if (!success && attempts < 20) {
          await new Promise(res => setTimeout(res, 1000));
        }
      }
      if (!success) setTrackedProducts([]);
    }
    if (user) {
      fetchTracked();
      intervalId = setInterval(fetchTracked, 30 * 60 * 1000);
    }
    return () => clearInterval(intervalId);
  }, [user, db]);

  // Track a new product and store all info in Firestore, avoid duplicates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let attempts = 0;
    let success = false;
    let newProduct = null;
    // Check for duplicate by URL before tracking
    const q = query(collection(db, 'users', user.uid, 'products'));
    const querySnapshot = await getDocs(q);
    const existing = [];
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.url === url) existing.push(docSnap.id);
    });
    if (existing.length > 0) {
      setError('This product is already being tracked.');
      setLoading(false);
      return;
    }
    while (attempts < 20 && !success) {
      try {
        const res = await fetch(`${window.BACKEND_URL}/api/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, uid: user.uid })
        });
        const data = await res.json();
        if (data.product_id && data.title) {
          newProduct = { product_id: data.product_id, url, title: data.title };
          await setDoc(doc(db, 'users', user.uid, 'products', data.product_id), newProduct, { merge: true });
          success = true;
        } else {
          setError(data.error || 'Failed to track product.');
        }
      } catch {
        setError('Server error.');
      }
      attempts++;
      if (!success && attempts < 20) {
        await new Promise(res => setTimeout(res, 1000));
      }
    }
    setLoading(false);
    if (success && newProduct) {
      setUrl('');
      // Refetch all products to update the list
      const q = query(collection(db, 'users', user.uid, 'products'));
      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach(doc => {
        products.push({ product_id: doc.id, ...doc.data() });
      });
      setTrackedProducts(products);
      onTrack(newProduct.product_id);
    }
  };

  // Render tracked products as clickable boxes
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
        <div className="tracked-products">
          <h2>Tracked Products</h2>
          {trackedProducts.length === 0 ? (
            <p>No products being tracked yet.</p>
          ) : (
            <div className="tracked-products-grid">
              {trackedProducts.map(product => (
                <div
                  key={product.product_id}
                  className="tracked-product-box"
                  onClick={() => onTrack(product.product_id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="tracked-product-title">{product.title || product.url}</div>
                  {/* <div className="tracked-product-url">{product.url}</div> */}
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