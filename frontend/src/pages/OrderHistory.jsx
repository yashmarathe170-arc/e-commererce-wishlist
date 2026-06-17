import React, { useEffect } from 'react';
import { useOrders } from '../context/OrderContext';
import OrderCard from '../components/OrderCard';
import '../styles/OrderHistory.css';

/**
 * OrderHistory Page displaying all past orders for the user.
 * @param {Object} props
 * @param {Function} props.setCurrentPage - Function to change active page
 */
const OrderHistory = ({ setCurrentPage }) => {
  const { orders, loading, fetchOrders } = useOrders();

  // Re-fetch orders from API on mount to ensure fresh state
  useEffect(() => {
    fetchOrders();
  }, []);

  // 1. Loading State
  if (loading && orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <p>Loading your order history...</p>
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-empty">
          <div className="empty-orders-icon">📦</div>
          <h2>No orders found</h2>
          <p>You haven't placed any orders yet. Discover our items and shop now!</p>
          <button className="browse-btn" onClick={() => setCurrentPage('products')}>
            Discover Products
          </button>
        </div>
      </div>
    );
  }

  // 3. Normal State
  return (
    <div className="orders-page">
      {/* Page Header */}
      <header className="orders-header">
        <h1>Order History</h1>
        <p>Manage and track your recent orders.</p>
      </header>

      {/* Orders List Container */}
      <main className="orders-list">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </main>
    </div>
  );
};

export default OrderHistory;
