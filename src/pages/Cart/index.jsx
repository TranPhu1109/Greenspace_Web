import React, { useEffect, useState, useCallback } from "react";
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
  notification,
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
import useProductStore from "@/stores/useProductStore";
import debounce from 'lodash/debounce';
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
  const { products, fetchProducts } = useProductStore();
  
  // State tạm thời lưu số lượng hiển thị trước khi gửi API
  const [localCartItems, setLocalCartItems] = useState([]);

  // Khởi tạo localCartItems khi cartItems thay đổi
  useEffect(() => {
    setLocalCartItems(cartItems);
  }, [cartItems]);

  useEffect(() => {
    fetchBalance();
    fetchCartItems();
    fetchProducts();
  }, [fetchCartItems]);

  // Hàm debounce để gọi API cập nhật số lượng
  const debouncedUpdateQuantity = useCallback(
    debounce(async (productId, quantity) => {
      try {
        await updateQuantity(productId, quantity);
        await fetchCartItems();
      } catch (error) {
        console.error("Error updating quantity:", error);
        message.error("Không thể cập nhật số lượng. Vui lòng thử lại sau.");
        // Nếu có lỗi, khôi phục cartItems về giá trị ban đầu
        await fetchCartItems();
      }
    }, 800), // Delay 800ms trước khi gọi API
    [updateQuantity, fetchCartItems]
  );

  // Cập nhật số lượng sản phẩm trong state local trước, sau đó gửi API
  const handleQuantityChange = (productId, quantity) => {
    // Kiểm tra số lượng hợp lệ
    if (quantity === null || quantity === undefined) {
      return; // Không làm gì khi giá trị là null/undefined (người dùng đang xóa số)
    }
    
    // Lưu giá trị đang nhập vào state (bất kể là giá trị gì)
    setLocalCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity, inputValue: String(quantity) } : item
      )
    );
    
    // Đảm bảo quantity là số nguyên
    quantity = Math.floor(Number(quantity));
    
    // Đảm bảo số lượng ít nhất là 1
    if (quantity < 1) {
      quantity = 1;
    }
    
    // Tìm thông tin sản phẩm trong danh sách products
    const product = products.find(product => product.id === productId);
    
    if (product && quantity > product.stock) {
      notification.warning({
        message: "Số lượng vượt quá tồn kho",
        description: `Số lượng tối đa có thể thêm vào giỏ hàng là ${product.stock}. Vui lòng nhập lại số lượng phù hợp.`,
        duration: 3,
      });
      
      // KHÔNG cập nhật lại localCartItems ở đây để giữ giá trị đang nhập
      // Chỉ gọi API khi người dùng blur
      return;
    }
    
    // Debounce gọi API để tránh nhiều request liên tiếp
    debouncedUpdateQuantity(productId, quantity);
  };

  const calculateTotal = () => {
    return localCartItems.reduce((total, item) => {
      const price = item?.price || 0;
      const quantity = item?.quantity || 0;
      return total + price * quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    // Thu thập tất cả các input số lượng đang focus để kiểm tra
    const activeInputs = document.querySelectorAll('.ant-input-number-input:focus');
    if (activeInputs.length > 0) {
      // Trigger blur trên tất cả các input đang focus
      activeInputs.forEach(input => input.blur());
      // Đợi một chút để các event handlers xử lý
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Kiểm tra mọi sản phẩm trong cart để tìm những cái vượt quá stock
    // Chú ý: phải kiểm tra dựa trên giá trị hiện tại trong input, không phải chỉ localCartItems
    const activeInputValues = {};
    document.querySelectorAll('.ant-input-number-input').forEach(input => {
      // Tìm product id từ DOM
      const rowElement = input.closest('tr');
      if (rowElement) {
        const rowKey = rowElement.getAttribute('data-row-key');
        if (rowKey) {
          activeInputValues[rowKey] = input.value ? parseFloat(input.value) : 0;
        }
      }
    });
    
    // Thu thập tất cả các sản phẩm có số lượng vượt quá stock
    const invalidItems = [];
    
    for (let item of localCartItems) {
      const product = products.find(product => product.id === item.id);
      if (!product) continue;
      
      // Sử dụng giá trị từ DOM nếu có, nếu không dùng giá trị từ state
      const currentQuantity = activeInputValues[item.id] || item.quantity;
      
      if (currentQuantity > product.stock) {
        invalidItems.push({
          name: item.name,
          current: currentQuantity,
          max: product.stock,
          id: item.id
        });
      }
    }
    
    // Nếu có sản phẩm không hợp lệ, hiển thị thông báo và không cho phép thanh toán
    if (invalidItems.length > 0) {
      // Tự động điều chỉnh số lượng của các sản phẩm không hợp lệ
      const newLocalItems = [...localCartItems];
      
      invalidItems.forEach(item => {
        // Cập nhật số lượng trong state local
        const index = newLocalItems.findIndex(i => i.id === item.id);
        if (index !== -1) {
          newLocalItems[index] = {
            ...newLocalItems[index],
            quantity: item.max
          };
        }
        
        // Cập nhật giá trị trong DOM
        const input = document.querySelector(`tr[data-row-key="${item.id}"] .ant-input-number-input`);
        if (input) {
          input.value = item.max;
        }
        
        // Gọi API để cập nhật số lượng
        debouncedUpdateQuantity(item.id, item.max);
      });
      
      // Cập nhật state
      setLocalCartItems(newLocalItems);
      
      // Hiển thị thông báo
      notification.error({
        message: "Số lượng sản phẩm vượt quá tồn kho",
        description: 
          <div>
            <p>Các sản phẩm sau có số lượng vượt quá tồn kho:</p>
            <ul>
              {invalidItems.map(item => (
                <li key={item.id}>
                  {item.name}: {item.current} ⟶ {item.max} (Tồn kho tối đa)
                </li>
              ))}
            </ul>
            <p>Số lượng đã được tự động điều chỉnh.</p>
          </div>,
        duration: 5,
      });
      return;
    }
    
    const total = calculateTotal();
    if (total > balance) {
      notification.error({
        message: "Số dư không đủ",
        description: "Vui lòng nạp thêm tiền vào ví để tiếp tục thanh toán.",
        duration: 3,
      });
      return;
    }

    // Chuyển hướng đến trang thanh toán
    navigate("/cart/checkout");
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      // Cập nhật UI trước
      setLocalCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      // Gọi API
      await removeFromCart(productId);
      message.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      console.error("Error removing from cart:", error);
      message.error("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
      // Nếu có lỗi, khôi phục cartItems về giá trị ban đầu
      await fetchCartItems();
    }
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        const product = products.find(p => p.id === record.id);
        const stockDisplay = product ? product.stock : "Đang cập nhật";
        
        return (
          <Space direction="vertical" size="small" style={{ display: 'flex' }}>
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
              <Text strong>{text}</Text>
            </Space>
            <Text type="secondary">Còn lại: {stockDisplay} sản phẩm</Text>
          </Space>
        );
      },
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
      render: (_, record) => {
        const product = products.find(p => p.id === record.id);
        const maxStock = product ? product.stock : 99;
        const localItem = localCartItems.find(item => item.id === record.id);
        const quantity = localItem ? localItem.quantity : record.quantity;
        
        // Xử lý sự kiện khi người dùng blur khỏi input
        const handleBlur = () => {
          // Tìm thông tin sản phẩm trong danh sách products
          const product = products.find(p => p.id === record.id);
          if (!product) return;
          
          const currentValue = parseFloat(document.querySelector(`tr[data-row-key="${record.id}"] .ant-input-number-input`)?.value || 0);
          
          // Nếu giá trị hiện tại vượt quá stock
          if (currentValue > product.stock) {
            // Cập nhật về giá trị tối đa là stock
            setLocalCartItems(prevItems => 
              prevItems.map(item => 
                item.id === record.id ? { ...item, quantity: product.stock } : item
              )
            );
            // Gọi API cập nhật
            debouncedUpdateQuantity(record.id, product.stock);
            
            // Hiển thị thông báo
            notification.warning({
              message: "Số lượng đã được điều chỉnh",
              description: `Số lượng của sản phẩm "${record.name}" đã được điều chỉnh về tối đa ${product.stock} do vượt quá tồn kho.`,
              duration: 3,
            });
          }
        };
        
        return (
          <InputNumber
            min={1}
            max={maxStock}
            value={quantity}
            onChange={(value) => handleQuantityChange(record.id, value)}
            onBlur={handleBlur}
            onPressEnter={handleBlur}
            style={{ 
              width: '80px',
              borderColor: quantity > maxStock ? '#ff4d4f' : undefined,
              backgroundColor: quantity > maxStock ? '#fff1f0' : undefined
            }}
          />
        );
      },
    },
    {
      title: "Tổng",
      key: "total",
      render: (_, record) => {
        const localItem = localCartItems.find(item => item.id === record.id);
        const quantity = localItem ? localItem.quantity : record.quantity;
        return `${((record?.price || 0) * (quantity || 0)).toLocaleString("vi-VN")}đ`;
      }
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveFromCart(record.id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  if ((!localCartItems || !localCartItems.length) && !loading) {
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
    <Layout className="cart-layout">
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
                dataSource={localCartItems}
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
                  disabled={!localCartItems.length}
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
