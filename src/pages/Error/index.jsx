import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate, useRouteError } from 'react-router-dom';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import './Error.scss';

const ErrorPage = () => {
  const navigate = useNavigate();
  const error = useRouteError();
  
  // Xác định loại lỗi để hiển thị thông báo phù hợp
  const getErrorDetails = () => {
    if (error?.status === 404) {
      return {
        status: '404',
        title: 'Không tìm thấy trang',
        subTitle: 'Xin lỗi, trang bạn đang tìm kiếm không tồn tại.',
      };
    } else if (error?.status === 403) {
      return {
        status: '403',
        title: 'Không có quyền truy cập',
        subTitle: 'Xin lỗi, bạn không có quyền truy cập vào trang này.',
      };
    } else if (error?.status === 500) {
      return {
        status: '500',
        title: 'Lỗi máy chủ',
        subTitle: 'Xin lỗi, đã xảy ra lỗi từ phía máy chủ.',
      };
    } else {
      return {
        status: 'error',
        title: 'Đã xảy ra lỗi',
        subTitle: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
      };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="error-page">
      <Result
        status={errorDetails.status}
        title={errorDetails.title}
        subTitle={errorDetails.subTitle}
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
      {error && process.env.NODE_ENV === 'development' && (
        <div className="error-details">
          <h3>Chi tiết lỗi (chỉ hiển thị trong môi trường phát triển):</h3>
          <p>{error.message || 'Không có thông tin chi tiết về lỗi'}</p>
          {error.stack && (
            <pre className="error-stack">{error.stack}</pre>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorPage; 