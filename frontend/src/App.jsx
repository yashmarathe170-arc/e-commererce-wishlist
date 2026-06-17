import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';

// Import Toastify styles (required for toast notifications to render properly)
import 'react-toastify/dist/ReactToastify.css';

// Import Context Providers
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';

// Import Components and Pages
import Navbar from './components/Navbar';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';

/**
 * Main App Component
 */
function App() {
  // Use state to manage current page navigation ('products', 'cart', 'checkout', 'orders')
  // This keeps routing beginner-friendly without needing react-router-dom
  const [currentPage, setCurrentPage] = useState('products');

  // Page Switcher component based on the active currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'products':
        return <Product />;
      case 'cart':
        return <Cart setCurrentPage={setCurrentPage} />;
      case 'checkout':
        return <Checkout setCurrentPage={setCurrentPage} />;
      case 'orders':
        return <OrderHistory setCurrentPage={setCurrentPage} />;
      default:
        return <Product />;
    }
  };

  return (
    // Wrap entire app in providers to share state globally
    <CartProvider>
      <OrderProvider>
        <div className="app-container">
          {/* Navigation Bar */}
          <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

          {/* Render Active Page */}
          {renderPage()}

          {/* Global Toast Notification Container */}
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </OrderProvider>
    </CartProvider>
  );
}

export default App;
