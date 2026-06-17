import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import CartCard from '../components/CartCard';
import '../styles/Cart.css';

/**
 * Cart Page component to display items in the cart, show total price, and checkout.
 * @param {Object} props
 * @param {Function} props.setCurrentPage - Function to change the active page
 */
const Cart = ({ setCurrentPage }) => {
  const { cart, loading, fetchCart } = useCart();

  // Fetch cart data when component mounts to ensure synchronicity
  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate total amount in cart
  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price), 0);

  // 1. Loading State
  if (loading && cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-loading">
          <p>Loading your cart items...</p>
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Explore our products page and add some items to your cart!</p>
          <button className="browse-btn" onClick={() => setCurrentPage('products')}>
            Discover Products
          </button>
        </div>
      </div>
    );
  }

  // 3. Normal State
  return (
    <div className="cart-page">
      {/* Page Header */}
      <header className="cart-header">
        <h1>Your Cart</h1>
        <p>You have {cart.length} item{cart.length > 1 ? 's' : ''} in your cart.</p>
      </header>

      {/* Grid of Cart Cards */}
      <main className="cart-grid">
        {cart.map((item) => (
          <CartCard key={item._id} item={item} />
        ))}
      </main>

      {/* Cart Summary Section with Total and Checkout Button */}
      <footer className="cart-summary">
        <div className="cart-summary-total">
          <span>Total:</span>
          <h2>₹{totalAmount.toFixed(2)}</h2>
        </div>
        <button
          className="checkout-btn"
          onClick={() => setCurrentPage('checkout')}
        >
          Proceed to Checkout
        </button>
      </footer>
    </div>
  );
};

export default Cart;
