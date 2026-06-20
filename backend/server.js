// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Initialize the Express app
const app = express();

// Set the port from environment variables, defaulting to 5000 if not defined
const PORT = process.env.PORT || 5000;

// Enable CORS (Cross-Origin Resource Sharing)
// This allows the frontend (running on a different port like 5173) to communicate with the backend
app.use(cors());

// Express built-in middleware to parse incoming JSON payloads
app.use(express.json());

// Register API Routes
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/reviews', reviewRoutes);
app.use('/payments', paymentRoutes);

// Simple health check route
app.get('/', (req, res) => {
  res.send('Shopping Portal API is running...');
});

// Global Error Handler Middleware (fallback for unexpected errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Connect to MongoDB using Mongoose
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wishlist-db';

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    // Start listening for client requests only after database connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure code
  });
