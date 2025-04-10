import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/useAuthStore';

const UserInfoCard = ({ onUserInfoChange }) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const { user, updateUser } = useAuthStore();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        phone: user.phone,
        address: user.address,
        email: user.email
      });
    }
  }, [user, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('Updating user info:', values);
      
      // Update user in store
      updateUser(values);
      
      // Notify parent component
      if (onUserInfoChange) {
        onUserInfoChange(values);
      }

      setIsEditing(false);
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating user info:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin!');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  return (
    <Card 
      title="Thông tin người đặt" 
      className="user-info-card"
      extra={
        !isEditing ? (
          <Button type="link" onClick={handleEdit}>
            Chỉnh sửa
          </Button>
        ) : null
      }
    >
      <Form
        form={form}
        layout="vertical"
        disabled={!isEditing}
      >
        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="Nhập họ và tên"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="Nhập email"
            disabled={true} // Email cannot be changed
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
          ]}
        >
          <Input 
            prefix={<PhoneOutlined />} 
            placeholder="Nhập số điện thoại"
          />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
        >
          <Input 
            prefix={<EnvironmentOutlined />} 
            placeholder="Nhập địa chỉ"
          />
        </Form.Item>

        {isEditing && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </div>
        )}
      </Form>
    </Card>
  );
};

export default UserInfoCard; 