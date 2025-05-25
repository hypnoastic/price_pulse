import React from 'react';
import './Navbar.css'; // You can create a separate CSS file for navbar styling
import { auth } from '../firebase';

const Navbar = ({ goHome, user }) => {
  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={goHome} style={{ cursor: 'pointer' }}>
        Price Pulse
      </div>
      {user && (
        <div className="navbar-user">
          <span style={{ marginRight: '10px' }}>{user.displayName}</span>
          <button onClick={handleLogout} style={{ padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
