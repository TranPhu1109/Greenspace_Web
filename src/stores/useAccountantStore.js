import { create } from "zustand";
import api from "../api/api";

const useAccountantStore = create((set, get) => ({
  // State
  serviceOrders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  // Actions
  setServiceOrders: (orders) => set({ serviceOrders: orders }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // API Actions
  fetchServiceOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/api/serviceorder/accountant");
      if (response.data) {
        set({ serviceOrders: response.data, isLoading: false });
        return response.data;
      }
      throw new Error("Không thể lấy danh sách đơn thiết kế");
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getServiceOrderById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/serviceorder/${id}`);
      if (response.data) {
        set({ selectedOrder: response.data, isLoading: false });
        return response.data;
      }
      throw new Error("Không thể lấy thông tin đơn thiết kế");
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateDesignPrice: async (id, designPrice) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/serviceorder/designprice/${id}`, {
        designPrice,
      });
      if (response.data) {
        // Update local state
        const updatedOrder = { ...get().selectedOrder, designPrice };
        set({ selectedOrder: updatedOrder, isLoading: false });
        return response.data;
      }
      throw new Error("Không thể cập nhật giá thiết kế");
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateOrderStatus: async (id, status, deliveryCode = "") => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/serviceorder/status/${id}`, {
        status,
        deliveryCode,
      });
      if (response.data) {
        // Update local state
        const updatedOrder = { ...get().selectedOrder, status };
        set({ selectedOrder: updatedOrder, isLoading: false });
        return response.data;
      }
      throw new Error("Không thể cập nhật trạng thái đơn hàng");
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Reset state
  resetState: () => {
    set({
      serviceOrders: [],
      selectedOrder: null,
      isLoading: false,
      error: null,
    });
  },
}));

export default useAccountantStore; 