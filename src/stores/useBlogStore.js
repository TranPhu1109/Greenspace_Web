import { create } from 'zustand';
import api from '@/api/api';

const useBlogStore = create((set) => ({
  blogs: [],
  loading: false,
  error: null,
  
  // Fetch all blogs
  fetchBlogs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/blog');
      set({ blogs: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách blog'
      });
      throw error;
    }
  },

  // Create new blog
  createBlog: async (blogData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/blog', blogData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || 'Có lỗi xảy ra khi tạo blog'
      });
      throw error;
    }
  },

  // Delete blog
  deleteBlog: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/api/blog/${id}`);
      set({ loading: false });
      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || 'Có lỗi xảy ra khi xóa blog'
      });
      throw error;
    }
  },

  // Update blog
  updateBlog: async (id, blogData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/blog/${id}`, blogData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật blog'
      });
      throw error;
    }
  },

  // Fetch blog by ID
  fetchBlogById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/blog/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin blog'
      });
      throw error;
    }
  },

  // Reset store state
  reset: () => {
    set({
      blogs: [],
      loading: false,
      error: null
    });
  }
}));

export default useBlogStore;