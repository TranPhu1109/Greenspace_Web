import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Image,
  Descriptions,
  Divider,
  message,
  Spin,
  Tag,
  InputNumber,
  Rate,
  Form,
  Input,
  List,
  Avatar,
  Space,
  notification,
  Tabs,
} from "antd";
import {
  ShoppingCartOutlined,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useProductStore from "@/stores/useProductStore";
import useCartStore from "@/stores/useCartStore";
import useAuthStore from "@/stores/useAuthStore";
import dayjs from "dayjs";
import "./ProductDetail.scss";
import { checkToxicContent } from "@/services/moderationService";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const ProductDetail = () => {
  const { id } = useParams();
  const {
    getProductById,
    isLoading,
    createProductFeedback,
    feedbackLoading,
    getProductFeedbacks,
  } = useProductStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const [product, setProduct] = useState(null);
  console.log("product", product);
  
  const [quantity, setQuantity] = useState(1);
  const [feedbacks, setFeedbacks] = useState([]);
  const [form] = Form.useForm();
  const [showError, setShowError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  const handleBuyNow = () => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để mua hàng");
      return;
    }

    const walletStorage = JSON.parse(localStorage.getItem("wallet-storage"));
    const balance = walletStorage?.state?.balance || 0;
    console.log("Balance:", balance);
    const total = product.price * quantity;

    if (balance < total) {
      notification.warning({
        message: "Số dư không đủ",
        description: "Vui lòng nạp thêm tiền vào ví để tiếp tục mua hàng",
        duration: 3,
      });
      return;
    }

    navigate("/cart/checkout", {
      state: {
        products: [
          {
            id: product.id,
            quantity: quantity,
            price: product.price,
            name: product.name,
            image: product.image.imageUrl,
          },
        ],
        isBuyNow: true,
      },
    });
  };

  const fetchFeedbacks = async () => {
    try {
      const data = await getProductFeedbacks(id);
      if (data) {
        setFeedbacks(data);
      }
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        message.error("Không thể tải đánh giá sản phẩm");
      }
    }
  };
  const mountedRef = useRef(true);

  // Cleanup function
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || !mountedRef.current) return;

      try {
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          await fetchFeedbacks();
        }
        if (mountedRef.current) {
          setProduct(data);
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          message.error("Không thể tải thông tin sản phẩm");
        }
        if (error.name !== "CanceledError" && mountedRef.current) {
          console.error("Error loading product:", error);
        }
      }
    };

    if (id) {
      // Reset states when fetching new product
      setShowError(false);
      fetchProduct();

      // Set timer to show error message after 2 seconds if product is not found
      const timer = setTimeout(() => {
        setShowError(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
    fetchProduct();
  }, [id, getProductById]);

  const handleAddToCart = async () => {
    if (quantity > product.stock) {
      message.warning(`Số lượng sản phẩm vượt quá số lượng tồn kho (${product.stock} sản phẩm)`);
      return;
    }
    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return <Tag color="error">Hết hàng</Tag>;
    } else if (stock <= 10) {
      return <Tag color="warning">Sắp hết hàng</Tag>;
    } else {
      return <Tag color="success">Còn hàng</Tag>;
    }
  };

  // Show loading state
  if (isLoading || (!product && !showError)) {
    return (
      <Layout>
        <Header />
        <Content className="product-detail-loading">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "60vh",
            }}
          >
            <Spin size="large" tip="Đang tải thông tin sản phẩm..." />
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  // Show error state
  if (!product && showError) {
    return (
      <Layout>
        <Header />
        <Content className="product-detail-error">
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Title level={3}>Không tìm thấy sản phẩm</Title>
            <Text type="secondary">Sản phẩm không tồn tại hoặc đã bị xóa</Text>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout >
      <Header />
      <Content>
        <div className="product-detail-content" style={{ padding: "200px 0 10px" }}>
          <div className="container">
            <Card >
              <Row gutter={[32, 32]}>
                <Col xs={24} md={12}>
                  <div className="product-images">
                    <Image.PreviewGroup>
                      <div className="main-image">
                        <Image
                          src={product.image.imageUrl}
                          alt={product.name}
                        />
                      </div>
                      {product.image.image2 && (
                        <div className="thumbnail-images">
                          <Image
                            src={product.image.image2}
                            alt={`${product.name} - 2`}
                          />
                          {product.image.image3 && (
                            <Image
                              src={product.image.image3}
                              alt={`${product.name} - 3`}
                            />
                          )}
                        </div>
                      )}
                    </Image.PreviewGroup>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="product-info">
                    <Title level={2}>{product.name}</Title>
                    <div className="product-price">
                      {product.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </div>
                    <div
                      className="quantity-selector"
                      style={{ margin: "16px 0" }}
                    >
                      <span style={{ marginRight: "8px" }}>Số lượng:</span>
                      <InputNumber
                        min={1}
                        max={product.stock}
                        value={quantity}
                        onChange={setQuantity}
                        className="quantity-input"
                      />
                    </div>
                    <Divider />
                    <Descriptions column={1} bordered>
                      <Descriptions.Item label="Kích thước">
                        {product.size} cm
                      </Descriptions.Item>
                      <Descriptions.Item label="Danh mục">
                        {product.categoryName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tình trạng">
                        {getStockStatus(product.stock)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số lượng tồn kho">
                        {product.stock} sản phẩm
                      </Descriptions.Item>
                      {/* Add more product details as needed */}
                    </Descriptions>
                    <Divider />
                    <div className="product-actions">
                      <Space size="middle">
                        <Button
                          type="primary"
                          size="large"
                          icon={<ShoppingCartOutlined />}
                          onClick={handleAddToCart}
                          disabled={product.stock === 0}
                          className="add-to-cart-btn"
                        >
                          {product.stock === 0
                            ? "Hết hàng"
                            : "Thêm vào giỏ hàng"}
                        </Button>
                        <Button
                          type="default"
                          size="large"
                          onClick={handleBuyNow}
                          disabled={product.stock === 0}
                        >
                          Mua ngay
                        </Button>
                      </Space>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            <Tabs
              defaultActiveKey="1"
              style={{
                marginTop: 24,
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                padding: "0 16px",
              }}
            >
              <Tabs.TabPane tab="Mô tả sản phẩm" key="1">
                <Card style={{ marginBottom: "16px" }}>
                  <div
                    dangerouslySetInnerHTML={{ __html: product?.description }}
                    style={{
                      marginBottom: 16,
                      color: "#666",
                    }}
                  />
                </Card>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Đánh giá" key="2">
                <Card
                  bordered={false}
                  className="feedback-section"
                  style={{ marginBottom: "16px" }}
                >
                  <List
                    className="feedback-list"
                    itemLayout="horizontal"
                    dataSource={feedbacks}
                    locale={{ emptyText: "Chưa có đánh giá nào" }}
                    renderItem={(item) => (
                      <List.Item>
                        <div className="feedback-item">
                          <div className="feedback-item-header">
                            <Avatar
                              icon={<UserOutlined />}
                              style={{ backgroundColor: "#52c41a" }}
                            />
                            <div
                              className="feedback-item-meta"
                              style={{ marginRight: "8px" }}
                            >
                              <Text strong>{item.userName}</Text>
                              <Text type="secondary">
                                {dayjs(item.creationDate).format(
                                  "DD/MM/YYYY HH:mm"
                                )}
                              </Text>
                            </div>
                            <Rate disabled defaultValue={item.rating} />
                          </div>
                          <div className="feedback-content">
                            <Paragraph>{item.description}</Paragraph>
                            {item.reply && (
                              <div className="feedback-reply">
                                <div className="reply-header">
                                  <Avatar
                                    src="https://img.icons8.com/color/48/000000/shop.png"
                                    style={{ backgroundColor: "white" }}
                                  />
                                  <Text type="success" strong>
                                    Phản hồi từ shop
                                  </Text>
                                </div>
                                <div className="reply-content">
                                  <Paragraph>{item.reply}</Paragraph>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default ProductDetail;
