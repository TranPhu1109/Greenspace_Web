import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import './NotFound.scss';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn đang tìm kiếm không tồn tại."
        extra={[
          <Button 
            type="primary" 
            key="home" 
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>,
          <Button 
            key="back" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>,
        ]}
      />
      <div className="not-found-illustration">
        <img src="/images/404-illustration.svg" alt="Page not found" />
      </div>
    </div>
  );
};

export default NotFoundPage; 