import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';

const VNPayCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleVNPayResponse = () => {
      const responseCode = searchParams.get('vnp_ResponseCode');
      const amount = parseInt(searchParams.get('vnp_Amount')) / 100; // Convert from VNPay amount (x100)
      
      if (responseCode === '00') {
        // Thanh toán thành công
        message.success({
          content: `Nạp tiền thành công: ${amount.toLocaleString('vi-VN')} VNĐ`,
          duration: 5
        });
        // Chuyển về trang ví sau 1 giây
        setTimeout(() => {
          navigate('/userwallets');
        }, 1000);
      } else {
        // Thanh toán thất bại
        message.error({
          content: 'Nạp tiền thất bại. Vui lòng thử lại sau.',
          duration: 5
        });
        // Chuyển về trang ví sau 1 giây
        setTimeout(() => {
          navigate('/userwallets');
        }, 1000);
      }
    };

    handleVNPayResponse();
  }, [searchParams, navigate]);

  return null; // Component này không cần render UI
};

export default VNPayCallback; 