import { create } from 'zustand';
import api from '../api/api';

const useShippingStore = create((set) => ({
  shippingFee: 0,
  order_code: '',
  loading: false,
  error: null,

  calculateShippingFee: async (addressData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/api/shipping/calculate-fee', addressData);

      if (response.data?.data?.code === 200) {
        set({ shippingFee: response.data.data.data.service_fee });
        return response.data.data.service_fee;
      }
      throw new Error('Failed to calculate shipping fee');
    } catch (error) {
      set({ error: error.message });
      console.error('Error calculating shipping fee:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createShippingOrder: async (shippingData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/api/shipping/create-order', shippingData);
      
      if (response.data?.data?.code === 200) {
        set({ order_code: response.data.data.data.order_code });
        return response.data;
      }
      throw new Error('Không thể tạo đơn vận chuyển');
    } catch (error) {
      set({ error: error.message });
      console.error('Error creating shipping order:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resetShippingFee: () => set({ shippingFee: 0, error: null })
}));

export default useShippingStore;