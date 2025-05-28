import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Descriptions,
  Steps,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Divider,
  Empty,
  Spin,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  StarTwoTone,
} from "@ant-design/icons";

import { useParams, useNavigate } from "react-router-dom";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useProductStore from "@/stores/useProductStore";
import useShippingStore from "@/stores/useShippingStore";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
const { Step } = Steps;

const TemplateOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDesignOrderById, selectedOrder, isLoading, updateStatus } =
    useDesignOrderStore();
  const { products, fetchProducts, categories, fetchCategories, getProductById } =
    useProductStore();
  const { createShippingOrder, trackOrder } = useShippingStore();
  const { getBasePath } = useRoleBasedPath();
  const { fetchDesignIdeaById } = useDesignIdeaStore();
  const trackingInterval = useRef(null);
  const [designIdea, setDesignIdea] = useState(null);
  const [loadingDesignIdea, setLoadingDesignIdea] = useState(false);

  //console.log("selectedOrder sttus", selectedOrder);

  const handleBack = () => {
    navigate(`${getBasePath()}/design-orders/template-orders`);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        await getDesignOrderById(id);
      } catch (error) {
        message.error("Không thể tải thông tin đơn hàng");
        navigate(-1);
      }
    };
    fetchOrderDetail();
  }, [id]);

  // Add a new effect to fetch design idea when order is loaded
  useEffect(() => {
    const fetchDesignIdea = async () => {
      if (selectedOrder && selectedOrder.designIdeaId && selectedOrder.serviceType === "UsingDesignIdea") {
        try {
          setLoadingDesignIdea(true);
          const designData = await fetchDesignIdeaById(selectedOrder.designIdeaId);
          setDesignIdea(designData);
        } catch (error) {
          // console.error("Error fetching design idea:", error);
          // message.error("Không thể tải thông tin mẫu thiết kế");
        } finally {
          setLoadingDesignIdea(false);
        }
      }
    };

    fetchDesignIdea();
  }, [selectedOrder, fetchDesignIdeaById]);

  const refreshOrderDetails = async () => {
    try {
      await getDesignOrderById(id);
    } catch (error) {
      message.error("Không thể tải lại thông tin đơn hàng");
    }
  };

  const handleConfirmOrder = async () => {
    try {
      // Step 1: Update status to Processing
      await updateStatus(id, "Processing");

      // Parse address components
      const addressParts = selectedOrder.address.split('|');
      const addressDetail = addressParts[0];
      const province = addressParts[3];
      const district = addressParts[2];
      const ward = addressParts[1];

      // Fetch product names for items
      const items = await Promise.all(
        selectedOrder.serviceOrderDetails.map(async (detail) => {
          const product = await getProductById(detail.productId);
          return {
            name: product.name,
            code: detail.productId,
            quantity: detail.quantity
          };
        })
      );

      // Prepare shipping data
      const shippingData = {
        toName: selectedOrder.userName,
        toPhone: selectedOrder.cusPhone,
        toAddress: addressDetail,
        toProvince: province,
        toDistrict: district,
        toWard: ward,
        items: items
      };

      // Step 2: Create shipping order
      const shippingResponse = await createShippingOrder(shippingData);
      const orderCode = shippingResponse?.data?.data?.order_code;

      // Step 3: Update status with delivery code
      await updateStatus(id, "Processing", orderCode);

      message.success("Đã xác nhận đơn hàng và tạo đơn vận chuyển thành công");
      await refreshOrderDetails();
    } catch (error) {
      console.error("Error confirming order:", error);
      message.error("Không thể xác nhận đơn hàng: " + (error.message || "Lỗi không xác định"));
    }
  };

  const handleCancelOrder = async () => {
    try {
      await updateStatus(id, "OrderCancelled");
      message.success("Đã hủy đơn hàng thành công");
      await refreshOrderDetails();
    } catch (error) {
      message.error("Không thể hủy đơn hàng");
    }
  };

  // Function to navigate to contractor schedule page
  const handleAssignToInstallTeam = () => {
    navigate(`${getBasePath()}/schedule-contructor`, {
      state: {
        serviceOrderId: selectedOrder.id,
        customerName: selectedOrder.userName,
        address: selectedOrder.address,
        autoOpenModal: false,
        currentStatus: selectedOrder.status
        // Removed construction date and time to let staff choose their own
      }
    });
  };

  // Add status mapping for display
  const getStatusDisplay = (status) => {
    const statusMap = {
      "Pending": "Chờ xử lý",
      "PaymentSuccess": "Đã thanh toán",
      "Processing": "Đang xử lý",
      "PickedPackageAndDelivery": "Đang giao hàng",
      "DeliveryFail": "Giao hàng thất bại",
      "ReDelivery": "Giao hàng lại",
      "DeliveredSuccessfully": "Đã giao hàng",
      "CompleteOrder": "Hoàn thành",
      "OrderCancelled": "Đã hủy"
    };
    return statusMap[status] || status;
  };

  // Add status color mapping
  const getStatusColor = (status) => {
    const colorMap = {
      "Pending": "gold",
      "PaymentSuccess": "blue",
      "Processing": "processing",
      "PickedPackageAndDelivery": "processing",
      "DeliveryFail": "error",
      "ReDelivery": "warning",
      "DeliveredSuccessfully": "success",
      "CompleteOrder": "success",
      "OrderCancelled": "error"
    };
    return colorMap[status] || "default";
  };

  // Update Steps component to show all statuses
  const getCurrentStep = (status) => {
    const stepMap = {
      "Pending": 0,
      "PaymentSuccess": 1,
      "Processing": 2,
      "PickedPackageAndDelivery": 3,
      "DeliveryFail": 6,
      "ReDelivery": 7,
      "DeliveredSuccessfully": 4,
      "CompleteOrder": 5,
      "OrderCancelled": 8
    };
    return stepMap[status] || 0;
  };

  // Map shipping status to our status
  const shippingStatusMap = {
    'ready_to_pick': 'Processing',
    'delivering': 'PickedPackageAndDelivery',
    'delivery_fail': 'DeliveryFail',
    'return': 'ReDelivery',
    'delivered': 'DeliveredSuccessfully',
    'cancel': 'OrderCancelled'
  };

  // Start tracking when component mounts and order has a delivery code
  useEffect(() => {
    if (selectedOrder?.deliveryCode) {
      const startTracking = () => {
        // Clear any existing interval
        if (trackingInterval.current) {
          clearInterval(trackingInterval.current);
        }

        // Initial check
        checkShippingStatus();

        // Set up interval for checking every 60 seconds
        trackingInterval.current = setInterval(checkShippingStatus, 20000);
      };

      const checkShippingStatus = async () => {
        try {
          // Stop tracking if status is DeliveredSuccessfully or CompleteOrder
          if (selectedOrder.status === "DeliveredSuccessfully" || selectedOrder.status === "CompleteOrder") {
            if (trackingInterval.current) {
              clearInterval(trackingInterval.current);
              trackingInterval.current = null;
            }
            return;
          }

          const shippingStatus = await trackOrder(selectedOrder.deliveryCode);
          const mappedStatus = shippingStatusMap[shippingStatus];

          console.log('Current shipping status:', {
            shippingStatus,
            mappedStatus,
            currentStatus: selectedOrder.status
          });

          // Only update if we have a valid mapped status and it's different from current status
          if (mappedStatus && mappedStatus !== selectedOrder.status) {
            console.log('Updating status:', {
              from: selectedOrder.status,
              to: mappedStatus,
              shippingStatus: shippingStatus
            });

            await updateStatus(selectedOrder.id, mappedStatus, selectedOrder.deliveryCode);
            message.success(`Trạng thái đơn hàng đã được cập nhật: ${getStatusDisplay(mappedStatus)}`);

            // Refresh order details to get the latest status
            await refreshOrderDetails();
          }
        } catch (error) {
          console.error('Error checking shipping status:', error);
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

  if (isLoading || !selectedOrder) {
    return (
      <Card>
        <Empty description="Đang tải thông tin đơn hàng..." />
      </Card>
    );
  }

  return (
    <div className="template-order-detail">
      <div className="header-actions" style={{ marginBottom: "16px" }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Quay lại
          </Button>
          <span style={{ fontWeight: "bold" }}>
            Chi tiết đơn đặt thiết kế #{selectedOrder.id}
          </span>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title="Tiến độ đơn hàng"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              borderRadius: "12px",
              border: "1px solid #f0f0f0",
            }}
            styles={{
              header: {
                background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                color: "white",
                borderRadius: "12px 12px 0 0",
                padding: "16px 20px",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
              }
            }}
          >
            <div style={{ padding: "24px" }}>
              <Steps
                current={getCurrentStep(selectedOrder.status)}
                status={selectedOrder.status === "OrderCancelled" || selectedOrder.status === "DeliveryFail" ? "error" : "process"}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "24px"
                }}
              >
                <Step
                  title="Chờ xử lý"
                  description="Đơn hàng mới"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto"
                  }}
                />
                {selectedOrder.status !== "OrderCancelled" ? (
                  <>
                    <Step
                      title="Thanh toán"
                      description="Đã thanh toán"
                      style={{
                        paddingRight: "16px",
                        minWidth: "200px",
                        flex: "1 1 auto"
                      }}
                    />
                    <Step
                      title="Đang xử lý"
                      description="Đang xử lý đơn hàng"
                      style={{
                        paddingRight: "16px",
                        minWidth: "200px",
                        flex: "1 1 auto"
                      }}
                    />
                    <Step
                      title="Vận chuyển"
                      description="Đang giao hàng"
                      style={{
                        paddingRight: "16px",
                        minWidth: "200px",
                        flex: "1 1 auto"
                      }}
                    />
                    <Step
                      title="Đã giao"
                      description="Giao hàng thành công"
                      style={{
                        paddingRight: "16px",
                        minWidth: "200px",
                        flex: "1 1 auto"
                      }}
                    />
                    <Step
                      title="Hoàn thành"
                      description="Đơn hàng hoàn thành"
                      style={{
                        paddingRight: "16px",
                        minWidth: "200px",
                        flex: "1 1 auto"
                      }}
                    />
                    <Step
                      title="Giao thất bại"
                      description="Giao hàng không thành công"
                      status={selectedOrder.status === "DeliveryFail" ? "error" : "wait"}
                      style={{
                        paddingRight: "16px",
                        minWidth: "200px",
                        flex: "1 1 auto"
                      }}
                    />
                    <Step
                      title="Giao lại"
                      description="Đang giao hàng lại"
                      status={selectedOrder.status === "ReDelivery" ? "process" : "wait"}
                      style={{
                        paddingRight: "16px",
                        minWidth: "200px",
                        flex: "1 1 auto"
                      }}
                    />
                  </>
                ) : (
                  <Step
                    title="Đã hủy"
                    description="Đơn hàng đã bị hủy"
                    status={selectedOrder.status === "OrderCancelled" ? "error" : "wait"}
                    style={{
                      paddingRight: "16px",
                      minWidth: "200px",
                      flex: "1 1 auto"
                    }}
                  />
                )}
              </Steps>
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card
            title="Thông tin đơn hàng"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              borderRadius: "12px",
              border: "1px solid #f0f0f0",
            }}
            styles={{
              header: {
                background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                color: "white",
                borderRadius: "12px 12px 0 0",
                padding: "16px 20px",
                fontSize: "16px",
                fontWeight: "600",
                border: "none",
              }
            }}
          >
            <div>
              {/* Order Information Section */}
              <Descriptions column={2} bordered title="Thông tin đơn hàng">
                <Descriptions.Item label="Mã đơn hàng">
                  #{selectedOrder.id}
                </Descriptions.Item>

                <Descriptions.Item label="Mẫu thiết kế">
                  {loadingDesignIdea ? (
                    <Spin size="small" />
                  ) : designIdea ? (
                    <span>{designIdea.name}</span>
                  ) : (
                    <span>{selectedOrder.serviceType}</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Giá thiết kế">
                  <strong>
                    {selectedOrder.designPrice.toLocaleString("vi-VN")} đ
                  </strong>
                </Descriptions.Item>
                {designIdea && (
                  <Descriptions.Item label="Danh mục thiết kế">
                    <Tag color="green" style={{
                      maxWidth: "100%",     // Đảm bảo tag không vượt quá container
                      whiteSpace: "normal", // Cho phép xuống dòng
                      wordBreak: "break-word", // Bẻ từ nếu dài quá
                      lineHeight: "1.2em",  // Căn chỉnh dòng đẹp hơn nếu nhiều dòng
                      display: "inline-block" // Giúp Tag tính đúng kích thước khi wrap
                    }}>{designIdea.categoryName}</Tag>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            <Divider />

            {selectedOrder.serviceOrderDetails &&
              selectedOrder.serviceOrderDetails.length > 0 && (
                <div className="selected-materials">
                  <h4>Vật liệu:</h4>
                  <div style={{ marginBottom: "10px" }}>
                    <Table
                      dataSource={selectedOrder.serviceOrderDetails.map(
                        (detail) => {
                          const product = products.find(
                            (p) => p.id === detail.productId
                          );
                          const category = categories.find(
                            (c) => c.id === product?.categoryId
                          );
                          return {
                            ...detail,
                            product,
                            category,
                          };
                        }
                      )}
                      pagination={false}
                      size="small"
                      bordered
                      summary={() => (
                        <Table.Summary>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3}>
                              <strong>Tổng tiền vật liệu</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                              <strong>
                                {selectedOrder.materialPrice.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                đ
                              </strong>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      )}
                    >
                      <Table.Column
                        title="Sản phẩm"
                        key="product"
                        render={(record) => (
                          <Space>
                            <img
                              src={record.product?.image.imageUrl}
                              alt={record.product?.name}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: "5px",
                                objectFit: "cover",
                              }}
                            />
                            <div>
                              <div>{record.product?.name}</div>
                              <Tag color="green">{record.category?.name}</Tag>
                            </div>
                          </Space>
                        )}
                      />
                      <Table.Column title="Số lượng" dataIndex="quantity" />
                      <Table.Column
                        title="Đơn giá"
                        dataIndex="price"
                        render={(price) => (
                          <span>{price.toLocaleString("vi-VN")} đ</span>
                        )}
                      />
                      <Table.Column
                        title="Thành tiền"
                        dataIndex="totalPrice"
                        render={(totalPrice) => (
                          <span>{totalPrice.toLocaleString("vi-VN")} đ</span>
                        )}
                      />
                    </Table>
                  </div>
                </div>
              )}
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title="Thông tin khách hàng"
            className="customer-info-card"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              borderRadius: "12px",
              border: "1px solid #f0f0f0",
            }}
            styles={{
              header: {
                background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                color: "white",
                borderRadius: "12px 12px 0 0",
                padding: "16px 20px",
                fontSize: "16px",
                fontWeight: "600",
                border: "none",
              }
            }}
          >
            <Descriptions column={1} size="small" layout="horizontal" bordered>
              <Descriptions.Item
                label={
                  <Space>
                    <UserOutlined
                      style={{
                        color: "#4caf50",
                        fontSize: "18px",
                        backgroundColor: "#f0f7f0",
                        padding: "10px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                    <span style={{ color: "#666", fontSize: "15px" }}>
                      Khách hàng
                    </span>
                  </Space>
                }
              >
                {selectedOrder.userName}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <PhoneOutlined
                      style={{
                        color: "#4caf50",
                        fontSize: "18px",
                        backgroundColor: "#f0f7f0",
                        padding: "10px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />

                    <span style={{ color: "#666", fontSize: "15px" }}>
                      Số điện thoại
                    </span>
                  </Space>
                }
              >
                {selectedOrder.cusPhone}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <MailOutlined
                      style={{
                        color: "#4caf50",
                        fontSize: "18px",
                        backgroundColor: "#f0f7f0",
                        padding: "10px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />

                    <span style={{ color: "#666", fontSize: "15px" }}>
                      Email
                    </span>
                  </Space>
                }
              >
                {selectedOrder.email}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <HomeOutlined
                      style={{
                        color: "#4caf50",
                        fontSize: "18px",
                        backgroundColor: "#f0f7f0",
                        padding: "10px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />

                    <span style={{ color: "#666", fontSize: "15px" }}>
                      Địa chỉ
                    </span>
                  </Space>
                }
              >
                {selectedOrder.address.replace(/\|/g, ', ')}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <StarTwoTone
                      style={{
                        color: "#4caf50",
                        fontSize: "18px",
                        backgroundColor: "#f0f7f0",
                        padding: "10px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />

                    <span style={{ color: "#666", fontSize: "15px" }}>
                      Trạng thái
                    </span>
                  </Space>
                }
              >
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusDisplay(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ color: "#666", fontSize: "15px" }}>
                    Tổng chi phí
                  </span>
                }
              >
                <span style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#4CAF50",
                  display: "block",
                  marginTop: "4px"
                }}>
                  {((selectedOrder.designPrice || 0) + (selectedOrder.materialPrice || 0)).toLocaleString("vi-VN")} đ
                </span>
              </Descriptions.Item>
            </Descriptions>
            {selectedOrder.status !== "OrderCancelled" && (
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {(selectedOrder.status === "Pending" || selectedOrder.status === "DeliveryFail") && (
                  <>
                    {/* <Button
                      type="primary"
                      style={{
                        backgroundColor: "#4CAF50",
                        borderColor: "#4CAF50",
                        width: "100%",
                      }}
                      onClick={() => {
                        Modal.confirm({
                          title: "Xác nhận đơn hàng",
                          content: "Bạn có chắc chắn muốn xác nhận đơn hàng này?",
                          okText: "Xác nhận",
                          cancelText: "Hủy",
                          onOk: handleConfirmOrder,
                        });
                      }}
                    >
                      Xác nhận đơn hàng
                    </Button> */}
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: "#1a73e8",
                        borderColor: "#1a73e8",
                        width: "100%",
                      }}
                      onClick={() => {
                        Modal.confirm({
                          title: selectedOrder.status === "Pending"
                            ? "Phân công cho đội lắp đặt"
                            : "Phân công lại cho đội lắp đặt",
                          content: selectedOrder.status === "Pending"
                            ? "Bạn có chắc chắn muốn phân công đơn hàng này cho đội lắp đặt?"
                            : "Bạn có chắc chắn muốn phân công lại đơn hàng này cho đội lắp đặt?",
                          okText: "Xác nhận",
                          cancelText: "Hủy",
                          onOk: handleAssignToInstallTeam,
                        });
                      }}
                    >
                      {selectedOrder.status === "Pending"
                        ? "Phân công cho đội lắp đặt"
                        : "Phân công lại cho đội lắp đặt"}
                    </Button>
                  </>
                )}
                {(selectedOrder.status === "Pending" || selectedOrder.status === "DeliveryFail") && (
                  <Button
                    danger
                    style={{
                      width: "100%",
                    }}
                    onClick={() => {
                      Modal.confirm({
                        title: "Hủy đơn hàng",
                        content: "Bạn có chắc chắn muốn hủy đơn hàng này?",
                        okText: "Hủy đơn",
                        cancelText: "Đóng",
                        okButtonProps: { danger: true },
                        onOk: handleCancelOrder,
                      });
                    }}
                  >
                    Hủy đơn hàng
                  </Button>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Keep existing modals */}
    </div>
  );
};

export default TemplateOrderDetail;
