import React from 'react';
import { Card, Timeline, Tag, Button, Tooltip, Space, Avatar } from 'antd';
import { ClockCircleOutlined, UserOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useScheduleStore from '../../../stores/useScheduleStore';

const DesignerSchedule = ({ designer, onAssignTask }) => {
  const { updateTask } = useScheduleStore();
  
  // Sắp xếp tasks theo deadline
  const sortedTasks = [...(designer.tasks || [])].sort((a, b) => 
    dayjs(a.deadline) - dayjs(b.deadline)
  );

  // Xử lý cập nhật trạng thái task
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(designer.id, taskId, { task_status: newStatus });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  return (
    <Card 
      title={
        <Space>
          <Avatar src={designer.avatar} icon={<UserOutlined />} />
          <span>{designer.name}</span>
          <Tag color={designer.status === "đang rảnh" ? 'green' : 'blue'}>
            {designer.status}
          </Tag>
        </Space>
      }
      extra={
        <Button 
          type="primary" 
          onClick={() => onAssignTask(designer.id)}
          disabled={designer.status !== "đang rảnh"}
        >
          Phân công thiết kế
        </Button>
      }
    >
      {sortedTasks.length > 0 ? (
        <Timeline>
          {sortedTasks.map(task => (
            <Timeline.Item 
              key={task.task_id}
              color={getStatusColor(task.task_status)}
              dot={task.task_status === 'đang thực hiện' ? <ClockCircleOutlined /> : null}
            >
              <div className="task-item">
                <div className="task-date">
                  <CalendarOutlined /> {dayjs(task.deadline).format('DD/MM/YYYY')}
                </div>
                <div className="task-title">
                  <FileTextOutlined /> {task.title}
                </div>
                <div className="task-info">
                  <small>Khách hàng: {task.customer}</small>
                </div>
                <div className="task-actions">
                  {task.task_status !== 'hoàn thành' && (
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => handleStatusChange(task.task_id, 'hoàn thành')}
                    >
                      Đánh dấu hoàn thành
                    </Button>
                  )}
                  {task.task_status === 'chưa bắt đầu' && (
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => handleStatusChange(task.task_id, 'đang thực hiện')}
                    >
                      Bắt đầu thực hiện
                    </Button>
                  )}
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          Không có công việc nào
        </div>
      )}
    </Card>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'hoàn thành': return 'green';
    case 'đang thực hiện': return 'blue';
    case 'chưa bắt đầu': return 'gold';
    default: return 'default';
  }
};

export default DesignerSchedule; 