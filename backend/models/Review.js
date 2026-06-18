const mongoose = require('mongoose');

// Define the schema for a Product Review and Rating
const reviewSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true // Index for fast lookup by product name
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    minlength: [2, 'User name must be at least 2 characters long'],
    maxlength: [50, 'User name cannot exceed 50 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating must be at most 5 stars'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer value'
    }
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [3, 'Comment must be at least 3 characters long'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound unique index to prevent a user from submitting multiple reviews for the same product
reviewSchema.index({ productName: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
