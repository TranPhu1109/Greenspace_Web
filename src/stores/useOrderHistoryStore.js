import { create } from 'zustand';
import axios from '@/api/api';

const useOrderHistoryStore = create((set) => ({
  orders: [],
  loading: false,
  error: null,

  // Fetch order history
  fetchOrderHistory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/orderproducts/user?pageNumber=0&pageSize=100');
      set({ orders: response.data, loading: false });
    } catch (error) {
      if (error.response?.status === 404) {
        set({ orders: [], loading: false });
      } else {
        set({
          error: error.response?.data?.message || 'Có lỗi xảy ra khi tải lịch sử đơn hàng',
          loading: false
        });
      }
    }
  },

  fetchOrderHistorySilent: async (componentId = null) => {
    try {
      const response = await axios.get('/api/orderproducts/user?pageNumber=0&pageSize=100');
      set((state) => {
        // Chỉ cập nhật nếu dữ liệu thay đổi
        if (JSON.stringify(state.orders) !== JSON.stringify(response.data)) {
          console.log(`[${componentId || 'OrderHistory'}] Silent fetch: Data updated`);
          return { orders: response.data };
        }
        return {};
      });
      return response.data;
    } catch (error) {
      console.error(`[${componentId || 'OrderHistory'}] Silent fetch failed:`, error);
      return [];
    }
  },

  // Confirm delivery
  confirmDelivery: async (orderId, deliveryCode) => {
    set({ loading: true, error: null });
    try {
      await axios.put(`/api/orderproducts/status/${orderId}`, {
        status: 10,
        deliveryCode: deliveryCode
      });
      set({ loading: false, error: null });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận giao hàng';
      set({
        error: errorMessage,
        loading: false
      });
      return { success: false, error: errorMessage };
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      // Hoàn tiền về ví của khách hàng trước
      try {
        const refundResponse = await axios.post(`/api/wallets/refund-order?id=${orderId}`);
        // Kiểm tra phản hồi từ API hoàn tiền
        if (refundResponse?.data === "Refund successful." || 
            refundResponse?.data?.message === "Refund successful.") {
        } else {
          // Nếu API trả về nhưng không phải thông báo thành công
          set({
            error: 'Phản hồi hoàn tiền không xác định. Vui lòng kiểm tra lại sau.',
            loading: false
          });
          return false;
        }
      } catch (refundError) {
        console.error('Lỗi khi hoàn tiền:', refundError);
        // Nếu hoàn tiền thất bại, dừng quá trình hủy đơn và thông báo lỗi
        set({
          error: 'Không thể hoàn tiền cho đơn hàng này. Vui lòng thử lại sau.',
          loading: false
        });
        return false;
      }
      
      // Sau khi hoàn tiền thành công, cập nhật trạng thái đơn hàng thành đã hủy
      await axios.put(`/api/orderproducts/status/${orderId}`, {
        status: 3,
        deliveryCode: ''
      });
      
      // Tải lại danh sách đơn hàng và đảm bảo không có lỗi sau khi hủy thành công
      try {
        const response = await axios.get('/api/orderproducts/user');
        set({ orders: response.data, loading: false, error: null });
      } catch (fetchError) {
        // Vẫn đánh dấu hủy đơn thành công, nhưng ghi log lỗi khi tải lại danh sách
        set({ loading: false, error: null });
      }
      
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng',
        loading: false
      });
      return false;
    }
  },

  // Clear store data
  clearStore: () => {
    set({ orders: [], loading: false, error: null });
  }
}));

export default useOrderHistoryStore;