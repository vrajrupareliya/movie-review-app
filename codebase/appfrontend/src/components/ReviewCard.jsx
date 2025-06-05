import React from 'react';
import { Link } from 'react-router-dom';

// Basic Star Rating Display Component
const StarRatingDisplay = ({ rating }) => {
  const totalStars = 5;
  let stars = [];
  for (let i = 1; i <= totalStars; i++) {
    if (i <= rating) {
      stars.push(<span key={i} style={{ color: 'orange' }}>★</span>);
    } else if (i - 0.5 === rating) {
      stars.push(<span key={i} style={{ color: 'orange' }}>☆</span>); // Or a half-star icon
    } else {
      stars.push(<span key={i} style={{ color: 'lightgray' }}>★</span>);
    }
  }
  return <div>{stars} <span style={{marginLeft: '0.3rem', fontSize: '0.9em'}}>({rating}/5)</span></div>;
};


function ReviewCard({ review }) {
  const cardStyle = {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f9f9f9',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  };

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const userLinkStyle = {
    fontWeight: 'bold',
    textDecoration: 'none',
    color: '#333',
    marginLeft: '0.5rem',
  };

  const dateStyle = {
    fontSize: '0.8rem',
    color: '#777',
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={userInfoStyle}>
          {review.user?.profilePictureUrl && ( // Check if user and profilePictureUrl exist
             <img 
                src={review.user.profilePictureUrl} 
                alt={review.user.username} 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
             />
          )}
          <Link to={`/users/${review.user?._id}`} style={userLinkStyle}> 
            {review.user?.username || 'Anonymous'}
          </Link>
        </div>
        <StarRatingDisplay rating={review.rating} />
      </div>
      <p style={{ marginBottom: '0.5rem' }}>{review.comment}</p>
      <p style={dateStyle}>Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</p>
      {/* Add Edit/Delete buttons here if the review belongs to the logged-in user */}
    </div>
  );
}

export default ReviewCard;