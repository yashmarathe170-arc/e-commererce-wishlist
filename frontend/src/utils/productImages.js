/**
 * Product image mapping utility for Add2Cart
 * Matches product names to their respective generated high-quality assets.
 */
export const PRODUCT_IMAGES = {
  'Minimalist Leather Backpack': '/images/backpack.png',
  'Wireless Noise-Canceling Headphones': '/images/headphones.png',
  'Mechanical Gaming Keyboard': '/images/keyboard.png',
  'Smart Fitness Watch': '/images/watch.png',
  'Portable Bluetooth Speaker': '/images/speaker.png',
  'Ergonomic Desk Chair': '/images/chair.png',
  'Double-Walled Coffee Mug': '/images/mug.png',
  'USB-C Multi-Port Hub': '/images/hub.png'
};

/**
 * Safely fetches a product's image path. Fallback to placeholder if not found.
 * @param {string} name - Product name
 * @returns {string} Image source path
 */
export const getProductImage = (name) => {
  return PRODUCT_IMAGES[name] || '/images/favicon.svg';
};
