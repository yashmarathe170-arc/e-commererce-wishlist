import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import {
  fetchOrdersApi,
  placeOrderApi,
  cancelOrderApi
} from '../services/orderApi';

const OrderContext = createContext();

export const MOCK_USER_ID = 'mock_user_123';

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch orders when the provider mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch user orders from database
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrdersApi(MOCK_USER_ID);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Unable to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Place a new order
  const placeOrder = async (items) => {
    setLoading(true);
    try {
      const response = await placeOrderApi({
        userId: MOCK_USER_ID,
        items
      });
      // Add the new order at the beginning of the order history
      setOrders((prevOrders) => [
        {
          ...response.order,
          items: response.items
        },
        ...prevOrders
      ]);
      toast.success('Order Placed Successfully');
      return true; // Return true to indicate success
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Order Failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cancel an existing order by ID
  const cancelOrder = async (orderId) => {
    try {
      const response = await cancelOrderApi(orderId);
      // Update the order in local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: 'Cancelled' }
            : order
        )
      );
      toast.success('Order Cancelled');
      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Unable to Cancel');
      return false;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        fetchOrders,
        placeOrder,
        cancelOrder
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
