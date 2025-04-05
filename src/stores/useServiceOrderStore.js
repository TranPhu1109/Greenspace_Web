import api from '@/api/api';
import { create } from 'zustand';

const useServiceOrderStore = create((set) => ({
  loading: false,
  error: null,
  serviceOrders: [],
  selectedOrder: null,

  // Tạo đơn đặt thiết kế mới
  createServiceOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/serviceorder/nousing', orderData);
      
      if (!response.data) {
        throw new Error('Đặt thiết kế thất bại');
      }
      
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Lấy danh sách đơn đặt thiết kế
  getServiceOrders: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/serviceorder/user/${userId}`);
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách đơn đặt thiết kế');
      }
      const data = await response.json();
      set({ serviceOrders: data });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Lấy danh sách đơn thiết kế mới không có mẫu
  getServiceOrdersNoIdea: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/serviceorder/noidea');
      if (!response.data) {
        throw new Error('Không thể lấy danh sách đơn thiết kế mới');
      }
      set({ serviceOrders: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Lấy danh sách đơn thiết kế không có mẫu theo userId
  getServiceOrdersNoUsingIdea: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/serviceorder/userid-nousingidea/${userId}`);
      if (!response.data) {
        throw new Error('Không thể lấy danh sách đơn thiết kế');
      }
      set({ serviceOrders: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Lấy chi tiết đơn thiết kế theo id
  getServiceOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/serviceorder/${id}`);
      if (!response.data) {
        throw new Error('Không thể lấy thông tin đơn thiết kế');
      }
      set({ selectedOrder: response.data, loading: false , error: null });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Reset state
  resetState: () => {
    set({
      loading: false,
      error: null,
      serviceOrders: [],
      selectedOrder: null
    });
  }
}));

export default useServiceOrderStore;