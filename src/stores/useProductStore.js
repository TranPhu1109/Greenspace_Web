import { create } from "zustand";
import axios from "../api/api";

const useProductStore = create((set, get) => ({
  // State
  products: [],
  categories: [],
  isLoading: false,
  error: null,
  selectedProduct: null,
  abortController: null,

  // Actions
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // API Actions
  fetchProducts: async () => {
    // Cancel any existing request
    if (get().abortController) {
      get().abortController.abort();
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    set({ abortController: controller });

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get("/api/product", {
        params: {
          pageNumber: 0,
          pageSize: 10,
        },
        signal: controller.signal
      });
      
      // Handle the response data
      let productsArray = [];
      
      // Check if response.data is an array
      if (Array.isArray(response.data)) {
        productsArray = response.data;
      }
      // Check if response.data has a data property that's an array
      else if (response.data && Array.isArray(response.data.data)) {
        productsArray = response.data.data;
      }
      // Check if response.data has a content property that's an array
      else if (response.data && Array.isArray(response.data.content)) {
        productsArray = response.data.content;
      }
      
      // Process the products array
      const processedProducts = productsArray.map((product) => ({
        ...product,
        image: {
          imageUrl: product.image?.imageUrl || "",
          image2: product.image?.image2 || "",
          image3: product.image?.image3 || "",
        },
      }));
      
      set({ products: processedProducts, isLoading: false, abortController: null });
      return processedProducts;
    } catch (error) {
      if (error.name !== 'CanceledError') {
        set({ error: error.message, isLoading: false, abortController: null });
      }
      throw error;
    }
  },

  // Add this to the API Actions section
  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        "/api/product",
        {
          name: productData.name,
          categoryId: productData.categoryId,
          price: productData.price,
          stock: productData.stock,
          description: productData.description,
          size: productData.size || 0,
          image: productData.image, // Pass the entire image object
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        await get().fetchProducts(); // Refresh the products list
        set({ isLoading: false });
        return response.data;
      }
      throw new Error("Failed to create product");
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/api/product/${id}`, productData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`/api/product/${id}`);
      if (response.status === 200) {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
          isLoading: false,
        }));
        return response;
      }
      throw new Error("Failed to delete product");
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Simplified getProductById function
  getProductById: async (id) => {
    try {
      const response = await axios.get(`/api/product/${id}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      if (!response.data) {
        return null;
      }

      const processedProduct = {
        ...response.data,
        image: {
          imageUrl: response.data.image?.imageUrl || "",
          image2: response.data.image?.image2 || "",
          image3: response.data.image?.image3 || "",
        }
      };

      return processedProduct;
    } catch (error) {
      throw error;
    }
  },

  fetchCategories: async () => {
    // Cancel any existing request
    if (get().abortController) {
      get().abortController.abort();
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    set({ abortController: controller });

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get("/api/categories", {
        params: {
          pageNumber: 0,
          pageSize: 10,
        },
        signal: controller.signal
      });
      
      // Handle the response data directly
      const categoriesArray = Array.isArray(response.data) ? response.data : [];
      set({ categories: categoriesArray, isLoading: false, abortController: null });
      return categoriesArray;
    } catch (error) {
      if (error.name !== 'CanceledError') {
        set({ error: error.message, isLoading: false, abortController: null });
      }
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        "/api/categories",
        {
          name: categoryData.name,
          description: categoryData.description,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        const newCategory = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
        };

        set((state) => ({
          categories: [...state.categories, newCategory],
          isLoading: false,
        }));
        return response;
      }
      throw new Error("Failed to create category");
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("Id", id);
      formData.append("Name", categoryData.name);
      formData.append("Description", categoryData.description);

      const response = await axios.put(`/api/categories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        const updatedCategory = {
          id: id,
          name: categoryData.name,
          description: categoryData.description,
        };

        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? updatedCategory : category
          ),
          isLoading: false,
        }));
        return response;
      }
      throw new Error("Failed to update category");
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`/api/categories/${id}`);
      if (response.status === 200) {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          isLoading: false,
        }));
        return response;
      }
      throw new Error("Failed to delete category");
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Helper function
  getCategoryNameById: (categoryId) => {
    const category = get().categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Không xác định";
  },
}));

export default useProductStore;
