import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard'; 

function UserProfilePage() {
  const { userId } = useParams();
  const { user: loggedInUser, isAuthenticated, loading: authLoading, updateUserContext } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();

  const [profileUser, setProfileUser] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reviewsLimit = 5; 

  const isProfileMe = location.pathname === '/users/profile/me';

  useEffect(() => {
    const fetchAllData = async () => {
      if (authLoading) return; 

      let idToFetch;
      let profileApiUrl;

      if (isProfileMe) {
        if (loggedInUser?._id) {
          idToFetch = loggedInUser._id;
          profileApiUrl = '/users/profile/me';
        } else {
          setError("You must be logged in to view this page.");
          setLoading(false);
          return;
        }
      } else {
        idToFetch = userId;
        profileApiUrl = `/users/${userId}`;
      }

      if (!idToFetch) {
        setLoading(false);
        setError("User could not be identified.");
        return;
      }
      
      setLoading(true);
      setError('');

      try {
        const reviewsApiUrl = `/users/${idToFetch}/reviews?page=${currentPage}&limit=${reviewsLimit}`;

        const [profileResponse, reviewsResponse] = await Promise.all([
          api.get(profileApiUrl),
          api.get(reviewsApiUrl)
        ]);
        
        setProfileUser(profileResponse.data.data);
        setUserReviews(reviewsResponse.data.data || []);
        setTotalPages(reviewsResponse.data.totalPages || 1);
        setCurrentPage(reviewsResponse.data.currentPage || 1);

      } catch (err) {
        console.error("Failed to fetch user profile or reviews:", err);
        setError(err.response?.data?.error || 'Failed to load user profile.');
        setProfileUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [userId, isProfileMe, loggedInUser, authLoading, currentPage, navigate]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated || !profileUser?._id || !loggedInUser || loggedInUser._id === profileUser._id) return;
    
    const isCurrentlyFollowing = loggedInUser.following?.some(followedUser => followedUser === profileUser._id || followedUser._id === profileUser._id);

    try {
      const url = isCurrentlyFollowing ? `/users/${profileUser._id}/unfollow` : `/users/${profileUser._id}/follow`;
      const method = isCurrentlyFollowing ? 'delete' : 'post';
      
      await api[method](url); 
      alert(`Successfully ${isCurrentlyFollowing ? 'unfollowed' : 'followed'} ${profileUser.username}`);

      await updateUserContext(); 
      const response = await api.get(isProfileMe ? '/users/profile/me' : `/users/${profileUser._id}`);
      setProfileUser(response.data.data);
    } catch (err) {
      console.error("Follow/Unfollow error:", err);
      alert(`Error: ${err.response?.data?.error || 'An error occurred.'}`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage); 
    }
  };

  if (loading) {
     return <div className="text-center mt-12">Loading profile...</div>;
  }
  
  if (error) return <div className="text-red-500 text-center mt-12">{error}</div>;
  if (!profileUser) return <div className="text-center mt-12">User not found.</div>;

  const isOwnProfile = isAuthenticated && loggedInUser?._id === profileUser._id;
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-8 mb-8 p-6 bg-gray-100 rounded-lg shadow-sm">
        <img 
            src={profileUser.profilePictureUrl || `https://placehold.co/200x200/60A5FA/FFFFFF?text=User?u=${profileUser._id}`} 
            alt={profileUser.username} 
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/200x200/60A5FA/FFFFFF?text=User ?u=${profileUser.username}`;}}
        />
        <div className="flex-grow">
          <h1 className="text-4xl font-bold mb-1">{profileUser.username}</h1>
          {profileUser.bio && <p className="mb-2 text-gray-600">{profileUser.bio}</p>}
          {profileUser.location && <p className="text-sm text-gray-500">Location: {profileUser.location}</p>}
          <div className="flex gap-6 mt-2 text-gray-700">
            <span><strong>{profileUser.reviewCount || 0}</strong> Reviews</span>
            <span><strong>{profileUser.followersCount || 0}</strong> Followers</span>
            <span><strong>{profileUser.followingCount || 0}</strong> Following</span>
          </div>
          {isAuthenticated && !isOwnProfile && (
            <button 
              onClick={handleFollowToggle} 
              className={`mt-4 px-6 py-2 rounded-md font-semibold text-white transition-colors ${
                loggedInUser?.following?.some(f => f === profileUser._id || f._id === profileUser._id)
                  ? 'bg-gray-500 hover:bg-gray-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              disabled={loading}
            >
              {loggedInUser?.following?.some(f => f === profileUser._id || f._id === profileUser._id) ? 'Unfollow' : 'Follow'}
            </button>
          )}
          {isOwnProfile && (
            <Link to="/profile/me/edit" className="inline-block mt-4 px-6 py-2 rounded-md font-semibold text-white bg-gray-600 hover:bg-gray-700 transition-colors">
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-2xl font-semibold border-b-2 border-gray-200 pb-2">
          {isOwnProfile ? "My Recent Activity" : `${profileUser.username}'s Recent Activity`}
        </h2>
        
        {userReviews && userReviews.length > 0 ? (
          <div className="space-y-4">
            {userReviews.map(review => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">
            {isOwnProfile ? "You have not written any reviews yet." : "This user has not written any reviews yet."}
          </p>
        )}
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading} className="px-4 py-2 bg-gray-600 text-white rounded-md disabled:bg-gray-400">
              Previous
            </button>
            <span className="font-semibold">Page {currentPage} of {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || loading} className="px-4 py-2 bg-gray-600 text-white rounded-md disabled:bg-gray-400">
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default UserProfilePage;