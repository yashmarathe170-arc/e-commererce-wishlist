import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import {
  fetchWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi
} from '../services/wishlistApi';

// 1. Create the Context object
const WishlistContext = createContext();

// 2. Create the Provider component
export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch the wishlist when the app or provider mounts
  useEffect(() => {
    fetchWishlist();
  }, []);

  // Function to fetch all wishlist items from the backend
  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await fetchWishlistApi();
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Something Went Wrong');
    } finally {
      setLoading(false);
    }
  };

  // Function to add a product to the wishlist
  const addToWishlist = async (productName, price) => {
    try {
      const savedItem = await addToWishlistApi({ productName, price });
      // Update the local state with the newly added item (placed at the top)
      setWishlist((prevList) => [savedItem, ...prevList]);
      
      // Success Notification
      toast.success('Added to Wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Check if the backend specifically returned 'Already Exists'
      if (error.message === 'Already Exists') {
        toast.error('Already Exists');
      } else {
        toast.error('Something Went Wrong');
      }
    }
  };

  // Function to remove an item from the wishlist by its ID
  const removeFromWishlist = async (id) => {
    try {
      await removeFromWishlistApi(id);
      // Remove the item from local state by filtering it out
      setWishlist((prevList) => prevList.filter((item) => item._id !== id));
      
      // Success Notification
      toast.success('Removed Successfully');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Something Went Wrong');
    }
  };

  // Provide state and handlers to all children components
  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// 3. Custom Hook to easily use the WishlistContext in components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
