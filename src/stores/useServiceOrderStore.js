import api from "@/api/api";
import { create } from "zustand";

const useServiceOrderStore = create((set) => ({
  loading: false,
  error: null,
  serviceOrders: [],
  selectedOrder: null,

  // Tạo đơn đặt thiết kế mới
  createServiceOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/api/serviceorder/nousing", orderData);

      if (!response.data) {
        throw new Error("Đặt thiết kế thất bại");
      }

      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Cập nhật service order cho khách hàng
  updateServiceForCus: async (id, updateData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(
        `/api/serviceorder/customer/${id}`,
        updateData
      );

      if (!response.data) {
        throw new Error("Cập nhật đơn hàng thất bại");
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
        throw new Error("Không thể lấy danh sách đơn đặt thiết kế");
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
  getServiceOrdersNoIdea: async (silent = false) => {
    if (!silent) set({ loading: true, error: null });
    try {
      const response = await api.get("/api/serviceorder/noidea", {
        params: {
          pageNumber: 0,
          pageSize: 100,
        },
        allowDuplicate: true,
      });

      // Check if response exists and has data property
      if (!response || !response.data) {
        throw new Error("Không thể lấy danh sách đơn thiết kế mới");
      }

      // Ensure we're setting an array
      const orders = Array.isArray(response.data) ? response.data : [];

      set({
        serviceOrders: orders,
        loading: false,
        error: null,
      });

      return orders;
    } catch (error) {
      console.error("Error in getServiceOrdersNoIdea:", error);
      set({
        error: error.message || "Không thể lấy danh sách đơn thiết kế mới",
        ...(silent ? {} : { loading: false }),
      });
      throw error;
    }
  },

  // Lấy danh sách đơn thiết kế không có mẫu theo userId
  getServiceOrdersNoUsingIdea: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(
        `/api/serviceorder/userid-nousingidea/${userId}`,
        {
          params: {
            pageNumber: 0,
            pageSize: 1000,
          },
        }
      );

      // Check if response exists and has data property
      if (!response || !response.data) {
        console.error("Invalid API response:", response);
        throw new Error("Không thể lấy danh sách đơn thiết kế");
      }

      // Ensure we're setting an array
      const orders = Array.isArray(response.data) ? response.data : [];
      console.log("Service orders loaded:", orders.length);

      set({
        serviceOrders: orders,
        loading: false,
        error: null,
      });

      return orders;
    } catch (error) {
      console.error("Error in getServiceOrdersNoUsingIdea:", error);
      set({
        error: error.message || "Không thể lấy danh sách đơn thiết kế",
        loading: false,
      });
      throw error;
    }
  },

  // Hủy đơn hàng
  cancelServiceOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/serviceorder/status/${orderId}`, {
        status: 14, // OrderCancelled status
      });

      if (!response.data) {
        throw new Error("Không thể hủy đơn hàng");
      }

      // Update the order in the local state
      set((state) => ({
        serviceOrders: state.serviceOrders.map((order) =>
          order.id === orderId ? { ...order, status: "OrderCancelled" } : order
        ),
        loading: false,
      }));

      return response.data;
    } catch (error) {
      console.error("Error in cancelServiceOrder:", error);
      set({
        error: error.message || "Không thể hủy đơn hàng",
        loading: false,
      });
      throw error;
    }
  },

  // Cập nhật trạng thái đơn hàng
  updateServiceOrderStatus: async (orderId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/serviceorder/status/${orderId}`, {
        status: status,
      });

      if (!response.data) {
        throw new Error("Không thể cập nhật trạng thái đơn hàng");
      }

      // Update the order in the local state
      set((state) => ({
        serviceOrders: state.serviceOrders.map((order) =>
          order.id === orderId ? { ...order, status: status.toString() } : order
        ),
        loading: false,
      }));

      return response.data;
    } catch (error) {
      console.error("Error in updateServiceOrderStatus:", error);
      set({
        error: error.message || "Không thể cập nhật trạng thái đơn hàng",
        loading: false,
      });
      throw error;
    }
  },

  updateTaskOrder: async (taskId, taskData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/worktask/${taskId}`, taskData);

      if (!response.data) {
        throw new Error("Không thể cập nhật trạng thái công việc");
      }
    } catch (error) {
      console.error("Error in updateTaskOrderStatus:", error);
      set({
        error: error.message || "Không thể cập nhật trạng thái công việc",
        loading: false,
      });
      throw error;
    }
  },
  // Lấy chi tiết đơn thiết kế theo id
  getServiceOrderById: async (id, silent = false) => {
    if (!silent) set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/serviceorder/${id}`);
      if (!response.data) {
        throw new Error("Không thể lấy thông tin đơn thiết kế");
      }
      // set({ selectedOrder: response.data, ...(silent ? {} : { loading: false }) , error: null });
      const current = useServiceOrderStore.getState().selectedOrder;
      const isDifferent =
        JSON.stringify(current) !== JSON.stringify(response.data);

      if (isDifferent) {
        set({
          selectedOrder: response.data,
          ...(silent ? {} : { loading: false }),
          error: null,
        });
      }
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      if (!silent) set({ loading: false });
    }
  },

  // Reset state
  resetState: () => {
    set({
      loading: false,
      error: null,
      serviceOrders: [],
      selectedOrder: null,
    });
  },
}));

export default useServiceOrderStore;
