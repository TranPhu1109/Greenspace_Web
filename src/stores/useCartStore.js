import { create } from 'zustand';
import { message } from 'antd';
import axios from '@/api/api';
import useProductStore from './useProductStore';

// Key để lưu giỏ hàng trong localStorage
const LOCAL_CART_KEY = 'guest-cart-items';

const useCartStore = create((set, get) => ({
  cartItems: [],
  cartId: null,
  loading: false,
  error: null,

  // Lấy giỏ hàng từ localStorage (cho guest)
  getLocalCart: () => {
    try {
      const localCart = localStorage.getItem(LOCAL_CART_KEY);
      return localCart ? JSON.parse(localCart) : [];
    } catch (error) {
      console.error('Error reading local cart:', error);
      return [];
    }
  },

  // Lưu giỏ hàng vào localStorage (cho guest)
  saveLocalCart: (items) => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  },

  // Thêm vào giỏ hàng (có kiểm tra user)
  addToCart: async (productId, quantity = 1) => {
    try {
      set({ loading: true });
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Nếu chưa đăng nhập, thêm vào giỏ hàng local
      if (!user) {
        const { getProductById } = useProductStore.getState();
        const product = await getProductById(productId);
        
        if (!product) {
          message.error('Không tìm thấy thông tin sản phẩm');
          set({ loading: false });
          return;
        }

        // Lấy giỏ hàng local hiện tại
        const localCart = get().getLocalCart();

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItemIndex = localCart.findIndex(item => item.id === productId);

        if (existingItemIndex !== -1) {
          // Nếu đã có, tăng số lượng
          const newQuantity = localCart[existingItemIndex].quantity + quantity;
          
          // Kiểm tra stock
          if (newQuantity > product.stock) {
            message.warning(`Sản phẩm chỉ còn ${product.stock} trong kho.`);
            localCart[existingItemIndex].quantity = product.stock;
          } else {
            localCart[existingItemIndex].quantity = newQuantity;
          }
        } else {
          // Nếu chưa có, thêm mới
          localCart.push({
            id: productId,
            name: product.name,
            quantity: Math.min(quantity, product.stock), // Đảm bảo không vượt quá stock
            price: product.price,
            image: product.image
          });
        }

        // Lưu giỏ hàng vào localStorage
        get().saveLocalCart(localCart);
        set({ cartItems: localCart });
        
        message.success('Thêm vào giỏ hàng thành công');
        set({ loading: false });
        return;
      }
      
      // Nếu đã đăng nhập, gửi lên server
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

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (productId) => {
    try {
      set({ loading: true });
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Nếu chưa đăng nhập, xóa khỏi giỏ hàng local
      if (!user) {
        const localCart = get().getLocalCart();
        const newCart = localCart.filter(item => item.id !== productId);
        
        get().saveLocalCart(newCart);
        set({ cartItems: newCart });
        
        message.success('Đã xóa sản phẩm khỏi giỏ hàng');
        set({ loading: false });
        return;
      }
      
      // Nếu đã đăng nhập, gọi API
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

  // Cập nhật số lượng sản phẩm
  updateQuantity: async (productId, quantity) => {
    try {
      set({ loading: true });
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Nếu chưa đăng nhập, cập nhật trong giỏ hàng local
      if (!user) {
        const localCart = get().getLocalCart();
        const itemIndex = localCart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
          // Kiểm tra stock trước khi cập nhật
          const { getProductById } = useProductStore.getState();
          const product = await getProductById(productId);
          
          if (product && quantity > product.stock) {
            message.warning(`Sản phẩm chỉ còn ${product.stock} trong kho.`);
            quantity = product.stock;
          }
          
          localCart[itemIndex].quantity = quantity;
          get().saveLocalCart(localCart);
          set({ cartItems: localCart });
          
          message.success('Cập nhật số lượng thành công');
          set({ loading: false });
          return;
        }
        
        set({ loading: false });
        return;
      }
      
      // Nếu đã đăng nhập, gọi API
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

  // Lấy thông tin giỏ hàng
  fetchCartItems: async () => {
    try {
      set({ loading: true });
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Nếu chưa đăng nhập, lấy từ localStorage
      if (!user) {
        const localCart = get().getLocalCart();
        set({ cartItems: localCart, loading: false });
        return;
      }
      
      // Nếu đã đăng nhập, gọi API
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

  // Đồng bộ giỏ hàng local lên server sau khi đăng nhập
  syncLocalCartToServer: async () => {
    try {
      const localCart = get().getLocalCart();
      
      // Nếu giỏ hàng local trống, không cần đồng bộ
      if (!localCart || localCart.length === 0) return;
      
      // Convert local cart format sang server format
      const items = localCart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));
      
      // Gọi API để đồng bộ
      await axios.post('/api/carts', { items });
      
      // Xóa giỏ hàng local sau khi đồng bộ thành công
      localStorage.removeItem(LOCAL_CART_KEY);
      
      // Fetch lại giỏ hàng từ server
      await get().fetchCartItems();
      
    } catch (error) {
      console.error('Error syncing local cart to server:', error);
      message.error('Không thể đồng bộ giỏ hàng');
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
  clearCart: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      // Clear local cart
      localStorage.removeItem(LOCAL_CART_KEY);
    }
    set({ cartItems: [] });
  },
}));

export default useCartStore;