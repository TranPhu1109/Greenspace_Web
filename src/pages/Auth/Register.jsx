import { useState } from 'react';
import { Input, Checkbox, Button, Form, message, Typography, Card, Progress } from 'antd';
import { GoogleOutlined, LockOutlined, MailOutlined, UserOutlined, ArrowLeftOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Auth.scss';
import logoImage from '../../assets/logo.png';
import loginBg from '../../assets/login.png';
import useAuthStore from '../../stores/useAuthStore';

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  // Lấy returnUrl và actionType từ state (nếu có)
  const returnUrl = location.state?.returnUrl || "/home";
  const actionType = location.state?.actionType;

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
      message.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
      
      // Chuyển đến trang đăng nhập với returnUrl để sau khi đăng nhập có thể quay lại
      navigate('/login', { 
        state: { 
          returnUrl, 
          actionType,
          fromRegister: true 
        } 
      });
    } catch (error) {
      const errorMessage = error.response?.data?.error || '';
      
      if (errorMessage.includes('EMAIL_EXISTS') || errorMessage === 'Error: RegisterUserCommand_email is duplicate!') {
        // Hiển thị lỗi trực tiếp trên trường email
        form.setFields([
          {
            name: 'email',
            errors: ['Email này đã được sử dụng. Vui lòng dùng email khác.']
          }
        ]);
      } else if (errorMessage === 'Error: RegisterUserCommand_phone is duplicate!') {
        // Hiển thị lỗi trực tiếp trên trường phone
        form.setFields([
          {
            name: 'phone',
            errors: ['Số điện thoại này đã được sử dụng. Vui lòng dùng số điện thoại khác.']
          }
        ]);
      } else {
        message.error('Đăng ký thất bại: ' + (
          error.response?.data?.error === 'Error: RegisterUserCommand_email is duplicate!'
            ? 'Số điện thoại này đã được sử dụng. Vui lòng dùng số điện thoại khác.'
            : error.response?.data?.error === 'Error: RegisterUserCommand_phone is duplicate!'
              ? 'Email này đã được sử dụng. Vui lòng dùng email khác.'
              : error.response?.data?.error || error.message
        ));
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
                    { pattern: /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/, 
                      message: 'Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng số điện thoại Việt Nam' }
                  ]}
                >
                  <Input 
                    prefix={<PhoneOutlined className="site-form-item-icon" />} 
                    placeholder="Ví dụ: 0912345678 hoặc +84912345678" 
                    size="large"
                    className="auth-input"
                  />
                </Form.Item>
                
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                    { 
                      pattern: /^(?=.*[!@#$%^&*(),.?":{}|<>])/,
                      message: 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt!'
                    }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined className="site-form-item-icon" />} 
                    placeholder="Nhập mật khẩu" 
                    size="large"
                    className="auth-input"
                    onChange={(e) => {
                      const password = e.target.value;
                      const hasMinLength = password.length >= 8;
                      const hasSpecialChar = /^(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password);
                      const hasNumber = /\d/.test(password);
                      const hasUpperCase = /[A-Z]/.test(password);
                      const hasLowerCase = /[a-z]/.test(password);
                      
                      const strength = [
                        hasMinLength,
                        hasSpecialChar,
                        hasNumber,
                        hasUpperCase,
                        hasLowerCase
                      ].filter(Boolean).length;
                      
                      setPasswordStrength(strength);
                    }}
                  />
                </Form.Item>
                {passwordStrength > 0 && (
                  <div style={{ marginTop: -20, marginBottom: 20 }}>
                    <Progress 
                      percent={passwordStrength * 20} 
                      size="small"
                      status={passwordStrength < 3 ? "exception" : passwordStrength < 5 ? "normal" : "success"}
                      format={() => {
                        if (passwordStrength === 0) return "Rất yếu";
                        if (passwordStrength === 1) return "Yếu";
                        if (passwordStrength === 2) return "Trung bình";
                        if (passwordStrength === 3) return "Khá";
                        if (passwordStrength === 4) return "Mạnh";
                        return "Rất mạnh";
                      }}
                    />
                    <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                      Mật khẩu cần có: ít nhất 8 ký tự, 1 ký tự đặc biệt, 1 số, 1 chữ hoa và 1 chữ thường
                    </div>
                  </div>
                )}
                
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