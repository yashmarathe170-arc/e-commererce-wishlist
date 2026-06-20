import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../utils/productImages';

/**
 * CartCard component to display an item currently in the cart.
 * @param {Object} props
 * @param {Object} props.item - The saved cart item database record { _id, productName, price, createdAt }
 */
const CartCard = ({ item }) => {
  const { removeFromCart } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  // Click handler to delete the item from the cart
  const handleRemove = async () => {
    setIsRemoving(true);
    await removeFromCart(item._id);
  };

  return (
    <div className="cart-card">
      <div className="cart-image-container">
        <img
          src={getProductImage(item.productName)}
          alt={item.productName}
          className="cart-image"
          loading="lazy"
        />
      </div>
      <div className="cart-details">
        {/* Product Name */}
        <h3 className="cart-name">{item.productName}</h3>
        {/* Product Price */}
        <p className="cart-price">₹{item.price.toFixed(2)}</p>
      </div>

      {/* Remove Button */}
      <button
        className="remove-cart-btn"
        onClick={handleRemove}
        disabled={isRemoving}
      >
        {isRemoving ? 'Removing...' : 'Remove'}
      </button>
    </div>
  );
};

export default CartCard;
