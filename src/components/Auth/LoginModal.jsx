import { useState } from 'react';
import { Modal, Input, Checkbox, Button } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import './Auth.scss';
import logoImage from '../../assets/logo.png';
import loginBg from '../../assets/login.png';
import useAuthStore from '../../stores/useAuthStore';
import { message } from 'antd';

const LoginModal = ({ visible, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    // Xử lý đăng nhập
    try {
      await login(email, password, rememberMe);
      message.success('Đăng nhập thành công');
      onCancel();
    } catch (error) {
      console.error('Login failed:', error);
      message.error('Đăng nhập thất bại' + (error.response?.data?.message || error.message));
    }
    console.log('Login with:', { email, password, rememberMe });
    // Sau khi đăng nhập thành công, đóng modal
    onCancel();
  };

  const handleGoogleLogin = () => {
    // Xử lý đăng nhập bằng Google
    console.log('Login with Google');
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="auth-modal"
      closable={true}
      maskClosable={true}
    >
      <div className="auth-container">
        <div className="auth-form">
          <h1 className="auth-title">Đăng nhập</h1>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
          </div>
          
          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Mật khẩu</label>
              <a href="#" className="forgot-password">Quên mật khẩu</a>
            </div>
            <Input.Password
              id="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
          </div>
          
          <div className="form-group">
            <Checkbox 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="remember-checkbox"
            >
              Ghi nhớ tài khoản
            </Checkbox>
          </div>
          
          <Button 
            type="primary" 
            block 
            onClick={handleLogin}
            className="login-button"
          >
            Đăng nhập
          </Button>
          
          <div className="social-login">
            <Button 
              icon={<GoogleOutlined />} 
              onClick={handleGoogleLogin}
              className="google-button"
            >
              Đăng nhập với Google
            </Button>
          </div>
        </div>
        
        <div className="auth-image">
          <img src={logoImage} alt="GreenSpace Logo" className="auth-logo" />
          <div className="leaf-background" style={{ backgroundImage: `url(${loginBg})` }}></div>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal; 