import api from '@/api/api';
import { create } from 'zustand';


const useComplaintReasonStore = create((set) => ({
  reasons: [],
  loading: false,

  fetchComplaintReasons: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/api/complaintreason');
      set({ reasons: res.data });
    } catch (error) {
      console.error('Failed to fetch complaint reasons:', error);
      set({ reasons: [] });
    } finally {
      set({ loading: false });
    }
  },

  createComplaintReason: async (reason) => {
    await api.post('/api/complaintreason', { reason });
  },

  updateComplaintReason: async (id, reason) => {
    await api.put(`/api/complaintreason/${id}`, { reason });
  },

  deleteComplaintReason: async (id) => {
    await api.delete(`/api/complaintreason/${id}`);
  },
}));

export default useComplaintReasonStore;
