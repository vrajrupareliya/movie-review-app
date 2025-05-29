import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js" 
import { User } from "../models/user.models.js";
import { Review } from "../models/review.models.js";
import { Movie } from "../models/movie.models.js";
import { Follow } from "../models/follow.models.js";
import { uplodeoncloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";



const generateAccessandRefrshToken = (async(userId) => {

        try {
              const user = await User.findById(userId)
              const accessToken = user.generateAccessToken()
              const refreshToken = user.generateRefreshToken()
              
              //const tokenn = generateAccessToken(userId);
              //console.log("Generated Token:", tokenn); // Log the token



              user.refreshToken = refreshToken
              await user.save({validateBeforeSave: false})
              return {accessToken, refreshToken}


            } catch (error) {
            throw new ApiError(500," something went wrong while generating access and refresh token")
        }

})

 const registerUser = asynchandler(async(req, res) => {

        //get user details
        //check user has apropiate details
        //check : is user already existed[username, email]
        //check user avatar images        
        //upload themm on cloudinary // avtar
        // creat user object , crea user entry in db
        // remove password and refreshtoken field from reponse

    const {fullname, email, username, password,} = req.body
    console.log("email:", email);

    if (
        [fullname, email ,username ,password].some((fields) => fields?.trim === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }

  const existedUser = await User.findOne({
        $or: [{username}, {email}]
   })

   if (existedUser) {
        throw new ApiError(409, "Username or Email existed")
   }

   const profilePictureUrlLocalPath = req.files?.avatar[0]?.path;
   //const coverImagelocalpath = req.files?.coverImage[0]?.path;
   
   let coverImagelocalpath;
   if (req.files && Array.isArray(req.files.coverImage) && req.fields.coverImage.lenght > 0) {
      coverImagelocalpath = req.files.coverImage[0].path
   }

   console.log(":", req.files);

   if (!profilePictureUrlLocalPath) {
        throw new ApiError(400, "profile picture file is reqiured")
   }


  const profilePictureUrl = await uplodeoncloudinary(profilePictureUrlLocalPath)
  const coverImage = await uplodeoncloudinary(coverImagelocalpath)

  if (!profilePictureUrl) {
        throw new ApiError(400, "profile picture filed is reqired")
  }

  const user = await User.create({
    fullname,
    profilePictureUrl: profilePictureUrl.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  
})
console.log("User:", user);

const createdUser = await User.findById(user._id).select("-password -refreshToken")
  if (!createdUser) {
     throw new ApiError(500, "something went wrong while registering user")
  }

  return res.status(201).json(
        new ApiResponse(200, createdUser ,"user Registerd Successfully ")
  )
})

const loginUser = asynchandler(async(req, res) => {

  // take data from req.body
  // login via username or email
  // find user
  // check password
  // accees and refresh token
  // send cookies

  const {username, email ,password} = req.body

  if (!username && !email) {
     throw new ApiError(401, "username or password are reqired")
  }
  
 const user = await User.findOne({
    $or: [{username}, {email}]
  })

if (!user) {
  throw new ApiError(404,"user does not exist")
}

const validpassword = await user.isPasswordCorrect(password)

  if (!validpassword) {
    throw new ApiError(402, "invalid user credencials")
  }

  const{accessToken, refreshToken} = await generateAccessandRefrshToken(user._id)

  const loginUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)  
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200,{
          user: loginUser, accessToken, refreshToken
        },
      "user loggedin sucessfully"
    )
)
})

const logoutUser = asynchandler(async(req, res) => {
    User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken: undefined
        }
      },
      {
        new:true
      },
    )
    const options = {
      httpOnly: true,
      secure: true
    }
    return res
  .status(200)  
  .cookie("accessToken", options)
  .cookie("refreshToken", options)
  .json(
    new ApiResponse(200,{},"user logout sucessfully")
)
    
})
  

/*
 * @desc    Get public profile of a user by ID
 * @route   GET /api/v1/users/:userId
 * @access  Public
 */
const getUserProfile = asynchandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
                           .select("-password"); // Exclude password

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json(
      new ApiResponse(200, {
        success: true,
        data: user
      })
    );
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    if (err.name === 'CastError') {
      throw new ApiError(400, "Invalid user ID format");
    }
    throw new ApiError(500, "Server Error");
  }
});


/*
 * @desc    Get current logged-in user's profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
const getMe = asynchandler(async (req, res, next) => {
  try {
    // req.user is set by the 'protect' middleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
        // This case should ideally not happen if protect middleware is working
        throw new ApiError(404, "User not found");
    }
    
    res.status(200).json(
      new ApiResponse(200, {
        success: true,
        data: user
      })
    );
  } catch (err) {
    console.error('Error in getMe:', err);
    throw new ApiError(500, "Server Error");
  }
});

/*
 * @desc    Update current logged-in user's profile
 * @route   PUT /api/v1/users/me/update  (or PUT /api/v1/users/update for consistency)
 * @access  Private
 */
const updateUserProfile = asynchandler(async (req, res, next) => {
  try {
    const { username, email, bio, profilePictureUrl, location } = req.body;

    // Fields to update
    const fieldsToUpdate = {};
    if (username) fieldsToUpdate.username = username;
    if (email) fieldsToUpdate.email = email; // Consider email verification flow if changed
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (profilePictureUrl) fieldsToUpdate.profilePictureUrl = profilePictureUrl;
    if (location !== undefined) fieldsToUpdate.location = location;
    
    // Prevent password updates through this route for security
    // Password updates should have their own dedicated route and logic (e.g., confirm old password)
    if (req.body.password) {
        throw new ApiError(400, "Password cannot be updated through this route.");
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true, // Return the updated document
      runValidators: true // Run schema validators
    }).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json(
      new ApiResponse(200, {
        success: true,
        data: user
      })
    );
  } catch (err) {
    console.error("Error in updateUserProfile:", err);
    if (err.code === 11000) { // Duplicate key error (e.g., username or email already exists)
        throw new ApiError(400, "Username or email already taken.");
    }
    if (err.name === "ValidationError") {
        throw new ApiError(400, Object.values(err.errors).map(val => val.message).join(", "));
    }
    throw new ApiError(500, "Server Error");
  }
});

/*
 * @desc    Get all reviews written by a specific user
 * @route   GET /api/v1/users/:userId/reviews
 * @access  Public
 */
const getUserReviews = asynchandler(async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404,"user not found");
    }

    // --- PAGINATION ---
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const totalReviews = await Review.countDocuments({ user: userId });

    const reviews = await Review.find({ user: userId })
      .populate({
          path: 'movie', // Populate movie details for each review
          select: 'title posterUrl releaseYear averageRating'
      })
      .sort({ createdAt: -1 }) // Newest reviews first
      .skip(startIndex)
      .limit(limit);

    const pagination = {};
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }
    if (page * limit < totalReviews) {
      pagination.next = { page: page + 1, limit };
    }
    const totalPages = Math.ceil(totalReviews / limit);

    res.status(200).json(
      new ApiResponse(200, {
        success: true,
        count: reviews.length,
        totalCount: totalReviews,
        pagination,
        currentPage: page,
        totalPages,
        data: reviews
      })
    );
  } catch (err) {
    console.error("Error in getUserReviews:", err);
    if (err.name === "CastError" && err.path === "_id") {
        throw new ApiError(400, "Invalid user ID format");
    }
    throw new ApiError(500, "Server Error");
  }
});


/*
 * @desc    Add a movie to the logged-in user's watchlist
 * @route   POST /api/v1/users/me/watchlist/:movieId
 * @access  Private
 */
const addToWatchlist = asynchandler(async (req, res, next) => {
  try {
    const movieId = req.params.movieId;
    const userId = req.user.id;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new ApiError(404, "Movie not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      // Should not happen if protect middleware is working
      throw new ApiError(404, "User not found");
    }

    // Check if movie is already in watchlist
    if (user.watchlist.includes(movieId)) {
      throw new ApiError(400, "Movie already in watchlist");
    }

    user.watchlist.push(movieId);
    await user.save();

    res.status(200).json(
      new ApiResponse(200,{
      success: true,
      message: 'Movie added to watchlist',
      data: user.watchlist // Return the updated watchlist
    })
  );
}  catch (err) {
    console.error('Error in addToWatchlist:', err);
    if (err.name === 'CastError') {
      throw new ApiError(400, "Invalid movie ID format");
    }
    throw new ApiError(500, "Server error");
  }
});


/*
 * @desc    Remove a movie from the logged-in user's watchlist
 * @route   DELETE /api/v1/users/me/watchlist/:movieId
 * @access  Private
 */
