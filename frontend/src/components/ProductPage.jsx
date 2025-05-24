import React, { useEffect, useState } from 'react';
import './ProductPage.css';

function ProductPage({ productId}) {
  const [product, setProduct] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/product/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      });
  }, [productId]);

  const handleAlert = async (e) => {
    e.preventDefault();
    setMsg('');
    const res = await fetch('http://localhost:8000/api/alert', {
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
          ) : product ? (
              <>
                <h2 className="product-title">{product.name}</h2>
                <div className="product-details-flex">
                  <img src={product.image} alt="Product" className="product-img-large" />
                  <div className="graph-container">
                    <h3>Price History (30 min intervals)</h3>
                    <img src={`data:image/png;base64,${product.chart}`} alt="Price Chart" className="chart-img enhanced-graph" />
                  </div>
                </div>
                <div className="price">Current Price: <span>₹{product.price?.toLocaleString()}</span></div>

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
              <div className="error">Product not found.</div>
          )}
        </div>
      </div>

  );
}

export default ProductPage;