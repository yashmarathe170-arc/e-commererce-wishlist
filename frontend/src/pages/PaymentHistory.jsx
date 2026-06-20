import React, { useState, useEffect } from 'react';
import { fetchPaymentHistoryApi } from '../services/paymentApi';
import { MOCK_USER_ID } from '../context/OrderContext';
import { toast } from 'react-toastify';
import '../styles/PaymentHistory.css';
import { getProductImage } from '../utils/productImages';

/**
 * PaymentHistory Page component to display user payment logs.
 * @param {Object} props
 * @param {Function} props.setCurrentPage - Navigation handler
 */
const PaymentHistory = ({ setCurrentPage }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch payments on component mount
  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await fetchPaymentHistoryApi(MOCK_USER_ID);
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      toast.error('Unable to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format dates
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Loader state
  if (loading) {
    return (
      <div className="payment-history-page">
        <div className="payment-loading">
          <div className="spinner"></div>
          <p>Retrieving transaction logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history-page">
      {/* Page Header */}
      <header className="payment-history-header">
        <div>
          <h1>Payment History</h1>
          <p>Monitor your transaction logs, invoices, and billing statuses.</p>
        </div>
        <button className="refresh-btn" onClick={loadPayments}>
          🔄 Refresh Logs
        </button>
      </header>

      {payments.length === 0 ? (
        // Empty State
        <div className="payment-empty-card">
          <div className="empty-payment-icon">💳</div>
          <h2>No transactions found</h2>
          <p>You have not initiated any payments yet. Add items to your cart and proceed to checkout.</p>
          <button className="browse-btn" onClick={() => setCurrentPage('products')}>
            Shop Products
          </button>
        </div>
      ) : (
        // Payment Logs List
        <div className="payment-logs-list">
          {payments.map((payment) => (
            <div key={payment._id} className={`payment-log-card border-${payment.status.toLowerCase()}`}>
              {/* Top Bar: IDs, Status, and Amount */}
              <div className="payment-log-top">
                <div className="payment-log-meta">
                  <span className="payment-order-id">Order ID: #{payment.orderId?._id || 'Deleted Order'}</span>
                  <span className="payment-date">{formatDate(payment.createdAt)}</span>
                </div>
                <div className="payment-log-amount-status">
                  <span className="payment-amount">₹{payment.amount.toFixed(2)}</span>
                  <span className={`payment-status-badge status-${payment.status.toLowerCase()}`}>
                    {payment.status}
                  </span>
                </div>
              </div>

              {/* Mid Bar: Razorpay details */}
              <div className="payment-log-details">
                <div className="detail-item">
                  <span className="detail-label">Gateway Order ID:</span>
                  <span className="detail-value font-mono">{payment.razorpayOrderId}</span>
                </div>
                {payment.razorpayPaymentId && (
                  <div className="detail-item">
                    <span className="detail-label">Payment ID:</span>
                    <span className="detail-value font-mono">{payment.razorpayPaymentId}</span>
                  </div>
                )}
                {payment.errorMessage && (
                  <div className="detail-item error-container">
                    <span className="detail-label">Reason:</span>
                    <span className="detail-value error-text">{payment.errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Collapsible/Items list from the order */}
              {payment.orderId && payment.orderId.items && (
                <div className="payment-log-items-section">
                  <h4>Billing Summary</h4>
                  <div className="payment-log-items">
                    {payment.orderId.items.map((item, idx) => (
                      <div key={item._id || idx} className="payment-log-item">
                        <div className="item-left">
                          <img
                            src={getProductImage(item.productName)}
                            alt={item.productName}
                            className="payment-item-thumbnail"
                            loading="lazy"
                          />
                          <div className="item-details">
                            <span className="item-name">{item.productName}</span>
                            <span className="item-qty">x {item.quantity}</span>
                          </div>
                        </div>
                        <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
