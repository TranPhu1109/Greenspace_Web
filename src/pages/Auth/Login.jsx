import { useState } from 'react';
import { Input, Checkbox, Button, Form, message, Typography, Card } from 'antd';
import { GoogleOutlined, LockOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.scss';
import logoImage from '../../assets/logo.png';
import loginBg from '../../assets/login.png';
import useAuthStore from '../../stores/useAuthStore';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    const { email, password, rememberMe } = values;
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      message.success('Đăng nhập thành công');
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      message.error('Đăng nhập thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Xử lý đăng nhập bằng Google
    console.log('Login with Google');
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
              <Title level={2} className="auth-title">Đăng nhập</Title>

                {/* <img src={logoImage} alt="GreenSpace Logo" className="auth-logo-small" /> */}
              </div>
              
              <Text className="auth-subtitle">Chào mừng bạn quay trở lại với GreenSpace</Text>
              
              <Form
                form={form}
                name="login"
                className="login-form"
                initialValues={{ rememberMe: false }}
                onFinish={handleLogin}
                layout="vertical"
                style={{ maxWidth: '100%' }}
              >
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
                  name="password"
                  label={
                    <div className="password-header">
                      <span>Mật khẩu</span>
                      <Link to="/forgot-password" className="forgot-password">Quên mật khẩu?</Link>
                    </div>
                  }
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined className="site-form-item-icon" />} 
                    placeholder="Nhập mật khẩu" 
                    size="large"
                    className="auth-input"
                  />
                </Form.Item>
                
                <Form.Item name="rememberMe" valuePropName="checked">
                  <Checkbox className="remember-checkbox">Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="login-button" 
                    block 
                    size="large"
                    loading={loading}
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>
                
                <div className="divider-container">
                  <div className="divider-line"></div>
                  <span className="divider-text">Hoặc</span>
                  <div className="divider-line"></div>
                </div>
                
                <Button 
                  icon={<GoogleOutlined />} 
                  onClick={handleGoogleLogin} 
                  className="google-button"
                  block
                  size="large"
                >
                  Đăng nhập với Google
                </Button>
                
                <div className="auth-footer">
                  <Text>Bạn chưa có tài khoản? </Text>
                  <Link to="/register" className="register-link">Đăng ký ngay</Link>
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

export default Login;