// Import the Wishlist model
const Wishlist = require('../models/Wishlist');

/**
 * @desc    Fetch all wishlist items
 * @route   GET /wishlist
 * @access  Public
 */
const getWishlist = async (req, res) => {
  try {
    // Find all documents in the wishlists collection and sort them (newest first)
    const items = await Wishlist.find().sort({ createdAt: -1 });
    
    // Return the list of items with a 200 OK status
    res.status(200).json(items);
  } catch (error) {
    console.error('Error in getWishlist:', error.message);
    res.status(500).json({ message: 'Something went wrong while fetching the wishlist' });
  }
};

/**
 * @desc    Add a product to the wishlist
 * @route   POST /wishlist
 * @access  Public
 */
const addToWishlist = async (req, res) => {
  try {
    const { productName, price } = req.body;

    // Validation: Make sure fields are provided
    if (!productName || price === undefined) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }

    // Step 1: Prevent duplicates by checking if an item with the same name already exists
    // We do a case-insensitive match or standard match. Let's use trim and standard check.
    const existingItem = await Wishlist.findOne({ 
      productName: { $regex: new RegExp(`^${productName.trim()}$`, 'i') } 
    });

    if (existingItem) {
      // If it exists, return a 400 Bad Request with a clear message for the toast notification
      return res.status(400).json({ message: 'Already Exists' });
    }

    // Step 2: Create a new Wishlist document
    const newItem = new Wishlist({
      productName: productName.trim(),
      price: Number(price)
    });

    // Step 3: Save to the database
    const savedItem = await newItem.save();

    // Return the newly created item with a 201 Created status
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error in addToWishlist:', error.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * @desc    Remove an item from the wishlist
 * @route   DELETE /wishlist/:id
 * @access  Public
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Find and delete the item by its MongoDB ID
    const deletedItem = await Wishlist.findByIdAndDelete(id);

    // Step 2: If the item wasn't found, return 404 Not Found
    if (!deletedItem) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    // Step 3: Return success response
    res.status(200).json({ message: 'Removed Successfully', id });
  } catch (error) {
    console.error('Error in removeFromWishlist:', error.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Export the controller methods so they can be linked to routes
module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
