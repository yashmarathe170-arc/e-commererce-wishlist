const express = require('express');
const router = express.Router();

const {
  placeOrder,
  getOrders,
  cancelOrder
} = require('../controllers/orderController');

// Route for placing order (POST /orders)
router.route('/')
  .post(placeOrder);

// Route for viewing user orders (GET /orders/:userId)
router.route('/:userId')
  .get(getOrders);

// Route for cancelling order (PUT /orders/cancel/:id)
router.route('/cancel/:id')
  .put(cancelOrder);

module.exports = router;
