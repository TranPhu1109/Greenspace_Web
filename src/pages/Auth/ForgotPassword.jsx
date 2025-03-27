import { useState } from "react";
import { Input, Button, Form, message, Typography, Card, Alert } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.scss";
import logoImage from "../../assets/logo.png";
import loginBg from "../../assets/login.png";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (values) => {
    const { email } = values;
    setLoading(true);

    try {
      // Gọi API để gửi email khôi phục mật khẩu
      // await forgotPassword(email);

      // Giả lập API call thành công
      setTimeout(() => {
        setEmailSent(true);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Forgot password failed:", error);
      message.error(
        "Không thể gửi email khôi phục: " +
          (error.response?.data?.message || error.message)
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-content">
            <div className="auth-form-section">
              <div className="auth-header">
                {/* <Link to="/login" className="back-link">
                  <ArrowLeftOutlined /> Quay lại đăng nhập
                </Link> */}
                <Button
                  type="dashed"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/login")}
                  className="back-link"
                >
                  Quay lại đăng nhập
                </Button>

                {/* <img src={logoImage} alt="GreenSpace Logo" className="auth-logo-small" /> */}
              </div>
              <div style={{ textAlign: "center", marginTop: "70px" }}>
                <Title level={2} className="auth-title">
                  Quên mật khẩu
                </Title>
                <Text className="auth-subtitle">
                  Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu
                </Text>
              </div>

              {emailSent ? (
                <Alert
                  message="Email đã được gửi!"
                  description={
                    <div>
                      <p>
                        Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email
                        của bạn. Vui lòng kiểm tra hộp thư đến và làm theo hướng
                        dẫn.
                      </p>
                      <p>
                        Nếu bạn không nhận được email trong vòng vài phút, hãy
                        kiểm tra thư mục spam hoặc thử lại.
                      </p>
                    </div>
                  }
                  type="success"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              ) : (
                <div style={{ width: "100%" }}>
                  <Form
                    form={form}
                    name="forgotPassword"
                    className="login-form"
                    onFinish={handleSubmit}
                    layout="vertical"
                  >
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" },
                      ]}
                    >
                      <Input
                        prefix={
                          <MailOutlined className="site-form-item-icon" />
                        }
                        placeholder="Nhập email đăng ký"
                        size="large"
                        className="auth-input"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="login-button"
                        block
                        size="large"
                        loading={loading}
                      >
                        Gửi hướng dẫn khôi phục
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              )}

              <div className="auth-footer">
                <Text>Đã nhớ mật khẩu? </Text>
                <Link to="/login" className="register-link">
                  Đăng nhập ngay
                </Link>
              </div>
            </div>

            <div className="auth-image-section">
              <img
                src={logoImage}
                alt="GreenSpace Logo"
                className="auth-logo"
              />
              <div
                className="leaf-background"
                style={{ backgroundImage: `url(${loginBg})` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
