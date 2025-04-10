import React from "react";
import { Typography, Row, Col, Card, Button } from "antd";
import { Link } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import "./styles.scss";

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const FeaturedProducts = ({ products }) => {
  return (
    <section className="featured-products">
      <div className="container">
        <div className="section-header">
          <Title level={2}>Sản Phẩm Nổi Bật</Title>
          <Paragraph>
            Khám phá các sản phẩm chất lượng cao cho không gian xanh của bạn
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {products.length === 0 ? (
            // Skeleton loading
            [...Array(6)].map((_, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card loading={true} className="product-card" />
              </Col>
            ))
          ) : (
            // Actual products
            products.map((product) => (
              <Col xs={24} sm={12} md={8} key={product.id}>
                <Card
                  hoverable
                  className="product-card"
                  cover={
                    <img
                      alt={product.name}
                      src={product.image.imageUrl}
                      className="product-image"
                    />
                  }
                >
                  <Meta
                    title={product.name}
                    description={
                      <div className="product-info">
                        {/* <p className="product-description" dangerouslySetInnerHTML={{ __html: product.description }}></p> */}
                        <p className="product-price">
                          {product.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </p>
                      </div>
                    }
                  />
                  <Link to={`/products/${product.id}`}>
                    <Button type="primary" block>
                      Xem Chi Tiết
                    </Button>
                  </Link>
                </Card>
              </Col>
            ))
          )}
        </Row>

        <div className="section-footer">
          <Link to="/products">
            <Button type="primary" size="large" icon={<ArrowRightOutlined />}>
              Xem Tất Cả Sản Phẩm
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts; 