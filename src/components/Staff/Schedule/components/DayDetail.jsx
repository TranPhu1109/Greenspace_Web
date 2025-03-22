import React, { useState } from "react";
import {
  Typography,
  List,
  Avatar,
  Space,
  Tag,
  Card,
  Button,
  Divider,
  Empty,
  Spin,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import useScheduleStore from "../../../../stores/useScheduleStore";

const { Title, Text } = Typography;

const DayDetail = ({ selectedDate, designers = [], selectedDesignerId }) => {
  const { getTasksByDate, getAvailableDesigners, isLoading, updateTask } =
    useScheduleStore();

  // Lấy ngày được chọn dưới dạng string
  const dateString = selectedDate.format("YYYY-MM-DD");

  // Lấy tasks trong ngày được chọn
  let tasksOnDate = getTasksByDate(dateString);

  // Lọc theo designer nếu có chọn
  if (selectedDesignerId !== "all") {
    tasksOnDate = tasksOnDate.filter(
      (task) => task.designerId == selectedDesignerId
    );
  }

  // Lấy danh sách designers đang rảnh
  const availableDesigners = getAvailableDesigners();

  // Xử lý cập nhật trạng thái task
  const handleStatusChange = async (designerId, taskId, newStatus) => {
    try {
      await updateTask(designerId, taskId, { task_status: newStatus });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

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

  // Lấy danh sách ID của designers có task trong ngày
  const designersWithTasksIds = Object.keys(tasksByDesigner);

  // Lấy danh sách designers không có task trong ngày
  const designersWithoutTasks = designers.filter(
    (designer) => !designersWithTasksIds.includes(designer.id.toString())
  );

  if (isLoading) {
    return (
      <Card
        className="side-detail-container"
        style={{ textAlign: "center", padding: "20px" }}
      >
        <Spin size="large" />
      </Card>
    );
  }

  return (
    <Card className="side-detail-container">
      <div className="day-header">
        <Title level={4}>{selectedDate.format("DD/MM/YYYY")}</Title>
      </div>

      {/* Phần designers không có task trong ngày */}
      <div className="available-designers-section">
        <Title level={5}>Designers không có task trong ngày</Title>
        {designersWithoutTasks.length > 0 ? (
          <List
            dataSource={designersWithoutTasks}
            renderItem={(designer) => (
              <List.Item
                actions={[
                  <Button
                    type="dashed"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      /* Xử lý thêm task */
                    }}
                  >
                    Thêm task
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    designer.avatar ? (
                      <Avatar src={designer.avatar} />
                    ) : (
                      <Avatar>{designer.email.charAt(0).toUpperCase()}</Avatar>
                    )
                  }
                  title={
                    <Space>
                      {designer.name}
                      {/* <Tag color={designer.status === 'đang rảnh' ? 'green' : 'blue'}>
                        {designer.status}
                      </Tag> */}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">{designer.email}</Text>
                      <Text type="secondary">{designer.phone}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Tất cả designers đều có task trong ngày này" />
        )}
      </div>

      <Divider />

      {/* Phần designers có task trong ngày */}
      <div className="busy-designers-section">
        <Title level={5}>Công việc trong ngày</Title>
        {Object.keys(tasksByDesigner).length > 0 ? (
          Object.values(tasksByDesigner).map(({ designer, tasks }) => (
            <Card
              key={designer.id}
              className="designer-tasks-card"
              size="small"
              title={
                <Space>
                  {designer.avatar ? (
                    <Avatar src={designer.avatar} />
                  ) : (
                    <Avatar>{designer.email.charAt(0).toUpperCase()}</Avatar>
                  )}
                  <span>{designer.name}</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <List
                dataSource={tasks}
                renderItem={(task) => (
                  <List.Item
                    actions={[
                      task.task_status !== "hoàn thành" && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() =>
                            handleStatusChange(
                              designer.id,
                              task.task_id,
                              "hoàn thành"
                            )
                          }
                        >
                          Hoàn thành
                        </Button>
                      ),
                    ]}
                  >
                    <List.Item.Meta
                      title={<span>{task.title}</span>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            Deadline:{" "}
                            {dayjs(task.deadline).format("DD/MM/YYYY")}
                            <Tag
                              style={{ marginLeft: 10 }}
                              color={getStatusColor(task.task_status)}
                            >
                              {capitalizeFirstLetter(task.task_status)}
                            </Tag>
                          </Text>
                          <Text type="secondary">
                            Khách hàng: {task.customer}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          ))
        ) : (
          <Empty description="Không có công việc nào trong ngày này" />
        )}
      </div>
    </Card>
  );
};

// Hàm helper để lấy màu cho trạng thái và viết hoa chữ cái đầu
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

// Hàm viết hoa chữ cái đầu
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default DayDetail;
