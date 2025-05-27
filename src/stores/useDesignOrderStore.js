import { create } from 'zustand';
import axios, { isCancel } from '../api/api';

const useDesignOrderStore = create((set, get) => ({
  designOrders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  reset: () => {
    set({
      designOrders: [],
      selectedOrder: null,
      isLoading: false,
      error: null
    });
  },

  fetchDesignOrders: async (componentId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get('/api/serviceorder/usingidea', {
        componentId,
        allowDuplicate: false
      });
      
      // Skip processing if the request was canceled
      if (response.status === 'canceled') {
        set({ isLoading: false });
        return;
      }
      
      set({ 
        designOrders: Array.isArray(response.data) ? response.data : [],
        isLoading: false 
      });
    } catch (error) {
      // Only handle non-cancellation errors
      if (!isCancel(error)) {
        // console.error("Error fetching design orders:", error);
        set({ 
          error: error.message,
          isLoading: false 
        });
      } else {
        // Reset loading state for cancellations
        set({ isLoading: false });
      }
    }
  },

  fetchDesignOrdersForCus: async (userId, componentId) => {
    try {
      set({ isLoading: true, error: null });
      //console.log('Fetching orders for user:', userId);
      const response = await axios.get(`/api/serviceorder/userid-usingidea/${userId}`, {
        componentId,
        allowDuplicate: false
      });
      
      // Skip processing if the request was canceled
      if (response.status === 'canceled') {
        set({ isLoading: false });
        return;
      }
      
      console.log('Orders received:', response.data);
      set({ 
        designOrders: Array.isArray(response.data) ? response.data : [],
        isLoading: false 
      });
    } catch (error) {
      // Only handle non-cancellation errors
      if (!isCancel(error)) {
        console.error("Error fetching design orders:", error);
        set({ 
          error: error.message,
          isLoading: false,
          designOrders: [] // Clear orders on error
        });
      } else {
        // Reset loading state for cancellations
        set({ isLoading: false });
      }
    }
  },

  updateStatus: async (orderId, newStatus, deliveryCode = "", reportManger = "", reportAccoutant = "") => {
    try {
      set({ isLoading: true, error: null });
      
      // Convert text status to number if needed
      const statusMap = {
        "Pending": 0,                   // Chờ xử lý
        "ConsultingAndSketching": 1,    // Đang tư vấn & phác thảo
        "DeterminingDesignPrice": 2,    // Đang xác định giá thiết kế
        "DepositSuccessful": 3,         // Đặt cọc thành công
        "AssignToDesigner": 4,          // Đã giao cho nhà thiết kế
        "DeterminingMaterialPrice": 5,   // xác dịnh giá vật liệu
        "DoneDesign": 6,                // Hoàn thành thiết kế
        "PaymentSuccess": 7,            // Thanh toán thành công
        "Processing": 8,                // Đang xử lý
        "PickedPackageAndDelivery": 9,  // Đã lấy hàng & đang giao
        "DeliveryFail": 10,             // Giao hàng thất bại
        "ReDelivery": 11,               // Giao lại
        "DeliveredSuccessfully": 12,    // Đã giao hàng thành công
        "CompleteOrder": 13,            // Hoàn thành đơn hàng
        "OrderCancelled": 14,           // Đơn hàng đã bị hủy
        "Warning": 15,                  // cảnh báo vượt 30%
        "Refund": 16,
        "DoneRefund": 17,
        "StopService": 18,
        "ReConsultingAndSketching ": 19,
        "ReDesign": 20,
        "WaitDeposit ": 21,
        "DoneDeterminingDesignPrice": 22, // Hoàn thành xác định giá thiết kế
        "DoneDeterminingMaterialPrice": 23, // Hoàn thành xác định giá vật liệu
        "ReDeterminingDesignPrice": 24, // Xác định lại giá thiết kế
        "ExchangeProduct": 25, // Đổi sản phẩm
      };
      
      const numericStatus = typeof newStatus === 'string' ? statusMap[newStatus] : newStatus;
      
      const response = await axios.put(`/api/serviceorder/status/${orderId}`, { 
        status: numericStatus,
        deliveryCode: deliveryCode || "",
        reportManger: reportManger || "",
        reportAccoutant: reportAccoutant || "",
      });
      
      // Update the order in the store
      set(state => ({
        designOrders: state.designOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus, deliveryCode } : order
        ),
        selectedOrder: state.selectedOrder?.id === orderId 
          ? { ...state.selectedOrder, status: newStatus, deliveryCode }
          : state.selectedOrder,
        isLoading: false
      }));

      return response.data;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      throw error;
    }
  },

  updateReport: async (orderId, newStatus, newReportManger, newReportAccoutant) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(`/api/serviceorder/status/${orderId}`, {
        status: newStatus,
        // deliveryCode: "",
        reportManger: newReportManger,
        reportAccoutant: newReportAccoutant
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      throw error;
    }
  },

  createDesignOrder: async (orderData) => {
    console.log('orderData', orderData);
    
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post('/api/serviceorder', orderData);
      set({ 
        isLoading: false,
        designOrders: [...useDesignOrderStore.getState().designOrders, response.data]
      });
      return response.data; 
    } catch (error) {
      // Only handle non-cancellation errors
      if (!isCancel(error)) {
        // console.error("Error fetching design orders:", error);
        set({ 
          error: error.message,
          isLoading: false 
        });
      } else {
        // Reset loading state for cancellations
        set({ isLoading: false });
      }
    }
  },


  getDesignOrderById: async (id, componentId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`/api/serviceorder/${id}`, {
        componentId,
        allowDuplicate: false
      });
      
      // Skip processing if the request was canceled
      if (response.status === 'canceled') {
        set({ isLoading: false });
        return;
      }
      
      set({ 
        selectedOrder: response.data,
        isLoading: false 
      });
    } catch (error) {
      // Only handle non-cancellation errors
      if (!isCancel(error)) {
        console.error("Error fetching design order:", error);
        set({
          error: error.message,
          isLoading: false
        });
      } else {
        // Reset loading state for cancellations
        set({ isLoading: false });
      }
    }
  },

  updateServiceOrder: async (serviceOrderId, updateData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(`/api/serviceorder/${serviceOrderId}`, updateData);
      
      // Update the order in the store
      set(state => ({
        designOrders: state.designOrders.map(order => 
          order.id === serviceOrderId ? { ...order, ...updateData } : order
        ),
        selectedOrder: state.selectedOrder?.id === serviceOrderId 
          ? { ...state.selectedOrder, ...updateData }
          : state.selectedOrder,
        isLoading: false
      }));

      return response.data;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      throw error;
    }
  },

  updateProductOrder: async (serviceOrderId, updateData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(`/api/serviceorder/${serviceOrderId}`, updateData);
      
      // Update the order in the store
      set(state => ({
        designOrders: state.designOrders.map(order => 
          order.id === serviceOrderId ? { ...order, ...updateData } : order
        ),
        selectedOrder: state.selectedOrder?.id === serviceOrderId 
          ? { ...state.selectedOrder, ...updateData }
          : state.selectedOrder,
        isLoading: false
      }));

      return response.data;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      throw error;
    }
  },

  updateDepositSettings: async (serviceOrderId, depositPercentage, refundPercentage) => {
    try {
      set({ isLoading: true, error: null });
      
      // Validate input values
      const deposit = parseFloat(depositPercentage);
      const refund = parseFloat(refundPercentage);
 
      // Call the API to update deposit settings
      const response = await axios.put(`/api/serviceorder/deposit/${serviceOrderId}`, {
        depositPercentage: deposit,
        refundPercentage: refund
      });
      
      // Update the order in the store
      set(state => ({
        designOrders: state.designOrders.map(order => 
          order.id === serviceOrderId ? { 
            ...order, 
            depositPercentage: deposit,
            refundPercentage: refund
          } : order
        ),
        selectedOrder: state.selectedOrder?.id === serviceOrderId 
          ? { 
              ...state.selectedOrder, 
              depositPercentage: deposit,
              refundPercentage: refund
            }
          : state.selectedOrder,
        isLoading: false
      }));

      return response.data;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      throw error;
    }
  },

  cancelOrder: async (orderId) => {
    try {
      // Update order status to cancelled (status: 14)
      const statusResponse = await axios.put(`/api/serviceorder/status/${orderId}`, {
        status: 14
      });
      
      // Simultaneously perform refund request
      const refundResponse = await axios.post(`/api/wallets/refund?id=${orderId}`);
      
      // Return combined response data if needed
      return {
        statusData: statusResponse.data,
        refundData: refundResponse.data
      };
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      throw error;
    }
  }
}));

export default useDesignOrderStore;