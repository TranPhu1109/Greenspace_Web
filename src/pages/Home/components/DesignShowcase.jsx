import React from "react";
import { Card, Typography, Row, Col, Button } from "antd";
import { Link } from "react-router-dom";
import { ArrowRightOutlined, RightOutlined } from "@ant-design/icons";
import "./styles.scss";

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const DesignShowcase = ({ designs }) => {
  return (
    <section className="design-showcase">
      <div className="container">
        <div className="section-header">
          <Title level={2}>Ý Tưởng Thiết Kế</Title>
          <Paragraph>
            Khám phá những ý tưởng thiết kế độc đáo cho không gian của bạn
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {designs.length === 0
            ? // Skeleton loading
            [...Array(6)].map((_, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card loading={true} className="product-card" />
              </Col>
            ))
            : designs.map((design) => (
              <Col xs={24} sm={12} key={design.id}>
                <Card
                  hoverable
                  className="design-card"
                  cover={
                    <img
                      alt={design.name}
                      src={design.image.imageUrl}
                      className="design-image"
                    />
                  }
                >
                  <Meta
                    title={design.name}
                    description={
                      <div className="design-info">
                        {/* <p
                          className="design-description"
                          dangerouslySetInnerHTML={{ __html: design.description }}
                        ></p> */}
                        <p className="design-price">
                          {design.totalPrice.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </p>
                      </div>
                    }
                  />
                  <Link to={`/designs/${design.id}`}>
                    <Button type="primary" block>
                      Xem Chi Tiết
                    </Button>
                  </Link>
                </Card>
              </Col>
            ))}
        </Row>

        <div className="section-footer" >
          <Link to="/designs">
            <Button type="primary" size="large" icon={<ArrowRightOutlined />}>
              Khám Phá Thêm Thiết Kế
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DesignShowcase;
