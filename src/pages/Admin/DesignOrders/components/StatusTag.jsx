import React from 'react';
import { Tag } from 'antd';
import { orderStatusConfig } from '../../../../components/Staff/mockData/newDesignOrders';

const StatusTag = ({ status }) => {
  // Kiểm tra nếu status không tồn tại trong config
  if (!status || !orderStatusConfig[status]) {
    return <Tag color="default">Không xác định</Tag>;
  }
  
  const statusConfig = orderStatusConfig[status];
  
  return (
    <Tag color={statusConfig.color}>
      {statusConfig.label}
    </Tag>
  );
};

export default StatusTag; 