import { ApiError } from "../utils/ApiError.js";

// services/movieService.js
// UPDATED: This service now interacts with our own database via the Movie model.

import { Movie } from "../models/movie.models.js"; // Import our new Movie model

/**
 * Searches for movies in our local database.
 * @param {string} query - The search term for the movie title.
 * @returns {Promise<Array>} - An array of movies matching the query.
 */
const searchMovies = async (query) => {
  try {
    // Use a regular expression for a case-insensitive search
    const movies = await Movie.find({ title: { $regex: query, $options: 'i' } });
    return movies;
  } catch (error) {
    //console.error('Error searching movies in database:', error.message);
    throw new ApiError(500, 'Failed to search movies.');
  }
};

/**
 * Fetches details for a specific movie from our database by its ID.
 * @param {string} movieId - The MongoDB ObjectId of the movie.
 * @returns {Promise<Object>} - The movie object.
 */
const getMovieDetails = async (movieId) => {
  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new Error('Movie not found.');
    }
    return movie;
  } catch (error) {
    //console.error(`Error fetching movie details for ID ${movieId}:`, error.message);
    throw new ApiError(404, 'Movie not found.');
  }
};

/**
 * Fetches all movies, simulating a "popular" list.
 * We can make this more complex later (e.g., sort by ratings).
 * @returns {Promise<Array>} - An array of all movies, sorted by release year.
 */
const getPopularMovies = async () => {
  try {
    const movies = await Movie.find({}).sort({ releaseYear: -1 });
    return movies;
  } catch (error) {
    //console.error('Error fetching popular movies from database:', error.message);
    throw new ApiError(500, 'Failed to fetch popular movies.');
  }
};


export {
  searchMovies,
  getMovieDetails,
  getPopularMovies,
};
