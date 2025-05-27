import { User } from "../models/user.models.js";
import { Follow } from "../models/follow.models.js";

import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import e from "express";

/*
 * @desc    Follow a user
 * @route   POST /api/v1/users/:userIdToFollow/follow
 * @access  Private
 */
const followUser = asynchandler(async (req, res, next) => {
  const userIdToFollow = req.params.userIdToFollow;
  const followerId = req.user.id; // Logged-in user

  try {
    // Check if user to follow exists
    const userToFollow = await User.findById(userIdToFollow);
    if (!userToFollow) {
      throw new ApiError(404, "User to follow not found");
    }

    // User cannot follow themselves
    if (userIdToFollow === followerId) {
      throw new ApiError(400, "You cannot follow yourself");
    }

    // Check if already following
    const existingFollow = await Follow.findOne({ follower: followerId, following: userIdToFollow });
    if (existingFollow) {
      throw new ApiError(400, "Already following this user");
    }

    // Create the follow relationship
    const follow = await Follow.create({
      follower: followerId,
      following: userIdToFollow,
    });
    
    // The post('save') hook on Follow model will handle count updates.

    res.status(201).json(
        new ApiResponse(201, {
      success: true,
      message: `Successfully followed ${userToFollow.username}`,
      data: follow
    })
  );

  } catch (err) {
    console.error('Error in followUser:', err);
    if (err.code === 11000) { // Duplicate key error (should be caught by findOne check)
        throw new ApiError(400, "Already following this user (concurrent request).");
    }
    throw new ApiError(500, "Server Error");
  }
});


/*
 * @desc    Unfollow a user
 * @route   DELETE /api/v1/users/:userIdToUnfollow/unfollow
 * @access  Private
 */
const unfollowUser = asynchandler(async (req, res, next) => {
  const userIdToUnfollow = req.params.userIdToUnfollow;
  const followerId = req.user.id; // Logged-in user

  try {
    // Check if user to unfollow exists
    const userToUnfollow = await User.findById(userIdToUnfollow);
    if (!userToUnfollow) {
      throw new ApiError(404, "User to unfollow not found");
    }
    
    // Find and delete the follow relationship
    const followRelationship = await Follow.findOneAndDelete({
      follower: followerId,
      following: userIdToUnfollow,
    });

    if (!followRelationship) {
      throw new ApiError(404, "You are not following this user");
    }

    // Manually decrement counts after successful deletion
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(userIdToUnfollow, { $inc: { followersCount: -1 } });


    res.status(200).json(
        new ApiResponse(200, {
      success: true,
      message: `Successfully unfollowed ${userToUnfollow.username}`,
    })
  );

  } catch (err) {
    console.error('Error in unfollowUser:', err);
    throw new ApiError(500, "Server Error");
  }
});


/*
 * @desc    Get a user's followers
 * @route   GET /api/v1/users/:userId/followers
 * @access  Public
 */
const getFollowers = asynchandler(async (req, res, next) => {
  const userId = req.params.userId;
  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const totalFollowers = await Follow.countDocuments({ following: userId });

    const follows = await Follow.find({ following: userId })
      .populate({
        path: 'follower', // Get the profile of the user who is following
        select: 'username profilePictureUrl bio followersCount followingCount',
      })
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    const followers = follows.map(follow => follow.follower); // Extract follower profiles

    const pagination = {};
    if (startIndex > 0) { pagination.prev = { page: page - 1, limit }; }
    if (page * limit < totalFollowers) { pagination.next = { page: page + 1, limit }; }
    const totalPages = Math.ceil(totalFollowers / limit);

    res.status(200).json(
        new ApiResponse(200, {
      message: `Followers of ${user.username}`,
      success: true,
      count: followers.length,
      totalCount: totalFollowers,
      pagination,
      currentPage: page,
      totalPages,
      data: followers,
    })
  );
  } catch (err) {
    console.error('Error in getFollowers:', err);
    if (err.name === 'CastError') {
        throw new ApiError(400, "Invalid user ID format");
    }
    throw new ApiError(500, "Server Error");
  }
});



/*
 * @desc    Get users a user is following
 * @route   GET /api/v1/users/:userId/following
 * @access  Public
 */
const getFollowing = asynchandler(async (req, res, next) => {
  const userId = req.params.userId;
  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404,"User not found");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const totalFollowing = await Follow.countDocuments({ follower: userId });

    const follows = await Follow.find({ follower: userId })
      .populate({
        path: 'following', // Get the profile of the user being followed
        select: 'username profilePictureUrl bio followersCount followingCount',
      })
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });
      
    const following = follows.map(follow => follow.following); // Extract followed profiles

    const pagination = {};
    if (startIndex > 0) { pagination.prev = { page: page - 1, limit }; }
    if (page * limit < totalFollowing) { pagination.next = { page: page + 1, limit }; }
    const totalPages = Math.ceil(totalFollowing / limit);

    res.status(200).json(
        new ApiResponse(200, {
      message: `Users followed by ${user.username}`,
      success: true,
      count: following.length,
      totalCount: totalFollowing,
      pagination,
      currentPage: page,
      totalPages,
      data: following,
    })
  );
  } catch (err) {
    console.error('Error in getFollowing:', err);
     if (err.name === 'CastError') {
        throw new ApiError(400, "Invalid user ID format");
    }
    throw new ApiError(500, "Server Error");
  }
});





export { 
    followUser, 
    unfollowUser,
    getFollowers,
    getFollowing
};