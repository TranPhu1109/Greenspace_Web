import React from 'react';
import { Card, Timeline, Tag, Button, Tooltip, Space } from 'antd';
import { ClockCircleOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const DesignerSchedule = ({ designer, tasks, onAssignTask }) => {
  const sortedTasks = [...tasks].sort((a, b) => dayjs(a.date) - dayjs(b.date));

  return (
    <Card 
      title={
        <Space>
          <UserOutlined />
          <span>{designer.name}</span>
          <Tag color={designer.isAvailable ? 'green' : 'red'}>
            {designer.isAvailable ? 'Đang rảnh' : 'Đang bận'}
          </Tag>
        </Space>
      }
      extra={
        <Button 
          type="primary" 
          onClick={() => onAssignTask(designer.id)}
          disabled={!designer.isAvailable}
        >
          Phân công thiết kế
        </Button>
      }
    >
      <Timeline>
        {sortedTasks.map(task => (
          <Timeline.Item 
            key={task.id}
            color={getStatusColor(task.status)}
            dot={task.status === 'ongoing' ? <ClockCircleOutlined /> : null}
          >
            <div className="task-item">
              <div className="task-header">
                <span className="task-date">
                  {dayjs(task.date).format('DD/MM/YYYY HH:mm')}
                </span>
                <Tag color={getStatusColor(task.status)}>
                  {getStatusText(task.status)}
                </Tag>
              </div>
              <div className="task-title">
                <FileTextOutlined /> {task.title}
              </div>
              <div className="task-info">
                <small>Khách hàng: {task.customer}</small>
              </div>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'green';
    case 'ongoing': return 'blue';
    case 'pending': return 'gold';
    case 'cancelled': return 'red';
    default: return 'default';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return 'Hoàn thành';
    case 'ongoing': return 'Đang thực hiện';
    case 'pending': return 'Chờ thực hiện';
    case 'cancelled': return 'Đã hủy';
    default: return 'Không xác định';
  }
};

export default DesignerSchedule; 