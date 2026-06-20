const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');

// Retrieve Razorpay keys from environment variables
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;

// Initialize Razorpay SDK if keys are provided, else fallback to Simulated Mode
if (razorpayKeyId && razorpayKeySecret) {
  try {
    razorpayInstance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
    console.log('Payment Module: Initialized in REAL Razorpay Mode.');
  } catch (error) {
    console.error('Payment Module: Failed to initialize Razorpay SDK. Falling back to Simulated Mode:', error.message);
  }
} else {
  console.log('Payment Module: Razorpay credentials missing. Initialized in SIMULATED Mode.');
}

/**
 * @desc    Create a payment order (both locally and on Razorpay / Mock Gateway)
 * @route   POST /payments/create
 * @access  Public
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { userId, items } = req.body;

    // 1. Validation
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // 2. Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      if (!item.productName || item.price === undefined) {
        return res.status(400).json({ message: 'Each item must have productName and price' });
      }
      if (item.price < 0) {
        return res.status(400).json({ message: 'Invalid product price' });
      }
      const qty = item.quantity || 1;
      totalAmount += Number(item.price) * Number(qty);
    }

    // 3. Save pending Order locally in the database
    const newOrder = new Order({
      userId,
      totalAmount,
      status: 'Pending Payment'
    });
    const savedOrder = await newOrder.save();

    // 4. Save associated OrderItems
    const orderItemPromises = items.map((item) => {
      const newOrderItem = new OrderItem({
        orderId: savedOrder._id,
        productName: item.productName,
        price: Number(item.price),
        quantity: Number(item.quantity || 1)
      });
      return newOrderItem.save();
    });
    const savedItems = await Promise.all(orderItemPromises);

    // 5. Generate gateway order and save Payment log
    if (razorpayInstance) {
      // Real Mode
      const options = {
        amount: Math.round(totalAmount * 100), // Razorpay accepts amounts in paise
        currency: 'INR',
        receipt: `receipt_order_${savedOrder._id}`
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);

      const paymentRecord = new Payment({
        orderId: savedOrder._id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount,
        status: 'Created'
      });
      await paymentRecord.save();

      return res.status(201).json({
        isMock: false,
        razorpayKeyId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount, // in paise
        currency: razorpayOrder.currency,
        orderId: savedOrder._id,
        items: savedItems
      });
    } else {
      // Simulated Mode
      const mockRazorpayOrderId = `order_mock_${Math.random().toString(36).substring(2, 12)}`;

      const paymentRecord = new Payment({
        orderId: savedOrder._id,
        razorpayOrderId: mockRazorpayOrderId,
        amount: totalAmount,
        status: 'Created'
      });
      await paymentRecord.save();

      return res.status(201).json({
        isMock: true,
        razorpayOrderId: mockRazorpayOrderId,
        amount: Math.round(totalAmount * 100), // mock amount in paise
        currency: 'INR',
        orderId: savedOrder._id,
        items: savedItems
      });
    }
  } catch (error) {
    console.error('Error in createPaymentOrder:', error.message);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

/**
 * @desc    Verify payment signature and update order status
 * @route   POST /payments/verify
 * @access  Public
 */
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, status } = req.body;

    // 1. Validation
    if (!orderId || !razorpayOrderId) {
      return res.status(400).json({ message: 'Order ID and Razorpay Order ID are required' });
    }

    // 2. Fetch Payment Log and Local Order
    const payment = await Payment.findOne({ orderId, razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Associated order not found' });
    }

    // Handle payment cancellation/failure reported by frontend
    if (status === 'failed') {
      payment.status = 'Failed';
      payment.errorMessage = req.body.errorMessage || 'Payment cancelled by user or declined by bank';
      await payment.save();

      order.status = 'Failed';
      await order.save();

      return res.status(200).json({
        success: false,
        message: 'Payment failure registered successfully.',
        orderStatus: 'Failed'
      });
    }

    // 3. Verification Logic
    if (razorpayInstance) {
      // Real Mode verification using cryptography
      if (!razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: 'Payment ID and Signature are required for verification' });
      }

      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpaySignature) {
        // Success
        payment.status = 'Captured';
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.razorpaySignature = razorpaySignature;
        await payment.save();

        order.status = 'Placed';
        await order.save();

        // Clear cart collection on success
        await Cart.deleteMany({});

        return res.status(200).json({
          success: true,
          message: 'Payment verified and order placed successfully!',
          payment
        });
      } else {
        // Verification failed
        payment.status = 'Failed';
        payment.errorMessage = 'Signature verification failed';
        await payment.save();

        order.status = 'Failed';
        await order.save();

        return res.status(400).json({
          success: false,
          message: 'Payment verification failed. Invalid signature.'
        });
      }
    } else {
      // Simulated Mode verification
      if (!razorpayPaymentId || !razorpayPaymentId.startsWith('pay_mock_')) {
        payment.status = 'Failed';
        payment.errorMessage = 'Invalid simulated payment token';
        await payment.save();

        order.status = 'Failed';
        await order.save();

        return res.status(400).json({
          success: false,
          message: 'Simulated payment verification failed.'
        });
      }

      // Simulated Success
      payment.status = 'Captured';
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature || `sig_mock_${Math.random().toString(36).substring(2, 12)}`;
      await payment.save();

      order.status = 'Placed';
      await order.save();

      // Clear cart collection on success
      await Cart.deleteMany({});

      return res.status(200).json({
        success: true,
        message: 'Simulated payment completed and order placed successfully!',
        payment
      });
    }
  } catch (error) {
    console.error('Error in verifyPayment:', error.message);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};

/**
 * @desc    Fetch payment history for a user
 * @route   GET /payments/history/:userId
 * @access  Public
 */
const getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find all orders for this user
    const userOrders = await Order.find({ userId });
    const orderIds = userOrders.map((o) => o._id);

    // Retrieve all payment documents linked to user orders, sorted newest first
    const payments = await Payment.find({ orderId: { $in: orderIds } })
      .populate('orderId')
      .sort({ createdAt: -1 });

    // Manually attach order item lists to the populated order object for rich UI displays
    const paymentsWithItems = await Promise.all(
      payments.map(async (payment) => {
        const paymentObj = payment.toObject();
        if (paymentObj.orderId) {
          const items = await OrderItem.find({ orderId: paymentObj.orderId._id });
          paymentObj.orderId.items = items;
        }
        return paymentObj;
      })
    );

    res.status(200).json(paymentsWithItems);
  } catch (error) {
    console.error('Error in getPaymentHistory:', error.message);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory
};
