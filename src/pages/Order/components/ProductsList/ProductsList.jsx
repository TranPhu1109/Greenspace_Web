import React from "react";
import { Card, Table, Space, Image, Typography } from "antd";
import { TagsOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ProductsList = ({ 
  order, 
  productDetailsMap, 
  fetchingProducts, 
  productLoading,
  formatPrice,
  finalMaterialPriceStatuses
}) => {
  const productColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => {
        const product = productDetailsMap[record.productId];
        return (
          <Space>
            <Image
              src={product?.image?.imageUrl || '/placeholder.png'}
              alt={product?.name || 'Sản phẩm'}
              width={50}
              height={50}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
              preview={false}
            />
            <Text strong>{product?.name || 'Không tìm thấy tên'}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Đơn giá',
      key: 'price',
      align: 'right',
      render: (_, record) => {
        const product = productDetailsMap[record.productId];
        return <Text>{formatPrice(product?.price)}</Text>;
      },
    },
    {
      title: 'Thành tiền',
      key: 'totalPrice',
      align: 'right',
      render: (_, record) => {
        const product = productDetailsMap[record.productId];
        const totalPrice = product && typeof product.price === 'number' && typeof record.quantity === 'number'
          ? product.price * record.quantity
          : 0;
        return <Text strong style={{ color: '#4caf50' }}>{formatPrice(totalPrice)}</Text>;
      },
    },
  ];

  return (
    <Card
      title={
        <span style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#4caf50',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <TagsOutlined />
          Danh sách vật liệu theo thiết kế
        </span>
      }
      style={{
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}
      loading={fetchingProducts || productLoading}
    >
      <Table
        columns={productColumns}
        dataSource={order?.serviceOrderDetails || []}
        pagination={false}
        rowKey={(record, index) => `${record.productId}-${index}`}
        summary={() => {
          let totalMaterialCost = 0;
          (order?.serviceOrderDetails || []).forEach(detail => {
            const product = productDetailsMap[detail.productId];
            if (product && typeof product.price === 'number' && typeof detail.quantity === 'number') {
              totalMaterialCost += product.price * detail.quantity;
            }
          });
          const displayMaterialPrice = finalMaterialPriceStatuses.includes(order?.status) && typeof order?.materialPrice === 'number'
            ? order.materialPrice
            : totalMaterialCost;

          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3} align="right">
                <Text strong>
                  {finalMaterialPriceStatuses.includes(order?.status)
                    ? "Tổng tiền vật liệu (chính thức):"
                    : "Tổng tiền vật liệu (dự kiến):"}
                </Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong style={{ color: '#cf1322' }}>
                  {formatPrice(displayMaterialPrice)}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </Card>
  );
};

export default ProductsList; 