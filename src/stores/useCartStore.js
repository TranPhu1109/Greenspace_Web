import { create } from 'zustand';
import { message } from 'antd';
import axios from '@/api/api';

const useCartStore = create((set, get) => ({
  cartItems: [],
  cartId: null,
  loading: false,
  error: null,

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      set({ loading: true });
      
      const cartData = {
        items: [{
          productId: productId,
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
      const response = await axios.put(`/api/carts/remove-item/`, { productId });
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
      const currentItems = get().cartItems;
      
      // Tạo mảng items mới với số lượng đã cập nhật cho sản phẩm được chọn
      const updatedItems = currentItems.map(item => ({
        productId: item.id,
        quantity: item.id === productId ? quantity : item.quantity
      }));

      const cartData = {
        model: {
          id: get().cartId,
          items: updatedItems
        }
      };
      
      const response = await axios.put('/api/carts', cartData);
      set({ cartItems: response.data.items || [] });
      message.success('Cập nhật số lượng thành công');
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
        set({ cartItems: [], cartId: null });
        return;
      }
      
      set({ cartId: response.data.id });
      
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

  // Create order
  createOrderProducts: async (orderData) => {
    try {
      set({ loading: true });
      const response = await axios.post('/api/orderproducts', orderData);
      if (response.status === 200) {
        return response;
      }
      throw new Error('Tạo đơn hàng thất bại');
    } catch (error) {
      // message.error(error.response.data.error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Buy now
  buyNow: async (orderData) => {
    try {
      set({ loading: true });
      const response = await axios.post('/api/orderproducts/buy-now', orderData);
      if (response.status === 200) {
        return response;
      }
      throw new Error('Đặt hàng thất bại');
    } catch (error) {
      message.error('Không thể đặt hàng: ' + error.message);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Create bill
  createBill: async (billData) => {
    try {
      set({ loading: true });
      const response = await axios.post('/api/bill', billData);
      if (response.status === 200) {
        set({ cartItems: [] }); // Clear cart after successful payment
        return response;
      }
      throw new Error('Thanh toán thất bại');
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