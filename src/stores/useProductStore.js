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

  // Add new state for feedback
  productFeedbacks: {}, // Change to object to store feedbacks by productId
  selectedProductFeedbacks: [],
  feedbackLoading: false,

  // Actions
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSelectedProductFeedbacks: (feedbacks) => set({ selectedProductFeedbacks: feedbacks }),
  setProductFeedbacks: (productId, feedbacks) => 
    set(state => ({ 
      productFeedbacks: { 
        ...state.productFeedbacks, 
        [productId]: feedbacks 
      } 
    })),

  // Fetch feedbacks for all products
  fetchAllProductFeedbacks: async () => {
    const { products } = get();
    const feedbacksMap = {};
    
    for (const product of products) {
      try {
        const response = await axios.get(`/api/productfeedback/${product.id}/products`);
        if (response.status === 200) {
          const feedbacksArray = Array.isArray(response.data) ? response.data.map(feedback => ({
            id: feedback.id,
            userName: feedback.userName || 'Ẩn danh',
            productName: feedback.productName,
            rating: feedback.rating,
            description: feedback.description,
            reply: feedback.reply,
            createdAt: feedback.createdAt
          })) : [];
          
          feedbacksMap[product.id] = feedbacksArray;
        } else {
          // If no feedbacks found, set empty array for this product
          feedbacksMap[product.id] = [];
        }
      } catch (error) {
        console.error(`Error fetching feedbacks for product ${product.id}:`, error);
        feedbacksMap[product.id] = [];
      }
    }
    
    set({ productFeedbacks: feedbacksMap });
    return feedbacksMap;
  },

  // Get feedbacks for specific product
  getProductFeedbacks: async (productId) => {
    set({ feedbackLoading: true, error: null, selectedProductFeedbacks: [] }); // Reset selectedProductFeedbacks
    try {
      const response = await axios.get(`/api/productfeedback/${productId}/products`);

      if (response.status === 200) {
        const feedbacksArray = Array.isArray(response.data) ? response.data.map(feedback => ({
          id: feedback.id,
          userName: feedback.userName || 'Ẩn danh',
          productName: feedback.productName,
          rating: feedback.rating,
          description: feedback.description,
          reply: feedback.reply,
          createdAt: feedback.createdAt
        })) : [];
        
        // Update both selectedProductFeedbacks and productFeedbacks
        set(state => ({ 
          selectedProductFeedbacks: feedbacksArray,
          productFeedbacks: {
            ...state.productFeedbacks,
            [productId]: feedbacksArray
          },
          feedbackLoading: false 
        }));
        return feedbacksArray;
      }
      
      // If no feedbacks found, set empty arrays
      set(state => ({
        selectedProductFeedbacks: [],
        productFeedbacks: {
          ...state.productFeedbacks,
          [productId]: []
        },
        feedbackLoading: false
      }));
      return [];
      
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      // Reset feedbacks on error
      set(state => ({ 
        error: error.message, 
        feedbackLoading: false,
        selectedProductFeedbacks: [],
        productFeedbacks: {
          ...state.productFeedbacks,
          [productId]: []
        }
      }));
      throw error;
    }
  },

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
          pageSize: 100, // Increased to load more products
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

  // Add new action for creating feedback
  createProductFeedback: async (feedbackData) => {
    set({ feedbackLoading: true, error: null });
    try {
      const response = await axios.post("/api/productfeedback", {
        userId: feedbackData.userId,
        productId: feedbackData.productId,
        rating: feedbackData.rating,
        description: feedbackData.description
      });

      if (response.status === 201) {
        set({ feedbackLoading: false });
        return response.data;
      }
      throw new Error("Failed to submit feedback");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      set({ error: error.message, feedbackLoading: false });
      throw error;
    }
  },

  // Add new action for replying to feedback
  replyToFeedback: async (feedbackId, reply) => {
    set({ feedbackLoading: true, error: null });
    try {
      const response = await axios.put(`/api/productfeedback/${feedbackId}`, {
        reply: reply
      });

      if (response.status === 200) {
        // Update the feedback in both selectedProductFeedbacks and productFeedbacks
        set(state => {
          const updatedSelectedFeedbacks = state.selectedProductFeedbacks.map(feedback =>
            feedback.id === feedbackId ? { ...feedback, reply } : feedback
          );

          // Update in productFeedbacks object
          const updatedProductFeedbacks = { ...state.productFeedbacks };
          for (const productId in updatedProductFeedbacks) {
            updatedProductFeedbacks[productId] = updatedProductFeedbacks[productId].map(feedback =>
              feedback.id === feedbackId ? { ...feedback, reply } : feedback
            );
          }

          return {
            selectedProductFeedbacks: updatedSelectedFeedbacks,
            productFeedbacks: updatedProductFeedbacks,
            feedbackLoading: false
          };
        });

        return response.data;
      }
      throw new Error("Failed to reply to feedback");
    } catch (error) {
      console.error("Error replying to feedback:", error);
      set({ error: error.message, feedbackLoading: false });
      throw error;
    }
  },

  // Add new action for deleting feedback
  deleteFeedback: async (feedbackId) => {
    set({ feedbackLoading: true, error: null });
    try {
      const response = await axios.delete(`/api/productfeedback/${feedbackId}`);

      if (response.status === 200) {
        // Remove the feedback from both selectedProductFeedbacks and productFeedbacks
        set(state => {
          const updatedSelectedFeedbacks = state.selectedProductFeedbacks.filter(
            feedback => feedback.id !== feedbackId
          );

          // Update in productFeedbacks object
          const updatedProductFeedbacks = { ...state.productFeedbacks };
          for (const productId in updatedProductFeedbacks) {
            updatedProductFeedbacks[productId] = updatedProductFeedbacks[productId].filter(
              feedback => feedback.id !== feedbackId
            );
          }

          return {
            selectedProductFeedbacks: updatedSelectedFeedbacks,
            productFeedbacks: updatedProductFeedbacks,
            feedbackLoading: false
          };
        });

        return response.data;
      }
      throw new Error("Failed to delete feedback");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      set({ error: error.message, feedbackLoading: false });
      throw error;
    }
  },
}));

export default useProductStore;
