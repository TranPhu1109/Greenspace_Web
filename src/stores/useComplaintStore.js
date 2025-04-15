import { create } from "zustand";
import axios from "../api/api";
import useAuthStore from "./useAuthStore";

const useComplaintStore = create((set, get) => ({
  loading: false,
  error: null,
  complaints: [],

  // Create a complaint (refund or exchange)
  createComplaint: async (complaintData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post("/api/complaint", complaintData);
      
      if (response.status === 201 || response.status === 200) {
        set({ loading: false });
        return response.data;
      }
      throw new Error('Failed to create complaint');
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Create refund request
  createRefundRequest: async (orderId, productId, quantity, reason, images = {}) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("User not authenticated");

    const complaintData = {
      userId: user.id,
      orderId: orderId,
      complaintType: 1, // 1 for refund
      reason: reason,
      image: images,
      complaintDetails: [
        {
          productId: productId,
          quantity: quantity
        }
      ]
    };

    return useComplaintStore.getState().createComplaint(complaintData);
  },

  // Create exchange request
  createExchangeRequest: async (orderId, productId, quantity, reason, images = {}) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("User not authenticated");

    const complaintData = {
      userId: user.id,
      orderId: orderId,
      complaintType: 0, // 0 for exchange
      reason: reason,
      image: images,
      complaintDetails: [
        {
          productId: productId,
          quantity: quantity
        }
      ]
    };

    return useComplaintStore.getState().createComplaint(complaintData);
  },

  // Existing functions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setComplaints: (complaints) => set({ complaints }),

  // Additional functions can be added here

  fetchComplaints: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get("/api/complaint");
      set({ complaints: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateComplaint: async (id, status) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.put(`/api/complaint/${id}`, { status });
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteComplaint: async (id) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/api/complaint/${id}`);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch complaints by user ID
  fetchUserComplaints: async (userId) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(`/api/complaint/${userId}/users`);
      set({ complaints: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

export default useComplaintStore; 