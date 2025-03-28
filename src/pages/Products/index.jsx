import React, { useEffect, useState } from "react";
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
} from "antd";
import { SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useProductStore from "@/stores/useProductStore";
// TODO: Implement cart feature
// import useCartStore from "@/stores/useCartStore";
import "./styles.scss";

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Meta } = Card;
const { Option } = Select;

const ProductsPage = () => {
  const { products, fetchProducts, categories, fetchCategories, isLoading } =
    useProductStore();
  // TODO: Implement cart feature
  // const { addToCart } = useCartStore();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    sort: "newest",
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 260);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    let result = [...products];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.categoryName.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category !== "all") {
      result = result.filter(
        (product) => product.categoryId === filters.category
      );
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

    setFilteredProducts(result);
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

  // TODO: Implement cart feature
  const handleAddToCart = (product) => {
    // Temporary message until cart feature is implemented
    message.info("Tính năng giỏ hàng đang được phát triển");
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
                <Option value="popular">Phổ biến nhất</Option>
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
                        <Button type="link" href={`/products/${product.id}`}>
                          Xem Chi Tiết
                        </Button>,
                        // TODO: Enable when cart feature is implemented
                        <Button
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
