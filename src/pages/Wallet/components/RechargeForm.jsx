import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Radio,
  Spin,
  Row,
  Col,
  Card,
  Typography,
  Space,
  message,
} from "antd";
import {
  QrcodeOutlined,
  SafetyCertificateOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react";
import useWalletStore from "@/stores/useWalletStore";
import "../styles/RechargeForm.scss";
import { QRPay } from "vietnam-qr-pay";

const { Title, Text } = Typography;

const RechargeForm = () => {
  const [form] = Form.useForm();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const [qrData, setQrData] = useState("");
  const createVNPayQR = useWalletStore((state) => state.createVNPayQR);
  const loading = useWalletStore((state) => state.loading);

  const predefinedAmounts = [
    { value: 100000, label: "100,000" },
    { value: 200000, label: "200,000" },
    { value: 500000, label: "500,000" },
    { value: 1000000, label: "1,000,000" },
  ];

  const handleAmountSelect = (value) => {
    setSelectedAmount(value);
    form.setFieldsValue({ amount: value.toLocaleString("vi-VN") });
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleGenerateQR = async () => {
    try {
      const values = await form.validateFields();
      const amount = parseInt(values.amount.replace(/\D/g, ""));

      // Gọi API để lấy URL VNPay
      const vnpayUrl = await createVNPayQR(amount);
      console.log("vnpayUrl", vnpayUrl);

      if (!vnpayUrl) {
        throw new Error("Không thể tạo URL thanh toán");
      }

      // Parse URL để lấy thông tin
      const url = new URL(vnpayUrl);
      const params = new URLSearchParams(url.search);

      // Khởi tạo QR VNPay với thông tin từ URL
      const qrPay = QRPay.initVNPayQR({
        merchantId: params.get("vnp_TmnCode"),
        merchantName: "GreenSpace",
        store: "GreenSpace Store",
        // terminal: "GREENSPACE01",
        purpose: params.get("vnp_OrderInfo"),
        amount: (parseInt(params.get("vnp_Amount")) / 100).toString(),
        txnRef: params.get("vnp_TxnRef"),
        orderInfo: params.get("vnp_OrderInfo"),
        createDate: params.get("vnp_CreateDate")
      });

      // Tạo nội dung QR
      const content = qrPay.build();
      console.log("QR Content:", content);
      
      // Lưu URL và QR data
      setQrUrl(vnpayUrl);
      setQrData(content);
      
    } catch (error) {
      // console.error("Error generating QR:", error);
      // message.error({
      //   content: "Không thể tạo mã QR. Vui lòng thử lại sau.",
      //   duration: 5,
      // });
    }
  };

  return (
    <div className="recharge-form-container">
      <Row gutter={[32, 32]} align="stretch">
        <Col xs={24} md={12}>
          <Card className="amount-selection-card">
            <Title level={4}>Chọn số tiền nạp</Title>
            <Form form={form} layout="vertical">
              <Form.Item className="amount-radio-group">
                <Radio.Group
                  className="amount-selection"
                  value={selectedAmount}
                  onChange={(e) => handleAmountSelect(e.target.value)}
                >
                  {predefinedAmounts.map((amount) => (
                    <Radio.Button
                      key={amount.value}
                      value={amount.value}
                      className="amount-button"
                    >
                      {amount.label} VNĐ
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="amount"
                label="Hoặc nhập số tiền khác"
                rules={[
                  { required: true, message: "Vui lòng nhập số tiền" },
                  {
                    validator: (_, value) => {
                      const amount = parseInt(value?.replace(/\D/g, "") || "0");
                      if (amount < 10000) {
                        return Promise.reject(
                          "Số tiền tối thiểu là 10,000 VNĐ"
                        );
                      }
                      if (amount > 100000000) {
                        return Promise.reject(
                          "Số tiền tối đa là 100,000,000 VNĐ"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số tiền"
                  suffix="VNĐ"
                  size="large"
                  onChange={(e) => {
                    const { value } = e.target;
                    const formattedValue = formatCurrency(value);
                    form.setFieldsValue({ amount: formattedValue });
                    setSelectedAmount(null);
                  }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  icon={<QrcodeOutlined />}
                  onClick={handleGenerateQR}
                  loading={loading}
                  size="large"
                  block
                >
                  Tạo mã QR VNPay
                </Button>
              </Form.Item>
            </Form>
            <div className="payment-instructions">
              <div className="instruction-steps">
                <Title level={4}>Hướng dẫn thanh toán</Title>
                <Text>1. Tạo mã QR VNPay</Text>
                <Text>2. Mở ứng dụng ngân hàng hoặc ví điện tử</Text>
                <Text>3. Quét mã QR</Text>
                <Text>4. Xác nhận thanh toán</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card className="qr-code-card">
            <div className="qr-code-section">
              {loading ? (
                <div className="qr-loading">
                  <Spin size="large" tip="Đang tạo mã QR..." />
                </div>
              ) : qrData ? (
                <>
                  <Title level={4}>Quét mã để thanh toán</Title>
                  <div className="qr-code-wrapper">
                    <QRCodeSVG
                      value={qrData}
                      size={240}
                      level="H"
                      includeMargin={true}
                    />
                    <Space
                      direction="vertical"
                      size="small"
                      className="qr-actions"
                    >
                      {qrUrl && (
                        <Button
                          type="link"
                          icon={<LinkOutlined />}
                          // onClick={() => window.open(qrUrl, "_blank")}
                          onClick={() => window.location.href = qrUrl}
                        >
                          Mở trang thanh toán VNPay Sandbox
                        </Button>
                      )}
                      <Text type="secondary" className="qr-note">
                        Sử dụng ứng dụng Mobile Banking hoặc VNPay để quét mã QR
                      </Text>
                    </Space>
                  </div>
                  <div className="payment-instructions">
                    <div className="instruction-item">
                      <SafetyCertificateOutlined className="instruction-icon" />
                      <div className="instruction-text">
                        <Text strong>Thanh toán an toàn qua VNPay</Text>
                        <Text type="secondary">
                          Hỗ trợ tất cả ngân hàng nội địa
                        </Text>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="qr-placeholder">
                  <QrcodeOutlined className="placeholder-icon" />
                  <Text>Vui lòng chọn số tiền và nhấn "Tạo mã QR VNPay"</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RechargeForm;
