import React from 'react';
import { Tag, Tooltip } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const PaymentStatusTag = ({ type, status, amount, total }) => {
  let color, icon, text;
  
  if (type === 'deposit') {
    // Logic cho trạng thái đặt cọc
    switch (status) {
      case 'paid':
        color = 'success';
        icon = <CheckCircleOutlined />;
        text = 'Đã đặt cọc';
        break;
      case 'pending':
        color = 'warning';
        icon = <ClockCircleOutlined />;
        text = 'Chờ đặt cọc';
        break;
      case 'none':
        color = 'default';
        icon = <ExclamationCircleOutlined />;
        text = 'Chưa đặt cọc';
        break;
      default:
        color = 'default';
        icon = <ClockCircleOutlined />;
        text = 'Chưa xác định';
    }
  } else {
    // Logic cho trạng thái thanh toán
    switch (status) {
      case 'paid':
        color = 'success';
        icon = <CheckCircleOutlined />;
        text = 'Đã thanh toán';
        break;
      case 'partial':
        color = 'warning';
        icon = <ExclamationCircleOutlined />;
        text = 'Thanh toán một phần';
        break;
      case 'pending':
        color = 'default';
        icon = <ClockCircleOutlined />;
        text = 'Chưa thanh toán';
        break;
      default:
        color = 'default';
        icon = <ClockCircleOutlined />;
        text = 'Chưa xác định';
    }
  }

  return (
    <Tooltip title={`${amount?.toLocaleString('vi-VN')}/${total?.toLocaleString('vi-VN')} VND`}>
      <Tag color={color} icon={icon}>
        {text}
      </Tag>
    </Tooltip>
  );
};

export default PaymentStatusTag; 