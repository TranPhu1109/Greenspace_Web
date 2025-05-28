import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Result, Spin, Button } from 'antd';
import useWalletStore from '@/stores/useWalletStore';

const VNPayCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleVNPayResponse, loading, error } = useWalletStore();

  useEffect(() => {
    const processVNPayResponse = async () => {
      try {
        // Lấy URL hiện tại và thay thế domain
        const currentUrl = window.location.href;
        const apiUrl = import.meta.env.VITE_API_URL;
        const greenspaceUrl = import.meta.env.VITE_GREENSPACE_URL;

        const backendUrl = currentUrl
          .replace(`${greenspaceUrl}/userwallets/response`, `${apiUrl}/userwallets/vn-pay/response`);
          // .replace('http://localhost:5173/userwallets/response', 'http://localhost:8080/api/userwallets/vn-pay/response');
        
        // Xử lý response từ VNPay
        await handleVNPayResponse(backendUrl);
        
        // Nếu xử lý thành công, chuyển về trang ví
        setTimeout(() => {
          navigate('/userwallets');
        }, 2000);
      } catch (error) {
        console.error('Error processing VNPay response:', error);
      }
    };

    processVNPayResponse();
  }, [handleVNPayResponse, navigate, location]);

  const containerStyle = "flex items-center justify-center min-h-screen bg-gray-50";

  if (loading) {
    return (
      <div className={containerStyle}>
        <Spin size="large" tip="Đang xử lý giao dịch..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerStyle}>
        <Result
          status="error"
          title="Giao dịch thất bại"
          subTitle={error}
          extra={[
            <Button type="primary" key="console" onClick={() => navigate('/userwallets')}>
              Quay lại ví
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div className={containerStyle}>
      <Result
        status="success"
        title="Giao dịch thành công!"
        subTitle="Đang chuyển về trang ví..."
      />
    </div>
  );
};

export default VNPayCallback;