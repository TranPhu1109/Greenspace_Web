import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Divider,
  Button,
  message,
  Spin,
  Empty,
  Input,
  Form,
  Modal,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import useAuthStore from "@/stores/useAuthStore";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useWalletStore from "@/stores/useWalletStore";
import "./styles.scss";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const OrderService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isCustomOrder = location.state?.isCustom || false;

  const {
    currentDesign,
    fetchDesignIdeaById,
    isLoading: designLoading,
  } = useDesignIdeaStore();
  const { getProductById } = useProductStore();
  const { user } = useAuthStore();
  const { createDesignOrder, isLoading: orderLoading } = useDesignOrderStore();
  const { balance, fetchBalance, loading: walletLoading, createBill } = useWalletStore();
  const [productDetails, setProductDetails] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const mountedRef = useRef(true);
  const [form] = Form.useForm();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load design data
  useEffect(() => {
    const loadDesign = async () => {
      if (!id || !mountedRef.current) return;
      try {
        const design = await fetchDesignIdeaById(id);
      } catch (error) {
        if (error.name !== "CanceledError" && mountedRef.current) {
          message.error("Không thể tải thông tin thiết kế");
        }
      }
    };
    loadDesign();
  }, [id, fetchDesignIdeaById]);

  // Load products when design data is available
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      if (!isMounted) return;

      if (!currentDesign?.productDetails?.length) {
        setProductDetails([]);
        setIsLoadingProducts(false);
        return;
      }

      setIsLoadingProducts(true);
      setProductError(null);

      try {
        const productPromises = currentDesign.productDetails.map(
          async (detail) => {
            try {
              const product = await getProductById(detail.productId);

              if (!isMounted) return null;

              if (product) {
                return {
                  detail,
                  product,
                };
              } else {
                return null;
              }
            } catch (error) {
              return null;
            }
          }
        );

        const results = await Promise.all(productPromises);

        if (isMounted) {
          const validResults = results.filter(Boolean);
          setProductDetails(validResults);
          setProductError(null);
        }
      } catch (error) {
        if (isMounted) {
          setProductError("Failed to load products");
          setProductDetails([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [currentDesign, getProductById]);

  // Add useEffect to fetch wallet balance
  useEffect(() => {
    const loadWalletBalance = async () => {
      try {
        await fetchBalance();
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };
    loadWalletBalance();
  }, [fetchBalance]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        userId: user.id,
        designIdeaId: currentDesign.id,
        address: values.address,
        cusPhone: values.phone,
        length: isCustomOrder ? values.length : 0,
        width: isCustomOrder ? values.width : 0,
        isCustom: isCustomOrder,
        totalPrice: currentDesign.totalPrice,
        designPrice: currentDesign.designPrice,
        materialPrice: currentDesign.materialPrice,
        description: isCustomOrder ? values.description : "",
        image: {
          imageUrl: isCustomOrder ? values.imageUrl : "",
          imageId: isCustomOrder ? values.imageId : "",
          image3: isCustomOrder ? values.image3 : "",
        },
      };
      setOrderData(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Form validation error:", error);
      message.error("Vui lòng kiểm tra lại thông tin");
    }
  };

  const handleConfirmOrder = async () => {
    try {
      // Create the order first
      const orderResponse = await createDesignOrder(orderData);
      
      // For non-custom orders, create bill after successful order creation
      if (!isCustomOrder) {
        await createBill(orderResponse.id, currentDesign.totalPrice);
      }
      
      // Refresh wallet balance after successful order creation and bill creation
      await fetchBalance();
      message.success("Đặt hàng thành công!");
      setIsModalOpen(false);
      navigate("/serviceorderhistory");
    } catch (error) {
      console.error("Order submission error:", error);
      message.error("Có lỗi xảy ra khi đặt hàng");
    }
  };

  if (designLoading) {
    return (
      <Layout>
        <Header />
        <Content className="order-service-loading">
          <div className="container">
            <Card loading />
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  if (!currentDesign) {
    return (
      <Layout>
        <Header />
        <Content className="order-service-error">
          <div className="container">
            <Card>
              <Title level={3}>Không tìm thấy thiết kế</Title>
            </Card>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout className="order-service-layout">
      <Header />
      <Content>
        <div className="order-service-content">
          <div className="container">
            <Title level={1}>
              {isCustomOrder
                ? "Đặt hàng thiết kế tùy chỉnh"
                : "Đặt hàng thiết kế mẫu"}
            </Title>

            <div className="order-form">
              {/* Customer Information */}
              <Card title="Thông tin người đặt" className="form-section">
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    fullName: user?.name || "",
                    phone: user?.phone || "",
                    address: user?.address || "",
                    email: user?.email || "",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập họ và tên",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số điện thoại",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email" },
                          { type: "email", message: "Email không hợp lệ" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[
                          { required: true, message: "Vui lòng nhập địa chỉ" },
                        ]}
                      >
                        <Input.TextArea rows={3} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

              {/* Design Information */}
              <Card title="Thông tin thiết kế" className="form-section">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <img
                      src={currentDesign?.image?.imageUrl}
                      alt={currentDesign?.name}
                      className="design-image"
                    />
                  </Col>
                  <Col span={24}>
                    <Title level={4}>{currentDesign?.name}</Title>
                    <Paragraph>{currentDesign?.description}</Paragraph>
                  </Col>
                </Row>
              </Card>

              {/* Custom Order Fields */}
              {isCustomOrder && (
                <Card title="Thông tin tùy chỉnh" className="form-section">
                  <Form form={form} layout="vertical">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Form.Item
                          name="length"
                          label="Chiều dài (m)"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập chiều dài",
                            },
                          ]}
                        >
                          <Input type="number" min={0} step={0.1} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="width"
                          label="Chiều rộng (m)"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập chiều rộng",
                            },
                          ]}
                        >
                          <Input type="number" min={0} step={0.1} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="description"
                          label="Mô tả yêu cầu tùy chỉnh"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập mô tả yêu cầu",
                            },
                          ]}
                        >
                          <Input.TextArea rows={4} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="image"
                          label="Hình ảnh tham khảo"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng tải lên hình ảnh",
                            },
                          ]}
                        >
                          <Upload>
                            <Button icon={<UploadOutlined />}>
                              Tải lên hình ảnh
                            </Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Card>
              )}

              {/* Product List */}
              <Card title="Danh sách sản phẩm" className="form-section">
                {isLoadingProducts ? (
                  <div className="loading-container">
                    <Spin size="large" />
                  </div>
                ) : productError ? (
                  <Paragraph type="danger">{productError}</Paragraph>
                ) : productDetails && productDetails.length > 0 ? (
                  productDetails.map(({ detail, product }) => (
                    <div key={detail.productId} className="product-item">
                      <Row gutter={16} align="middle">
                        <Col span={4}>
                          <img
                            src={product.image?.imageUrl}
                            alt={product.name}
                            className="product-image"
                          />
                        </Col>
                        <Col span={12}>
                          <Title level={5}>{product.name}</Title>
                          <Paragraph>{product.description}</Paragraph>
                        </Col>
                        <Col span={4}>
                          <span>Số lượng: {detail.quantity}</span>
                        </Col>
                        <Col span={4}>
                          <span className="product-price">
                            {detail.price.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </span>
                        </Col>
                      </Row>
                      <Divider />
                    </div>
                  ))
                ) : (
                  <Empty description="Không có sản phẩm nào" />
                )}
              </Card>

              {/* Price Summary */}
              <Card title="Tổng quan giá" className="form-section">
                <div className="price-summary">
                  <div className="price-item">
                    <span>Giá thiết kế:</span>
                    <span>
                      {currentDesign?.designPrice?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </div>
                  <div className="price-item">
                    <span>Giá vật liệu:</span>
                    <span>
                      {currentDesign?.materialPrice?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </div>
                  <div className="price-item total">
                    <span>Tổng giá:</span>
                    <span>
                      {currentDesign?.totalPrice?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </div>
                  <Divider />
                  <div className="price-item wallet-balance">
                    <span>Số dư ví:</span>
                    <span
                      style={{
                        color:
                          balance >= currentDesign?.totalPrice
                            ? "#52c41a"
                            : "#f5222d",
                        fontWeight: "bold",
                      }}
                    >
                      {walletLoading ? (
                        <Spin size="small" />
                      ) : (
                        balance?.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      )}
                    </span>
                  </div>
                  {!isCustomOrder && balance < currentDesign?.totalPrice && (
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          marginTop: "8px",
                          color: "#f5222d",
                          fontSize: "14px",
                          marginBottom: "8px"
                        }}
                      >
                        Số dư ví không đủ để thanh toán. Vui lòng nạp thêm tiền.
                      </div>
                      <Button 
                        key="deposit" 
                        type="primary" 
                        onClick={() => {
                          setIsModalOpen(false);
                          navigate("/userwallets");
                        }}
                      >
                        Nạp tiền
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Submit Button */}
              <div className="form-actions">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  loading={orderLoading}
                  disabled={
                    !isCustomOrder && balance < currentDesign?.totalPrice
                  }
                >
                  Xác nhận đặt hàng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Content>
      <Footer />

      {/* Confirmation Modal */}
      <Modal
        title="🎉 Xác nhận đặt hàng"
        open={isModalOpen}
        onOk={handleConfirmOrder}
        onCancel={() => setIsModalOpen(false)}
        okText="✨ Xác nhận đặt hàng"
        cancelText="Hủy"
        
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#1890ff", marginBottom: "16px" }}>
            Hoàn tất đơn hàng!
          </h2>
          {isCustomOrder ? (
            <>
              <p
                style={{
                  fontSize: "16px",
                  color: "#666",
                  marginBottom: "20px",
                  padding: "20px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  border: "1px dashed #d9d9d9",
                }}
              >
                Đơn hàng sẽ được báo giá sau khi Designer hoàn tất bản vẽ
              </p>
            </>
          ) : (
            <>
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                  Số tiền cần thanh toán:
                </p>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#f5222d",
                    marginBottom: "16px",
                  }}
                >
                  {currentDesign?.totalPrice?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </p>
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                    Số dư ví hiện tại:
                  </p>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color:
                        balance >= currentDesign?.totalPrice
                          ? "#52c41a"
                          : "#f5222d",
                    }}
                  >
                    {walletLoading ? (
                      <Spin size="small" />
                    ) : (
                      balance?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })
                    )}
                  </p>
                </div>
                {balance < currentDesign?.totalPrice && (
                  <div
                    style={{
                      color: "#f5222d",
                      fontSize: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    Số dư ví không đủ để thanh toán. Vui lòng nạp thêm tiền.
                  </div>
                )}
              </div>
            </>
          )}
          <p style={{ color: "#666" }}>
            {isCustomOrder
              ? 'Nhấn "Xác nhận đặt hàng" để hoàn tất'
              : balance >= currentDesign?.totalPrice
              ? 'Nhấn "Xác nhận đặt hàng" để hoàn tất'
              : "Vui lòng nạp thêm tiền vào ví để tiếp tục"}
          </p>
        </div>
      </Modal>
    </Layout>
  );
};

export default OrderService;
