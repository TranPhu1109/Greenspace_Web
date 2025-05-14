import { create } from 'zustand';
import api from '@/api/api';

const useExternalProductStore = create((set, get) => ({
  externalProducts: [],
  isLoading: false,
  error: null,

  // Lấy tất cả external products
  fetchExternalProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/externalproduct');
      set({ externalProducts: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      // Handle 404 case separately since it's expected initially
      if (error.response && error.response.status === 404) {
        set({ externalProducts: [], isLoading: false });
        return [];
      }
      
      set({ 
        error: error.response?.data?.error || "Không thể tải danh sách sản phẩm",
        isLoading: false 
      });
      throw error;
    }
  },

  // Lấy external product theo ID
  getExternalProductById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/externalproduct/${id}`);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.error || "Không thể tải thông tin sản phẩm",
        isLoading: false 
      });
      throw error;
    }
  },

  // Thêm external product mới
  addExternalProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/externalproduct', productData);
      // Sau khi thêm thành công, cập nhật danh sách
      const updatedList = [...get().externalProducts, response.data];
      set({ externalProducts: updatedList, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.error || "Không thể thêm sản phẩm mới",
        isLoading: false 
      });
      throw error;
    }
  },

  // Thêm nhiều external products cùng lúc
  addMultipleExternalProducts: async (productsArray, serviceOrderId) => {
    set({ isLoading: true, error: null });
    try {
      const requests = productsArray.map(product => {
        // Đảm bảo mỗi product có serviceOrderId
        const productWithOrderId = {
          ...product,
          serviceOrderId
        };
        return api.post('/api/externalproduct', productWithOrderId);
      });
      
      const responses = await Promise.all(requests);
      const newProducts = responses.map(response => response.data);
      
      // Cập nhật danh sách với các sản phẩm mới
      const updatedList = [...get().externalProducts, ...newProducts];
      set({ externalProducts: updatedList, isLoading: false });
      
      return newProducts;
    } catch (error) {
      set({ 
        error: error.response?.data?.error || "Không thể thêm các sản phẩm mới",
        isLoading: false 
      });
      throw error;
    }
  },

  // Cập nhật external product
  updateExternalProduct: async (id, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/externalproduct/${id}`, updatedData);
      
      // Cập nhật danh sách nếu sản phẩm này đã có trong state
      const currentList = get().externalProducts;
      const updatedList = currentList.map(product => 
        product.id === id ? response.data : product
      );
      
      set({ externalProducts: updatedList, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.error || "Không thể cập nhật sản phẩm",
        isLoading: false 
      });
      throw error;
    }
  },

  // Xóa external product
  deleteExternalProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/externalproduct/${id}`);
      
      // Cập nhật danh sách sau khi xóa
      const updatedList = get().externalProducts.filter(product => product.id !== id);
      set({ externalProducts: updatedList, isLoading: false });
      
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.error || "Không thể xóa sản phẩm",
        isLoading: false 
      });
      throw error;
    }
  },

  // Reset state store
  resetState: () => {
    set({ externalProducts: [], isLoading: false, error: null });
  }
}));

export default useExternalProductStore; 