import { create } from 'zustand';
import axios from '@/api/api';

const useContractStore = create((set) => ({
  loading: false,
  error: null,
  contract: null,

  // Generate contract
  generateContract: async (contractData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await axios.post('/api/contract', {
        userId: contractData.userId,
        serviceOrderId: contractData.serviceOrderId,
        userName: contractData.userName,
        email: contractData.email,
        phone: contractData.phone,
        address: contractData.address,
        designPrice: contractData.designPrice
      });

      if (response.data) {
        set({ contract: response.data, loading: false });
        return response.data;
      }

      throw new Error('Không thể tạo hợp đồng');
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Có lỗi xảy ra khi tạo hợp đồng',
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

  // Get contract by service order ID
  getContractByServiceOrder: async (serviceOrderId) => {
    try {
      set({ loading: true, error: null });
      
      const response = await axios.get(`/api/contract/${serviceOrderId}/serviceorder`);

      if (response.data && response.data.length > 0) {
        set({ contract: response.data[0], loading: false });
        return response.data[0];
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

  // Sign contract
  signContract: async (contractId, signatureUrl) => {
    try {
      set({ loading: true, error: null });
      
      const response = await axios.put(`/api/contract/${contractId}`, {
        signatureUrl: signatureUrl
      });

      if (response.data) {
        set({ loading: false });
        return response.data;
      }

      throw new Error('Không thể ký hợp đồng');
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Có lỗi xảy ra khi ký hợp đồng',
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

  // Clear store data
  clearStore: () => {
    set({ loading: false, error: null, contract: null });
  }
}));

export default useContractStore;
