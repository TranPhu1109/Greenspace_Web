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
  isSyncing: false,

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

          // Chỉ cập nhật khi order có trạng thái DepositSuccessful và task có trạng thái DoneConsulting
          if (order.status !== "DepositSuccessful" || task.status !== "DoneConsulting") {
            return null;
          }
          
          // Cập nhật trạng thái task lên 2
          const updateResponse = await api.put(`/api/worktask/${task.id}`, {
            serviceOrderId: task.serviceOrderId,
            userId: task.userId,
            status: 2,
            note: task.note || "Khách hàng đã đặt cọc"
          });

          // Chỉ cập nhật service order nếu cập nhật task thành công
          if (updateResponse.data) {
            console.log("Updating service order status for order:", order.id);
            // Tự động cập nhật trạng thái service order lên 4 (Designing)
            const updateServiceOrder = await api.put(`/api/serviceorder/status/${order.id}`, {
              status: 4, // Trạng thái 4 tương ứng với "Designing"
              deliveryCode: "" // Thêm trường deliveryCode theo yêu cầu API
            });
            
            console.log("Service order update response:", updateServiceOrder.data);
          }
          
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
  },

  // --- Sync Task status for ReConsulting Orders ---
  syncTasksForReConsultingOrders: async () => {
    // Prevent concurrent runs
    if (get().isSyncing) {
        console.log("Sync (ReConsulting) already in progress, skipping.");
        return { message: "Sync already running." };
    }
    set({ isSyncing: true });
    console.log("Starting sync for ReConsulting orders...");
    let updatedTasksCount = 0;

    try {
      // Step 1: Fetch latest relevant orders
      const [noIdeaResponse, usingIdeaResponse] = await Promise.all([
          api.get("api/serviceorder/noidea").catch(e => { console.error("Failed fetch noIdeaOrders:", e); return { data: [] }; }),
          api.get("api/serviceorder/usingidea").catch(e => { console.error("Failed fetch usingIdeaOrders:", e); return { data: [] }; })
      ]);
      const allOrders = [...(noIdeaResponse.data || []), ...(usingIdeaResponse.data || [])];

      // Step 2: Filter orders with ReConsultingAndSketching status (19)
      const reConsultingOrders = allOrders.filter(order => 
          order.status === 19 || order.status === 'ReConsultingAndSketching'
      );

      if (reConsultingOrders.length === 0) {
        console.log("No orders found with ReConsulting status.");
        set({ isSyncing: false });
        return { message: "Không có đơn hàng nào cần phác thảo lại." };
      }
      console.log(`Found ${reConsultingOrders.length} orders needing ReConsulting.`);

      // Step 3: Get current tasks from state
      const currentTasks = get().workTasks || [];
      if (currentTasks.length === 0) {
          console.log("No current tasks in state to sync.");
          set({ isSyncing: false });
          return { message: "Không có task nào trong hệ thống." };
      }

      // Step 4 & 5: Map through filtered orders, find tasks, and prepare updates
      const updatePromises = reConsultingOrders.map(async (order) => {
        const task = currentTasks.find(t => t.serviceOrderId === order.id);

        // Step 6: Apply conditions
        if (task && task.status !== 'ConsultingAndSket') { 
          console.log(`   - Task ${task.id} for order ${order.id} (Task Status: ${task.status}) needs update to ConsultingAndSket.`);
          // Step 7: Prepare payload
          const payload = { 
            serviceOrderId: task.serviceOrderId, 
            userId: task.userId, 
            status: 0, // Target status: ConsultingAndSket (Thường là 0 hoặc string tương ứng)
            note: task.note || 'Yêu cầu phác thảo lại từ khách hàng.' 
          };
          // Step 8: Call API to update task
          try {
            const updateResponse = await api.put(`/api/worktask/${task.id}`, payload);
            console.log(`   - Task ${task.id} updated successfully.`);
            return updateResponse.data; // Return updated task data
          } catch (err) {
            console.error(`   - Failed to update task ${task.id}:`, err.response?.data || err.message);
            return null; // Indicate failure for this task
          }
        } else if (task && task.status === 'ConsultingAndSket') {
           console.log(`   - Task ${task.id} for order ${order.id} is already in ConsultingAndSket status.`);
           return null; // Already correct, no update needed
        } else {
           console.log(`   - No task found or no update needed for order ${order.id}.`);
           return null; // No task found or no update needed
        }
      });

      // Step 10: Collect results and update state
      const results = await Promise.all(updatePromises);
      const successfulUpdates = results.filter(result => result !== null);
      updatedTasksCount = successfulUpdates.length;

      if (updatedTasksCount > 0) {
        console.log(`Successfully updated ${updatedTasksCount} tasks to ConsultingAndSket.`);
        // Update the main workTasks state with the results
        set(state => {
           const newTaskState = state.workTasks.map(task => {
               const updatedVersion = successfulUpdates.find(ut => ut.id === task.id);
               return updatedVersion || task;
           });
           console.log("Updated workTasks state in store after ReConsulting sync.");
           return { workTasks: newTaskState };
        });
      } else {
        console.log("No tasks were updated in this sync cycle.");
      }
      
      return { message: `Đã đồng bộ xong. Cập nhật ${updatedTasksCount} task.` };

    } catch (error) {
      console.error("General error during syncTasksForReConsultingOrders:", error);
      return { error: error.message || "Lỗi đồng bộ task phác thảo lại." };
    } finally {
      set({ isSyncing: false });
      console.log("Finished sync for ReConsulting orders.");
    }
  }
}));

export default useScheduleStore;
