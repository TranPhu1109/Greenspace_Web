import React, { useEffect, useState } from "react";
import { Layout, BackTop } from "antd";
import HeroSection from "./components/HeroSection";
import FeaturedProducts from "./components/FeaturedProducts";
import DesignShowcase from "./components/DesignShowcase";
import CTASection from "./components/CTASection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useProductStore from "@/stores/useProductStore";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import AOS from "aos";
import "aos/dist/aos.css";
import "./styles.scss";

const { Content } = Layout;

const Home = () => {
  const { products, fetchProducts } = useProductStore();
  const { designIdeas, fetchDesignIdeas } = useDesignIdeaStore();
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    fetchProducts();
    fetchDesignIdeas();
  }, [fetchProducts, fetchDesignIdeas]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      easing: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
      offset: 100,
      delay: 0,
      anchorPlacement: 'top-bottom',
    });

    // Add scroll event listener to track active section
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 300;
      
      const sections = document.querySelectorAll(".section-container");
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Layout className="home-layout">
      <Header />
      <Content>
        <div className="section-indicators">
          <div 
            className={`indicator ${activeSection === "hero" ? "active" : ""}`}
            onClick={() => document.getElementById("hero").scrollIntoView({ behavior: "smooth" })}
          />
          <div 
            className={`indicator ${activeSection === "products" ? "active" : ""}`}
            onClick={() => document.getElementById("products").scrollIntoView({ behavior: "smooth" })}
          />
          <div 
            className={`indicator ${activeSection === "designs" ? "active" : ""}`}
            onClick={() => document.getElementById("designs").scrollIntoView({ behavior: "smooth" })}
          />
          <div 
            className={`indicator ${activeSection === "cta" ? "active" : ""}`}
            onClick={() => document.getElementById("cta").scrollIntoView({ behavior: "smooth" })}
          />
        </div>

        <div id="hero" className="section-container hero-container">
          <HeroSection />
        </div>
        
        <div className="section-divider">
          <div className="divider-line"></div>
        </div>
        
        <div id="products" className="section-container products-container">
          <div data-aos="fade-up" data-aos-duration="1000">
            <FeaturedProducts products={products.slice(0, 6)} />
          </div>
        </div>
        
        <div className="section-divider">
          <div className="divider-icon">🌿</div>
        </div>
        
        <div id="designs" className="section-container designs-container">
          <div className="designs-content" data-aos="fade-up" data-aos-duration="1200">
            <DesignShowcase designs={designIdeas.slice(0, 4)} />
          </div>
          <div className="designs-background" data-aos="fade-left" data-aos-delay="200" data-aos-duration="1500"></div>
        </div>
        
        <div className="section-divider">
          <div className="divider-line"></div>
        </div>
        
        <div id="cta" className="section-container cta-container">
          <div 
            className="cta-bg-shapes" 
            data-aos="fade-in" 
            data-aos-duration="1500"
          >
            <div className="cta-shape shape-1"></div>
            <div className="cta-shape shape-2"></div>
          </div>
          <div data-aos="zoom-in-up" data-aos-duration="800">
            <CTASection />
          </div>
        </div>
      </Content>
      <Footer />
      <BackTop className="custom-back-top">
        <div className="back-top-inner">↑</div>
      </BackTop>
    </Layout>
  );
};

export default Home; 