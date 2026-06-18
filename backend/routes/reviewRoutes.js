const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  getReviewsSummary,
  addReview,
  editReview,
  deleteReview
} = require('../controllers/reviewController');

// Get rating/reviews summaries for all products (bulk fetch)
router.route('/summary')
  .get(getReviewsSummary);

// Get reviews for a specific product OR Add a new review
router.route('/')
  .get(getProductReviews)
  .post(addReview);

// Edit or Delete an individual review
router.route('/:id')
  .put(editReview)
  .delete(deleteReview);

module.exports = router;
