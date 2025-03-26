import { useState } from 'react';
import { Input, Checkbox, Button, Form, message, Typography, Card } from 'antd';
import { GoogleOutlined, LockOutlined, MailOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.scss';
import logoImage from '../../assets/logo.png';
import loginBg from '../../assets/login.png';
import useAuthStore from '../../stores/useAuthStore';

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    const { name, email, password } = values;
    
    if (!values.agreeTerms) {
      message.error('Bạn phải đồng ý với điều khoản và điều kiện');
      return;
    }
    
    setLoading(true);
    try {
      await register(name, email, password);
      message.success('Đăng ký thành công');
      navigate('/login');
    } catch (error) {
      console.error('Register failed:', error);
      message.error('Đăng ký thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    // Xử lý đăng ký bằng Google
    console.log('Register with Google');
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
                <Title level={2} className="auth-title">Đăng ký</Title>
                {/* <img src={logoImage} alt="GreenSpace Logo" className="auth-logo-small" /> */}
              </div>
              
              
              <Text className="auth-subtitle">Tạo tài khoản để trải nghiệm dịch vụ của GreenSpace</Text>
              
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
                </Button>
                
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