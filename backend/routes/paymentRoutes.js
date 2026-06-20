const express = require('express');
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory
} = require('../controllers/paymentController');

// Route for creating a payment order (POST /payments/create)
router.post('/create', createPaymentOrder);

// Route for verifying a payment signature (POST /payments/verify)
router.post('/verify', verifyPayment);

// Route for retrieving payment history (GET /payments/history/:userId)
router.get('/history/:userId', getPaymentHistory);

module.exports = router;
