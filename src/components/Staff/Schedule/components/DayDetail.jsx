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
} from "antd";
import AddTaskModal from "./AddTaskModal";
import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import useScheduleStore from "../../../../stores/useScheduleStore";

const { Title, Text } = Typography;

const DayDetail = ({ selectedDate, noIdeaOrders, usingIdeaOrders }) => {
  const { isLoading, designers, workTasks, getAllTasks, fetchDesigners, updateTask } = useScheduleStore();
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [availableDesigners, setAvailableDesigners] = useState([]);
  const [busyDesigners, setBusyDesigners] = useState([]);

  useEffect(() => {
    fetchDesigners();
    getAllTasks();
  }, []);

  useEffect(() => {
    if (designers && workTasks) {
      const busyIds = new Set(workTasks.map(task => task.userId));
      
      const busy = designers.filter(designer => 
        workTasks.some(task => task.userId === designer.id)
      );
      const available = designers.filter(designer => 
        !workTasks.some(task => task.userId === designer.id)
      );
      
      setBusyDesigners(busy.map(designer => ({
        ...designer,
        tasks: workTasks
          .filter(task => task.userId === designer.id)
          .sort((a, b) => dayjs(a.creationDate) - dayjs(b.creationDate)),
        taskCount: workTasks.filter(task => task.userId === designer.id).length,
        consultingTasks: workTasks.filter(task => task.userId === designer.id && task.status === 'ConsultingAndSket'),
        designingTasks: workTasks.filter(task => task.userId === designer.id && task.status === 'Designing'),
        completedTasks: workTasks.filter(task => task.userId === designer.id && task.status === 'Completed')
      })));
      
      setAvailableDesigners(available);
    }
  }, [designers, workTasks]);
 
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      message.success("Đã cập nhật trạng thái công việc");
      getAllTasks();
    } catch (error) {
      message.error("Không thể cập nhật trạng thái: " + error.message);
    }
  };

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
                      onClick={() => {
                        setSelectedDesigner(designer);
                        setIsAddTaskModalVisible(true);
                      }}
                    >
                      Thêm task
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
                            onClick={() => {
                              setSelectedDesigner(designer);
                              setIsAddTaskModalVisible(true);
                            }}
                          >
                            Thêm task
                          </Button>
                        </div>
                      </div>
                    </Space>
                  </div>
                  <div className="tasks-section">
                    <Tabs defaultActiveKey="all">
                      <Tabs.TabPane tab={`Tất cả (${designer.tasks.length})`} key="all">
                        <List
                          dataSource={designer.tasks}
                          renderItem={(task) => (
                            <List.Item>
                              <div>{task.title}</div>
                            </List.Item>
                          )}
                        />
                      </Tabs.TabPane>
                      <Tabs.TabPane tab={`Đang tư vấn (${designer.consultingTasks.length})`} key="consulting">
                        <List
                          dataSource={designer.consultingTasks}
                          renderItem={(task) => (
                            <List.Item>
                              <div>{task.title}</div>
                            </List.Item>
                          )}
                        />
                      </Tabs.TabPane>
                      <Tabs.TabPane tab={`Đang thiết kế (${designer.designingTasks.length})`} key="designing">
                        <List
                          dataSource={designer.designingTasks}
                          renderItem={(task) => (
                            <List.Item>
                              <div>{task.title}</div>
                            </List.Item>
                          )}
                        />
                      </Tabs.TabPane>
                      <Tabs.TabPane tab={`Hoàn thành (${designer.completedTasks.length})`} key="completed">
                        <List
                          dataSource={designer.completedTasks}
                          renderItem={(task) => (
                            <List.Item>
                              <div>{task.title}</div>
                              <span>Đã hoàn thành</span>
                            </List.Item>
                          )}
                        />
                      </Tabs.TabPane>
                    </Tabs>
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
      />
    </Card>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "green";
    case "ConsultingAndSket":
      return "blue";
    case "DoneDesignDetail":
      return "purple";
    default:
      return "default";
  }
};

export default DayDetail;
