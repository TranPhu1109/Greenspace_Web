import React from 'react';
import { Modal, Typography, Button, Space } from 'antd';
import { ShoppingCartOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const LoginRequiredModal = ({ 
  isVisible, 
  onCancel, 
  actionType = 'cart',
  returnUrl = '/home'
}) => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login", { 
      state: { 
        returnUrl,
        actionType 
      } 
    });
    onCancel();
  };

  const goToRegister = () => {
    navigate("/register", { 
      state: { 
        returnUrl,
        actionType 
      } 
    });
    onCancel();
  };

  return (
    <Modal
      visible={isVisible}
      footer={null}
      onCancel={onCancel}
      width={400}
      className="login-modal"
      centered
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: '70px', color: '#4caf50', marginBottom: '20px' }}>
          <ShoppingCartOutlined />
        </div>
        <Title level={4} style={{ marginBottom: '20px' }}>
          Vui lòng đăng nhập để {actionType === 'cart' ? 'thêm sản phẩm vào giỏ hàng' : 'mua sản phẩm'}
        </Title>
        <Paragraph style={{ marginBottom: '30px' }}>
          Để tiếp tục giao dịch, bạn cần đăng nhập hoặc đăng ký tài khoản mới
        </Paragraph>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            size="large" 
            icon={<LoginOutlined />}
            onClick={goToLogin}
            style={{ 
              width: '100%', 
              height: '45px',
              backgroundColor: '#4caf50',
              borderColor: '#4caf50'
            }}
          >
            Đăng nhập
          </Button>
          <Button 
            size="large" 
            icon={<UserAddOutlined />}
            onClick={goToRegister}
            style={{ 
              width: '100%', 
              height: '45px'
            }}
          >
            Đăng ký tài khoản
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default LoginRequiredModal; 