const express = require('express');
const router = express.Router();

const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// Routes for cart
router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:id')
  .delete(removeFromCart);

module.exports = router;
