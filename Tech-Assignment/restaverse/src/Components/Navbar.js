// Navbar.js
import React from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import Cookies from 'js-cookie';
import './Navbar.css'; // Create a separate CSS file for Navbar styling

const Navbar = ({ isLoggedIn, user, screenWidth, onLoginSuccess, onLoginFailure, handleLogout }) => {
  return (
    <header className="app-header">
      <h1>Google Integration Portal</h1>
      <div className="auth-buttons">
        {!isLoggedIn ? (
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={onLoginFailure}
          />
        ) : (
          <div className="user-info">
            <span>{user?.name}</span>
            {screenWidth < 480 ? (
              <img
                onClick={handleLogout}
                src="https://cdn-icons-png.flaticon.com/512/4034/4034229.png"
                style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                alt="Logout Icon"
              />
            ) : (
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;