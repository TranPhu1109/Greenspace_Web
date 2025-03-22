import { create } from 'zustand';
import api from '../api/api';

const useScheduleStore = create((set, get) => ({
  designers: [],
  selectedDesigner: null,
  isLoading: false,
  error: null,

  // Lấy danh sách tất cả designers và tasks của họ
  fetchDesigners: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('api/schedule');
      set({ 
        designers: response.data,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.message || 'Không thể tải dữ liệu designers', 
        isLoading: false 
      });
      return [];
    }
  },

  // Lấy thông tin chi tiết của một designer
  fetchDesignerById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`http://localhost:3000/schedule/${id}`);
      set({ selectedDesigner: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.message || 'Không thể tải thông tin designer', 
        isLoading: false 
      });
      return null;
    }
  },

  // Thêm task mới cho designer
  addTask: async (designerId, taskData) => {
    set({ isLoading: true, error: null });
    try {
      // Lấy designer hiện tại
      const designer = get().designers.find(d => d.id == designerId);
      if (!designer) throw new Error('Không tìm thấy designer');

      // Tạo task mới với ID tự tạo
      const newTask = {
        task_id: Date.now(), // Tạo ID tạm thời
        title: taskData.title,
        customer: taskData.customer,
        deadline: taskData.deadline,
        task_status: taskData.status || 'thiết kế',
        notes: taskData.notes || ''
      };

      // Cập nhật trạng thái designer thành "đang bận"
      const updatedDesigner = {
        ...designer,
        status: 'đang bận',
        tasks: [...(designer.tasks || []), newTask]
      };

      // Gọi API để cập nhật
      const response = await api.put(`https://67d3cec08bca322cc26b1d5e.mockapi.io/schedule/${designerId}`, updatedDesigner);

      // Cập nhật state
      const updatedDesigners = get().designers.map(d => 
        d.id == designerId ? response.data : d
      );

      set({ 
        designers: updatedDesigners,
        isLoading: false 
      });

      return response.data;
    } catch (error) {
      set({ 
        error: error.message || 'Không thể thêm task mới', 
        isLoading: false 
      });
      throw error;
    }
  },

  // Cập nhật task
  updateTask: async (designerId, taskId, taskData) => {
    set({ isLoading: true, error: null });
    try {
      // Lấy designer hiện tại
      const designer = get().designers.find(d => d.id == designerId);
      if (!designer) throw new Error('Không tìm thấy designer');

      // Tìm và cập nhật task
      const updatedTasks = designer.tasks.map(task => 
        task.task_id == taskId ? { ...task, ...taskData } : task
      );

      // Kiểm tra nếu không còn task nào đang thực hiện thì cập nhật trạng thái designer
      const hasActiveTasks = updatedTasks.some(task => 
        task.task_status !== 'hoàn thành'
      );

      const updatedDesigner = {
        ...designer,
        status: hasActiveTasks ? 'đang bận' : 'đang rảnh',
        tasks: updatedTasks
      };

      // Gọi API để cập nhật
      const response = await api.put(`https://67d3cec08bca322cc26b1d5e.mockapi.io/schedule/${designerId}`, updatedDesigner);

      // Cập nhật state
      const updatedDesigners = get().designers.map(d => 
        d.id == designerId ? response.data : d
      );

      set({ 
        designers: updatedDesigners,
        isLoading: false 
      });

      return response.data;
    } catch (error) {
      set({ 
        error: error.message || 'Không thể cập nhật task', 
        isLoading: false 
      });
      throw error;
    }
  },

  // Xóa task
  deleteTask: async (designerId, taskId) => {
    set({ isLoading: true, error: null });
    try {
      // Lấy designer hiện tại
      const designer = get().designers.find(d => d.id == designerId);
      if (!designer) throw new Error('Không tìm thấy designer');

      // Lọc bỏ task cần xóa
      const updatedTasks = designer.tasks.filter(task => 
        task.task_id != taskId
      );

      // Kiểm tra nếu không còn task nào thì cập nhật trạng thái designer
      const hasActiveTasks = updatedTasks.some(task => 
        task.task_status !== 'hoàn thành'
      );

      const updatedDesigner = {
        ...designer,
        status: hasActiveTasks ? 'đang bận' : 'đang rảnh',
        tasks: updatedTasks
      };

      // Gọi API để cập nhật
      const response = await api.put(`https://67d3cec08bca322cc26b1d5e.mockapi.io/schedule/${designerId}`, updatedDesigner);

      // Cập nhật state
      const updatedDesigners = get().designers.map(d => 
        d.id == designerId ? response.data : d
      );

      set({ 
        designers: updatedDesigners,
        isLoading: false 
      });

      return response.data;
    } catch (error) {
      set({ 
        error: error.message || 'Không thể xóa task', 
        isLoading: false 
      });
      throw error;
    }
  },

  // Lấy tất cả tasks từ tất cả designers (chỉ lấy tasks chưa hoàn thành)
  getAllActiveTasks: () => {
    const { designers } = get();
    return designers.reduce((allTasks, designer) => {
      const designerTasks = (designer.tasks || [])
        .filter(task => task.task_status !== 'hoàn thành')
        .map(task => ({
          ...task,
          designerId: designer.id,
          designerName: designer.name,
          designerStatus: designer.status,
          designerAvatar: designer.avatar,
          designerEmail: designer.email
        }));
      return [...allTasks, ...designerTasks];
    }, []);
  },

  // Lấy tasks theo ngày
  getTasksByDate: (date) => {
    const allTasks = get().getAllActiveTasks();
    return allTasks.filter(task => {
      const taskDate = new Date(task.deadline).toISOString().split('T')[0];
      return taskDate === date;
    });
  },

  // Lấy designers đang rảnh
  getAvailableDesigners: () => {
    return get().designers.filter(designer => designer.status === 'đang rảnh');
  },

  // Lấy designers đang bận
  getBusyDesigners: () => {
    return get().designers.filter(designer => designer.status === 'đang bận');
  },

  // Reset state
  resetState: () => {
    set({
      designers: [],
      selectedDesigner: null,
      isLoading: false,
      error: null
    });
  }
}));

export default useScheduleStore; 