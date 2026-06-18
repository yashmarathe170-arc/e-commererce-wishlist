import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { fetchReviewsSummary } from '../services/reviewApi';
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
  // Store rating summaries mapped by product name
  const [ratingSummaries, setRatingSummaries] = useState({});

  useEffect(() => {
    const loadSummaries = async () => {
      try {
        const data = await fetchReviewsSummary();
        const summariesMap = {};
        data.forEach((item) => {
          summariesMap[item.productName] = {
            averageRating: item.averageRating,
            totalReviews: item.totalReviews
          };
        });
        setRatingSummaries(summariesMap);
      } catch (error) {
        console.error('Failed to load reviews summaries:', error);
      }
    };

    loadSummaries();
  }, []);

  // Callback to update a product's average rating in local state when a review changes
  const handleRatingUpdate = (productName, averageRating, totalReviews) => {
    setRatingSummaries((prev) => ({
      ...prev,
      [productName]: { averageRating, totalReviews }
    }));
  };

  return (
    <div className="products-page">
      {/* Page Header */}
      <header className="page-header">
        <h1>Discover Products</h1>
        <p>Explore our curated collection of high-quality essentials.</p>
      </header>

      {/* Grid of Product Cards */}
      <main className="products-grid">
        {MOCK_PRODUCTS.map((product) => {
          const summary = ratingSummaries[product.name] || { averageRating: 0, totalReviews: 0 };
          return (
            <ProductCard
              key={product.id}
              product={product}
              averageRating={summary.averageRating}
              totalReviews={summary.totalReviews}
              onRatingUpdate={handleRatingUpdate}
            />
          );
        })}
      </main>
    </div>
  );
};

export default Product;
