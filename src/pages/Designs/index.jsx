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
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useDesignCategoryStore from "@/stores/useDesignCategoryStore";
import "./styles.scss";

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Meta } = Card;
const { Option } = Select;

const DesignsPage = () => {
  const { designIdeas, fetchDesignIdeas, isLoading } = useDesignIdeaStore();

  const { categories, fetchCategories } = useDesignCategoryStore();

  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    sort: "newest",
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    console.log("Fetching design ideas...");
    fetchDesignIdeas();
    fetchCategories();
  }, [fetchDesignIdeas, fetchCategories]);

  useEffect(() => {
    console.log("Design ideas received:", designIdeas);
    let result = [...designIdeas];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (design) =>
          design.name.toLowerCase().includes(searchLower) ||
          design.description.toLowerCase().includes(searchLower) ||
          design.categoryName.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category !== "all") {
      result = result.filter(
        (design) => design.designIdeasCategoryId === filters.category
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
        result.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      default:
        break;
    }

    setFilteredDesigns(result);
  }, [designIdeas, filters]);

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleCategoryChange = (value) => {
    setFilters((prev) => ({ ...prev, category: value }));
  };

  const handleSortChange = (value) => {
    setFilters((prev) => ({ ...prev, sort: value }));
  };

  return (
    <Layout className="designs-layout">
      <Header />
      <Content>
        <div className="designs-hero">
          <div className="container">
            <Title level={1}>Ý Tưởng Thiết Kế</Title>
            <Paragraph>
              Khám phá những ý tưởng độc đáo cho không gian xanh của bạn
            </Paragraph>
          </div>
        </div>

        <div className="designs-content">
          <div className="container">
            <div className="filters-section">
              <Input
                placeholder="Tìm kiếm thiết kế..."
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
                <Option value="all">Tất cả không gian</Option>
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

            <Row gutter={[24, 24]} className="designs-grid">
              {isLoading ? (
                [...Array(8)].map((_, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={`skeleton-${index}`}>
                    <Card loading className="design-card" />
                  </Col>
                ))
              ) : filteredDesigns.length > 0 ? (
                filteredDesigns.map((design) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={design.id}>
                    <Card
                      hoverable
                      className="design-card"
                      cover={
                        <img
                          alt={design.name}
                          src={design.image.imageUrl}
                          className="design-image"
                        />
                      }
                    >
                      <Meta
                        title={design.name}
                        description={
                          <div className="design-info">
                            <span className="design-category">
                              {design.categoryName}
                            </span>
                            <p
                              className="design-description html-preview"
                              dangerouslySetInnerHTML={{
                                __html: design.description,
                              }}
                            />
                            <p className="design-price">
                              {design.totalPrice.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}
                            </p>
                          </div>
                        }
                      />
                      <Link to={`/designs/${design.id}`}>
                        <Button type="primary" block>
                          Xem Chi Tiết
                        </Button>
                      </Link>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24} className="empty-state">
                  <Empty
                    description="Không tìm thấy thiết kế nào phù hợp"
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

export default DesignsPage;
