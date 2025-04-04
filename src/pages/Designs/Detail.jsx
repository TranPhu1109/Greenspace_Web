import React, { useEffect, useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout, Typography, Row, Col, Card, Spin, Empty, Button } from "antd";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import "./styles.scss";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const DesignDetailPage = () => {
  const { id } = useParams();
  const componentId = useRef(`design-detail-${id}`);
  const {
    currentDesign,
    fetchDesignIdeaById,
    isLoading: designLoading,
    error: designError,
  } = useDesignIdeaStore();
  const { getProductById } = useProductStore();
  const mountedRef = useRef(true);
  const [productDetails, setProductDetails] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);

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
      console.log("Fetching design details for ID:", id);
      const design = await fetchDesignIdeaById(id, componentId.current);
      console.log("Design details received:", design);
    } catch (error) {
      console.error("Error loading design:", error);
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

  if (designLoading) {
    return (
      <Layout className="design-detail-layout">
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
      <Layout className="design-detail-layout">
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
              <Title level={1}>{currentDesign.name}</Title>
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
                        {currentDesign.image.image2 && (
                          <Col span={8}>
                            <img
                              alt="Sub 1"
                              src={currentDesign.image.image2}
                              className="sub-image"
                            />
                          </Col>
                        )}
                        {currentDesign.image.image3 && (
                          <Col span={8}>
                            <img
                              alt="Sub 2"
                              src={currentDesign.image.image3}
                              className="sub-image"
                            />
                          </Col>
                        )}
                      </Row>
                      
                    </Card>
                    <Card title="Mô tả">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: currentDesign.description,
                        }}
                      />
                    </Card>
                  </div>
                </Col>

                <Col xs={24} md={8}>
                  <Card className="design-info-card">
                    <Title level={3}>Thông tin thiết kế</Title>
                    <div className="price-info">
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

                    <div className="category-info">
                      <Title level={4}>Danh mục</Title>
                      <Paragraph>{currentDesign.categoryName}</Paragraph>
                    </div>

                    <div className="design-actions">
                      <Link
                        to={`/order-service/${currentDesign.id}`}
                        state={{ isCustom: false }}
                      >
                        <Button type="primary" block>
                          Mua thiết kế
                        </Button>
                      </Link>
                      <Link
                        to={`/order-service/${currentDesign.id}`}
                        state={{ isCustom: true }}
                      >
                        <Button
                          type="default"
                          size="large"
                          block
                          style={{ marginTop: "10px" }}
                        >
                          Tùy chỉnh
                        </Button>
                      </Link>
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
                                  {product.description}
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
      </Layout>
    </>
  );
};

export default DesignDetailPage;
