import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
// We'll create these page components soon
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import MovieDetailPage from './pages/MovieDetailPage';
// import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <>
      {/* Basic Navbar Example - We will replace this with a proper Navbar component later */}
      <nav style={{ padding: '1rem', background: '#eee', marginBottom: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
        <Link to="/register">Register</Link>
        {/* We'll add more links here as we build pages */}
      </nav>

      <div className="container" style={{ padding: '0 1rem' }}>
        {/* Define Your Application Routes Here */}
        <Routes>
          {/* Example routes (we will create these page components next):
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/movies/:movieId" element={<MovieDetailPage />} />
            <Route path="*" element={<NotFoundPage />} /> // Fallback for 404
          */}
          <Route path="/" element={<div>Welcome to the Home Page! (Content TBD)</div>} />
          <Route path="/login" element={<div>Login Page (Content TBD)</div>} />
          <Route path="/register" element={<div>Register Page (Content TBD)</div>} />
        </Routes>
      </div>
    </>
  );
}

export default App;