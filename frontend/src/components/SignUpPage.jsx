import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';

function SignUpPage({ onSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      onSignUp(result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <h2 className="auth-title">Create your Price Pulse account</h2>
        <form onSubmit={handleSignUp} className="auth-form">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="auth-input" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="auth-input" />
          <button type="submit" className="auth-btn">Sign Up</button>
        </form>
        <div className="auth-switch">
          Already have an account?{' '}
          <button type="button" className="auth-link" onClick={() => navigate('/login')}>Sign In</button>
        </div>
        {error && <div className="auth-error">{error}</div>}
      </div>
    </div>
  );
}

export default SignUpPage;
