import { create } from "zustand";
import axios from "../api/api";
import useAuthStore from "./useAuthStore";

const useComplaintStore = create((set, get) => ({
  loading: false,
  error: null,
  complaints: [],
  refundComplaints: [],

  // Create a complaint (refund or exchange)
  createComplaint: async (complaintData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post("/api/complaint", complaintData);

      if (response.status === 201 || response.status === 200) {
        set({ loading: false });
        return response.data;
      }
      throw new Error("Failed to create complaint");
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Create refund request
  createRefundRequest: async (
    orderId,
    productId,
    quantity,
    reason,
    images = {}
  ) => {
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
          quantity: quantity,
        },
      ],
    };

    return useComplaintStore.getState().createComplaint(complaintData);
  },

  // Create exchange request
  createExchangeRequest: async (
    orderId,
    productId,
    quantity,
    reason,
    images = {}
  ) => {
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
          quantity: quantity,
        },
      ],
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
      const response = await axios.get("/api/complaint", {
        params: {
          pageNumber: 0 ,
          pageSize: 100,
        },
      });
      set({ complaints: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch refund complaints
  fetchRefundComplaints: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get("/api/complaint/refund");
      // Check if response.data exists before filtering
      const responseData = response.data || [];
      // Filter complaints with status 'Processing', 'refund', or 'Complete'
      const filteredComplaints = responseData.filter(
        (complaint) =>
          complaint.status === "Processing" ||
          complaint.status === "refund" ||
          complaint.status === "Complete"
      );
      set({ refundComplaints: filteredComplaints, loading: false });
      return filteredComplaints;
    } catch (error) {
      console.error("Error fetching refund complaints:", error);
      set({ refundComplaints: [], error: error.message, loading: false });
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
  },

  fetchUserComplaintsSilent: async (userId) => {
    try {
      const response = await axios.get(`/api/complaint/${userId}/users`);
      set((state) => {
        // Nếu complaints không thay đổi, không cần set lại
        if (JSON.stringify(state.complaints) !== JSON.stringify(response.data)) {
          return { complaints: response.data };
        }
        return {};
      });
      return response.data; // Always return the fetched data
    } catch (error) {
      console.error("Error silently fetching complaints:", error);
      return []; // Return empty array on error
    }
  },

  // Process refund for a complaint
  processRefund: async (complaintId) => {
    set({ loading: true, error: null });
    try {
      // Call the refund API with id as a query parameter
      const response = await axios.post(
        `/api/wallets/refund-complaint?id=${complaintId}`
      );

      if (response.status === 200 || response.status === 201) {
        // After successful refund, update the complaint status
        await get().updateComplaintStatus(
          complaintId,
          4, // Status 4 = Refund
          1, // ComplaintType 1 = Refund
          "" // No delivery code for refunds
        );

        set({ loading: false });
        return response.data;
      } else {
        throw new Error("Hoàn tiền không thành công");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Hoàn tiền thất bại",
        loading: false,
      });
      throw error;
    }
  },

  // Update complaint status
  updateComplaintStatus: async (
    id,
    statusCode,
    complaintType = 0,
    deliveryCode = "",
    reason = null,
    videoURL = null
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/complaint/${id}`, {
        status: statusCode,
        complaintType: complaintType,
        deliveryCode: deliveryCode,
        reason: reason || '',
        videoURL: videoURL
      });

      set({ loading: false });
      return response.data;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Cập nhật trạng thái thất bại",
        loading: false,
      });
      throw error;
    }
  },

  // Update complaint detail with check status
  updateComplaintDetail: async (id, productDetails) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/complaint/complaintdetail/${id}`, {
        complaintDetails: productDetails
      });
      
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({
        error: 
          error.response?.data?.message || 
          error.message || 
          "Cập nhật chi tiết khiếu nại thất bại",
        loading: false,
      });
      throw error;
    }
  },

  // Create shipping order
  createShippingOrder: async (shippingData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        "/api/shipping/create-order",
        shippingData
      );

      set({ loading: false });
      return response.data;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Tạo đơn vận chuyển thất bại",
        loading: false,
      });
      throw error;
    }
  },
}));

export default useComplaintStore;
