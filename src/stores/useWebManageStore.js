import { create } from 'zustand';
import api from '@/api/api';

const useWebManageStore = create((set) => ({
  // Logo state
  logo: null,
  logoLoading: false,
  logoError: null,

  // Banner state
  banners: [],
  currentBanner: null,
  bannerLoading: false,
  bannerError: null,

  // Logo operations
  fetchLogo: async () => {
    set({ logoLoading: true, logoError: null });
    try {
      const response = await api.get('/api/webmanage/logo');
      set({ logo: response.data, logoLoading: false });
      return response.data;
    } catch (error) {
      // Check if it's the expected "no logo" error
      if (error.response?.data?.error === "There are no logo in the database!") {
        // Handle gracefully, just set empty data
        set({ logo: null, logoLoading: false });
        return null;
      } else {
        set({ logoError: error.message, logoLoading: false });
        throw error;
      }
    }
  },

  fetchLogoById: async (id) => {
    set({ logoLoading: true, logoError: null });
    try {
      const response = await api.get(`/api/webmanage/logo/${id}`);
      set({ logo: response.data, logoLoading: false });
      return response.data;
    } catch (error) {
      set({ logoError: error.message, logoLoading: false });
      throw error;
    }
  },

  createLogo: async (logoData) => {
    set({ logoLoading: true, logoError: null });
    try {
      const response = await api.post('/api/webmanage/logo', logoData);
      set({ logo: response.data, logoLoading: false });
      return response.data;
    } catch (error) {
      set({ logoError: error.message, logoLoading: false });
      throw error;
    }
  },

  updateLogo: async (id, logoData) => {
    set({ logoLoading: true, logoError: null });
    try {
      const response = await api.put(`/api/webmanage/logo/${id}`, logoData);
      set({ logo: response.data, logoLoading: false });
      return response.data;
    } catch (error) {
      set({ logoError: error.message, logoLoading: false });
      throw error;
    }
  },

  // Banner operations
  fetchBanners: async () => {
    set({ bannerLoading: true, bannerError: null });
    try {
      const response = await api.get('/api/webmanage/banner');
      // Filter out banners with null imageBanner
      const filteredBanners = response.data.filter(banner => banner.imageBanner !== null);
      set({ banners: filteredBanners, bannerLoading: false });
      return filteredBanners;
    } catch (error) {
      // Check if it's the expected "no banners" error
      if (error.response?.data?.error === "There are no banners in the database!") {
        // Handle gracefully, just set empty array
        set({ banners: [], bannerLoading: false });
        return [];
      } else {
        set({ bannerError: error.message, bannerLoading: false });
        throw error;
      }
    }
  },

  fetchBannerById: async (id) => {
    set({ bannerLoading: true, bannerError: null });
    try {
      const response = await api.get(`/api/webmanage/banner/${id}`);
      set({ currentBanner: response.data, bannerLoading: false });
      return response.data;
    } catch (error) {
      set({ bannerError: error.message, bannerLoading: false });
      throw error;
    }
  },

  createBanner: async (bannerData) => {
    set({ bannerLoading: true, bannerError: null });
    try {
      const response = await api.post('/api/webmanage/banner', bannerData);
      set((state) => ({ 
        banners: [...state.banners, response.data], 
        bannerLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({ bannerError: error.message, bannerLoading: false });
      throw error;
    }
  },

  updateBanner: async (id, bannerData) => {
    set({ bannerLoading: true, bannerError: null });
    try {
      const response = await api.put(`/api/webmanage/banner/${id}`, bannerData);
      set((state) => ({
        banners: state.banners.map(banner => 
          banner.id === id ? response.data : banner
        ),
        currentBanner: state.currentBanner?.id === id 
          ? response.data 
          : state.currentBanner,
        bannerLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ bannerError: error.message, bannerLoading: false });
      throw error;
    }
  },

  deleteBanner: async (id) => {
    set({ bannerLoading: true, bannerError: null });
    try {
      await api.delete(`/api/webmanage/banner/${id}`);
      set((state) => ({
        banners: state.banners.filter(banner => banner.id !== id),
        currentBanner: state.currentBanner?.id === id ? null : state.currentBanner,
        bannerLoading: false
      }));
      return true;
    } catch (error) {
      set({ bannerError: error.message, bannerLoading: false });
      throw error;
    }
  },

  // Reset states
  resetLogoState: () => {
    set({
      logo: null,
      logoLoading: false,
      logoError: null
    });
  },

  resetBannerState: () => {
    set({
      banners: [],
      currentBanner: null,
      bannerLoading: false,
      bannerError: null
    });
  }
}));

export default useWebManageStore; 