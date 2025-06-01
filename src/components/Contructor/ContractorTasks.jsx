import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Tag,
  Space,
  Button,
  Modal,
  Descriptions,
  Spin,
  Alert,
  Empty,
  Tabs,
  Badge,
  Avatar,
  message,
  notification
} from 'antd';
import {
  ClockCircleOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CopyOutlined,
  ToolOutlined
} from '@ant-design/icons';
import api from '@/api/api';
import dayjs from 'dayjs';
import useAuthStore from '@/stores/useAuthStore';
import './ContractorTasks.scss';
import { useNavigate } from 'react-router-dom';
import signalRService from '@/services/signalRService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ContractorTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const { user } = useAuthStore();
  const userId = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchContractorTasks();
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
  
    // Kết nối SignalR
    const initSignalR = async () => {
      try {
        const connection = await signalRService.startConnection();
  
        // Đăng ký listener khi có task cập nhật
        signalRService.on("messageReceived", async () => {
          await fetchContractorTasks();
        });
  
      } catch (err) {
        console.error("Không thể kết nối SignalR", err);
      }
    };
  
    initSignalR();
  
    return () => {
      signalRService.off("messageReceived");
      signalRService.stopConnection();
    };
  }, [userId]);
  

  const fetchContractorTasks = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/worktask/${userId}/users`);

      if (response.status === 200) {
        setTasks(response.data || []);
      } else {
        setError('Không thể tải danh sách công việc');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Đã xảy ra lỗi khi tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  const goToTaskDetail = (taskId) => {
    navigate(`/contructor/tasks/${taskId}`);
  };

  const closeDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedTask(null);
  };

  const updateTaskStatus = async (taskId, taskStatus, orderStatus) => {
    try {
      setLoading(true);

      // Get task details to maintain existing values
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) {
        message.error('Không tìm thấy thông tin công việc');
        setLoading(false);
        return;
      }

      // Update task status
      const taskResponse = await api.put(`/api/worktask/${taskId}`, {
        serviceOrderId: taskToUpdate.serviceOrderId,
        userId: taskToUpdate.userId,
        dateAppointment: taskToUpdate.dateAppointment,
        timeAppointment: taskToUpdate.timeAppointment,
        status: taskStatus,
        note: taskToUpdate.note
      });

      // Update order status if orderStatus is provided
      if (orderStatus && taskToUpdate.serviceOrderId) {
        const orderResponse = await api.put(`/api/serviceorder/status/${taskToUpdate.serviceOrderId}`, {
          status: orderStatus,
          reportManger: "",
          reportAccoutant: ""
        });

        if (orderResponse.status !== 200) {
          throw new Error('Không thể cập nhật trạng thái đơn hàng');
        }
      }

      if (taskResponse.status === 200) {
        message.success('Cập nhật trạng thái công việc thành công');
        // Refresh tasks
        await fetchContractorTasks();
      } else {
        message.error('Không thể cập nhật trạng thái công việc');
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      message.error('Đã xảy ra lỗi khi cập nhật trạng thái công việc');
    } finally {
      setLoading(false);
    }
  };

  const isCurrentTimeMatchTaskTime = (task) => {
    if (!task.dateAppointment || !task.timeAppointment) return false;
  
    const taskDateTime = dayjs(`${task.dateAppointment} ${task.timeAppointment}`);
    const now = dayjs();
  
    return now.isBefore(taskDateTime.add(30, 'minute'));
  };  

  const handleStartInstallation = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      notification.error({
        message: 'Lỗi',
        description: 'Không tìm thấy công việc',
        placement: 'topRight',
      });
      return;
    }
  
    if (!isCurrentTimeMatchTaskTime(task)) {
      notification.warning({
        message: 'Chưa đến thời gian lắp đặt',
        description: `Chỉ được phép bắt đầu lắp đặt từ ${dayjs(`${task.dateAppointment} ${task.timeAppointment}`).format('HH:mm')} ngày ${dayjs(task.dateAppointment).format('DD/MM/YYYY')}`,
        placement: 'topRight',
        duration: 5
      });
      return;
    }

    Modal.confirm({
      title: 'Xác nhận bắt đầu lắp đặt',
      content: 'Bạn đã đến nơi và sẵn sàng bắt đầu lắp đặt cho khách hàng?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => updateTaskStatus(taskId, 8, 27) // 8 = Installing for task, 27 = Installing for order
    });
  };

  const handleCompleteInstallation = async (taskId) => {
    Modal.confirm({
      title: 'Xác nhận hoàn thành lắp đặt',
      content: 'Bạn đã hoàn thành việc lắp đặt cho khách hàng?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => updateTaskStatus(taskId, 9, 28) // 9 = DoneInstalling for task, 28 = DoneInstalling for order
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'orange';
      case 'Installing':
        return 'blue';
      case 'DoneInstalling':
        return 'green';
      case 'ReInstall':
        return 'red';
      case 'Completed':
        return 'green';
      case 'cancel':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending':
        return 'Đang chờ';
      case 'Installing':
        return 'Đang lắp đặt';
      case 'DoneInstalling':
        return 'Đã lắp đặt xong';
      case 'ReInstall':
        return 'Yêu cầu lắp đặt lại';
      case 'Completed':
        return 'Đã hoàn thành';
      case 'cancel':
        return 'Giao hàng thất bại';
      default:
        return status;
    }
  };

  const filteredTasks = activeTab === 'all'
    ? tasks
    : tasks.filter(task => {
      if (activeTab === 'upcoming') {
        return task.status === 'Pending' || task.status === 'Installing' || task.status === 8;
      } else if (activeTab === 'completed') {
        return task.status === 'DoneInstalling' || task.status === 'Completed';
      } else if (activeTab === 'reinstall') {
        return task.status === 'ReInstall';
      }
      return true;
    });

  const columns = [
    {
      title: 'Mã công việc',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text strong copyable={{ text: text }}>#{text.slice(0, 8)}</Text>,
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'serviceOrderId',
      key: 'serviceOrderId',
      render: (text) => <Text strong copyable={{ text: text }}>#{text.slice(0, 8)}</Text>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <span>
          {record.serviceOrder?.userName || 'Không có thông tin'}
        </span>
      ),
    },
    {
      title: 'Ngày giao hàng',
      dataIndex: 'dateAppointment',
      key: 'dateAppointment',
      render: (text) => (
        <span>
          <CalendarOutlined style={{ marginRight: 8 }} />
          {text ? dayjs(text).format('DD/MM/YYYY') : 'Chưa có lịch'}
        </span>
      ),
    },
    {
      title: 'Giờ giao hàng',
      dataIndex: 'timeAppointment',
      key: 'timeAppointment',
      render: (text) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {text || 'Chưa có lịch'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => goToTaskDetail(record.id)}>
            Xem chi tiết
          </Button>

          {(record.status === 'Pending') && (
            <Button
              type="primary"
              icon={<ToolOutlined />}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
              onClick={() => handleStartInstallation(record.id)}
            >
              Bắt đầu lắp đặt
            </Button>
          )}

          {(record.status === 'Installing' || record.status === 8) && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              onClick={() => handleCompleteInstallation(record.id)}
            >
              Hoàn thành lắp đặt
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="contractor-tasks-container">
      <Card className="tasks-card">
        <Title level={3}>Quản lý công việc</Title>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                {/* <Badge count={tasks.length} offset={[10, 0]}> */}
                <span>Tất cả</span>
                {/* </Badge> */}
              </span>
            }
            key="all"
          />
          <TabPane
            tab={
              <span>
                <Badge
                  count={tasks.filter(task => task.status === 'Installing').length}
                  offset={[10, 0]}
                >
                  <span>Đang thực hiện</span>
                </Badge>
              </span>
            }
            key="upcoming"
          />
          <TabPane
            tab={
              <span>
                <Badge
                  count={tasks.filter(task => task.status === 'DoneInstalling' || task.status === 'Completed').length}
                  offset={[10, 0]}
                  style={{ backgroundColor: '#52c41a' }}
                >
                  <span>Đã hoàn thành</span>
                </Badge>
              </span>
            }
            key="completed"
          />
          <TabPane
            tab={
              <span>
                <Badge
                  count={tasks.filter(task => task.status === 'ReInstall').length}
                  offset={[10, 0]}
                  style={{ backgroundColor: '#f5222d' }}
                >
                  <span>Yêu cầu lắp đặt lại</span>
                </Badge>
              </span>
            }
            key="reinstall"
          />
        </Tabs>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <Text>Đang tải dữ liệu...</Text>
          </div>
        ) : filteredTasks.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredTasks}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} công việc`
            }}
          />
        ) : (
          <Empty
            description="Không có công việc nào"
            style={{ margin: '40px 0' }}
          />
        )}
      </Card>

      <Modal
        title="Chi tiết công việc"
        open={isDetailModalVisible}
        onCancel={closeDetailModal}
        footer={[
          <Button key="close" onClick={closeDetailModal}>
            Đóng
          </Button>,
          <Button key="view-full" type="primary" onClick={() => selectedTask && goToTaskDetail(selectedTask.id)}>
            Xem trang chi tiết
          </Button>,
          selectedTask && selectedTask.status === 'Pending' && (
            <Button
              key="start-install"
              type="primary"
              icon={<ToolOutlined />}
              onClick={() => {
                handleStartInstallation(selectedTask.id);
                closeDetailModal();
              }}
            >
              Bắt đầu lắp đặt
            </Button>
          ),
          selectedTask && (selectedTask.status === 'Installing' || selectedTask.status === 8) && (
            <Button
              key="complete-install"
              type="primary"
              icon={<CheckOutlined />}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              onClick={() => {
                handleCompleteInstallation(selectedTask.id);
                closeDetailModal();
              }}
            >
              Hoàn thành lắp đặt
            </Button>
          )
        ]}
        width={700}
      >
        {selectedTask ? (
          <div className="order-detail-container">
            <div className="order-info-section">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Mã đơn hàng" span={2}>
                  #{selectedTask.serviceOrderId}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày giao hàng">
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  {selectedTask.dateAppointment ? dayjs(selectedTask.dateAppointment).format('DD/MM/YYYY') : 'Chưa có lịch'}
                </Descriptions.Item>

                <Descriptions.Item label="Giờ giao hàng">
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  {selectedTask.timeAppointment || 'Chưa có lịch'}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedTask.status)}>
                    {getStatusText(selectedTask.status)}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Ghi chú">
                  {selectedTask.note || 'Không có ghi chú'}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="customer-info-section">
              <Title level={5}>Thông tin khách hàng</Title>
              {selectedTask.serviceOrder ? (
                <div className="customer-card">
                  <div className="customer-header">
                    <Avatar size={64} icon={<UserOutlined />} />
                    <div className="customer-name">
                      <Text strong>{selectedTask.serviceOrder.userName || 'Không có thông tin'}</Text>
                    </div>
                  </div>
                  <Descriptions column={1}>
                    <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                      {selectedTask.serviceOrder.cusPhone || 'Không có thông tin'}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><MailOutlined /> Email</>}>
                      {selectedTask.serviceOrder.email || 'Không có thông tin'}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><HomeOutlined /> Địa chỉ</>}>
                      {selectedTask.serviceOrder.address
                        ? selectedTask.serviceOrder.address.replace(/\|/g, ', ')
                        : 'Không có thông tin'}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ) : (
                <Empty description="Không có thông tin khách hàng" />
              )}
            </div>

            <div className="products-section">
              <Title level={5}>Danh sách sản phẩm</Title>
              {selectedTask.serviceOrder && selectedTask.serviceOrder.serviceOrderDetails &&
                selectedTask.serviceOrder.serviceOrderDetails.length > 0 ? (
                <Table
                  dataSource={selectedTask.serviceOrder.serviceOrderDetails}
                  rowKey="productId"
                  pagination={false}
                  columns={[
                    {
                      title: 'Mã sản phẩm',
                      dataIndex: 'productId',
                      key: 'productId',
                      render: (text) => <span>#{text}</span>,
                    },
                    {
                      title: 'Số lượng',
                      dataIndex: 'quantity',
                      key: 'quantity',
                    },
                    {
                      title: 'Giá',
                      dataIndex: 'price',
                      key: 'price',
                      render: (price) => <span>{price.toLocaleString()} đ</span>,
                    },
                    {
                      title: 'Thành tiền',
                      dataIndex: 'totalPrice',
                      key: 'totalPrice',
                      render: (totalPrice) => <span>{totalPrice.toLocaleString()} đ</span>,
                    },
                  ]}
                />
              ) : (
                <Empty description="Không có sản phẩm" />
              )}
            </div>

            {selectedTask.serviceOrder && selectedTask.serviceOrder.externalProducts &&
              selectedTask.serviceOrder.externalProducts.length > 0 && (
                <div className="external-products-section">
                  <Title level={5}>Sản phẩm bổ sung</Title>
                  <Table
                    dataSource={selectedTask.serviceOrder.externalProducts}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      {
                        title: 'Tên sản phẩm',
                        dataIndex: 'name',
                        key: 'name',
                      },
                      {
                        title: 'Số lượng',
                        dataIndex: 'quantity',
                        key: 'quantity',
                      },
                      {
                        title: 'Giá',
                        dataIndex: 'price',
                        key: 'price',
                        render: (price) => <span>{price.toLocaleString()} đ</span>,
                      },
                      {
                        title: 'Thành tiền',
                        dataIndex: 'totalPrice',
                        key: 'totalPrice',
                        render: (totalPrice) => <span>{totalPrice.toLocaleString()} đ</span>,
                      },
                    ]}
                  />
                </div>
              )}
          </div>
        ) : (
          <div className="loading-container">
            <Spin size="large" />
            <Text>Đang tải dữ liệu...</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContractorTasks; 