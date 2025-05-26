import React, { useEffect, useCallback, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout, Typography, Row, Col, Card, Spin, Empty, Button, Breadcrumb, Space, Tag } from "antd";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import useAuthStore from "@/stores/useAuthStore";
import DesignLoginModal from "./components/DesignLoginModal";
import "./styles.scss";
import { AppstoreOutlined, HomeOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const DesignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const componentId = useRef(`design-detail-${id}`);
  const {
    currentDesign,
    fetchDesignIdeaById,
    isLoading: designLoading,
    error: designError,
  } = useDesignIdeaStore();
  const { getProductById } = useProductStore();
  const { user, isAuthenticated } = useAuthStore();
  const mountedRef = useRef(true);
  const [productDetails, setProductDetails] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');

  //console.log("currentDesign", currentDesign);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load design data
  const loadDesign = useCallback(async () => {
    if (!id || !mountedRef.current) return;

    try {
      const design = await fetchDesignIdeaById(id, componentId.current);
    } catch (error) {
      if (error.name !== "CanceledError" && mountedRef.current) {
        // Handle error silently
      }
    }
  }, [id, fetchDesignIdeaById]);

  // Initial load of design
  useEffect(() => {
    loadDesign();
  }, [loadDesign]);

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
        // Create an array to store all product promises
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

        // Wait for all promises to resolve
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

  const handleBuyDesign = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setActionType('buy');
      setLoginModalVisible(true);
    } else {
      navigate(`/order-service/${currentDesign.id}`, { state: { isCustom: false } });
    }
  };

  const handleCustomizeDesign = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setActionType('customize');
      setLoginModalVisible(true);
    } else {
      navigate(`/service-order-customize/${currentDesign.id}`, { state: { isCustom: true } });
    }
  };

  const handleLoginModalClose = () => {
    setLoginModalVisible(false);
  };

  if (designLoading) {
    return (
      <Layout >
        <Header />
        <Content>
          <div className="container">
            <div className="loading-container">
              <Spin size="large" />
            </div>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  if (designError || !currentDesign) {
    return (
      <Layout >
        <Header />
        <Content>
          <div className="container">
            <Empty description="Không tìm thấy thiết kế" />
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <>
      <Layout className="design-detail-layout">
        <Header />
        <Content>
          <div className="design-detail-hero">
            <div className="container">
              <Breadcrumb style={{
                marginBottom: '20px',
                padding: '12px 16px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Breadcrumb.Item onClick={() => navigate("/Home")} style={{ cursor: 'pointer' }}>
                  <HomeOutlined /> Trang chủ
                </Breadcrumb.Item>
                <Breadcrumb.Item onClick={() => navigate("/Designs")} style={{ cursor: 'pointer' }}>
                  <AppstoreOutlined /> Ý tưởng thiết kế
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <span style={{ fontWeight: 'bold' }}>{currentDesign.name}</span>
                </Breadcrumb.Item>
              </Breadcrumb>

            </div>
          </div>

          <div className="design-detail-content">
            <div className="container">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={16}>
                  <div className="design-images">
                    <Card
                      cover={
                        <img
                          alt={currentDesign.name}
                          src={currentDesign.image.imageUrl}
                          className="main-image"
                        />
                      }
                    >
                      <Row gutter={[16, 16]} className="sub-images">
                        {currentDesign.image?.image2 && (
                          <Col span={8}>
                            <img
                              alt="Sub 1"
                              src={currentDesign.image?.image2}
                              className="sub-image"
                            />
                          </Col>
                        )}
                        {currentDesign.image?.image3 && (
                          <Col span={8}>
                            <img
                              alt="Sub 2"
                              src={currentDesign.image?.image3}
                              className="sub-image"
                            />
                          </Col>
                        )}
                      </Row>

                    </Card>
                    <Card title="Mô tả" style={{ marginTop: '16px', marginBottom: '16px' }}>
                      <div
                        className="html-preview"
                        dangerouslySetInnerHTML={{
                          __html: currentDesign.description,
                        }}
                      />
                    </Card>
                  </div>
                </Col>

                <Col xs={24} md={8}>
                  <Card className="design-info-card">
                    <Title level={3} style={{ fontWeight: 'bold' }}>{currentDesign.name}</Title>
                    <div className="price-info">
                      <Title level={4} >Thông tin thiết kế</Title>
                      <div className="price-item">
                        <span>Giá thiết kế:</span>
                        <span>
                          {currentDesign.designPrice.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </span>
                      </div>
                      <div className="price-item">
                        <span>Giá vật liệu:</span>
                        <span>
                          {currentDesign.materialPrice.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </span>
                      </div>
                      <div className="price-item total">
                        <span>Tổng giá:</span>
                        <span>
                          {currentDesign.totalPrice.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </span>
                      </div>
                    </div>

                    <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <Title level={4}>Danh mục</Title>
                      <Tag color="blue">{currentDesign.categoryName}</Tag>
                    </Space>

                    <div style={{ marginBottom: '16px' }}>
                      <Button
                        type="primary"
                        block
                        onClick={handleBuyDesign}
                      >
                        Mua thiết kế
                      </Button>
                      {/* <Button
                        type="default"
                        size="large"
                        block
                        style={{ marginTop: "10px" }}
                        onClick={handleCustomizeDesign}
                      >
                        Tùy chỉnh
                      </Button> */}
                    </div>

                    <div className="product-details">
                      <Title level={4}>Chi tiết sản phẩm</Title>
                      {isLoadingProducts ? (
                        <div className="loading-container">
                          <Spin />
                        </div>
                      ) : productError ? (
                        <Paragraph type="danger">{productError}</Paragraph>
                      ) : productDetails.length > 0 ? (
                        productDetails.map(({ detail, product }) => (
                          <div key={detail.productId} className="product-item">
                            <div className="product-info">
                              <img
                                src={product.image?.imageUrl}
                                alt={product.name}
                                className="product-image"
                              />
                              <div className="product-text">
                                <span className="product-name">
                                  {product.name}
                                </span>
                                <span className="product-description">
                                  <div dangerouslySetInnerHTML={{
                                    __html: product.description,
                                  }} />
                                </span>
                              </div>
                            </div>
                            <div className="product-meta">
                              <span>Số lượng: {detail.quantity}</span>
                              <span>
                                {detail.price.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <Empty description="Không có sản phẩm nào" />
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        </Content>
        <Footer />

        {/* Sử dụng component DesignLoginModal */}
        <DesignLoginModal
          isVisible={loginModalVisible}
          onCancel={handleLoginModalClose}
          actionType={actionType}
          designId={id}
        />
      </Layout>
    </>
  );
};

export default DesignDetailPage;
