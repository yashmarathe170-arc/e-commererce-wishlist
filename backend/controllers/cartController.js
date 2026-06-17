const Cart = require('../models/Cart');

/**
 * @desc    Fetch all cart items
 * @route   GET /cart
 * @access  Public
 */
const getCart = async (req, res) => {
  try {
    const items = await Cart.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error in getCart:', error.message);
    res.status(500).json({ message: 'Something went wrong while fetching the cart' });
  }
};

/**
 * @desc    Add a product to the cart
 * @route   POST /cart
 * @access  Public
 */
const addToCart = async (req, res) => {
  try {
    const { productName, price } = req.body;

    if (!productName || price === undefined) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }

    const existingItem = await Cart.findOne({
      productName: { $regex: new RegExp(`^${productName.trim()}$`, 'i') }
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Already Exists' });
    }

    const newItem = new Cart({
      productName: productName.trim(),
      price: Number(price)
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error in addToCart:', error.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * @desc    Remove an item from the cart by ID
 * @route   DELETE /cart/:id
 * @access  Public
 */
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Cart.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.status(200).json({ message: 'Removed Successfully', id });
  } catch (error) {
    console.error('Error in removeFromCart:', error.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * @desc    Clear the entire cart
 * @route   DELETE /cart
 * @access  Public
 */
const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({});
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error in clearCart:', error.message);
    res.status(500).json({ message: 'Something went wrong while clearing the cart' });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
