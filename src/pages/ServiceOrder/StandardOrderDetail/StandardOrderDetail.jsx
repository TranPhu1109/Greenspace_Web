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
  Breadcrumb,
  Form,
  Input,
  DatePicker,
  TimePicker
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
  CheckCircleOutlined,
  FilePdfOutlined,
  VideoCameraOutlined,
  ArrowLeftOutlined
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
import api from "@/api/api";
import dayjs from "dayjs";

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
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [isReInstallModalVisible, setIsReInstallModalVisible] = useState(false);
  const [reinstallForm] = Form.useForm();

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

  const handleRequestReInstall = async () => {
    setIsReInstallModalVisible(true);
  };
  
  const submitReInstallRequest = async (values) => {
    try {
      // Find the latest work task
      const latestWorkTask = selectedOrder.workTasks
        .filter(task => task.status !== "cancel")
        .sort((a, b) => 
          new Date(b.creationDate) - new Date(a.creationDate)
        )[0];
      
      if (!latestWorkTask) {
        message.error("Không tìm thấy thông tin lịch lắp đặt");
        return;
      }
      
      // Format date and time
      const dateAppointment = values.reinstallDate.format('YYYY-MM-DD');
      const timeAppointment = values.reinstallTime.format('HH:mm:ss');
      
      // Call API to update work task
      await api.put(`/api/worktask/${latestWorkTask.id}`, {
        serviceOrderId: selectedOrder.id,
        userId: latestWorkTask.userId,
        dateAppointment: dateAppointment,
        timeAppointment: timeAppointment,
        status: 10, // ReInstall status
        note: values.reason || "Yêu cầu lắp đặt lại"
      });
      
      // Call API to update order status
      await updateStatus(
        selectedOrder.id,
        "ReInstall",
        selectedOrder.deliveryCode
      );
      
      message.success("Đã yêu cầu lắp đặt lại thành công");
      setIsReInstallModalVisible(false);
      await getDesignOrderById(id, componentId.current);
    } catch (error) {
      console.error("Error requesting reinstall:", error);
      message.error("Không thể yêu cầu lắp đặt lại: " + (error.response?.data?.message || error.message));
    }
  };

  const handleConfirmComplete = async () => {
    try {
      // Find the latest work task
      const latestWorkTask = selectedOrder.workTasks
        .filter(task => task.status !== "cancel")
        .sort((a, b) => 
          new Date(b.creationDate) - new Date(a.creationDate)
        )[0];
      
      if (!latestWorkTask) {
        message.error("Không tìm thấy thông tin lịch lắp đặt");
        return;
      }
      
      // Call API to update work task
      await api.put(`/api/worktask/${latestWorkTask.id}`, {
        serviceOrderId: selectedOrder.id,
        userId: latestWorkTask.userId,
        dateAppointment: latestWorkTask.dateAppointment,
        timeAppointment: latestWorkTask.timeAppointment,
        status: 6, // Completed status
        note: "Hoàn thành lắp đặt"
      });
      
      // Call API to update order status
      await updateStatus(
        selectedOrder.id,
        "Successfully",
        selectedOrder.deliveryCode
      );
      
      message.success("Đã xác nhận hoàn tất đơn hàng");
      await getDesignOrderById(id, componentId.current);
    } catch (error) {
      console.error("Error confirming completion:", error);
      message.error("Không thể xác nhận hoàn tất đơn hàng: " + (error.response?.data?.message || error.message));
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
              {product?.designImage1URL && (
                <Button
                  type="link"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(product.designImage1URL, '_blank');
                  }}
                  style={{ padding: "0", height: "auto" }}
                >
                  <Space>
                    <Text type="success">
                      {product.designImage1URL.includes('.pdf')
                        ? 'Xem hướng dẫn lắp đặt (PDF)'
                        : 'Xem hướng dẫn lắp đặt (Video)'}
                    </Text>
                  </Space>
                </Button>
              )}
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

  const openPdfModal = (url) => {
    setCurrentPdfUrl(url);
    setPdfModalVisible(true);
  };

  const openVideoModal = (url) => {
    setCurrentVideoUrl(url);
    setVideoModalVisible(true);
  };

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
        <div
          style={{
            paddingTop: '40px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/Home">
                    <Space>
                      <HomeOutlined style={{ fontSize: '16px' }} />
                      <span style={{ fontSize: '16px' }}>Trang chủ</span>
                    </Space>
                  </Link>
                ),
              },
              {
                title: (
                  <Link to="/serviceorderhistory">
                    <Space>
                      <HistoryOutlined style={{ fontSize: '16px' }} />
                      <span style={{ fontSize: '16px' }}>Lịch sử đơn hàng</span>
                    </Space>
                  </Link>
                ),
              },
              {
                title: (
                  <Space>
                    <ShoppingOutlined style={{ fontSize: '16px' }} />
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
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          />
        </div>
        <div className="order-detail-content">
          <Card className="order-detail-card">
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              <Space
                direction="horizontal"
                align="center"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Button
                  type="primary"
                  onClick={() => navigate("/serviceorderhistory")}
                >
                  <ArrowLeftOutlined />
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
                        className="html-preview"
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
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "16px",
                      marginTop: 16,
                    }}
                  >
                    {[designIdea?.image?.imageUrl, designIdea?.image?.image2, designIdea?.image?.image3]
                      .filter(Boolean)
                      .map((imgUrl, index) => (
                        <div
                          key={index}
                          style={{
                            width: "100%",
                            aspectRatio: "4 / 3", // hoặc dùng height: 200px nếu muốn cố định
                            overflow: "hidden",
                            height: "auto",
                            borderRadius: "8px",
                            border: "1px solid #eee",
                          }}
                        >
                          <Image
                            src={imgUrl}
                            alt={`Hình thiết kế ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center",
                              display: "block",
                            }}
                            preview
                          />
                        </div>
                      ))}
                  </div>
                </Card>
              )}

              {/* Design Images Section */}
              {selectedOrder.status !== "Pending" && designIdea && (
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
                      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: "24px",
                      padding: "16px",
                    }}
                  >
                    {designIdea?.designImage1URL && (
                      <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #eee" }}>
                        <div style={{ width: "100%", textAlign: "center", padding: "8px", backgroundColor: "#f5f5f5" }}>
                          <Text strong>Bản vẽ thiết kế</Text>
                        </div>
                        <Image
                          src={designIdea.designImage1URL}
                          alt="Bản vẽ thiết kế"
                          style={{
                            width: "100%",
                            aspectRatio: "4/3",
                            objectFit: "cover"
                          }}
                          preview
                        />
                      </div>
                    )}

                    {designIdea?.designImage2URL && (
                      <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #eee" }}>
                        <div style={{ width: "100%", textAlign: "center", padding: "8px", backgroundColor: "#f5f5f5" }}>
                          <Text strong>Hướng dẫn lắp đặt (PDF)</Text>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "400px",
                            cursor: "pointer",
                            position: "relative"
                          }}
                          onClick={() => openPdfModal(designIdea.designImage2URL)}
                        >
                          <iframe
                            src={designIdea.designImage2URL}
                            title="Hướng dẫn lắp đặt PDF"
                            style={{ width: "100%", height: "100%", border: "none" }}
                          />
                          <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            background: "rgba(0,0,0,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            transition: "opacity 0.3s",
                            ":hover": { opacity: 1 }
                          }}>
                            <Button type="primary" icon={<FilePdfOutlined />}>Xem đầy đủ</Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {designIdea?.designImage3URL && (
                      <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #eee" }}>
                        <div style={{ width: "100%", textAlign: "center", padding: "8px", backgroundColor: "#f5f5f5" }}>
                          <Text strong>
                            {designIdea.designImage3URL.includes('.pdf')
                              ? 'Hướng dẫn bổ sung (PDF)'
                              : 'Video hướng dẫn lắp đặt'}
                          </Text>
                        </div>
                        {designIdea.designImage3URL.includes('.pdf') ? (
                          <div
                            style={{
                              width: "100%",
                              height: "400px",
                              cursor: "pointer",
                              position: "relative"
                            }}
                            onClick={() => openPdfModal(designIdea.designImage3URL)}
                          >
                            <iframe
                              src={designIdea.designImage3URL}
                              title="Hướng dẫn bổ sung PDF"
                              style={{ width: "100%", height: "100%", border: "none" }}
                            />
                            <div style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              background: "rgba(0,0,0,0.05)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0,
                              transition: "opacity 0.3s",
                              ":hover": { opacity: 1 }
                            }}>
                              <Button type="primary" icon={<FilePdfOutlined />}>Xem đầy đủ</Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              aspectRatio: "16/9",
                              cursor: "pointer",
                              position: "relative"
                            }}
                            onClick={() => openVideoModal(designIdea.designImage3URL)}
                          >
                            <video
                              src={designIdea.designImage3URL}
                              controls
                              style={{ width: "100%", height: "100%" }}
                            />
                            <div style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              background: "rgba(0,0,0,0.05)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0,
                              transition: "opacity 0.3s",
                              ":hover": { opacity: 1 }
                            }}>
                              <Button type="primary" icon={<VideoCameraOutlined />}>Xem đầy đủ</Button>
                            </div>
                          </div>
                        )}
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
              {selectedOrder.status === "DoneInstalling" && (
                <Card
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa"
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: 500 }}>
                    Vui lòng kiểm tra kết quả thi công. Nếu bạn hài lòng, hãy xác nhận hoàn tất đơn hàng. Nếu có vấn đề, bạn có thể yêu cầu lắp đặt lại.
                  </Text>

                  <div style={{ marginTop: 24, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16 }}>
                    <Button
                      type="primary"
                      style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        handleRequestReInstall();
                      }}
                    >
                      Yêu cầu lắp đặt lại
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        handleConfirmComplete();
                      }}
                    >
                      Xác nhận hoàn tất đơn hàng
                    </Button>
                  </div>
                </Card>

              )}

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

            {/* ReInstall Modal */}
            <Modal
              title="Yêu cầu lắp đặt lại"
              open={isReInstallModalVisible}
              onCancel={() => setIsReInstallModalVisible(false)}
              footer={null}
            >
              <Form
                form={reinstallForm}
                layout="vertical"
                onFinish={submitReInstallRequest}
                initialValues={{
                  reinstallDate: dayjs().add(1, 'day'),
                  reinstallTime: dayjs('09:00:00', 'HH:mm:ss')
                }}
              >
                <Form.Item
                  name="reinstallDate"
                  label="Ngày lắp đặt lại"
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày lắp đặt lại' }
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      // Không cho phép chọn ngày trước ngày hiện tại
                      return current && current < dayjs().startOf('day');
                    }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="reinstallTime"
                  label="Giờ lắp đặt lại"
                  rules={[
                    { required: true, message: 'Vui lòng chọn giờ lắp đặt lại' }
                  ]}
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm:ss"
                    minuteStep={15}
                  />
                </Form.Item>
                
                <Form.Item
                  name="reason"
                  label="Lý do yêu cầu lắp đặt lại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập lý do yêu cầu lắp đặt lại' }
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Nhập lý do yêu cầu lắp đặt lại"
                  />
                </Form.Item>
                
                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                  <Space>
                    <Button onClick={() => setIsReInstallModalVisible(false)}>
                      Hủy
                    </Button>
                    <Button type="primary" htmlType="submit">
                      Xác nhận
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            {/* PDF Modal */}
            <Modal
              title="Xem tài liệu PDF"
              open={pdfModalVisible}
              onCancel={() => setPdfModalVisible(false)}
              width="90%"
              style={{ top: 20 }}
              footer={null}
              bodyStyle={{ height: "80vh", padding: 0 }}
            >
              <iframe
                src={currentPdfUrl}
                title="PDF Document"
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </Modal>

            {/* Video Modal */}
            <Modal
              title="Xem video hướng dẫn"
              open={videoModalVisible}
              onCancel={() => setVideoModalVisible(false)}
              width="90%"
              style={{ top: 20 }}
              footer={null}
              bodyStyle={{ padding: 0 }}
            >
              <video
                src={currentVideoUrl}
                controls
                autoPlay
                style={{ width: "100%", height: "auto", maxHeight: "80vh" }}
              />
            </Modal>
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default StandardOrderDetail; 