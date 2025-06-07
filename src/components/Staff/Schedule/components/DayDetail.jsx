import React, { useEffect, useState } from "react";
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
  message,
  Tabs,
  Tooltip,
  Modal,
  Form,
  Row,
  Col,
  Input,
} from "antd";
import AddTaskModal from "./AddTaskModal";
import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  CheckOutlined,
  DeleteOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import useScheduleStore from "../../../../stores/useScheduleStore";
import api from "../../../../api/api";
import useServiceOrderStore from '../../../../stores/useServiceOrderStore';

const { Title, Text } = Typography;
const { confirm } = Modal;
const { TextArea } = Input;

const DayDetail = ({ selectedDate, noIdeaOrders, usingIdeaOrders }) => {
  const { 
    isLoading, 
    designers, 
    workTasks, 
    getAllTasks, 
    fetchDesigners, 
    updateTask,
    updateTasksForDepositSuccessfulOrders 
  } = useScheduleStore();
  const { updateServiceOrderStatus } = useServiceOrderStore();
  console.log("designers", designers);
  
  
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  //console.log("selectedDesigner", selectedDesigner);
  
  const [availableDesigners, setAvailableDesigners] = useState([]);
  //console.log("availableDesigners", availableDesigners);
  
  const [busyDesigners, setBusyDesigners] = useState([]);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [isUpdatingTasks, setIsUpdatingTasks] = useState(false);

  useEffect(() => {
    fetchDesigners();
    getAllTasks();
    // Tự động kiểm tra và cập nhật task cho đơn hàng có trạng thái DepositSuccessful
    checkAndUpdateDepositSuccessfulTasks();
  }, [selectedDate]);

  // Hàm kiểm tra và cập nhật task cho đơn hàng có trạng thái DepositSuccessful
  const checkAndUpdateDepositSuccessfulTasks = async () => {
    try {
      setIsUpdatingTasks(true);
      const result = await updateTasksForDepositSuccessfulOrders();
      if (result.error) {
        console.error("Lỗi khi cập nhật task:", result.error);
      } else if (result.updatedTasks && result.updatedTasks.length > 0) {
        message.success(result.message);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra và cập nhật task:", error);
    } finally {
      setIsUpdatingTasks(false);
    }
  };

  useEffect(() => {
    if (designers && workTasks) {
      // Group tasks by designer
      const designerTasksMap = {};
      
      // Initialize map with all designers
      designers.forEach(designer => {
        designerTasksMap[designer.id] = {
          designer,
          tasks: [],
          taskCount: 0,
          consultingTasks: [],
          designTasks: [],
          completedTasks: []
        };
      });
      
      // Distribute tasks to designers
      workTasks.forEach(task => {
        if (designerTasksMap[task.userId]) {
          designerTasksMap[task.userId].tasks.push(task);
          designerTasksMap[task.userId].taskCount++;
          
          // Categorize tasks by status
          if (task.status === 'ConsultingAndSket') {
            designerTasksMap[task.userId].consultingTasks.push(task);
          } else if (task.status === 'DoneConsulting') {
            designerTasksMap[task.userId].completedTasks.push(task);
          } else if (task.status === 'Design') {
            designerTasksMap[task.userId].designTasks.push(task);
          }
        }
      });
      
      // Separate available and busy designers
      const available = [];
      const busy = [];
      
      // Log the designerTasksMap to debug
      console.log("Designer tasks map:", designerTasksMap);
      
      Object.values(designerTasksMap).forEach(designerData => {
        // Check if designer has any active tasks (not completed)
        const hasActiveTasks = designerData.tasks.some(task => 
          task.status !== 'DoneConsulting' && task.status !== 'DoneDesignDetail'
        );
        
        if (!hasActiveTasks) {
          available.push(designerData.designer);
        } else {
          busy.push({
            ...designerData.designer,
            tasks: designerData.tasks,
            taskCount: designerData.taskCount,
            consultingTasks: designerData.consultingTasks,
            designTasks: designerData.designTasks,
            completedTasks: designerData.completedTasks
          });
        }
      });
      console.log("Available designers:", available);
      console.log("Busy designers:", busy);
      setAvailableDesigners(available);
      setBusyDesigners(busy);
    }
  }, [designers, workTasks]);

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DoneConsulting":
        return "green";
      case "ConsultingAndSket":
        return "blue";
      case "Design":
        return "purple";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "DoneConsulting":
        return "Đã hoàn thành tư vấn";
      case "ConsultingAndSket":
        return "Đang tư vấn & phác thảo";
      case "Design":
        return "Đang thiết kế";
      default:
        return status;
    }
  };

  // Add function to handle task deletion
  const handleDeleteTask = async (taskId, serviceOrderId) => {
    try {
      setDeletingTaskId(taskId);
      
      // Call API to delete task
      await api.delete(`/api/worktask/${taskId}`);
      
      // Update order status to 0 (Pending)
      await api.put(`/api/serviceorder/status/${serviceOrderId}`, { status: 0 });
      
      message.success("Đã xóa task và cập nhật trạng thái đơn hàng");
      
      // Refresh tasks
      await getAllTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      message.error("Không thể xóa task: " + (error.response?.data?.message || error.message));
    } finally {
      setDeletingTaskId(null);
    }
  };

  // Add function to show confirmation modal before deleting
  const showDeleteConfirm = (taskId, serviceOrderId) => {
    confirm({
      title: "Xác nhận xóa task",
      content: "Bạn có chắc chắn muốn xóa task này? Hành động này sẽ cập nhật trạng thái đơn hàng về 'Chờ xác nhận'.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        handleDeleteTask(taskId, serviceOrderId);
      },
    });
  };

  // Update the task rendering in all tabs to include delete button
  const renderTaskItem = (task) => (
    <List.Item
      actions={[
        <Tooltip title="Xem chi tiết">
          <Button type="link" icon={<EditOutlined />} />
        </Tooltip>,
        <Tooltip title="Xóa task">
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            loading={deletingTaskId === task.id}
            onClick={() => showDeleteConfirm(task.id, task.serviceOrderId)}
          />
        </Tooltip>
      ]}
    >
      <List.Item.Meta
        title={
          <Space>
            <Text strong>Đơn hàng #{task.serviceOrderId.slice(0, 8)}</Text>
            <Tag color={getStatusColor(task.status)}>{getStatusText(task.status)}</Tag>
          </Space>
        }
        description={
          <Space direction="vertical" size={0}>
            <Text type="secondary">Ghi chú: {task.note || "Không có"}</Text>
            <Text type="secondary">Tạo: {formatDate(task.creationDate)}</Text>
            {task.modificationDate && (
              <Text type="secondary">Cập nhật: {formatDate(task.modificationDate)}</Text>
            )}
          </Space>
        }
      />
    </List.Item>
  );

  if (isLoading) {
    return (
      <Card className="side-detail-container" style={{ textAlign: "center", padding: "20px" }}>
        <Spin size="large" />
      </Card>
    );
  }

  return (
    <Card className="day-detail">
      <div className="day-header">
        <Title level={4}>{selectedDate.format("DD/MM/YYYY")}</Title>
        <Button 
          type="primary" 
          icon={<SyncOutlined />} 
          onClick={checkAndUpdateDepositSuccessfulTasks}
          loading={isUpdatingTasks}
          style={{ marginLeft: 'auto' }}
        >
          Cập nhật task đã thanh toán
        </Button>
      </div>

      {/* Phần designers đang rảnh */}
      <div className="designers-section">
        <Title level={5} className="section-title">
          <CheckCircleOutlined className="status-icon available" />
          Designers đang rảnh ({availableDesigners.length})
        </Title>
        {availableDesigners.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={availableDesigners}
            renderItem={(designer) => (
              <List.Item>
                <Card className="designer-item">
                  <div className="designer-info-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Space>
                      <Avatar
                        className="designer-avatar"
                        src={designer.avatarUrl}
                        icon={!designer.avatarUrl && <UserOutlined />}
                      />
                      <div>
                        <Text strong className="designer-name">{designer.name}</Text>
                        <Text type="secondary" style={{ display: 'block' }}>{designer.email}</Text>
                      </div>
                    </Space>
                    <Button 
                      type="primary" 
                      disabled={isLoading}
                      onClick={() => {
                        if (isLoading) return;
                        console.log('Opening AddTaskModal (Available Designer) - Props passed:', { noIdeaOrders, usingIdeaOrders });
                        setSelectedDesigner(designer);
                        setIsAddTaskModalVisible(true);
                      }}
                    >
                      {isLoading ? 'Đang tải...' : 'Thêm task'}
                    </Button>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Không có designer nào đang rảnh" />
        )}
      </div>

      <Divider />

      {/* Phần designers đang bận */}
      <div className="designers-section">
        <Title level={5} className="section-title">
          <ClockCircleOutlined className="status-icon busy" />
          Designers đang bận ({busyDesigners.length})
        </Title>
        {busyDesigners.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={busyDesigners}
            renderItem={(designer) => (
              <List.Item>
                <Card className="designer-item">
                  <div className="designer-info-section">
                    <Space>
                      <Avatar
                        className="designer-avatar"
                        src={designer.avatarUrl}
                        icon={!designer.avatarUrl && <UserOutlined />}
                      />
                      <div>
                        <Text strong className="designer-name">{designer.name}</Text>
                        <Text type="secondary" style={{ display: 'block' }}>{designer.email}</Text>
                        <div className="designer-tags">
                          <Tag color="blue">Đang xử lý {designer.taskCount} công việc</Tag>
                          <Button 
                            type="primary" 
                            disabled={isLoading}
                            onClick={() => {
                              if (isLoading) return;
                              console.log('Opening AddTaskModal (Busy Designer) - Props passed:', { noIdeaOrders, usingIdeaOrders });
                              setSelectedDesigner(designer);
                              setIsAddTaskModalVisible(true);
                            }}
                          >
                            {isLoading ? 'Đang tải...' : 'Thêm task'}
                          </Button>
                        </div>
                      </div>
                    </Space>
                  </div>
                  <div className="tasks-section">
                    <Tabs
                      defaultActiveKey="all"
                      items={[
                        {
                          key: "all",
                          label: `Tất cả (${designer.tasks.length})`,
                          children: (
                            <List
                              dataSource={designer.tasks}
                              renderItem={renderTaskItem}
                            />
                          )
                        },
                        {
                          key: "consulting",
                          label: `Đang tư vấn (${designer.consultingTasks.length})`,
                          children: (
                            <List
                              dataSource={designer.consultingTasks}
                              renderItem={renderTaskItem}
                            />
                          )
                        },
                        {
                          key: "design",
                          label: `Đang thiết kế (${designer.designTasks.length})`,
                          children: (
                            <List
                              dataSource={designer.designTasks}
                              renderItem={renderTaskItem}
                            />
                          )
                        },
                        {
                          key: "completed",
                          label: `Hoàn thành (${designer.completedTasks.length})`,
                          children: (
                            <List
                              dataSource={designer.completedTasks}
                              renderItem={renderTaskItem}
                            />
                          )
                        }
                      ]}
                    />
                  </div>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Không có designer nào đang bận" />
        )}
      </div>
      <AddTaskModal
        open={isAddTaskModalVisible}
        onCancel={() => setIsAddTaskModalVisible(false)}
        onSuccess={() => {
          setIsAddTaskModalVisible(false);
          getAllTasks();
        }}
        designers={[selectedDesigner].filter(Boolean)}
        noIdeaOrders={noIdeaOrders}
        usingIdeaOrders={usingIdeaOrders}
        isLoading={isLoading}
      />
    </Card>
  );
};

export default DayDetail;
