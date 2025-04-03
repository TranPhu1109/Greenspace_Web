import { create } from 'zustand';
import axios, { isCancel } from '../api/api';

const useDesignOrderStore = create((set, get) => ({
  designOrders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  reset: () => {
    set({
      designOrders: [],
      selectedOrder: null,
      isLoading: false,
      error: null
    });
  },

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

  fetchDesignOrdersForCus: async (userId, componentId) => {
    try {
      set({ isLoading: true, error: null });
      console.log('Fetching orders for user:', userId);
      const response = await axios.get(`/api/serviceorder/userid-usingidea/${userId}`, {
        componentId,
        allowDuplicate: false
      });
      
      // Skip processing if the request was canceled
      if (response.status === 'canceled') {
        set({ isLoading: false });
        return;
      }
      
      console.log('Orders received:', response.data);
      set({ 
        designOrders: Array.isArray(response.data) ? response.data : [],
        isLoading: false 
      });
    } catch (error) {
      // Only handle non-cancellation errors
      if (!isCancel(error)) {
        console.error("Error fetching design orders:", error);
        set({ 
          error: error.message,
          isLoading: false,
          designOrders: [] // Clear orders on error
        });
      } else {
        // Reset loading state for cancellations
        set({ isLoading: false });
      }
    }
  },

  updateStatus: async (orderId, newStatus) => {
    try {
      set({ isLoading: true, error: null });
      
      // Convert text status to number if needed
      const statusMap = {
        "Pending": 0,
        "PaymentSuccess": 6,
        "Processing": 7,
        "PickedPackageAndDelivery": 8,
        "DeliveryFail": 9,
        "ReDelivery": 10,
        "DeliveredSuccessfully": 11,
        "CompleteOrder": 12,
        "OrderCancelled": 13
      };
      
      const numericStatus = typeof newStatus === 'string' ? statusMap[newStatus] : newStatus;
      
      const response = await axios.put(`/api/serviceorder/status/${orderId}`, { 
        status: numericStatus,
        deliveryCode: "" // Empty string as requested
      });
      
      // Update the order in the store
      set(state => ({
        designOrders: state.designOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ),
        selectedOrder: state.selectedOrder?.id === orderId 
          ? { ...state.selectedOrder, status: newStatus }
          : state.selectedOrder,
        isLoading: false
      }));

      return response.data;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      throw error;
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