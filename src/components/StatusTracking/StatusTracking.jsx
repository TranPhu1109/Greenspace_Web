import React from 'react';
import { Steps } from 'antd';
import './StatusTracking.scss';

const StatusTracking = ({ currentStatus }) => {
  const orderStatuses = [
    { status: 'Pending', title: 'Chờ xác nhận' },
    { status: 'ConsultingAndSketching', title: 'Tư vấn & Phác thảo' },
    { status: 'DeterminingDesignPrice', title: 'Đang xác định giá thiết kế' },
    { status: 'WaitDeposit', title: 'Chờ đặt cọc' },
    { status: 'DepositSuccessful', title: 'Đã ký hợp đồng và đặt cọc 50% giá thiết  kế' },
    { status: 'AssignToDesigner', title: 'Thiết kế đang được Designer thực hiện' },
    { status: 'DeterminingMaterialPrice', title: 'Bản vẽ hoàn chỉnh đã hoàn thành, đang xác định giá vật liệu' },
    { status: 'DoneDesign', title: 'Bản vẽ thiết kế và danh sách vật liệu đã hoàn tất' },
    { status: 'PaymentSuccess', title: 'Thanh toán thành công 50% giá thiết kế còn lại và 100% giá vật liệu' },
    { status: 'Processing', title: 'Đang xử lý đơn hàng' },
    { status: 'PickedPackageAndDelivery', title: 'Đơn hàng đang được giao tới bạn' },
    { status: 'DeliveryFail', title: 'Giao hàng thất bại' },
    { status: 'ReDelivery', title: 'Giao hàng lại' },
    { status: 'DeliveredSuccessfully', title: 'Giao hàng thành công' },
    { status: 'CompletedOrder', title: 'Hoàn thành' },
    { status: 'OrderCancelled', title: 'Đã hủy' }
  ];

  // Find the current status index
  const currentStatusIndex = orderStatuses.findIndex(s => s.status === currentStatus);

  // Create items for Steps component with proper status
  const items = orderStatuses.map((status, index) => {
    let stepStatus = 'wait'; // Default status is wait
    
    if (index < currentStatusIndex) {
      // All previous steps are completed
      stepStatus = 'finish';
    } else if (index === currentStatusIndex) {
      // Current step is in process
      stepStatus = currentStatus === 'OrderCancelled' ? 'error' : 'process';
    }
    
    return {
      title: status.title,
      status: stepStatus
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
