import { create } from "zustand";
import api from "@/api/api";

const useWorkTaskStore = create((set, get) => ({
  workTasks: [],
  isLoading: false,
  error: null,
  selectedTask: null,

  // Fetch work tasks for a specific user
  fetchWorkTasks: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/api/worktask/${userId}/users`);
      set({ 
        workTasks: response.data || [], 
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching work tasks:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch work tasks",
        isLoading: false,
        workTasks: []
      });
      throw error;
    }
  },

  // Set selected task
  setSelectedTask: (task) => {
    set({ selectedTask: task });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      workTasks: [],
      isLoading: false,
      error: null,
      selectedTask: null
    });
  }
}));

export default useWorkTaskStore;
