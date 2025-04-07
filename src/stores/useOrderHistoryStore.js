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
      if (error.response?.status === 404) {
        set({ orders: [], loading: false });
      } else {
        set({
          error: error.response?.data?.message || 'Có lỗi xảy ra khi tải lịch sử đơn hàng',
          loading: false
        });
      }
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      await axios.put(`/api/orderproducts/status/${orderId}`, {
        status: 3,
        deliveryCode: ''
      });
      await set.getState().fetchOrderHistory();
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng',
        loading: false
      });
      return false;
    }
  },

  // Clear store data
  clearStore: () => {
    set({ orders: [], loading: false, error: null });
  }
}));

export default useOrderHistoryStore;