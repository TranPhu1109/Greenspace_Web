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
  // Chuyển đổi date từ moment sang string để so sánh chính xác
  const dateStr = date.format('YYYY-MM-DD');
  
  const dayTasks = tasks.filter(task => {
    // Sử dụng dateAppointment (cắt bỏ phần thời gian) để so sánh với ngày của ô lịch
    const taskDateStr = task.dateAppointment ? task.dateAppointment.split('T')[0] : '';
    return taskDateStr === dateStr;
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
            <Tooltip title={`${statusInfo.text} - ${task.timeAppointment || 'Chưa có giờ'}`}>
              <Tag color={statusInfo.color} className="task-tag">
                {task.timeAppointment?.substring(0, 5) || '--:--'} - Đơn #{task.serviceOrderId?.substring(0, 8) || 'N/A'}
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
  // Đặt cứng ngày mặc định là tháng 5/2025 để phù hợp với dữ liệu task
  const defaultDate = moment('2025-05-15');
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  
  // Đảm bảo lịch được đặt về năm 2025 khi component mount
  useEffect(() => {
    setSelectedDate(defaultDate);
  }, []);
  
  // Tìm ngày hợp lý từ tasks để hiển thị lịch đúng thời điểm
  useEffect(() => {
    if (tasks && tasks.length > 0 && selectedDesignerId) {
      const designerTasks = tasks.filter(task => task.userId === selectedDesignerId);
      if (designerTasks.length > 0) {
        // Lấy task gần nhất
        const sortedTasks = [...designerTasks].sort((a, b) => {
          return moment(a.dateAppointment).diff(moment(b.dateAppointment));
        });
        const latestTask = sortedTasks[0];
        if (latestTask && latestTask.dateAppointment) {
          // Đảm bảo chúng ta luôn sử dụng năm 2025
          const taskDate = moment(latestTask.dateAppointment);
          if (taskDate.isValid()) {
            setSelectedDate(taskDate);
          }
        }
      }
    }
  }, [tasks, selectedDesignerId]);
  
  // Log để debug
  useEffect(() => {
    console.log("Tasks received:", tasks);
    console.log("Selected designer ID:", selectedDesignerId);
    console.log("Current selected date:", selectedDate.format('YYYY-MM-DD'));
    
    // Lọc tasks theo designer được chọn
    if (tasks && selectedDesignerId) {
      const designerTasks = tasks.filter(task => task.userId === selectedDesignerId);
      console.log("Filtered tasks for selected designer:", designerTasks);
      setFilteredTasks(designerTasks);
    } else {
      setFilteredTasks(tasks || []);
    }
  }, [tasks, selectedDesignerId, selectedDate]);

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
    return <TasksCell tasks={filteredTasks} date={date} onTaskClick={handleTaskClick} />;
  };

  // Calendar header renderer
  const headerRender = ({ value, onChange }) => {
    // Đảm bảo giá trị hiện tại của lịch là năm 2025
    const currentValue = value.year() === 2025 ? value : defaultDate.clone().month(value.month());
    
    const handlePrevMonth = () => {
      // Lùi về tháng trước nhưng vẫn giữ năm 2025
      const prevMonth = currentValue.clone().subtract(1, 'month');
      onChange(prevMonth);
    };
    
    const handleNextMonth = () => {
      // Tiến tới tháng sau nhưng vẫn giữ năm 2025
      const nextMonth = currentValue.clone().add(1, 'month');
      onChange(nextMonth);
    };
    
    const handleReset = () => {
      // Về tháng 5/2025
      onChange(defaultDate);
    };

    return (
      <div className="calendar-header">
        <Row gutter={8} justify="space-between" align="middle">
          <Col>
            <Title level={4}>{currentValue.format('MMMM YYYY')}</Title>
          </Col>
          <Col>
            <Button.Group>
              <Button onClick={handlePrevMonth}>
                Tháng trước
              </Button>
              <Button onClick={handleReset}>
                Về 05/2025
              </Button>
              <Button onClick={handleNextMonth}>
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
          defaultValue={defaultDate}
          validRange={[moment('2025-01-01'), moment('2025-12-31')]}
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