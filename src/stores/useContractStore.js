import { create } from 'zustand';
import axios from '@/api/api';

const useContractStore = create((set) => ({
  loading: false,
  error: null,
  contract: null,

  // Generate a new contract
  generateContract: async (contractData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/contract', contractData);
      set({ 
        contract: response.data,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.message,
        loading: false 
      });
      throw error;
    }
  },

  // Get contract by ID
  getContractById: async (contractId) => {
    try {
      set({ loading: true, error: null });
      
      const response = await axios.get(`/api/contract/${contractId}`);

      if (response.data) {
        set({ contract: response.data, loading: false });
        return response.data;
      }

      throw new Error('Không thể lấy thông tin hợp đồng');
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin hợp đồng',
        loading: false 
      });
      throw error;
    }
  },

  // Get contract by service order
  getContractByServiceOrder: async (serviceOrderId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/contract/${serviceOrderId}/serviceorder`);
      // Ensure we're getting the first contract if it's an array
      const contractData = Array.isArray(response.data) ? response.data[0] : response.data;
      set({ 
        contract: contractData,
        loading: false 
      });
      return contractData;
    } catch (error) {
      set({ 
        error: error.message,
        loading: false 
      });
      throw error;
    }
  },

  // Sign contract
  signContract: async (contractId, signatureUrl) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/contract/${contractId}`, {
        signatureUrl: signatureUrl
      });
      set({ 
        contract: response.data,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.message,
        loading: false 
      });
      throw error;
    }
  },

  // Get contract URL
  getContractUrl: (contract) => {
    if (!contract || !contract.description) return null;
    return contract.description;
  },

  // Reset state
  resetState: () => {
    set({
      contract: null,
      loading: false,
      error: null
    });
  }
}));

export default useContractStore;
