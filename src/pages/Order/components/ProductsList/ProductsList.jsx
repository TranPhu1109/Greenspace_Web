import React from "react";
import { Card, Table, Space, Image, Typography, Divider, Tooltip } from "antd";
import { TagsOutlined, ShoppingOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ProductsList = ({
  order,
  productDetailsMap,
  fetchingProducts,
  productLoading,
  formatPrice,
  finalMaterialPriceStatuses
}) => {
  // Define the expanded list of statuses to show material information
  const visibleStatuses = [
    'DoneDesign',
    'PaymentSuccess',
    'PickedPackageAndDelivery',
    'Processing',
    'DeliveryFail',
    'ReDelivery',
    'DeliveredSuccessfully',
    'CompleteOrder',
    'DoneDeterminingMaterialPrice',
    'ReDesign',
    'ExchangeProdcut',
    'WaitForScheduling',
    'Installing',
    'DoneInstalling',
    'ReInstall',
    'CustomerConfirm',
    'Successfully'
  ];

  // Check if the materials card should be visible based on the order status
  const shouldShowMaterialsCard = order?.status && 
    (finalMaterialPriceStatuses.includes(order.status) || visibleStatuses.includes(order.status));

  // If materials should not be shown based on status, return null
  if (!shouldShowMaterialsCard) {
    return null;
  }

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

  // External products columns
  const externalProductColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <Space align="start">
          <Image
            src={record.imageURL || '/placeholder.png'}
            alt={record.name}
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: '4px' }}
            preview={false}
          />
          <div style={{ maxWidth: 250 }}>
            <Text strong>{record.name}</Text>
            {record.description && (
              <Tooltip
                title={record.description}
                placement="top"
                styles={{
                  body: {
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontSize: 13,
                    padding: 10,
                    maxWidth: 300,
                    borderRadius: 4,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <div
                   style={{
                    fontSize: '12px',
                    color: '#888',
                    marginTop: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {record.description}
                </div>
              </Tooltip>
            )}
          </div>
        </Space>
      ),
    },    
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 100,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 150,
      render: (price) => <Text>{formatPrice(price)}</Text>,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      width: 150,
      render: (totalPrice) => (
        <Text strong style={{ color: '#4caf50' }}>
          {formatPrice(totalPrice)}
        </Text>
      ),
    },
  ];

  // Calculate totals
  const calculateRegularProductsTotal = () => {
    let totalMaterialCost = 0;
    (order?.serviceOrderDetails || []).forEach(detail => {
      const product = productDetailsMap[detail.productId];
      if (product && typeof product.price === 'number' && typeof detail.quantity === 'number') {
        totalMaterialCost += product.price * detail.quantity;
      }
    });
    return totalMaterialCost;
  };

  const calculateExternalProductsTotal = () => {
    return (order?.externalProducts || []).reduce((total, product) => {
      return total + (product.totalPrice || product.price * product.quantity || 0);
    }, 0);
  };

  const regularProductsTotal = calculateRegularProductsTotal();
  const externalProductsTotal = calculateExternalProductsTotal();
  const totalMaterialCost = regularProductsTotal + externalProductsTotal;

  // Determine if we should show finalized material price label
  const isFinalizedStatus = order?.status && (finalMaterialPriceStatuses.includes(order.status) || visibleStatuses.includes(order.status));

  // Determine final display price based on order status
  const displayMaterialPrice = isFinalizedStatus && typeof order?.materialPrice === 'number'
    ? totalMaterialCost
    : order.materialPrice;

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
      {/* Regular products table */}
      {(order?.serviceOrderDetails?.length > 0) && (
        <div>
          <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
            <TagsOutlined /> Vật liệu từ cửa hàng ({order.serviceOrderDetails.length})
          </Text>
          <Table
            columns={productColumns}
            dataSource={order.serviceOrderDetails}
            pagination={false}
            rowKey={(record, index) => `${record.productId}-${index}`}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  <Text strong>Tổng tiền vật liệu từ cửa hàng:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ color: '#1890ff' }}>
                    {formatPrice(regularProductsTotal)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
            style={{ marginBottom: '24px' }}
          />
        </div>
      )}

      {/* External products table */}
      {(order?.externalProducts?.length > 0) && (
        <div style={{ marginTop: '24px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
            <ShoppingOutlined /> Sản phẩm thêm mới ({order.externalProducts.length})
          </Text>
          <Table
            columns={externalProductColumns}
            dataSource={order.externalProducts}
            pagination={false}
            rowKey="id"
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  <Text strong>Tổng tiền vật liệu thêm mới:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ color: '#1890ff' }}>
                    {formatPrice(externalProductsTotal)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </div>
      )}

      {/* Total summary */}
      <Divider style={{ margin: '24px 0' }} />
      <div style={{
        textAlign: 'right',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginTop: '16px'
      }}>
        <Text strong style={{ fontSize: '16px' }}>
          {isFinalizedStatus
            ? "Tổng chi phí vật liệu:"
            : "Tổng chi phí vật liệu (dự kiến):"}
          <Text strong style={{ fontSize: '18px', color: '#cf1322', marginLeft: '8px' }}>
            {formatPrice(displayMaterialPrice)}
          </Text>
        </Text>
      </div>
    </Card>
  );
};

export default ProductsList; 