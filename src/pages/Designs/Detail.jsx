import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout, Typography, Row, Col, Card, Spin, Empty } from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import "./styles.scss";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const DesignDetailPage = () => {
  const { id } = useParams();
  const { currentDesign, fetchDesignIdeaById, isLoading: designLoading, error: designError } = useDesignIdeaStore();
  const { getProductById } = useProductStore();
  const [productDetails, setProductDetails] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);

  useEffect(() => {
    const loadDesign = async () => {
      try {
        await fetchDesignIdeaById(id);
      } catch (error) {
        console.error("Error loading design:", error);
      }
    };

    if (id) {
      loadDesign();
    }
  }, [id, fetchDesignIdeaById]);

  useEffect(() => {
    const loadProductDetails = async () => {
      if (!currentDesign?.productDetails?.length) return;

      setIsLoadingProducts(true);
      setProductError(null);

      try {
        const productPromises = currentDesign.productDetails.map(async (detail) => {
          try {
            const product = await getProductById(detail.productId);
            return {
              ...detail,
              product: product
            };
          } catch (error) {
            console.error(`Error fetching product ${detail.productId}:`, error);
            return {
              ...detail,
              product: null
            };
          }
        });

        const results = await Promise.all(productPromises);
        setProductDetails(results);
      } catch (error) {
        console.error("Error loading product details:", error);
        setProductError(error.message);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    if (currentDesign?.productDetails) {
      loadProductDetails();
    }
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
    <Layout className="design-detail-layout">
      <Header />
      <Content>
        <div className="design-detail-hero">
          <div className="container">
            <Title level={1}>{currentDesign.name}</Title>
            <Paragraph>{currentDesign.description}</Paragraph>
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
                  />
                  <Row gutter={[16, 16]} className="sub-images">
                    <Col span={8}>
                      <img
                        alt="Sub 1"
                        src={currentDesign.image.image2}
                        className="sub-image"
                      />
                    </Col>
                    <Col span={8}>
                      <img
                        alt="Sub 2"
                        src={currentDesign.image.image3}
                        className="sub-image"
                      />
                    </Col>
                  </Row>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <Card className="design-info-card">
                  <Title level={3}>Thông tin thiết kế</Title>
                  <div className="price-info">
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

                  <div className="category-info">
                    <Title level={4}>Danh mục</Title>
                    <Paragraph>{currentDesign.categoryName}</Paragraph>
                  </div>

                  <div className="product-details">
                    <Title level={4}>Chi tiết sản phẩm</Title>
                    {isLoadingProducts ? (
                      <Spin />
                    ) : productError ? (
                      <Paragraph type="danger">{productError}</Paragraph>
                    ) : (
                      productDetails.map((detail, index) => (
                        <div key={detail.productId} className="product-item">
                          {detail.product ? (
                            <>
                              <div className="product-info">
                                <img 
                                  src={detail.product.image?.imageUrl} 
                                  alt={detail.product.name}
                                  className="product-image"
                                />
                                <div className="product-text">
                                  <span className="product-name">{detail.product.name}</span>
                                  <span className="product-description">{detail.product.description}</span>
                                </div>
                              </div>
                              <div className="product-meta">
                                <span>Số lượng: {detail.quantity}</span>
                                <span>{detail.price.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })}</span>
                              </div>
                            </>
                          ) : (
                            <div className="product-error">
                              Không thể tải thông tin sản phẩm
                            </div>
                          )}
                        </div>
                      ))
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
  );
};

export default DesignDetailPage; 