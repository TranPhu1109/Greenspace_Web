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
  Select,
  Modal,
} from "antd";
import {
  EnvironmentOutlined,
  HomeOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useCartStore from "@/stores/useCartStore";
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
} from "@/services/ghnService";
import "./Checkout.scss";
import useShippingStore from "@/stores/useShippingStore";

const { Content } = Layout;
const { Title, Text } = Typography;

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, loading, createOrderProducts, createBill, buyNow } = useCartStore();
  const { shippingFee, calculateShippingFee } = useShippingStore();
  const [products, setProducts] = useState([]);
  const { state } = useLocation();
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [calculatingFee, setCalculatingFee] = useState(false);

  useEffect(() => {
    // Kiểm tra và thiết lập sản phẩm từ mua ngay hoặc giỏ hàng
    if (state?.isBuyNow && state?.products) {
      setProducts(state.products);
    } else {
      setProducts(cartItems);
    }
  }, [state, cartItems]);

  useEffect(() => {
    const getProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const data = await fetchProvinces();
        setProvinces(data);
      } catch (error) {
        message.error("Không thể tải danh sách tỉnh thành");
      } finally {
        setLoadingProvinces(false);
      }
    };
    getProvinces();
  }, []);

  const handleProvinceChange = async (provinceId) => {
    setDistricts([]);
    setWards([]);
    form.setFieldValue("district", undefined);
    form.setFieldValue("ward", undefined);
    if (!provinceId) return;

    setLoadingDistricts(true);
    try {
      const data = await fetchDistricts(provinceId);
      setDistricts(data);
    } catch (error) {
      message.error("Không thể tải danh sách quận/huyện");
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (districtId) => {
    setWards([]);
    form.setFieldValue("ward", undefined);
    if (!districtId) return;

    setLoadingWards(true);
    try {
      const data = await fetchWards(districtId);
      setWards(data);
    } catch (error) {
      message.error("Không thể tải danh sách phường/xã");
    } finally {
      setLoadingWards(false);
    }
  };

  const handleAddressChange = async () => {
    const province = provinces.find(
      (p) => p.value === form.getFieldValue("provinces")
    );
    const district = districts.find(
      (d) => d.value === form.getFieldValue("district")
    );
    const ward = wards.find((w) => w.value === form.getFieldValue("ward"));

    if (province && district && ward) {
      setCalculatingFee(true);
      try {
        const fee = await calculateShippingFee({
          toProvinceName: province.label,
          toDistrictName: district.label,
          toWardName: ward.label,
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

  const handleFormValuesChange = (changedValues, allValues) => {
    // Chỉ gọi handleAddressChange khi có sự thay đổi ở các trường địa chỉ
    if (changedValues.provinces || changedValues.district || changedValues.ward) {
      handleAddressChange();
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
      const userId = JSON.parse(localStorage.getItem('user')).id;
      const walletStorage = JSON.parse(localStorage.getItem('wallet-storage'));
      const walletId = walletStorage.state.walletId;

      const selectedProvince = provinces.find(p => p.value === values.provinces);
      const selectedDistrict = districts.find(d => d.value === values.district);
      const selectedWard = wards.find(w => w.value === values.ward);

      const address = `${values.streetAddress}, ${selectedWard?.label}, ${selectedDistrict?.label}, ${selectedProvince?.label}`;

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
            navigate('/Home');
          }
        } catch (error) {
          message.error('Có lỗi xảy ra khi thanh toán');
        }
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi đặt hàng');
    }
  };

  return (
    <Layout >
      <Header />
      <Content>
        <div className="checkout-content">
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
                    onValuesChange={handleFormValuesChange}
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
                      />
                    </Form.Item>
                    <Form.Item
                      name="provinces"
                      label="Tỉnh/Thành phố"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn tỉnh/thành phố",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        loading={loadingProvinces}
                        placeholder="Chọn tỉnh/thành phố"
                        optionFilterProp="label"
                        options={provinces}
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        onChange={handleProvinceChange}
                      />
                    </Form.Item>
                    <Form.Item
                      name="district"
                      label="Quận/Huyện"
                      rules={[
                        { required: true, message: "Vui lòng chọn quận/huyện" },
                      ]}
                    >
                      <Select
                        showSearch
                        loading={loadingDistricts}
                        placeholder="Chọn quận/huyện"
                        optionFilterProp="label"
                        options={districts}
                        disabled={!form.getFieldValue("provinces")}
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        onChange={handleDistrictChange}
                      />
                    </Form.Item>
                    <Form.Item
                      name="ward"
                      label="Phường/Xã"
                      rules={[
                        { required: true, message: "Vui lòng chọn phường/xã" },
                      ]}
                    >
                      <Select
                        showSearch
                        loading={loadingWards}
                        placeholder="Chọn phường/xã"
                        optionFilterProp="label"
                        options={wards}
                        disabled={!form.getFieldValue("district")}
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>
                    <Form.Item
                      name="streetAddress"
                      label="Số nhà, tên đường"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số nhà, tên đường",
                        },
                      ]}
                    >
                      <Input
                        prefix={
                          <HomeOutlined className="site-form-item-icon" />
                        }
                        placeholder="Ví dụ: 123 Đường Lê Lợi"
                      />
                    </Form.Item>

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
