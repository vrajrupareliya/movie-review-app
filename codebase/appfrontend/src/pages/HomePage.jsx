import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// A simple MovieCard component (can be moved to components/ later)
function MovieCard({ movie }) {
  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    margin: '0.5rem',
    width: '200px',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  };
  const imgStyle = {
    width: '100%',
    height: '280px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '0.5rem',
  };
  return (
    <div style={cardStyle}>
      <Link to={`/movies/${movie._id}`}>
        <img 
          src={movie.posterUrl || `https://placehold.co/200x280/60A5FA/FFFFFF?text=${encodeURIComponent(movie.title)}`} 
          alt={movie.title} 
          style={imgStyle} 
          onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/200x280/60A5FA/FFFFFF?text=${encodeURIComponent(movie.title)}`; }}
        />
        <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>{movie.title}</h3>
      </Link>
      <p style={{ fontSize: '0.9rem', color: '#555' }}>{movie.releaseYear}</p>
      {movie.averageRating > 0 && (
        <p style={{ fontSize: '0.9rem', color: 'orange' }}>⭐ {movie.averageRating.toFixed(1)}/5 ({movie.reviewCount} reviews)</p>
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
        // Assuming your backend has a /movies/popular or similar endpoint
        // If not, adjust to a general /movies endpoint
        const response = await api.get('/movies/popular'); // Or just '/movies' if popular isn't implemented
        setMovies(response.data.data || []); // Adjust based on your API response structure
      } catch (err) {
        console.error("Failed to fetch movies:", err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <div>Loading movies...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Welcome to CineLog!</h1>
      {isAuthenticated && user && <p>Hello, {user.username}! Ready to log some films?</p>}
      
      <h2>Popular Movies</h2>
      {movies.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {movies.map(movie => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : (
        <p>No movies to display at the moment.</p>
      )}
    </div>
  );
}

export default HomePage;