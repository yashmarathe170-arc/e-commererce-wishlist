import React, { useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import WishlistCard from '../components/WishlistCard';
import '../styles/Wishlist.css';

/**
 * Wishlist Page component to display the list of saved items.
 * @param {Object} props
 * @param {Function} props.setCurrentPage - Function to set/change the current active page
 */
const Wishlist = ({ setCurrentPage }) => {
  // Grab state and fetch function from our global wishlist context
  const { wishlist, loading, fetchWishlist } = useWishlist();

  // Re-fetch from the database when user mounts the Wishlist page to ensure sync
  useEffect(() => {
    fetchWishlist();
  }, []);

  // 1. Loading State
  if (loading && wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-loading">
          <p>Loading your saved items...</p>
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-empty">
          <div className="empty-heart-icon">♡</div>
          <h2>Your wishlist is empty</h2>
          <p>Explore our products page and add some items to your list!</p>
          <button className="browse-btn" onClick={() => setCurrentPage('products')}>
            Discover Products
          </button>
        </div>
      </div>
    );
  }

  // 3. Normal State (Show Grid)
  return (
    <div className="wishlist-page">
      {/* Page Header */}
      <header className="wishlist-header">
        <h1>Your Wishlist</h1>
        <p>You have {wishlist.length} item{wishlist.length > 1 ? 's' : ''} saved in your wishlist.</p>
      </header>

      {/* Grid of Wishlist Cards */}
      <main className="wishlist-grid">
        {wishlist.map((item) => (
          <WishlistCard key={item._id} item={item} />
        ))}
      </main>
    </div>
  );
};

export default Wishlist;
