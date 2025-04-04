import React, { useEffect, useState, useCallback } from 'react';
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
  message,
  Image,
  Modal,
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
  ReloadOutlined,
} from '@ant-design/icons';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import "./styles.scss";
import StatusTracking from '@/components/StatusTracking/StatusTracking';

const { Content } = Layout;
const { Title, Text } = Typography;

const OrderHistoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, isLoading, getDesignOrderById, updateStatus } = useDesignOrderStore();
  const { fetchDesignIdeaById } = useDesignIdeaStore();
  const { getProductById } = useProductStore();
  
  const [designIdea, setDesignIdea] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const componentId = React.useRef('order-detail');

  const fetchDetails = useCallback(async () => {
    if (!selectedOrder) return;

    try {
      setLoadingDetails(true);
      
      // Fetch design idea only if status is not Pending
      if (selectedOrder.designIdeaId && selectedOrder.status !== "Pending") {
        const designData = await fetchDesignIdeaById(selectedOrder.designIdeaId);
        setDesignIdea(designData);
      }

      // Fetch products
      if (selectedOrder.serviceOrderDetails?.length > 0) {
        const productPromises = selectedOrder.serviceOrderDetails.map(detail => 
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
  }, [selectedOrder, fetchDesignIdeaById, getProductById]);

  useEffect(() => {
    if (id) {
      getDesignOrderById(id, componentId.current);
    }
  }, [id, getDesignOrderById]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await getDesignOrderById(id, componentId.current);
      await fetchDetails();
      message.success('Đã cập nhật thông tin đơn hàng');
    } catch (error) {
      //message.error('Không thể cập nhật thông tin đơn hàng');
      console.log(error);
      
    } finally {
      setRefreshing(false);
    }
  };

  const handleCompleteOrder = async () => {
    try {
      await updateStatus(selectedOrder.id, "CompleteOrder", selectedOrder.deliveryCode);
      message.success("Đã xác nhận hoàn thành đơn hàng");
      await getDesignOrderById(id, componentId.current);
    } catch (error) {
      message.error("Không thể xác nhận hoàn thành đơn hàng");
    }
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

  if (!selectedOrder) {
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

  console.log('Current Order Status:', {
    id: selectedOrder.id,
    status: selectedOrder.status,
    deliveryCode: selectedOrder.deliveryCode
  });

  return (
    <Layout className="order-detail-layout">
      <Header />
      <Content>
        <div className="order-detail-content">
          <Card className="order-detail-card">
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              {/* Header */}
              <Space direction="horizontal" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <Title level={2}>Chi tiết đơn hàng #{id.slice(0, 8)}</Title>
                  
                </Space>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handleRefresh}
                    loading={refreshing}
                  >
                    Làm mới
                  </Button>
                </Space>
              </Space>

              {/* Customer Information */}
              <Card title="Thông tin khách hàng" type="inner">
                <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                  <Descriptions.Item label={<><UserOutlined /> Tên khách hàng</>}>
                    {selectedOrder.userName}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><MailOutlined /> Email</>}>
                    {selectedOrder.email}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                    {selectedOrder.cusPhone}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>}>
                    {selectedOrder.address}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><ClockCircleOutlined /> Ngày đặt</>}>
                    {new Date(selectedOrder.creationDate).toLocaleDateString('vi-VN', {
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
                    {selectedOrder.length > 0 && selectedOrder.width > 0 && (
                      <>
                        <Descriptions.Item label="Chiều dài">
                          {selectedOrder.length}m
                        </Descriptions.Item>
                        <Descriptions.Item label="Chiều rộng">
                          {selectedOrder.width}m
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

              {/* Design Images Section */}
              {designIdea && selectedOrder.status !== "Pending" && (
                <Card 
                  title={
                    <Space>
                      <BulbOutlined />
                      <span>Danh sách bản vẽ thiết kế</span>
                    </Space>
                  } 
                  type="inner"
                >
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '16px',
                    padding: '16px'
                  }}>
                    {designIdea.designImage1URL && (
                      <div>
                        <Image
                          src={designIdea.designImage1URL}
                          alt="Bản vẽ thiết kế 1"
                          style={{ width: '100%', height: 'auto' }}
                          preview={{
                            mask: 'Phóng to',
                            maskClassName: 'custom-mask'
                          }}
                        />
                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                          <Text type="secondary">Bản vẽ thiết kế 1</Text>
                        </div>
                      </div>
                    )}
                    {designIdea.designImage2URL && (
                      <div>
                        <Image
                          src={designIdea.designImage2URL}
                          alt="Bản vẽ thiết kế 2"
                          style={{ width: '100%', height: 'auto' }}
                          preview={{
                            mask: 'Phóng to',
                            maskClassName: 'custom-mask'
                          }}
                        />
                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                          <Text type="secondary">Bản vẽ thiết kế 2</Text>
                        </div>
                      </div>
                    )}
                    {designIdea.designImage3URL && (
                      <div>
                        <Image
                          src={designIdea.designImage3URL}
                          alt="Bản vẽ thiết kế 3"
                          style={{ width: '100%', height: 'auto' }}
                          preview={{
                            mask: 'Phóng to',
                            maskClassName: 'custom-mask'
                          }}
                        />
                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                          <Text type="secondary">Bản vẽ thiết kế 3</Text>
                        </div>
                      </div>
                    )}
                  </div>
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
                {selectedOrder.isCustom ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Text type="secondary" style={{ 
                      fontSize: '18px',
                      fontWeight: 500,
                      display: 'block',
                      padding: '24px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px dashed #d9d9d9'
                    }}>
                      Giá thiết kế, danh sách vật liệu và tổng giá sẽ được chúng tôi cập nhập sau khi Designer hoàn tất bản vẽ hoàn chỉnh
                    </Text>
                  </div>
                ) : (
                  <Table
                    columns={productColumns}
                    dataSource={selectedOrder.serviceOrderDetails}
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
                            <Text type="success" strong>{formatPrice(selectedOrder.designPrice)}</Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={2} />
                          <Table.Summary.Cell index={2}>
                            <Text strong>Phí vật liệu:</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3}>
                            <Text type="success" strong>{formatPrice(selectedOrder.materialPrice)}</Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={2} />
                          <Table.Summary.Cell index={2}>
                            <Text strong>Tổng thanh toán:</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3}>
                            <Text type="danger" strong style={{ fontSize: '16px' }}>
                              {formatPrice(selectedOrder.designPrice + selectedOrder.materialPrice)}
                            </Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={2} />
                          <Table.Summary.Cell index={2}>
                            <Text strong>Đã thanh toán:</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3}>
                            <Text type='danger' strong style={{ fontSize: '26px' }}>
                              {formatPrice(selectedOrder.designPrice + selectedOrder.materialPrice)}
                            </Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                )}
              </Card>

              {/* Status Tracking */}
              <Card title="Trạng thái đơn hàng" type="inner">
                <StatusTracking currentStatus={selectedOrder.status} />
              </Card>

              {/* Actions */}
              <div style={{ textAlign: 'right' }}>
                <Space>
                  {selectedOrder.status === "DeliveredSuccessfully" && (
                    <Button 
                      type="primary"
                      onClick={() => {
                        Modal.confirm({
                          title: "Xác nhận hoàn thành",
                          content: "Bạn có chắc chắn muốn xác nhận hoàn thành đơn hàng này?",
                          okText: "Xác nhận",
                          cancelText: "Hủy",
                          onOk: handleCompleteOrder,
                        });
                      }}
                    >
                      Xác nhận hoàn thành
                    </Button>
                  )}
                  <Button type="default" onClick={() => navigate('/serviceorderhistory')}>
                    Quay lại danh sách
                  </Button>
                </Space>
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
