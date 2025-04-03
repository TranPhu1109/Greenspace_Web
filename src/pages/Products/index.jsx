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
  Tag,
} from "antd";
import { SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useProductStore from "@/stores/useProductStore";
import useCartStore from "@/stores/useCartStore";
import "./styles.scss";
import { Modal } from "antd";
const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Meta } = Card;
const { Option } = Select;

const AddToCartModal = ({
  isOpen,
  onClose,
  product,
  quantity,
  onQuantityChange,
  onConfirm,
}) => {
  return (
    <Modal
      visible={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      title="Thêm vào giỏ hàng"
      style={{
        width: 500,
        borderRadius: 8,
        overflow: 'hidden'
      }}
    >
      <div style={{
        padding: "0px 10px",
        backgroundColor: '#fff'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          margin:0,
        }}>
          <img
            src={product?.image?.imageUrl}
            alt={product?.name}
            style={{
              width: "100%",
              height: 300,
              objectFit: 'cover',
              borderTopRightRadius: 8,
              borderTopLeftRadius: 8
            }}
          />
        </div>
        <Typography.Title 
          level={4} 
          style={{
            margin: "10px 0",
            color: '#333',
            fontWeight: 600
          }}
        >
          {product?.name}
        </Typography.Title>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <Tag color="green">
            {product?.categoryName}
          </Tag>
          <Typography.Title 
            level={3} 
            type="danger" 
            style={{
              margin: 0,
              color: '#52c41a',
              fontWeight: 600
            }}
          >
            {product?.price?.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </Typography.Title>
        </div>
        <Typography.Text 
          type="secondary" 
          style={{
            marginBottom: 16,
            display: 'block',
            color: '#666'
          }}
        >
          {product?.description}
        </Typography.Text>
        
        <div style={{
          padding: '16px 0',
          borderTop: '1px solid #f0f0f0',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography.Text style={{
            color: '#333',
            marginRight: 12
          }}>
            🎉 Bạn muốn thêm bao nhiêu sản phẩm này vào giỏ hàng?
          </Typography.Text>
          <InputNumber
            min={1}
            max={99}
            value={quantity}
            onChange={onQuantityChange}
            style={{
              width: "80px",
              height: "auto",
              textAlign: 'right',
            }}
            size="middle"
          />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          marginTop: 24
        }}>
          <Button 
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button 
            type="primary" 
            onClick={onConfirm} 
            icon={<ShoppingCartOutlined />}
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const ProductsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { products, fetchProducts, categories, fetchCategories, isLoading } =
    useProductStore();
  const { addToCart } = useCartStore();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    sort: "newest",
  });
  const mountedRef = useRef(true);

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
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (error) {
        if (error.name !== "CanceledError" && mountedRef.current) {
          message.error(
            "Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau."
          );
        }
      }
    };

    loadData();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    if (!mountedRef.current) return;

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

    // Initialize quantities for new products
    const newQuantities = {};
    result.forEach((product) => {
      if (!quantities[product.id]) {
        newQuantities[product.id] = 1;
      }
    });
    setQuantities((prev) => ({ ...prev, ...newQuantities }));
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

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, quantities[product.id] || 1);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleQuantityChange = (value) => {
    if (selectedProduct) {
      setQuantities((prev) => ({
        ...prev,
        [selectedProduct.id]: value,
      }));
    }
  };

  const handleConfirmAddToCart = async () => {
    if (selectedProduct) {
      await handleAddToCart(selectedProduct);
      handleModalClose();
    }
  };

  return (
    <Layout className="products-layout">
      <Header />
      <Content>
        <AddToCartModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          product={selectedProduct}
          quantity={selectedProduct ? quantities[selectedProduct.id] || 1 : 1}
          onQuantityChange={handleQuantityChange}
          onConfirm={handleConfirmAddToCart}
        />
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
                          <Button type="link">Xem Chi Tiết</Button>
                        </Link>,
                        <Button
                          key="cart"
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsModalOpen(true);
                          }}
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
