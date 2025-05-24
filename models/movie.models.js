import mongoose, { Schema } from "mongoose";

const movieSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a movie title'],
    trim: true,
  },
  director: {
    type: String,
    required: [true, 'Please provide a director'],
    trim: true,
  },
  releaseYear: {
    type: Number,
    required: [true, 'Please provide a release year'],
  },
  genres: {
    type: [String], // An array of strings
    required: true,
    // Example: ['Drama', 'Thriller']
  },
  synopsis: {
    type: String,
    required: [true, 'Please provide a synopsis'],
  },
  posterUrl: {
    type: String,
    required: [true, 'Please provide a poster URL'],
  },
  cast: {
    type: [String], // An array of actor names
    default: [],
  },
  // You can add more fields later, like averageRating
  // averageRating: { type: Number, default: 0 }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});
export const Movie = mongoose.model('Movie', movieSchema)