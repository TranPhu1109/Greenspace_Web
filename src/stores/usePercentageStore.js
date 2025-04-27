import { create } from "zustand";
import api from "@/api/api"; // Giả định bạn đã có instance api config sẵn

const usePercentageStore = create((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchPercentage: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/api/percentage");
      set({ data: response.data, loading: false });
    } catch (error) {
      console.error("Fetch percentage error:", error);
      set({ data: null, error: error?.response?.data?.error || "Error fetching data", loading: false });
    }
  },

  createPercentage: async (payload) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/api/percentage", payload);
      set({ data: response.data, loading: false });
      return true;
    } catch (error) {
      console.error("Create percentage error:", error);
      set({ error: error?.response?.data?.error || "Error creating data", loading: false });
      return false;
    }
  },

  updatePercentage: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/percentage/${id}`, payload);
      set({ data: response.data, loading: false });
      return true;
    } catch (error) {
      console.error("Update percentage error:", error);
      set({ error: error?.response?.data?.error || "Error updating data", loading: false });
      return false;
    }
  },
}));

export default usePercentageStore;
