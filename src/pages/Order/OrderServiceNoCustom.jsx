import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
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
  App,
} from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import useAuthStore from "@/stores/useAuthStore";
import "./styles.scss";
import UserInfoCard from '../../components/Order/UserInfoCard';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const OrderServiceNoCustom = () => {
  const { id } = useParams();
  const { currentDesign, fetchDesignIdeaById, isLoading: designLoading } = useDesignIdeaStore();
  const { getProductById } = useProductStore();
  const [productDetails, setProductDetails] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);
  const mountedRef = useRef(true);
  const { message: messageApi } = App.useApp();

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
        if (error.name !== 'CanceledError' && mountedRef.current) {
          messageApi.error("Không thể tải thông tin thiết kế");
        }
      }
    };
    loadDesign();
  }, [id, fetchDesignIdeaById, messageApi]);

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
        const productPromises = currentDesign.productDetails.map(async (detail) => {
          try {
            const product = await getProductById(detail.productId);
            
            if (!isMounted) return null;
            
            if (product) {
              return {
                detail,
                product
              };
            } else {
              return null;
            }
          } catch (error) {
            return null;
          }
        });

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

  const handleSubmit = async () => {
    try {
      const { user } = useAuthStore.getState();
      
      const orderData = {
        userId: user.id,
        userEmail: user.email,
        designId: currentDesign.id,
        products: productDetails.map(({ detail, product }) => ({
          productId: product.id,
          quantity: detail.quantity,
          price: detail.price
        })),
        totalPrice: currentDesign.totalPrice,
        designPrice: currentDesign.designPrice,
        materialPrice: currentDesign.materialPrice
      };

      console.log('Submitting order:', orderData);
      // TODO: Implement order submission
      messageApi.success("Đặt hàng thành công!");
    } catch (error) {
      console.error('Order submission error:', error);
      messageApi.error("Có lỗi xảy ra khi đặt hàng");
    }
  };

  const handleUserInfoChange = (updatedUserInfo) => {
    console.log('User info updated:', updatedUserInfo);
    // You can use this updated info when submitting the order
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
            <Title level={1}>Đặt hàng thiết kế</Title>
            
            <div className="order-form">
              {/* User Information Section */}
              <UserInfoCard onUserInfoChange={handleUserInfoChange} />

              {/* Design Information Section */}
              <Card title="Thông tin thiết kế" className="form-section">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <img
                      src={currentDesign.image.imageUrl}
                      alt={currentDesign.name}
                      className="design-image"
                    />
                  </Col>
                  <Col span={24}>
                    <Title level={4}>{currentDesign.name}</Title>
                    <Paragraph>{currentDesign.description}</Paragraph>
                  </Col>
                </Row>
              </Card>

              {/* Product List Section */}
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

              {/* Price Summary Section */}
              <Card title="Tổng quan giá" className="form-section">
                <div className="price-summary">
                  <div className="price-item">
                    <span>Giá thiết kế:</span>
                    <span>{currentDesign.designPrice.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}</span>
                  </div>
                  <div className="price-item">
                    <span>Giá vật liệu:</span>
                    <span>{currentDesign.materialPrice.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}</span>
                  </div>
                  <div className="price-item total">
                    <span>Tổng giá:</span>
                    <span>{currentDesign.totalPrice.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}</span>
                  </div>
                </div>
              </Card>

              {/* Submit Button */}
              <div className="form-actions">
                <Button type="primary" size="large" onClick={handleSubmit}>
                  Xác nhận đặt hàng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default OrderServiceNoCustom;
