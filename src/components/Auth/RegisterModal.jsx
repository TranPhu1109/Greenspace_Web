import { useState } from 'react';
import { Modal, Input, Button, Checkbox } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import './Auth.scss';
import logoImage from '../../assets/logo.png';
import loginBg from '../../assets/login.png';
import useAuthStore from '../../stores/useAuthStore';

const RegisterModal = ({ visible, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const register = useAuthStore((state) => state.register);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      message.error('Mật khẩu không khớp');
      return;
    }
    if (!agreeTerms) {
      message.error('Bạn phải đồng ý với điều khoản và điều kiện');
    }
    try {
      await register(name, email, password);
      message.success('Đăng ký thành công');
      onCancel();
    } catch (error) {
      message.error('Đăng ký thất bại' + (error.response?.data?.message || error.message));
    }
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
          <h1 className="auth-title">Đăng ký</h1>
          
          <div className="form-group">
            <label htmlFor="name">Họ và tên</label>
            <Input
              id="name"
              placeholder="Nhập họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
            />
          </div>
          
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
            <label htmlFor="password">Mật khẩu</label>
            <Input.Password
              id="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
            <Input.Password
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu"
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
              Tôi đồng ý với điều khoản và điều kiện
            </Checkbox>
          </div>
          
          <Button 
            type="primary" 
            block 
            onClick={handleRegister}
            className="register-button"
            disabled={!agreeTerms}
          >
            Đăng ký
          </Button>
          
          <div className="social-login">
            <Button 
              icon={<GoogleOutlined />} 
              onClick={handleGoogleRegister}
              className="google-button"
            >
              Đăng ký với Google
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