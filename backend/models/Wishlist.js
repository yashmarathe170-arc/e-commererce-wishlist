// Import mongoose library
const mongoose = require('mongoose');

// Define the schema (blueprint) for a Wishlist item
const wishlistSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    unique: true // Ensure duplicate items cannot be saved
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set the date and time when the item is added
  }
});

// Compile and export the Mongoose model based on the schema
// Mongoose will automatically map 'Wishlist' to a MongoDB collection named 'wishlists'
module.exports = mongoose.model('Wishlist', wishlistSchema);
