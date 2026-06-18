const mongoose = require('mongoose');
const Review = require('../models/Review');

/**
 * @desc    Fetch reviews for a specific product and calculate average rating
 * @route   GET /reviews
 * @access  Public
 */
const getProductReviews = async (req, res) => {
  try {
    const { productName } = req.query;

    if (!productName) {
      return res.status(400).json({ message: 'Product name query parameter is required' });
    }

    // Find all reviews matching the product name, sorted by newest first
    const reviews = await Review.find({ productName: productName.trim() }).sort({ createdAt: -1 });

    // Calculate dynamic average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = Number((sum / reviews.length).toFixed(1));
    }

    res.status(200).json({
      productName: productName.trim(),
      averageRating,
      totalReviews: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error in getProductReviews:', error.message);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

/**
 * @desc    Fetch average ratings and review counts for all products
 * @route   GET /reviews/summary
 * @access  Public
 */
const getReviewsSummary = async (req, res) => {
  try {
    const summaries = await Review.aggregate([
      {
        $group: {
          _id: '$productName',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    // Format the aggregation output
    const formattedSummaries = summaries.map((item) => ({
      productName: item._id,
      averageRating: Number(item.averageRating.toFixed(1)),
      totalReviews: item.totalReviews
    }));

    res.status(200).json(formattedSummaries);
  } catch (error) {
    console.error('Error in getReviewsSummary:', error.message);
    res.status(500).json({ message: 'Failed to fetch reviews summary' });
  }
};

/**
 * @desc    Add a review for a product
 * @route   POST /reviews
 * @access  Public
 */
const addReview = async (req, res) => {
  try {
    const { productName, userId, userName, rating, comment } = req.body;

    // 1. Validation: check presence of required fields
    if (!productName || !userId || !userName || rating === undefined || !comment) {
      return res.status(400).json({ message: 'All fields (productName, userId, userName, rating, comment) are required' });
    }

    const trimmedComment = comment.trim();
    const trimmedUserName = userName.trim();

    // 2. Validation: check types and constraints
    if (typeof trimmedUserName !== 'string' || trimmedUserName.length < 2 || trimmedUserName.length > 50) {
      return res.status(400).json({ message: 'User name must be between 2 and 50 characters long' });
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    if (typeof trimmedComment !== 'string' || trimmedComment.length < 3 || trimmedComment.length > 1000) {
      return res.status(400).json({ message: 'Comment must be between 3 and 1000 characters long' });
    }

    // 3. Validation: check if the user has already reviewed this product
    const existingReview = await Review.findOne({
      productName: productName.trim(),
      userId: userId.trim()
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // 4. Create and save new review
    const newReview = new Review({
      productName: productName.trim(),
      userId: userId.trim(),
      userName: trimmedUserName,
      rating: ratingNum,
      comment: trimmedComment
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error in addReview:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    res.status(500).json({ message: error.message || 'Failed to submit review' });
  }
};

/**
 * @desc    Edit an existing review
 * @route   PUT /reviews/:id
 * @access  Public (authorized by userId check)
 */
const editReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, comment } = req.body;

    // 1. Validation: check review ID is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid review ID format' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required for authorization' });
    }

    // 2. Fetch the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // 3. Authorization check
    if (review.userId !== userId.trim()) {
      return res.status(403).json({ message: 'You are not authorized to edit this review' });
    }

    // 4. Input validation (optional updates, but we expect rating and comment)
    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
      }
      review.rating = ratingNum;
    }

    if (comment !== undefined) {
      const trimmedComment = comment.trim();
      if (typeof trimmedComment !== 'string' || trimmedComment.length < 3 || trimmedComment.length > 1000) {
        return res.status(400).json({ message: 'Comment must be between 3 and 1000 characters long' });
      }
      review.comment = trimmedComment;
    }

    // 5. Save the updated review
    const updatedReview = await review.save();
    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Error in editReview:', error.message);
    res.status(500).json({ message: 'Failed to update review' });
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /reviews/:id
 * @access  Public (authorized by userId check)
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    // Accept userId from either body or query parameter (since DELETE calls often don't have bodies)
    const userId = req.body.userId || req.query.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid review ID format' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required for authorization' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Authorization check
    if (review.userId !== userId.trim()) {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(id);
    res.status(200).json({ message: 'Review deleted successfully', id });
  } catch (error) {
    console.error('Error in deleteReview:', error.message);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};

module.exports = {
  getProductReviews,
  getReviewsSummary,
  addReview,
  editReview,
  deleteReview
};
