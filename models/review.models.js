import mongoose, { Schema } from "mongoose";
import {asynchandler} from "../utils/asynchandler.js";


const reviewSchema = new Schema({

            rating: {
                type: Number,
                min: 0, // A rating of 0 could signify "no rating" or be the lowest score
                max: 5, // Maximum 5-star rating
                required: [true, 'Please provide a rating between 0 and 5.'],
            },
            comment: {
                type: String,
                trim: true,
                maxlength: 5000,
            },
            movie: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Movie', // Establishes a relationship with the Movie model
                required: true,
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Establishes a relationship with the User model
                required: true,
            },
        }, 
            {
            timestamps: true, // Adds createdAt and updatedAt timestamps
    });

// Prevent a user from submitting more than one review per movie
// This creates a compound index of movie and user, and they must be unique together.
reviewSchema.index({ Movie: 1, User: 1 }, { unique: true });


// Static method to calculate the average rating for a movie
reviewSchema.statics.calculateAverageRating =asynchandler( async function(movieId) {
  // 1. Log when the function is called
  console.log(`[Hook] Calculating average rating for movie ID: ${movieId}`);

  try {
    const stats = await this.aggregate([
      {
        $match: { movie: movieId }
      },
      {
        $group: {
          _id: '$movie',
          numReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    // 2. Log the result of the aggregation
    console.log('[Hook] Aggregation stats:', stats);

    if (stats.length > 0) {
      const updateData = {
        averageRating: stats[0].avgRating.toFixed(1), // Round to one decimal place
        reviewCount: stats[0].numReviews
      };

      // 3. Log what we are about to update the movie with
      console.log('[Hook] Updating movie with:', updateData);
      
      await mongoose.model('Movie').findByIdAndUpdate(movieId, updateData);

      // 4. Log after a successful update
      console.log('[Hook] Movie update successful.');

    } else {
      // This case runs if there are no more reviews for the movie
      console.log('[Hook] No reviews found. Resetting movie stats.');
      await mongoose.model('Movie').findByIdAndUpdate(movieId, {
        averageRating: 0,
        reviewCount: 0
      });
    }
  } catch (err) {
    // 5. Log any error that occurs during the process
    console.error('[Hook] Error during rating calculation:', err);
  }
});

// Hook to call calculateAverageRating after a review is saved
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.movie);
});

// Hook to call calculateAverageRating after a review is removed
reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.movie);
});

export const Review = mongoose.model('Review', reviewSchema)