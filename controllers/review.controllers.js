import { ApiError } from "../utils/ApiError.js" 
import {asynchandler} from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Review } from "../models/review.models.js";
import { Movie } from "../models/movie.models.js";



const addReview = asynchandler (async (req, res, next) => {
  try {
    // Manually set movie and user IDs
    req.body.movie = req.params.movieId;
    req.body.user = req.user.id; // from our 'protect' middleware

    // Check if the movie exists
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      throw new ApiError(404, `No movie with the id of ${req.params.movieId}`);
    }
    
    // Check if the user has already reviewed this movie
    const existingReview = await Review.findOne({ movie: req.params.movieId, user: req.user.id });
    if(existingReview) {
      throw new ApiError(400, 'You have already reviewed this movie.');
    }

    // Create the new review
    const review = await Review.create(req.body);

    res.status(201).json(
        new ApiResponse(201, {
          success: true,
          data: review
        })
    );
  } catch (err) {
    // This will catch validation errors or the unique index error
    console.error(err);
    if (err.code === 11000) { // Duplicate key error code
        throw new ApiError(400, 'You have already submitted a review for this movie.');
    }
    throw new ApiError(400, err.message);
  }
});

export { addReview };
