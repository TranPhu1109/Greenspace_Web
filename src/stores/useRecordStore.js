import { create } from 'zustand';
import api from '@/api/api';

const useRecordStore = create((set) => ({
  sketchRecords: [],
  isLoading: false,
  error: null,

  // Get sketch records for a service order
  getRecordSketch: async (orderServiceId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/recordsketch/${orderServiceId}/orderservice`);
      set({ 
        sketchRecords: response.data,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      throw error;
    }
  },

  // Reset state
  resetState: () => {
    set({
      sketchRecords: [],
      isLoading: false,
      error: null
    });
  }
}));

export default useRecordStore;
