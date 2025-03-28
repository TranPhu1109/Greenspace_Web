import React from "react";
import { Typography, Button, Row, Col } from "antd";
import { PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Paragraph } = Typography;

const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12}>
            <div className="cta-content">
              <Title level={2}>Bắt Đầu Dự Án Của Bạn</Title>
              <Paragraph>
                Hãy để chúng tôi giúp bạn hiện thực hóa không gian xanh trong mơ.
                Đội ngũ chuyên gia của chúng tôi sẽ tư vấn và thiết kế phương án
                tối ưu nhất cho không gian của bạn.
              </Paragraph>
              <div className="contact-info">
                <div className="contact-item">
                  <PhoneOutlined /> <span>0963.202.427</span>
                </div>
                <div className="contact-item">
                  <MailOutlined /> <span>contact@greenspace.com</span>
                </div>
              </div>
              <div className="cta-buttons">
                <Link to="/contact">
                  <Button type="primary" size="large">
                    Liên Hệ Ngay
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="large">Tìm Hiểu Thêm</Button>
                </Link>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="cta-image">
              <img
                src="/images/cta-image.jpg"
                alt="Green Space Design"
                className="rounded-image"
              />
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default CTASection; 