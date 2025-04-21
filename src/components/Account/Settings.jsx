import React, { useState } from 'react';
import { Card, Form, Input, Button, Divider, message, Alert, Row, Col, Steps } from 'antd';
import { LockOutlined, SafetyOutlined, KeyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { auth } from '../../firebase/config';
import useAuthStore from '../../stores/useAuthStore';

const { Step } = Steps;

const Settings = () => {
  const [form] = Form.useForm();
  const [newPasswordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { login, updatePassword } = useAuthStore();

  // Verify current password using login function
  const verifyCurrentPassword = async (values) => {
    setLoading(true);
    try {
      const user = useAuthStore.getState().user;
      if (!user || !user.email) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Use login function to verify password
      await login(user.email, values.currentPassword);
      
      // If login succeeds, move to next step
      message.success('Xác minh mật khẩu thành công');
      setCurrentStep(1);
    } catch (error) {
      console.error('Password verification error:', error);
      message.error('Mật khẩu hiện tại không đúng');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change using API
  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      // Call updatePassword function from useAuthStore
      await updatePassword(values.newPassword);
      
      // API call was successful, show success message
      message.success('Đổi mật khẩu thành công');
      newPasswordForm.resetFields();
      form.resetFields(); // Reset current password form as well
      setCurrentStep(0); // Reset to first step
      
      // Try to update Firebase password as well but handle separately
      try {
        const user = auth.currentUser;
        if (user) {
          await user.updatePassword(values.newPassword);
        }
      } catch (firebaseError) {
        // Log Firebase error but don't show to user since API update was successful
        console.error('Firebase password update error:', firebaseError);
      }
    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        setCurrentStep(0);
      } else if (error.code === 'auth/weak-password') {
        message.error('Mật khẩu mới quá yếu. Vui lòng chọn mật khẩu mạnh hơn');
      } else {
        message.error('Có lỗi xảy ra khi đổi mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentPasswordStep = () => (
    <>
      <Alert
        message="Xác minh mật khẩu hiện tại"
        description="Vui lòng nhập mật khẩu hiện tại để xác minh danh tính của bạn."
        type="info"
        showIcon
        icon={<LockOutlined />}
        style={{ marginBottom: 24 }}
      />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={verifyCurrentPassword}
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

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="submit-button">
                Xác minh
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );

  const renderNewPasswordStep = () => (
    <>
      <Alert
        message="Lưu ý về bảo mật"
        description="Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
        type="info"
        showIcon
        icon={<SafetyOutlined />}
        style={{ marginBottom: 24 }}
      />
      
      <Form
        form={newPasswordForm}
        layout="vertical"
        onFinish={handlePasswordChange}
        className="settings-form"
      >
        <Row gutter={24}>
          <Col xs={24} md={16} lg={12}>
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
              <Button 
                style={{ marginLeft: 8 }} 
                onClick={() => setCurrentStep(0)}
              >
                Quay lại
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );

  return (
    <Card title="Cài đặt tài khoản" className="settings-card">
      <div className="settings-container">
        <h3 className="section-title">
          <KeyOutlined /> Đổi mật khẩu
        </h3>
{/*         
        <Steps current={currentStep} className="password-change-steps">
          <Step title="Xác minh" description="Nhập mật khẩu hiện tại" icon={<LockOutlined />} />
          <Step title="Cập nhật" description="Đặt mật khẩu mới" icon={<CheckCircleOutlined />} />
        </Steps> */}
        
        <div className="step-content" style={{ marginTop: 24 }}>
          {currentStep === 0 ? renderCurrentPasswordStep() : renderNewPasswordStep()}
        </div>
      </div>
    </Card>
  );
};

export default Settings;