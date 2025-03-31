import { create } from 'zustand';
import { message } from 'antd';
import axios from '@/api/api';

const useCartStore = create((set, get) => ({
  cartItems: [],
  loading: false,
  error: null,

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      set({ loading: true });
      const response = await axios.post('/api/cart/add', { productId, quantity });
      set({ cartItems: response.data.cartItems });
      message.success('Thêm vào giỏ hàng thành công');
    } catch (error) {
      message.error('Không thể thêm vào giỏ hàng');
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    try {
      set({ loading: true });
      const response = await axios.delete(`/api/cart/${productId}`);
      set({ cartItems: response.data.cartItems });
      message.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      message.error('Không thể xóa sản phẩm');
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Update item quantity
  updateQuantity: async (productId, quantity) => {
    try {
      set({ loading: true });
      const response = await axios.put(`/api/cart/${productId}`, { quantity });
      set({ cartItems: response.data.cartItems });
    } catch (error) {
      message.error('Không thể cập nhật số lượng');
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Get cart items
  fetchCartItems: async () => {
    try {
      set({ loading: true });
      const response = await axios.get('/api/cart');
      set({ cartItems: response.data.cartItems });
    } catch (error) {
      // message.error('Không thể tải giỏ hàng');
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Checkout cart
  checkout: async () => {
    try {
      set({ loading: true });
      const response = await axios.post('/api/cart/checkout');
      set({ cartItems: [] }); // Clear cart after successful checkout
      message.success('Thanh toán thành công');
      return response.data;
    } catch (error) {
      message.error('Thanh toán thất bại: ' + error.message);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Clear cart
  clearCart: () => set({ cartItems: [] }),
}));

export default useCartStore; 