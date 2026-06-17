import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import '../styles/Checkout.css';

/**
 * Checkout Page component to show order summary and place order.
 * @param {Object} props
 * @param {Function} props.setCurrentPage - Function to set the active page
 */
const Checkout = ({ setCurrentPage }) => {
  const { cart, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total amount of checkout items
  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price), 0);

  // Click handler to compile order items and place the order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);

    // Map cart items into standard OrderItem structure (with quantity = 1)
    const orderItems = cart.map((item) => ({
      productName: item.productName,
      price: Number(item.price),
      quantity: 1
    }));

    // Call order context to post the order to backend APIs
    const success = await placeOrder(orderItems);

    if (success) {
      // Clear cart locally since order was stored and cart was cleared in the DB
      await clearCart();
      // Redirect to Order History page
      setCurrentPage('orders');
    } else {
      setIsSubmitting(false);
    }
  };

  // If cart is empty and not submitting, prompt user to go back to shop
  if (cart.length === 0 && !isSubmitting) {
    return (
      <div className="checkout-page">
        <div className="checkout-card" style={{ textAlign: 'center' }}>
          <h2>No items in checkout</h2>
          <p>Please add products to your cart before proceeding.</p>
          <button className="browse-btn" onClick={() => setCurrentPage('products')}>
            Discover Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Page Header */}
      <header className="checkout-header">
        <h1>Checkout</h1>
        <p>Review your items and complete your purchase.</p>
      </header>

      {/* Checkout Card containing Order Details */}
      <main className="checkout-card">
        <h2>Order Summary</h2>

        {/* List of items being checked out */}
        <div className="checkout-items">
          {cart.map((item) => (
            <div key={item._id} className="checkout-item">
              <div className="checkout-item-details">
                <span className="checkout-item-name">{item.productName}</span>
                <span className="checkout-item-qty">Qty: 1</span>
              </div>
              <span className="checkout-item-price">₹{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Total Amount Row */}
        <div className="checkout-total-row">
          <span className="checkout-total-label">Total Amount:</span>
          <span className="checkout-total-val">₹{totalAmount.toFixed(2)}</span>
        </div>

        {/* Action Buttons */}
        <button
          className="place-order-btn"
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </button>

        <button
          className="back-cart-btn"
          onClick={() => setCurrentPage('cart')}
          disabled={isSubmitting}
        >
          Back to Cart
        </button>
      </main>
    </div>
  );
};

export default Checkout;
