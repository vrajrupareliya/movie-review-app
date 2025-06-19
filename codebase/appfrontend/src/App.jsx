import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom'; 
import { useAuth } from './context/AuthContext';

// Import Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MovieDetailPage from './pages/MovieDetailPage'; 
import UserProfilePage from './pages/UserProfilePage'; 
import WatchlistPage from './pages/WatchlistPage'; 

// We'll create these later
// import FeedPage from './pages/FeedPage';
// import DiaryPage from './pages/DiaryPage';
// import UserSettingsPage from './pages/UserSettingsPage.jsx'; 

function App() {
  const { loading, isAuthenticated } = useAuth(); // Removed user from here as it's not needed for routing logic

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading application...
      </div>
    );
  }

  return (
    <>
      <Navbar /> 
      <main className="container" style={{ padding: '0 1rem', marginTop: '1rem', maxWidth: '1200px', margin: '1.5rem auto' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />
          <Route path="/movies/:movieId" element={<MovieDetailPage />} /> 
          <Route path="/users/:userId" element={<UserProfilePage />} /> 


          {/* Protected Routes */}
          <Route 
            path="/feed" 
            element={<ProtectedRoute><div>Your Activity Feed (Protected)</div></ProtectedRoute>} 
          />
          <Route 
            path="/diary" 
            element={<ProtectedRoute><div>Your Film Diary (Protected)</div></ProtectedRoute>} 
          />
          <Route 
            path="/watchlist" 
            element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} 
          />
          <Route 
            path="/profile/me" 
            element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} 
          />
          {/* <Route path="/profile/me/edit" element={<ProtectedRoute><UserSettingsPage /></ProtectedRoute>} /> */}


          <Route path="*" element={<div><h2>404 - Page Not Found</h2><Link to="/">Go Home</Link></div>} />
        </Routes>
      </main>
    </>
  );
}

export default App;