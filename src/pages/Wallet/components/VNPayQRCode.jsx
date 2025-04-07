import React, { useState } from 'react';
import { Modal, Button, Input, Form, message, Spin } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import api from '@/api/api';

const VNPayQRCode = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  const handleGenerateQR = async (values) => {
    try {
      setLoading(true);
      const amount = values.amount.replace(/\D/g, ''); // Loại bỏ tất cả ký tự không phải số
      
      const response = await api.post('/api/userwallets/create-qr-payment', {
        amount: parseInt(amount),
        orderInfo: 'Nạp tiền vào ví qua QR VNPay'
      });

      if (response.data?.qrCode) {
        setQrCode(response.data.qrCode);
      } else {
        message.error('Không thể tạo mã QR. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      message.error('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    // Loại bỏ tất cả ký tự không phải số
    const number = value.replace(/\D/g, '');
    // Format theo định dạng tiền Việt Nam
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <Modal
      title="Thanh toán bằng QR VNPay"
      open={visible}
      onCancel={() => {
        onCancel();
        setQrCode(null);
        form.resetFields();
      }}
      footer={null}
      width={400}
    >
      <div className="vnpay-qr-container">
        <Form
          form={form}
          onFinish={handleGenerateQR}
          layout="vertical"
        >
          <Form.Item
            name="amount"
            label="Số tiền nạp"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền' },
              {
                validator: (_, value) => {
                  const amount = parseInt(value?.replace(/\D/g, '') || '0');
                  if (amount < 10000) {
                    return Promise.reject('Số tiền tối thiểu là 10,000 VNĐ');
                  }
                  if (amount > 100000000) {
                    return Promise.reject('Số tiền tối đa là 100,000,000 VNĐ');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              placeholder="Nhập số tiền"
              suffix="VNĐ"
              onChange={(e) => {
                const { value } = e.target;
                const formattedValue = formatCurrency(value);
                form.setFieldsValue({ amount: formattedValue });
              }}
            />
          </Form.Item>

          {!qrCode && (
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<QrcodeOutlined />}
                loading={loading}
                block
              >
                Tạo mã QR
              </Button>
            </Form.Item>
          )}
        </Form>

        {loading && (
          <div className="qr-loading">
            <Spin tip="Đang tạo mã QR..." />
          </div>
        )}

        {qrCode && !loading && (
          <div className="qr-code-display">
            <img src={qrCode} alt="VNPay QR Code" />
            <p className="qr-instruction">
              Quét mã QR bằng ứng dụng ngân hàng để thanh toán
            </p>
            <Button
              onClick={() => {
                setQrCode(null);
                form.resetFields();
              }}
              block
            >
              Tạo mã QR mới
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VNPayQRCode; 