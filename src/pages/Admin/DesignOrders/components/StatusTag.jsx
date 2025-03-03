import React from 'react';
import { Tag, Badge } from 'antd';

const StatusTag = ({ status }) => {
  let color, text, icon;
  
  switch (status) {
    case 'pending':
      color = 'gold';
      text = 'Chờ xử lý';
      icon = 'warning';
      break;
    case 'processing':
      color = 'blue';
      text = 'Đang xử lý';
      icon = 'processing';
      break;
    case 'designing':
      color = 'purple';
      text = 'Đang thiết kế';
      icon = 'processing';
      break;
    case 'reviewing':
      color = 'cyan';
      text = 'Đang xem xét';
      icon = 'processing';
      break;
    case 'completed':
      color = 'green';
      text = 'Hoàn thành';
      icon = 'success';
      break;
    case 'cancelled':
      color = 'red';
      text = 'Đã hủy';
      icon = 'error';
      break;
    default:
      color = 'default';
      text = 'Không xác định';
      icon = 'default';
  }
  
  return (
    <Tag color={color} className="status-tag">
      <Badge status={icon} text={text} />
    </Tag>
  );
};

export default StatusTag; 