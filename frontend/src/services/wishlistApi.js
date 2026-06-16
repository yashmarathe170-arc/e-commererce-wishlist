import axios from 'axios';

// The base URL of the backend server.
// If you host the backend on a different port or server, update this variable.
const API_BASE_URL = 'http://localhost:5000/wishlist';

/**
 * Fetch all items currently in the wishlist from the database.
 * @returns {Promise<Array>} Promise resolving to the list of wishlist items.
 */
export const fetchWishlistApi = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    // Re-throw the error with a customized message so the UI can catch it
    throw error.response?.data || new Error('Failed to fetch wishlist');
  }
};

/**
 * Add a new product to the wishlist in the database.
 * @param {Object} product - An object containing { productName, price }.
 * @returns {Promise<Object>} Promise resolving to the saved wishlist item document.
 */
export const addToWishlistApi = async (product) => {
  try {
    const response = await axios.post(API_BASE_URL, product);
    return response.data;
  } catch (error) {
    // Re-throw the error response data so the context can inspect error messages (like 'Already Exists')
    throw error.response?.data || new Error('Failed to add item to wishlist');
  }
};

/**
 * Remove an item from the wishlist in the database by its ID.
 * @param {string} id - The MongoDB ObjectID of the wishlist item to delete.
 * @returns {Promise<Object>} Promise resolving to the response message.
 */
export const removeFromWishlistApi = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to remove item from wishlist');
  }
};
