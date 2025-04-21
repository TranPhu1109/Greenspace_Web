import { create } from "zustand";
import axios from "../api/api";

// Add delete function to the store
const useUserStore = create((set) => ({
  users: [],
  designers: [],
  bannedUsers: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.get("/api/users");
      set({
        users: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  fetchDesigner: async () => {
    try {
      set({ isLoading: true, designers: [] });
      const response = await axios.get("/api/users/designer");
      set({
        users: response.data,
        isLoading: false,
        designers: response.data,
      });
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
        designers: [],
      });
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axios.post("/api/users", userData);
      set((state) => ({
        users: [...state.users, response.data],
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  banUser: async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },

  fetchBannedUsers: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.get("/api/users/banned");
      set({
        bannedUsers: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  unbanUser: async (userId) => {
    try {
      await axios.put(`/api/users/unban${userId}`);
      set((state) => ({
        bannedUsers: state.bannedUsers.filter((user) => user.id !== userId),
      }));
    } catch (error) {
      throw error;
    }
  },
}));

export default useUserStore;
