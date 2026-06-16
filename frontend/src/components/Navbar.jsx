import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import '../styles/Navbar.css';

/**
 * Navbar component for the application header.
 * @param {Object} props
 * @param {string} props.currentPage - The current active page ('products' or 'wishlist')
 * @param {Function} props.setCurrentPage - Function to set/change the current page
 */
const Navbar = ({ currentPage, setCurrentPage }) => {
  // Destructure the wishlist array from our context to read its length
  const { wishlist } = useWishlist();

  return (
    <nav className="navbar">
      {/* Brand logo / name */}
      <div className="navbar-brand" onClick={() => setCurrentPage('products')}>
        MINIMA<span>.shop</span>
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
            className={`navbar-button ${currentPage === 'wishlist' ? 'active' : ''}`}
            onClick={() => setCurrentPage('wishlist')}
          >
            Wishlist
            {/* Display badge with the wishlist item count */}
            <span className="wishlist-count-badge">{wishlist.length}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
