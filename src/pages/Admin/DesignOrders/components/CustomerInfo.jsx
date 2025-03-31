import React from 'react';
import { 
  Descriptions, 
  Typography, 
  Card, 
  Button, 
  Space, 
  Row, 
  Col 
} from 'antd';
import { 
  PhoneOutlined, 
  MailOutlined, 
  UserOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const CustomerInfo = ({ customer }) => {
  if (!customer) return null;
  
  return (
    <div className="customer-info-container">
      <Row gutter={16}>
        <Col span={24}>
          <Descriptions 
            title="Thông tin khách hàng" 
            bordered 
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item label="Họ tên">
              {customer.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {customer.customerEmail}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {customer.customerPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {customer.customerAddress || 'Chưa cập nhật'}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
      
      <div className="contact-actions" style={{ marginTop: 16 }}>
        <Space>
          <Button type="primary" icon={<PhoneOutlined />}>
            Gọi điện
          </Button>
          <Button icon={<MailOutlined />}>
            Gửi email
          </Button>
          <Button icon={<UserOutlined />}>
            Xem hồ sơ
          </Button>
        </Space>
      </div>
      
      <Card title="Lịch sử đơn hàng" style={{ marginTop: 24 }}>
        <Text>Khách hàng chưa có đơn hàng nào khác.</Text>
      </Card>
    </div>
  );
};

export default CustomerInfo; 