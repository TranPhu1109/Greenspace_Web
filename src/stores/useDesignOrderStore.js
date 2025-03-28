import { create } from 'zustand';
import axios from '../api/api';

const useDesignOrderStore = create((set) => ({
  designOrders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  fetchDesignOrders: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.get('/api/serviceorder/usingidea');
      set({ 
        designOrders: response.data,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  getDesignOrderById: async (id) => {
    try {
      set({ isLoading: true });
      const response = await axios.get(`/api/serviceorder/${id}`);
      set({ 
        selectedOrder: response.data,
        isLoading: false 
      });
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },
}));

export default useDesignOrderStore;