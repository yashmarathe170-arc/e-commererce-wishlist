import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

/**
 * ProductCard component to display an individual product.
 * @param {Object} props
 * @param {Object} props.product - The product details { name, price }
 */
const ProductCard = ({ product }) => {
  const { addToCart, cart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // Check if this product is already in the cart
  const isAlreadyInCart = cart.some(
    (item) => item.productName.toLowerCase() === product.name.toLowerCase()
  );

  // Click handler to add the product to cart
  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product.name, product.price);
    setIsAdding(false);
  };

  return (
    <div className={`product-card ${isAlreadyInCart ? 'in-cart' : ''}`}>
      {/* Product Information */}
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
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
    </div>
  );
};

export default ProductCard;
