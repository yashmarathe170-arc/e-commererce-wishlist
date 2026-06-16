import React, { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';

/**
 * ProductCard component to display an individual product.
 * @param {Object} props
 * @param {Object} props.product - The product details { name, price }
 */
const ProductCard = ({ product }) => {
  const { addToWishlist, wishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);

  // Check if this product is already in the wishlist to style the button/card differently
  const isAlreadyInWishlist = wishlist.some(
    (item) => item.productName.toLowerCase() === product.name.toLowerCase()
  );

  // Click handler to add the product
  const handleAddToWishlist = async () => {
    setIsAdding(true);
    // Call the context function which contacts the API and shows the Toast notification
    await addToWishlist(product.name, product.price);
    setIsAdding(false);
  };

  return (
    <div className={`product-card ${isAlreadyInWishlist ? 'wished' : ''}`}>
      {/* Product Information */}
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price.toFixed(2)}</p>
      </div>

      {/* Action Button */}
      <button
        className={`add-wishlist-btn ${isAlreadyInWishlist ? 'already-added' : ''}`}
        onClick={handleAddToWishlist}
        disabled={isAdding} // Disable button while request is loading
      >
        {isAdding ? (
          <span className="spinner">Adding...</span>
        ) : isAlreadyInWishlist ? (
          '♥ In Wishlist'
        ) : (
          '♡ Add to Wishlist'
        )}
      </button>
    </div>
  );
};

export default ProductCard;
