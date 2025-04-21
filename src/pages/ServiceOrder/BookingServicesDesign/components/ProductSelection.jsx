import React, { useState, useEffect } from 'react';
import { Tabs, Card, Row, Col, Image, Typography, InputNumber, Checkbox, Empty } from 'antd';

const { TabPane } = Tabs;
const { Text } = Typography;

const ProductSelection = ({ products = [], categories = [], selectedProducts = [], onChange }) => {
  const [internalSelected, setInternalSelected] = useState({});

  // Đồng bộ state nội bộ khi prop selectedProducts thay đổi từ bên ngoài
  useEffect(() => {
    const initialSelection = {};
    selectedProducts.forEach(item => {
      initialSelection[item.productId] = item.quantity;
    });
    setInternalSelected(initialSelection);
  }, [selectedProducts]);

  const handleSelectChange = (productId, checked) => {
    const newSelection = { ...internalSelected };
    let newSelectedDetails = [...selectedProducts];

    if (checked) {
      newSelection[productId] = 1; // Mặc định số lượng là 1 khi chọn
      // Thêm vào mảng nếu chưa có
      if (!newSelectedDetails.some(item => item.productId === productId)) {
        newSelectedDetails.push({ productId: productId, quantity: 1 });
      }
    } else {
      delete newSelection[productId];
      // Xóa khỏi mảng
      newSelectedDetails = newSelectedDetails.filter(item => item.productId !== productId);
    }

    setInternalSelected(newSelection);
    console.log("[ProductSelection] Filtered details before onChange:", newSelectedDetails); // Log dữ liệu trước khi gửi lên cha
    onChange(newSelectedDetails); // Gọi callback với mảng chi tiết
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity >= 1) {
      const newSelection = { ...internalSelected, [productId]: quantity };
      setInternalSelected(newSelection);

      // Cập nhật số lượng trong mảng chi tiết
      const newSelectedDetails = selectedProducts.map(item =>
        item.productId === productId ? { ...item, quantity: quantity } : item
      );
      onChange(newSelectedDetails); // Gọi callback với mảng chi tiết
    }
  };

  // Nhóm sản phẩm theo categoryId
  const productsByCategory = products.reduce((acc, product) => {
    const categoryId = product.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(product);
    return acc;
  }, {});

  // Lấy tên danh mục từ ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Khác';
  };

  return (
    <Card title="Chọn vật liệu" type="inner" style={{ marginTop: 16 }}>
      {categories.length > 0 && products.length > 0 ? (
        <Tabs defaultActiveKey={categories[0]?.id} tabPosition="left">
          {categories.map(category => (
            <TabPane tab={category.name} key={category.id}>
              <Row gutter={[16, 16]}>
                {productsByCategory[category.id]?.length > 0 ? (
                  productsByCategory[category.id].map(product => (
                    <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                      <Card
                        hoverable
                        onClick={() => handleSelectChange(product.id, !internalSelected[product.id])}
                        style={{ cursor: 'pointer', borderRadius: 10, height: 300 }}
                        cover={
                          <Image
                            alt={product.name}
                            src={product.image?.imageUrl || '/placeholder.png'}
                            height={150}
                            style={{ objectFit: 'cover' }}
                            preview={false}
                          />
                        }
                      >
                        <Card.Meta
                          title={product.name}
                          description={
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <Text type="secondary">
                                {product.stock ? product.stock + ' sản phẩm' : 'Hết hàng'}
                              </Text>
                              <Text type="secondary" style={{ fontWeight: 'bold', color: '#4caf50', marginTop: 4, textAlign: 'right' }}>
                                {product.price ? product.price.toLocaleString() + ' đ' : 'Liên hệ'}
                              </Text>
                            </div>
                          }
                        />
                        <div 
                          style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={!!internalSelected[product.id]}
                            onChange={(e) => {
                              handleSelectChange(product.id, e.target.checked);
                            }}
                          >
                            Chọn
                          </Checkbox>
                          {internalSelected[product.id] && (
                            <InputNumber
                              min={1}
                              value={internalSelected[product.id]}
                              onChange={(value) => {
                                handleQuantityChange(product.id, value);
                              }}
                              style={{ width: 70 }}
                            />
                          )}
                        </div>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col span={24} style={{ textAlign: 'center' }}>
                    <Empty description="Không có sản phẩm trong danh mục này" />
                  </Col>
                )}
              </Row>
            </TabPane>
          ))}
        </Tabs>
      ) : (
        <Empty description="Không có sản phẩm hoặc danh mục nào" />
      )}
    </Card>
  );
};

export default ProductSelection; 