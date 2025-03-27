import { useState } from 'react';
import { Input, Checkbox, Button, Form, message, Typography, Card } from 'antd';
import { GoogleOutlined, LockOutlined, MailOutlined, UserOutlined, ArrowLeftOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.scss';
import logoImage from '../../assets/logo.png';
import loginBg from '../../assets/login.png';
import useAuthStore from '../../stores/useAuthStore';

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    if (!values.agreeTerms) {
      message.error('Bạn phải đồng ý với điều khoản và điều kiện');
      return;
    }
    
    setLoading(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        address: values.address || '',
        avatarUrl: ''
      });
      message.success('Đăng ký thành công');;
      navigate('/login');
    } catch (error) {
      console.error('Register failed:', error);
      if (error.response?.data?.error?.includes('EMAIL_EXISTS')) {
        message.error('Email này đã được sử dụng. Vui lòng dùng email khác.');
      } else {
        message.error('Đăng ký thất bại: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      message.success('Đăng ký thành công');
      navigate('/');
    } catch (error) {
      console.error('Google register failed:', error);
      message.error('Đăng ký thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-content">
            <div className="auth-form-section">
              <div className="auth-header">
                <Button 
                  type="dashed"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/')}
                  className="back-link"
                >
                  Trang chủ
                </Button>
                
                {/* <img src={logoImage} alt="GreenSpace Logo" className="auth-logo-small" /> */}
              </div>
              <div style={{ textAlign: 'center' }}>
              <Title level={2} className="auth-title">Đăng ký</Title>
              <Text className="auth-subtitle">Tạo tài khoản để trải nghiệm dịch vụ của GreenSpace</Text>
              </div>
              <Form
                form={form}
                name="register"
                className="register-form"
                onFinish={handleRegister}
                layout="vertical"
                style={{ maxWidth: '100%' }}
              >
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                  <Input 
                    prefix={<UserOutlined className="site-form-item-icon" />} 
                    placeholder="Nhập họ và tên" 
                    size="large"
                    className="auth-input"
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
                    prefix={<MailOutlined className="site-form-item-icon" />} 
                    placeholder="Nhập email" 
                    size="large"
                    className="auth-input"
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
                    prefix={<PhoneOutlined className="site-form-item-icon" />} 
                    placeholder="Nhập số điện thoại" 
                    size="large"
                    className="auth-input"
                  />
                </Form.Item>
                
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined className="site-form-item-icon" />} 
                    placeholder="Nhập mật khẩu" 
                    size="large"
                    className="auth-input"
                  />
                </Form.Item>
                
                <Form.Item
                  name="confirmPassword"
                  label="Nhập lại mật khẩu"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng nhập lại mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined className="site-form-item-icon" />} 
                    placeholder="Nhập lại mật khẩu" 
                    size="large"
                    className="auth-input"
                  />
                </Form.Item>
                
                <Form.Item name="agreeTerms" valuePropName="checked" style={{ marginBottom: '10px' }}>
                  <Checkbox className="terms-checkbox">
                    Tôi đồng ý với <Link to="/terms">điều khoản</Link> và <Link to="/privacy">điều kiện</Link>
                  </Checkbox>
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="register-button" 
                    block 
                    size="large"
                    loading={loading}
                  >
                    Đăng ký
                  </Button>
                </Form.Item>
{/*                 
                <div className="divider-container">
                  <div className="divider-line"></div>
                  <span className="divider-text">Hoặc</span>
                  <div className="divider-line"></div>
                </div>
                
                <Button 
                  icon={<GoogleOutlined />} 
                  onClick={handleGoogleRegister} 
                  className="google-button"
                  block
                  size="large"
                >
                  Đăng ký với Google
                </Button> */}
                
                <div className="auth-footer">
                  <Text>Bạn đã có tài khoản? </Text>
                  <Link to="/login" className="register-link">Đăng nhập ngay</Link>
                </div>
              </Form>
            </div>
            
            <div className="auth-image-section">
              <img src={logoImage} alt="GreenSpace Logo" className="auth-logo" />
              <div className="leaf-background" style={{ backgroundImage: `url(${loginBg})` }}></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;