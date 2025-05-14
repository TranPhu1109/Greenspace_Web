import React, { useEffect, useState } from 'react';
import { Layout, Typography, Row, Col, Card, Button, Statistic, BackTop, Divider } from 'antd';
import {
  ShopOutlined,
  BulbOutlined,
  ToolOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  HeartOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  SmileOutlined,
  ArrowRightOutlined,
  UserOutlined,
  StarOutlined,
  LikeOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  CustomerServiceOutlined,
  UpCircleOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './styles.scss';
import heroImage from '@/assets/thiet-ke-va-thi-cong-san-vuon.jpg';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("about-hero");

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-out-cubic',
      once: false,
      mirror: true,
      offset: 120,
      delay: 100,
    });
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Track active section
      const sections = ['about-hero', 'about-stats', 'about-services', 'about-features', 'about-cta'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return rect.top <= 200 && rect.bottom >= 200;
      });
      
      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize on mount

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeSection]);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  // Calculate parallax effects based on scroll position
  const heroParallax = scrollY * 0.4;
  const statsParallax = (scrollY - 800) * 0.2;

  const services = [
    {
      icon: <BulbOutlined className="service-icon" />,
      title: 'Thiết kế mẫu',
      description: 'Khám phá bộ sưu tập thiết kế mẫu đa dạng và độc đáo cho không gian xanh của bạn. Từ vườn ban công đến sân vườn rộng lớn.',
      link: '/designs',
      color: '#36cfc9',
      iconBg: 'rgba(54, 207, 201, 0.1)'
    },
    {
      icon: <RocketOutlined className="service-icon" />,
      title: 'Thiết kế theo yêu cầu',
      description: 'Đặt thiết kế riêng theo ý tưởng và mong muốn của bạn với đội ngũ thiết kế chuyên nghiệp. Tư vấn và phác thảo miễn phí.',
      link: '/designs',
      color: '#ff7a45',
      iconBg: 'rgba(255, 122, 69, 0.1)'
    },
    {
      icon: <ShopOutlined className="service-icon" />,
      title: 'Vật liệu trang trí',
      description: 'Cung cấp đa dạng vật liệu trang trí chất lượng cao cho không gian xanh. Từ chậu cây nghệ thuật đến đèn trang trí độc đáo.',
      link: '/products',
      color: '#9254de',
      iconBg: 'rgba(146, 84, 222, 0.1)'
    },
  ];

  const features = [
    'Đội ngũ thiết kế chuyên nghiệp với hơn 10 năm kinh nghiệm',
    'Tư vấn và hỗ trợ 24/7 qua điện thoại và chat trực tuyến',
    'Sản phẩm chất lượng cao với giá cả cạnh tranh, bảo hành dài hạn',
    'Giao hàng nhanh chóng và đảm bảo trong 24h nội thành',
    'Thanh toán an toàn và tiện lợi với nhiều phương thức',
    'Chính sách bảo hành và đổi trả linh hoạt trong 30 ngày',
  ];

  const stats = [
    {
      title: 'Khách hàng',
      value: 5000,
      icon: <SmileOutlined className="stat-icon" style={{ color: '#52c41a' }} />,
      suffix: '+',
    },
    {
      title: 'Dự án hoàn thành',
      value: 1000,
      icon: <TrophyOutlined className="stat-icon" style={{ color: '#1890ff' }} />,
      suffix: '+',
    },
    {
      title: 'Đánh giá 5 sao',
      value: 98,
      icon: <HeartOutlined className="stat-icon" style={{ color: '#fa8c16' }} />,
      suffix: '%',
    },
    {
      title: 'Tỉnh thành phục vụ',
      value: 63,
      icon: <EnvironmentOutlined className="stat-icon" style={{ color: '#f5222d' }} />,
      suffix: '',
    },
  ];

  const values = [
    {
      title: 'Sáng tạo',
      description: 'Luôn đổi mới và tìm kiếm những ý tưởng độc đáo',
      color: '#f5222d',
      icon: '🎨',
    },
    {
      title: 'Chất lượng',
      description: 'Cam kết mang đến sản phẩm và dịch vụ tốt nhất',
      color: '#52c41a',
      icon: '✨',
    },
    {
      title: 'Tận tâm',
      description: 'Lắng nghe và thấu hiểu nhu cầu của khách hàng',
      color: '#1890ff',
      icon: '💙',
    },
  ];

  return (
    <Layout className="about-layout">
      <Header />
      <Content>
        {/* Section Indicators */}
        <div className="section-indicators">
          {['about-hero', 'about-stats', 'about-services', 'about-features', 'about-cta'].map((section) => (
            <div
              key={section}
              className={`indicator ${activeSection === section ? 'active' : ''}`}
              onClick={() => scrollToSection(section)}
              aria-label={`Scroll to ${section} section`}
            />
          ))}
        </div>

        {/* Hero Section */}
        <section id="about-hero" className="hero-section section-container">
          <div className="hero-background">
            <div 
              className="parallax-bg" 
              style={{ transform: `translateY(${heroParallax}px)` }}
            />
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
          
          <div className="container">
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={12}>
                <div className="hero-content" data-aos="fade-right" data-aos-delay="100">
                  <div className="hero-badge">
                    <span>Không gian xanh</span>
                  </div>
                  <Title level={1} className="hero-title">
                    Về Green Space
                  </Title>
                  <Title level={3} className="subtitle">
                    Chúng tôi mang đến giải pháp toàn diện cho không gian xanh của bạn
                  </Title>
                  <Paragraph className="hero-description">
                    Green Space là nền tảng kết nối giữa khách hàng với các dịch vụ thiết kế và cung cấp vật liệu cho không gian xanh. 
                    Chúng tôi cam kết mang đến những giải pháp sáng tạo và chất lượng nhất cho mọi dự án, từ những khu vườn nhỏ đến các công trình cảnh quan lớn.
                  </Paragraph>
                  <Link to="/designs">
                    <Button type="primary" size="large" className="explore-button ripple-btn">
                      Khám phá ngay <ArrowRightOutlined />
                    </Button>
                  </Link>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="hero-image-container" data-aos="fade-left" data-aos-delay="200">
                  <img
                    src={heroImage}
                    alt="Green Space Hero"
                    className="hero-image"
                  />
                  <div className="image-decoration"></div>
                </div>
              </Col>
            </Row>
          </div>

          <div className="scroll-indicator">
            <div className="mouse">
              <div className="wheel"></div>
            </div>
            <div className="scroll-arrow"></div>
            <div className="scroll-arrow"></div>
            <div className="scroll-arrow"></div>
          </div>
        </section>

        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-icon">
            <StarOutlined />
          </div>
          <div className="divider-line"></div>
        </div>

        {/* Stats Section */}
        <section id="about-stats" className="stats-section section-container">
          <div 
            className="stats-background"
            style={{ transform: `translateY(${statsParallax}px)` }}
          ></div>
          <div className="container">
            <Title level={2} className="section-title" data-aos="fade-up">
              Thành tựu của chúng tôi
            </Title>
            <Paragraph className="section-subtitle" data-aos="fade-up" data-aos-delay="100">
              Chúng tôi tự hào về những thành tựu đã đạt được cùng với khách hàng. Những con số này thể hiện cam kết của chúng tôi về chất lượng và sự hài lòng.
            </Paragraph>
            <Row gutter={[32, 32]} justify="center">
              {stats.map((stat, index) => (
                <Col xs={24} sm={12} lg={6} key={stat.title}>
                  <Card className="stat-card" data-aos="zoom-in" data-aos-delay={100 + index * 100}>
                    {stat.icon}
                    <Statistic title={stat.title} value={stat.value} suffix={stat.suffix} />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-icon">
            <ToolOutlined />
          </div>
          <div className="divider-line"></div>
        </div>

        {/* Services Section */}
        <section id="about-services" className="services-section section-container">
          <div className="services-decoration">
            <div className="dot-pattern"></div>
          </div>
          <div className="container">
            <div data-aos="fade-up">
              <Title level={2} className="section-title">Dịch vụ của chúng tôi</Title>
              <Paragraph className="section-subtitle">
                Giải pháp toàn diện cho không gian xanh của bạn - từ thiết kế đến thi công, từ sản phẩm đến dịch vụ
              </Paragraph>
            </div>
            <Row gutter={[32, 32]}>
              {services.map((service, index) => (
                <Col xs={24} sm={12} lg={8} key={service.title}>
                  <Card 
                    className="service-card" 
                    data-aos="fade-up" 
                    data-aos-delay={100 + index * 100}
                  >
                    <div className="service-icon-wrapper" style={{ background: service.color + '10' }}>
                      <span className="service-icon-inner" style={{ color: service.color }}>
                        {service.icon}
                      </span>
                    </div>
                    <h4>{service.title}</h4>
                    <Paragraph>{service.description}</Paragraph>
                    <Link to={service.link} className="service-link">
                      Xem thêm <ArrowRightOutlined />
                    </Link>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-icon">
            <RocketOutlined />
          </div>
          <div className="divider-line"></div>
        </div>

        {/* Features Section */}
        <section id="about-features" className="features-section section-container">
          <div className="features-decoration">
            <div className="leaf leaf-1"></div>
            <div className="leaf leaf-2"></div>
            <div className="leaf leaf-3"></div>
          </div>
          <div className="container">
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={12}>
                <div data-aos="fade-right">
                  <Title level={2} className="features-title">
                    Tại sao chọn Green Space?
                  </Title>
                  <div className="features-list">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="feature-item"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        viewport={{ once: true }}
                      >
                        <CheckCircleOutlined className="feature-icon" />
                        <Paragraph>{feature}</Paragraph>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className="team-image-wrapper" data-aos="fade-left" data-aos-delay="200">
                  <div className="team-icon-wrapper">
                    <TeamOutlined className="team-icon" />
                  </div>
                  <Title level={3}>Đội ngũ chuyên nghiệp</Title>
                  <Paragraph>
                    Với đội ngũ thiết kế giàu kinh nghiệm và đam mê, chúng tôi cam kết mang đến những giải pháp sáng tạo và phù hợp nhất cho không gian của bạn.
                    Mỗi thành viên của Green Space đều được đào tạo chuyên sâu và thường xuyên cập nhật xu hướng thiết kế mới nhất.
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-icon">
            <UserOutlined />
          </div>
          <div className="divider-line"></div>
        </div>

        {/* CTA Section */}
        <section id="about-cta" className="cta-section section-container">
          <div className="cta-bg-shapes">
            <div className="cta-shape shape-1"></div>
            <div className="cta-shape shape-2"></div>
          </div>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="cta-content"
            >
              <Title level={2}>Bắt đầu dự án của bạn ngay hôm nay</Title>
              <Paragraph>
                Hãy để chúng tôi giúp bạn hiện thực hóa ý tưởng về không gian xanh lý tưởng.
                Từ tư vấn thiết kế đến lựa chọn vật liệu, chúng tôi luôn đồng hành cùng bạn trong mọi bước.
              </Paragraph>
              <div className="cta-buttons">
                <Link to="/designs">
                  <Button type="primary" size="large" className="ripple-btn">
                    Xem thiết kế mẫu <ArrowRightOutlined />
                  </Button>
                </Link>
                <Link to="/products">
                  <Button size="large" ghost className="ripple-btn">
                    Khám phá sản phẩm
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </Content>
      <Footer />
      <BackTop className="custom-back-top">
        <div className="back-top-inner">
          <UpCircleOutlined />
        </div>
      </BackTop>
    </Layout>
  );
};

export default AboutPage; 