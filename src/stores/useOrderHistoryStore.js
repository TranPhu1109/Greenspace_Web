import { create } from 'zustand';
import axios from '@/api/api';

const useOrderHistoryStore = create((set) => ({
  orders: [],
  loading: false,
  error: null,

  // Fetch order history
  fetchOrderHistory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/orderproducts/user');
      set({ orders: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Có lỗi xảy ra khi tải lịch sử đơn hàng',
        loading: false
      });
    }
  },

  // Clear store data
  clearStore: () => {
    set({ orders: [], loading: false, error: null });
  }
}));

export default useOrderHistoryStore;