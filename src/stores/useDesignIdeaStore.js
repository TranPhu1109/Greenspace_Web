import { create } from 'zustand';
import axios from '../api/api';

const useDesignIdeaStore = create((set, get) => ({
  designIdeas: [],

  currentDesign: null,
 designIdeaById:{},

  isLoading: false,
  error: null,
  abortController: null,

  fetchDesignIdeas: async (componentId) => {
    try {
      set({ isLoading: true });
      const response = await axios.get('/api/designidea', {
        componentId,
        allowDuplicate: false
      });
      set({ 
        designIdeas: Array.isArray(response.data) ? response.data : [],
        isLoading: false 
      });
    } catch (error) {
      // Skip setting error state if it's just a cancellation
      if (!axios.isCancel(error)) {
        set({ 
          designIdeas: [],
          isLoading: false,
          error: error.message 
        });
      }
    }
  },

  fetchDesignIdeaById: async (id, componentId) => {
    try {
      set({ 
        isLoading: true,
        designIdeaById: {},
        error: null
      });
      const response = await axios.get(`/api/designidea/${id}`, {
        componentId,
        allowDuplicate: false
      });
      
      // Only update state if we got successful data
      if (response.status !== 'canceled' && response.data) {
        set({ 
          designIdeaById: response.data,
          isLoading: false 
        });
        return response.data;
      }
      
      // If request was canceled, just stop the loading state
      if (response.status === 'canceled') {
        set({ isLoading: false });
        return null;
      }
    } catch (error) {
      // Skip setting error state if it's just a cancellation
      if (!axios.isCancel(error)) {
        set({ 
          isLoading: false,
          error: error.message,
          designIdeaById: {}
        });
        throw error;
      }
      // If canceled, just reset the loading state
      set({ isLoading: false });
    }
  },

  createDesignIdea: async (designData) => {
    try {
      const response = await axios.post('/api/designidea', designData);
      set((state) => ({
        designIdeas: [...state.designIdeas, response.data]
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDesignIdea: async (id, designData) => {
    try {
      const response = await axios.put(`/api/designidea/${id}`, designData);
      set((state) => ({
        designIdeas: state.designIdeas.map(idea => 
          idea.id === id ? response.data : idea
        )
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteDesignIdea: async (id) => {
    try {
      await axios.delete(`/api/designidea/${id}`);
      set((state) => ({
        designIdeas: state.designIdeas.filter(idea => idea.id !== id)
      }));
      return true;
    } catch (error) {
      throw error;
    }
  },

  fetchDesignIdeaById: async (id) => {
    // Cancel any existing request
    if (get().abortController) {
      get().abortController.abort();
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    set({ abortController: controller });

    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`/api/designidea/${id}`, {
        signal: controller.signal
      });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      set({ 
        currentDesign: response.data,
        isLoading: false,
        error: null,
        abortController: null
      });
      return response.data;
    } catch (error) {
      // Only update state if the error is not from cancellation
      if (error.name !== 'CanceledError') {
        console.error('Error fetching design:', error);
        set({ 
          currentDesign: null,
          isLoading: false,
          error: error.response?.data?.message || error.message || 'Failed to fetch design',
          abortController: null
        });
      }
      throw error;
    }
  }
}));

export default useDesignIdeaStore;