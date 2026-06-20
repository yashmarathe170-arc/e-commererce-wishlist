import React from 'react';
import { useCart } from '../context/CartContext';
import '../styles/Navbar.css';

/**
 * Navbar component for the application header.
 * @param {Object} props
 * @param {string} props.currentPage - The current active page ('products', 'cart', 'checkout', 'orders')
 * @param {Function} props.setCurrentPage - Function to set/change the current page
 */
const Navbar = ({ currentPage, setCurrentPage }) => {
  const { cart } = useCart();

  return (
    <nav className="navbar">
      {/* Brand logo */}
      <div className="navbar-brand" onClick={() => setCurrentPage('products')}>
        Add2<span>Cart</span>
      </div>

      {/* Navigation links */}
      <ul className="navbar-links">
        <li className="navbar-item">
          <button
            className={`navbar-button ${currentPage === 'products' ? 'active' : ''}`}
            onClick={() => setCurrentPage('products')}
          >
            Products
          </button>
        </li>
        
        <li className="navbar-item">
          <button
            className={`navbar-button ${currentPage === 'cart' ? 'active' : ''}`}
            onClick={() => setCurrentPage('cart')}
          >
            Cart
            {/* Display badge with the cart item count */}
            <span className="cart-count-badge">{cart.length}</span>
          </button>
        </li>

        <li className="navbar-item">
          <button
            className={`navbar-button ${currentPage === 'orders' ? 'active' : ''}`}
            onClick={() => setCurrentPage('orders')}
          >
            Orders
          </button>
        </li>

        <li className="navbar-item">
          <button
            className={`navbar-button ${currentPage === 'payments' ? 'active' : ''}`}
            onClick={() => setCurrentPage('payments')}
          >
            Payments
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
