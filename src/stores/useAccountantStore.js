import { create } from "zustand";
import api from "../api/api";

const useAccountantStore = create((set, get) => ({
  // State
  serviceOrders: [],
  materialPriceOrders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  // Actions
  setServiceOrders: (orders) => set({ serviceOrders: orders }),
  setMaterialPriceOrders: (orders) => set({ materialPriceOrders: orders }),
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

  fetchMaterialPriceOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/api/serviceorder/materialprice");
      if (response.data) {
        set({ materialPriceOrders: response.data, isLoading: false });
        return response.data;
      }
      throw new Error("Không thể lấy danh sách đơn thiết kế đang xác định giá vật liệu");
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

  updateOrderStatus: async (id, status, deliveryCode = "", reportAccoutant = "", reportManger = "") => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/serviceorder/status/${id}`, {
        status,
        deliveryCode,
        reportAccoutant,
        reportManger,
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

  updateServiceOrderDetails: async (orderId, details) => {
    set({ isLoading: true, error: null });
    const { selectedOrder } = get(); // Get current order state

    if (!selectedOrder || selectedOrder.id !== orderId) {
      set({ isLoading: false, error: "Selected order not found or ID mismatch." });
      throw new Error("Selected order not found or ID mismatch.");
    }

    // Prepare the payload, preserving existing data and updating details
    const payload = {
      serviceType: selectedOrder.serviceType === "UsingDesignIdea" ? 0 : 1, // Assuming 0 for UsingDesignIdea, 1 otherwise - adjust if needed
      designPrice: selectedOrder.designPrice || 0,
      skecthReport: selectedOrder.skecthReport || "",
      description: selectedOrder.description || "",
      status: 5, // Keep current status or update if needed? Using current for now.
      report: selectedOrder.report || "",
      reportManger: selectedOrder.reportManger || "",
      reportAccoutant: selectedOrder.reportAccoutant || "",
      serviceOrderDetails: details.map(detail => ({
        productId: detail.productId,
        quantity: detail.quantity,
      })),
    };

    try {
      const response = await api.put(`/api/serviceorder/${orderId}`, payload);
      if (response.status === 200 || response.status === 201 || response.status === 204) {
        set({ isLoading: false });
        // No need to update selectedOrder here, getServiceOrderById will be called after this
        return response.data; // Or handle success as needed
      } else {
        throw new Error(`Failed to update service order details: Status ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating service order details:", error);
      const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  // Reset state
  resetState: () => {
    set({
      serviceOrders: [],
      materialPriceOrders: [],
      selectedOrder: null,
      isLoading: false,
      error: null,
    });
  },
}));

export default useAccountantStore; 