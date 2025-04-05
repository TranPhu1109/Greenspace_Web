import React, { useEffect } from "react";
import {
  Layout,
  Typography,
  Table,
  Button,
  InputNumber,
  Empty,
  Space,
  message,
  Breadcrumb,
} from "antd";
import {
  DeleteOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useCartStore from "@/stores/useCartStore";
import useWalletStore from "@/stores/useWalletStore";
import "./styles.scss";

const { Content } = Layout;
const { Title, Text } = Typography;

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    fetchCartItems,
    removeFromCart,
    updateQuantity,
    checkout,
  } = useCartStore();
  const { balance, fetchBalance } = useWalletStore();

  useEffect(() => {
    fetchBalance();
    fetchCartItems();
  }, [fetchCartItems]);

  console.log("cartItems:", cartItems);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    await updateQuantity(productId, quantity);
    fetchCartItems();
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item?.price || 0;
      const quantity = item?.quantity || 0;
      return total + price * quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    const total = calculateTotal();
    if (total > balance) {
      message.error("Số dư không đủ. Vui lòng nạp thêm tiền vào ví.");
      return;
    }

    // Chuyển hướng đến trang thanh toán
    navigate("/cart/checkout");
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          {record.image ? (
            <img
              src={record.image?.imageUrl || ""}
              alt={text}
              style={{
                width: 50,
                height: 50,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          ) : (
            <div
              style={{
                width: 50,
                height: 50,
                backgroundColor: "#f0f0f0",
                borderRadius: 4,
              }}
            />
          )}
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${(price || 0).toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Số lượng",
      key: "quantity",
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.stock}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
        />
      ),
    },
    {
      title: "Tổng",
      key: "total",
      render: (_, record) =>
        `${((record?.price || 0) * (record?.quantity || 0)).toLocaleString(
          "vi-VN"
        )}đ`,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeFromCart(record.id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  if ((!cartItems || !cartItems.length) && !loading) {
    return (
      <Layout className="cart-layout">
        <Header />
        <Content>
          <div className="cart-content">
            <div className="container">
              <Breadcrumb style={{ margin: "16px 0" }}>
                <Breadcrumb.Item href="/Home">
                  <HomeOutlined /> Trang chủ
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <ShoppingCartOutlined /> Giỏ hàng
                </Breadcrumb.Item>
              </Breadcrumb>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Giỏ hàng trống"
              >
                <Button type="primary" onClick={() => navigate("/products")}>
                  Tiếp tục mua sắm
                </Button>
              </Empty>
            </div>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout >
      <Header />
      <Content>
        <div className="cart-content">
          <div className="container">
            <Breadcrumb style={{ margin: "20px 0 10px" }}>
              <Breadcrumb.Item href="/Home">
                <HomeOutlined /> Trang chủ
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <ShoppingCartOutlined /> Giỏ hàng
              </Breadcrumb.Item>
            </Breadcrumb>

            <div className="cart-table">
              <Table
                columns={columns}
                dataSource={cartItems}
                loading={loading}
                rowKey="id"
                pagination={false}
              />
            </div>

            <div className="cart-summary">
              <div className="wallet-balance">
                <Text strong>Số dư ví: </Text>
                <Text type="success">{balance.toLocaleString("vi-VN")}đ</Text>
              </div>
              <div className="checkout-section">
                <Text strong className="total-amount">
                  Tổng tiền: {calculateTotal().toLocaleString("vi-VN")}đ
                </Text>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleCheckout}
                  loading={loading}
                  disabled={!cartItems.length}
                >
                  Thanh toán
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default CartPage;
