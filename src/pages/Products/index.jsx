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
  notification,
} from "antd";
import { SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useProductStore from "@/stores/useProductStore";
import useCartStore from "@/stores/useCartStore";
import useAuthStore from "@/stores/useAuthStore";
import LoginRequiredModal from "@/components/Auth/LoginRequiredModal";
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
  // Xử lý khi người dùng nhập số lượng - không giới hạn số lượng nhập
  const handleQuantityChange = (value) => {
    // Chỉ đảm bảo giá trị không âm và là số nguyên
    if (value < 1) {
      onQuantityChange(1);
    } else {
      onQuantityChange(value);
    }
  };

  // Xử lý khi nhấn nút Xác nhận
  const handleConfirm = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    onConfirm();
  };

  // Xử lý khi đóng modal
  const handleClose = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    // Reset về giá trị mặc định (1) trước khi đóng modal
    onQuantityChange(1);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      onCancel={handleClose}
      footer={null}
      centered
      maskClosable={false} // Ngăn chặn việc đóng modal khi click vào vùng ngoài
      title="Thêm vào giỏ hàng"
      style={{
        width: 500,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "0px 10px",
          backgroundColor: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: 0,
          }}
        >
          <img
            src={product?.image?.imageUrl}
            alt={product?.name}
            style={{
              width: "100%",
              height: 300,
              objectFit: "cover",
              borderTopRightRadius: 8,
              borderTopLeftRadius: 8,
            }}
          />
        </div>
        <Typography.Title
          level={4}
          style={{
            margin: "10px 0",
            color: "#333",
            fontWeight: 600,
          }}
        >
          {product?.name}
        </Typography.Title>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Tag color="green">{product?.categoryName}</Tag>
          <Typography.Title
            level={3}
            type="danger"
            style={{
              margin: 0,
              color: "#52c41a",
              fontWeight: 600,
            }}
          >
            {product?.price?.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </Typography.Title>
        </div>
        {/* <div
          dangerouslySetInnerHTML={{ __html: product?.description }}
          style={{
            marginBottom: 16,
            color: "#666",
          }}
        /> */}

        <div
          style={{
            padding: "16px 0",
            borderTop: "1px solid #f0f0f0",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Typography.Text
              style={{
                color: "#333",
                marginRight: 12,
              }}
            >
              🎉 Bạn muốn thêm bao nhiêu sản phẩm này vào giỏ hàng?
            </Typography.Text>
            <div style={{ marginTop: 5 }}>
              <Typography.Text type="secondary">
                Còn lại: {product?.stock} sản phẩm
              </Typography.Text>
            </div>
          </div>
          <InputNumber
            min={1}
            value={quantity}
            onChange={handleQuantityChange}
            style={{
              width: "80px",
              height: "auto",
              textAlign: "right",
            }}
            size="middle"
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}
        >
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            type="primary"
            onClick={handleConfirm}
            icon={<ShoppingCartOutlined />}
            disabled={product?.stock <= 0}
          >
            {product?.stock <= 0 ? "Hết hàng" : "Xác nhận"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { products, fetchProducts, categories, fetchCategories, isLoading } =
    useProductStore();
  const { addToCart, cartItems, fetchCartItems } = useCartStore();
  const { user } = useAuthStore();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    sort: "newest",
  });
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [actionType, setActionType] = useState('cart');
  const mountedRef = useRef(true);
  const componentId = useRef(`products-page-${Date.now()}`).current;

  // Kiểm tra nếu người dùng quay lại từ trang đăng nhập/đăng ký
  useEffect(() => {
    const checkLoginStatus = async () => {
      // Nếu có thông tin state và người dùng đã đăng nhập
      if (location?.state?.actionCompleted && user && selectedProduct) {
        const action = location.state.actionType;
        
        // Xóa state để tránh thực hiện lại hành động nếu người dùng refresh trang
        window.history.replaceState({}, document.title);
        
        // Thực hiện hành động tương ứng
        if (action === 'cart') {
          setIsModalOpen(true); // Hiển thị modal thay vì tự động thêm vào giỏ hàng
        }
      }
    };
    
    checkLoginStatus();
  }, [user, selectedProduct, location?.state]);

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

  // Fetch cart items when component mounts if user is logged in
  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user, fetchCartItems]);

  useEffect(() => {
    const loadData = async () => {
      if (!mountedRef.current) return;

      try {
        console.log("Starting to load data with componentId:", componentId);
        console.log("Current products state:", products);
        console.log("Current categories state:", categories);

        await Promise.all([
          fetchProducts(componentId),
          fetchCategories(componentId),
        ]);

        console.log("After fetching - Products:", products);
        console.log("After fetching - Categories:", categories);
      } catch (error) {
        console.error("Error loading data:", error);
        if (error.name !== "CanceledError" && mountedRef.current) {
          message.error(
            "Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau."
          );
        }
      }
    };

    loadData();
  }, [fetchProducts, fetchCategories, componentId]);

  useEffect(() => {
    if (!mountedRef.current) return;

    console.log("Filtering products - Current products:", products);
    console.log("Current filters:", filters);

    let result = [...products];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.categoryName.toLowerCase().includes(searchLower)
      );
      console.log("After search filter:", result);
    }

    if (filters.category !== "all") {
      result = result.filter(
        (product) => product.categoryId === filters.category
      );
      console.log("After category filter:", result);
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

    console.log("Final filtered products:", result);
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

  const handleShowAddToCartModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = async (product) => {
    try {
      // Kiểm tra stock
      const quantity = quantities[product.id] || 1;
      
      // Kiểm tra số lượng trong giỏ hàng hiện tại
      const existingCartItem = cartItems.find(item => item.id === product.id);
      const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
      const totalQuantity = existingQuantity + quantity;
      
      if (totalQuantity > product.stock) {
        message.error(`Tổng số lượng trong giỏ hàng (${existingQuantity}) và số lượng thêm vào (${quantity}) không được vượt quá tồn kho (${product.stock})`);
        return;
      }
      
      await addToCart(product.id, quantity);
      
      // Trigger sự kiện cập nhật giỏ hàng local
      window.dispatchEvent(new Event('localCartUpdated'));
      
      // Cập nhật lại giỏ hàng sau khi thêm sản phẩm
      if (user) {
        await fetchCartItems();
      }
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleModalClose = () => {
    // Reset số lượng về 1 cho sản phẩm đang chọn
    if (selectedProduct) {
      setQuantities(prev => ({
        ...prev,
        [selectedProduct.id]: 1
      }));
    }
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleLoginModalClose = () => {
    setIsLoginModalVisible(false);
  };

  const handleQuantityChange = (value) => {
    if (selectedProduct) {
      // Không kiểm tra giới hạn stock ở đây, chỉ đảm bảo giá trị hợp lệ (>=1)
      if (value < 1) value = 1;
      
      setQuantities((prev) => ({
        ...prev,
        [selectedProduct.id]: value,
      }));
    }
  };

  const handleConfirmAddToCart = async () => {
    if (selectedProduct) {
      const quantity = quantities[selectedProduct.id] || 1;
      
      // Kiểm tra số lượng trong giỏ hàng hiện tại
      const existingCartItem = cartItems.find(item => item.id === selectedProduct.id);
      const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
      const totalQuantity = existingQuantity + quantity;
      
      // Kiểm tra stock
      if (totalQuantity > selectedProduct.stock) {
        notification.warning({
          message: "Số lượng vượt quá giới hạn",
          description: `Tổng số lượng trong giỏ hàng (${existingQuantity}) và số lượng thêm vào (${quantity}) không được vượt quá tồn kho (${selectedProduct.stock}). Vui lòng nhập lại số lượng phù hợp.`,
          duration: 5,
        });
        return;
      }
      
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

        <LoginRequiredModal
          isVisible={isLoginModalVisible}
          onCancel={handleLoginModalClose}
          actionType={actionType}
          returnUrl="/products"
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
                      onClick={(e) => {
                        // Prevent navigation when clicking on action buttons
                        if (e.target.closest(".ant-card-actions")) {
                          e.stopPropagation();
                          e.preventDefault();
                          return;
                        }
                        navigate(`/products/${product.id}`);
                      }}
                      cover={
                        <img
                          alt={product.name}
                          src={product.image.imageUrl}
                          className="product-image"
                        />
                      }
                      actions={[
                        <Link 
                          to={`/products/${product.id}`} 
                          key="view"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button type="link">Xem Chi Tiết</Button>
                        </Link>,
                        <Button
                          key="cart"
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault(); // Thêm dòng này để ngăn các hành động mặc định
                            handleShowAddToCartModal(product);
                          }}
                          disabled={product.stock <= 0}
                        >
                          {product.stock <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
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
                            <p className="product-stock">
                              Số lượng: {product.stock}
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
