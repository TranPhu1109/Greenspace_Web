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
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
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
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import "./styles.scss";
import StatusTracking from "@/components/StatusTracking/StatusTracking";
import useShippingStore from "@/stores/useShippingStore";
import useContractStore from "@/stores/useContractStore";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";

const { Content } = Layout;
const { Title, Text } = Typography;

const OrderHistoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, isLoading, getDesignOrderById, updateStatus } =
    useDesignOrderStore();
  //console.log("selectedOrder", selectedOrder);

  const { fetchDesignIdeaById } = useDesignIdeaStore();
  const { getProductById } = useProductStore();
  const { trackOrder } = useShippingStore();
  const {
    getContractByServiceOrder,
    contract,
    loading: contractLoading,
    signContract,
  } = useContractStore();
  const trackingInterval = useRef(null);
  const { uploadImages, progress } = useCloudinaryStorage();
  const [uploading, setUploading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  const [designIdea, setDesignIdea] = useState(null);
  //console.log(designIdea);
  const [products, setProducts] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showContractButton, setShowContractButton] = useState(false);
  const [isContractModalVisible, setIsContractModalVisible] = useState(false);

  const componentId = React.useRef("order-detail");

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

      // Fetch design idea only if status is not Pending
      // if (selectedOrder.designIdeaId && selectedOrder.status !== "Pending") {
      //   const designData = await fetchDesignIdeaById(selectedOrder.designIdeaId);
      //   setDesignIdea(designData);
      // }
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

          console.log("Current shipping status:", {
            shippingStatus,
            mappedStatus,
            currentStatus: selectedOrder.status,
          });

          // Only update if we have a valid mapped status and it's different from current status
          if (mappedStatus && mappedStatus !== selectedOrder.status) {
            console.log("Updating status:", {
              from: selectedOrder.status,
              to: mappedStatus,
              shippingStatus: shippingStatus,
            });

            await updateStatus(
              selectedOrder.id,
              mappedStatus,
              selectedOrder.deliveryCode
            );
            //message.success(`Trạng thái đơn hàng đã được cập nhật: ${mappedStatus}`);

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
  }, [selectedOrder?.deliveryCode, selectedOrder?.status]);

  // Add useEffect to fetch contract when status is ConsultingAndSketching
  useEffect(() => {
    const fetchContract = async () => {
      if (selectedOrder?.status === "ConsultingAndSketching") {
        try {
          await getContractByServiceOrder(selectedOrder.id);
          setShowContractButton(true);
        } catch (error) {
          console.error("Error fetching contract:", error);
          setShowContractButton(false);
        }
      } else {
        setShowContractButton(false);
      }
    };

    fetchContract();
  }, [selectedOrder?.status, selectedOrder?.id, getContractByServiceOrder]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await getDesignOrderById(id, componentId.current);
      await fetchDetails();
      message.success("Đã cập nhật thông tin đơn hàng");
    } catch (error) {
      //message.error('Không thể cập nhật thông tin đơn hàng');
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
    } catch (error) {
      message.error("Không thể xác nhận hoàn thành đơn hàng");
    }
  };

  // Update handleViewContract function
  const handleViewContract = () => {
    if (contract?.description) {
      setIsContractModalVisible(true);
    }
  };

  // Add handleCloseContractModal function
  const handleCloseContractModal = () => {
    setIsContractModalVisible(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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

  const handlePreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
      setIsPreviewModalVisible(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmUpload = async () => {
    try {
      setUploading(true);
      setIsPreviewModalVisible(false);
      const uploadedUrls = await uploadImages([previewImage]);
      if (uploadedUrls.length > 0) {
        setSignatureUrl(uploadedUrls[0]);
        if (contract?.id) {
          await signContract(contract.id, uploadedUrls[0]);
          message.success("Ký hợp đồng thành công");
          // Fetch contract again after successful signing
          await getContractByServiceOrder(selectedOrder.id);
        }
      }
    } catch (error) {
      message.error("Ký hợp đồng thất bại");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      setPreviewImage(null);
    }
  };

  const handleCancelUpload = () => {
    setIsPreviewModalVisible(false);
    setPreviewImage(null);
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
        <div className="order-detail-content">
          <Card className="order-detail-card">
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              {/* Header */}

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
                    {selectedOrder.address}
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
                  <Descriptions.Item
                    label={
                      <>
                        <PhoneOutlined /> Custom
                      </>
                    }
                  >
                    {selectedOrder.isCustom ? "Có" : "Không"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Design Idea Information */}
              {selectedOrder.isCustom ? (
                <Card
                  title={
                    <Space>
                      <BulbOutlined />
                      <span>Thông tin thiết kế</span>
                    </Space>
                  }
                  type="inner"
                >
                  <Descriptions column={{ xs: 1, sm: 2 }} bordered labelStyle={{ fontWeight: 'bold', fontSize: '15px' }} contentStyle={{ fontSize: '15px' }}>
                    <Descriptions.Item label="Tên thiết kế">
                      {designIdea.name}
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
                    <Descriptions.Item label="Mô tả">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: designIdea.description || "Không có mô tả"
                        }}
                        style={{
                          maxWidth: '100%',
                          overflow: 'hidden',
                          fontSize: '15px',
                          lineHeight: '1.6'
                        }}
                      />
                    </Descriptions.Item>
                  </Descriptions>

                  <Space style={{ marginTop: 16 }}>
                    <h1 style={{ fontSize: '18px', fontWeight: 'bold' }}> Hình ảnh khách hàng cung cấp:</h1>
                  </Space>
                  {selectedOrder.image?.imageUrl && (
                    <div style={{ marginTop: 16 }}>
                      <Image
                        src={selectedOrder.image.imageUrl}
                        alt={selectedOrder.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: 300,
                          objectFit: "contain",
                          borderRadius: 10,
                        }}
                      />
                    </div>
                  )}
                  {selectedOrder.image?.image2 && (
                    <div style={{ marginTop: 16 }}>
                      <img
                        src={selectedOrder.image.image2}
                        alt={selectedOrder.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: 300,
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  )}
                  {selectedOrder.image?.image3 && (
                    <div style={{ marginTop: 16 }}>
                      <img
                        src={selectedOrder.image.image3}
                        alt={selectedOrder.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: 300,
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  )}
                </Card>
              ) : (
                <>
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
                      <Descriptions column={{ xs: 1, sm: 2 }} bordered labelStyle={{ fontWeight: 'bold', fontSize: '15px' }} contentStyle={{ fontSize: '15px' }}>
                        <Descriptions.Item label="Tên thiết kế" span={3}>
                          {designIdea.name}
                        </Descriptions.Item>

                        {selectedOrder.length > 0 &&
                          selectedOrder.width > 0 && (
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
                              __html: designIdea.description || "Không có mô tả"
                            }}
                            style={{
                              maxWidth: '100%',
                              overflow: 'hidden',
                              fontSize: '15px',
                              lineHeight: '1.6'
                            }}
                          />
                        </Descriptions.Item>
                      </Descriptions>
                      <div style={{ display: 'flex', gap: '16px', marginTop: 16 }}>
                        {designIdea.image?.imageUrl && (
                          <img
                            src={designIdea.image.imageUrl}
                            alt={designIdea.name}
                            style={{
                              maxWidth: "100%",
                              maxHeight: 300,
                              objectFit: "contain",
                            }}
                          />
                        )}
                        {designIdea.image?.image2 && (
                          <img
                            src={designIdea.image.image2}
                            alt={designIdea.name}
                            style={{
                              maxWidth: "100%",
                              maxHeight: 300,
                              objectFit: "contain",
                            }}
                          />
                        )}
                        {designIdea.image?.image3 && (
                          <img
                            src={designIdea.image.image3}
                            alt={designIdea.name}
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
                </>
              )}

              {/* Design Images Section */}
              {designIdea && selectedOrder.status !== "Pending" && (
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
                {selectedOrder.isCustom ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "18px",
                        fontWeight: 500,
                        display: "block",
                        padding: "24px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        textAlign: "center",
                        border: "1px dashed #d9d9d9",
                      }}
                    >
                      Danh sách hiện tại là của thiết kế mẫu, danh sách mới sẽ
                      được cập nhập sau khi Designer hoàn thành bản vẽ.
                    </Text>
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
                                {formatPrice(selectedOrder.materialPrice)}
                              </Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      )}
                    />
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
                          <Table.Summary.Cell index={0} colSpan={2} />
                          <Table.Summary.Cell index={2}>
                            <Text strong>Phí vật liệu:</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3}>
                            <Text type="success" strong>
                              {formatPrice(selectedOrder.materialPrice)}
                            </Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                )}
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
                {selectedOrder.isCustom ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "18px",
                        fontWeight: 500,
                        display: "block",
                        padding: "24px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        textAlign: "center",
                        border: "1px dashed #d9d9d9",
                      }}
                    >
                      Giá thiết kế, danh sách vật liệu và tổng giá sẽ được chúng
                      tôi cập nhập sau khi Designer hoàn tất bản vẽ hoàn chỉnh
                    </Text>
                    <div style={{ marginTop: "24px" }}>
                      <Descriptions bordered column={1}>
                        <Descriptions.Item label="Phí thiết kế">
                          <Text type="success" strong>
                            {formatPrice(selectedOrder.designPrice)}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phí vật liệu">
                          <Text type="success" strong>
                            {formatPrice(selectedOrder.materialPrice)}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng thanh toán">
                          <Text type="danger" strong style={{ fontSize: "16px" }}>
                            {formatPrice(
                              selectedOrder.designPrice +
                              selectedOrder.materialPrice
                            )}
                          </Text>
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Phí thiết kế">
                        <Text type="success" strong>
                          {formatPrice(selectedOrder.designPrice)}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Phí vật liệu">
                        <Text type="success" strong>
                          {formatPrice(selectedOrder.materialPrice)}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tổng thanh toán">
                        <Text type="danger" strong style={{ fontSize: "16px" }}>
                          {formatPrice(
                            selectedOrder.designPrice +
                            selectedOrder.materialPrice
                          )}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Đã thanh toán">
                        <Text type="danger" strong style={{ fontSize: "16px" }}>
                          {formatPrice(
                            selectedOrder.designPrice +
                            selectedOrder.materialPrice
                          )}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                )}
              </Card>

              {/* Status Tracking */}
              <Card title="Trạng thái đơn hàng" type="inner">
                <StatusTracking currentStatus={selectedOrder.status} />
              </Card>

              {/* Actions */}
              <div style={{ textAlign: "right" }}>
                <Space>
                  {showContractButton && (
                    <Space
                      direction="vertical"
                      size={8}
                      style={{ width: "100%" }}
                    >
                      <Button
                        type="primary"
                        icon={<FileTextOutlined />}
                        onClick={handleViewContract}
                        loading={contractLoading}
                        style={{ width: "100%" }}
                      >
                        Xem hợp đồng
                      </Button>
                      <div
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#f5f5f5",
                          borderRadius: "4px",
                          margin: "8px 0",
                        }}
                      >
                        <Text type="secondary">
                          Bạn đã đọc và đồng ý với hợp đồng, để kí hợp đồng, vui
                          lòng cung cấp ảnh chữ kí của bạn tại đây
                        </Text>
                      </div>
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        loading={uploading}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handlePreview(file);
                            }
                          };
                          input.click();
                        }}
                        style={{ width: "100%" }}
                      >
                        Tải lên chữ ký
                      </Button>
                      {signatureUrl && (
                        <div
                          style={{
                            marginTop: "16px",
                            textAlign: "center",
                          }}
                        >
                          <Image
                            src={signatureUrl}
                            alt="Chữ ký đã tải lên"
                            style={{
                              maxWidth: "200px",
                              maxHeight: "100px",
                              objectFit: "contain",
                            }}
                            preview={false}
                          />
                          <div style={{ marginTop: "8px" }}>
                            <Button
                              type="link"
                              onClick={() => setSignatureUrl(null)}
                            >
                              Xóa chữ ký
                            </Button>
                          </div>
                        </div>
                      )}
                    </Space>
                  )}
                  {selectedOrder.status === "DeliveredSuccessfully" && (
                    <Button
                      type="primary"
                      onClick={() => {
                        Modal.confirm({
                          title: "Xác nhận hoàn thành",
                          content:
                            "Bạn có chắc chắn muốn xác nhận hoàn thành đơn hàng này?",
                          okText: "Xác nhận",
                          cancelText: "Hủy",
                          onOk: handleCompleteOrder,
                        });
                      }}
                    >
                      Xác nhận hoàn thành
                    </Button>
                  )}
                </Space>
              </div>
            </Space>

            {/* Contract Modal */}
            <Modal
              title="Hợp đồng"
              open={isContractModalVisible}
              onCancel={handleCloseContractModal}
              width="80%"
              footer={null}
              style={{ top: 20 }}
              styles={{
                body: {
                  height: "80vh",
                  padding: "0",
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              <iframe
                src={contract?.description}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  flex: 1,
                }}
                title="Contract PDF"
              />
            </Modal>

            {/* Signature Preview Modal */}
            <Modal
              title="Xem trước chữ ký"
              open={isPreviewModalVisible}
              onCancel={handleCancelUpload}
              footer={[
                <Button key="cancel" onClick={handleCancelUpload}>
                  Hủy
                </Button>,
                <Button
                  key="confirm"
                  type="primary"
                  loading={uploading}
                  onClick={handleConfirmUpload}
                >
                  Xác nhận
                </Button>,
              ]}
              width={400}
            >
              <div style={{ textAlign: "center" }}>
                <Image
                  src={previewImage}
                  alt="Chữ ký xem trước"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    objectFit: "contain",
                  }}
                  preview={false}
                />
              </div>
            </Modal>
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default OrderHistoryDetail;
