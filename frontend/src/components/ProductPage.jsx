import React, { useEffect, useState } from 'react';
import './ProductPage.css';

function ProductPage({ productId, user }) {
  const [product, setProduct] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        if (user && productId) {
          const { getFirestore, doc, getDoc } = await import('firebase/firestore');
          const { app } = await import('../firebase');
          const db = getFirestore(app);
          const userProductRef = doc(db, 'users', user.uid, 'products', productId);
          const userProductSnap = await getDoc(userProductRef);
          if (userProductSnap.exists()) {
            const productData = userProductSnap.data();
            // Always fetch chart from backend to get latest price history (even if only one point)
            fetch(`${window.BACKEND_URL}/api/product/${productId}?uid=${user.uid}`)
              .then(res => res.json())
              .then(data => {
                setProduct({ ...productData, ...data });
                setLoading(false);
              });
            return;
          }
        }
      } catch {
        // fallback to backend
      }
      // Fallback: fetch from backend and save to Firestore for future
      fetch(`${window.BACKEND_URL}/api/product/${productId}?uid=${user ? user.uid : ''}`)
        .then(res => res.json())
        .then(async data => {
          setProduct(data);
          setLoading(false);
          // Save to Firestore for future fast access
          if (user && data && data.name) {
            const { getFirestore, doc, setDoc } = await import('firebase/firestore');
            const { app } = await import('../firebase');
            const db = getFirestore(app);
            await setDoc(doc(db, 'users', user.uid, 'products', productId), {
              product_id: productId,
              url: data.url || '',
              title: data.name,
              name: data.name,
              image: data.image || '',
              price: data.price || null
            }, { merge: true });
          }
        });
    })();
  }, [productId, user]);

  const handleAlert = async (e) => {
    e.preventDefault();
    setMsg('');
    const res = await fetch(`${window.BACKEND_URL}/api/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        target_price: parseFloat(targetPrice),
        email
      })
    });
    const data = await res.json();
    setMsg(data.message);
  };

  return (
      <div className="main-bg-prod">
        <div className="product-container">
          {loading ? (
              <div className="loader">Loading product...</div>
          ) : product && (product.name || product.title) ? (
              <>
                <h2 className="product-title">{product.name || product.title}</h2>
                <div className="product-details-flex">
                  {product.image && product.image !== 'undefined' ? (
                    <img src={product.image} alt="Product" className="product-img-large" />
                  ) : null}
                  <div className="graph-container">
                    <h3>Price History (30 min intervals)</h3>
                    {product.chart ? (
                      <img src={`data:image/png;base64,${product.chart}`} alt="Price Chart" className="chart-img enhanced-graph" />
                    ) : (
                      <div style={{color:'#888',fontSize:'1rem'}}>No price chart available.<br/>If this is a newly tracked product, the chart will appear after the next scheduled price update (within 30 minutes).</div>
                    )}
                  </div>
                </div>
                {product.price && product.price !== 'undefined' ? (
                  <div className="price">Current Price: <span>₹{product.price?.toLocaleString()}</span></div>
                ) : null}

                <form className="alert-form-inline" onSubmit={handleAlert}>
                  <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Target Price (₹)"
                      value={targetPrice}
                      onChange={e => setTargetPrice(e.target.value)}
                      required
                      className="animated-input"
                  />
                  <input
                      type="email"
                      placeholder="Your Email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="animated-input"
                  />
                  <button type="submit" className="animated-btn">Set Alert</button>
                </form>

                {msg && <div className="msg">{msg}</div>}
              </>
          ) : (
              <div className="error">Product not found or no info available.</div>
          )}
        </div>
      </div>

  );
}

export default ProductPage;