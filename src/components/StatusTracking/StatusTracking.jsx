import React from 'react';
import { Steps } from 'antd';
import './StatusTracking.scss';

const StatusTracking = ({ currentStatus }) => {
  const orderStatuses = [
    { status: 'Pending', title: 'Chờ xác nhận' },
    { status: 'ConsultingAndSketching', title: 'Tư vấn & Phác thảo' },
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

  return (
    <div className="status-tracking">
      <Steps
        direction="vertical"
        size="small"
        current={currentStatusIndex}
        items={orderStatuses.map((status, index) => ({
          title: status.title,
          status: index === currentStatusIndex 
            ? (currentStatus === 'OrderCancelled' ? 'error' : 'process')
            : 'wait',
          icon: currentStatus === 'OrderCancelled' ? null : undefined  // Remove check mark for cancelled orders
        }))}
      />
    </div>
  );
};

export default StatusTracking;
