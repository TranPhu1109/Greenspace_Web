import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Form,
  Input,
  Button,
  Card,
  Space,
  message,
  Row,
  Col,
  InputNumber,
  Upload,
  Modal,
} from "antd";
import { UploadOutlined, WarningOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddressForm from "@/components/Common/AddressForm";
import EditorComponent from "@/components/Common/EditorComponent";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import useAuthStore from "@/stores/useAuthStore";
import useServiceOrderStore from "@/stores/useServiceOrderStore";

const { Content } = Layout;
const { Title } = Typography;

const BookDesign = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [addressData, setAddressData] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const { uploadImages, progress } = useCloudinaryStorage();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { createServiceOrder } = useServiceOrderStore();

  const handleAddressChange = (newAddressData) => {
    setAddressData(newAddressData);
  };

  const handleImageChange = ({ fileList }) => {
    setImageFiles(fileList);
  };

  if (!user) {
    return (
      <Layout>
        <Header />
        <Content style={{ padding: "200px 0 20px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
            <Card
              style={{
                textAlign: "center",
                minHeight: "500px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                borderRadius: 12,
                background: "#f9f9f9",
              }}
            >
              <WarningOutlined
                style={{
                  fontSize: 120,
                  color: "#ff4d4f",
                  margin: "0 auto 30px",
                  display: "block",
                }}
              />
              <Title level={3} style={{ color: "#333" }}>
                Bạn cần đăng nhập để tiếp tục đặt thiết kế
              </Title>
              <p
                style={{
                  fontSize: 16,
                  color: "#777",
                  maxWidth: 500,
                  margin: "0 auto",
                }}
              >
                Việc đăng nhập giúp hệ thống lưu trữ và theo dõi quá trình thiết
                kế của bạn, đảm bảo trải nghiệm xuyên suốt và an toàn.
              </p>
              <div style={{ marginTop: 30 }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập ngay
                </Button>
                <p style={{ marginTop: 20, color: "#999", fontSize: 14 }}>
                  Nếu bạn chưa có tài khoản, bạn có thể{" "}
                  <a
                    onClick={() => navigate("/register")}
                    style={{ color: "#1890ff" }}
                  >
                    đăng ký tại đây
                  </a>
                  .
                </p>
              </div>
            </Card>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  const handleFinish = async (values) => {
    try {
      if (!addressData) {
        message.error("Vui lòng chọn địa chỉ");
        return;
      }

      if (!user) {
        message.error("Vui lòng đăng nhập để tiếp tục");
        return;
      }

      setLoading(true);

      // Upload ảnh lên Cloudinary
      const imageUrls = await uploadImages(
        imageFiles.map((file) => file.originFileObj)
      );

      const address = `${values.streetAddress}|${addressData.ward.label}|${addressData.district.label}|${addressData.province.label}`;

      // Tạo object request
      const requestData = {
        userId: user.id,
        address: address,
        cusPhone: values.phone,
        length: values.length,
        width: values.width,
        description: values.description,
        image: {
          imageUrl: imageUrls[0] || "",
          image2: imageUrls[1] || "",
          image3: imageUrls[2] || "",
        },
      };

      // Sử dụng createServiceOrder từ store
      const response = await createServiceOrder(requestData);

      if (response.message === " created Successfully") {
        message.success("Đặt thiết kế thành công");
        navigate("/home");
      } else {
        throw new Error("Đặt thiết kế thất bại");
      }
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Header />
      <Content style={{ padding: "200px 0 16px 0", minHeight: "100vh" }}>
        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 0 0 20px" }}
        >
          <Card
            title={
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#4caf50",
                  borderBottom: "2px solid #4caf50",
                  paddingBottom: "10px",
                  marginTop: "10px",
                  marginBottom: "10px",
                  textAlign: "center",
                }}
              >
                Đặt thiết kế
              </div>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{}}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="length"
                    label="Chiều dài (m)"
                    rules={[
                      { required: true, message: "Vui lòng nhập chiều dài" },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      step={0.1}
                      style={{ width: "100%" }}
                      placeholder="Nhập chiều dài"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="width"
                    label="Chiều rộng (m)"
                    rules={[
                      { required: true, message: "Vui lòng nhập chiều rộng" },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      step={0.1}
                      style={{ width: "100%" }}
                      placeholder="Nhập chiều rộng"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Mô tả yêu cầu thiết kế"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả yêu cầu" },
                ]}
              >
                <EditorComponent />
              </Form.Item>

              <Form.Item
                label="Hình ảnh tham khảo (tối đa 3 ảnh)"
                required
                rules={[
                  { required: true, message: "Vui lòng tải lên ít nhất 1 ảnh" },
                ]}
              >
                <Upload
                  listType="picture-card"
                  fileList={imageFiles}
                  onChange={handleImageChange}
                  beforeUpload={() => false}
                  maxCount={3}
                >
                  {imageFiles.length < 3 && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" maxLength={10} />
              </Form.Item>

              <AddressForm form={form} onAddressChange={handleAddressChange} />

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                >
                  Đặt thiết kế
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default BookDesign;
