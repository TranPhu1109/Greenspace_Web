import React from 'react';
import { Card, Descriptions } from 'antd';
import { 
  UserOutlined, PhoneOutlined, 
  MailOutlined, HomeOutlined 
} from '@ant-design/icons';
import './CustomerInfoSection.scss';

const CustomerInfoSection = ({ customer }) => {
  console.log("CustomerInfoSection received:", customer);
  
  if (!customer) {
    console.error("No customer data provided to CustomerInfoSection");
    return <Card title="Thông tin khách hàng">Không có dữ liệu</Card>;
  }

  return (
    <Card title="Thông tin khách hàng" className="customer-info-section">
      <Descriptions column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label={<><UserOutlined /> Họ tên</>}>
          {customer.name}
        </Descriptions.Item>
        <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
          {customer.phone}
        </Descriptions.Item>
        <Descriptions.Item label={<><MailOutlined /> Email</>}>
          {customer.email}
        </Descriptions.Item>
        <Descriptions.Item label={<><HomeOutlined /> Địa chỉ</>}>
          {customer.address}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default CustomerInfoSection; 