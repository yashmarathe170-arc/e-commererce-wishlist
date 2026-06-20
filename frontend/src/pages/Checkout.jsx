import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { createPaymentOrderApi, verifyPaymentApi } from '../services/paymentApi';
import { MOCK_USER_ID } from '../context/OrderContext';
import { toast } from 'react-toastify';
import '../styles/Checkout.css';
import { getProductImage } from '../utils/productImages';

/**
 * Checkout Page component to show order summary, simulate/integrate payment, and display real-time status.
 * @param {Object} props
 * @param {Function} props.setCurrentPage - Function to set the active page
 */
const Checkout = ({ setCurrentPage }) => {
  const { cart, clearCart } = useCart();
  const { fetchOrders } = useOrders(); // To refresh order history on success
  const [step, setStep] = useState('summary'); // 'summary' | 'processing' | 'success' | 'failure'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);

  // Storage for payment context
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState({
    paymentId: '',
    orderId: '',
    razorpayOrderId: '',
    amount: 0,
    date: ''
  });
  const [failureReason, setFailureReason] = useState('');

  // Simulated modal form details
  const [cardName, setCardName] = useState('John Doe');
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');

  // Calculate total amount of checkout items
  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price), 0);

  // Helper to load Razorpay external script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Step 1: Initiate payment and handle real vs simulated gateway
  const handleProceedToPayment = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    setFailureReason('');

    // Map cart items into standard OrderItem structure
    const orderItems = cart.map((item) => ({
      productName: item.productName,
      price: Number(item.price),
      quantity: 1
    }));

    try {
      // Call backend payment API to create order
      const response = await createPaymentOrderApi({
        userId: MOCK_USER_ID,
        items: orderItems
      });

      setPaymentOrder(response);

      if (response.isMock) {
        // Simulated mode: Trigger custom frontend payment dialog
        setIsSubmitting(false);
        setShowMockModal(true);
      } else {
        // Real mode: Load official SDK and open popup
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Unable to connect to Razorpay. Check your internet connection.');
          setIsSubmitting(false);
          return;
        }

        const options = {
          key: response.razorpayKeyId,
          amount: response.amount,
          currency: response.currency,
          name: 'Add2Cart',
          description: 'E-Commerce Secure Purchase',
          order_id: response.razorpayOrderId,
          handler: async function (paymentRes) {
            setStep('processing');
            setShowMockModal(false);
            setIsSubmitting(false);
            try {
              // Verify on backend
              const verification = await verifyPaymentApi({
                orderId: response.orderId,
                razorpayOrderId: paymentRes.razorpay_order_id,
                razorpayPaymentId: paymentRes.razorpay_payment_id,
                razorpaySignature: paymentRes.razorpay_signature,
                status: 'success'
              });

              if (verification.success) {
                // Clear cart locally
                await clearCart();
                // Refresh orders in context
                await fetchOrders();
                // Show success screen
                setTransactionDetails({
                  paymentId: paymentRes.razorpay_payment_id,
                  orderId: response.orderId,
                  razorpayOrderId: paymentRes.razorpay_order_id,
                  amount: totalAmount,
                  date: new Date().toLocaleString()
                });
                setStep('success');
                toast.success('Payment Captured Successfully!');
              } else {
                setFailureReason(verification.message || 'Signature verification failed.');
                setStep('failure');
              }
            } catch (err) {
              setFailureReason(err.message || 'Verification endpoint error.');
              setStep('failure');
            }
          },
          prefill: {
            name: 'John Doe',
            email: 'johndoe@example.com',
            contact: '9999999999'
          },
          modal: {
            ondismiss: async function () {
              setStep('processing');
              try {
                await verifyPaymentApi({
                  orderId: response.orderId,
                  razorpayOrderId: response.razorpayOrderId,
                  status: 'failed',
                  errorMessage: 'Payment cancelled: Checkout window closed by user.'
                });
              } catch (e) {
                console.error('Error reporting failure callback:', e);
              }
              setFailureReason('Payment window closed by user.');
              setStep('failure');
              setIsSubmitting(false);
            }
          },
          theme: {
            color: '#1a1a1a'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (failedResponse) {
          setStep('processing');
          const errorDesc = failedResponse.error.description || 'Payment declined by bank';
          try {
            await verifyPaymentApi({
              orderId: response.orderId,
              razorpayOrderId: response.razorpayOrderId,
              status: 'failed',
              errorMessage: errorDesc
            });
          } catch (e) {
            console.error('Error reporting failure status:', e);
          }
          setFailureReason(errorDesc);
          setStep('failure');
          setIsSubmitting(false);
        });

        rzp.open();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to initiate payment.');
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle simulated gateway actions
  const handleSimulatePaymentSuccess = async () => {
    if (!paymentOrder) return;
    setShowMockModal(false);
    setStep('processing');

    const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 12)}`;
    const mockSignature = `sig_mock_${Math.random().toString(36).substring(2, 12)}`;

    try {
      const verification = await verifyPaymentApi({
        orderId: paymentOrder.orderId,
        razorpayOrderId: paymentOrder.razorpayOrderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSignature,
        status: 'success'
      });

      if (verification.success) {
        await clearCart();
        await fetchOrders();
        setTransactionDetails({
          paymentId: mockPaymentId,
          orderId: paymentOrder.orderId,
          razorpayOrderId: paymentOrder.razorpayOrderId,
          amount: totalAmount,
          date: new Date().toLocaleString()
        });
        setStep('success');
        toast.success('Payment Captured (Simulated)');
      } else {
        setFailureReason(verification.message || 'Signature verification failed.');
        setStep('failure');
      }
    } catch (err) {
      setFailureReason(err.message || 'Simulated verification server failure.');
      setStep('failure');
    }
  };

  const handleSimulatePaymentFailure = async () => {
    if (!paymentOrder) return;
    setShowMockModal(false);
    setStep('processing');

    try {
      await verifyPaymentApi({
        orderId: paymentOrder.orderId,
        razorpayOrderId: paymentOrder.razorpayOrderId,
        status: 'failed',
        errorMessage: 'Simulated payment failure triggered by merchant test UI.'
      });
      setFailureReason('Simulated payment failure triggered by merchant test UI.');
      setStep('failure');
    } catch (err) {
      setFailureReason(err.message || 'Simulated verification server failure.');
      setStep('failure');
    }
  };

  const handleSimulatePaymentCancel = async () => {
    if (!paymentOrder) return;
    setShowMockModal(false);
    setStep('processing');

    try {
      await verifyPaymentApi({
        orderId: paymentOrder.orderId,
        razorpayOrderId: paymentOrder.razorpayOrderId,
        status: 'failed',
        errorMessage: 'Payment cancelled by user.'
      });
      setFailureReason('Payment cancelled by user.');
      setStep('failure');
    } catch (err) {
      setFailureReason(err.message || 'Simulated verification server failure.');
      setStep('failure');
    }
  };

  // Render Loader screen during transaction verification
  if (step === 'processing') {
    return (
      <div className="checkout-page">
        <div className="checkout-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem auto' }}></div>
          <h2>Verifying Transaction Status</h2>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            We are verifying your transaction signature with the bank server. Please do not refresh the page or click back.
          </p>
        </div>
      </div>
    );
  }

  // Render Success screen
  if (step === 'success') {
    return (
      <div className="checkout-page">
        <div className="checkout-status-card">
          <div className="status-icon success">✓</div>
          <h2 className="status-title">Payment Successful!</h2>
          <p className="status-subtitle">Thank you for your purchase. Your order has been placed successfully.</p>

          <div className="transaction-details-box">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1a1a1a', textAlign: 'left', fontWeight: '700' }}>
              Transaction Summary
            </h3>
            <table className="transaction-details-table">
              <tbody>
                <tr>
                  <td className="tx-label">Local Order ID</td>
                  <td className="tx-val font-mono">#{transactionDetails.orderId}</td>
                </tr>
                <tr>
                  <td className="tx-label">Gateway Order ID</td>
                  <td className="tx-val font-mono">{transactionDetails.razorpayOrderId}</td>
                </tr>
                <tr>
                  <td className="tx-label">Payment Transaction ID</td>
                  <td className="tx-val font-mono">{transactionDetails.paymentId}</td>
                </tr>
                <tr>
                  <td className="tx-label">Amount Paid</td>
                  <td className="tx-val" style={{ color: '#10b981', fontWeight: '800' }}>
                    ₹{transactionDetails.amount.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="tx-label">Timestamp</td>
                  <td className="tx-val">{transactionDetails.date}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="action-buttons-group">
            <button className="action-btn-primary" onClick={() => setCurrentPage('orders')}>
              View Order History
            </button>
            <button className="action-btn-secondary" onClick={() => setCurrentPage('products')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Failure screen
  if (step === 'failure') {
    return (
      <div className="checkout-page">
        <div className="checkout-status-card">
          <div className="status-icon failure">✕</div>
          <h2 className="status-title">Payment Failed</h2>
          <p className="status-subtitle">We couldn't process your transaction. Please review the reason below and try again.</p>

          <div className="transaction-details-box" style={{ borderColor: '#fca5a5', backgroundColor: '#fff5f5' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#ef4444', textAlign: 'left', fontWeight: '700' }}>
              Declined Reason
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#b91c1c', textAlign: 'left', lineHeight: '1.4' }}>
              {failureReason || 'An unknown network error occurred. Please contact customer support.'}
            </p>
          </div>

          <div className="action-buttons-group">
            <button 
              className="action-btn-primary" 
              onClick={() => {
                setStep('summary');
                setIsSubmitting(false);
              }}
            >
              Retry Payment
            </button>
            <button className="action-btn-secondary" onClick={() => setCurrentPage('cart')}>
              Cancel and Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart fallback
  if (cart.length === 0 && !isSubmitting) {
    return (
      <div className="checkout-page">
        <div className="checkout-card" style={{ textAlign: 'center' }}>
          <h2>No items in checkout</h2>
          <p>Please add products to your cart before proceeding.</p>
          <button className="browse-btn" onClick={() => setCurrentPage('products')}>
            Discover Products
          </button>
        </div>
      </div>
    );
  }

  // Normal summary step
  return (
    <div className="checkout-page">
      {/* Page Header */}
      <header className="checkout-header">
        <h1>Checkout</h1>
        <p>Review your items and complete your purchase securely.</p>
      </header>

      {/* Checkout Card containing Order Details */}
      <main className="checkout-card">
        <h2>Order Summary</h2>

        {/* List of items being checked out */}
        <div className="checkout-items">
          {cart.map((item) => (
            <div key={item._id} className="checkout-item">
              <div className="checkout-item-details">
                <img
                  src={getProductImage(item.productName)}
                  alt={item.productName}
                  className="checkout-item-thumbnail"
                  loading="lazy"
                />
                <div className="checkout-item-info">
                  <span className="checkout-item-name">{item.productName}</span>
                  <span className="checkout-item-qty">Qty: 1</span>
                </div>
              </div>
              <span className="checkout-item-price">₹{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Total Amount Row */}
        <div className="checkout-total-row">
          <span className="checkout-total-label">Total Amount:</span>
          <span className="checkout-total-val">₹{totalAmount.toFixed(2)}</span>
        </div>

        {/* Action Buttons */}
        <button
          className="place-order-btn"
          onClick={handleProceedToPayment}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Connecting...' : `Proceed to Pay ₹${totalAmount.toFixed(2)}`}
        </button>

        <button
          className="back-cart-btn"
          onClick={() => setCurrentPage('cart')}
          disabled={isSubmitting}
        >
          Back to Cart
        </button>
      </main>

      {/* Custom Interactive Simulated Razorpay Checkout Modal */}
      {showMockModal && (
        <div className="mock-modal-overlay">
          <div className="mock-modal-container">
            {/* Header */}
            <div className="mock-modal-header">
              <div className="mock-modal-brand">
                Add2<span>Cart</span>
              </div>
              <div className="mock-modal-badge">
                Test Mode
              </div>
            </div>

            {/* Amount Banner */}
            <div className="mock-modal-amount-banner">
              <span className="amount-label">TOTAL AMOUNT DUE</span>
              <span className="amount-value">₹{totalAmount.toFixed(2)}</span>
            </div>

            {/* Body */}
            <div className="mock-modal-body">
              <div className="mock-modal-info">
                🔒 Razorpay Simulated Sandboxed Pipeline. Since API keys are not configured, you can test how the application handles transaction outcomes.
              </div>

              <div className="form-group">
                <label>Cardholder Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={cardName} 
                  onChange={(e) => setCardName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Test Card Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={cardNumber} 
                  onChange={(e) => setCardNumber(e.target.value)} 
                />
              </div>

              <div className="mock-modal-actions">
                <button className="btn-simulate-success" onClick={handleSimulatePaymentSuccess}>
                  Simulate Payment Success
                </button>
                <button className="btn-simulate-failed" onClick={handleSimulatePaymentFailure}>
                  Simulate Payment Decline
                </button>
                <button className="btn-cancel" onClick={handleSimulatePaymentCancel}>
                  Cancel and Dismiss Gateway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
