import React, { useState } from 'react';
import { Card, Form, Input, Button, Avatar, Space, Descriptions } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const userData = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // API call to update profile will go here
      message.success('Cập nhật thông tin thành công');
      setIsEditing(false);
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title="Thông tin cá nhân"
      extra={
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Hủy' : 'Chỉnh sửa'}
        </Button>
      }
    >
      <div style={{ display: 'flex', marginBottom: 24, justifyContent: 'center' }}>
        <Avatar
          size={100}
          src={userData?.avatarUrl}
          style={{ backgroundColor: '#4caf50' }}
        >
          {!userData?.avatarUrl && userData?.name?.charAt(0).toUpperCase()}
        </Avatar>
      </div>
      
      {isEditing ? (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: userData?.name,
            email: userData?.email,
            phone: userData?.phone,
            address: userData?.address,
          }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu thay đổi
              </Button>
              <Button onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      ) : (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Họ và tên">{userData?.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{userData?.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{userData?.phone}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{userData?.address}</Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

export default Profile;