import React from "react";
import { Card, Timeline, Typography } from "antd";
import { 
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { format } from "date-fns";

const { Text } = Typography;

const OrderTimeline = ({ order, getStatusText, getStatusColor }) => {
  // If order is null, show loading state
  if (!order) {
    return (
      <Card
        title={
          <span style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#4caf50',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <HistoryOutlined />
            Lịch sử trạng thái
          </span>
        }
        style={{
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
        loading={true}
      />
    );
  }

  return (
    <Card
      title={
        <span style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#4caf50',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <HistoryOutlined />
          Lịch sử trạng thái
        </span>
      }
      style={{
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Timeline mode="left">
        {/* First item: Order Creation */}             
        <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
          <p style={{ fontSize: '15px', marginBottom: '4px' }}>Đơn hàng được tạo</p>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {order.creationDate ? format(new Date(order.creationDate), "dd/MM/yyyy HH:mm") : '...'}
          </Text>
        </Timeline.Item>

        {/* Process and display status history */}            
        {(() => {
          if (!order.statusHistory || order.statusHistory.length === 0) {
            // Show current status if no history available (fallback)
             return (
                <Timeline.Item color={getStatusColor(order.status)} dot={<ClockCircleOutlined />}>
                  <p style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '600' }}>
                    {getStatusText(order.status)}
                  </p>
                </Timeline.Item>
             );
          }

          const displayHistory = [];
          let lastDisplayedStatusText = "Đơn hàng được tạo"; 

          order.statusHistory.forEach(historyEntry => {
            const currentStatusText = getStatusText(historyEntry.status);
            // Display every entry from history
            displayHistory.push({
              text: currentStatusText, 
              color: getStatusColor(historyEntry.status),
              timestamp: historyEntry.timestamp,
              // Icon based on status (example: cancel icon)
              icon: historyEntry.status === 'OrderCancelled' || historyEntry.status === 14 
                    ? <CloseCircleOutlined style={{ fontSize: '16px' }}/> 
                    : <ClockCircleOutlined style={{ fontSize: '16px' }}/>
            });
          });

          return (
            <>
              {displayHistory.map((item, index) => (
                <Timeline.Item key={index} color={item.color} dot={item.icon}>
                  <p style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '600' }}>
                    {item.text}
                  </p>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                     {item.timestamp ? format(new Date(item.timestamp), "dd/MM/yyyy HH:mm") : '...'}
                  </Text>
                </Timeline.Item>
              ))}
            </>
          );
         })()}
      </Timeline>
    </Card>
  );
};

export default OrderTimeline; 