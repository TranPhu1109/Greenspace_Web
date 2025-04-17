import { create } from 'zustand';
import api from '@/api/api';

const useAddressStore = create((set) => ({
  addresses: [],
  loading: false,
  error: null,
  
  // Set loading state
  setLoading: (loading) => set({ loading }),
  
  // Set error state
  setError: (error) => set({ error }),
  
  // Reset error
  resetError: () => set({ error: null }),
  
  // Fetch addresses for a user
  fetchUserAddresses: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/address/user/${userId}`);
      set({ addresses: response.data, loading: false });
      return response.data;
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      return [];
    }
  },
  
  // Create a new address
  createAddress: async (addressData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/address', addressData);
      set((state) => ({ 
        addresses: Array.isArray(state.addresses) ? [...state.addresses, response.data] : [response.data],
        loading: false 
      }));
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      console.error("Error creating address:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      return { success: false, error: error.response?.data || error.message };
    }
  },
  
  // Delete an address
  deleteAddress: async (addressId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/api/address/${addressId}`);
      set((state) => ({ 
        addresses: state.addresses.filter(address => address.id !== addressId),
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      console.error("Error deleting address:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      return { success: false, error: error.response?.data || error.message };
    }
  },
  
  // Clear addresses (for logout)
  clearAddresses: () => set({ addresses: [] }),
}));

export default useAddressStore; 