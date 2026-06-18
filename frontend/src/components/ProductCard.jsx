import { useState } from 'react';
import { useCart } from '../context/CartContext';
import ReviewModal from './ReviewModal';

/**
 * ProductCard component to display an individual product.
 * @param {Object} props
 * @param {Object} props.product - The product details { name, price }
 * @param {Number} props.averageRating - Dynamic average rating
 * @param {Number} props.totalReviews - Dynamic total reviews count
 * @param {Function} props.onRatingUpdate - Callback when reviews change
 */
const ProductCard = ({ product, averageRating = 0, totalReviews = 0, onRatingUpdate }) => {
  const { addToCart, cart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if this product is already in the cart
  const isAlreadyInCart = cart.some(
    (item) => item.productName.toLowerCase() === product.name.toLowerCase()
  );

  // Click handler to add the product to cart
  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Avoid triggering details modal if container has click
    setIsAdding(true);
    await addToCart(product.name, product.price);
    setIsAdding(false);
  };

  // Helper to render ratings line
  const renderRatingInfo = () => {
    if (totalReviews > 0) {
      return (
        <div className="product-rating" onClick={() => setIsModalOpen(true)}>
          <span className="star-icon filled">★</span>
          <span className="rating-val">{averageRating.toFixed(1)}</span>
          <span className="rating-count">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
        </div>
      );
    }
    return (
      <div className="product-rating no-ratings" onClick={() => setIsModalOpen(true)}>
        <span className="star-icon empty">★</span>
        <span className="rating-count">Write a review</span>
      </div>
    );
  };

  return (
    <div className={`product-card ${isAlreadyInCart ? 'in-cart' : ''}`}>
      {/* Product Information */}
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        {renderRatingInfo()}
        <p className="product-price">₹{product.price.toFixed(2)}</p>
      </div>

      {/* Action Button */}
      <button
        className={`add-cart-btn ${isAlreadyInCart ? 'already-added' : ''}`}
        onClick={handleAddToCart}
        disabled={isAdding} // Disable button while request is loading
      >
        {isAdding ? (
          <span className="spinner">Adding...</span>
        ) : isAlreadyInCart ? (
          '♥ In Cart'
        ) : (
          '♡ Add to Cart'
        )}
      </button>

      {/* Reviews Modal Overlay */}
      {isModalOpen && (
        <ReviewModal
          product={product}
          onClose={() => setIsModalOpen(false)}
          onRatingUpdate={onRatingUpdate}
        />
      )}
    </div>
  );
};

export default ProductCard;
