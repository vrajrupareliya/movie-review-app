import { Router } from "express";
import { searchMoviesController,
  getMovieDetailsController,
  getPopularMoviesController, } from "../controllers/movie.controllers.js";


const router = Router();

// Route to search for movies in our DB
router.route("/search").get(searchMoviesController); // e.g., /api/movies/search?query=dark

// Route to get a list of "popular" movies from our DB
router.route("/popular").get(getPopularMoviesController);

// Route to get a single movie's details by its MongoDB ID
// IMPORTANT: This must be the last GET route to avoid matching 'search' or 'popular' as an ID.
router.route("/:id").get(getMovieDetailsController);

export default router;
