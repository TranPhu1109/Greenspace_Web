import React from "react";
import { Typography, Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Paragraph } = Typography;

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <Title className="animate__animated animate__fadeInDown">
          Không Gian Xanh Cho Cuộc Sống Hiện Đại
        </Title>
        <Paragraph className="animate__animated animate__fadeInUp animate__delay-1s">
          Chúng tôi mang đến giải pháp thiết kế và thi công không gian xanh
          chuyên nghiệp, giúp bạn tạo nên môi trường sống trong lành và thẩm mỹ.
        </Paragraph>
        <div className="hero-buttons animate__animated animate__fadeInUp animate__delay-2s">
          <Link to="/designs">
            <Button type="primary" size="large" className="main-button">
              Khám Phá Ngay <ArrowRightOutlined />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="large" className="secondary-button">
              Liên Hệ Tư Vấn
            </Button>
          </Link>
        </div>
      </div>
      <div className="hero-overlay"></div>
    </section>
  );
};

export default HeroSection; 