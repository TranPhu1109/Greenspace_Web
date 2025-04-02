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
      // Get product details first
      const productResponse = await axios.get(`/api/product/${productId}`);
      const product = productResponse.data;

      // Get current user ID from auth store or local storage
      const userId = localStorage.getItem('userId'); // Adjust this based on how you store user ID
      
      const cartData = {
        userId: userId,
        items: [{
          productId: productId,
          productName: product.name,
          price: product.price,
          quantity: quantity
        }]
      };

      const response = await axios.post('/api/carts', cartData);
      set({ cartItems: response.data.items || [] });
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
      const response = await axios.get('/api/carts');
      
      if (!response.data?.items) {
        set({ cartItems: [] });
        return;
      }
      
      const cartItemsPromises = response.data.items.map(async item => {
        try {
          const productResponse = await axios.get(`/api/product/${item.productId}`);
          const product = productResponse.data;
          
          return {
            id: item.productId,
            name: product.name || 'Không có tên',
            quantity: item.quantity || 1,
            price: product.price || 0,
            image: product.image || { imageUrl: '' }
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          return {
            id: item.productId,
            name: 'Sản phẩm không khả dụng',
            quantity: item.quantity || 1,
            price: 0,
            image: { imageUrl: '' }
          };
        }
      });
      
      const cartItems = await Promise.all(cartItemsPromises);
      set({ cartItems });
    } catch (error) {
      console.error('Error fetching cart items:', error);
      set({ error: error.message, cartItems: [] });
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