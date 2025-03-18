import { create } from 'zustand';
import axios from '../api/api';

const useOrderStore = create((set, get) => ({
  // State
  orders: [],
  isLoading: false,
  error: null,
  selectedOrder: null,
  
  // Actions
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('http://localhost:3000/orders');
      // API trả về mảng orders trực tiếp
      set({ orders: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  getOrderById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Tìm trong danh sách orders trước
      const existingOrder = get().orders.find(order => order.id === id);
      if (existingOrder) {
        set({ selectedOrder: existingOrder, isLoading: false });
        return;
      }

      // Nếu không tìm thấy, gọi API để lấy chi tiết đơn hàng
      const response = await axios.get(`http://localhost:3000/orders/${id}`);
      set({ 
        selectedOrder: response.data,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      set({ 
        error: error.message, 
        isLoading: false,
        selectedOrder: null 
      });
    }
  },
  
  setSelectedOrder: (order) => {
    set({ selectedOrder: order });
  },
  
  updateOrderStatus: async (id, newStatus, note = '') => {
    set({ isLoading: true, error: null });
    try {
      // Trong thực tế sẽ gọi API để cập nhật
      const updatedOrders = get().orders.map(order => 
        order.id === id ? { ...order, orderStatus: newStatus } : order
      );
      
      set({ 
        orders: updatedOrders,
        selectedOrder: get().selectedOrder?.id === id ? 
          { ...get().selectedOrder, orderStatus: newStatus } : 
          get().selectedOrder,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
  
  updatePaymentStatus: async (id, newStatus, paymentDate = '') => {
    set({ isLoading: true, error: null });
    try {
      const updatedOrders = get().orders.map(order => 
        order.id === id ? {
          ...order,
          payment: {
            ...order.payment,
            status: newStatus,
            date: newStatus === 'đã thanh toán' ? 
              (paymentDate || new Date().toLocaleDateString('vi-VN')) : 
              ''
          }
        } : order
      );
      
      set({ 
        orders: updatedOrders,
        selectedOrder: get().selectedOrder?.id === id ? {
          ...get().selectedOrder,
          payment: {
            ...get().selectedOrder.payment,
            status: newStatus,
            date: newStatus === 'đã thanh toán' ? 
              (paymentDate || new Date().toLocaleDateString('vi-VN')) : 
              ''
          }
        } : get().selectedOrder,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  }
}));

export default useOrderStore; 