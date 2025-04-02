import React, { useEffect } from 'react';
import { Layout, Typography, Table, Button, InputNumber, Empty, Space, message } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useCartStore from '@/stores/useCartStore';
import useWalletStore from '@/stores/useWalletStore';
import './styles.scss';

const { Content } = Layout;
const { Title, Text } = Typography;

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, loading, fetchCartItems, removeFromCart, updateQuantity, checkout } = useCartStore();
  const { balance } = useWalletStore();

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  console.log('cartItems:', cartItems);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    await updateQuantity(productId, quantity);
  };


  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item?.price || 0;
      const quantity = item?.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    const total = calculateTotal();
    if (total > balance) {
      message.error('Số dư không đủ. Vui lòng nạp thêm tiền vào ví.');
      return;
    }

    try {
      await checkout();
      message.success('Thanh toán thành công');
      navigate('/orders');
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <img 
            src={record.image.imageUrl} 
            alt={text} 
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} 
          />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${(price || 0).toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Số lượng',
      key: 'quantity',
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
      title: 'Tổng',
      key: 'total',
      render: (_, record) => `${((record?.price || 0) * (record?.quantity || 0)).toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Thao tác',
      key: 'action',
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

  if (!cartItems.length && !loading) {
    return (
      <Layout className="cart-layout">
        <Header />
        <Content>
          <div className="cart-content">
            <div className="container">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Giỏ hàng trống"
              >
                <Button type="primary" onClick={() => navigate('/products')}>
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
    <Layout className="cart-layout">
      <Header />
      <Content>
        <div className="cart-content">
          <div className="container">
            <div className="cart-header">
              <Title level={2}>
                <ShoppingCartOutlined /> Giỏ hàng
              </Title>
            </div>
            
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
                <Text type="success">{balance.toLocaleString('vi-VN')}đ</Text>
              </div>
              <div className="checkout-section">
                <Text strong className="total-amount">
                  Tổng tiền: {calculateTotal().toLocaleString('vi-VN')}đ
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