import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Form,
  Input,
  Button,
  Card,
  Space,
  message,
  Row,
  Col,
  List,
  Avatar,
  Divider,
  Modal,
  Checkbox,
  Breadcrumb,
} from "antd";
import {
  EnvironmentOutlined,
  HomeOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useCartStore from "@/stores/useCartStore";
import "./Checkout.scss";
import useShippingStore from "@/stores/useShippingStore";
import AddressForm from "@/components/Common/AddressForm";
import useAuthStore from "@/stores/useAuthStore";

const { Content } = Layout;
const { Title, Text } = Typography;

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    createOrderProducts,
    createBill,
    buyNow,
    removeMultipleFromCart
  } = useCartStore();
  const {
    shippingFee,
    calculateShippingFee,
    resetShippingFee
  } = useShippingStore();
  const {
    updateUserAddress
  } = useAuthStore();
  const [products, setProducts] = useState([]);
  const { state } = useLocation();
  const [form] = Form.useForm();
  const [calculatingFee, setCalculatingFee] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [addressData, setAddressData] = useState(null);

  useEffect(() => {
    // Check if user has address and get phone
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user) {
          // Set user has address flag
          if (user.address && user.address.trim() !== "") {
            setUserHasAddress(true);
          } else {
            setUserHasAddress(false);
          }

          // Set user phone if available
          if (user.phone) {
            setUserPhone(user.phone);
          }

          // Set user name if available
          if (user.name || user.fullName) {
            setUserName(user.name || user.fullName);
          }
        }
      } catch (error) {
        console.error("Error reading user information:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Kiểm tra và thiết lập sản phẩm từ location state
    if (state?.selectedProducts && state.selectedProducts.length > 0) {
      setProducts(state.selectedProducts);
    } else if (state?.isBuyNow && state?.products) {
      setProducts(state.products);
    } else {
      setProducts(cartItems);
    }
  }, [state, cartItems]);

  const handleAddressChange = async (newAddressData) => {
    console.log("Address data changed:", newAddressData);
    setAddressData(newAddressData);

    // If resetting to default state (unchecking default address)
    if (newAddressData.useDefaultAddress === false && newAddressData.province === null) {
      console.log("Resetting shipping fee to default");
      // Reset shipping fee to 0 or default value
      resetShippingFee();
      return;
    }

    // If using default address, get data from parsedAddress
    if (newAddressData.useDefaultAddress) {
      console.log("Using default address for shipping fee calculation");
      setCalculatingFee(true);
      try {
        // Extract province/city, district, ward from default address
        const fee = await calculateShippingFee({
          toProvinceName: newAddressData.province.label,
          toDistrictName: newAddressData.district.label,
          toWardName: newAddressData.ward.label,
        });

        console.log("Default address shipping fee:", fee);
        if (fee) {
          message.success("Đã cập nhật phí vận chuyển");
        }
      } catch (error) {
        console.error("Lỗi tính phí vận chuyển cho địa chỉ mặc định:", error);
        message.error("Không thể tính phí vận chuyển");
      } finally {
        setCalculatingFee(false);
      }
      return;
    }

    // Case of entering a new address or selecting a saved address
    if (newAddressData.province && newAddressData.district && newAddressData.ward) {
      setCalculatingFee(true);
      try {
        const fee = await calculateShippingFee({
          toProvinceName: newAddressData.province.label,
          toDistrictName: newAddressData.district.label,
          toWardName: newAddressData.ward.label,
        });
        if (fee) {
          message.success("Đã cập nhật phí vận chuyển");
        }
      } catch (error) {
        console.error("Lỗi tính phí vận chuyển:", error);
        message.error("Không thể tính phí vận chuyển");
      } finally {
        setCalculatingFee(false);
      }
    }
  };

  const calculateTotal = () => {
    return products.reduce((total, item) => {
      const price = item?.price || 0;
      const quantity = item?.quantity || 0;
      return total + price * quantity;
    }, 0);
  };

  const handleFinish = async (values) => {
    try {
      // Check if we have address data
      if (!addressData) {
        message.error('Vui lòng chọn địa chỉ giao hàng');
        return;
      }

      const userId = JSON.parse(localStorage.getItem('user')).id;
      const walletStorage = JSON.parse(localStorage.getItem('wallet-storage'));
      const walletId = walletStorage.state.walletId;
      const userObj = JSON.parse(localStorage.getItem('user'));

      // Get phone number from address data or user profile
      let phone = '';

      // Priority order for phone:
      // 1. Phone from selected address
      // 2. Default user phone from profile
      if (addressData.phone) {
        phone = addressData.phone;
      } else if (userPhone) {
        phone = userPhone;
      } else {
        message.error('Không tìm thấy số điện thoại. Vui lòng chọn địa chỉ khác.');
        return;
      }

      // Get user name from address data or user profile
      let userName = '';
      if (addressData.name) {
        userName = addressData.name;
      } else if (addressData.fullAddressData?.recipientInfo?.name) {
        userName = addressData.fullAddressData.recipientInfo.name;
      } else {
        userName = userObj.name || '';
      }

      // Create address string in format "street|ward|district|province"
      let address;

      if (addressData.useDefaultAddress) {
        // Use default address from user object
        address = userObj.address;
      } else if (addressData.streetAddress) {
        // If address data contains detailed address info (from AddressForm)
        address = `${addressData.streetAddress}|${addressData.ward.label}|${addressData.district.label}|${addressData.province.label}`;
      } else {
        // Fallback to form values
        address = `${values.streetAddress}|${addressData.ward.label}|${addressData.district.label}|${addressData.province.label}`;
      }

      // If user chooses to save address to account from AddressForm
      if (addressData.saveAsDefault || addressData.fullAddressData?.shippingInfo?.saveAsDefault) {
        try {
          await updateUserAddress(address);
          message.success('Đã lưu địa chỉ vào tài khoản');
        } catch (error) {
          console.error("Lỗi khi lưu địa chỉ:", error);
          message.error('Không thể lưu địa chỉ vào tài khoản');
        }
      }

      let orderResponse;
      if (state?.isBuyNow) {
        // Use buy-now API for immediate purchase
        orderResponse = await buyNow({
          userId: userId,
          userName: userName,
          address: address,
          phone: phone,
          shipPrice: shippingFee,
          productId: products[0].id,
          quantity: products[0].quantity
        });
      } else {
        // Prepare product list to send
        const productsList = products.map(product => ({
          productId: product.id,
          quantity: product.quantity
        }));

        // Use createOrderProducts API for cart purchase with new structure
        orderResponse = await createOrderProducts({
          userId: userId,
          userName: userName,
          address: address,
          phone: phone,
          shipPrice: shippingFee,
          products: productsList
        });
      }
      console.log(orderResponse);
      if (orderResponse.status === 201) {
        try {
          // Create bill using store
          const billResponse = await createBill({
            walletId: walletId,
            orderId: orderResponse.data?.data?.id,
            amount: calculateTotal() + shippingFee,
            description: 'Thanh toán đơn hàng'
          });

          if (billResponse.status === 200) {
            message.success('Đặt hàng và thanh toán thành công!');

            // Xóa sản phẩm đã đặt khỏi giỏ hàng
            if (!state?.isBuyNow) {
              const productIds = products.map(product => product.id);
              await removeMultipleFromCart(productIds);
            }

            resetShippingFee();
            setProducts([]);
            navigate('/orderhistory', {
              replace: true,
              state: { fromCheckout: true }
            });
          }
        } catch (error) {
          message.error(error.response.data.error);
        }
      }
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  return (
    <Layout >
      <Header />
      <Content>
        <div className="checkout-content" style={{ margin: '200px 0 20px' }}>
          <div className="container">
            <Breadcrumb style={{
              margin: '20px 0 10px',
              padding: '12px 16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              position: 'sticky',
              top: '80px',
              zIndex: 100,
              maxWidth: '1200px',
            }}>
              <Breadcrumb.Item onClick={() => navigate('/Home')} className="breadcrumb-link">
                <HomeOutlined /> Trang chủ
              </Breadcrumb.Item>
              <Breadcrumb.Item onClick={() => navigate('/cart')} className="breadcrumb-link">
                <ShoppingCartOutlined /> Giỏ hàng
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <TruckOutlined /> Thanh toán
              </Breadcrumb.Item>
            </Breadcrumb>
            <Row gutter={24}>
              <Col xs={24} lg={16}>
                <Card className="checkout-card">
                  <Title level={2}>
                    <EnvironmentOutlined /> Thông tin giao hàng
                  </Title>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    className="checkout-form"
                    initialValues={{}}
                  >
                    <AddressForm form={form} onAddressChange={handleAddressChange} />

                    {/* <Form.Item name="note" label="Ghi chú">
                      <Input.TextArea
                        prefix={
                          <MessageOutlined className="site-form-item-icon" />
                        }
                        placeholder="Ghi chú thêm về địa chỉ giao hàng (nếu có)"
                        rows={4}
                      />
                    </Form.Item> */}

                    <Form.Item>
                      {!addressData || addressData.isFormOnly ? (
                        <div style={{ color: '#ff4d4f', textAlign: 'center', marginTop: '8px' }}>
                          <EnvironmentOutlined /> Vui lòng chọn địa chỉ giao hàng hoặc thêm địa chỉ mới
                        </div>
                      ) : null}
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        block
                        style={{ marginTop: '10px' }}
                        disabled={!addressData || addressData.isFormOnly}
                        title={!addressData || addressData.isFormOnly ? "Vui lòng chọn hoặc lưu địa chỉ giao hàng" : "Đặt hàng ngay"}
                      >
                        Đặt hàng
                      </Button>

                    </Form.Item>
                  </Form>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card className="order-summary-card">
                  <Title level={3}>
                    Thông tin đơn hàng ({products.length} sản phẩm)
                  </Title>

                  <div
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                      marginBottom: "16px",
                    }}
                  >
                    <List
                      itemLayout="horizontal"
                      dataSource={products}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                src={typeof item.image === 'string' ? item.image : (item.image?.imageUrl || '')}
                                shape="square"
                                size={64}
                              />
                            }
                            title={<Text strong>{item.name}</Text>}
                            description={
                              <Space direction="vertical">
                                <Text>Số lượng: {item.quantity}</Text>
                                <Text type="success">
                                  {(item.price * item.quantity).toLocaleString(
                                    "vi-VN"
                                  )}
                                  đ
                                </Text>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </div>

                  <Divider />

                  <Space
                    direction="vertical"
                    size="small"
                    className="order-total"
                    style={{ width: "100%" }}
                  >
                    <Row justify="space-between">
                      <Col>
                        <Text>Tạm tính:</Text>
                      </Col>
                      <Col>
                        <Text>{calculateTotal().toLocaleString("vi-VN")}đ</Text>
                      </Col>
                    </Row>

                    <Row justify="space-between">
                      <Col>
                        <Text>Phí vận chuyển:</Text>
                      </Col>
                      <Col>
                        <Text>
                          {calculatingFee
                            ? "Đang tính..."
                            : `${shippingFee.toLocaleString("vi-VN")}đ`}
                        </Text>
                      </Col>
                    </Row>

                    <Divider style={{ margin: "12px 0" }} />

                    <Row justify="space-between">
                      <Col>
                        <Text strong>Tổng cộng:</Text>
                      </Col>
                      <Col>
                        <Text
                          type="success"
                          strong
                          style={{ fontSize: "20px" }}
                        >
                          {(calculateTotal() + shippingFee).toLocaleString(
                            "vi-VN"
                          )}
                          đ
                        </Text>
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default Checkout;
