import { create } from 'zustand';
import axios from '../api/api';

const useTransactionStore = create((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/transactions');
      set({ transactions: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateTransaction: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/api/transactions/${id}`, data);
      set(state => ({
        transactions: state.transactions.map(t => 
          t.id === id ? response.data : t
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));

export default useTransactionStore;