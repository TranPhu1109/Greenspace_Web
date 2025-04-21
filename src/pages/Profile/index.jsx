import React from 'react';
import { Layout, Typography, Tabs, Row, Col, Breadcrumb } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import Profile from '../../components/Account/Profile';
import Settings from '../../components/Account/Settings';
import useAuthStore from '../../stores/useAuthStore';
import './styles.scss';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;

const ProfilePage = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <Layout>
        <Header />
        <Content className="profile-page-container">
          <div className="profile-content no-auth">
            <Title level={3}>Vui lòng đăng nhập để xem thông tin tài khoản</Title>
            <Link to="/login" className="login-link">Đăng nhập ngay</Link>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Content className="profile-page-container">
        <div className="profile-content">
          <Breadcrumb className="profile-breadcrumb">
            <Breadcrumb.Item>
              <Link to="/"><HomeOutlined /> Trang chủ</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Thông tin tài khoản</Breadcrumb.Item>
          </Breadcrumb>
          
          <Row>
            <Col span={24}>
              <Title level={2} className="page-title">Thông tin tài khoản</Title>
            </Col>
          </Row>
          
          <Tabs 
            defaultActiveKey="profile" 
            className="profile-tabs"
            items={[
              {
                key: "profile",
                label: (
                  <span className="tab-label">
                    <UserOutlined />
                    Thông tin cá nhân
                  </span>
                ),
                children: <Profile />
              },
              {
                key: "settings",
                label: (
                  <span className="tab-label">
                    <LockOutlined />
                    Cài đặt tài khoản
                  </span>
                ),
                children: <Settings />
              }
            ]}
          />
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default ProfilePage; 