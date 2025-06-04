import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate
import { useAuth } from './context/AuthContext';
import { Link } from 'react-router-dom';

// Import Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// We'll create these later
// import MovieDetailPage from './pages/MovieDetailPage';
// import UserProfilePage from './pages/UserProfilePage';
// import FeedPage from './pages/FeedPage';
// import DiaryPage from './pages/DiaryPage';
// import WatchlistPage from './pages/WatchlistPage';

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading application...
      </div>
    );
  }

  return (
    <>
      <Navbar /> {/* Use the Navbar component */}
      <main className="container" style={{ padding: '0 1rem', marginTop: '1rem' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />
          {/* <Route path="/movies/:movieId" element={<MovieDetailPage />} /> */}
          {/* <Route path="/users/:userId" element={<UserProfilePage />} /> */}


          {/* Protected Routes examples */}
          <Route 
            path="/feed" 
            element={
              <ProtectedRoute>
                <div>Your Activity Feed (Protected)</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/diary" 
            element={
              <ProtectedRoute>
                <div>Your Film Diary (Protected)</div>
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/watchlist" 
            element={
              <ProtectedRoute>
                <div>Your Watchlist (Protected)</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/me" 
            element={
              <ProtectedRoute>
                <div>Your Profile Page (Protected)</div>
                {/* Later, replace with actual UserProfilePage for 'me' */}
              </ProtectedRoute>
            } 
          />

          /* Fallback for 404 Not Found */
          <Route path="*" element={<div><h2>404 - Page Not Found</h2><Link to="/">Go Home</Link></div>} />
        </Routes>
      </main>
    </>
  );
}

export default App;