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
        (order) => order.status === "Pending"
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
        (order) => order.isCustom === true && order.status === "Pending"
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
  },

  // Thêm hàm để cập nhật trạng thái task cho đơn hàng có trạng thái DepositSuccessful
  updateTasksForDepositSuccessfulOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      // Lấy danh sách đơn hàng có trạng thái DepositSuccessful
      const responseNoIdea = await api.get("/api/serviceorder/noidea");
      const responseUsingIdea = await api.get("/api/serviceorder/usingidea");
      const responseDepositSuccessful = responseNoIdea.data && responseUsingIdea.data;
      
      if (!responseDepositSuccessful || responseDepositSuccessful.length === 0) {
        set({ isLoading: false });
        return { message: "Không có đơn hàng nào có trạng thái DepositSuccessful" };
      }
      
      // Lấy danh sách task hiện tại
      const tasks = get().workTasks;
      
      // Cập nhật trạng thái task cho từng đơn hàng
      const updatePromises = responseDepositSuccessful.map(async (order) => {
        // Tìm task tương ứng với đơn hàng
        const task = tasks.find(task => task.serviceOrderId === order.id);
        
        if (task) {
          // Kiểm tra nếu task đã có trạng thái 2 (Design) hoặc service order có trạng thái AssignToDesigner thì bỏ qua
          if (task.status === 2 || task.status === "Design" || order.status === "AssignToDesigner") {
            return null;
          }
          
          // Cập nhật trạng thái task lên 2
          const updateResponse = await api.put(`/api/worktask/${task.id}`, {
            serviceOrderId: task.serviceOrderId,
            userId: task.userId,
            status: 2,
            note: task.note || "Khách hàng đã đặt cọc"
          });

          console.log("Updating service order status for order:", order.id);
          // Tự động cập nhật trạng thái service order lên 4 (Designing)
          const updateServiceOrder = await api.put(`/api/serviceorder/status/${order.id}`, {
            status: 4 // Trạng thái 4 tương ứng với "Designing"
          });
          
          console.log("Service order update response:", updateServiceOrder.data);
          return updateResponse.data;
        }
        return null;
      });
      
      // Đợi tất cả các promise hoàn thành
      const results = await Promise.all(updatePromises);
      const updatedTasks = results.filter(result => result !== null);
      
      // Cập nhật state với danh sách task mới
      if (updatedTasks.length > 0) {
        // Cập nhật workTasks trong state
        const currentTasks = get().workTasks;
        const updatedWorkTasks = currentTasks.map(task => {
          const updatedTask = updatedTasks.find(ut => ut.id === task.id);
          return updatedTask || task;
        });
        
        set({ 
          workTasks: updatedWorkTasks,
          isLoading: false 
        });
        
        return { 
          message: `Đã cập nhật ${updatedTasks.length} task và trạng thái đơn hàng cho đơn hàng có trạng thái DepositSuccessful`,
          updatedTasks
        };
      }
      
      set({ isLoading: false });
      return { message: "Không có task nào cần cập nhật" };
    } catch (error) {
      console.error("Error updating tasks for deposit successful orders:", error);
      set({ 
        error: error.message || "Không thể cập nhật task cho đơn hàng có trạng thái DepositSuccessful",
        isLoading: false 
      });
      return { error: error.message || "Không thể cập nhật task cho đơn hàng có trạng thái DepositSuccessful" };
    }
  }
}));

export default useScheduleStore;
