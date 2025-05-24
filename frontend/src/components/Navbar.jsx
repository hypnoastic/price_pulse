import React from 'react';
import './Navbar.css'; // You can create a separate CSS file for navbar styling

const Navbar = ({ goHome }) => {
    return (
        <nav className="navbar">
            <div className="navbar-title clickable" onClick={goHome}>
                PricePulse
            </div>
        </nav>
    );
};

export default Navbar;
