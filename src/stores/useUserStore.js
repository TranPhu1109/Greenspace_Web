import { create } from 'zustand';
import axios from '../api/api';

// Add delete function to the store
const useUserStore = create((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.get('/api/users');
      set({ 
        users: response.data,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axios.post('/api/users', userData);
      set((state) => ({
        users: [...state.users, response.data]
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      set((state) => ({
        users: state.users.filter(user => user.id !== id)
      }));
    } catch (error) {
      throw error;
    }
  }
}));

export default useUserStore;