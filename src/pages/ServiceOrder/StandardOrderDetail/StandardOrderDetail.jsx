import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Breadcrumb
} from "antd";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  HomeOutlined,
  HistoryOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import "../styles.scss";
import StatusTracking from "@/components/StatusTracking/StatusTracking";
import useShippingStore from "@/stores/useShippingStore";
import useWalletStore from "@/stores/useWalletStore";

const { Content } = Layout;
const { Title, Text } = Typography;

const StandardOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, isLoading, getDesignOrderById, updateStatus } = useDesignOrderStore();
  const { fetchDesignIdeaById } = useDesignIdeaStore();
  const { getProductById } = useProductStore();
  const { trackOrder } = useShippingStore();
  const { createBill } = useWalletStore();

  const [designIdea, setDesignIdea] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isConfirmCompleteModalVisible, setIsConfirmCompleteModalVisible] = useState(false);

  const trackingInterval = useRef(null);
  const componentId = React.useRef("standard-order-detail");

  // Add shipping status mapping
  const shippingStatusMap = {
    ready_to_pick: "Processing",
    delivering: "PickedPackageAndDelivery",
    delivery_fail: "DeliveryFail",
    return: "ReDelivery",
    delivered: "DeliveredSuccessfully",
    cancel: "OrderCancelled",
  };

  const fetchDetails = useCallback(async () => {
    if (!selectedOrder) return;

    try {
      setLoadingDetails(true);

      const designData = await fetchDesignIdeaById(selectedOrder.designIdeaId);
      setDesignIdea(designData);

      // Fetch products
      if (selectedOrder.serviceOrderDetails?.length > 0) {
        const productPromises = selectedOrder.serviceOrderDetails.map(
          (detail) => getProductById(detail.productId)
        );
        const productsData = await Promise.all(productPromises);
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
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

  // Add tracking functionality
  useEffect(() => {
    if (selectedOrder?.deliveryCode) {
      const startTracking = () => {
        // Clear any existing interval
        if (trackingInterval.current) {
          clearInterval(trackingInterval.current);
        }

        // Initial check
        checkShippingStatus();

        // Set up interval for checking every 20 seconds
        trackingInterval.current = setInterval(checkShippingStatus, 20000);
      };

      const checkShippingStatus = async () => {
        try {
          // Stop tracking if status is DeliveredSuccessfully or CompleteOrder
          if (
            selectedOrder.status === "DeliveredSuccessfully" ||
            selectedOrder.status === "CompleteOrder"
          ) {
            if (trackingInterval.current) {
              clearInterval(trackingInterval.current);
              trackingInterval.current = null;
            }
            return;
          }

          const shippingStatus = await trackOrder(selectedOrder.deliveryCode);
          const mappedStatus = shippingStatusMap[shippingStatus];

          // Only update if we have a valid mapped status and it's different from current status
          if (mappedStatus && mappedStatus !== selectedOrder.status) {
            await updateStatus(
              selectedOrder.id,
              mappedStatus,
              selectedOrder.deliveryCode
            );

            // Refresh order details
            await getDesignOrderById(id, componentId.current);
          }
        } catch (error) {
          console.error("Error checking shipping status:", error);
        }
      };

      startTracking();

      // Cleanup interval on unmount
      return () => {
        if (trackingInterval.current) {
          clearInterval(trackingInterval.current);
        }
      };
    }
  }, [selectedOrder?.deliveryCode, selectedOrder?.status, id, getDesignOrderById, updateStatus, trackOrder]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await getDesignOrderById(id, componentId.current);
      await fetchDetails();
      message.success("Đã cập nhật thông tin đơn hàng");
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCompleteOrder = async () => {
    try {
      await updateStatus(
        selectedOrder.id,
        "CompleteOrder",
        selectedOrder.deliveryCode
      );
      message.success("Đã xác nhận hoàn thành đơn hàng");
      await getDesignOrderById(id, componentId.current);
      setIsConfirmCompleteModalVisible(false);
    } catch (error) {
      message.error("Không thể xác nhận hoàn thành đơn hàng");
    }
  };

  const showConfirmCompleteModal = () => {
    setIsConfirmCompleteModalVisible(true);
  };

  const handleCancelComplete = () => {
    setIsConfirmCompleteModalVisible(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Add function to calculate material price
  const calculateMaterialPrice = (order) => {
    if (order.materialPrice === 0 && order.serviceOrderDetails?.length > 0) {
      return order.serviceOrderDetails.reduce((total, detail) => total + detail.totalPrice, 0);
    }
    return order.materialPrice;
  };

  const productColumns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record, index) => {
        const product = products[index];
        return (
          <Space>
            {product?.image?.imageUrl && (
              <img
                src={product.image.imageUrl}
                alt={product?.name}
                style={{ width: 50, height: 50, objectFit: "cover" }}
              />
            )}
            <Space direction="vertical" size={0}>
              <Text strong>{product?.name || "N/A"}</Text>
              <Text type="secondary">{product?.categoryName || "N/A"}</Text>
            </Space>
          </Space>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => <Text strong>{quantity}</Text>,
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (price) => <Text type="secondary">{formatPrice(price)}</Text>,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (total) => (
        <Text type="success" strong>
          {formatPrice(total)}
        </Text>
      ),
    },
  ];

  if (isLoading || loadingDetails) {
    return (
      <Layout className="order-detail-layout">
        <Header />
        <Content>
          <div className="order-detail-content">
            <div style={{ textAlign: "center", padding: "50px" }}>
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
              <Button
                type="primary"
                onClick={() => navigate("/serviceorderhistory")}
              >
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
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              {/* Header */}
              <Breadcrumb
                items={[
                  {
                    title: (
                      <Link to="/Home">
                        <Space>
                          <HomeOutlined style={{ fontSize: '18px' }} />
                          <span style={{ fontSize: '16px' }}>Trang chủ</span>
                        </Space>
                      </Link>
                    ),
                  },
                  {
                    title: (
                      <Link to="/serviceorderhistory">
                        <Space>
                          <HistoryOutlined style={{ fontSize: '18px' }} />
                          <span style={{ fontSize: '16px' }}>Lịch sử đơn hàng</span>
                        </Space>
                      </Link>
                    ),
                  },
                  {
                    title: (
                      <Space>
                        <ShoppingOutlined style={{ fontSize: '18px' }} />
                        <span style={{ fontSize: '16px' }}>Chi tiết đơn hàng #{id.slice(0, 8)}</span>
                      </Space>
                    ),
                  },
                ]}
                style={{ 
                  marginBottom: '16px',
                  padding: '12px 16px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />

              <Space
                direction="horizontal"
                align="center"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Button
                  type="default"
                  onClick={() => navigate("/serviceorderhistory")}
                >
                  Quay lại danh sách
                </Button>
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
                  <Descriptions.Item
                    label={
                      <>
                        <UserOutlined /> Tên khách hàng
                      </>
                    }
                  >
                    {selectedOrder.userName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <MailOutlined /> Email
                      </>
                    }
                  >
                    {selectedOrder.email}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <PhoneOutlined /> Số điện thoại
                      </>
                    }
                  >
                    {selectedOrder.cusPhone}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <EnvironmentOutlined /> Địa chỉ
                      </>
                    }
                  >
                    {selectedOrder.address.replace(/\|/g, ', ')}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <ClockCircleOutlined /> Ngày đặt
                      </>
                    }
                  >
                    {new Date(selectedOrder.creationDate).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
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
                  <Descriptions
                    column={{ xs: 1, sm: 2 }}
                    bordered
                    styles={{
                      label: { fontWeight: "bold", fontSize: "15px" },
                      content: { fontSize: "15px" },
                    }}
                  >
                    <Descriptions.Item label="Tên thiết kế" span={3}>
                      {designIdea?.name || "Chưa có tên thiết kế"}
                    </Descriptions.Item>

                    {selectedOrder?.length > 0 && selectedOrder?.width > 0 && (
                      <>
                        <Descriptions.Item label="Chiều dài" span={1}>
                          {selectedOrder.length}m
                        </Descriptions.Item>
                        <Descriptions.Item label="Chiều rộng" span={1}>
                          {selectedOrder.width}m
                        </Descriptions.Item>
                      </>
                    )}
                    <Descriptions.Item label="Mô tả" span={3}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: designIdea?.description || "Không có mô tả",
                        }}
                        style={{
                          maxWidth: "100%",
                          overflow: "hidden",
                          fontSize: "15px",
                          lineHeight: "1.6",
                        }}
                      />
                    </Descriptions.Item>
                  </Descriptions>
                  <div style={{ display: "flex", gap: "16px", marginTop: 16 }}>
                    {designIdea?.image?.imageUrl && (
                      <img
                        src={designIdea.image.imageUrl}
                        alt={designIdea?.name || "Thiết kế"}
                        style={{
                          maxWidth: "100%",
                          maxHeight: 300,
                          objectFit: "contain",
                        }}
                      />
                    )}
                    {designIdea?.image?.image2 && (
                      <img
                        src={designIdea.image.image2}
                        alt={designIdea?.name || "Thiết kế"}
                        style={{
                          maxWidth: "100%",
                          maxHeight: 300,
                          objectFit: "contain",
                        }}
                      />
                    )}
                    {designIdea?.image?.image3 && (
                      <img
                        src={designIdea.image.image3}
                        alt={designIdea?.name || "Thiết kế"}
                        style={{
                          maxWidth: "100%",
                          maxHeight: 300,
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </div>
                </Card>
              )}

              {/* Design Images Section */}
              {selectedOrder.status !== "Pending" && (
                <Card
                  title={
                    <Space>
                      <BulbOutlined />
                      <span>
                        Danh sách bản vẽ thiết kế và hướng dẫn lắp đặt
                      </span>
                    </Space>
                  }
                  type="inner"
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: "16px",
                      padding: "16px",
                    }}
                  >
                    {designIdea.designImage1URL && (
                      <div>
                        <Image
                          src={designIdea.designImage1URL}
                          alt="Bản vẽ thiết kế 1"
                          style={{ width: "100%", height: "auto" }}
                          preview={{
                            mask: "Phóng to",
                            maskClassName: "custom-mask",
                          }}
                        />
                        <div style={{ textAlign: "center", marginTop: "8px" }}>
                          <Text type="secondary">Bản vẽ thiết kế 1</Text>
                        </div>
                      </div>
                    )}
                    {designIdea.designImage2URL && (
                      <div>
                        <Image
                          src={designIdea.designImage2URL}
                          alt="Bản vẽ thiết kế 2"
                          style={{ width: "100%", height: "auto" }}
                          preview={{
                            mask: "Phóng to",
                            maskClassName: "custom-mask",
                          }}
                        />
                        <div style={{ textAlign: "center", marginTop: "8px" }}>
                          <Text type="secondary">Bản vẽ thiết kế 2</Text>
                        </div>
                      </div>
                    )}
                    {designIdea.designImage3URL && (
                      <div>
                        <Image
                          src={designIdea.designImage3URL}
                          alt="Bản vẽ thiết kế 3"
                          style={{ width: "100%", height: "auto" }}
                          preview={{
                            mask: "Phóng to",
                            maskClassName: "custom-mask",
                          }}
                        />
                        <div style={{ textAlign: "center", marginTop: "8px" }}>
                          <Text type="secondary">Bản vẽ thiết kế 3</Text>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Material Details */}
              <Card
                title={
                  <Space>
                    <ShoppingOutlined />
                    <span>Danh sách vật liệu</span>
                  </Space>
                }
                type="inner"
              >
                <Table
                  columns={productColumns}
                  dataSource={selectedOrder.serviceOrderDetails}
                  pagination={false}
                  rowKey="productId"
                  summary={() => (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={2} />
                        <Table.Summary.Cell index={2}>
                          <Text strong>Phí vật liệu:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <Text type="success" strong>
                            {formatPrice(calculateMaterialPrice(selectedOrder))}
                          </Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              </Card>

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
                <div>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Phí thiết kế">
                      <Text type="success" strong>
                        {formatPrice(selectedOrder.designPrice)}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phí vật liệu">
                      <Text type="success" strong>
                        {formatPrice(calculateMaterialPrice(selectedOrder))}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng thanh toán">
                      <Text type="danger" strong style={{ fontSize: "16px" }}>
                        {formatPrice(
                          selectedOrder.designPrice +
                          calculateMaterialPrice(selectedOrder)
                        )}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Đã thanh toán">
                      <Text type="danger" strong style={{ fontSize: "16px" }}>
                        {formatPrice(
                          selectedOrder.designPrice +
                          calculateMaterialPrice(selectedOrder)
                        )}
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </Card>

              {/* Status Tracking */}
              <Card title="Trạng thái đơn hàng" type="inner">
                <StatusTracking currentStatus={selectedOrder.status} />
              </Card>

              {/* Actions */}
              <div style={{ textAlign: "right" }}>
                <Space>
                  {selectedOrder.status === "DeliveredSuccessfully" && (
                    <Button
                      type="primary"
                      onClick={showConfirmCompleteModal}
                    >
                      Xác nhận hoàn thành
                    </Button>
                  )}
                </Space>
              </div>
            </Space>

            {/* Confirm Complete Modal */}
            <Modal
              title="Xác nhận hoàn thành đơn hàng"
              open={isConfirmCompleteModalVisible}
              onOk={handleCompleteOrder}
              onCancel={handleCancelComplete}
              okText="Xác nhận"
              cancelText="Huỷ"
            >
              <p>Bạn có chắc chắn muốn xác nhận hoàn thành đơn hàng này?</p>
              <p>Hành động này không thể hoàn tác.</p>
            </Modal>
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default StandardOrderDetail; 