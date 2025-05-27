import { Router } from "express";
import { loginUser, 
    logoutUser, 
    registerUser, 
    getUserProfile, 
    getMe, 
    updateUserProfile, 
    getUserReviews,
    addToWatchlist,
    removeFromWatchlist,
    getWatchlist,
    getDiary
} from "../controllers/user.controllers.js";

import {followUser, 
    unfollowUser,
    getFollowers,
    getFollowing} from "../controllers/follow.controllers.js";

import { upload } from "../middleweres/multer.middlewere.js";
import { verifyJWT } from "../middleweres/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "profilePictureUrl",
            maxCount: 1
        },
        {
            name: "coverImage", 
            maxCount: 1
        }
    ]),registerUser)

router.route("/login").post(loginUser)

// srecured routes
router.route("/logout").post(verifyJWT ,logoutUser)


// Public route to get any user's profile
router.route("/:userId").get(getUserProfile);

// Public route to get all reviews by a specific user
router.route("/:userId/reviews").get(getUserReviews)

// Private routes for the logged-in user
router.route("/me/profile").get(verifyJWT, getMe) // Changed from /me to /me/profile for clarity

router.route("/me/update").put(verifyJWT, updateUserProfile); // Changed from /me to /me/update

router.route('/me/watchlist').get(verifyJWT, getWatchlist);
router.route('/me/watchlist/:movieId').post(verifyJWT, addToWatchlist);
router.route('/me/watchlist/:movieId').delete(verifyJWT, removeFromWatchlist);

// diary route
router.route('/me/diary').get(verifyJWT, getDiary);

// Follow routes
router.route('/:userIdToFollow/follow').post(verifyJWT, followUser);
router.route('/:userIdToUnfollow/unfollow').delete(verifyJWT, unfollowUser);
router.route('/:userId/followers').get(getFollowers); // Publicly viewable
router.route('/:userId/following').get(getFollowing); // Publicly viewable



export default router;
