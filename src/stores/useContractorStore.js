import { create } from 'zustand';
import api from '@/api/api';
import { message } from 'antd';

const useContractorStore = create((set, get) => ({
  contractors: [],
  contractorTasks: [],
  selectedContractor: null,
  isLoading: false,
  error: null,
  serviceOrders: [],

  // Fetch all contractors
  fetchContractors: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/api/users/contructor');
      set({ contractors: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error fetching contractors:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to fetch contractors', 
        isLoading: false 
      });
      throw error;
    }
  },

  // Fetch tasks for a specific contractor
  fetchContractorTasks: async (contractorId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/api/worktask/contructor');
      
      // Filter tasks by contractor ID if provided
      const tasks = contractorId 
        ? response.data.filter(task => task.userId === contractorId)
        : response.data;
        
      set({ contractorTasks: tasks, isLoading: false });
      return tasks;
    } catch (error) {
      // If 404, set empty array (expected when no tasks exist)
      if (error.response?.status === 404) {
        set({ contractorTasks: [], isLoading: false });
        return [];
      }
      
      console.error('Error fetching contractor tasks:', error);
      set({
        error: error.response?.data?.error || 'Failed to fetch contractor tasks',
        isLoading: false
      });
      throw error;
    }
  },

  // Create a new task for a contractor
  createContractorTask: async (taskData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/api/worktask/contruction', taskData);
      
      // Update the task list
      const { contractorTasks } = get();
      set({ 
        contractorTasks: [...contractorTasks, response.data],
        isLoading: false
      });
      
      message.success('Đã tạo lịch làm việc thành công');
      return response.data;
    } catch (error) {
      console.error('Error creating contractor task:', error);
      set({
        error: error.response?.data?.error || 'Failed to create contractor task',
        isLoading: false
      });
      message.error('Không thể tạo lịch làm việc: ' + (error.response?.data?.error || error.message || 'Lỗi không xác định'));
      throw error;
    }
  },

  // Fetch available service orders (with PaymentSuccess status)
  fetchAvailableServiceOrders: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/api/serviceorder/noidea');
      
      // Filter for orders with PaymentSuccess status
      const filteredOrders = response.data.filter(order => order.status === 'PaymentSuccess');
      
      set({ serviceOrders: filteredOrders, isLoading: false });
      return filteredOrders;
    } catch (error) {
      console.error('Error fetching available service orders:', error);
      set({
        error: error.response?.data?.error || 'Failed to fetch available service orders',
        isLoading: false
      });
      throw error;
    }
  },

  // Select a contractor
  selectContractor: (contractor) => {
    set({ selectedContractor: contractor });
  },

  // Reset state
  resetState: () => {
    set({
      contractors: [],
      contractorTasks: [],
      selectedContractor: null,
      error: null,
      serviceOrders: []
    });
  }
}));

export default useContractorStore; 