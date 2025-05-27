import React, { useState, useEffect } from 'react';
import { Layout, Card, Select, Spin, Typography, Row, Col, Button, Space, Empty, Tag, Tooltip, Tabs, message, Alert, Avatar, List, Drawer, Descriptions, Calendar } from 'antd';
import { PlusOutlined, SyncOutlined, CalendarOutlined, UnorderedListOutlined, UserOutlined, InfoCircleOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import useScheduleStore from '@/stores/useScheduleStore';
import DesignerCalendarView from './components/DesignerCalendarView';
import DesignerTasksList from './components/DesignerTasksList';
import AddDesignerTaskModal from './components/AddDesignerTaskModal';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/es/date-picker/locale/vi_VN';
import './DesignerScheduleManager.scss';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DesignerScheduleManager = () => {
  const location = useLocation();
  const { state } = location;
  
  // Extract order information from navigation state if available
  const serviceOrderFromNav = state?.serviceOrderId;
  const customerNameFromNav = state?.customerName;
  const addressFromNav = state?.address;
  const autoOpenModal = state?.autoOpenModal;

  const [selectedDesignerId, setSelectedDesignerId] = useState(null);
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [activeView, setActiveView] = useState('calendar'); // 'calendar' or 'list'
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewingDesigner, setViewingDesigner] = useState(null);
  const [allDesignerTasks, setAllDesignerTasks] = useState([]);
  const [taskCreated, setTaskCreated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateFormatted, setSelectedDateFormatted] = useState('');
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);
  const [isTaskDetailsVisible, setIsTaskDetailsVisible] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [loadingTaskDetails, setLoadingTaskDetails] = useState(false);

  // Get data from schedule store
  const { 
    fetchDesigners, 
    designers, 
    getAllTasks, 
    getTasksByDesignerId,
    workTasks, 
    isLoading, 
    error,
    updateTasksForDepositSuccessfulOrders,
    syncTasksForReConsultingOrders
  } = useScheduleStore();

  // Load designers and tasks on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchDesigners();
      const tasks = await getAllTasks(); // Sử dụng API /api/worktask/designer
      setAllDesignerTasks(tasks || []);
    };
    
    loadInitialData();
  }, [fetchDesigners, getAllTasks, refreshTrigger]);

  // Store all tasks
  useEffect(() => {
    if (workTasks && workTasks.length > 0) {
      setAllDesignerTasks(workTasks);
    }
  }, [workTasks]);

  // Open modal automatically when navigated from order detail page with autoOpenModal
  useEffect(() => {
    if (autoOpenModal && serviceOrderFromNav && !isAddTaskModalVisible) {
      // Small delay to ensure data is loaded
      const timer = setTimeout(() => {
        setIsAddTaskModalVisible(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [autoOpenModal, serviceOrderFromNav, isAddTaskModalVisible]);

  // Load tasks for selected designer
  useEffect(() => {
    const loadDesignerTasks = async () => {
      if (selectedDesignerId) {
        try {
          await getTasksByDesignerId(selectedDesignerId);
        } catch (error) {
          console.error("Error loading designer tasks:", error);
        }
      }
    };
    
    loadDesignerTasks();
  }, [selectedDesignerId, getTasksByDesignerId]);

  // Filter tasks for selected designer
  const filteredTasks = selectedDesignerId 
    ? (workTasks || []).filter(task => task.userId === selectedDesignerId)
    : workTasks || [];

  // Handle designer selection change
  const handleDesignerChange = (designerId) => {
    setSelectedDesignerId(designerId);
    const designer = designers.find(d => d.id === designerId);
    setViewingDesigner(designer);
  };

  // Handle opening the modal to add a task
  const handleAddTask = () => {
    setIsAddTaskModalVisible(true);
  };

  // Close the modal and refresh data if needed
  const handleModalClose = (shouldRefresh = false, designerId = null, success = false) => {
    setIsAddTaskModalVisible(false);
    if (shouldRefresh) {
      setRefreshTrigger(prev => prev + 1);
    }
    
    if (success) {
      setTaskCreated(true);
      if (designerId) {
        setSelectedDesignerId(designerId);
        setViewingDesigner(designers.find(d => d.id === designerId));
      }
    }
    
    // Clear navigation state to prevent modal from reopening
    if (window.history.replaceState && serviceOrderFromNav) {
      window.history.replaceState(null, document.title, window.location.pathname);
    }
  };

  // Handle syncing tasks with orders status
  const handleSyncTasks = async () => {
    setIsSyncing(true);
    try {
      // First sync ReConsulting orders
      const reConsultingResult = await syncTasksForReConsultingOrders();
      
      // Then sync DepositSuccessful orders
      const depositResult = await updateTasksForDepositSuccessfulOrders();
      
      // Provide feedback and refresh if needed
      const hasUpdates = 
        (reConsultingResult && !reConsultingResult.error) || 
        (depositResult && !depositResult.error);
      
      if (hasUpdates) {
        message.success('Đồng bộ trạng thái thành công');
        setRefreshTrigger(prev => prev + 1);
      } else {
        message.info('Không có task nào cần cập nhật');
      }
    } catch (error) {
      message.error('Lỗi đồng bộ: ' + (error.message || 'Không xác định'));
    } finally {
      setIsSyncing(false);
    }
  };

  // Get tasks for a designer on a specific date
  const getDesignerTasksOnDate = (designerId, date) => {
    return allDesignerTasks.filter(task => 
      task.userId === designerId && 
      dayjs(task.dateAppointment).isSame(date, 'day')
    );
  };

  // Calculate designer availability for today
  const calculateDesignerAvailability = (designerId) => {
    const today = dayjs();
    const todayTasks = getDesignerTasksOnDate(designerId, today);
    const tomorrowTasks = getDesignerTasksOnDate(designerId, today.add(1, 'day'));
    
    if (todayTasks.length === 0) {
      return { level: 'high', text: 'Sẵn sàng (hôm nay trống lịch)', color: 'green' };
    } else if (todayTasks.length < 3) {
      return { level: 'medium', text: `Hôm nay có ${todayTasks.length} công việc`, color: 'orange' };
    } else {
      return { level: 'low', text: `Hôm nay đã có ${todayTasks.length} công việc`, color: 'red' };
    }
  };

  // Function to show the task creation modal
  const showCreateTaskModal = (date, preselectedOrderId = null) => {
    setSelectedDate(date);
    setIsAddTaskModalVisible(true);
  };

  // Function to get tasks for a specific date
  const getTasksForDate = (date) => {
    if (viewingDesigner && viewingDesigner.id) {
      return filteredTasks.filter(task => {
        const taskDate = dayjs(task.dateAppointment);
        return date.isSame(taskDate, 'day');
      }) || [];
    } else {
      return allDesignerTasks.filter(task => {
        const taskDate = dayjs(task.dateAppointment);
        return date.isSame(taskDate, 'day');
      }) || [];
    }
  };

  // Function to render cell content for the calendar
  const dateCellRender = (date) => {
    const tasks = getTasksForDate(date);

    if (tasks.length === 0) {
      return null;
    }

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks.map((task, index) => (
          <li key={index} style={{ marginBottom: 4 }}>
            <Tooltip
              color="#fff"
              title={
                <div style={{ lineHeight: 1.6 }}>
                  <div><strong>🕒 Giờ hẹn:</strong> {task.timeAppointment || 'Không xác định'}</div>
                  <div><strong>📌 Mã công việc:</strong> {task.id}</div>
                  <div><strong>📦 Mã đơn hàng:</strong> {task.serviceOrderId}</div>
                  <div><strong>📝 Ghi chú:</strong> {task.note || 'Không có ghi chú'}</div>
                  <div><strong>📍 Trạng thái:</strong> {getStatusTag(task.status)}</div>
                </div>
              }
              styles={{
                body: {
                  color: '#333',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 0 8px rgba(0,0,0,0.1)',
                  maxWidth: 300,
                  fontSize: 13,
                }
              }}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  showTaskDetails(task.id, task.serviceOrderId);
                }}
                style={{
                  backgroundColor: getStatusColor(task.status),
                  borderRadius: 6,
                  padding: '6px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontWeight: 500 }}>{task.timeAppointment || '--:--'}</span>
                <span style={{ fontSize: 11, color: '#333' }}>
                  #{task.serviceOrderId?.substring(0, 8) || 'N/A'}
                </span>
              </div>
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  // Function to get status tag
  const getStatusTag = (status) => {
    switch (status) {
      case 'Pending':
        return <Tag color="blue">Đang chuẩn bị</Tag>;
      case 'ConsultingAndSket':
        return <Tag color="processing">Đang tư vấn</Tag>;
      case 'DoneConsulting':
        return <Tag color="blue">Hoàn tất tư vấn</Tag>;
      case 'Design':
        return <Tag color="success">Đang thiết kế</Tag>;
      default:
        return <Tag color="error">Không xác định</Tag>;
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#d9d9d9';
      case 'ConsultingAndSket': return '#bae7ff';
      case 'DoneConsulting': return '#adc6ff';
      case 'Design': return '#d9f7be';
      default: return '#ffccc7';
    }
  };

  // Function to get order status tag
  const getOrderStatusTag = (status) => {
    switch (status) {
      case 'Pending':
        return <Tag color="default">Chờ xử lý</Tag>;
      case 'Processing':
        return <Tag color="blue">Đang xử lý</Tag>;
      case 'Installing':
        return <Tag color="blue">Đang lắp đặt</Tag>;
      case 'ReInstall':
        return <Tag color="orange">Lắp lại</Tag>;
      case 'Successfully':
      case 'DoneInstalling':
      case 'Completed':
        return <Tag color="green">Hoàn tất</Tag>;
      case 'DeliveryFail':
        return <Tag color="error">Giao hàng thất bại</Tag>;
      default:
        return <Tag color="red">Không xác định</Tag>;
    }
  };

  // Function to handle calendar date selection
  const handleDateSelect = (date) => {
    let tasks = [];

    if (viewingDesigner && viewingDesigner.id) {
      tasks = filteredTasks.filter(task => {
        const taskDate = dayjs(task.dateAppointment);
        return date.isSame(taskDate, 'day');
      }) || [];
    } else {
      tasks = allDesignerTasks.filter(task => {
        const taskDate = dayjs(task.dateAppointment);
        return date.isSame(taskDate, 'day');
      }) || [];
    }

    console.log("Tasks for selected date:", tasks);
    setSelectedDate(date);
    setSelectedDateFormatted(date.format('DD/MM/YYYY'));

    if (tasks.length > 0) {
      setSelectedDateTasks(tasks);
      setIsTaskDetailsVisible(true);
    } else {
      if (viewingDesigner && viewingDesigner.id) {
        showCreateTaskModal(date);
      } else {
        message.info('Hãy chọn một designer trước khi tạo lịch mới');
        setActiveView('designers');
      }
    }
  };

  // Function to handle task details view
  const showTaskDetails = (taskId, serviceOrderId) => {
    if (!taskId || !serviceOrderId) {
      console.error("Missing taskId or serviceOrderId");
      message.error("Không thể xem chi tiết: Thiếu thông tin task");
      return;
    }

    const taskForDisplay = filteredTasks.find(t => t.id === taskId) ||
      allDesignerTasks.find(t => t.id === taskId);

    if (!taskForDisplay) {
      console.error("Task not found with ID:", taskId);
      message.error("Không tìm thấy thông tin task");
      return;
    }

    console.log("Found task for details:", taskForDisplay);

    const taskDate = dayjs(taskForDisplay.dateAppointment);
    setSelectedDate(taskDate);
    setSelectedDateFormatted(taskDate.format('DD/MM/YYYY'));

    const tasksOnThisDate = getTasksForDate(taskDate);
    setSelectedDateTasks(tasksOnThisDate);

    fetchTaskDetails(taskId, serviceOrderId);
    setIsTaskDetailsVisible(true);
  };

  // Function to fetch task details
  const fetchTaskDetails = async (taskId, serviceOrderId) => {
    setLoadingTaskDetails(true);
    try {
      console.log(`Fetching order details for task ${taskId}, serviceOrderId: ${serviceOrderId}`);
      const response = await api.get(`/api/serviceorder/${serviceOrderId}`);
      if (response.status === 200) {
        console.log("Order details received:", response.data);
        const foundTask = filteredTasks.find(task => task.id === taskId) ||
          allDesignerTasks.find(task => task.id === taskId);

        console.log("Found task:", foundTask);

        const taskDetails = {
          task: foundTask,
          order: response.data
        };

        console.log("Setting selectedTaskDetails:", taskDetails);
        setSelectedTaskDetails(taskDetails);
      } else {
        console.error('Error response:', response);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      message.error('Không thể tải thông tin đơn hàng: ' + (error.response?.data?.message || error.message || 'Lỗi không xác định'));
      const task = filteredTasks.find(task => task.id === taskId) ||
        allDesignerTasks.find(task => task.id === taskId);
      if (task) {
        setSelectedTaskDetails({
          task: task,
          order: {
            id: serviceOrderId,
            userName: 'Không thể tải thông tin',
            address: 'Không thể tải thông tin',
            cusPhone: 'Không thể tải thông tin',
            email: 'Không thể tải thông tin',
            status: 'Không thể tải thông tin'
          }
        });
        message.warning('Đang hiển thị thông tin cơ bản, không thể tải đầy đủ chi tiết đơn hàng');
      }
    } finally {
      setLoadingTaskDetails(false);
    }
  };

  // Function to show basic task details without API call
  const showBasicTaskDetails = (task) => {
    console.log("Showing basic task details for:", task);

    const basicOrder = {
      id: task.serviceOrderId,
      userName: "Đang tải thông tin...",
      address: "Đang tải thông tin...",
      cusPhone: "Đang tải thông tin...",
      email: "Đang tải thông tin...",
      status: "Đang tải thông tin..."
    };

    setSelectedTaskDetails({
      task: task,
      order: basicOrder
    });

    fetchTaskDetails(task.id, task.serviceOrderId);
  };

  return (
    <Layout.Content style={{ padding: '24px', minHeight: '100vh' }}>
      {/* Show alert when navigated from order detail with order info */}
      {serviceOrderFromNav && customerNameFromNav && (
        <Alert
          message={<span style={{ fontWeight: 'bold' }}>Chọn designer để gán task thiết kế</span>}
          description={
            <div>
              <p><strong>Đơn hàng:</strong> #{serviceOrderFromNav}</p>
              <p><strong>Khách hàng:</strong> {customerNameFromNav}</p>
              {addressFromNav && <p><strong>Địa chỉ:</strong> {addressFromNav.replace(/\|/g, ', ')}</p>}
              <p>Vui lòng chọn một designer từ danh sách để xem lịch và tạo task thiết kế.</p>
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: '20px' }}
        />
      )}
      
      {/* Success message after task creation */}
      {taskCreated && serviceOrderFromNav && (
        <Alert
          message="Đã giao việc thành công"
          description={
            <div>
              <p>Đã gán designer <strong>{viewingDesigner?.name || selectedDesignerId}</strong> cho đơn hàng #{serviceOrderFromNav.substring(0, 8)} thành công.</p>
              <p>Bạn có thể tiếp tục xem lịch làm việc của designer hoặc quay lại trang đơn hàng.</p>
              <div style={{ marginTop: '12px' }}>
                <Button
                  type="primary"
                  onClick={() => window.history.back()}
                  style={{ marginRight: '8px' }}
                >
                  Quay lại trang đơn hàng
                </Button>
                <Button
                  onClick={() => setTaskCreated(false)}
                >
                  Tiếp tục quản lý lịch
                </Button>
              </div>
            </div>
          }
          type="success"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      <Tabs activeKey={activeView} onChange={setActiveView}>
        <TabPane
          tab={
            <span>
              <CalendarOutlined /> Lịch làm việc
            </span>
          }
          key="calendar"
        >
          <Card className="designer-schedule-manager" bordered={false}>
            <div className="header-section">
              <Title level={3}>
                <Space>
                  <CalendarOutlined />
                  Quản lý lịch làm việc Designer
                </Space>
              </Title>
              
              <Space className="action-buttons">
                <Tooltip title="Đồng bộ lại task với trạng thái đơn hàng">
                  <Button 
                    icon={<SyncOutlined spin={isSyncing} />} 
                    onClick={handleSyncTasks}
                    loading={isSyncing}
                  >
                    Đồng bộ
                  </Button>
                </Tooltip>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddTask}
                >
                  Giao việc mới
                </Button>
              </Space>
            </div>

            <Row className="filter-section" gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="Chọn Designer..."
                  style={{ width: '100%' }}
                  onChange={handleDesignerChange}
                  value={selectedDesignerId}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {Array.isArray(designers) && designers.map(designer => (
                    <Select.Option key={designer.id} value={designer.id}>
                      <Space>
                        <UserOutlined />
                        {designer.name}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>
            
            {isLoading ? (
              <div className="loading-container">
                <Spin size="large" tip="Đang tải dữ liệu..." />
              </div>
            ) : error ? (
              <div className="error-container">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span>Lỗi: {error}</span>}
                />
              </div>
            ) : !selectedDesignerId ? (
              <Alert
                message="Vui lòng chọn designer"
                description="Hãy chọn một designer để xem lịch làm việc của họ."
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
              />
            ) : (
              <div className="content-container">
                <style>
                  {`
                    /* Custom scrollbar styling for calendar */
                    .ant-picker-calendar-date-content::-webkit-scrollbar {
                      width: 4px;
                      height: 4px;
                    }
                    .ant-picker-calendar-date-content::-webkit-scrollbar-thumb {
                      background: #d9d9d9;
                      borderRadius: 4px;
                    }
                    .ant-picker-calendar-date-content::-webkit-scrollbar-track {
                      background: #f0f0f0;
                      borderRadius: 4px;
                    }
                    /* General scrollbar styling */
                    ::-webkit-scrollbar {
                      width: 4px;
                      height: 4px;
                    }
                    ::-webkit-scrollbar-thumb {
                      background: #d9d9d9;
                      borderRadius: 4px;
                    }
                    ::-webkit-scrollbar-track {
                      background: #f0f0f0;
                      borderRadius: 4px;
                    }
                  `}
                </style>
                <Calendar
                  dateCellRender={dateCellRender}
                  onSelect={handleDateSelect}
                  locale={locale}
                />
              </div>
            )}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <UserOutlined /> Thông tin Designer
            </span>
          }
          key="designers"
        >
          <Card bordered={false} title="Danh sách Designer">
            <Row gutter={[16, 16]}>
              {designers && designers.length > 0 ? (
                designers.map(designer => {
                  const availability = calculateDesignerAvailability(designer.id);
                  const todayTasks = getDesignerTasksOnDate(designer.id, dayjs('2025-05-20'));
                  
                  return (
                    <Col xs={24} sm={12} md={8} key={designer.id}>
                      <Card
                        hoverable
                        style={{
                          borderRadius: '8px',
                          boxShadow: viewingDesigner?.id === designer.id ? '0 0 8px rgba(24,144,255,0.5)' : 'none',
                          border: viewingDesigner?.id === designer.id ? '1px solid #1890ff' : '1px solid #e8e8e8',
                          height: '100%'
                        }}
                        actions={[
                          <Button
                            type="primary"
                            onClick={() => {
                              setViewingDesigner(designer);
                              setSelectedDesignerId(designer.id);
                              setActiveView('calendar');
                            }}
                          >
                            Xem lịch
                          </Button>,
                          <Button
                            onClick={() => {
                              setSelectedDesignerId(designer.id);
                              setIsAddTaskModalVisible(true);
                            }}
                          >
                            Giao việc
                          </Button>
                        ]}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                          <Avatar
                            size={64}
                            icon={<UserOutlined />}
                            src={designer.avatarUrl}
                            style={{ marginRight: '16px', backgroundColor: '#1890ff' }}
                          />
                          <div>
                            <Title level={5} style={{ margin: 0 }}>{designer.name}</Title>
                            <Tag color="blue">Designer</Tag>
                            <Tag color={availability.color}>{availability.text}</Tag>
                          </div>
                        </div>

                        <div style={{ color: '#666', fontSize: '14px' }}>
                          <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center' }}>
                            <PhoneOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            {designer.phone || 'Không có thông tin'}
                          </p>
                          <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center' }}>
                            <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            {designer.email || 'Không có thông tin'}
                          </p>
                          
                          {/* Hiển thị lịch làm việc hôm nay */}
                          {todayTasks.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              <Text strong>Lịch làm việc mẫu:</Text>
                              <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                                {todayTasks.map((task, idx) => (
                                  <li key={idx} style={{ marginBottom: '5px' }}>
                                    <Text>{task.timeAppointment?.substring(0, 5) || '--:--'} - Đơn #{task.serviceOrderId?.substring(0, 8)}</Text>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Col>
                  );
                })
              ) : (
                <Col span={24}>
                  <Empty description="Không có designer nào" />
                </Col>
              )}
            </Row>
          </Card>
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <UnorderedListOutlined /> Danh sách công việc
            </span>
          }
          key="list"
        >
          <Card className="designer-schedule-manager" bordered={false}>
            <div className="header-section">
              <Title level={3}>
                <Space>
                  <UnorderedListOutlined />
                  Danh sách công việc Designer
                </Space>
              </Title>
              
              <Space className="action-buttons">
                <Select
                  placeholder="Lọc theo Designer..."
                  style={{ width: '200px' }}
                  onChange={handleDesignerChange}
                  value={selectedDesignerId}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {Array.isArray(designers) && designers.map(designer => (
                    <Select.Option key={designer.id} value={designer.id}>
                      <Space>
                        <UserOutlined />
                        {designer.name}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Space>
            </div>
            
            {isLoading ? (
              <div className="loading-container">
                <Spin size="large" tip="Đang tải dữ liệu..." />
              </div>
            ) : error ? (
              <div className="error-container">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span>Lỗi: {error}</span>}
                />
              </div>
            ) : (
              <div className="content-container">
                <DesignerTasksList 
                  tasks={filteredTasks}
                  designers={designers || []}
                  selectedDesignerId={selectedDesignerId}
                  onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                />
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>

      <AddDesignerTaskModal
        visible={isAddTaskModalVisible}
        onClose={handleModalClose}
        designers={designers || []}
        selectedDesignerId={selectedDesignerId}
        preselectedOrderId={serviceOrderFromNav}
        customerName={customerNameFromNav}
        address={addressFromNav}
      />

      {/* Task Details Drawer */}
      <Drawer
        title={`Lịch làm việc ngày ${selectedDateFormatted}`}
        placement="right"
        onClose={() => {
          setIsTaskDetailsVisible(false);
          setSelectedTaskDetails(null);
        }}
        open={isTaskDetailsVisible}
        width={700}
      >
        {selectedDateTasks.length > 0 ? (
          <div>
            {!viewingDesigner && (
              <Alert
                message="Lưu ý"
                description="Bạn đang xem tất cả các lịch làm việc. Để tạo lịch mới, vui lòng chọn một designer trước."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}
            <List
              itemLayout="horizontal"
              dataSource={selectedDateTasks}
              renderItem={task => (
                <List.Item
                  actions={
                    [
                      <Button
                        type="link"
                        onClick={() => showTaskDetails(task.id, task.serviceOrderId)}
                      >
                        Chi tiết
                      </Button>
                    ]
                  }
                  onClick={() => showBasicTaskDetails(task)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<CalendarOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={<span>Đơn hàng #{task.serviceOrderId}</span>}
                    description={
                      <Space direction="vertical">
                        <Text>Thời gian: {task.timeAppointment}</Text>
                        {task.note && <Text>Ghi chú: {task.note}</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />

            {selectedTaskDetails && (
              <div style={{ marginTop: '24px', border: '1px solid #f0f0f0', padding: '16px', borderRadius: '8px' }}>
                <Title level={5}>Chi tiết đơn hàng #{selectedTaskDetails.task?.serviceOrderId}</Title>

                {loadingTaskDetails ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin />
                  </div>
                ) : selectedTaskDetails.order ? (
                  <>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Khách hàng">
                        {selectedTaskDetails.order?.userName || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ">
                        {selectedTaskDetails.order?.address?.replace(/\|/g, ', ') || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        {selectedTaskDetails.order?.cusPhone || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {selectedTaskDetails.order?.email || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày hẹn">
                        {selectedTaskDetails.task?.dateAppointment ? dayjs(selectedTaskDetails.task?.dateAppointment).format('DD/MM/YYYY') : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giờ hẹn">
                        {selectedTaskDetails.task?.timeAppointment || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ghi chú">
                        {selectedTaskDetails.task?.note || 'Không có ghi chú'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái đơn hàng">
                        {getOrderStatusTag(selectedTaskDetails.order?.status)}
                      </Descriptions.Item>
                    </Descriptions>
                  </>
                ) : (
                  <Empty description="Không thể tải thông tin đơn hàng" />
                )}
              </div>
            )}
          </div>
        ) : (
          <Empty description="Không có lịch làm việc nào trong ngày này" />
        )}
      </Drawer>
    </Layout.Content>
  );
};

export default DesignerScheduleManager; 