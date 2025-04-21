import React, { useState } from 'react';
import { Calendar as AntCalendar, Badge, Tooltip, Row, Col, Select, Button, Avatar, Card, List, Tag, Modal, message } from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined,
  LeftOutlined,
  RightOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  FileImageOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  DollarOutlined,
  BorderOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import './DesignerSchedule.scss';

const { Option } = Select;

// Mock data - sẽ được thay thế bằng API call
import { designerTasks, pendingTasks } from './mockData';

const DesignerScheduleView = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [tasks, setTasks] = useState(designerTasks);
  const [pendingAssignments, setPendingAssignments] = useState(pendingTasks);
  const [viewTaskModal, setViewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Xử lý khi nhận task mới
  const handleAcceptTask = (taskId) => {
    // Cập nhật trạng thái task thành "consulting" khi designer nhận task
    const updatedPendingTasks = pendingAssignments.filter(task => task.id !== taskId);
    const acceptedTask = pendingAssignments.find(task => task.id === taskId);
    
    if (acceptedTask) {
      const newTask = {
        ...acceptedTask,
        status: 'consulting', // Set status mới khi nhận task
        startDate: dayjs().format('YYYY-MM-DD'),
      };
      
      setTasks([...tasks, newTask]);
      setPendingAssignments(updatedPendingTasks);
      message.success('Đã nhận task thành công!');
    }
  };

  // Xử lý khi từ chối task
  const handleRejectTask = (taskId) => {
    // Gọi API để cập nhật trạng thái task
    message.info('Đã từ chối task');
    
    // Cập nhật UI
    const updatedPendingTasks = pendingAssignments.filter(task => task.id !== taskId);
    setPendingAssignments(updatedPendingTasks);
  };

  // Xem chi tiết task
  const viewTaskDetails = (task) => {
    setSelectedTask(task);
    setViewTaskModal(true);
  };

  // Chuyển đến trang chi tiết task
  const goToTaskDetail = (taskId) => {
    navigate(`/designer/tasks/${taskId}`);
  };

  // Lấy màu trạng thái cho badge
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'processing';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Lấy text trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'ongoing': return 'Đang thực hiện';
      case 'pending': return 'Chờ thực hiện';
      default: return 'Không xác định';
    }
  };

  // Render các task trong ô ngày
  const dateCellRender = (value) => {
    const date = value.format('YYYY-MM-DD');
    const listData = tasks.filter(item => {
      if (filterStatus !== 'all' && item.status !== filterStatus) {
        return false;
      }
      return dayjs(item.date).format('YYYY-MM-DD') === date;
    });
    
    return (
      <div className="date-cell-content">
        {listData.map(item => (
          <div 
            key={item.id} 
            className={`task-item ${item.status}`}
            onClick={() => goToTaskDetail(item.id)}
          >
            {/* <Badge 
              status={getStatusColor(item.status)} 
              text={ */}
                <Tooltip title={`${item.time} - ${item.title}`}>
                  <span className="task-title">{item.time} - {item.title}</span>
                </Tooltip>
              {/* } 
            /> */}
          </div>
        ))}
      </div>
    );
  };

  // Render header của calendar
  const headerRender = ({ value, onChange }) => {
    const current = value.clone();
    
    return (
      <div className="calendar-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Button.Group>
              <Button 
                icon={<LeftOutlined />}
                onClick={() => onChange(current.subtract(1, 'month'))}
              />
              <Button style={{ pointerEvents: 'none' }}>
                {current.month() + 1}/{current.year()}
              </Button>
              <Button 
                icon={<RightOutlined />}
                onClick={() => onChange(current.add(1, 'month'))}
              />
            </Button.Group>
          </Col>
          
          <Col>
            <Select 
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 200 }}
            >
              <Option value="all">Tất cả công việc</Option>
              <Option value="pending">Chờ thực hiện</Option>
              <Option value="ongoing">Đang thực hiện</Option>
              <Option value="completed">Đã hoàn thành</Option>
            </Select>
          </Col>
        </Row>
      </div>
    );
  };

  // Render danh sách task trong ngày đã chọn
  const renderDailyTasks = () => {
    const date = selectedDate.format('YYYY-MM-DD');
    const dailyTasks = tasks.filter(item => dayjs(item.date).format('YYYY-MM-DD') === date);
    
    return (
      <Card 
        title={`Công việc ngày ${selectedDate.format('DD/MM/YYYY')}`}
        className="daily-tasks-card"
        extra={
          <Badge 
            count={pendingAssignments.length} 
            onClick={() => document.getElementById('pending-tasks').scrollIntoView({ behavior: 'smooth' })}
            style={{ cursor: 'pointer' }}
          >
            <Button type="link">Chờ xác nhận</Button>
          </Badge>
        }
      >
        {dailyTasks.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={dailyTasks}
            renderItem={task => (
              <List.Item
                actions={[
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => goToTaskDetail(task.id)}
                  >
                    Chi tiết
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<FileImageOutlined />} 
                      style={{ 
                        backgroundColor: 
                          task.status === 'completed' ? '#52c41a' : 
                          task.status === 'ongoing' ? '#1890ff' : '#faad14' 
                      }} 
                    />
                  }
                  title={
                    <div>
                      {task.title} 
                      <Tag 
                        color={
                          task.status === 'completed' ? 'success' : 
                          task.status === 'ongoing' ? 'processing' : 'warning'
                        }
                        style={{ marginLeft: 8 }}
                      >
                        {getStatusText(task.status)}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="task-description">
                      <div><ClockCircleOutlined /> {task.time}</div>
                      <div><UserOutlined /> {task.customer}</div>
                      {task.location && <div><EnvironmentOutlined /> {task.location}</div>}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="empty-tasks">
            <p>Không có công việc nào trong ngày này</p>
          </div>
        )}
      </Card>
    );
  };

  // Render danh sách task đang chờ xác nhận
  const renderPendingTasks = () => {
    return (
      <Card 
        title="Công việc chờ xác nhận" 
        className="pending-tasks-card"
        id="pending-tasks"
      >
        {pendingAssignments.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={pendingAssignments}
            renderItem={task => (
              <List.Item
                actions={[
                  <Tooltip title="Xem chi tiết">
                    <Button 
                      icon={<InfoCircleOutlined />} 
                      size="small"
                      onClick={() => viewTaskDetails(task)}
                    />
                  </Tooltip>,
                  <Tooltip title="Nhận task">
                    <Button 
                      type="primary" 
                      icon={<CheckOutlined />} 
                      size="small"
                      onClick={() => handleAcceptTask(task.id)}
                    />
                  </Tooltip>,
                  <Tooltip title="Từ chối">
                    <Button 
                      danger 
                      icon={<CloseOutlined />} 
                      size="small"
                      onClick={() => handleRejectTask(task.id)}
                    />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<FileImageOutlined />} style={{ backgroundColor: '#ff9800' }} />}
                  title={task.title}
                  description={
                    <div className="task-description">
                      <div><UserOutlined /> {task.customer}</div>
                      <div><CalendarOutlined /> Deadline: {dayjs(task.deadline).format('DD/MM/YYYY')}</div>
                      {task.location && <div><EnvironmentOutlined /> {task.location}</div>}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="empty-tasks">
            <p>Không có công việc nào đang chờ xác nhận</p>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="designer-schedule-container">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className="calendar-card">
            <AntCalendar
              headerRender={headerRender}
              dateCellRender={dateCellRender}
              value={selectedDate}
              onChange={setSelectedDate}
              fullscreen={true}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <div className="tasks-sidebar">
            {renderDailyTasks()}
            {renderPendingTasks()}
          </div>
        </Col>
      </Row>
      
      {/* Modal xem chi tiết task */}
      <Modal
        title="Chi tiết công việc"
        open={viewTaskModal}
        onCancel={() => setViewTaskModal(false)}
        footer={[
          <Button key="reject" danger onClick={() => {
            handleRejectTask(selectedTask?.id);
            setViewTaskModal(false);
          }}>
            Từ chối
          </Button>,
          <Button key="accept" type="primary" onClick={() => {
            handleAcceptTask(selectedTask?.id);
            setViewTaskModal(false);
          }}>
            Nhận task
          </Button>
        ]}
        width={600}
      >
        {selectedTask && (
          <div className="task-detail-content">
            <h3>{selectedTask.title}</h3>
            
            <div className="detail-section">
              <h4>Thông tin khách hàng</h4>
              <p><UserOutlined /> Khách hàng: {selectedTask.customer}</p>
              {selectedTask.phone && <p><PhoneOutlined /> Số điện thoại: {selectedTask.phone}</p>}
              {selectedTask.email && <p><MailOutlined /> Email: {selectedTask.email}</p>}
              {selectedTask.location && <p><EnvironmentOutlined /> Địa chỉ: {selectedTask.location}</p>}
            </div>
            
            <div className="detail-section">
              <h4>Thông tin dự án</h4>
              <p><CalendarOutlined /> Deadline: {dayjs(selectedTask.deadline).format('DD/MM/YYYY')}</p>
              {selectedTask.budget && <p><DollarOutlined /> Ngân sách: {selectedTask.budget}</p>}
              {selectedTask.area && <p><BorderOutlined /> Diện tích: {selectedTask.area}</p>}
            </div>
            
            {selectedTask.description && (
              <div className="detail-section">
                <h4>Mô tả</h4>
                <p>{selectedTask.description}</p>
              </div>
            )}
            
            {selectedTask.requirements && (
              <div className="detail-section">
                <h4>Yêu cầu</h4>
                <p>{selectedTask.requirements}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DesignerScheduleView; 