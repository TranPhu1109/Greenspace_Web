import { create } from 'zustand';
import api from '@/api/api';

const usePolicyStore = create((set) => ({
  policies: [],
  currentPolicy: null,
  isLoading: false,
  error: null,

  // Fetch all policies
  fetchPolicies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/policy');
      set({ policies: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      // Xử lý trường hợp đặc biệt khi không có dữ liệu (404 với thông báo cụ thể)
      if (error.response?.status === 404 && 
          error.response?.data?.error === "There are no Policy in the database!") {
        // Đây không phải là lỗi thực sự, chỉ là chưa có dữ liệu
        set({ policies: [], isLoading: false, error: null });
        return [];
      }
      
      // Các lỗi khác
      const errorMessage = error.response?.data?.error || 'Không thể tải danh sách chính sách';
      set({ error: errorMessage, isLoading: false, policies: [] });
      return [];
    }
  },

  // Fetch policy by ID
  fetchPolicyById: async (id) => {
    try {
      const response = await api.get(`/api/policy/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Không thể tải chính sách';
      throw new Error(errorMessage);
    }
  },

  // Create new policy
  createPolicy: async (policyData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/policy', policyData);
      set((state) => ({
        policies: [...state.policies, response.data],
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Không thể tạo chính sách mới';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update policy
  updatePolicy: async (id, policyData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/policy/${id}`, policyData);
      set((state) => ({
        policies: state.policies.map(policy => 
          policy.id === id ? response.data : policy
        ),
        currentPolicy: response.data,
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Không thể cập nhật chính sách';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Delete policy
  deletePolicy: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/policy/${id}`);
      set((state) => ({
        policies: state.policies.filter(policy => policy.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Không thể xóa chính sách';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Reset current policy
  resetCurrentPolicy: () => set({ currentPolicy: null }),

  // Clear errors
  clearError: () => set({ error: null })
}));

export default usePolicyStore; 