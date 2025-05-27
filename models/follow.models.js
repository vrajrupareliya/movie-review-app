
import mongoose, { Schema } from "mongoose";

const followSchema = new Schema({
  // The user who is performing the follow action
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The user who is being followed
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt
});

// Prevent duplicate follow relationships
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Static method to update follower/following counts on the User model
followSchema.statics.updateUserCounts = async function(userIdToUpdate, type) {
  const User = mongoose.model('User'); // Avoid circular dependency issues by requiring here
  try {
    if (type === 'follow') {
      // Increment followingCount for the follower & followersCount for the one being followed
      await User.findByIdAndUpdate(this.follower, { $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(this.following, { $inc: { followersCount: 1 } });
    } else if (type === 'unfollow') {
      // Decrement followingCount for the follower & followersCount for the one being followed
      await User.findByIdAndUpdate(this.follower, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(this.following, { $inc: { followersCount: -1 } });
    }
  } catch (error) {
    console.error('Error updating user counts:', error);
  }
};


// Hooks to update counts when a follow relationship is created or removed
// Note: For 'save', 'this' refers to the document being saved.
followSchema.post('save', async function(doc, next) {
  const User = mongoose.model('User');
  try {
    // Increment followingCount for the follower
    await User.findByIdAndUpdate(doc.follower, { $inc: { followingCount: 1 } });
    // Increment followersCount for the user being followed
    await User.findByIdAndUpdate(doc.following, { $inc: { followersCount: 1 } });
  } catch (error) {
    console.error('Error updating user counts after follow save:', error);
    // Decide if you want to propagate the error or just log it
  }
  next();
});


// Hooks to update counts when a follow relationship is created or removed
// Note: For 'save', 'this' refers to the document being saved.
followSchema.post('save', async function(doc, next) {
  const User = mongoose.model('User');
  try {
    // Increment followingCount for the follower
    await User.findByIdAndUpdate(doc.follower, { $inc: { followingCount: 1 } });
    // Increment followersCount for the user being followed
    await User.findByIdAndUpdate(doc.following, { $inc: { followersCount: 1 } });
  } catch (error) {
    console.error('Error updating user counts after follow save:', error);
    // Decide if you want to propagate the error or just log it
  }
  next();
});

export const Follow = mongoose.model('Follow', followSchema);