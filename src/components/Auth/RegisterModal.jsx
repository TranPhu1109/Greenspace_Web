import { useState } from 'react';
import { Modal, Input, Button, Checkbox } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import './Auth.scss';
import logoImage from '../../assets/logo.png';
import loginBg from '../../assets/login.png';

const RegisterModal = ({ visible, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleRegister = () => {
    // Xử lý đăng ký
    console.log('Register with:', { name, email, password, agreeTerms });
    // Sau khi đăng ký thành công, đóng modal
    onCancel();
  };

  const handleGoogleRegister = () => {
    // Xử lý đăng ký bằng Google
    console.log('Register with Google');
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
          <h1 className="auth-title">Register</h1>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
            />
          </div>
          
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
            <label htmlFor="password">Password</label>
            <Input.Password
              id="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Input.Password
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
            />
          </div>
          
          <div className="form-group">
            <Checkbox 
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="terms-checkbox"
            >
              I agree to the Terms of Service and Privacy Policy
            </Checkbox>
          </div>
          
          <Button 
            type="primary" 
            block 
            onClick={handleRegister}
            className="register-button"
            disabled={!agreeTerms}
          >
            Create Account
          </Button>
          
          <div className="social-login">
            <Button 
              icon={<GoogleOutlined />} 
              onClick={handleGoogleRegister}
              className="google-button"
            >
              Sign up with Google
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

export default RegisterModal; 