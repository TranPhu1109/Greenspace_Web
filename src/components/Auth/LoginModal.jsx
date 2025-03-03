import { useState } from 'react';
import { Modal, Input, Checkbox, Button } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import './Auth.scss';
import logoImage from '../../assets/logo.png';
import loginBg from '../../assets/login.png';

const LoginModal = ({ visible, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Xử lý đăng nhập
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
          <h1 className="auth-title">Login</h1>
          
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <Input
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
          </div>
          
          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <a href="#" className="forgot-password">forgot password</a>
            </div>
            <Input.Password
              id="password"
              placeholder="Enter your password"
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
              Remember for 30 days
            </Checkbox>
          </div>
          
          <Button 
            type="primary" 
            block 
            onClick={handleLogin}
            className="login-button"
          >
            Login
          </Button>
          
          <div className="social-login">
            <Button 
              icon={<GoogleOutlined />} 
              onClick={handleGoogleLogin}
              className="google-button"
            >
              Sign in with Google
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