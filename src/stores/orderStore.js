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
    set({ isLoading: true, error: null });
    try {
      // Gọi API để lấy chi tiết đơn hàng
      const response = await axios.get(`/api/orderproducts/${id}`);
      const orderData = response.data;

      // Định dạng lại dữ liệu đơn hàng
      const formattedOrder = {
        id: orderData.id,
        orderNumber: orderData.id.slice(0, 8),
        customer: {
          name: orderData.userName,
          email: orderData.email || '',
          phone: orderData.phone,
          address: orderData.address
        },
        orderDate: new Date().toLocaleDateString('vi-VN'),
        orderStatus: orderData.status === '1' ? 'chờ xác nhận' : 'đã xác nhận',
        payment: {
          method: 'Banking',
          status: 'chưa thanh toán',
          date: null
        },
        details: orderData.orderDetails.map(detail => ({
          product: detail.productId,
          price: detail.price,
          quantity: detail.quantity
        })),
        shipPrice: orderData.shipPrice || 0,
        totalAmount: orderData.totalAmount || 0
      };

      set({ 
        selectedOrder: formattedOrder,
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