import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Spin } from 'antd';
import useWalletStore from '@/stores/useWalletStore';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handlePaymentCallback, loading } = useWalletStore();

  useEffect(() => {
    const processPayment = async () => {
      // Convert searchParams to object
      const queryParams = Object.fromEntries(searchParams.entries());
      
      try {
        const success = await handlePaymentCallback(queryParams);
        if (success) {
          // Chờ 3 giây rồi chuyển về trang ví
          setTimeout(() => {
            navigate('/wallet');
          }, 3000);
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        // Chuyển về trang ví sau 3 giây nếu có lỗi
        setTimeout(() => {
          navigate('/wallet');
        }, 3000);
      }
    };

    processPayment();
  }, [searchParams, handlePaymentCallback, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Spin size="large" />
        <p>Đang xử lý giao dịch...</p>
      </div>
    );
  }

  const isSuccess = searchParams.get('vnp_ResponseCode') === '00' && 
                   searchParams.get('vnp_TransactionStatus') === '00';

  return (
    <Result
      status={isSuccess ? 'success' : 'error'}
      title={isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
      subTitle={
        isSuccess 
          ? 'Số dư của bạn đã được cập nhật. Đang chuyển về trang ví...'
          : 'Có lỗi xảy ra trong quá trình thanh toán. Đang chuyển về trang ví...'
      }
    />
  );
};

export default PaymentCallback; 