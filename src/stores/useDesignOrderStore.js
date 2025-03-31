import { create } from 'zustand';
import axios, { isCancel } from '../api/api';

const useDesignOrderStore = create((set) => ({
  designOrders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  fetchDesignOrders: async (componentId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get('/api/serviceorder/usingidea', {
        componentId,
        allowDuplicate: false
      });
      
      // Skip processing if the request was canceled
      if (response.status === 'canceled') {
        set({ isLoading: false });
        return;
      }
      
      set({ 
        designOrders: Array.isArray(response.data) ? response.data : [],
        isLoading: false 
      });
    } catch (error) {
      // Only handle non-cancellation errors
      if (!isCancel(error)) {
        // console.error("Error fetching design orders:", error);
        set({ 
          error: error.message,
          isLoading: false 
        });
      } else {
        // Reset loading state for cancellations
        set({ isLoading: false });
      }
    }
  },

  createDesignOrder: async (orderData) => {
    console.log('orderData', orderData);
    
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post('/api/serviceorder', orderData);
      set({ 
        isLoading: false,
        designOrders: [...useDesignOrderStore.getState().designOrders, response.data]
      });
      return response.data; 
    } catch (error) {
      // Only handle non-cancellation errors
      if (!isCancel(error)) {
        // console.error("Error fetching design orders:", error);
        set({ 
          error: error.message,
          isLoading: false 
        });
      } else {
        // Reset loading state for cancellations
        set({ isLoading: false });
      }
    }
  },


  getDesignOrderById: async (id, componentId) => {

    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`/api/serviceorder/${id}`, {
        componentId,
        allowDuplicate: false
      });
      
      // Skip processing if the request was canceled
      if (response.status === 'canceled') {
        set({ isLoading: false });
        return;
      }
      
      set({ 
        selectedOrder: response.data,
        isLoading: false 
      });
    } catch (error) {
      // Only handle non-cancellation errors
      if (!isCancel(error)) {
        console.error("Error fetching design order:", error);
        set({
          error: error.message,
          isLoading: false
        });
      } else {
        // Reset loading state for cancellations
        set({ isLoading: false });
      }
    }
  },
}));

export default useDesignOrderStore;