import { create } from 'zustand';
import axios from '../api/api';

const useDesignCategoryStore = create((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.get('/api/designcategories');
      set({ 
        categories: Array.isArray(response.data) ? response.data : [],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        categories: [],
        isLoading: false,
        error: error.message 
      });
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await axios.post('/api/designcategories', categoryData);
      set((state) => ({
        categories: [...state.categories, response.data]
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateCategory: async (id, formData) => {
    try {
      const response = await axios.put(`/api/designcategories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set((state) => ({
        categories: state.categories.map(cat => 
          cat.id === id ? response.data : cat
        )
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await axios.delete(`/api/designcategories/${id}`);
      set((state) => ({
        categories: state.categories.filter(cat => cat.id !== id)
      }));
    } catch (error) {
      throw error;
    }
  }
}));

export default useDesignCategoryStore;