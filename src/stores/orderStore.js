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
      const response = await axios.get('/api/orderProducts');
      // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc hiện tại
      const formattedOrders = response.data.map(order => ({
        ...order,
        // Thêm các trường mặc định nếu cần
        orderDate: new Date().toLocaleDateString('vi-VN')
      }));
      set({ orders: formattedOrders, isLoading: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  getOrderById: async (id) => {
    if (!id) {
      set({ error: 'ID đơn hàng không hợp lệ', isLoading: false, selectedOrder: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // Gọi API để lấy chi tiết đơn hàng
      const response = await axios.get(`/api/orderproducts/${id}`);
      const orderData = response.data;
      if (!orderData) {
        set({ error: 'Không tìm thấy đơn hàng', isLoading: false, selectedOrder: null });
        return;
      }
      set({ 
        selectedOrder: orderData,
        isLoading: false,
        error: null
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
  
  updateOrderStatus: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      // Gọi API để cập nhật trạng thái đơn hàng
      const response = await axios.put(`/api/orderproducts/status/${id}`, data);

      if (response.status === 200) {
        const updatedOrders = get().orders.map(order => 
          order.id === id ? { ...order, status: data.status } : order
        );
        
        set({ 
          orders: updatedOrders,
          selectedOrder: get().selectedOrder?.id === id ? 
            { ...get().selectedOrder, status: data.status } : 
            get().selectedOrder,
          isLoading: false 
        });
        
        return true;
      }
      return false;
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