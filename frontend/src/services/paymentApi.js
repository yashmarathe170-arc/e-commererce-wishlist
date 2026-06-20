import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/payments';

/**
 * Initiate a payment by creating a backend order and a payment intent.
 * @param {Object} orderData - { userId, items }
 */
export const createPaymentOrderApi = async (orderData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create`, orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to create payment order');
  }
};

/**
 * Verify payment signature on the backend.
 * @param {Object} verifyData - { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, status, errorMessage }
 */
export const verifyPaymentApi = async (verifyData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify`, verifyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to verify payment');
  }
};

/**
 * Fetch transaction/payment logs for a specific user.
 * @param {string} userId
 */
export const fetchPaymentHistoryApi = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/history/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch payment history');
  }
};
