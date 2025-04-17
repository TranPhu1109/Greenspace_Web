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
  Checkbox,
  Alert,
  Spin,
  Tooltip,
} from "antd";
import { UploadOutlined, WarningOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddressForm from "@/components/Common/AddressForm";
import EditorComponent from "@/components/Common/EditorComponent";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import useAuthStore from "@/stores/useAuthStore";
import useServiceOrderStore from "@/stores/useServiceOrderStore";
import useProductStore from "@/stores/useProductStore";
import ProductSelection from "./components/ProductSelection";

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
  const { products, categories, fetchProducts, fetchCategories, isLoading: productLoading } = useProductStore();
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Set default addressData with user's information when component mounts
  useEffect(() => {
    if (user && user.address) {
      // User has a default address, addressData will be populated by AddressForm component
      console.log("User has default address:", user.address);
    }
  }, [user]);

  const handleAddressChange = (newAddressData) => {
    console.log("Address data changed:", newAddressData);
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

      // Get user name from address data or user profile
      let userName = '';
      if (addressData.name) {
        userName = addressData.name;
      } else if (addressData.fullAddressData?.recipientInfo?.name) {
        userName = addressData.fullAddressData.recipientInfo.name;
      } else {
        userName = userObj.name || '';
      }
      
      // Get phone from address data or user profile
      let phone = '';
      if (addressData.phone) {
        phone = addressData.phone;
      } else if (user.phone) {
        phone = user.phone;
      } else {
        message.error('Không tìm thấy số điện thoại. Vui lòng chọn địa chỉ khác.');
        return;
      }

      setLoading(true);

      // Upload ảnh lên Cloudinary
      const imageUrls = await uploadImages(
        imageFiles.map((file) => file.originFileObj)
      );

      let address;
      if (addressData.useDefaultAddress) {
        // Use default address from user object
        address = user.address;
      } else if (addressData.streetAddress) {
        // If address data contains street address
        address = `${addressData.streetAddress}|${addressData.ward.label}|${addressData.district.label}|${addressData.province.label}`;
      } else {
        // Fallback to form values
        address = `${values.streetAddress}|${addressData.ward.label}|${addressData.district.label}|${addressData.province.label}`;
      }

      // Định dạng lại serviceOrderDetails nếu có sản phẩm được chọn
      const serviceOrderDetails = showProductSelection 
        ? selectedProductDetails.map(detail => ({
            productId: detail.productId,
            quantity: detail.quantity,
          })) 
        : [];

      // Tạo object request
      const requestData = {
        userId: user.id,
        address: address,
        cusPhone: phone,
        length: values.length,
        width: values.width,
        description: values.description,
        image: {
          imageUrl: imageUrls[0] || "",
          image2: imageUrls[1] || "",
          image3: imageUrls[2] || "",
        },
        serviceOrderDetails: serviceOrderDetails // Thêm chi tiết đơn hàng
      };

      // Log dữ liệu request để kiểm tra
      console.log("Request Data:", requestData);

      // Sử dụng createServiceOrder từ store
      const response = await createServiceOrder(requestData);

      // Kiểm tra response trả về từ API
      if (response && response.message === " created Successfully") {
        message.success("Đặt thiết kế thành công");
        navigate("/home");
      } else {
        // Ném lỗi cụ thể hơn nếu có
        throw new Error(response?.message || "Đặt thiết kế thất bại");
      }
    } catch (error) {
      console.error("Error during booking:", error);
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
              <Title level={4} style={{ marginBottom: '16px', color: '#555' }}>1. Thông tin kích thước không gian</Title>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="length"
                    label={
                      <Space>
                        Chiều dài (m)
                        <Tooltip title="Nhập chiều dài ước tính của khu vực bạn muốn thiết kế.">
                          <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                        </Tooltip>
                      </Space>
                    }
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
                    label={
                      <Space>
                        Chiều rộng (m)
                        <Tooltip title="Nhập chiều rộng ước tính của khu vực bạn muốn thiết kế.">
                          <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                        </Tooltip>
                      </Space>
                    }
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

              <Title level={4} style={{ marginTop: '24px', marginBottom: '16px', color: '#555' }}>2. Hình ảnh hiện trạng & Mô tả yêu cầu</Title>
              <Form.Item
                label={
                  <Space>
                    Hình ảnh tham khảo (tối đa 3 ảnh)
                    <Tooltip title="Tải lên hình ảnh hiện trạng của khu vực hoặc ảnh mẫu thiết kế bạn mong muốn.">
                      <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                    </Tooltip>
                  </Space>
                }
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
                name="description"
                label={
                  <Space>
                    Mô tả yêu cầu thiết kế
                    <Tooltip title="Mô tả chi tiết về mong muốn thiết kế của bạn: phong cách, màu sắc, loại cây yêu thích, mục đích sử dụng,...">
                      <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả yêu cầu" },
                ]}
              >
                <EditorComponent />
              </Form.Item>

              {/* <Title level={4} style={{ marginTop: '24px', marginBottom: '16px', color: '#555' }}>3. Lựa chọn vật liệu (Tùy chọn)</Title> */}
              {/* Thông báo và Checkbox chọn sản phẩm */}
              {/* <Alert
                message="Gợi ý: Bạn có thể chọn thêm các vật liệu có sẵn trên website để tiết kiệm thời gian và chi phí cho quá trình thiết kế sau này."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Form.Item name="selectProducts" valuePropName="checked">
                <Checkbox onChange={(e) => setShowProductSelection(e.target.checked)}>
                  Chọn thêm vật liệu có sẵn
                </Checkbox>
              </Form.Item> */}

              {/* Phần chọn sản phẩm (hiển thị có điều kiện) */}
              {/* {showProductSelection && (
                productLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin />
                    <p>Đang tải danh sách sản phẩm...</p>
                  </div>
                ) : (
                  <ProductSelection
                    products={products}
                    categories={categories}
                    selectedProducts={selectedProductDetails}
                    onChange={(newSelectedDetails) => {
                      console.log("[BookDesign] Received new details:", newSelectedDetails);
                      setSelectedProductDetails(newSelectedDetails);
                    }}
                  />
                )
              )} */}

              <Title level={4} style={{ marginTop: '24px', marginBottom: '16px', color: '#555' }}>3. Thông tin liên hệ & Địa chỉ</Title>
              
              <Alert
                message="Thông tin liên hệ"
                description="Chọn địa chỉ từ danh sách hoặc thêm địa chỉ mới. Số điện thoại sẽ được lấy từ thông tin địa chỉ đã chọn."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <AddressForm form={form} onAddressChange={handleAddressChange} />

              <Form.Item style={{ marginTop: '24px' }}>
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
