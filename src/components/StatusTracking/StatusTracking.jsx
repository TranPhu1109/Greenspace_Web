import React from 'react';
import { Steps } from 'antd';
import './StatusTracking.scss';
import { CloseCircleOutlined } from '@ant-design/icons';

const StatusTracking = ({ currentStatus }) => {
  const orderStatuses = [
    { status: 'Pending', title: 'Chờ xác nhận' },
    { status: 'Processing', title: 'Đang xử lý đơn hàng' },
    { status: 'DeliveryFail', title: 'Giao hàng thất bại' },
    { status: 'ReDelivery', title: 'Giao hàng lại' },
    { status: 'Installing', title: 'Đang lắp đặt' },
    { status: 'DoneInstalling', title: 'Hoàn tất lắp đặt' },
    { status: 'ReInstall', title: 'Lắp đặt lại' },
    { status: 'Successfully', title: 'Hoàn tất đơn hàng' }
  ];

  const visibleStatuses = currentStatus === "Successfully"
    ? orderStatuses.filter(s => s.status !== "ReInstall")
    : orderStatuses;

  // Find the current status index
  const currentStatusIndex = visibleStatuses.findIndex(s => s.status === currentStatus);

  // Create items for Steps component with proper status
  const items = visibleStatuses.map((status, index) => {
    let stepStatus = 'wait'; // Default status is wait
    let icon = undefined;

    if (index < currentStatusIndex) {
      stepStatus = 'finish';
    } else if (index === currentStatusIndex) {
      if (currentStatus === 'OrderCancelled' || currentStatus === 'DeliveryFail') {
        stepStatus = 'error';
        icon = <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      } else {
        stepStatus = 'process';
      }
    }

    return {
      title: status.title,
      status: stepStatus,
      icon,
    };
  });

  return (
    <div className="status-tracking">
      <Steps
        direction="vertical"
        size="small"
        current={currentStatusIndex}
        items={items}
      />
    </div>
  );
};

export default StatusTracking;
