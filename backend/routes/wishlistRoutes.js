// Import express and create a router instance
const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/wishlistController');

// Route for getting all wishlist items and adding a new item
// GET /wishlist -> Fetch wishlist
// POST /wishlist -> Add item
router.route('/')
  .get(getWishlist)
  .post(addToWishlist);

// Route for removing a wishlist item by ID
// DELETE /wishlist/:id -> Remove item
router.route('/:id')
  .delete(removeFromWishlist);

// Export the router to be used in server.js
module.exports = router;
