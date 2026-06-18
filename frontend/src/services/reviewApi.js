import axios from 'axios';

// Backend API URL for reviews (running on port 5000)
const API_BASE_URL = 'http://localhost:5000/reviews';

/**
 * Fetch reviews for a specific product by product name
 * @param {string} productName 
 * @returns {Promise<Object>} Object containing reviews, averageRating, totalReviews
 */
export const fetchProductReviews = async (productName) => {
  const response = await axios.get(API_BASE_URL, {
    params: { productName }
  });
  return response.data;
};

/**
 * Fetch reviews summary (average rating and review count) for all products
 * @returns {Promise<Array>} List of product review summaries
 */
export const fetchReviewsSummary = async () => {
  const response = await axios.get(`${API_BASE_URL}/summary`);
  return response.data;
};

/**
 * Add a new review for a product
 * @param {Object} reviewData - { productName, userId, userName, rating, comment }
 * @returns {Promise<Object>} Saved review object
 */
export const addReview = async (reviewData) => {
  const response = await axios.post(API_BASE_URL, reviewData);
  return response.data;
};

/**
 * Edit an existing review
 * @param {string} reviewId 
 * @param {Object} reviewData - { userId, rating, comment }
 * @returns {Promise<Object>} Updated review object
 */
export const editReview = async (reviewId, reviewData) => {
  const response = await axios.put(`${API_BASE_URL}/${reviewId}`, reviewData);
  return response.data;
};

/**
 * Delete a review
 * @param {string} reviewId 
 * @param {string} userId - User ID to authorize deletion
 * @returns {Promise<Object>} Deletion result
 */
export const deleteReview = async (reviewId, userId) => {
  const response = await axios.delete(`${API_BASE_URL}/${reviewId}`, {
    params: { userId }
  });
  return response.data;
};
