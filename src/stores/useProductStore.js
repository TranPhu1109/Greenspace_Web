import { create } from 'zustand';
import axios from '../api/api';

const useProductStore = create((set, get) => ({
  // State
  products: [],
  categories: [],
  isLoading: false,
  error: null,
  selectedProduct: null,
  
  // Actions
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('http://localhost:3000/api/products');
      console.log('Fetched products:', response.data);
      set({ products: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('http://localhost:3000/api/categories');
      set({ categories: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  getProductById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:3000/api/products/${id}`);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('http://localhost:3000/api/products', productData);
      set(state => ({ 
        products: [...state.products, response.data],
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`http://localhost:3000/api/products/${id}`, productData);
      set(state => ({ 
        products: state.products.map(product => 
          product.id === id ? response.data : product
        ),
        selectedProduct: response.data,
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`http://localhost:3000/api/products/${id}`);
      set(state => ({ 
        products: state.products.filter(product => product.id !== id),
        isLoading: false 
      }));
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('http://localhost:3000/api/categories', categoryData);
      set(state => ({ 
        categories: [...state.categories, response.data],
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  updateCategory: async (id, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`http://localhost:3000/api/categories/${id}`, categoryData);
      set(state => ({ 
        categories: state.categories.map(category => 
          category.id === id ? response.data : category
        ),
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`http://localhost:3000/api/categories/${id}`);
      set(state => ({ 
        categories: state.categories.filter(category => category.id !== id),
        isLoading: false 
      }));
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  // Helper function to get category name by id
  getCategoryNameById: (categoryId) => {
    const category = get().categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Không xác định';
  },
  
  // Reset selected product
  resetSelectedProduct: () => {
    set({ selectedProduct: null });
  }
}));

export default useProductStore; 