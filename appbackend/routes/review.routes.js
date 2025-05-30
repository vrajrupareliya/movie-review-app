import { Router } from "express";
import { verifyJWT } from "../middleweres/auth.middleware.js";
import { addReview, getReviews, getReview, updateReview, deleteReview } from "../controllers/review.controllers.js";

// Note: The mergeParams option allows us to access params from the parent route (e.g., movieId) in this router.
const REVIEW_ROUTER = Router({ mergeParams: true });

// Route to add a review for a movie

//REVIEW_ROUTER.route("/").post(verifyJWT, addReview);

REVIEW_ROUTER.route('/getReviews').get(getReviews); // This now supports pagination
REVIEW_ROUTER.route('/:movieId/addReview').post(verifyJWT, addReview);

// Routes for getting, updating, and deleting a single review by its own ID
REVIEW_ROUTER.route('/:id/getReview').get(getReview);
REVIEW_ROUTER.route('/:id/updateReview').put(verifyJWT, updateReview);
REVIEW_ROUTER.route('/:id/deleteReview').delete(verifyJWT, deleteReview);

export default REVIEW_ROUTER;