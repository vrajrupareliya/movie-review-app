import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Basic styling for the navbar
  const navStyle = {
    background: '#333',
    color: '#fff',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  };

  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    marginRight: '1rem',
  };

  const buttonStyle = {
    background: '#f44336',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={{ ...linkStyle, fontSize: '1.5rem', fontWeight: 'bold' }}>CineLog</Link>
        {isAuthenticated && <Link to="/feed" style={linkStyle}>Feed</Link>}
        {isAuthenticated && <Link to="/diary" style={linkStyle}>My Diary</Link>}
        {isAuthenticated && <Link to="/watchlist" style={linkStyle}>Watchlist</Link>}
      </div>
      <div>
        {isAuthenticated ? (
          <>
            <Link to="/profile/me" style={linkStyle}>
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt={user.username} style={{width: '30px', height: '30px', borderRadius: '50%', marginRight: '0.5rem', verticalAlign: 'middle'}} />
              ) : null}
              {user?.username || 'Profile'}
            </Link>
            <button onClick={handleLogout} style={buttonStyle}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;