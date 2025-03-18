import { create } from 'zustand';
import axios from '../api/api';

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  
  // Hàm đăng nhập, thay đổi endpoint '/api/login' theo API của bạn
  login: async (email, password, rememberMe) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/login', { email, password, rememberMe });
      set({ user: response.data, loading: false });
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },
  
  // Hàm đăng ký, thay đổi endpoint '/api/register' theo API của bạn
  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/register', { name, email, password });
      set({ user: response.data, loading: false });
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },
  
  logout: () => set({ user: null }),
}));

export default useAuthStore;
