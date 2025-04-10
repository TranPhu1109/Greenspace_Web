import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Divider,
  Button,
  message,
  Spin,
  Empty,
  Input,
  Form,
  Modal,
  Select,
  Collapse,
  Affix,
  Badge,
  Space,
  Alert,
} from "antd";
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  UserOutlined,
  HomeOutlined,
  ReadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import useAuthStore from "@/stores/useAuthStore";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useWalletStore from "@/stores/useWalletStore";
import AddressForm from "@/components/Common/AddressForm";
import { fetchProvinces, fetchDistricts, fetchWards } from "@/services/ghnService";
import "./styles.scss";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const OrderService = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentDesign,
    fetchDesignIdeaById,
    isLoading: designLoading,
  } = useDesignIdeaStore();
  const { getProductById, updateProduct } = useProductStore();
  const { user } = useAuthStore();
  const { createDesignOrder, isLoading: orderLoading } = useDesignOrderStore();
  const {
    balance,
    fetchBalance,
    loading: walletLoading,
    createBill,
  } = useWalletStore();

  const [productDetails, setProductDetails] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const mountedRef = useRef(true);
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState(['1', '2', '3']);
  const rightColumnRef = useRef(null);
  const leftColumnRef = useRef(null);
  const titleRef = useRef(null);
  const footerRef = useRef(null);
  const [leftColumnHeight, setLeftColumnHeight] = useState(0);
  const [footerTop, setFooterTop] = useState(0);

  // State for address
  const [addressInfo, setAddressInfo] = useState(null);
  const [isAddressValid, setIsAddressValid] = useState(false);

  const containerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load design data
  useEffect(() => {
    const loadDesign = async () => {
      if (!id || !mountedRef.current) return;
      try {
        const design = await fetchDesignIdeaById(id);
      } catch (error) {
        if (error.name !== "CanceledError" && mountedRef.current) {
          message.error("Không thể tải thông tin thiết kế");
        }
      }
    };
    loadDesign();
  }, [id, fetchDesignIdeaById]);

  // Load products when design data is available
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      if (!isMounted) return;

      if (!currentDesign?.productDetails?.length) {
        setProductDetails([]);
        setIsLoadingProducts(false);
        return;
      }

      setIsLoadingProducts(true);
      setProductError(null);

      try {
        const productPromises = currentDesign.productDetails.map(
          async (detail) => {
            try {
              const product = await getProductById(detail.productId);

              if (!isMounted) return null;

              if (product) {
                return {
                  detail,
                  product,
                };
              } else {
                return null;
              }
            } catch (error) {
              return null;
            }
          }
        );

        const results = await Promise.all(productPromises);

        if (isMounted) {
          const validResults = results.filter(Boolean);
          setProductDetails(validResults);
          setProductError(null);
        }
      } catch (error) {
        if (isMounted) {
          setProductError("Failed to load products");
          setProductDetails([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [currentDesign, getProductById]);

  // Add useEffect to fetch wallet balance
  useEffect(() => {
    const loadWalletBalance = async () => {
      try {
        await fetchBalance();
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };
    loadWalletBalance();
  }, [fetchBalance]);

  // Tính toán chiều cao và vị trí các phần tử
  useEffect(() => {
    const calculateHeights = () => {
      if (leftColumnRef.current && rightColumnRef.current && footerRef.current && titleRef.current) {
        setLeftColumnHeight(leftColumnRef.current.scrollHeight);
        setFooterTop(footerRef.current.offsetTop);
      }
    };

    calculateHeights();
    window.addEventListener('resize', calculateHeights);

    // Theo dõi sự kiện scroll để điều chỉnh sticky positioning
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const titleHeight = titleRef.current?.offsetHeight || 0;
      const rightColumn = rightColumnRef.current;
      const footerTop = footerRef.current?.offsetTop || 0;
      const rightColumnHeight = rightColumn?.offsetHeight || 0;

      const viewportHeight = window.innerHeight;

      const scrollThreshold = footerTop - viewportHeight;

      if (rightColumn) {
        if (scrollY > scrollThreshold) {
          const distance = scrollY - scrollThreshold;
          rightColumn.style.transform = `translateY(-${distance}px)`;
        } else {
          rightColumn.style.transform = 'translateY(0)';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', calculateHeights);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Xử lý sự kiện cuộn trang - cải tiến
  useEffect(() => {
    if (!leftColumnRef.current || !containerRef.current) return;

    const handleWheel = (e) => {
      const leftColumn = leftColumnRef.current;

      const scrollHeight = leftColumn.scrollHeight;
      const clientHeight = leftColumn.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      const currentScroll = leftColumn.scrollTop;

      const footerElement = document.querySelector('footer');
      if (footerElement) {
        const footerRect = footerElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (footerRect.top < windowHeight && e.deltaY > 0) {
          return true;
        }
      }

      if (e.deltaY > 0) { // Cuộn xuống
        if (currentScroll < maxScroll - 5) { // Thêm buffer 5px
          e.preventDefault();
          leftColumn.scrollTop += Math.min(e.deltaY, maxScroll - currentScroll);
          return false;
        }
      } else if (e.deltaY < 0) { // Cuộn lên
        if (currentScroll > 5) { // Thêm buffer 5px
          e.preventDefault();
          leftColumn.scrollTop += Math.max(e.deltaY, -currentScroll);
          return false;
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Xử lý khi thông tin địa chỉ thay đổi
  const handleAddressChange = (newAddressData) => {
    console.log("Address changed:", newAddressData);
    setAddressInfo(newAddressData);

    let valid = false;

    // Trường hợp 1: Sử dụng địa chỉ mặc định đã lưu
    if (newAddressData.useDefaultAddress && user?.address) {
      valid = true;
      console.log("Using default address - valid");
    } 
    // Trường hợp 2: Nhập địa chỉ mới đầy đủ
    else if (
      newAddressData.province && newAddressData.province.label && 
      newAddressData.district && newAddressData.district.label && 
      newAddressData.ward && newAddressData.ward.label && 
      newAddressData.streetAddress?.trim()
    ) {
      valid = true;
      console.log("New address is complete - valid");
      console.log("Address fields:", {
        province: newAddressData.province,
        district: newAddressData.district,
        ward: newAddressData.ward,
        street: newAddressData.streetAddress
      });
    } else {
      console.log("Address incomplete - invalid");
      console.log("Missing fields:", {
        hasProvince: Boolean(newAddressData.province),
        hasProvinceLabel: Boolean(newAddressData.province?.label),
        hasDistrict: Boolean(newAddressData.district),
        hasDistrictLabel: Boolean(newAddressData.district?.label),
        hasWard: Boolean(newAddressData.ward),
        hasWardLabel: Boolean(newAddressData.ward?.label),
        hasStreet: Boolean(newAddressData.streetAddress?.trim())
      });
    }

    console.log("Address validity:", valid);
    setIsAddressValid(valid);
  };

  // Xử lý khi người dùng xác nhận đặt hàng
  const handleSubmit = async () => {
    try {
      console.log("Trying to submit form with addressInfo:", addressInfo);
      console.log("Current address validity:", isAddressValid);
      
      const values = await form.validateFields();
      console.log("Form values validated:", values);

      // Kiểm tra lại tính hợp lệ của địa chỉ
      if (!isAddressValid) {
        message.error("Vui lòng nhập đầy đủ thông tin địa chỉ");
        return;
      }

      let fullAddress = "";

      // Tạo chuỗi địa chỉ đầy đủ theo định dạng: "đường|phường/xã|quận/huyện|tỉnh/thành phố"
      if (addressInfo?.useDefaultAddress && user?.address) {
        // Nếu sử dụng địa chỉ mặc định
        fullAddress = user.address;
        console.log("Using default address:", fullAddress);
      } else if (addressInfo?.province?.label && addressInfo?.district?.label && addressInfo?.ward?.label && addressInfo?.streetAddress) {
        // Nếu nhập địa chỉ mới và đầy đủ thông tin
        const provinceName = addressInfo.province.label;
        const districtName = addressInfo.district.label;
        const wardName = addressInfo.ward.label;
        const streetAddress = addressInfo.streetAddress.trim();
        
        fullAddress = `${streetAddress}|${wardName}|${districtName}|${provinceName}`;
        console.log("Using new address:", fullAddress);
      } else {
        console.error("Invalid address data:", addressInfo);
        message.error("Thông tin địa chỉ không hợp lệ, vui lòng kiểm tra lại");
        return;
      }

      const data = {
        userId: user.id,
        designIdeaId: currentDesign.id,
        address: fullAddress,
        cusPhone: values.phone,
        isCustom: false,
        totalPrice: currentDesign.totalPrice,
        designPrice: currentDesign.designPrice,
        materialPrice: currentDesign.materialPrice,
      };
      console.log("Prepared order data:", data);
      setOrderData(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Form validation error:", error);
      message.error("Vui lòng kiểm tra lại thông tin");
    }
  };

  const handleConfirmOrder = async () => {
    try {
      // Create the order first
      const orderResponse = await createDesignOrder(orderData);
      console.log("orderResponse", orderResponse.data.id);

      // Create bill after successful order creation
      await createBill(orderResponse.data.id, currentDesign.totalPrice);

      // Update stock for each product in the order
      if (productDetails && productDetails.length > 0) {
        for (const { detail, product } of productDetails) {
          try {
            // Calculate new stock by subtracting ordered quantity
            const newStock = product.stock - detail.quantity;

            // Prepare update data
            const updateData = {
              name: product.name,
              categoryId: product.categoryId,
              price: product.price,
              stock: newStock,
              description: product.description,
              designImage1URL: product.designImage1URL || "",
              size: product.size,
              image: {
                imageUrl: product.image?.imageUrl || "",
                image2: product.image?.image2 || "",
                image3: product.image?.image3 || ""
              }
            };

            // Update product stock
            await updateProduct(product.id, updateData);
          } catch (error) {
            console.error(`Error updating stock for product ${product.id}:`, error);
            // Continue with other products even if one fails
          }
        }
      }

      // Refresh wallet balance after successful order creation and bill creation
      await fetchBalance();
      message.success("Đặt hàng thành công!");
      setIsModalOpen(false);
      navigate("/serviceorderhistory");
    } catch (error) {
      console.error("Order submission error:", error);
      message.error("Có lỗi xảy ra khi đặt hàng");
    }
  };

  if (designLoading) {
    return (
      <Layout>
        <Header />
        <Content className="order-service-loading">
          <div className="container">
            <Card loading />
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  if (!currentDesign) {
    return (
      <Layout>
        <Header />
        <Content className="order-service-error">
          <div className="container">
            <Card>
              <Title level={3}>Không tìm thấy thiết kế</Title>
            </Card>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout className="order-service-layout">
      <Header />
      <Content style={{ paddingTop: '30px', paddingBottom: '10px' }}>
        <div className="order-service-content" ref={containerRef} style={{ paddingBottom: '50px' }}>
          <div className="container order-service-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>

            <Row gutter={[24, 24]} style={{ position: 'relative' }}>
              {/* Cột trái (2/3) - Có thể cuộn */}
              <Col xs={24} md={16}>
                <div
                  ref={leftColumnRef}
                  className="left-column-scrollable"
                  style={{
                    height: 'calc(100vh - 200px)',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d9d9d9 #f5f5f5',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f5f5f5',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#d9d9d9',
                      borderRadius: '4px',
                    }
                  }}
                >
                  <div className="order-form">
                    {/* Design Information */}
                    <Card className="form-section design-info-card">
                      <Row gutter={[16, 16]}>
                        <Col span={24}>
                          <div className="design-images-carousel">
                            <Title level={3}>{currentDesign?.name}</Title>
                            <Row gutter={[16, 16]}>
                              {currentDesign?.image?.imageUrl && (
                                <Col span={24} md={8}>
                                  <img
                                    src={currentDesign.image.imageUrl}
                                    alt={`${currentDesign.name} - 1`}
                                    className="design-image"
                                    style={{
                                      width: "100%",
                                      height: "220px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                </Col>
                              )}
                              {currentDesign?.image?.image2 && (
                                <Col span={24} md={8}>
                                  <img
                                    src={currentDesign.image.image2}
                                    alt={`${currentDesign.name} - 2`}
                                    className="design-image"
                                    style={{
                                      width: "100%",
                                      height: "220px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                </Col>
                              )}
                              {currentDesign?.image?.image3 && (
                                <Col span={24} md={8}>
                                  <img
                                    src={currentDesign.image.image3}
                                    alt={`${currentDesign.name} - 3`}
                                    className="design-image"
                                    style={{
                                      width: "100%",
                                      height: "220px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                </Col>
                              )}
                            </Row>
                          </div>
                        </Col>
                      </Row>

                      <Collapse
                        className="design-description-collapse"
                        defaultActiveKey={['1']}
                        bordered={false}
                        expandIconPosition="end"
                        style={{ marginTop: '20px' }}
                      >
                        <Panel header={<Title level={5}>Chi tiết thiết kế</Title>} key="1">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: currentDesign?.description,
                            }}
                            className="design-description"
                          />
                        </Panel>
                      </Collapse>
                    </Card>

                    {/* Product List */}
                    <Collapse
                      defaultActiveKey={activeKey}
                      onChange={setActiveKey}
                      className="form-section"
                      style={{ marginTop: '24px' }}
                      expandIconPosition="end"
                    >
                      <Panel
                        header={
                          <div className="panel-header">
                            <ReadOutlined style={{ marginRight: '8px' }} />
                            <span>Danh sách sản phẩm</span>
                            <Badge count={productDetails.length} style={{ marginLeft: '8px', backgroundColor: '#4caf50' }} />
                          </div>
                        }
                        key="1"
                        forceRender
                      >
                        {isLoadingProducts ? (
                          <div className="loading-container">
                            <Spin size="large" />
                          </div>
                        ) : productError ? (
                          <Paragraph type="danger">{productError}</Paragraph>
                        ) : productDetails && productDetails.length > 0 ? (
                          <div className="product-list">
                            {productDetails.map(({ detail, product }) => (
                              <div key={detail.productId} className="product-item">
                                <Row gutter={16} align="middle">
                                  <Col span={4}>
                                    <img
                                      src={product.image?.imageUrl}
                                      alt={product.name}
                                      className="product-image"
                                      style={{ borderRadius: '8px', maxWidth: '100%', height: 'auto' }}
                                    />
                                  </Col>
                                  <Col span={12}>
                                    <Title level={5}>{product.name}</Title>
                                    <Paragraph ellipsis={{ rows: 2 }}>{product.description}</Paragraph>
                                  </Col>
                                  <Col span={4}>
                                    <Badge count={detail.quantity} style={{ backgroundColor: '#4caf50' }} />
                                  </Col>
                                  <Col span={4}>
                                    <span className="product-price">
                                      {detail.price.toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      })}
                                    </span>
                                  </Col>
                                </Row>
                                <Divider style={{ margin: '12px 0' }} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Empty description="Không có sản phẩm nào" />
                        )}
                      </Panel>

                      {/* Customer Information */}
                      <Panel
                        header={
                          <div className="panel-header">
                            <UserOutlined style={{ marginRight: '8px' }} />
                            <span>Thông tin người đặt</span>
                          </div>
                        }
                        key="2"
                        forceRender
                      >
                        <Form
                          form={form}
                          layout="vertical"
                          initialValues={{
                            fullName: user?.name || "",
                            phone: user?.phone || "",
                            email: user?.email || "",
                          }}
                        >
                          <Row gutter={[16, 16]}>
                            <Col span={12}>
                              <Form.Item
                                name="fullName"
                                label="Họ và tên"
                              >
                                <Input disabled />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập số điện thoại",
                                  },
                                ]}
                              >
                                <Input />
                              </Form.Item>
                            </Col>
                            <Col span={24}>
                              <Form.Item
                                name="email"
                                label="Email"
                              >
                                <Input disabled />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </Panel>

                      {/* Address Information */}
                      <Panel
                        header={
                          <div className="panel-header">
                            <HomeOutlined style={{ marginRight: '8px' }} />
                            <span>Thông tin địa chỉ</span>
                          </div>
                        }
                        key="3"
                        forceRender
                      >
                      <div
                        className="address-form-wrapper" 
                        style={{
                          backgroundColor: '#f8f8f8',
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid #e8e8e8'
                        }}
                      >
                        <div style={{ marginBottom: '16px' }}>
                          <Text strong style={{ fontSize: '16px', color: '#333' }}>Địa chỉ giao hàng</Text>
                          <Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>
                            Vui lòng chọn địa chỉ giao hàng chính xác để đảm bảo đơn hàng được giao đúng nơi nhận
                          </Text>
                        </div>

                        <AddressForm
                          form={form}
                          onAddressChange={handleAddressChange}
                          useExistingAddress={true}
                        />

                        {!isAddressValid && (
                          <Alert
                            message="Thông tin địa chỉ chưa đầy đủ"
                            description="Vui lòng chọn địa chỉ có sẵn hoặc nhập đầy đủ thông tin địa chỉ mới để tiếp tục"
                            type="warning"
                            showIcon
                            style={{ marginTop: '16px' }}
                          />
                        )}
                      </div>
                      </Panel>
                    </Collapse>
                  </div>
                </div>
              </Col>

              {/* Cột phải (1/3) */}
              <Col xs={24} md={8}>
                <div style={{
                  position: 'sticky',
                  top: '100px',
                  maxHeight: 'calc(100vh - 150px)',
                  overflow: 'hidden'
                }}>
                  <Card
                    className="order-summary-card"
                    title={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <DollarOutlined style={{ marginRight: '8px', color: '#4caf50' }} />
                        <span>Thông tin đơn hàng</span>
                      </div>
                    }
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  >
                    <div className="price-summary">
                      {/* Tổng giá - hiển thị nổi bật nhất */}
                      <div className="total-price-container" style={{
                        background: 'linear-gradient(135deg, #f6ffed 0%, #e8f5e9 100%)',
                        padding: '16px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        marginBottom: '16px'
                      }}>
                        <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                          Tổng giá
                        </Text>
                        <Text strong style={{
                          fontSize: '28px',
                          color: '#4caf50',
                          display: 'block',
                          fontFamily: "'Roboto', sans-serif"
                        }}>
                          {currentDesign?.totalPrice?.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </Text>
                      </div>

                      {/* Chi tiết giá */}
                      <div className="price-details" style={{
                        background: '#fff',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '16px'
                      }}>
                        <div className="price-detail-item" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <Text type="secondary">Giá thiết kế:</Text>
                          <Text>
                            {currentDesign?.designPrice?.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </Text>
                        </div>
                        <div className="price-detail-item" style={{
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <Text type="secondary">Giá vật liệu:</Text>
                          <Text>
                            {currentDesign?.materialPrice?.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </Text>
                        </div>
                      </div>

                      {/* Số dư ví */}
                      <div className="wallet-balance-container" style={{
                        background: balance >= currentDesign?.totalPrice
                          ? 'linear-gradient(135deg, #f6ffed 0%, #e8f5e9 100%)'
                          : 'linear-gradient(135deg, #fff2f0 0%, #ffebee 100%)',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        border: balance >= currentDesign?.totalPrice
                          ? '1px solid #b7eb8f'
                          : '1px solid #ffccc7'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                              Số dư ví:
                            </Text>
                            <Text strong style={{
                              fontSize: '18px',
                              color: balance >= currentDesign?.totalPrice ? '#4caf50' : '#f5222d'
                            }}>
                              {walletLoading ? (
                                <Spin size="small" />
                              ) : (
                                balance?.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })
                              )}
                            </Text>
                          </div>
                          {balance >= currentDesign?.totalPrice && (
                            <Badge
                              status="success"
                              text={<Text style={{ color: '#4caf50' }}>Đủ để thanh toán</Text>}
                            />
                          )}
                        </div>

                        {balance < currentDesign?.totalPrice && (
                          <div style={{ marginTop: '12px' }}>
                            <Text type="danger" style={{ display: 'block', marginBottom: '8px' }}>
                              Số dư ví không đủ để thanh toán.
                            </Text>
                            <Button
                              type="primary"
                              danger
                              onClick={() => navigate("/userwallets")}
                              icon={<DollarOutlined />}
                              block
                            >
                              Nạp tiền ngay
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Nút đặt hàng */}
                      <div style={{ margin: '20px 0' }}>
                        <Button
                          type="primary"
                          size="large"
                          icon={<ShoppingCartOutlined />}
                          onClick={handleSubmit}
                          loading={orderLoading}
                          disabled={balance < currentDesign?.totalPrice || !isAddressValid}
                          block
                          style={{
                            height: '48px',
                            fontSize: '16px',
                            background: (balance >= currentDesign?.totalPrice && isAddressValid) ? '#4caf50' : '#d9d9d9',
                            borderColor: (balance >= currentDesign?.totalPrice && isAddressValid) ? '#3d9140' : '#d9d9d9'
                          }}
                        >
                          Xác nhận đặt hàng
                        </Button>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <Space>
                          <CheckCircleOutlined style={{ color: '#4caf50' }} />
                          <Text type="secondary">Đảm bảo 100% chính hãng</Text>
                        </Space>
                      </div>
                    </div>
                  </Card>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Content>
      <Footer ref={footerRef} />

      {/* Confirmation Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center' }}>
            <CheckCircleOutlined style={{ color: '#4caf50', fontSize: '24px', marginRight: '8px' }} />
            <span>Xác nhận đặt hàng</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleConfirmOrder}
        onCancel={() => setIsModalOpen(false)}
        okText="Xác nhận đặt hàng"
        cancelText="Hủy"
        centered
        width={480}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: '#4caf50', marginBottom: "16px" }}>
            Hoàn tất đơn hàng!
          </h2>
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "16px", marginBottom: "8px" }}>
              Số tiền cần thanh toán:
            </p>
            <p
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#f5222d",
                marginBottom: "16px",
              }}
            >
              {currentDesign?.totalPrice?.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                Số dư ví hiện tại:
              </p>
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color:
                    balance >= currentDesign?.totalPrice
                      ? "#4caf50"
                      : "#f5222d",
                }}
              >
                {walletLoading ? (
                  <Spin size="small" />
                ) : (
                  balance?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })
                )}
              </p>
            </div>
            {balance < currentDesign?.totalPrice && (
              <div
                style={{
                  color: "#f5222d",
                  fontSize: "14px",
                  marginBottom: "16px",
                }}
              >
                Số dư ví không đủ để thanh toán. Vui lòng nạp thêm tiền.
              </div>
            )}
          </div>
          <p style={{ color: "#666" }}>
            {balance >= currentDesign?.totalPrice
              ? 'Nhấn "Xác nhận đặt hàng" để hoàn tất'
              : "Vui lòng nạp thêm tiền vào ví để tiếp tục"}
          </p>
        </div>
      </Modal>
    </Layout>
  );
};

export default OrderService;
