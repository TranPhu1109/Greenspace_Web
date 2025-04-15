import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Card, Typography, Tooltip, Popover, Row, Col, Tag, Button, Modal, message, Select } from 'antd';
import { EyeOutlined, CheckOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import TaskDetailDrawer from './TaskDetailDrawer';
import './styles/DesignerCalendarView.scss';

const { Text, Title } = Typography;

// Helper function to get status badge
const getStatusBadge = (status) => {
  const statusMap = {
    0: { status: 'processing', text: 'Tư vấn & phác thảo', color: 'blue' },
    1: { status: 'success', text: 'Đã phác thảo', color: 'cyan' },
    2: { status: 'processing', text: 'Thiết kế', color: 'purple' },
    3: { status: 'success', text: 'Đã thiết kế', color: 'green' },
    'ConsultingAndSket': { status: 'processing', text: 'Tư vấn & phác thảo', color: 'blue' },
    'DoneConsulting': { status: 'success', text: 'Đã phác thảo', color: 'cyan' },
    'Design': { status: 'processing', text: 'Thiết kế', color: 'purple' },
    'DoneDesign': { status: 'success', text: 'Đã thiết kế', color: 'green' },
  };

  return statusMap[status] || { status: 'default', text: `Trạng thái #${status}`, color: 'default' };
};

// Format date function
const formatDate = (dateString) => {
  return moment(dateString).format('DD/MM/YYYY HH:mm');
};

// Component to display tasks in the calendar cell
const TasksCell = ({ tasks, date, onTaskClick }) => {
  const dayTasks = tasks.filter(task => {
    const taskCreationDate = moment(task.creationDate);
    return taskCreationDate.isSame(date, 'day');
  });

  if (dayTasks.length === 0) {
    return null;
  }

  return (
    <div className="calendar-tasks">
      {dayTasks.map((task, index) => {
        const statusInfo = getStatusBadge(task.status);
        const designerName = task.userName || 'Chưa xác định';
        
        return (
          <div 
            key={task.id} 
            className="calendar-task-item"
            onClick={() => onTaskClick(task)}
          >
            <Badge status={statusInfo.status} text="" />
            <Tooltip title={`${designerName} - ${statusInfo.text}`}>
              <Tag color={statusInfo.color} className="task-tag">
                {task.serviceOrder ? `Đơn #${task.serviceOrder.id.substring(0, 8)}` : 'Không có đơn'}
              </Tag>
            </Tooltip>
          </div>
        );
      })}
      {dayTasks.length > 3 && (
        <Text type="secondary" className="more-tasks">
          +{dayTasks.length - 3} công việc khác
        </Text>
      )}
    </div>
  );
};

const DesignerCalendarView = ({ tasks, designers, selectedDesignerId, onRefresh }) => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Show task detail drawer
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDrawerVisible(true);
  };

  // Close drawer
  const handleCloseDrawer = (refreshNeeded = false) => {
    setDrawerVisible(false);
    if (refreshNeeded) {
      onRefresh();
    }
  };

  // Custom render for calendar cells
  const dateCellRender = (date) => {
    return <TasksCell tasks={tasks} date={date} onTaskClick={handleTaskClick} />;
  };

  // Calendar header renderer
  const headerRender = ({ value, onChange }) => {
    const start = 0;
    const end = 12;
    const monthOptions = [];

    for (let i = start; i < end; i++) {
      monthOptions.push(
        <Select.Option key={i} value={i} className="month-item">
          {moment(i + 1, 'M').format('MMMM')}
        </Select.Option>
      );
    }

    const year = value.year();
    const month = value.month();

    return (
      <div className="calendar-header">
        <Row gutter={8} justify="space-between" align="middle">
          <Col>
            <Title level={4}>{moment(value).format('MMMM YYYY')}</Title>
          </Col>
          <Col>
            <Button.Group>
              <Button onClick={() => onChange(value.clone().subtract(1, 'month'))}>
                Tháng trước
              </Button>
              <Button onClick={() => onChange(moment())}>
                Hôm nay
              </Button>
              <Button onClick={() => onChange(value.clone().add(1, 'month'))}>
                Tháng sau
              </Button>
            </Button.Group>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="designer-calendar-view">
      <Card bordered={false} className="calendar-card">
        <Calendar 
          dateCellRender={dateCellRender} 
          headerRender={headerRender}
          value={selectedDate}
          onChange={setSelectedDate}
        />
      </Card>

      {selectedTask && (
        <TaskDetailDrawer 
          visible={drawerVisible}
          task={selectedTask} 
          onClose={handleCloseDrawer}
          designers={designers}
        />
      )}
    </div>
  );
};

export default DesignerCalendarView; 