import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';

/**
 * OrderCard component to display details of a single order.
 * @param {Object} props
 * @param {Object} props.order - The order database object { _id, userId, totalAmount, status, createdAt, items }
 */
const OrderCard = ({ order }) => {
  const { cancelOrder } = useOrders();
  const [isCancelling, setIsCancelling] = useState(false);

  // Function to format MongoDB ISODate to readable date string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handler for cancelling an order
  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setIsCancelling(true);
      await cancelOrder(order._id);
      setIsCancelling(false);
    }
  };

  return (
    <div className="order-card">
      {/* Header section with ID, Date, and Status Badge */}
      <div className="order-card-header">
        <div className="order-info-left">
          <h3>Order ID: #{order._id}</h3>
          <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className={`order-status-badge ${order.status.toLowerCase()}`}>
          {order.status}
        </div>
      </div>

      {/* Items list section */}
      <div className="order-card-items">
        {order.items && order.items.map((item) => (
          <div key={item._id} className="order-card-item">
            <div className="order-item-left">
              <span className="order-item-name">{item.productName}</span>
              <span className="order-item-qty">x {item.quantity}</span>
            </div>
            <span className="order-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Footer section with total amount and cancel action button */}
      <div className="order-card-footer">
        <p className="order-total-amount">Total Amount: ₹{order.totalAmount.toFixed(2)}</p>
        
        {/* Only show Cancel button if order status is 'Placed' */}
        {order.status === 'Placed' && (
          <button
            className="cancel-order-btn"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
