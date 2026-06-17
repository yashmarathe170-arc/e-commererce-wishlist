import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/orders';

/**
 * Place a new order.
 * @param {Object} orderData - { userId, items }
 */
export const placeOrderApi = async (orderData) => {
  try {
    const response = await axios.post(API_BASE_URL, orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to place order');
  }
};

/**
 * Fetch all orders for a specific user.
 * @param {string} userId
 */
export const fetchOrdersApi = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch orders');
  }
};

/**
 * Cancel an order by ID.
 * @param {string} orderId
 */
export const cancelOrderApi = async (orderId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/cancel/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to cancel order');
  }
};
