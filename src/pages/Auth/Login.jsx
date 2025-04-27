import { useState } from "react";
import { Input, Checkbox, Button, Form, message, Typography, Card, notification } from "antd";
import {
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Auth.scss";
import logoImage from "../../assets/logo.png";
import loginBg from "../../assets/login.png";
import useAuthStore from "../../stores/useAuthStore";

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Lấy returnUrl và actionType từ state (nếu có)
  const returnUrl = location.state?.returnUrl || "/home";
  const actionType = location.state?.actionType;

  const handleLogin = async (values) => {
    const { email, password, rememberMe } = values;
    setLoading(true);
    try {
      console.log('Attempting login with email:', email);
      const userData = await login(email, password, rememberMe);
      console.log('Login successful. User data:', {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.roleName
      });

      notification.success({
        message: "Đăng nhập thành công!",
        description: `Xin chào ${userData.name}`,
        placement: "topRight",
        duration: 3,
        showProgress: true,
        pauseOnHover: true,
      });

      // Navigate based on role or return to previous page
      const role = userData.roleName.toLowerCase();
      if (
        ["admin", "staff", "manager", "accountant", "designer"].includes(role)
      ) {
        navigate(`/${role}/dashboard`);
      } else if (returnUrl !== "/home") {
        // Nếu có returnUrl, trở về trang trước đó
        navigate(returnUrl, { state: { actionCompleted: true, actionType } });
      } else {
        navigate("/home"); // Default route for other roles
      }
    } catch (error) {
      notification.error({
        message: "Đăng nhập thất bại!",
        description: "Tài khoản hoặc mật khẩu không đúng!",
        showProgress: true,
        pauseOnHover: true,
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      message.success("Đăng nhập thành công");
      navigate("/");
    } catch (error) {
      console.error("Google login failed:", error);
      message.error("Đăng nhập thất bại: " + error.message);
    } finally {
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
                <Button
                  type="dashed"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/")}
                  className="back-link"
                >
                  Trang chủ
                </Button>

                {/* <img src={logoImage} alt="GreenSpace Logo" className="auth-logo-small" /> */}
              </div>
              <div style={{ textAlign: "center" }}>
                <Title level={2} className="auth-title">
                  Đăng nhập
                </Title>
                <Text className="auth-subtitle">
                  Chào mừng bạn quay trở lại với GreenSpace
                </Text>
              </div>
              <Form
                form={form}
                name="login"
                className="login-form"
                initialValues={{ rememberMe: false }}
                onFinish={handleLogin}
                layout="vertical"
                style={{ maxWidth: "100%" }}
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
                    prefix={<MailOutlined className="site-form-item-icon" />}
                    placeholder="Nhập email"
                    size="large"
                    className="auth-input"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={
                    <div className="password-header">
                      <span style={{ marginRight: "10px" }}>Mật khẩu</span>
                      {/* <Link to="/forgot-password" className="forgot-password">Quên mật khẩu?</Link> */}
                    </div>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="Nhập mật khẩu"
                    size="large"
                    className="auth-input"
                  />
                  {/* <Link
                    to="/forgot-password"
                    className="forgot-password"
                    style={{
                      float: "right",
                      fontWeight: "bold",
                      marginTop: "5px",
                    }}
                  >
                    Quên mật khẩu?
                  </Link> */}
                </Form.Item>
                <Link
                  to="/forgot-password"
                  className="forgot-password"
                  style={{
                    float: "right",
                    fontWeight: "bold",
                    marginTop: "5px",
                  }}
                >
                  Quên mật khẩu?
                </Link>
                <Form.Item name="rememberMe" valuePropName="checked">
                  <Checkbox className="remember-checkbox">
                    Ghi nhớ đăng nhập
                  </Checkbox>
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
                    Đăng nhập
                  </Button>
                </Form.Item>

                {/* <div className="divider-container">
                  <div className="divider-line"></div>
                  <span className="divider-text">Hoặc</span>
                  <div className="divider-line"></div>
                </div>
                
                <Button 
                  icon={<GoogleOutlined />} 
                  onClick={handleGoogleLogin} 
                  className="google-button"
                  block
                  size="large"
                >
                  Đăng nhập với Google
                </Button> */}

                <div className="auth-footer">
                  <Text>Bạn chưa có tài khoản? </Text>
                  <Link to="/register" className="register-link">
                    Đăng ký ngay
                  </Link>
                </div>
              </Form>
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

export default Login;
