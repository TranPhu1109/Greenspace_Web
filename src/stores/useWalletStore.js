import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../api/api';

const useWalletStore = create(persist((set, get) => ({
  balance: 0,
  walletId: null,
  walletName: null,
  transactions: [],
  loading: false,
  transactionsLoading: false,
  error: null,
  transactionsError: null,

  // Tạo QR VNPay
  createVNPayQR: async (amount) => {
    try {
      set({ loading: true, error: null });
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      const token = user.backendToken;
      
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

  // Xử lý response từ VNPay
  handleVNPayResponse: async (returnUrl) => {
    try {
      set({ loading: true, error: null });

      // Gọi API để xử lý response từ VNPay
      const response = await axios.get('/api/wallets/vn-pay/response', {
        params: {
          returnUrl: returnUrl
        }
      });

      // Nếu thanh toán thành công, cập nhật lại số dư và lịch sử giao dịch
      if (response.data) {
        await Promise.all([
          get().fetchBalance(),
          get().fetchTransactions()
        ]);
      }

      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Có lỗi xảy ra khi xử lý giao dịch' 
      });
      throw error;
    }
  },

  // Lấy số dư ví
  fetchBalance: async () => {
    try {
      // Reset state before fetching
      set({ loading: true, error: null });

      // Get user data from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('Vui lòng đăng nhập để xem số dư ví');
      }

      const user = JSON.parse(userStr);
      const userId = user.id;
      
      if (!userId) {
        throw new Error('Vui lòng đăng nhập để xem số dư ví');
      }

      // Make API call
      const response = await axios.get(`/api/wallets/user${userId}`);
      
      if (!response.data) {
        throw new Error('Không nhận được dữ liệu từ server');
      }

      // Update state with wallet data
      set({ 
        balance: response.data.amount ?? 0,
        walletId: response.data.id,
        walletName: response.data.name,
        loading: false,
        error: null
      });

      return response.data;
    } catch (error) {
      console.error('Error in fetchBalance:', error);
      
      // Set error state
      set({ 
        loading: false,
        balance: 0,
        walletId: null,
        walletName: null,
        error: error.response?.data?.message || error.message || 'Không thể lấy số dư' 
      });

      throw error;
    }
  },

  // Lấy lịch sử giao dịch
  fetchTransactions: async () => {
    try {
      set({ transactionsLoading: true, transactionsError: null });

      const walletId = get().walletId;
      if (!walletId) {
        // Nếu chưa có walletId, gọi fetchBalance trước
        await get().fetchBalance();
      }

      // Lấy lại walletId sau khi fetchBalance (để đảm bảo có giá trị mới nhất)
      const currentWalletId = get().walletId;
      if (!currentWalletId) {
        throw new Error('Không tìm thấy thông tin ví');
      }

      const response = await axios.get(`/api/wallets/${currentWalletId}`);

      if (!response.data) {
        throw new Error('Không nhận được dữ liệu từ server');
      }

      set({ 
        transactions: response.data.walletLogs || [], 
        transactionsLoading: false,
        transactionsError: null
      });

      return response.data.walletLogs;
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
      set({ 
        transactionsLoading: false, 
        transactionsError: error.response?.data?.message || error.message || 'Không thể lấy lịch sử giao dịch' 
      });
      throw error;
    }
  },

  // Reset state
  reset: () => {
    set({
      balance: 0,
      walletId: null,
      walletName: null,
      transactions: [],
      loading: false,
      transactionsLoading: false,
      error: null,
      transactionsError: null
    });
  }
}), {
  name: 'wallet-storage',
  getStorage: () => localStorage
}));

export default useWalletStore;