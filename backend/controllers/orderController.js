const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');

/**
 * @desc    Place a new order
 * @route   POST /orders
 * @access  Public
 */
const placeOrder = async (req, res) => {
  try {
    const { userId, items } = req.body;

    // 1. Validation: Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // 2. Validation: Check if items are provided and not empty
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // 3. Validation: Validate each item structure
    let totalAmount = 0;
    for (const item of items) {
      if (!item.productName || item.price === undefined || !item.quantity) {
        return res.status(400).json({ message: 'Each item must have productName, price, and quantity' });
      }
      if (item.price < 0 || item.quantity < 1) {
        return res.status(400).json({ message: 'Invalid price or quantity' });
      }
      totalAmount += Number(item.price) * Number(item.quantity);
    }

    // 4. Create and save the Order document
    const newOrder = new Order({
      userId,
      totalAmount,
      status: 'Placed'
    });
    const savedOrder = await newOrder.save();

    // 5. Create and save the OrderItem documents for each item in the order
    const orderItemPromises = items.map((item) => {
      const newOrderItem = new OrderItem({
        orderId: savedOrder._id,
        productName: item.productName,
        price: Number(item.price),
        quantity: Number(item.quantity)
      });
      return newOrderItem.save();
    });
    const savedItems = await Promise.all(orderItemPromises);

    // 6. Clear the cart database collection after successfully placing the order
    await Cart.deleteMany({});

    // 7. Return success response with order details
    res.status(201).json({
      message: 'Order Placed Successfully',
      order: savedOrder,
      items: savedItems
    });
  } catch (error) {
    console.error('Error in placeOrder:', error.message);
    res.status(500).json({ message: 'Order Failed' });
  }
};

/**
 * @desc    Get order history for a specific user
 * @route   GET /orders/:userId
 * @access  Public
 */
const getOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Fetch all orders for this user, sorted by newest first
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    // For each order, fetch its associated order items
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id });
        return {
          ...order.toObject(),
          items
        };
      })
    );

    res.status(200).json(ordersWithItems);
  } catch (error) {
    console.error('Error in getOrders:', error.message);
    res.status(500).json({ message: 'Unable to fetch orders' });
  }
};

/**
 * @desc    Cancel an existing order
 * @route   PUT /orders/cancel/:id
 * @access  Public
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the order by ID
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order is already cancelled
    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // Update the status to Cancelled
    order.status = 'Cancelled';
    const updatedOrder = await order.save();

    // Fetch associated items to return in response if needed
    const items = await OrderItem.find({ orderId: updatedOrder._id });

    res.status(200).json({
      message: 'Order Cancelled',
      order: updatedOrder,
      items
    });
  } catch (error) {
    console.error('Error in cancelOrder:', error.message);
    res.status(500).json({ message: 'Unable to Cancel' });
  }
};

module.exports = {
  placeOrder,
  getOrders,
  cancelOrder
};
