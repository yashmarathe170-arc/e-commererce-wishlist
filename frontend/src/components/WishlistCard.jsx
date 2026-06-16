import React, { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';

/**
 * WishlistCard component to display saved items.
 * @param {Object} props
 * @param {Object} props.item - The saved wishlist item database record { _id, productName, price, createdAt }
 */
const WishlistCard = ({ item }) => {
  const { removeFromWishlist } = useWishlist();
  const [isRemoving, setIsRemoving] = useState(false);

  // Click handler to delete the item from the wishlist
  const handleRemove = async () => {
    setIsRemoving(true);
    // Call context function which hits the DELETE endpoint and displays success/error toasts
    await removeFromWishlist(item._id);
    // Note: State update will unmount this card, but setting isRemoving handles async duration
  };

  return (
    <div className="wishlist-card">
      <div className="wishlist-details">
        {/* Product Name */}
        <h3 className="wishlist-name">{item.productName}</h3>
        {/* Product Price */}
        <p className="wishlist-price">${item.price.toFixed(2)}</p>
      </div>

      {/* Remove Button */}
      <button
        className="remove-wishlist-btn"
        onClick={handleRemove}
        disabled={isRemoving}
      >
        {isRemoving ? 'Removing...' : 'Remove'}
      </button>
    </div>
  );
};

export default WishlistCard;
