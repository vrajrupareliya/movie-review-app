import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard'; 

const StarRatingInput = ({ rating, setRating }) => {
  const totalStars = 5;
  return (
    <div>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={starValue}
            style={{
              cursor: 'pointer',
              color: starValue <= rating ? 'orange' : 'lightgray',
              fontSize: '1.8rem',
              marginRight: '0.2rem'
            }}
            onClick={() => setRating(starValue)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};


function MovieDetailPage() {
  const { movieId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // For redirecting after login if trying to watchlist

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState('');
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchMovieData = useCallback(async () => {
    setLoadingMovie(true);
    try {
      const movieRes = await api.get(`/movies/${movieId}`);
      setMovie(movieRes.data.data);
    } catch (err) {
      console.error("Failed to fetch movie details:", err);
      setError('Failed to load movie details.');
    } finally {
      setLoadingMovie(false);
    }
  }, [movieId]);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      // *** UPDATED API CALL for fetching reviews for a movie ***
      // Assuming backend route is /api/v1/reviews/getReviews?movieId=YOUR_MOVIE_ID
      const reviewsRes = await api.get(`/movies/reviews/${movieId}/reviews`,

        {
          params: { movieId }
      });
   // ✅ Extract only the array
    const reviewsArray = reviewsRes?.data?.data?.data;

    // ✅ Correct check
    if (!Array.isArray(reviewsArray)) {
      console.error("Expected array, but got:", reviewsArray); // ✅ FIXED LINE
      setReviews([]);
      return;
    }

    // ✅ Sort and store
    const sortedReviews = reviewsArray.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setReviews(sortedReviews);
  } catch (err) {
    console.error("Failed to fetch reviews:", err.response?.data || err.message);
  } finally {
    setLoadingReviews(false);
  }
}, [movieId]);

  useEffect(() => {
    fetchMovieData();
    fetchReviews();
  }, [fetchMovieData, fetchReviews]);

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    const isInWatchlist = user?.watchlist?.some(item => item === movieId || item._id === movieId);
    try {
      if (isInWatchlist) {
        await api.delete(`/users/me/watchlist/${movieId}`);
        alert(`${movie.title} removed from watchlist.`);
        // TODO: Update user context more gracefully
      } else {
        await api.post(`/users/me/watchlist/${movieId}`);
        alert(`${movie.title} added to watchlist.`);
      }
    } catch (err) {
      console.error("Watchlist error:", err);
      alert(`Error updating watchlist: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) {
      setReviewError("Please select a rating.");
      return;
    }
    setReviewError('');
    setIsSubmittingReview(true);
    try {
      // *** UPDATED API CALL for submitting a review ***
      // Assuming backend route is /api/v1/reviews/YOUR_MOVIE_ID/addReview
      await api.post(`/movies/reviews/${movieId}/addReview`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment('');
      setReviewRating(0);
      setShowReviewForm(false);
      fetchReviews(); 
      fetchMovieData(); 
    } catch (err) {
      console.error("Failed to submit review:", err.response?.data || err.message);
      setReviewError(err.response?.data?.error || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  const alreadyReviewed = reviews.some(review => review.user?._id === user?._id);


  if (loadingMovie) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading movie details...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '3rem'  }}>{error}</div>;
  if (!movie) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Movie not found.</div>;

  const detailPageStyle = {
    display: 'flex',
    flexDirection: 'column', 
    gap: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
  };
  const movieInfoStyle = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start', 
  };
  const posterStyle = {
    width: '300px',
    height: 'auto', 
    maxHeight: '450px',
    objectFit: 'cover',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  };
  const textInfoStyle = {
    flex: 1, 
  };
  const actionsStyle = {
    marginTop: '1rem',
    display: 'flex',
    gap: '1rem',
  };
  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  };


  return (
    <div style={detailPageStyle}>
      <div style={movieInfoStyle}>
        <img 
            src={movie.posterUrl || `https://placehold.co/300x450/ccc/FFFFFF?text=${encodeURIComponent(movie.title)}`} 
            alt={movie.title} 
            style={posterStyle}
            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/300x450/ccc/FFFFFF?text=${encodeURIComponent(movie.title)}`; }}
        />
        <div style={textInfoStyle}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{movie.title} ({movie.releaseYear})</h1>
          {movie.averageRating > 0 && (
             <p style={{ fontSize: '1.2rem', color: 'orange', marginBottom: '0.5rem' }}>
                ⭐ {movie.averageRating.toFixed(1)}/5 ({movie.reviewCount} reviews)
             </p>
          )}
          <p style={{ marginBottom: '0.5rem' }}><strong>Director:</strong> {movie.director}</p>
          <p style={{ marginBottom: '0.5rem' }}><strong>Genres:</strong> {movie.genres?.join(', ')}</p>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}><strong>Synopsis:</strong> {movie.synopsis}</p>
          {movie.cast && movie.cast.length > 0 && (
            <p style={{ marginBottom: '1rem' }}><strong>Cast:</strong> {movie.cast.join(', ')}</p>
          )}

          {isAuthenticated && (
            <div style={actionsStyle}>
              <button 
                onClick={handleWatchlistToggle} 
                style={{...buttonStyle, backgroundColor: '#007bff', color: 'white'}}
              >
                {user?.watchlist?.some(item => item === movieId || item._id === movieId) ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </button>
              {!alreadyReviewed && (
                 <button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    style={{...buttonStyle, backgroundColor: '#28a745', color: 'white'}}
                 >
                    {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                 </button>
              )}
               {alreadyReviewed && (
                <p style={{alignSelf: 'center', color: 'green'}}>You've reviewed this film!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {isAuthenticated && showReviewForm && !alreadyReviewed && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Write Your Review</h3>
          {reviewError && <p style={{ color: 'red' }}>{reviewError}</p>}
          <form onSubmit={handleReviewSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Rating:</label>
              <StarRatingInput rating={reviewRating} setRating={setReviewRating} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="comment">Comment:</label>
              <textarea
                id="comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows="4"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
              />
            </div>
            <button type="submit" disabled={isSubmittingReview} style={{...buttonStyle, backgroundColor: '#17a2b8', color: 'white'}}>
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      <div className="reviews-section" style={{ marginTop: '2rem' }}>
        <h2>Reviews</h2>
        {loadingReviews && <p>Loading reviews...</p>}
        {!loadingReviews && reviews.length === 0 && <p>No reviews yet. Be the first!</p>}
        {!loadingReviews && reviews.length > 0 && (
          <div>
            {reviews.map(review => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetailPage;