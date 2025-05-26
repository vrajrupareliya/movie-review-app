import { ApiError } from "../utils/ApiError.js" 
import {asynchandler} from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { User } from "../models/user.models.js";
import { Review } from "../models/review.models.js";
import { Movie } from "../models/movie.models.js";


/*
 * @desc    Get all reviews for a movie OR get all reviews in the system
 * @route   GET /api/v1/movies/:movieId/reviews
 * @route   GET /api/v1/reviews
 * @access  Public
 */

const getReviews = asynchandler( async (req, res, next) => {
  try {
    let query;
    let queryFilter = {};

    if (req.params.movieId) {
      // If a movieId is provided, filter reviews for that specific movie
      queryFilter.movie = req.params.movieId;
    }
    // If no movieId, queryFilter remains empty, fetching all reviews (e.g., for /api/v1/reviews)

    // --- PAGINATION ---
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 reviews per page
    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit; // Not directly needed for query, but useful for metadata

    const totalReviews = await Review.countDocuments(queryFilter); // Get total count matching the filter

    query = Review.find(queryFilter)
      .populate({
        path: 'user',
        select: 'username profilePicture' // Added profilePicture for richer display
      })
      .populate({ // Optionally populate movie details if getting all reviews
        path: 'movie',
        select: 'title posterUrl'
      })
      .sort({ createdAt: -1 }) // Sort by newest reviews first
      .skip(startIndex)
      .limit(limit);

    const reviews = await query;

    // --- PAGINATION METADATA ---
    const pagination = {};
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: limit
      };
    }
    if (page * limit < totalReviews) {
      pagination.next = {
        page: page + 1,
        limit: limit
      };
    }
    
    const totalPages = Math.ceil(totalReviews / limit);

    res.status(200).json(
      new ApiResponse(200, {
        message: 'Reviews fetched successfully',
        success: true,
        count: reviews.length, // Count of reviews in the current page
        totalCount: totalReviews, // Total reviews matching the filter
        pagination,
        currentPage: page,
        totalPages: totalPages,
        data: reviews
      })
  );
  } catch (err) {
    console.error('Error in getReviews:', err);
    throw new ApiError(500, 'Server Error');
  }
});

/*
* @desc    Get a single review by its ID
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
const getReview = asynchandler( async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id).populate({
            path: 'user',
            select: 'username profilePicture' // Added profilePicture
        }).populate({
            path: 'movie',
            select: 'title posterUrl'
        });

        if (!review) {
            throw new ApiError(404, `No review found with the id of ${req.params.id}`);
        }

        res.status(200).json(
          new ApiResponse(200, {
            success: true,
            data: review
          })
        );
    } catch (err) {
        console.error('Error in getReview:', err);
        // Check if it's a CastError (invalid ObjectId format)
        if (err.name === 'CastError') {
             throw new ApiError(400, 'Invalid review ID format');
        }
        throw new ApiError(500, 'Server Error');
    }
});





/**
 * @desc    Add a new review to a movie
 * @route   POST /api/v1/movies/:movieId/reviews
 * @access  Private (requires login)
 */
// This function remains the same as before.
const addReview = asynchandler( async (req, res, next) => {
  try {
    req.body.movie = req.params.movieId;
    req.body.user = req.user.id; 

    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      throw new ApiError(404, `No movie with the id of ${req.params.movieId}`);
    }
    
    const existingReview = await Review.findOne({ movie: req.params.movieId, user: req.user.id });
    if(existingReview) {
      throw new ApiError(400, 'You have already reviewed this movie.');
    }

    const review = await Review.create(req.body);

    res.status(201).json(
      new ApiResponse(201, {
      message: 'Review added successfully',
      success: true,
      data: review
    })
    );
  } catch (err) {
    console.error('Error in addReview:', err);
    if (err.code === 11000) { // Duplicate key error code
        throw new ApiError(400, 'You have already submitted a review for this movie.');
    }
    if (err.name === 'ValidationError') {
        throw new ApiError(400, Object.values(err.errors).map(val => val.message).join(', '));
    }
    throw new ApiError(500, 'Server Error');
  }
});

/**
 * @desc    Update a review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
const updateReview = asynchandler( async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            throw new ApiError(404, `No review with the id of ${req.params.id}`);
        }

        // Make sure the user is the review owner
        // We use .toString() because review.user is an ObjectId and req.user.id is a string
        if (review.user.toString() !== req.user.id) {
            throw new ApiError(401, 'Not authorized to update this review');
        }

        // Only allow updating rating and comment
        if (req.body.rating !== undefined) {
            review.rating = req.body.rating;
        }
        if (req.body.comment !== undefined) {
            review.comment = req.body.comment;
        }
        
        // Explicitly run validators
        await review.validate();
        await review.save();

        res.status(200).json(
            new ApiResponse(200, {
                success: true,
                data: review
            })
        );
    } catch (err) {
        console.error('Error in updateReview:', err);
        if (err.name === 'ValidationError') {
            throw new ApiError(400, Object.values(err.errors).map(val => val.message).join(', '));
        }
        if (err.name === 'CastError') {
            throw new ApiError(400, 'Invalid review ID format');
        }
        throw new ApiError(500, 'Server Error');
    }
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
const deleteReview = asynchandler(async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            throw new ApiError(404, `No review with the id of ${req.params.id}`);
        }

        // Make sure user is review owner
        if (review.user.toString() !== req.user.id) {
            throw new ApiError(401, 'Not authorized to delete this review');
        }

        // Using .remove() will trigger the 'remove' hook in our model,
        // which correctly recalculates the average rating.
        await review.deleteOne();

        res.status(200).json(
          new ApiResponse(200, {
            success: true,
            data: {},
            message: 'Review deleted successfully.'
        })
        );
    } catch (err) {
        console.error('Error in deleteReview:', err);
        if (err.name === 'CastError') {
            throw new ApiError(400, 'Invalid review ID format');
        }
        throw new ApiError(500, 'Server Error');
    }
});


export { 

  
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
};
