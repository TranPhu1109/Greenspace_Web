import React, { useEffect, useState } from "react";
import { Typography, Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import heroBg from "@/assets/login.png";
// import 'animate.css';
import "./styles.scss";

const { Title, Paragraph } = Typography;

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Add animation classes with delay
    const title = document.querySelector('.hero-title');
    const paragraph = document.querySelector('.hero-paragraph');
    const buttons = document.querySelector('.hero-buttons');
    
    setTimeout(() => {
      title?.classList.add('animate__animated', 'animate__fadeInDown');
    }, 300);
    
    setTimeout(() => {
      paragraph?.classList.add('animate__animated', 'animate__fadeInUp');
    }, 800);
    
    setTimeout(() => {
      buttons?.classList.add('animate__animated', 'animate__fadeInUp');
    }, 1300);

    // Handle parallax effect on scroll
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Calculate parallax positions based on scroll
  const parallaxTransform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
  const overlayOpacity = Math.min(0.6 + (scrollY * 0.0005), 0.8);

  return (
    <section 
      className="hero-section" 
      style={{ 
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}
    >
      <div 
        className="parallax-bg" 
        style={{ 
          transform: parallaxTransform,
          backgroundImage: `url(${heroBg})`
        }}
      />
      
      <div className="hero-content">
        <div className="hero-badge">
          <span>Không gian mơ ước</span>
        </div>
        
        <Title className="hero-title">
          Không Gian Xanh Cho Cuộc Sống Hiện Đại
        </Title>
        
        <Paragraph className="hero-paragraph">
          Chúng tôi mang đến giải pháp thiết kế và thi công không gian xanh
          chuyên nghiệp, giúp bạn tạo nên môi trường sống trong lành và thẩm mỹ.
        </Paragraph>
        
        <div className="hero-buttons">
          <Link to="/designs">
            <Button type="primary" size="large" className="main-button ripple-btn">
              Khám Phá Ngay <ArrowRightOutlined />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="large" className="secondary-button ripple-btn">
              Liên Hệ Tư Vấn
            </Button>
          </Link>
        </div>
        
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">750+</span>
            <span className="stat-label">Dự án hoàn thành</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">97%</span>
            <span className="stat-label">Khách hàng hài lòng</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">12</span>
            <span className="stat-label">Năm kinh nghiệm</span>
          </div>
        </div>
      </div>
      
      <div className="hero-overlay" style={{ background: `rgba(0, 0, 0, ${overlayOpacity})` }}></div>
      
      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <div>
          <span className="scroll-arrow"></span>
          <span className="scroll-arrow"></span>
          <span className="scroll-arrow"></span>
        </div>
      </div>
      
      <div className="hero-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </section>
  );
};

export default HeroSection; 