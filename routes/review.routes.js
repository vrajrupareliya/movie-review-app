import { Router } from "express";
import { verifyJWT } from "../middleweres/auth.middleware.js";
import { addReview } from "../controllers/review.controllers.js";


const REVIEW_ROUTER = Router({ mergeParams: true });
// Route to add a review for a movie
REVIEW_ROUTER.route("/").post(verifyJWT, addReview);
// Note: The mergeParams option allows us to access params from the parent route (e.g., movieId) in this router.
export default REVIEW_ROUTER;