import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// MovieCard component - consider moving to components/MovieCard.jsx
function MovieCard({ movie, onRemoveFromWatchlist, showRemoveButton = false }) { // Added props
  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    margin: '0.5rem',
    width: '200px',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };
  const imgStyle = {
    width: '100%',
    height: '280px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '0.5rem',
  };
  const removeButtonStyle = {
    marginTop: '0.5rem',
    padding: '0.5rem 0.8rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem'
  };

  return (
    <div style={cardStyle}>
      <Link to={`/movies/${movie._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <img 
            src={movie.posterUrl || `https://placehold.co/200x280/60A5FA/FFFFFF?text=${encodeURIComponent(movie.title)}`} 
            alt={movie.title} 
            style={imgStyle} 
            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/200x280/60A5FA/FFFFFF?text=${encodeURIComponent(movie.title)}`; }}
          />
          <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</h3>
        <p style={{ fontSize: '0.9rem', color: '#555' }}>{movie.releaseYear}</p>
        {movie.averageRating > 0 && (
          <p style={{ fontSize: '0.9rem', color: 'orange' }}>⭐ {movie.averageRating.toFixed(1)} ({movie.reviewCount} reviews)</p>
        )}
      </Link>
      {showRemoveButton && onRemoveFromWatchlist && (
        <button onClick={() => onRemoveFromWatchlist(movie._id)} style={removeButtonStyle}>
          Remove
        </button>
      )}
    </div>
  );
}


function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/movies/popular'); 
        setMovies(response.data.data || []); 
      } catch (err) {
        console.error("Failed to fetch movies:", err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading movies...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '3rem'  }}>{error}</div>;

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Welcome to CineLog!</h1>
      {isAuthenticated && user && <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Hello, {user.username}! Ready to log some films?</p>}
      
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Popular Movies</h2>
      {movies.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {movies.map(movie => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center' }}>No popular movies to display at the moment.</p>
      )}
    </div>
  );
}


export default HomePage;
export { MovieCard }; 