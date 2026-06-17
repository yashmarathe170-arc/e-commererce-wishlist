import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import {
  fetchCartApi,
  addToCartApi,
  removeFromCartApi,
  clearCartApi
} from '../services/cartApi';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch the cart when the provider mounts
  useEffect(() => {
    fetchCart();
  }, []);

  // Fetch all cart items from the database
  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await fetchCartApi();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Something Went Wrong');
    } finally {
      setLoading(false);
    }
  };

  // Add a product to the cart
  const addToCart = async (productName, price) => {
    try {
      const savedItem = await addToCartApi({ productName, price });
      // Update local state with the new item at the top
      setCart((prevCart) => [savedItem, ...prevCart]);
      toast.success('Added to Cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.message === 'Already Exists') {
        toast.error('Already Exists');
      } else {
        toast.error('Something Went Wrong');
      }
    }
  };

  // Remove an item from the cart by its ID
  const removeFromCart = async (id) => {
    try {
      await removeFromCartApi(id);
      setCart((prevCart) => prevCart.filter((item) => item._id !== id));
      toast.success('Removed Successfully');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Something Went Wrong');
    }
  };

  // Clear the entire cart locally and in the database
  const clearCart = async () => {
    try {
      await clearCartApi();
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Something Went Wrong');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
