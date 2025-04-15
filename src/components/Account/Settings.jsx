import React, { useState } from 'react';
import { Card, Form, Input, Button, Divider, message, Alert, Row, Col } from 'antd';
import { LockOutlined, SafetyOutlined, KeyOutlined } from '@ant-design/icons';
import { auth } from '../../firebase/config';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      // Reauthenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email,
        values.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, values.newPassword);
      
      message.success('Đổi mật khẩu thành công');
      form.resetFields();
    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.code === 'auth/wrong-password') {
        message.error('Mật khẩu hiện tại không đúng');
      } else if (error.code === 'auth/weak-password') {
        message.error('Mật khẩu mới quá yếu. Vui lòng chọn mật khẩu mạnh hơn');
      } else {
        message.error('Có lỗi xảy ra khi đổi mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Cài đặt tài khoản" className="settings-card">
      <div className="settings-container">
        <h3 className="section-title">
          <KeyOutlined /> Đổi mật khẩu
        </h3>
        
        <Alert
          message="Lưu ý về bảo mật"
          description="Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
          type="info"
          showIcon
          icon={<SafetyOutlined />}
          style={{ marginBottom: 24 }}
        />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePasswordChange}
          className="settings-form"
        >
          <Row gutter={24}>
            <Col xs={24} md={16} lg={12}>
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Nhập mật khẩu mới"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Xác nhận mật khẩu mới"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} className="submit-button">
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Card>
  );
};

export default Settings;