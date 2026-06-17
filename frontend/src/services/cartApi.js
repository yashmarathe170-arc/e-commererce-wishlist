import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/cart';

/**
 * Fetch all items currently in the cart from the database.
 */
export const fetchCartApi = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch cart');
  }
};

/**
 * Add a new product to the cart in the database.
 */
export const addToCartApi = async (product) => {
  try {
    const response = await axios.post(API_BASE_URL, product);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to add item to cart');
  }
};

/**
 * Remove an item from the cart in the database by its ID.
 */
export const removeFromCartApi = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to remove item from cart');
  }
};

/**
 * Clear all items in the cart in the database.
 */
export const clearCartApi = async () => {
  try {
    const response = await axios.delete(API_BASE_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to clear cart');
  }
};
