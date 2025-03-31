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
} from "antd";
import { ShoppingCartOutlined, StarOutlined, UserOutlined } from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useProductStore from "@/stores/useProductStore";
import useCartStore from "@/stores/useCartStore";
import useAuthStore from "@/stores/useAuthStore";
import dayjs from 'dayjs';
import "./ProductDetail.scss";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const ProductDetail = () => {
  const { id } = useParams();
  const { getProductById, isLoading, createProductFeedback, feedbackLoading, getProductFeedbacks } = useProductStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [feedbacks, setFeedbacks] = useState([]);
  const [form] = Form.useForm();
  const [showError, setShowError] = useState(false);

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
        if (error.name !== 'CanceledError' && mountedRef.current) {
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
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleFeedbackSubmit = async (values) => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để gửi đánh giá");
      return;
    }

    try {
      await createProductFeedback({
        userId: user.id,
        productId: id,
        rating: values.rating,
        description: values.description
      });
      message.success("Cảm ơn bạn đã gửi đánh giá!");
      form.resetFields();
      // Refresh feedbacks after submitting
      await fetchFeedbacks();
    } catch (error) {
      message.error("Không thể gửi đánh giá. Vui lòng thử lại sau.");
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.submit();
    }
  };

  // Show loading state
  if (isLoading || (!product && !showError)) {
    return (
      <Layout>
        <Header />
        <Content className="product-detail-loading">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
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
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Title level={3}>Không tìm thấy sản phẩm</Title>
            <Text type="secondary">Sản phẩm không tồn tại hoặc đã bị xóa</Text>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout className="product-detail-layout">
      <Header />
      <Content>
        <div className="product-detail-content">
          <div className="container">
            <Card bordered={false}>
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
                    {/* <span className="product-category">
                      {product.categoryName}
                    </span> */}
                    <Title level={2}>{product.name}</Title>
                    <div className="product-price">
                      {product.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </div>
                    <Paragraph className="product-description">
                      {product.description}
                    </Paragraph>
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
                      {/* Add more product details as needed */}
                    </Descriptions>
                    <Divider />
                    <div className="product-actions">
                      <div className="quantity-selector">
                        <span className="label">Số lượng:</span>
                        <InputNumber
                          min={1}
                          max={product.stock}
                          value={quantity}
                          onChange={setQuantity}
                          className="quantity-input"
                        />
                      </div>
                      <Space size="middle">
                        <Button
                          type="primary"
                          size="large"
                          icon={<ShoppingCartOutlined />}
                          onClick={handleAddToCart}
                          disabled={product.stock === 0}
                          className="add-to-cart-btn"
                        >
                          {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                        </Button>
                      </Space>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Feedback Section */}
            <Card bordered={false} className="feedback-section" style={{ marginTop: 24 }}>
              <Title level={4}>Đánh giá sản phẩm</Title>
              
              {/* Feedback List */}
              <List
                className="feedback-list"
                itemLayout="horizontal"
                dataSource={feedbacks}
                locale={{ emptyText: "Chưa có đánh giá nào" }}
                renderItem={item => (
                  <List.Item>
                    <div className="feedback-item">
                      <div className="feedback-item-header">
                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
                        <div className="feedback-item-meta">
                          <Text strong>{item.userName}</Text>
                          <Text type="secondary">
                            {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                          </Text>
                        </div>
                      </div>
                      <div className="feedback-content">
                        <Rate disabled defaultValue={item.rating} />
                        <Paragraph>{item.description}</Paragraph>
                        {item.reply && (
                          <div className="feedback-reply">
                            <div className="reply-header">
                              <Avatar 
                                src="https://img.icons8.com/color/48/000000/shop.png"
                                style={{ backgroundColor: 'white' }}
                              />
                              <Text type="success" strong>Phản hồi từ shop</Text>
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

              <Divider />

              {/* Feedback Form */}
              {user ? (
                <div className="feedback-form-container">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFeedbackSubmit}
                    initialValues={{ rating: 5 }}
                    className="feedback-form"
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        name="rating"
                        rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
                      >
                        <Rate className="rating-stars" />
                      </Form.Item>
                      <Form.Item
                        name="description"
                        rules={[
                          { required: true, message: "Vui lòng nhập nhận xét" },
                          { min: 3, message: "Nhận xét phải có ít nhất 3 ký tự" }
                        ]}
                      >
                        <TextArea
                          rows={3}
                          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm... (Enter để gửi, Shift + Enter để xuống dòng)"
                          maxLength={500}
                          showCount
                          onKeyDown={handleKeyDown}
                        />
                      </Form.Item>
                      <Form.Item className="submit-section">
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          loading={feedbackLoading}
                          icon={<StarOutlined />}
                          style={{ marginTop: 10 }}
                        >
                          Gửi đánh giá
                        </Button>
                      </Form.Item>
                    </Space>
                  </Form>
                </div>
              ) : (
                <div className="login-prompt">
                  <Text type="secondary">
                    Vui lòng <a href="/login">đăng nhập</a> để gửi đánh giá về sản phẩm
                  </Text>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default ProductDetail;
