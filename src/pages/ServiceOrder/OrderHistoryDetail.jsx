import React, { useEffect, useState } from 'react';
import {
  Layout,
  Typography,
  Card,
  Descriptions,
  Tag,
  Table,
  Space,
  Spin,
  Empty,
  Button,
  Divider,
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BulbOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import "./styles.scss";

const { Content } = Layout;
const { Title, Text } = Typography;

const OrderHistoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { designOrders, isLoading } = useDesignOrderStore();
  const { fetchDesignIdeaById } = useDesignIdeaStore();
  const { getProductById } = useProductStore();
  
  const [designIdea, setDesignIdea] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const order = designOrders?.find(order => order.id === id);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!order) return;

      try {
        setLoadingDetails(true);
        
        // Fetch design idea
        if (order.designIdeaId) {
          const designData = await fetchDesignIdeaById(order.designIdeaId);
          setDesignIdea(designData);
        }

        // Fetch products
        if (order.serviceOrderDetails?.length > 0) {
          const productPromises = order.serviceOrderDetails.map(detail => 
            getProductById(detail.productId)
          );
          const productsData = await Promise.all(productPromises);
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [order, fetchDesignIdeaById, getProductById]);

  const getStatusTag = (status) => {
    const statusConfig = {
      Pending: { color: 'orange', text: 'Chờ xác nhận' },
      Confirmed: { color: 'green', text: 'Đã xác nhận' },
      Cancelled: { color: 'red', text: 'Đã hủy' },
    };
    const config = statusConfig[status] || statusConfig.Pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getCustomTag = (isCustom) => {
    const customConfig = {
      false: { color: 'blue', text: 'Không tùy chỉnh' },
      true: { color: 'green', text: 'Tùy chỉnh' },
      'full': { color: 'purple', text: 'Tùy chỉnh hoàn toàn' }
    };
    const config = customConfig[isCustom] || customConfig.false;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const productColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record, index) => {
        const product = products[index];
        return (
          <Space>
            {product?.image?.imageUrl && (
              <img 
                src={product.image.imageUrl} 
                alt={product?.name} 
                style={{ width: 50, height: 50, objectFit: 'cover' }}
              />
            )}
            <Space direction="vertical" size={0}>
              <Text strong>{product?.name || 'N/A'}</Text>
              <Text type="secondary">{product?.categoryName || 'N/A'}</Text>
            </Space>
          </Space>
        );
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => <Text strong>{quantity}</Text>,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text type="secondary">{formatPrice(price)}</Text>,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (total) => <Text type="success" strong>{formatPrice(total)}</Text>,
    },
  ];

  if (isLoading || loadingDetails) {
    return (
      <Layout className="order-detail-layout">
        <Header />
        <Content>
          <div className="order-detail-content">
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout className="order-detail-layout">
        <Header />
        <Content>
          <div className="order-detail-content">
            <Empty
              description="Không tìm thấy thông tin đơn hàng"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => navigate('/serviceorderhistory')}>
                Quay lại danh sách
              </Button>
            </Empty>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout className="order-detail-layout">
      <Header />
      <Content>
        <div className="order-detail-content">
          <Card className="order-detail-card">
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              {/* Header */}
              <Space direction="horizontal" align="center" justify="space-between" style={{ width: '100%' }}>
                <Title level={2}>Chi tiết đơn hàng #{id.slice(0, 8)}</Title>
                <Space>
                  {getCustomTag(order.isCustom)}
                  {getStatusTag(order.status)}
                </Space>
              </Space>

              {/* Customer Information */}
              <Card title="Thông tin khách hàng" type="inner">
                <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                  <Descriptions.Item label={<><UserOutlined /> Tên khách hàng</>}>
                    {order.userName}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><MailOutlined /> Email</>}>
                    {order.email}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                    {order.cusPhone}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>}>
                    {order.address}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><ClockCircleOutlined /> Ngày đặt</>}>
                    {new Date(order.creationDate).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Design Idea Information */}
              {designIdea && (
                <Card 
                  title={
                    <Space>
                      <BulbOutlined />
                      <span>Thông tin thiết kế</span>
                    </Space>
                  } 
                  type="inner"
                >
                  <Descriptions column={{ xs: 1, sm: 2 }}>
                    <Descriptions.Item label="Tên thiết kế">
                      {designIdea.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                      {designIdea.description || 'Không có mô tả'}
                    </Descriptions.Item>
                    {order.length > 0 && order.width > 0 && (
                      <>
                        <Descriptions.Item label="Chiều dài">
                          {order.length}m
                        </Descriptions.Item>
                        <Descriptions.Item label="Chiều rộng">
                          {order.width}m
                        </Descriptions.Item>
                      </>
                    )}
                  </Descriptions>
                  {designIdea.image?.imageUrl && (
                    <div style={{ marginTop: 16 }}>
                      <img 
                        src={designIdea.image.imageUrl} 
                        alt={designIdea.name}
                        style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </Card>
              )}

              {/* Order Details */}
              <Card 
                title={
                  <Space>
                    <ShoppingOutlined />
                    <span>Chi tiết đơn hàng</span>
                  </Space>
                } 
                type="inner"
              >
                <Table
                  columns={productColumns}
                  dataSource={order.serviceOrderDetails}
                  pagination={false}
                  rowKey="productId"
                  summary={() => (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={2}>
                          <Text strong>Tổng cộng</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <Text strong>Phí thiết kế:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <Text type="success" strong>{formatPrice(order.designPrice)}</Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={2} />
                        <Table.Summary.Cell index={2}>
                          <Text strong>Phí vật liệu:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <Text type="success" strong>{formatPrice(order.materialPrice)}</Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={2} />
                        <Table.Summary.Cell index={2}>
                          <Text strong>Tổng thanh toán:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <Text type="danger" strong style={{ fontSize: '16px' }}>
                            {formatPrice(order.designPrice + order.materialPrice)}
                          </Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              </Card>

              {/* Actions */}
              <div style={{ textAlign: 'right' }}>
                <Button type="default" onClick={() => navigate('/serviceorderhistory')}>
                  Quay lại danh sách
                </Button>
              </div>
            </Space>
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default OrderHistoryDetail;
