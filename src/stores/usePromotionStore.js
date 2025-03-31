import { create } from 'zustand';
import axios from '../api/api';

const usePromotionStore = create((set) => ({
  promotions: [],
  isLoading: false,
  error: null,

  fetchPromotions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/promotions');
      console.log(response.data);
      // Transform the data to include product details
      const transformedPromotions = response.data.map(promotion => ({
        ...promotion,
        products: Array.isArray(promotion.products) ? promotion.products : [],
        status: new Date(promotion.endDate) < new Date() ? 'expired' : 'active'
      }));
      set({ promotions: transformedPromotions, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createPromotion: async (promotionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/promotions', promotionData);
      set(state => ({
        promotions: [...state.promotions, response.data],
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updatePromotion: async (id, promotionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/api/promotions/${id}`, promotionData);
      set(state => ({
        promotions: state.promotions.map(p => 
          p.id === id ? response.data : p
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deletePromotion: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/api/promotions/${id}`);
      set(state => ({
        promotions: state.promotions.filter(p => p.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));

export default usePromotionStore;