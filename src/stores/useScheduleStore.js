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
  addTaskDesign: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      // Gọi API để thêm task mới
      const response = await api.post('/api/worktask/design', {
        serviceOrderId: taskData.serviceOrderId,
        userId: taskData.userId,
        dateAppointment: taskData.dateAppointment,
        timeAppointment: taskData.timeAppointment,
        note: taskData.note || ''
      });
      const newTask = response.data;

      await api.put(`/api/serviceorder/status/${taskData.serviceOrderId}`, {
        status: 1,
        deliveryCode: "" // Preserve or set default
      });
      
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

  // Xóa task
  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      // Gọi API để xóa task
      const response = await api.delete(`/api/worktask/${taskId}`);
      
      // Cập nhật state để loại bỏ task đã xóa
      set(state => ({
        workTasks: state.workTasks.filter(task => task.id !== taskId),
        isLoading: false
      }));
      
      return response.data;
    } catch (error) {
      set({
        error: error.message || 'Không thể xóa công việc',
        isLoading: false
      });
      throw error;
    }
  },

  // Thêm hàm để cập nhật trạng thái task cho đơn hàng có trạng thái DepositSuccessful
  updateTasksForDepositSuccessfulOrders: async () => {
    // Prevent concurrent runs if another sync is happening (optional but good practice)
    if (get().isLoading) { // Simple check using existing loading state
        console.log("Update (Deposit Successful) skipped: Another operation in progress.");
        return { message: "Store is busy." };
    }
    set({ isLoading: true, error: null });
    console.log("Starting check for Deposit Successful orders to update tasks/orders...");
    let updatedCount = 0;

    try {
      // Step 1: Fetch latest orders correctly
      const [noIdeaResponse, usingIdeaResponse] = await Promise.all([
          api.get("/api/serviceorder/noidea").catch(e => { console.error("Failed fetch noIdeaOrders:", e); return { data: [] }; }),
          api.get("/api/serviceorder/usingidea").catch(e => { console.error("Failed fetch usingIdeaOrders:", e); return { data: [] }; })
      ]);
      const allOrders = [...(noIdeaResponse.data || []), ...(usingIdeaResponse.data || [])];
      console.log(`Fetched ${allOrders.length} total orders.`);

      // Step 2: Filter orders with DepositSuccessful status (e.g., status code 3 or string)
      const depositSuccessfulOrders = allOrders.filter(order => 
          order.status === 3 || order.status === 'DepositSuccessful'
      );
      console.log(`Found ${depositSuccessfulOrders.length} orders with DepositSuccessful status.`);

      // Step 3: Check if any orders need processing
      if (depositSuccessfulOrders.length === 0) {
        set({ isLoading: false });
        return { message: "Không có đơn hàng nào ở trạng thái DepositSuccessful cần kiểm tra." };
      }

      // Step 4: Get current tasks from state
      const currentTasks = get().workTasks || [];
       if (currentTasks.length === 0) {
          console.log("No current tasks in state to check against.");
          set({ isLoading: false });
          return { message: "Không có task nào trong hệ thống để kiểm tra." };
      }
      console.log(`Checking against ${currentTasks.length} current tasks.`);

      // Step 5: Iterate through filtered orders and prepare updates
      const updatePromises = depositSuccessfulOrders.map(async (order) => {
        // Find the corresponding task
        const task = currentTasks.find(t => t.serviceOrderId === order.id);

        // Step 6: Apply conditions for update
        if (task) {
           // Check if task/order ALREADY processed or task status is not DoneConsulting
           const isTaskAlreadyDesign = task.status === 2 || task.status === 'Design';
           const isOrderAlreadyAssigned = order.status === 4 || order.status === 'AssignToDesigner'; // Should be DepositSuccessful here, but double check
           const isTaskDoneConsulting = task.status === 1 || task.status === 'DoneConsulting';

           if (isTaskAlreadyDesign || isOrderAlreadyAssigned) {
               console.log(`   - Skipping order ${order.id}: Task/Order already in Design/Assigned status.`);
               return null; // Already updated, skip
           }
           
           if (!isTaskDoneConsulting) {
                console.log(`   - Skipping order ${order.id}: Task status is ${task.status}, not DoneConsulting.`);
                return null; // Task not ready, skip
           }

           // Conditions met: Order is DepositSuccessful AND Task is DoneConsulting
           console.log(`   - Processing update for order ${order.id} / task ${task.id}...`);
           try {
             // Step 7a: Update Task status to Design (2)
             console.log(`     Updating task ${task.id} to status 2 (Design)...`);
             const taskUpdatePayload = {
               serviceOrderId: task.serviceOrderId,
               userId: task.userId,
               status: 2, // Target status: Design
               note: task.note || "Khách hàng đã đặt cọc, bắt đầu thiết kế."
             };
             const taskUpdateResponse = await api.put(`/api/worktask/${task.id}`, taskUpdatePayload);
             const updatedTaskData = taskUpdateResponse.data;
             console.log(`     Task ${task.id} updated successfully.`);

             // Step 7b: Update ServiceOrder status to AssignToDesigner (4) ONLY IF Task update succeeded
             if (updatedTaskData) { // Check if update response is valid
                console.log(`     Updating order ${order.id} to status 4 (AssignToDesigner)...`);
                const orderUpdatePayload = {
                   status: 4, 
                   deliveryCode: order.deliveryCode || "" // Preserve or set default
                };
                // Use the correct endpoint for status update
                await api.put(`/api/serviceorder/status/${order.id}`, orderUpdatePayload);
                console.log(`     Order ${order.id} status updated successfully.`);
                updatedCount++; // Increment counter for successful full update
                return updatedTaskData; // Return the updated task data for state update
             } else {
                console.error(`     Task ${task.id} update API call did not return expected data.`);
                return null; // Task update failed
             }
           } catch (err) {
             console.error(`   - Failed to update task ${task.id} or order ${order.id}:`, err.response?.data || err.message);
             return null; // Indicate failure for this pair
           }
        } else {
           console.log(`   - No task found for DepositSuccessful order ${order.id}.`);
           return null; // No task found
        }
      });

      // Step 8: Wait for all updates and process results
      const results = await Promise.all(updatePromises);
      const successfullyUpdatedTasks = results.filter(result => result !== null);

      // Step 9: Update state if any tasks were successfully updated
      if (successfullyUpdatedTasks.length > 0) {
        console.log(`Successfully processed updates for ${updatedCount} Task/Order pairs.`);
        // Update the main workTasks state with the results
        set(state => {
           const newTaskState = state.workTasks.map(task => {
               const updatedVersion = successfullyUpdatedTasks.find(ut => ut.id === task.id);
               return updatedVersion || task;
           });
           console.log("Updated workTasks state in store after DepositSuccessful sync.");
           return { 
             workTasks: newTaskState, 
             isLoading: false 
           };
        });
        
        return { 
          message: `Đã cập nhật ${updatedCount} task sang trạng thái Thiết kế và đơn hàng sang Đã giao cho nhà thiết kế.`,
          updatedTasks: successfullyUpdatedTasks // Return the tasks that were updated
        };
      }
      
      // Step 10: No updates were needed or performed
      console.log("No tasks/orders required updates in this cycle.");
      set({ isLoading: false });
      return { message: "Không có task/đơn hàng nào cần cập nhật trạng thái." };

    } catch (error) {
      console.error("General error during updateTasksForDepositSuccessfulOrders:", error);
      set({ 
        error: error.message || "Lỗi khi cập nhật task/đơn hàng cho trạng thái DepositSuccessful",
        isLoading: false 
      });
      return { error: error.message || "Lỗi khi cập nhật task/đơn hàng." };
    } 
    // No finally block needed as isLoading is set in success/error paths
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
