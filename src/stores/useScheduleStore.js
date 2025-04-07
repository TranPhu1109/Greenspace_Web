import { create } from "zustand";
import api from "../api/api";

const useScheduleStore = create((set, get) => ({
  orders: [],
  noIdeaOrders: [],
  usingIdeaOrders: [],
  designers: [],
  selectedDesigner: null,
  workTasks: [],
  isLoading: false,
  error: null,

  // Lấy danh sách tất cả work tasks đang hoạt động
  getAllTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/worktask');
      const tasks = response.data;
      
      set({
        workTasks: tasks,
        isLoading: false
      });
      return tasks;
    } catch (error) {
      set({
        error: error.message || 'Không thể tải danh sách công việc',
        isLoading: false
      });
      return [];
    }
  },

  // Lấy danh sách tất cả designers và tasks của họ
  fetchDesigners: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("api/users/designer");
      const designersOnly = response.data
      set({
        designers: designersOnly,
        isLoading: false,
      });
      return designersOnly;
    } catch (error) {
      set({
        error: error.message || "Không thể tải dữ liệu designers",
        isLoading: false,
      });
      return [];
    }
  },

  // Lấy danh sách đơn thiết kế không có mẫu đang trong giai đoạn tư vấn và phác thảo
  fetchNoIdeaOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("api/serviceorder/noidea");
      const consultingOrders = response.data.filter(
        (order) => order.status === "ConsultingAndSketching"
      );
      set({
        noIdeaOrders: consultingOrders,
        isLoading: false,
        orders: consultingOrders,
        error: null
      });
      return consultingOrders;
    } catch (error) {
      set({
        error: error.message || "Không thể tải danh sách đơn thiết kế",
        isLoading: false,
      });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  // Lấy danh sách đơn thiết kế có sử dụng mẫu, tùy chỉnh và đang trong giai đoạn tư vấn và phác thảo
  fetchUsingIdeaOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("api/serviceorder/usingidea");
      const customConsultingOrders = response.data.filter(
        (order) => order.isCustom === true && order.status === "ConsultingAndSketching"
      );
      set({
        usingIdeaOrders: customConsultingOrders,
        isLoading: false,
        orders: customConsultingOrders,
      });
      return customConsultingOrders;
    } catch (error) {
      set({
        error: error.message || "Không thể tải danh sách đơn thiết kế",
        isLoading: false,
      });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  // Lấy danh sách tasks theo ngày

  // Thêm task mới cho designer
  addTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      // Gọi API để thêm task mới
      const response = await api.post('/api/worktask', {
        serviceOrderId: taskData.serviceOrderId,
        userId: taskData.userId,
        note: taskData.note || ''
      });
      const newTask = response.data;
      
      // Cập nhật state với task mới
      set(state => ({
        workTasks: [...state.workTasks, newTask],
        isLoading: false,
        error: null
      }));
      
      // Tự động fetch lại danh sách tasks
      await get().getAllTasks();
      
      return newTask;
    } catch (error) {
      set({
        error: error.message || 'Không thể thêm công việc mới',
        isLoading: false
      });
      throw error;
    }
  },

  // Cập nhật trạng thái task
  updateTask: async (taskId, taskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/worktask/${taskId}`, taskData);
      const updatedTask = response.data;
      
      set(state => ({
        workTasks: state.workTasks.map(task =>
          task.id === taskId ? updatedTask : task
        ),
        isLoading: false
      }));
      
      // Cập nhật lại danh sách tasks
      await get().getAllActiveTasks();
      
      return updatedTask;
    } catch (error) {
      set({
        error: error.message || 'Không thể cập nhật công việc',
        isLoading: false
      });
      throw error;
    }
  }
}));

export default useScheduleStore;
