import React, { useEffect, useState, useRef } from "react";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  Empty,
  message,
  InputNumber,
} from "antd";
import { SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useProductStore from "@/stores/useProductStore";
import useCartStore from "@/stores/useCartStore";
import "./styles.scss";

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Meta } = Card;
const { Option } = Select;

const ProductsPage = () => {
  const { products, fetchProducts, categories, fetchCategories, isLoading } =
    useProductStore();
  const { addToCart } = useCartStore();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    sort: "newest",
  });
  const mountedRef = useRef(true);
  const [quantities, setQuantities] = useState({});
  const componentId = useRef(`products-page-${Date.now()}`).current;

  // Cleanup function
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!mountedRef.current) return;

      try {
        console.log('Starting to load data with componentId:', componentId);
        console.log('Current products state:', products);
        console.log('Current categories state:', categories);
        
        await Promise.all([
          fetchProducts(componentId),
          fetchCategories(componentId)
        ]);
        
        console.log('After fetching - Products:', products);
        console.log('After fetching - Categories:', categories);
      } catch (error) {
        console.error('Error loading data:', error);
        if (error.name !== 'CanceledError' && mountedRef.current) {
          message.error("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.");
        }
      }
    };

    loadData();
  }, [fetchProducts, fetchCategories, componentId]);

  useEffect(() => {
    if (!mountedRef.current) return;

    console.log('Filtering products - Current products:', products);
    console.log('Current filters:', filters);
    
    let result = [...products];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.categoryName.toLowerCase().includes(searchLower)
      );
      console.log('After search filter:', result);
    }

    if (filters.category !== "all") {
      result = result.filter(
        (product) => product.categoryId === filters.category
      );
      console.log('After category filter:', result);
    }

    switch (filters.sort) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "popular":
        result.sort((a, b) => b.views - a.views);
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    console.log('Final filtered products:', result);
    setFilteredProducts(result);
    
    // Initialize quantities for new products
    const newQuantities = {};
    result.forEach(product => {
      if (!quantities[product.id]) {
        newQuantities[product.id] = 1;
      }
    });
    setQuantities(prev => ({ ...prev, ...newQuantities }));
  }, [products, filters]);

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleCategoryChange = (value) => {
    setFilters((prev) => ({ ...prev, category: value }));
  };

  const handleSortChange = (value) => {
    setFilters((prev) => ({ ...prev, sort: value }));
  };

  const handleQuantityChange = (productId, value) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, quantities[product.id] || 1);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  return (
    <Layout className="products-layout">
      <Header />
      <Content>
        <div className="products-hero">
          <div className="container">
            <Title level={1}>Sản Phẩm</Title>
            <Paragraph>
              Khám phá các sản phẩm chất lượng cho không gian xanh của bạn
            </Paragraph>
          </div>
        </div>

        <div className="products-content">
          <div className="container">
            <div className="filters-section">
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                className="search-input"
                value={filters.search}
                onChange={handleSearchChange}
                allowClear
              />
              <Select
                value={filters.category}
                onChange={handleCategoryChange}
                className="filter-select"
                loading={!categories.length}
              >
                <Option value="all">Tất cả danh mục</Option>
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
              <Select
                value={filters.sort}
                onChange={handleSortChange}
                className="sort-select"
              >
                <Option value="newest">Mới nhất</Option>
                {/* <Option value="popular">Phổ biến nhất</Option> */}
                <Option value="price-asc">Giá tăng dần</Option>
                <Option value="price-desc">Giá giảm dần</Option>
              </Select>
            </div>

            <Row gutter={[24, 24]} className="products-grid">
              {isLoading ? (
                [...Array(8)].map((_, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={`skeleton-${index}`}>
                    <Card loading className="product-card" />
                  </Col>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
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
                      actions={[
                        <Link to={`/products/${product.id}`} key="view">
                          <Button type="link">
                            Xem Chi Tiết
                          </Button>
                        </Link>,
                        // TODO: Enable when cart feature is implemented
                        <Button
                          key="cart"
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          onClick={() => handleAddToCart(product)}
                        >
                          Thêm vào giỏ
                        </Button>,
                      ]}
                    >
                      <Meta
                        title={product.name}
                        description={
                          <div className="product-info">
                            <span className="product-category">
                              {product.categoryName}
                            </span>
                            <p className="product-description">
                              {product.description}
                            </p>
                            <p className="product-price">
                              {product.price.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}
                            </p>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24} className="empty-state">
                  <Empty
                    description="Không tìm thấy sản phẩm nào phù hợp"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Col>
              )}
            </Row>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default ProductsPage;
