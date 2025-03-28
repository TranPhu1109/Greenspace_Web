import React, { useState, useEffect } from "react";
import {
  Calendar as AntCalendar,
  Badge,
  Tooltip,
  Row,
  Col,
  Card,
  Select,
  Button,
  Tag,
  Avatar,
  Modal,
  Form,
  Input,
  DatePicker,
  Space,
  message,
  Empty,
} from "antd";
import {
  PlusOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
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
  const { getAllActiveTasks, getTasksByDate, isLoading, addTask } =
    useScheduleStore();
  const { designOrders } = useDesignOrderStore();

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
        (order) => order.isCustom === true && order.status === "Pending"
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
      };

      addTask(taskData)
        .then(() => {
          message.success("Đã thêm công việc mới");
          setAddTaskModal(false);
          form.resetFields();
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
      />
    );
  };

  // Render nội dung của mỗi ô ngày
  const dateCellRender = (value) => {
    // Lấy tất cả tasks trong ngày này
    const dateString = value.format("YYYY-MM-DD");
    let tasksOnDate = getTasksByDate(dateString);

    // Lọc theo designer nếu có chọn
    if (selectedDesignerId !== "all") {
      tasksOnDate = tasksOnDate.filter(
        (task) => task.designerId == selectedDesignerId
      );
    }

    if (tasksOnDate.length === 0) {
      return null;
    }

    // Nhóm tasks theo designer
    const tasksByDesigner = tasksOnDate.reduce((acc, task) => {
      if (!acc[task.designerId]) {
        acc[task.designerId] = {
          designer: {
            id: task.designerId,
            name: task.designerName,
            avatar: task.designerAvatar,
            email: task.designerEmail,
          },
          tasks: [],
        };
      }
      acc[task.designerId].tasks.push(task);
      return acc;
    }, {});

    return (
      <div className="date-cell-content">
        {Object.values(tasksByDesigner).map(({ designer, tasks }) => (
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
      />
    );
  };

  return (
    <>
      <Row gutter={16} className="calendar-layout">
        <Col xs={24} lg={16}>
          <Card className="calendar-container">
            <AntCalendar
              headerRender={headerRender}
              dateCellRender={dateCellRender}
              mode="month"
              value={selectedDate}
              onChange={setSelectedDate}
              className="custom-calendar"
              fullscreen={true}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          {renderSideDetail()}
        </Col>
      </Row>

      <AddTaskModal
        open={addTaskModal}
        title="Thêm công việc mới"
        visible={addTaskModal}
        onCancel={() => setAddTaskModal(false)}
        onOk={handleAddTaskSubmit}
        form={form}
        designers={designers}
        selectedDesignerId={selectedDesignerId}
      />
    </>
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
