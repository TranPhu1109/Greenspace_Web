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
} from "antd";
import {
  QrcodeOutlined,
  SafetyCertificateOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react";
import useWalletStore from "@/stores/useWalletStore";
import "../styles/RechargeForm.scss";

const { Title, Text } = Typography;

const RechargeForm = () => {
  const [form] = Form.useForm();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const [qrData, setQrData] = useState("");
  const { createVNPayQR, loading } = useWalletStore();

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

  // Hàm xử lý URL VNPay thành dữ liệu QR theo chuẩn EMV
  const formatVNPayQRData = (url) => {
    try {
      const [baseUrl, queryString] = url.split("?");
      const params = new URLSearchParams(queryString);

      // Lấy thông tin từ URL
      const amount = (
        parseInt(params.get("vnp_Amount") || "0") / 100
      ).toString(); // Chuyển về VND
      const createDate = params.get("vnp_CreateDate") || "";
      const tmnCode = params.get("vnp_TmnCode") || "";
      const orderInfo = params.get("vnp_OrderInfo") || "";
      const txnRef = params.get("vnp_TxnRef") || "";

      // Tên merchant và thông tin bổ sung
      const merchantName = "GREEN SPACE";
      const merchantCity = "HANOI";
      const additionalData = `${orderInfo}|${txnRef}`; // Thông tin đơn hàng và mã giao dịch

      // Format theo chuẩn EMV QR Code
      const qrData = [
        "00020101", // ID và phiên bản
        "021238570010", // Merchant account information tag
        "A000000775", // VNPay ID
        `0115${tmnCode}`, // Merchant ID với độ dài
        "5802VN", // Country code
        `5914${merchantName}`, // Merchant name với độ dài
        `6005${merchantCity}`, // City
        `54${amount.length.toString().padStart(2, "0")}${amount}`, // Amount với độ dài
        `62${(additionalData.length + 2)
          .toString()
          .padStart(2, "0")}05${additionalData}`, // Additional data với độ dài
        "6304", // CRC
        "00", // Checksum (tạm thời để 00)
      ].join("");

      return qrData;
    } catch (error) {
      console.error("Error formatting QR data:", error);
      return url;
    }
  };

  const handleGenerateQR = async () => {
    try {
      const values = await form.validateFields();
      const amount = parseInt(values.amount.replace(/\D/g, ""));

      const response = await createVNPayQR(amount);
      if (response) {
        setQrUrl(response);
        // Tạo dữ liệu QR từ URL
        const formattedQRData = formatVNPayQRData(response);
        setQrData(formattedQRData);
      }
    } catch (error) {
      console.error("Error generating QR:", error);
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
              ) : qrUrl ? (
                <>
                  <Title level={4}>Quét mã để thanh toán</Title>
                  <div className="qr-code-wrapper">
                    <QRCodeSVG
                      value={qrData || qrUrl} // Sử dụng qrData nếu có, ngược lại dùng qrUrl
                      size={240}
                      level="H"
                      includeMargin={true}
                    />
                    <Space
                      direction="vertical"
                      size="small"
                      className="qr-actions"
                    >
                      <Button
                        type="link"
                        icon={<LinkOutlined />}
                        onClick={() => window.open(qrUrl, "_blank")}
                      >
                        Mở trang thanh toán VNPay
                      </Button>
                      <Text type="secondary" className="qr-note">
                        Bạn có thể quét mã QR hoặc click vào link phía trên để
                        thanh toán
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
