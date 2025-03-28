import React, { useEffect, useState } from "react";
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
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useProductStore from "@/stores/useProductStore";
import "./ProductDetail.scss";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const { getProductById, isLoading } = useProductStore();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        // message.error("Không thể tải thông tin sản phẩm");
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, getProductById]);

  // TODO: Implement cart feature
  const handleAddToCart = () => {
    message.info("Tính năng giỏ hàng đang được phát triển");
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

  if (isLoading) {
    return (
      <Layout>
        <Header />
        <Content className="product-detail-loading">
          <Spin size="large" />
        </Content>
        <Footer />
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <Header />
        <Content className="product-detail-error">
          <Title level={3}>Không tìm thấy sản phẩm</Title>
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
                        {product.size}
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
                      <Button
                        type="primary"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default ProductDetail;
