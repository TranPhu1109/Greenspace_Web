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
  fetchProducts: async (componentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get("/api/product", {
        params: {
          pageNumber: 0,
          pageSize: 100, // Increased to load more products
        },
        componentId,
        allowDuplicate: false
      });
      
      // Skip processing if the request was canceled
      if (response.status === 'canceled') {
        set({ isLoading: false });
        return [];
      }
      
      const productsArray = Array.isArray(response.data)
        ? response.data.map((product) => ({
            ...product,
            image: {
              imageUrl: product.image?.imageUrl || "",
              image2: product.image?.image2 || "",
              image3: product.image?.image3 || "",
            },
          }))
        : [];
      set({ products: productsArray, isLoading: false });
      return productsArray;
    } catch (error) {
      // Only handle non-cancellation errors
      if (!axios.isCancel(error)) {
        console.error("Error fetching products:", error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
      // Reset loading state for cancellations
      set({ isLoading: false });
      return [];
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

  updateProduct: async (id, productData, componentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/api/product/${id}`, productData, {
        headers: {
          "Content-Type": "application/json",
        },
        componentId,
      });
      
      if (response.status === 'canceled') {
        set({ isLoading: false });
        return null;
      }
      
      // Update the product in the products list
      set((state) => ({
        products: state.products.map(product => 
          product.id === id ? { ...product, ...productData } : product
        ),
        isLoading: false
      }));
      
      return response.data;
    } catch (error) {
      // Only handle non-cancellation errors
      if (!axios.isCancel(error)) {
        console.error("Error updating product:", error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
      // Reset loading state for cancellations
      set({ isLoading: false });
      return null;
    }
  },

  deleteProduct: async (id, componentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`/api/product/${id}`, {
        componentId
      });
      
      if (response.status === 'canceled') {
        set({ isLoading: false });
        return null;
      }
      
      if (response.status === 200) {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
          isLoading: false,
        }));
        return response;
      }
      throw new Error("Failed to delete product");
    } catch (error) {
      // Only handle non-cancellation errors
      if (!axios.isCancel(error)) {
        console.error("Error deleting product:", error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
      // Reset loading state for cancellations
      set({ isLoading: false });
      return null;
    }
  },

  getProductById: async (id, componentId) => {
    set({ isLoading: true, error: null, selectedProduct: null });
    try {
      const response = await axios.get(`/api/product/${id}`, {
        componentId,
        allowDuplicate: false
      });
      
      // Skip processing if the request was canceled
      if (response.status === 'canceled') {
        set({ isLoading: false });
        return null;
      }
      
      if (response.status === 200 || response.data) {
        const formattedProduct = {
          ...response.data,
          image: {
            imageUrl: response.data.image?.imageUrl || "",
            imageUrl2: response.data.image?.image2 || "",
            imageUrl3: response.data.image?.image3 || "",
          }
        };
        set({ selectedProduct: formattedProduct, isLoading: false });
        return formattedProduct;
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
      // Only handle non-cancellation errors
      if (!axios.isCancel(error)) {
        console.error("Error fetching product:", error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
      // Reset loading state for cancellations
      set({ isLoading: false });
      return null;
    }
  },

  fetchCategories: async (componentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get("/api/categories", {
        params: {
          pageNumber: 0,
          pageSize: 100,
        },
        componentId,
        allowDuplicate: false
      });
      
      // Skip processing if the request was canceled
      if (response.status === 'canceled') {
        set({ isLoading: false });
        return [];
      }
      const categoriesArray = Array.isArray(response.data) ? response.data : [];
      set({ categories: categoriesArray, isLoading: false, abortController: null });
      return categoriesArray;
    } catch (error) {
      // Only handle non-cancellation errors
      if (!axios.isCancel(error)) {
        console.error("Error fetching categories:", error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
      // Reset loading state for cancellations
      set({ isLoading: false });
      return [];
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
