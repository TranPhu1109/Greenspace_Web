import { create } from 'zustand';
import axios from '../api/api';

const useWalletStore = create((set, get) => ({
  balance: 0,
  transactions: [],
  loading: false,
  error: null,

  // Tạo QR VNPay
  createVNPayQR: async (amount) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/wallets/vn-pay', amount, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Có lỗi xảy ra' 
      });
      throw error;
    }
  },

  // Lấy số dư ví
  fetchBalance: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/wallets/balance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      set({ balance: response.data, loading: false });
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Không thể lấy số dư' 
      });
    }
  },

  // Lấy lịch sử giao dịch
  fetchTransactions: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/wallets/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      set({ transactions: response.data, loading: false });
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Không thể lấy lịch sử giao dịch' 
      });
    }
  },

  // Reset state
  reset: () => {
    set({
      balance: 0,
      transactions: [],
      loading: false,
      error: null
    });
  },

  // Xử lý callback từ VNPay
  handlePaymentCallback: async (queryParams) => {
    try {
      set({ loading: true, error: null });
      
      // Kiểm tra trạng thái giao dịch
      const isSuccess = queryParams.vnp_ResponseCode === '00' && 
                       queryParams.vnp_TransactionStatus === '00';

      if (!isSuccess) {
        throw new Error('Giao dịch không thành công');
      }

      // Cập nhật số dư và lịch sử giao dịch
      await Promise.all([
        get().fetchBalance(),
        get().fetchTransactions()
      ]);

      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Có lỗi xảy ra khi xử lý giao dịch' 
      });
      return false;
    }
  }
}));

export default useWalletStore; 