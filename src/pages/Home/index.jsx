import React, { useEffect } from "react";
import { Layout } from "antd";
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

  useEffect(() => {
    fetchProducts();
    fetchDesignIdeas();
  }, [fetchProducts, fetchDesignIdeas]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out",
    });
  }, []);

  return (
    <Layout >
      <Header />
      <Content>
        <HeroSection />
        <div data-aos="fade-up">
          <FeaturedProducts products={products.slice(0, 6)} />
        </div>
        <div data-aos="fade-up">
          <DesignShowcase designs={designIdeas.slice(0, 4)} />
        </div>
        <div data-aos="fade-up">
          <CTASection />
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default Home; 