import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';

// Import Toastify styles (required for toast notifications to render properly)
import 'react-toastify/dist/ReactToastify.css';

// Import Context Provider
import { WishlistProvider } from './context/WishlistContext';

// Import Components and Pages
import Navbar from './components/Navbar';
import Products from './pages/Products';
import Wishlist from './pages/Wishlist';

/**
 * Main App Component
 */
function App() {
  // Use state to manage current page navigation ('products' or 'wishlist')
  // This keeps routing beginner-friendly without needing react-router-dom
  const [currentPage, setCurrentPage] = useState('products');

  return (
    // Wrap entire app in WishlistProvider to share wishlist state globally
    <WishlistProvider>
      <div className="app-container">
        {/* Navigation Bar */}
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

        {/* Page Switcher */}
        {currentPage === 'products' ? (
          <Products />
        ) : (
          <Wishlist setCurrentPage={setCurrentPage} />
        )}

        {/* Global Toast Notification Container */}
        {/* position, autoClose time, and custom styles are set here */}
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
    </WishlistProvider>
  );
}

export default App;
