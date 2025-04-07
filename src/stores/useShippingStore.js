import { create } from 'zustand';
import api from '../api/api';

const useShippingStore = create((set) => ({
  shippingFee: 0,
  order_code: '',
  loading: false,
  error: null,
  
  // Province state
  provinces: [],
  provincesLoading: false,
  provincesError: null,
  
  // District state
  districts: [],
  districtsLoading: false,
  districtsError: null,
  
  // Ward state
  wards: [],
  wardsLoading: false,
  wardsError: null,

  getProvinces: async () => {
    try {
      set({ provincesLoading: true, provincesError: null });
      const response = await api.get('/api/shipping/provinces');
      
      if (response.data?.data) {
        set({ provinces: response.data.data });
        return response.data.data;
      }
      throw new Error('Không thể lấy danh sách tỉnh thành');
    } catch (error) {
      set({ provincesError: error.message });
      console.error('Error fetching provinces:', error);
      throw error;
    } finally {
      set({ provincesLoading: false });
    }
  },

  getDistricts: async (provinceId) => {
    try {
      set({ districtsLoading: true, districtsError: null });
      const response = await api.get(`/api/shipping/districts?provinceId=${provinceId}`);
      
      if (response.data?.data) {
        set({ districts: response.data.data });
        return response.data.data;
      }
      throw new Error('Không thể lấy danh sách quận/huyện');
    } catch (error) {
      set({ districtsError: error.message });
      console.error('Error fetching districts:', error);
      throw error;
    } finally {
      set({ districtsLoading: false });
    }
  },

  getWards: async (districtId) => {
    try {
      set({ wardsLoading: true, wardsError: null });
      const response = await api.get(`/api/shipping/wards?districtId=${districtId}`);
      
      if (response.data?.data) {
        set({ wards: response.data.data });
        return response.data.data;
      }
      throw new Error('Không thể lấy danh sách phường/xã');
    } catch (error) {
      set({ wardsError: error.message });
      console.error('Error fetching wards:', error);
      throw error;
    } finally {
      set({ wardsLoading: false });
    }
  },

  calculateShippingFee: async (addressData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/api/shipping/calculate-fee', addressData);

      if (response.data?.data?.code === 200) {
        set({ shippingFee: response.data.data.data.service_fee });
        return response.data.data.service_fee;
      }
      throw new Error('Failed to calculate shipping fee');
    } catch (error) {
      set({ error: error.message });
      console.error('Error calculating shipping fee:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createShippingOrder: async (shippingData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/api/shipping/create-order', shippingData);
      console.log("response create shipping order: ---",response.data);
      
      if (response.data?.data?.code === 200) {
        set({ order_code: response.data.data.data.order_code });
        return response.data;
      }
      throw new Error('Không thể tạo đơn vận chuyển');
    } catch (error) {
      set({ error: error.message });
      console.error('Error creating shipping order:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resetShippingFee: () => set({ shippingFee: 0, error: null }),

  trackOrder: async (deliveryCode) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/api/shipping/track-order/${deliveryCode}`);
      
      if (response.data?.data?.code === 200) {
        return response.data?.data?.data?.status;
      }
      throw new Error('Không thể lấy trạng thái đơn hàng');
    } catch (error) {
      set({ error: error.message });
      console.error('Error tracking order:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));

export default useShippingStore;