import api from '@/api/api';
import { create } from 'zustand';

const useDesignerTask = create((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,

  // Lấy danh sách task theo userId
  fetchTasks: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/worktask/${userId}/users`);
      set({ tasks: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchTasksSilent: async (userId) => {
    try {
      const response = await api.get(`/api/worktask/${userId}/users`);
      const newTasks = response.data;
      const currentTasks = get().tasks;
  
      const isChanged = JSON.stringify(currentTasks) !== JSON.stringify(newTasks);
      if (isChanged) {
        set({ tasks: newTasks }); // Không bật loading
      }
    } catch (error) {
      console.error("Silent fetchTasks error:", error.message);
    }
  },
  

  // Lấy chi tiết task theo taskId
  fetchTaskDetail: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/worktask/${taskId}`);
      set({ currentTask: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Cập nhật trạng thái task
  updateTaskStatus: async (taskId, { serviceOrderId, userId, status, note, dateAppointment, timeAppointment }) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/api/worktask/${taskId}`, {
        serviceOrderId,
        userId,
        status,
        note,
        dateAppointment,
        timeAppointment
      });
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, status } : task
        ),
        currentTask: state.currentTask?.id === taskId
          ? { ...state.currentTask, status }
          : state.currentTask,
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Reset state
  resetState: () => {
    set({
      tasks: [],
      currentTask: null,
      isLoading: false,
      error: null
    });
  }
}));

export default useDesignerTask;