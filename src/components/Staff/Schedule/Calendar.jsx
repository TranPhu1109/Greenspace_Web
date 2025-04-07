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
} from "antd";
import dayjs from "dayjs";
import CalendarHeader from "./components/CalendarHeader";
import DayDetail from "./components/DayDetail";
import AddTaskModal from "./components/AddTaskModal";
import useScheduleStore from "../../../stores/useScheduleStore";
import "./Calendar.scss";
import useDesignOrderStore from "@/stores/useDesignOrderStore";

const { Option } = Select;

const Calendar = ({ designers = [], onAddNew }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDesignerId, setSelectedDesignerId] = useState("all");
  const [addTaskModal, setAddTaskModal] = useState(false);
  const [form] = Form.useForm();

  // Lấy dữ liệu từ store
  const { 
    getAllTasks, 
    isLoading, 
    addTask, 
    workTasks, 
    updateTask, 
    tasksByDate,
    fetchNoIdeaOrders,
    fetchUsingIdeaOrders,
    noIdeaOrders,
    usingIdeaOrders 
  } = useScheduleStore();
  const { designOrders } = useDesignOrderStore();

  // Fetch tasks và orders khi component mount
  useEffect(() => {
    getAllTasks();
    fetchNoIdeaOrders();
    fetchUsingIdeaOrders();
  }, []);

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
    // Kiểm tra nếu tasksByDate chưa được khởi tạo
    if (!tasksByDate) {
      return null;
    }

    // Lấy tất cả tasks trong ngày này
    const dateString = value.format("YYYY-MM-DD");
    const tasksByDesigner = tasksByDate[dateString] || {};

    // Lấy danh sách designers đang rảnh
    const availableDesigners = designers.filter(designer => 
      !Object.keys(tasksByDesigner).includes(designer.id)
    );

    // Nếu không có dữ liệu hoặc không có designer nào có task
    if (Object.keys(tasksByDesigner).length === 0 && availableDesigners.length === 0) {
      return null;
    }

    // Lọc theo designer nếu có chọn
    let filteredTasksByDesigner = tasksByDesigner;
    let filteredAvailableDesigners = availableDesigners;
    if (selectedDesignerId !== "all") {
      filteredTasksByDesigner = Object.fromEntries(
        Object.entries(tasksByDesigner).filter(
          ([designerId]) => designerId === selectedDesignerId
        )
      );
      filteredAvailableDesigners = availableDesigners.filter(
        designer => designer.id === selectedDesignerId
      );
    }

    if (Object.keys(filteredTasksByDesigner).length === 0 && filteredAvailableDesigners.length === 0) {
      return null;
    }

    // Xử lý cập nhật trạng thái task
    const handleStatusChange = async (taskId, newStatus) => {
      try {
        await updateTask(taskId, { status: newStatus });
        message.success("Đã cập nhật trạng thái công việc");
        getAllActiveTasks(); // Refresh tasks list
      } catch (error) {
        message.error("Không thể cập nhật trạng thái: " + error.message);
      }
    };

    return (
      <div className="date-cell-content">
        {Object.values(filteredTasksByDesigner).map(({ designer, tasks }) => (
          <Tooltip
            key={designer.id}
            title={
              <div>
                <div>
                  <strong>{designer.name}</strong>
                </div>
                <ul className="tooltip-tasks">
                  {tasks.map((task) => (
                    <li key={task.task_id}>
                      {task.title} - {task.customer}
                      <Tag
                        color={getStatusColor(task.task_status)}
                        style={{ marginLeft: 4 }}
                      >
                        {capitalizeFirstLetter(task.task_status)}
                      </Tag>
                    </li>
                  ))}
                </ul>
              </div>
            }
          >
            <div className="designer-task-item">
              {designer.avatar ? (
                <Avatar src={designer.avatar} size="small" />
              ) : (
                <Avatar size="small">
                  {designer.email.charAt(0).toUpperCase()}
                </Avatar>
              )}
              <Tag
                className="designer-name"
                color={getStatusColor(tasks.task_status)}
              >
                {designer.name}
              </Tag>
              {/* <Badge count={tasks.length} size="small" /> */}
            </div>
          </Tooltip>
        ))}
        
        {filteredAvailableDesigners.map(designer => (
          <Tooltip
            key={designer.id}
            title={
              <div>
                <strong>{designer.name}</strong>
                <div>Đang rảnh</div>
              </div>
            }
          >
            <div className="designer-task-item">
              {designer.avatar ? (
                <Avatar src={designer.avatar} size="small" />
              ) : (
                <Avatar size="small">
                  {designer.email.charAt(0).toUpperCase()}
                </Avatar>
              )}
              <Tag
                className="designer-name"
                color="green"
              >
                {designer.name}
              </Tag>
              <Tag color="green">Rảnh</Tag>
            </div>
          </Tooltip>
        ))}
      </div>
    );
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

// Hàm helper để lấy màu cho trạng thái
const getStatusColor = (status) => {
  switch (status) {
    case "hoàn thành":
      return "green";
    case "thiết kế":
      return "blue";
    case "tư vấn":
      return "orange";
    default:
      return "default";
  }
};

// Thêm hàm capitalizeFirstLetter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default Calendar;
