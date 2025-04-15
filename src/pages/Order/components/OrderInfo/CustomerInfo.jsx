import React from "react";
import { Card, Descriptions } from "antd";
import { UserOutlined } from "@ant-design/icons";

const CustomerInfo = ({ order }) => {
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
          <UserOutlined />
          Thông tin khách hàng
        </span>
      }
      style={{
        height: '100%',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Descriptions
        column={1}
        labelStyle={{ fontWeight: 'bold', fontSize: '15px' }}
        contentStyle={{ fontSize: '15px' }}
        size="middle"
      >
        <Descriptions.Item label="Tên khách hàng">
          {order?.userName || 'Đang tải...'}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {order?.email || 'Đang tải...'}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {order?.cusPhone || 'Đang tải...'}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">
          {order?.address?.replace(/\|/g, ', ') || 'Đang tải...'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default CustomerInfo; 