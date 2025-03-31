import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Space, Upload, message, Descriptions, Tag, Statistic, Alert, Result } from 'antd';
import { UploadOutlined, CheckCircleOutlined, DollarOutlined, QrcodeOutlined, CopyOutlined } from '@ant-design/icons';
import { paymentTypes } from '../../mockData/templateOrders';
import './DepositSection.scss';
import dayjs from 'dayjs';

const DepositSection = ({ order, onUpdateStatus }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [paymentStatus, setPaymentStatus] = useState('waiting'); // waiting, processing, success
  const [countdown, setCountdown] = useState(30); // Đếm ngược 30 giây

  const calculatePayments = () => {
    const totalAmount = order.prices.totalCost;
    const depositAmount = totalAmount * paymentTypes.deposit.amount;
    const finalAmount = totalAmount * paymentTypes.final.amount;

    return {
      total: totalAmount,
      deposit: depositAmount,
      final: finalAmount
    };
  };

  // Giả lập quá trình thanh toán tự động
  useEffect(() => {
    if (paymentStatus === 'processing') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handlePaymentSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentStatus]);

  const handleStartPayment = () => {
    setPaymentStatus('processing');
    message.info('Đang xử lý thanh toán, vui lòng đợi...');
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      const payments = calculatePayments();
      const updatedOrder = {
        ...order,
        payments: {
          ...order.payments,
          deposit: {
            amount: payments.deposit,
            status: 'paid',
            date: new Date().toISOString(),
            transactionId: `TXN${Date.now()}`,
            method: 'bank_transfer'
          }
        },
        status: 'material_selecting',
        timeline: [
          ...order.timeline,
          {
            date: new Date().toISOString(),
            status: 'deposit_paid',
            description: `Đã xác nhận đặt cọc ${payments.deposit.toLocaleString('vi-VN')}đ`
          }
        ]
      };

      await onUpdateStatus(updatedOrder);
      setPaymentStatus('success');
      message.success('Đã xác nhận thanh toán đặt cọc thành công');
    } catch (error) {
      message.error('Có lỗi xảy ra khi xác nhận đặt cọc');
      setPaymentStatus('waiting');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmFinalPayment = async () => {
    setLoading(true);
    try {
      const payments = calculatePayments();
      const updatedOrder = {
        ...order,
        payments: {
          ...order.payments,
          final: {
            amount: payments.final,
            status: 'paid',
            date: new Date().toISOString(),
            transactionId: `TXN${Date.now()}`,
            method: 'bank_transfer'
          }
        },
        status: 'completed',
        timeline: [
          ...order.timeline,
          {
            date: new Date().toISOString(),
            status: 'completed',
            description: 'Đã hoàn tất thanh toán và giao hàng'
          }
        ]
      };

      await onUpdateStatus(updatedOrder);
      message.success('Đã xác nhận thanh toán cuối cùng');
    } catch (error) {
      message.error('Có lỗi xảy ra khi xác nhận thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const payments = calculatePayments();
  const paymentInfo = [
    { label: 'Ngân hàng', value: 'Vietcombank' },
    { label: 'Số tài khoản', value: '1234567890' },
    { label: 'Chủ tài khoản', value: 'CÔNG TY TNHH GREEN SPACE' },
    { label: 'Nội dung CK', value: `GS-${order.orderNumber}` }
  ];

  const renderPaymentContent = () => {
    if (paymentStatus === 'waiting') {
      return (
        <div className="payment-content">
          <Alert
            message="Vui lòng chuyển khoản theo thông tin dưới đây"
            description="Hệ thống sẽ tự động xác nhận khi nhận được thanh toán"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <div className="payment-qr">
            <div className="qr-code">
              <QrcodeOutlined style={{ fontSize: 120 }} />
              <p>Quét mã QR để thanh toán</p>
            </div>
            
            <div className="payment-details">
              <Descriptions column={1} bordered>
                {paymentInfo.map((item, index) => (
                  <Descriptions.Item 
                    key={index} 
                    label={item.label}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    <Space>
                      {item.value}
                      <Button 
                        icon={<CopyOutlined />} 
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(item.value);
                          message.success('Đã sao chép');
                        }}
                      />
                    </Space>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </div>
          </div>
          
          <div className="payment-actions">
            <Button 
              type="primary" 
              size="large"
              icon={<DollarOutlined />}
              onClick={handleStartPayment}
            >
              Tôi đã thanh toán
            </Button>
          </div>
        </div>
      );
    } else if (paymentStatus === 'processing') {
      return (
        <div className="payment-processing">
          <Alert
            message="Đang xác nhận thanh toán"
            description={`Hệ thống đang kiểm tra giao dịch của bạn. Vui lòng đợi ${countdown} giây...`}
            type="warning"
            showIcon
          />
        </div>
      );
    } else if (paymentStatus === 'success') {
      return (
        <Result
          status="success"
          title="Thanh toán thành công!"
          subTitle={`Bạn đã đặt cọc thành công số tiền ${payments.deposit.toLocaleString('vi-VN')}đ`}
          extra={[
            <Button 
              type="primary" 
              key="console"
              onClick={() => window.location.reload()}
            >
              Tiếp tục
            </Button>
          ]}
        />
      );
    }
  };

  return (
    <Card title="Thanh toán đặt cọc" className="deposit-section">
      <div className="payment-info">
        <Descriptions bordered column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Tổng chi phí" span={2}>
            <Statistic
              value={payments.total}
              suffix="đ"
              groupSeparator=","
            />
          </Descriptions.Item>
          <Descriptions.Item label="Đặt cọc (70%)">
            <Statistic
              value={payments.deposit}
              suffix="đ"
              groupSeparator=","
              valueStyle={{ color: '#1890ff' }}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Thanh toán cuối (30%)">
            <Statistic
              value={payments.final}
              suffix="đ"
              groupSeparator=","
            />
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái đặt cọc" span={2}>
            <Tag color={order.payments?.deposit?.status === 'paid' ? 'success' : 'warning'}>
              {order.payments?.deposit?.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
            </Tag>
          </Descriptions.Item>
          {order.payments?.deposit?.status === 'paid' && (
            <Descriptions.Item label="Ngày đặt cọc" span={2}>
              {order.payments.deposit.date ? dayjs(order.payments.deposit.date).format('DD/MM/YYYY HH:mm') : 'N/A'}
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>

      {(!order.payments?.deposit?.status || order.payments?.deposit?.status !== 'paid') && (
        renderPaymentContent()
      )}

      {order.payments?.deposit?.status === 'paid' && 
       (!order.payments?.final?.status || order.payments?.final?.status !== 'paid') && (
        <Card title="Thanh toán cuối cùng" className="payment-form">
          <Alert
            message="Thanh toán phần còn lại"
            description="Vui lòng thanh toán phần còn lại sau khi nhận được vật liệu"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Button 
            type="primary"
            icon={<DollarOutlined />}
            onClick={handleConfirmFinalPayment}
          >
            Xác nhận đã thanh toán
          </Button>
        </Card>
      )}
    </Card>
  );
};

export default DepositSection; 