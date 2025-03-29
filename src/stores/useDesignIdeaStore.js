import { create } from 'zustand';
import axios from '../api/api';

const useDesignIdeaStore = create((set) => ({
  designIdeas: [],
  currentDesign: null,
  isLoading: false,
  error: null,

  fetchDesignIdeas: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.get('/api/designidea');
      set({ 
        designIdeas: Array.isArray(response.data) ? response.data : [],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        designIdeas: [],
        isLoading: false,
        error: error.message 
      });
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
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`/api/designidea/${id}`);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      set({ 
        currentDesign: response.data,
        isLoading: false,
        error: null
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching design:', error);
      set({ 
        currentDesign: null,
        isLoading: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch design'
      });
      throw error;
    }
  }
}));

export default useDesignIdeaStore;