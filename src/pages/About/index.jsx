import React, { useEffect } from 'react';
import { Layout, Typography, Row, Col, Card, Button, Statistic } from 'antd';
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
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './styles.scss';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
    });
  }, []);

  const services = [
    {
      icon: <BulbOutlined className="service-icon" />,
      title: 'Thiết kế mẫu',
      description: 'Khám phá bộ sưu tập thiết kế mẫu đa dạng và độc đáo cho không gian xanh của bạn. Từ vườn ban công đến sân vườn rộng lớn.',
      link: '/designs',
    },
    {
      icon: <RocketOutlined className="service-icon" />,
      title: 'Thiết kế theo yêu cầu',
      description: 'Đặt thiết kế riêng theo ý tưởng và mong muốn của bạn với đội ngũ thiết kế chuyên nghiệp. Tư vấn và phác thảo miễn phí.',
      link: '/designs',
    },
    {
      icon: <ShopOutlined className="service-icon" />,
      title: 'Vật liệu trang trí',
      description: 'Cung cấp đa dạng vật liệu trang trí chất lượng cao cho không gian xanh. Từ chậu cây nghệ thuật đến đèn trang trí độc đáo.',
      link: '/products',
    },
    {
      icon: <ToolOutlined className="service-icon" />,
      title: 'Vật liệu thi công',
      description: 'Cung cấp vật liệu thi công đảm bảo chất lượng cho dự án của bạn. Đầy đủ các loại đất, phân bón, và công cụ làm vườn.',
      link: '/products',
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
      icon: <SmileOutlined />,
      suffix: '+',
    },
    {
      title: 'Dự án hoàn thành',
      value: 1000,
      icon: <TrophyOutlined />,
      suffix: '+',
    },
    {
      title: 'Đánh giá 5 sao',
      value: 98,
      icon: <HeartOutlined />,
      suffix: '%',
    },
    {
      title: 'Tỉnh thành phục vụ',
      value: 63,
      icon: <EnvironmentOutlined />,
      suffix: '',
    },
  ];

  const values = [
    {
      title: 'Sáng tạo',
      description: 'Luôn đổi mới và tìm kiếm những ý tưởng độc đáo',
      color: '#f5222d',
    },
    {
      title: 'Chất lượng',
      description: 'Cam kết mang đến sản phẩm và dịch vụ tốt nhất',
      color: '#52c41a',
    },
    {
      title: 'Tận tâm',
      description: 'Lắng nghe và thấu hiểu nhu cầu của khách hàng',
      color: '#1890ff',
    },
  ];

  return (
    <Layout>
      <Header />
      <Content>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={12}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Title level={1}>Về Green Space</Title>
                  <Paragraph className="subtitle">
                    Chúng tôi mang đến giải pháp toàn diện cho không gian xanh của bạn
                  </Paragraph>
                  <Paragraph>
                    Green Space là nền tảng kết nối giữa khách hàng với các dịch vụ thiết kế và cung cấp vật liệu cho không gian xanh. 
                    Chúng tôi cam kết mang đến những giải pháp sáng tạo và chất lượng nhất cho mọi dự án, từ những khu vườn nhỏ đến các công trình cảnh quan lớn.
                  </Paragraph>
                  <Link to="/designs">
                    <Button type="primary" size="large">
                      Khám phá ngay
                    </Button>
                  </Link>
                </motion.div>
              </Col>
              <Col xs={24} md={12}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <img 
                    src="../../assets/logo.png" 
                    alt="Green Space Hero" 
                    className="hero-image"
                  />
                </motion.div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="container">
            <Row gutter={[32, 32]} justify="center">
              {stats.map((stat, index) => (
                <Col xs={12} md={6} key={index}>
                  <Card className="stat-card" data-aos="zoom-in" data-aos-delay={index * 100}>
                    <div className="stat-icon">{stat.icon}</div>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      suffix={stat.suffix}
                      formatter={(value) => (
                        <CountUp end={value} separator="," duration={2.5} />
                      )}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section">
          <div className="container">
            <Title level={2} className="section-title" data-aos="fade-up">
              Dịch vụ của chúng tôi
            </Title>
            <Row gutter={[32, 32]}>
              {services.map((service, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card 
                    className="service-card" 
                    hoverable
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="service-icon-wrapper">
                      {service.icon}
                    </div>
                    <Title level={4}>{service.title}</Title>
                    <Paragraph>{service.description}</Paragraph>
                    <Link to={service.link}>
                      <Button type="link">Tìm hiểu thêm →</Button>
                    </Link>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Values Section */}
        {/* <section className="values-section">
          <div className="container">
            <Title level={2} className="section-title" data-aos="fade-up">
              Giá trị cốt lõi
            </Title>
            <Row gutter={[32, 32]} justify="center">
              {values.map((value, index) => (
                <Col xs={24} sm={8} key={index}>
                  <Card 
                    className="value-card" 
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="value-header" style={{ backgroundColor: value.color }}>
                      <Title level={3}>{value.title}</Title>
                    </div>
                    <Paragraph>{value.description}</Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section> */}

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={12}>
                <Title level={2} data-aos="fade-right">Tại sao chọn Green Space?</Title>
                <div className="features-list">
                  {features.map((feature, index) => (
                    <motion.div
                      className="feature-item"
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircleOutlined className="feature-icon" />
                      <Text>{feature}</Text>
                    </motion.div>
                  ))}
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="team-image-wrapper" data-aos="fade-left">
                  <TeamOutlined className="team-icon" />
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

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Title level={2}>Bắt đầu dự án của bạn ngay hôm nay</Title>
              <Paragraph>
                Hãy để chúng tôi giúp bạn hiện thực hóa ý tưởng về không gian xanh lý tưởng.
                Từ tư vấn thiết kế đến lựa chọn vật liệu, chúng tôi luôn đồng hành cùng bạn trong mọi bước.
              </Paragraph>
              <div className="cta-buttons">
                <Link to="/designs">
                  <Button type="primary" size="large">
                    Xem thiết kế mẫu
                  </Button>
                </Link>
                <Link to="/products">
                  <Button size="large">
                    Khám phá sản phẩm
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </Content>
      <Footer />
    </Layout>
  );
};

export default AboutPage; 