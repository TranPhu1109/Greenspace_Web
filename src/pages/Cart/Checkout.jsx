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
} from "antd";
import {
  EnvironmentOutlined,
  MessageOutlined,
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
    buyNow 
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
  const [saveAddress, setSaveAddress] = useState(false);
  const [userHasAddress, setUserHasAddress] = useState(false);
  const [userPhone, setUserPhone] = useState('');

  useEffect(() => {
    // Kiểm tra user có địa chỉ hay chưa và lấy phone
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.address && user.address.trim() !== "") {
          setUserHasAddress(true);
        } else {
          setUserHasAddress(false);
        }
        if (user && user.phone) {
          setUserPhone(user.phone);
          form.setFieldsValue({ phone: user.phone });
        }
      } catch (error) {
        console.error("Lỗi khi đọc thông tin người dùng:", error);
      }
    }
  }, [form]);

  useEffect(() => {
    // Kiểm tra và thiết lập sản phẩm từ mua ngay hoặc giỏ hàng
    if (state?.isBuyNow && state?.products) {
      setProducts(state.products);
    } else {
      setProducts(cartItems);
    }
  }, [state, cartItems]);

  const handleAddressChange = async (newAddressData) => {
    console.log("Address data changed:", newAddressData);
    setAddressData(newAddressData);
    
    // Nếu đang reset về trạng thái ban đầu (bỏ tích sử dụng địa chỉ mặc định)
    if (newAddressData.useDefaultAddress === false && newAddressData.province === null) {
      console.log("Resetting shipping fee to default");
      // Reset phí vận chuyển về 0 hoặc giá trị mặc định
      resetShippingFee();
      return;
    }
    
    // Nếu đang sử dụng địa chỉ mặc định thì lấy dữ liệu từ thông tin parsedAddress
    if (newAddressData.useDefaultAddress) {
      console.log("Using default address for shipping fee calculation");
      setCalculatingFee(true);
      try {
        // Cần trích xuất tỉnh/thành phố, quận/huyện, phường/xã từ địa chỉ mặc định
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
    
    // Trường hợp nhập địa chỉ mới
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

  const [addressData, setAddressData] = useState(null);

  const handleFinish = async (values) => {
    try {
      // Kiểm tra lại logic để đảm bảo địa chỉ mặc định được xử lý đúng
      if (!addressData) {
        message.error('Vui lòng chọn địa chỉ giao hàng');
        return;
      }
      
      // Nếu không phải địa chỉ mặc định, kiểm tra các thông tin đia chỉ có đầy đủ không
      if (!addressData.useDefaultAddress && 
          (!addressData.province || !addressData.district || !addressData.ward || !values.streetAddress)) {
        message.error('Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng');
        return;
      }

      const userId = JSON.parse(localStorage.getItem('user')).id;
      const walletStorage = JSON.parse(localStorage.getItem('wallet-storage'));
      const walletId = walletStorage.state.walletId;
      const userObj = JSON.parse(localStorage.getItem('user'));

      // Tạo chuỗi địa chỉ theo định dạng "đường|phường/xã|quận/huyện|tỉnh/thành phố"
      const address = addressData.useDefaultAddress 
        ? userObj.address
        : `${values.streetAddress}|${addressData.ward.label}|${addressData.district.label}|${addressData.province.label}`;

      // Nếu người dùng chọn lưu địa chỉ vào tài khoản
      if (saveAddress && !addressData.useDefaultAddress && !userHasAddress) {
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
        // Sử dụng API buy-now cho mua ngay
        orderResponse = await buyNow({
          userId: userId,
          address: address,
          phone: values.phone,
          shipPrice: shippingFee,
          productId: products[0].id,
          quantity: products[0].quantity
        });
      } else {
        // Sử dụng API createOrderProducts cho mua từ giỏ hàng
        orderResponse = await createOrderProducts({
          userId: userId,
          address: address,
          phone: values.phone,
          shipPrice: shippingFee
        });
      }

      if (orderResponse.status === 200) {
        try {
          // Create bill using store
          const billResponse = await createBill({
            walletId: walletId,
            orderId: orderResponse.data.id,
            serviceOrderId: null,
            amount: calculateTotal() + shippingFee,
            description: 'Thanh toán đơn hàng'
          });
          
          if (billResponse.status === 200) {
            message.success('Đặt hàng và thanh toán thành công!');
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
                    <Form.Item
                      name="phone"
                      label="Số điện thoại"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại",
                        },
                        {
                          pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                          message: "Số điện thoại không hợp lệ",
                        },
                      ]}
                    >
                      <Input
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        maxLength={10}
                        defaultValue={userPhone}
                        allowClear
                      />
                    </Form.Item>
                    <AddressForm form={form} onAddressChange={handleAddressChange} />

                    {/* Hiển thị tùy chọn lưu địa chỉ chỉ khi người dùng chưa có địa chỉ */}
                    {!userHasAddress && !addressData?.useDefaultAddress && (
                      <Form.Item name="saveAddress">
                        <Checkbox 
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          checked={saveAddress}
                        >
                          Lưu địa chỉ này cho lần sau
                        </Checkbox>
                      </Form.Item>
                    )}

                    <Form.Item name="note" label="Ghi chú">
                      <Input.TextArea
                        prefix={
                          <MessageOutlined className="site-form-item-icon" />
                        }
                        placeholder="Ghi chú thêm về địa chỉ giao hàng (nếu có)"
                        rows={4}
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        block
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
