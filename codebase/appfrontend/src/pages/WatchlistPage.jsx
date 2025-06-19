import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MovieCard } from './HomePage'; // Assuming MovieCard is exported from HomePage or its own file
import { Link } from 'react-router-dom';

function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, updateUserContext } = useAuth(); // Get user and method to update context

  const fetchWatchlist = useCallback(async () => {
    if (!user) { // Ensure user is loaded before fetching watchlist
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users/me/watchlist');
      setWatchlist(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch watchlist:", err);
      setError('Failed to load watchlist. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user]); // Depend on user object

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleRemoveFromWatchlist = async (movieIdToRemove) => {
    try {
      await api.delete(`/users/me/watchlist/${movieIdToRemove}`);
      setWatchlist(prevWatchlist => prevWatchlist.filter(movie => movie._id !== movieIdToRemove));
      await updateUserContext(); // Refresh user context to update watchlist array in AuthContext
      alert('Movie removed from watchlist.');
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
      alert(`Error removing from watchlist: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading && !user) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading user data...</div>;
  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading watchlist...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '3rem' }}>{error}</div>;

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>My Watchlist</h1>
      {watchlist.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {watchlist.map(movie => (
            <MovieCard 
              key={movie._id} 
              movie={movie} 
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              showRemoveButton={true}
            />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center' }}>Your watchlist is empty. <Link to="/">Browse movies</Link> to add some!</p>
      )}
    </div>
  );
}

export default WatchlistPage;