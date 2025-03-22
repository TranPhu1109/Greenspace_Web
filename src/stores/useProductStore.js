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
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // API Actions
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/product', {
        params: {
          pageNumber: 0,
          pageSize: 10
        }
      });
      const productsArray = Array.isArray(response.data) ? response.data.map(product => ({
        ...product,
        image: {
          imageUrl: product.image?.imageUrl || '',
          image2: product.image?.image2 || '',
          image3: product.image?.image3 || ''
        }
      })) : [];
      set({ products: productsArray, isLoading: false });
      return productsArray;
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  
// Add this to the API Actions section
createProduct: async (productData) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axios.post('/api/product', {
      name: productData.name,
      categoryId: productData.categoryId,
      price: productData.price,
      stock: productData.stock,
      description: productData.description,
      size: productData.size || 0,
      image: productData.image // Pass the entire image object
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 201) {
      await get().fetchProducts(); // Refresh the products list
      set({ isLoading: false });
      return response.data;
    }
    throw new Error('Failed to create product');
  } catch (error) {
    console.error('Error creating product:', error);
    set({ error: error.message, isLoading: false });
    throw error;
  }
},

updateProduct: async (id, productData) => {
  set({ isLoading: true, error: null });  
  try {
    const requestBody = {
      id: id,
      name: productData.name,
      categoryId: productData.categoryId,
      price: productData.price,
      stock: productData.stock,
      description: productData.description,
      size: productData.size || 0,
      image: {
        imageUrl: productData.image.imageUrl,
        image2: productData.image.image2,
        image3: productData.image.image3
      }
    };

    const response = await axios.put(`/api/product/${id}`, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const updatedProduct = {
        id: id,
        name: productData.name,
        categoryId: productData.categoryId,
        price: productData.price,
        stock: productData.stock,
        description: productData.description,
        size: productData.size || 0,
        image: productData.image
      };
      set(state => ({
        products: state.products.map(product => product.id === id ? updatedProduct : product),
        isLoading: false
      }));
      return response.data;
    } 
    throw new Error('Failed to update product');
  } catch (error) {
    console.error('Error updating product:', error);
    set({ error: error.message, isLoading: false });
    throw error;
  } finally {
    set({
      selectedProduct: {
        image: {
          imageUrl: productData.image.imageUrl || '',
          image2: productData.image.image2 || '',
          image3: productData.image.image3 || ''
        }
      }
    })
  }
},

deleteProduct: async (id) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axios.delete(`/api/product/${id}`);
    if (response.status === 200) {
      set(state => ({ 
        products: state.products.filter(product => product.id !== id),
        isLoading: false 
      }));
      return response;
    }
    throw new Error('Failed to delete product');
  } catch (error) {
    console.error('Error deleting product:', error);
    set({ error: error.message, isLoading: false });
    throw error;
  }
},

getProductById: async (id) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axios.get(`/api/product/${id}`);
    if (response.status === 200) {
      set({ selectedProduct: response.data, isLoading: false });
      return response.data;
    }
    throw new Error('Failed to fetch product');
  } catch (error) {
    console.error('Error fetching product:', error);
    set({ error: error.message, isLoading: false });
    throw error;
  }
},

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/categories', {
        params: {
          pageNumber: 0,
          pageSize: 10
        }
      });
      const categoriesArray = Array.isArray(response.data) ? response.data : [];
      set({ categories: categoriesArray, isLoading: false });
      return categoriesArray;
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/categories', {
        name: categoryData.name,
        description: categoryData.description
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 201) {
        const newCategory = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
        };

        set(state => ({ 
          categories: [...state.categories, newCategory],
          isLoading: false 
        }));
        return response;
      }
      throw new Error('Failed to create category');
    } catch (error) {
      console.error('Error creating category:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('Id', id);
      formData.append('Name', categoryData.name);
      formData.append('Description', categoryData.description);

      const response = await axios.put(`/api/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        const updatedCategory = {
          id: id,
          name: categoryData.name,
          description: categoryData.description,
        };

        set(state => ({ 
          categories: state.categories.map(category => 
            category.id === id ? updatedCategory : category
          ),
          isLoading: false 
        }));
        return response;
      }
      throw new Error('Failed to update category');
    } catch (error) {
      console.error('Error updating category:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`/api/categories/${id}`);
      if (response.status === 200) {
        set(state => ({ 
          categories: state.categories.filter(category => category.id !== id),
          isLoading: false 
        }));
        return response;
      }
      throw new Error('Failed to delete category');
    } catch (error) {
      console.error('Error deleting category:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Helper function
  getCategoryNameById: (categoryId) => {
    const category = get().categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Không xác định';
  }
}));

export default useProductStore;
