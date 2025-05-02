import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
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
  Modal,
} from "antd";
import {
  ShoppingCartOutlined,
  StarOutlined,
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
  LockOutlined,
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useProductStore from "@/stores/useProductStore";
import useCartStore from "@/stores/useCartStore";
import useAuthStore from "@/stores/useAuthStore";
import dayjs from "dayjs";
import "./ProductDetail.scss";
import { checkToxicContent } from "@/services/moderationService";
import { useNavigate, Link } from "react-router-dom";
import LoginRequiredModal from "@/components/Auth/LoginRequiredModal";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const ProductDetail = () => {
  const { id } = useParams();
  const {
    getProductById,
    isLoading,
    getProductFeedbacks,
  } = useProductStore();
  const { addToCart, cartItems, fetchCartItems } = useCartStore();
  const { user } = useAuthStore();
  const [product, setProduct] = useState(null);
  console.log("product", product);

  const [quantity, setQuantity] = useState(1);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showError, setShowError] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null); // 'cart' or 'buy'
  const navigate = useNavigate();
  const location = useLocation();

  const showLoginModal = (type) => {
    setActionType(type);
    setIsLoginModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsLoginModalVisible(false);
  };

  // Fetch cart items when user logs in
  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user, fetchCartItems]);

  // Handle quantity change - check against stock and cart
  const handleQuantityChange = (value) => {
    if (!product) return;

    const existingCartItem = cartItems.find(item => item.id === product.id);
    const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;

    // Kiểm tra nếu tổng số lượng vượt quá stock
    if (existingQuantity + value > product.stock) {
      const maxAddable = product.stock - existingQuantity;

      if (maxAddable <= 0) {
        message.warning(`Bạn đã có ${existingQuantity} sản phẩm này trong giỏ hàng - đạt giới hạn tồn kho.`);
        setQuantity(1); // Giữ ở 1 để người dùng vẫn có thể nhìn thấy UI
        return;
      }

      message.warning(`Đã có ${existingQuantity} sản phẩm trong giỏ hàng. Bạn chỉ có thể thêm tối đa ${maxAddable} sản phẩm nữa.`);
      setQuantity(maxAddable);
      return;
    }

    setQuantity(value);
  };

  const handleBuyNow = () => {
    if (!user) {
      showLoginModal('buy');
      return;
    }

    // Kiểm tra số lượng trong giỏ hàng hiện tại
    const existingCartItem = cartItems.find(item => item.id === product.id);
    const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
    const totalQuantity = existingQuantity + quantity;

    // Kiểm tra stock
    if (totalQuantity > product.stock) {
      message.error(`Tổng số lượng trong giỏ hàng (${existingQuantity}) và số lượng mua ngay (${quantity}) không được vượt quá tồn kho (${product.stock})`);
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
    try {
      await addToCart(product.id, quantity);

      // Trigger sự kiện cập nhật giỏ hàng local
      window.dispatchEvent(new Event('localCartUpdated'));

      // Cập nhật lại giỏ hàng sau khi thêm sản phẩm
      if (user) {
        await fetchCartItems();
      }
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

  const goToLogin = () => {
    setIsLoginModalVisible(false);
    navigate("/login", {
      state: {
        returnUrl: `/products/${id}`,
        actionType
      }
    });
  };

  const goToRegister = () => {
    setIsLoginModalVisible(false);
    navigate("/register", {
      state: {
        returnUrl: `/products/${id}`,
        actionType
      }
    });
  };

  // Kiểm tra nếu người dùng quay lại từ trang đăng nhập/đăng ký
  useEffect(() => {
    const checkLoginStatus = async () => {
      // Nếu có thông tin state và người dùng đã đăng nhập
      if (location?.state?.actionCompleted && user && product) {
        const action = location.state.actionType;

        // Xóa state để tránh thực hiện lại hành động nếu người dùng refresh trang
        window.history.replaceState({}, document.title);

        // Thực hiện hành động tương ứng
        if (action === 'cart') {
          await handleAddToCart();
        } else if (action === 'buy') {
          handleBuyNow();
        }
      }
    };

    checkLoginStatus();
  }, [user, product, location?.state]);

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

  // Tính toán số lượng có thể thêm vào
  const existingCartItem = cartItems.find(item => item.id === product.id);
  const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
  const maxAddableQuantity = product.stock - existingQuantity;

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
                        max={maxAddableQuantity > 0 ? Math.min(maxAddableQuantity, product.stock) : product.stock}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="quantity-input"
                      />
                      {existingQuantity > 0 && (
                        <div style={{ marginTop: 5 }}>
                          <Text type="secondary">
                            (Đã có {existingQuantity} sản phẩm trong giỏ hàng)
                          </Text>
                        </div>
                      )}
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
                          disabled={product.stock === 0 || maxAddableQuantity <= 0}
                          className="add-to-cart-btn"
                        >
                          {product.stock === 0
                            ? "Hết hàng"
                            : maxAddableQuantity <= 0
                              ? "Đã đạt giới hạn"
                              : "Thêm vào giỏ hàng"}
                        </Button>
                        <Button
                          type="default"
                          size="large"
                          onClick={handleBuyNow}
                          disabled={product.stock === 0 || maxAddableQuantity <= 0}
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
                    className="html-preview"
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

      {/* Sử dụng LoginRequiredModal component */}
      <LoginRequiredModal
        isVisible={isLoginModalVisible}
        onCancel={handleModalCancel}
        actionType={actionType}
        returnUrl={`/products/${id}`}
      />
    </Layout>
  );
};

export default ProductDetail;
