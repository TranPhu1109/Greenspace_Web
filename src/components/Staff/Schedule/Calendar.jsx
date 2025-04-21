import React, { useState, useEffect } from "react";
import {
  Calendar as AntCalendar,
  Tooltip,
  Row,
  Col,
  Card,
  Select,
  Tag,
  Avatar,
  Form,
  message,
  Badge,
} from "antd";
import dayjs from "dayjs";
import CalendarHeader from "./components/CalendarHeader";
import DayDetail from "./components/DayDetail";
import useScheduleStore from "../../../stores/useScheduleStore";
import "./Calendar.scss";
import useDesignOrderStore from "@/stores/useDesignOrderStore";

const { Option } = Select;

// Hàm tạo màu ngẫu nhiên dựa trên chuỗi
const getRandomColorFromString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// Hàm lấy chữ cái đầu tiên của email
const getInitialFromEmail = (email) => {
  if (!email) return '?';
  return email.charAt(0).toUpperCase();
};

const Calendar = ({ designers = [], onAddNew }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDesignerId, setSelectedDesignerId] = useState("all");
  const [addTaskModal, setAddTaskModal] = useState(false);
  const [form] = Form.useForm();

  // Lấy dữ liệu từ store
  const {
    getAllTasks,
    addTask,
    updateTask,
    fetchNoIdeaOrders,
    fetchUsingIdeaOrders,
    noIdeaOrders,
    usingIdeaOrders,
    workTasks,
    updateTasksForDepositSuccessfulOrders,
    syncTasksForReConsultingOrders
  } = useScheduleStore();
  const { designOrders } = useDesignOrderStore();

  // Fetch tasks và orders khi component mount, và đồng bộ trạng thái task
  useEffect(() => {
    const initializeAndSync = async () => {
      console.log("Calendar: Initializing and syncing tasks...");
      try {
        // Fetch initial data
        await Promise.all([
          fetchNoIdeaOrders(),
          fetchUsingIdeaOrders()
        ]);
        console.log("Calendar: Fetched initial orders.");

        // Run sync functions sequentially or in parallel if independent
        // Using sequential await for clearer logging and dependency
        // console.log("Calendar: Running Deposit Successful sync...");
        // const depositResult = await updateTasksForDepositSuccessfulOrders();
        // if (depositResult.error) {
        //   console.error("Lỗi khi đồng bộ task (Deposit Successful):", depositResult.error);
        // } else if (depositResult.message && !depositResult.message.includes("Không có")) {
        //   console.log("Kết quả đồng bộ (Deposit):", depositResult.message);
        // }

        // console.log("Calendar: Running Re-Consulting sync...");
        // const reConsultingResult = await syncTasksForReConsultingOrders(); 
        // if (reConsultingResult.error) {
        //   console.error("Lỗi khi đồng bộ task (Re-Consulting):", reConsultingResult.error);
        // } else if (reConsultingResult.message && !reConsultingResult.message.includes("Không có")) {
        //   console.log("Kết quả đồng bộ (Re-Consulting):", reConsultingResult.message);
        // }

        // // Fetch all tasks AFTER sync functions might have updated them
        // console.log("Calendar: Fetching all tasks after sync...");
        await getAllTasks();
        console.log("Calendar: Initialization and sync complete.");

      } catch (error) {
        console.error("Calendar: Lỗi trong quá trình khởi tạo và đồng bộ:", error);
        message.error("Đã xảy ra lỗi khi tải dữ liệu lịch trình.");
      }
    };

    initializeAndSync();
  }, []); // Chạy một lần khi component mount

  // Xử lý khi chọn designer
  const handleDesignerChange = (value) => {
    setSelectedDesignerId(value);
  };

  // Xử lý khi thêm task mới
  const handleAddTask = () => {
    setAddTaskModal(true);
  };

  // Xử lý khi submit form thêm task
  const handleAddTaskSubmit = () => {
    form.validateFields().then((values) => {
      // Filter pending custom orders
      const pendingCustomOrders = designOrders.filter(
        (order) => order.isCustom === true && order.status === "ConsultingAndSketching"
      );

      if (pendingCustomOrders.length === 0) {
        message.warning(
          "Không có đơn hàng thiết kế tùy chỉnh nào đang chờ xử lý"
        );
        return;
      }

      const taskData = {
        serviceOrderId: pendingCustomOrders[0].id,
        userId: values.designerId,
        note: values.notes || "",
        status: "ConsultingAndSketching"
      };

      addTask(taskData)
        .then(() => {
          message.success("Đã thêm công việc mới");
          setAddTaskModal(false);
          form.resetFields();
          getAllTasks(); // Refresh tasks list
        })
        .catch((error) => {
          message.error("Không thể thêm công việc: " + error.message);
        });
    });
  };

  // Render header của calendar
  const headerRender = ({ value, type, onChange, onTypeChange }) => {
    return (
      <CalendarHeader
        value={value}
        onChange={onChange}
        onAddNew={handleAddTask}
        designers={designers}
        selectedDesigner={selectedDesignerId}
        onDesignerChange={handleDesignerChange}
        noIdeaOrders={noIdeaOrders}
        usingIdeaOrders={usingIdeaOrders}
      />
    );
  };

  // Render nội dung của mỗi ô ngày
  const dateCellRender = (value) => {
    // Lấy ngày hiện tại
    const currentDate = value.format("YYYY-MM-DD");

    // Lọc task theo ngày, thêm kiểm tra null/undefined
    const tasksForDate = (workTasks || []).filter(task => {
      if (!task || !task.creationDate) return false;
      const taskDate = dayjs(task.creationDate).format("YYYY-MM-DD");
      return taskDate === currentDate;
    });

    // Nhóm task theo designer
    const designerTasksMap = {};

    // Khởi tạo map với tất cả designer, thêm kiểm tra null/undefined
    (designers || []).forEach(designer => {
      if (!designer || !designer.id) return;
      designerTasksMap[designer.id] = {
        designer,
        tasks: [],
        taskCount: 0
      };
    });

    // Phân phối task cho designer
    tasksForDate.forEach(task => {
      if (task && task.userId && designerTasksMap[task.userId]) {
        designerTasksMap[task.userId].tasks.push(task);
        designerTasksMap[task.userId].taskCount++;
      }
    });

    // Lọc designer đang bận (có task và không phải DoneDesignDetail)
    const busyDesigners = Object.values(designerTasksMap).filter(designerData => {
      if (!designerData || !designerData.designer) return false;
      return designerData.taskCount > 0 &&
        designerData.tasks.some(task => task && task.status !== "DoneDesignDetail");
    });

    // Lọc theo designer được chọn
    let filteredBusyDesigners = busyDesigners;
    if (selectedDesignerId !== "all") {
      filteredBusyDesigners = busyDesigners.filter(
        designerData => designerData && designerData.designer && designerData.designer.id === selectedDesignerId
      );
    }

    // Nếu không có designer nào bận, trả về null
    if (filteredBusyDesigners.length === 0) {
      return null;
    }

    return (
      <div className="date-cell-content" style={{ overflowY: "auto" }}>
        {filteredBusyDesigners.map(designerData => (
          <Tooltip
            key={`busy-${designerData.designer.id}`}
            title={
              <div className="designer-tooltip">
                <div className="designer-tooltip-header">
                  <strong>{designerData.designer.name}</strong>
                  <Tag color="blue">Đang bận</Tag>
                </div>
                <div className="designer-tooltip-tasks">
                  {designerData.tasks.map((task) => (
                    <div key={task.id} className="task-item">
                      <div className="task-order">Đơn hàng #{task.serviceOrderId.slice(0, 8)}</div>
                      <Tag color={getStatusColor(task.status)}>
                        {getStatusText(task.status)}
                      </Tag>
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <div className="designer-task-item">
              {designerData.designer.avatarUrl ? (
                <Avatar
                  src={designerData.designer.avatarUrl}
                  size="small"
                  className="designer-avatar"
                />
              ) : (
                <Avatar
                  size="small"
                  className="designer-avatar"
                  style={{
                    backgroundColor: getRandomColorFromString(designerData.designer.email),
                    color: '#fff'
                  }}
                >
                  {getInitialFromEmail(designerData.designer.email)}
                </Avatar>
              )}
              <div className="designer-info">
                <span className="designer-name">{designerData.designer.name}</span>
                {/* <Badge
                  count={designerData.taskCount}
                  size="small"
                  className="task-badge"
                /> */}
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    );
  };

  // Hàm lấy màu cho trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case "DoneConsulting":
        return "green";
      case "ConsultingAndSket":
        return "blue";
      case "Design":
        return "purple";
      case "DoneDesign":
        return "green";
      case "DoneDesignDetail":
        return "success";
      default:
        return "default";
    }
  };

  // Hàm lấy text cho trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case "DoneConsulting":
        return "Đã hoàn thành tư vấn";
      case "ConsultingAndSket":
        return "Đang tư vấn & phác thảo";
      case "Design":
        return "Đang thiết kế";
      case "DoneDesign":
        return "Đã hoàn thành thiết kế";
      case "DoneDesignDetail":
        return "Đã hoàn thành thiết kế";
      default:
        return status;
    }
  };

  // Render phần chi tiết bên phải
  const renderSideDetail = () => {
    return (
      <DayDetail
        selectedDate={selectedDate}
        designers={designers}
        selectedDesignerId={selectedDesignerId}
        noIdeaOrders={noIdeaOrders}
        usingIdeaOrders={usingIdeaOrders}
      />
    );
  };

  return (
    <Row gutter={16} className="calendar-layout">
      <Col xs={24} lg={16}>
        <Card className="calendar-container">
          <AntCalendar
            dateCellRender={dateCellRender}
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <DayDetail
          selectedDate={selectedDate}
          designers={designers}
          selectedDesignerId={selectedDesignerId}
          noIdeaOrders={noIdeaOrders}
          usingIdeaOrders={usingIdeaOrders}
        />
      </Col>
    </Row>
  );
};

export default Calendar;