const removeFromWatchlist = asynchandler(async (req, res, next) => {
  try {
    const movieId = req.params.movieId;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check if movie is in watchlist
    const movieIndex = user.watchlist.indexOf(movieId);
    if (movieIndex === -1) {
      throw new ApiError(404, "Movie not found in watchlist");
    }

    user.watchlist.splice(movieIndex, 1); // Remove the movie
    await user.save();

    res.status(200).json(
      new ApiResponse(200, {
      success: true,
      message: 'Movie removed from watchlist',
      data: user.watchlist // Return the updated watchlist
    })
  );
  } catch (err) {
    console.error('Error in removeFromWatchlist:', err);
    if (err.name === "CastError") {
      throw new ApiError(400, "Invalid movie ID format");
    }
    throw new ApiError(500, "Server error"); 
  }
});

/*
 * @desc    Get the logged-in user's watchlist
 * @route   GET /api/v1/users/me/watchlist
 * @access  Private
 */
const getWatchlist = asynchandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'watchlist', // Populate the movie details for each item in watchlist
        select: 'title posterUrl releaseYear averageRating genres director' // Select desired movie fields
      })
      .select('watchlist'); // Only select the watchlist field from the user

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json(
      new ApiResponse(200, {
      success: true,
      count: user.watchlist.length,
      data: user.watchlist
    })
  );
  } catch (err) {
    console.error('Error in getWatchlist:', err);
    throw new ApiError(500, "Server error");
  }
});


/*
 * @desc    Get the logged-in user's film diary (reviews sorted by creation date)
 * @route   GET /api/v1/users/me/diary
 * @access  Private
 */
const getDiary = asynchandler(async (req, res, next) => {
  try {
    const userId = req.user.id;

    // --- PAGINATION ---
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const totalEntries = await Review.countDocuments({ user: userId });

    // The core logic is the same as getUserReviews, as a diary is a view of reviews.
    // We ensure it's sorted by createdAt to reflect the logging date.
    const diaryEntries = await Review.find({ user: userId })
      .populate({
          path: 'movie',
          select: 'title posterUrl releaseYear'
      })
      .sort({ createdAt: -1 }) // Sort by newest entries first
      .skip(startIndex)
      .limit(limit);

    const pagination = {};
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }
    if (page * limit < totalEntries) {
      pagination.next = { page: page + 1, limit };
    }
    const totalPages = Math.ceil(totalEntries / limit);

    res.status(200).json(
      new ApiResponse(200, {
      message: 'Diary entries fetched successfully',
      success: true,
      count: diaryEntries.length,
      totalCount: totalEntries,
      pagination,
      currentPage: page,
      totalPages,
      data: diaryEntries
    })
  );

  } catch (err) {
    console.error("Error in getDiary:", err);
    throw new ApiError(500, "Server Error");
  }
});


/*
 * @desc    Get the activity feed for the logged-in user
 * @route   GET /api/v1/users/me/feed
 * @access  Private
 */
const getFeed = asynchandler(async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;

    // 1. Find all users the current user is following
    const followingRelationships = await Follow.find({ follower: loggedInUserId }).select('following');
    
    if (!followingRelationships || followingRelationships.length === 0) {
      return res.status(200).json(
        new ApiResponse(200,{
        success: true,
        message: "You are not following anyone yet. Follow users to see their activity.",
        count: 0,
        totalCount: 0,
        data: []
      })
  );
 }

    // Extract the IDs of the users being followed
    const followedUserIds = followingRelationships.map(rel => rel.following);

    // 2. Find reviews from these followed users
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Filter reviews where the 'user' is in the list of followedUserIds
    const feedQuery = { user: { $in: followedUserIds } };
    
    const totalFeedItems = await Review.countDocuments(feedQuery);

    const feedItems = await Review.find(feedQuery)
      .populate({
        path: 'user', // User who wrote the review
        select: 'username profilePictureUrl'
      })
      .populate({
        path: 'movie', // Movie that was reviewed
        select: 'title, posterUrl, releaseYear'
      })
      .sort({ createdAt: -1 }) // Newest activities first
      .skip(startIndex)
      .limit(limit);

    const pagination = {};
    if (startIndex > 0) { pagination.prev = { page: page - 1, limit }; }
    if (page * limit < totalFeedItems) { pagination.next = { page: page + 1, limit }; }
    const totalPages = Math.ceil(totalFeedItems / limit);

    res.status(200).json(
      new ApiResponse(200, {
      message: 'Feed items fetched successfully',
      success: true,
      count: feedItems.length,
      totalCount: totalFeedItems,
      pagination,
      currentPage: page,
      totalPages,
      data: feedItems
    })
  );

  } catch (err) {
    console.error('Error in getFeed:', err);
    throw new ApiError(500,"Server Error");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  getMe,
  updateUserProfile,
  getUserReviews,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  getDiary,
  getFeed

}
