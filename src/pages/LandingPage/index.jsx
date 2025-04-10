import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link as ScrollLink, Element, Events, scrollSpy } from "react-scroll";
import { Layout, Typography, Card, Button, Row, Col, Carousel, Dropdown } from "antd";
import { ArrowRightOutlined, CheckCircleOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import "./LandingPage.scss";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import useProductStore from "@/stores/useProductStore";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useAuthStore from '../../stores/useAuthStore';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Meta } = Card;

const LandingPage = () => {
  const { products, fetchProducts } = useProductStore();
  const { designIdeas, fetchDesignIdeas } = useDesignIdeaStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchDesignIdeas();
  }, [fetchProducts, fetchDesignIdeas]);
  
  useEffect(() => {
    Events.scrollEvent.register("begin", () => {});
    Events.scrollEvent.register("end", () => {});
    scrollSpy.update();

    return () => {
      Events.scrollEvent.remove("begin");
      Events.scrollEvent.remove("end");
    };
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      easing: "ease-out",
    });
  }, []);

  return (
    <Layout>
      <Navigation />
      <Content>
        {/* Hero Section */}
        <Element name="hero" className="hero-section">
          <div className="hero-content" data-aos="fade-up">
            <Title>Không Gian Xanh Cho Cuộc Sống Hiện Đại</Title>
            <Paragraph>
              Chúng tôi mang đến giải pháp thiết kế và thi công không gian xanh
              chuyên nghiệp, giúp bạn tạo nên môi trường sống trong lành và thẩm
              mỹ.
            </Paragraph>
            <ScrollLink to="features" smooth={true} duration={500}>
              <Button type="primary" size="large">
                Khám Phá Ngay <ArrowRightOutlined />
              </Button>
            </ScrollLink>
          </div>
        </Element>

        {/* Features Section */}
        <Element name="features" className="features-section">
          <div className="container">
            <Row gutter={[32, 32]} justify="center">
              <Col xs={24} sm={8}>
                <Card
                  className="feature-card"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <CheckCircleOutlined className="feature-icon" />
                  <Title level={4}>Thiết Kế Chuyên Nghiệp</Title>
                  <Paragraph>
                    Đội ngũ thiết kế giàu kinh nghiệm, sáng tạo trong từng chi
                    tiết
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card
                  className="feature-card"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <CheckCircleOutlined className="feature-icon" />
                  <Title level={4}>Vật Liệu Cao Cấp</Title>
                  <Paragraph>
                    Sử dụng các loại vật liệu và cây xanh chất lượng cao
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card
                  className="feature-card"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  <CheckCircleOutlined className="feature-icon" />
                  <Title level={4}>Bảo Hành Lâu Dài</Title>
                  <Paragraph>
                    Cam kết chất lượng và bảo hành dài hạn cho mọi công trình
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </Element>

        {/* Design Templates Section */}
        <Element name="designs" className="designs-section">
          <div className="container">
            <Title level={2} data-aos="fade-up">
              Mẫu Thiết Kế Nổi Bật
            </Title>
            <Carousel
              autoplay
              dots={true}
              arrows={true}
              slidesToShow={4}
              slidesToScroll={1}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 3,
                  },
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                  },
                },
                {
                  breakpoint: 576,
                  settings: {
                    slidesToShow: 1,
                  },
                },
              ]}
            >
              {designIdeas.map((design, index) => (
                  <Card
                    hoverable
                    className="design-card"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    style={{ padding: "16px" }}
                    cover={
                      <img alt={design.name} src={design.image.imageUrl} style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }} />
                    }
                  >
                    <Meta
                      title={<div
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          height: "24px",
                        }}
                      >
                        {design.name}
                      </div>}
                      description={
                        <div
                          style={{
                            height: "66px",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {design.description}
                        </div>
                      }
                    />
                    <div className="price">
                      {design.totalPrice.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </div>
                    <Button type="primary" block>
                      Xem Chi Tiết
                    </Button>
                  </Card>
              ))}
            </Carousel>
          </div>
        </Element>

        {/* Products Section */}
        <Element name="products" className="products-section">
          <div className="container">
            <Title level={2} data-aos="fade-up">Sản Phẩm & Vật Liệu</Title>
            <Carousel
              autoplay
              dots={true}
              arrows={true}
              slidesToShow={4}
              slidesToScroll={1}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 3,
                  },
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                  },
                },
                {
                  breakpoint: 576,
                  settings: {
                    slidesToShow: 1,
                  },
                },
              ]}
            >
              {products.map((product, index) => (
                <div key={product.id} className="px-3">
                  <Card
                    hoverable
                    className="product-card"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    style={{ padding: "16px" }}
                    cover={
                      <img
                        alt={product.name}
                        src={product.image.imageUrl}
                        style={{
                          width: "100%",
                          height: "300px",
                          objectFit: "cover",
                        }}
                      />
                    }
                  >
                    <Meta
                      title={
                        <div
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            height: "24px",
                          }}
                        >
                          {product.name}
                        </div>
                      }
                      description={
                        <div
                          style={{
                            height: "66px",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {product.description}
                        </div>
                      }
                    />
                    <div className="price">
                      {product.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </div>
                    <Button type="primary" block>
                      Mua Ngay
                    </Button>
                  </Card>
                </div>
              ))}
            </Carousel>
          </div>
        </Element>

        {/* Call to Action Section */}
        <Element name="cta" className="cta-section">
          <div className="container">
            <Title level={2}>Bắt Đầu Dự Án Của Bạn</Title>
            <Paragraph>
              Hãy để chúng tôi giúp bạn hiện thực hóa không gian xanh trong mơ
            </Paragraph>
            <Button type="primary" size="large">
              Liên Hệ Tư Vấn
            </Button>
          </div>
        </Element>
      </Content>
      <Footer />
    </Layout>
  );
};

// Update the Navigation component
const Navigation = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Debug log để kiểm tra user
  console.log("Current user:", user);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin tài khoản',
      onClick: () => navigate('/profile')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: () => {
        logout();
        navigate('/');
      },
    },
  ];

  // Kiểm tra user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      console.log("User from localStorage:", JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="navigation">
      <Link to="/home" className="logo-link">
        <img
          src="../../../src/assets/logo.png"
          alt="Logo"
          style={{ width: "120px", height: "auto" }}
        />
      </Link>
      <div className="nav-links">
        <ScrollLink
          to="hero"
          spy={true}
          smooth={true}
          duration={500}
          activeClass="active"
        >
          Trang chủ
        </ScrollLink>
        <ScrollLink
          to="features"
          spy={true}
          smooth={true}
          duration={500}
          activeClass="active"
        >
          Tính năng
        </ScrollLink>
        <ScrollLink
          to="designs"
          spy={true}
          smooth={true}
          duration={500}
          activeClass="active"
        >
          Thiết kế
        </ScrollLink>
        <ScrollLink
          to="products"
          spy={true}
          smooth={true}
          duration={500}
          activeClass="active"
        >
          Sản phẩm
        </ScrollLink>
        <ScrollLink
          to="cta"
          spy={true}
          smooth={true}
          duration={500}
          activeClass="active"
        >
          Liên hệ
        </ScrollLink>
      </div>
      <div className="auth-links">
        {user || localStorage.getItem('user') ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Button icon={<UserOutlined />} className="flex items-center">
              {user?.name || JSON.parse(localStorage.getItem('user'))?.name || 'Tài khoản'}
            </Button>
          </Dropdown>
        ) : (
          <>
            <Link to="/login" className="login-link">
              Đăng nhập
            </Link>
            <Link to="/register" className="register-link">
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
