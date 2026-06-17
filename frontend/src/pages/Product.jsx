import React from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/Product.css';

// A collection of mock products to show on the storefront.
const MOCK_PRODUCTS = [
  { id: 1, name: 'Minimalist Leather Backpack', price: 120.00 },
  { id: 2, name: 'Wireless Noise-Canceling Headphones', price: 299.00 },
  { id: 3, name: 'Mechanical Gaming Keyboard', price: 89.00 },
  { id: 4, name: 'Smart Fitness Watch', price: 199.00 },
  { id: 5, name: 'Portable Bluetooth Speaker', price: 59.00 },
  { id: 6, name: 'Ergonomic Desk Chair', price: 349.00 },
  { id: 7, name: 'Double-Walled Coffee Mug', price: 25.00 },
  { id: 8, name: 'USB-C Multi-Port Hub', price: 45.00 }
];

/**
 * Product Page listing available shop items.
 */
const Product = () => {
  return (
    <div className="products-page">
      {/* Page Header */}
      <header className="page-header">
        <h1>Discover Products</h1>
        <p>Explore our curated collection of high-quality essentials.</p>
      </header>

      {/* Grid of Product Cards */}
      <main className="products-grid">
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </main>
    </div>
  );
};

export default Product;
