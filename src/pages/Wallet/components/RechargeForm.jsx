import React, { useState } from 'react';
import { Form, Button, Input, Row, Col, Typography, message } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import useWalletStore from '@/stores/useWalletStore';

const { Text } = Typography;

const RechargeForm = () => {
  const [form] = Form.useForm();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [displayAmount, setDisplayAmount] = useState('');

  const { createVNPayQR, loading } = useWalletStore();

  const predefinedAmounts = [
    { value: 100000, label: "100,000đ" },
    { value: 200000, label: "200,000đ" },
    { value: 500000, label: "500,000đ" },
    { value: 1000000, label: "1,000,000đ" },
  ];

  const formatCurrency = (value) => {
    if (!value) return '';
    const number = parseInt(value.replace(/\D/g, ''), 10);
    return number.toLocaleString('vi-VN');
  };

  const handleAmountSelect = (value) => {
    setSelectedAmount(value);
    setDisplayAmount(formatCurrency(value.toString()));
    form.setFieldsValue({ amount: value });
    form.validateFields(['amount']);
  };

  const handleCustomAmount = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numberValue = rawValue ? parseInt(rawValue, 10) : '';
    
    setSelectedAmount(numberValue);
    setDisplayAmount(formatCurrency(rawValue));
    form.setFieldsValue({ amount: numberValue });
    
    if (rawValue) {
      form.validateFields(['amount']);
    }
  };

  const validateAmount = (_, value) => {
    const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;

    if (!numericValue && numericValue !== 0) {
      return Promise.reject('Vui lòng nhập số tiền');
    } else if (numericValue < 50000) {
      return Promise.reject('Số tiền tối thiểu là 50,000đ');
    } else {
      return Promise.resolve();
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = await createVNPayQR(values.amount);
      window.location.href = url; // Chuyển hướng đến trang thanh toán VNPay
    } catch (error) {
      message.error('Không thể tạo giao dịch. Vui lòng thử lại sau.');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Chọn số tiền muốn nạp"
        name="amount"
        rules={[{ validator: validateAmount }]}
        validateTrigger="onChange"
      >
        <div className="amount-selection">
          <Row gutter={[16, 16]}>
            {predefinedAmounts.map((amount) => (
              <Col span={12} key={amount.value}>
                <Button
                  className={`amount-button ${
                    selectedAmount === amount.value ? "selected" : ""
                  }`}
                  onClick={() => handleAmountSelect(amount.value)}
                >
                  {amount.label}
                </Button>
              </Col>
            ))}
          </Row>
          <div className="custom-amount">
            <Input
              placeholder="Nhập số tiền khác"
              value={displayAmount}
              onChange={handleCustomAmount}
              addonAfter="VNĐ"
            />
          </div>
        </div>
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          block 
          size="large"
          icon={<WalletOutlined />}
          loading={loading}
        >
          Nạp tiền
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RechargeForm; 