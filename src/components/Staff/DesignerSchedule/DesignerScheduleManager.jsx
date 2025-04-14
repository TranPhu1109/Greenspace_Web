import React, { useState, useEffect } from 'react';
import { Layout, Card, Select, Spin, Typography, Row, Col, Button, Space, Empty, Tag, Tooltip, Tabs, message } from 'antd';
import { PlusOutlined, SyncOutlined, CalendarOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import useScheduleStore from '@/stores/useScheduleStore';
import DesignerCalendarView from './components/DesignerCalendarView';
import DesignerTasksList from './components/DesignerTasksList';
import AddDesignerTaskModal from './components/AddDesignerTaskModal';
import './DesignerScheduleManager.scss';

const { Title } = Typography;
const { TabPane } = Tabs;

const DesignerScheduleManager = () => {
  const [selectedDesignerId, setSelectedDesignerId] = useState(null);
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [activeView, setActiveView] = useState('calendar'); // 'calendar' or 'list'
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Get data from schedule store
  const { 
    fetchDesigners, 
    designers, 
    getAllTasks, 
    workTasks, 
    isLoading, 
    error,
    updateTasksForDepositSuccessfulOrders,
    syncTasksForReConsultingOrders
  } = useScheduleStore();

  // Load designers on component mount
  useEffect(() => {
    fetchDesigners();
    getAllTasks();
  }, [fetchDesigners, getAllTasks, refreshTrigger]);

  // Filter tasks for selected designer
  const filteredTasks = selectedDesignerId 
    ? (workTasks || []).filter(task => task.userId === selectedDesignerId)
    : workTasks || [];

  // Handle designer selection change
  const handleDesignerChange = (designerId) => {
    setSelectedDesignerId(designerId);
  };

  // Handle opening the modal to add a task
  const handleAddTask = () => {
    setIsAddTaskModalVisible(true);
  };

  // Close the modal and refresh data if needed
  const handleModalClose = (shouldRefresh = false) => {
    setIsAddTaskModalVisible(false);
    if (shouldRefresh) {
      setRefreshTrigger(prev => prev + 1);
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

  return (
    <Layout.Content style={{ padding: '24px', minHeight: '100vh' }}>
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
          <Col xs={24} sm={12} md={16} lg={18}>
            <div className="view-toggle">
              <Button.Group>
                <Button 
                  type={activeView === 'calendar' ? 'primary' : 'default'} 
                  icon={<CalendarOutlined />}
                  onClick={() => setActiveView('calendar')}
                >
                  Lịch
                </Button>
                <Button 
                  type={activeView === 'list' ? 'primary' : 'default'} 
                  icon={<UnorderedListOutlined />}
                  onClick={() => setActiveView('list')}
                >
                  Danh sách
                </Button>
              </Button.Group>
            </div>
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
        ) : (
          <div className="content-container">
            {activeView === 'calendar' ? (
              <DesignerCalendarView 
                tasks={filteredTasks}
                designers={designers || []}
                selectedDesignerId={selectedDesignerId}
                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
              />
            ) : (
              <DesignerTasksList 
                tasks={filteredTasks}
                designers={designers || []}
                selectedDesignerId={selectedDesignerId}
                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
              />
            )}
          </div>
        )}
      </Card>

      <AddDesignerTaskModal
        visible={isAddTaskModalVisible}
        onClose={handleModalClose}
        designers={designers || []}
        selectedDesignerId={selectedDesignerId}
      />
    </Layout.Content>
  );
};

export default DesignerScheduleManager; 