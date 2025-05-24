import { searchMovies } from '../middleweres/services.middleware.js';
//import movieService from '../services/movieService.js';
import { getPopularMovies } from '../middleweres/services.middleware.js';
import { getMovieDetails } from '../middleweres/services.middleware.js';

import {ApiError} from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asynchandler } from '../utils/asynchandler.js';


// Search movies controller
const searchMoviesController = asynchandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    throw new ApiError(400, 'Search query is required.');
  }
  try {
    const data = await searchMovies(query);
    res.status(200).json(
        new ApiResponse(200, data, 'Movies fetched successfully')
    );
  } catch (error) {
    next(error);
  }
});

// Get movie details controller
const getMovieDetailsController = asynchandler(async (req, res) => {
  try {
    const data = await getMovieDetails(req.params.id);
    if (!data) {
        return next(new ApiError(404, 'Movie not found with that ID'));
    }
    res.status(200).json(new ApiResponse(200, data, 'Movie fetched successfully'));
  } catch (error) {
    // This will catch invalid MongoDB ObjectId errors as well
    next(error);
  }
});

// Get popular movies controller
const getPopularMoviesController = asynchandler(async (req, res) => {
  try {
    const data = await getPopularMovies();
    res.status(200).json(new ApiResponse(200, data, 'Popular movies fetched successfully'));
  } catch (error) {
    
next(error);
  }
});

export {
  searchMoviesController,
  getMovieDetailsController,
  getPopularMoviesController,
};