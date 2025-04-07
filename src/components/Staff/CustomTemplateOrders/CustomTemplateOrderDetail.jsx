import React, { useState, useEffect } from "react";
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
  Form,
  Input,
  Select,
  message,
  Divider,
  Timeline,
  Badge,
  Statistic,
  Empty,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  StarTwoTone,
  LayoutOutlined,
  FileTextOutlined,
  SyncOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import ConsultingSection from "./sections/ConsultingSection";
import DesignSection from "./sections/DesignSection";
import MaterialSection from "./sections/MaterialSection";
import "./CustomTemplateOrderDetail.scss";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useProductStore from "@/stores/useProductStore";
import useContractStore from "@/stores/useContractStore";

const { Step } = Steps;

const CustomTemplateOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDesignOrderById, selectedOrder, isLoading, updateStatus } =
    useDesignOrderStore();
  const { products, fetchProducts, categories, fetchCategories, getProductById } = useProductStore();
  const { generateContract, loading: contractLoading, getContractByServiceOrder, contract } = useContractStore();
  const [isContractModalVisible, setIsContractModalVisible] = useState(false);

  const { getBasePath } = useRoleBasedPath();

  const handleBack = () => {
    navigate(`${getBasePath()}/design-orders/custom-template-orders`);
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (error) {
        message.error("Không thể tải thông tin sản phẩm");
      }
    };
    fetchData();
  }, [fetchProducts, fetchCategories]);

  // Add useEffect to fetch contract when status is ConsultingAndSketching
  useEffect(() => {
    const fetchContract = async () => {
      if (selectedOrder?.status === "ConsultingAndSketching") {
        try {
          await getContractByServiceOrder(selectedOrder.id);
        } catch (error) {
          console.error('Error fetching contract:', error);
        }
      }
    };

    fetchContract();
  }, [selectedOrder?.status, selectedOrder?.id, getContractByServiceOrder]);

  // Add function to handle contract generation
  const handleGenerateContract = async () => {
    try {
      if (!selectedOrder) return;

      Modal.confirm({
        title: "Xác nhận tạo hợp đồng",
        content: "Bạn có chắc chắn muốn tạo hợp đồng cho đơn hàng này?",
        okText: "Xác nhận",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            const contractData = {
              userId: selectedOrder.userId,
              serviceOrderId: selectedOrder.id,
              userName: selectedOrder.userName,
              email: selectedOrder.email,
              phone: selectedOrder.cusPhone,
              address: selectedOrder.address,
              designPrice: selectedOrder.designPrice || 0
            };

            const result = await generateContract(contractData);
            message.success("Tạo hợp đồng thành công");

            // Could navigate to contract view or download PDF if API returns such data
            // For now just show success message
          } catch (error) {
            message.error("Không thể tạo hợp đồng: " + (error.message || "Lỗi không xác định"));
          }
        }
      });
    } catch (error) {
      message.error("Không thể tạo hợp đồng: " + (error.message || "Lỗi không xác định"));
    }
  };

  // Add function to handle contract viewing
  const handleViewContract = () => {
    if (contract?.description) {
      setIsContractModalVisible(true);
    }
  };

  // Add function to close contract modal
  const handleCloseContractModal = () => {
    setIsContractModalVisible(false);
  };

  // Add function to handle status update
  const handleUpdateToConsulting = async () => {
    try {
      Modal.confirm({
        title: "Cập nhật trạng thái",
        content: "Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng thành 'Tư vấn và phác thảo'?",
        okText: "Xác nhận",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            await updateStatus(selectedOrder.id, "ConsultingAndSketching");
            message.success("Đã cập nhật trạng thái đơn hàng thành công");
            // Refresh order details to see the updated status
            await getDesignOrderById(id);
          } catch (error) {
            message.error("Không thể cập nhật trạng thái đơn hàng: " + (error.message || "Lỗi không xác định"));
          }
        }
      });
    } catch (error) {
      message.error("Có lỗi xảy ra: " + (error.message || "Lỗi không xác định"));
    }
  };

  if (isLoading || !selectedOrder) {
    return (
      <Card>
        <Empty description="Đang tải thông tin đơn hàng..." />
      </Card>
    );
  }

  const renderSection = () => {
    switch (selectedOrder.status) {
      case "pending":
        return null; // Show default order info
      case "processing":
      case "consulting":
        return (
          <ConsultingSection
            order={selectedOrder}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      case "designing":
      case "design_review":
        return (
          <DesignSection
            order={selectedOrder}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      // case 'waiting_deposit':
      //   return <DepositSection order={order} onUpdateStatus={handleUpdateStatus} />;
      case "material_selecting":
      case "material_ordered":
        return (
          <MaterialSection
            order={selectedOrder}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      case "delivering":
      // case 'completed':
      //   return <DeliverySection order={order} onUpdateStatus={handleUpdateStatus} />;
      default:
        return null;
    }
  };

  // Add status mapping for display
  const getStatusDisplay = (status) => {
    const statusMap = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Tư vấn và phác thảo",
      DeterminingDesignPrice: "Xác định giá thiết kế",
      DepositSuccessful: "Đã đặt cọc",
      DeterminingMaterialPrice: "Xác định giá vật liệu",
      AssignToDesigner: "Giao cho Designer",
      DoneDesign: "Hoàn thành thiết kế",
      PaymentSuccess: "Đã thanh toán",
      Processing: "Đang xử lý",
      PickedPackageAndDelivery: "Đang giao hàng",
      DeliveryFail: "Giao hàng thất bại",
      ReDelivery: "Giao hàng lại",
      DeliveredSuccessfully: "Đã giao hàng",
      CompleteOrder: "Hoàn thành",
      OrderCancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  // Add status color mapping
  const getStatusColor = (status) => {
    const colorMap = {
      Pending: "gold",
      ConsultingAndSketching: "blue",
      DeterminingDesignPrice: "blue",
      DepositSuccessful: "green",
      DeterminingMaterialPrice: "cyan",
      AssignToDesigner: "purple",
      DoneDesign: "orange",
      PaymentSuccess: "green",
      Processing: "processing",
      PickedPackageAndDelivery: "processing",
      DeliveryFail: "error",
      ReDelivery: "warning",
      DeliveredSuccessfully: "success",
      CompleteOrder: "success",
      OrderCancelled: "error",
    };
    return colorMap[status] || "default";
  };

  // Update Steps component to show all statuses
  const getCurrentStep = (status) => {
    const stepMap = {
      Pending: 0,
      ConsultingAndSketching: 1,
      DeterminingDesignPrice: 2,
      DepositSuccessful: 3,
      AssignToDesigner: 4,
      DeterminingMaterialPrice: 5,
      DoneDesign: 6,
      PaymentSuccess: 7,
      Processing: 8,
      PickedPackageAndDelivery: 9,
      DeliveryFail: 10,
      ReDelivery: 11,
      DeliveredSuccessfully: 12,
      CompleteOrder: 13,
      OrderCancelled: 14,
    };
    return stepMap[status] || 0;
  };

  return (
    <div className="custom-template-order-detail">
      {/* <Card> */}
      <div className="header-actions">
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
              },
              body: {
                padding: "24px"
              }
            }}
          >
            <div style={{ padding: "24px" }}>
              <Steps
                current={getCurrentStep(selectedOrder.status)}
                status={
                  selectedOrder.status === "OrderCancelled" ||
                    selectedOrder.status === "DeliveryFail"
                    ? "error"
                    : "process"
                }
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "24px",
                }}
              >
                <Step
                  title="Chờ xử lý"
                  description="Đơn hàng mới"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Tư vấn"
                  description="Tư vấn và phác thảo"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Xác định giá"
                  description="Xác định giá thiết kế"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Đặt cọc"
                  description="Đã đặt cọc thành công"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Xác định giá"
                  description="Xác định giá vật liệu"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Designer"
                  description="Giao cho Designer"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Thiết kế"
                  description="Hoàn thành thiết kế"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Thanh toán"
                  description="Đã thanh toán"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Xử lý"
                  description="Đang xử lý đơn hàng"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Vận chuyển"
                  description="Đang giao hàng"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Đã giao"
                  description="Giao hàng thành công"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Hoàn thành"
                  description="Đơn hàng hoàn thành"
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Giao thất bại"
                  description="Giao hàng không thành công"
                  status={
                    selectedOrder.status === "DeliveryFail" ? "error" : "wait"
                  }
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Giao lại"
                  description="Đang giao hàng lại"
                  status={
                    selectedOrder.status === "ReDelivery" ? "process" : "wait"
                  }
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
                <Step
                  title="Đã hủy"
                  description="Đơn hàng đã bị hủy"
                  status={
                    selectedOrder.status === "OrderCancelled" ? "error" : "wait"
                  }
                  style={{
                    paddingRight: "16px",
                    minWidth: "200px",
                    flex: "1 1 auto",
                  }}
                />
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
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Mã đơn hàng">
                #{selectedOrder.id}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Ngày đặt hàng">
                {dayjs(order.orderDate).format("DD/MM/YYYY")}
              </Descriptions.Item> */}
              <Descriptions.Item label="Designer">
                {selectedOrder.designer}
              </Descriptions.Item>
              <Descriptions.Item label="Mẫu thiết kế">
                {selectedOrder.templateName}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Diện tích mẫu">
                {selectedOrder.area} m²
              </Descriptions.Item> */}
              <Descriptions.Item label="Diện tích yêu cầu">
                {selectedOrder.length * selectedOrder.width} m²
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <div>
              <h4>Mô tả yêu cầu:</h4>
              <p dangerouslySetInnerHTML={{
                __html: selectedOrder.description || "<p>Không có yêu cầu cụ thể</p>",
              }}
                style={{ fontSize: '15px', lineHeight: '1.6' }}></p>
            </div>
            {selectedOrder.attachments &&
              selectedOrder.attachments.length > 0 && (
                <div className="attachments">
                  <h4>Tài liệu đính kèm:</h4>
                  <ul>
                    {selectedOrder.attachments.map((file, index) => (
                      <li key={index}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            {selectedOrder.image && (
              <div className="customer-images">
                <h4>Hình ảnh từ khách hàng:</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[
                    selectedOrder.image.imageUrl,
                    selectedOrder.image.image2,
                    selectedOrder.image.image3,
                  ]
                    .filter((img) => img) // Filter out undefined/null images
                    .map((imageUrl, index) => (
                      <div
                        key={index}
                        style={{
                          width: "150px",
                          height: "150px",
                          position: "relative",
                          border: "1px solid #e8e8e8",
                          borderRadius: "8px",
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={`Customer image ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onClick={() => {
                            const modal = Modal.info({
                              icon: null,
                              content: (
                                <img
                                  src={imageUrl}
                                  alt={`Enlarged customer image ${index + 1}`}
                                  style={{
                                    width: "100%",
                                    maxHeight: "80vh",
                                    objectFit: "contain",
                                  }}
                                />
                              ),
                              okText: "Đóng",
                              maskClosable: true,
                              width: "80%",
                            });
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: "4px",
                            background: "rgba(0,0,0,0.5)",
                            color: "white",
                            fontSize: "12px",
                            textAlign: "center",
                          }}
                        >
                          Hình ảnh thiết kế {index + 1}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            <Divider />
            {selectedOrder.serviceOrderDetails &&
              selectedOrder.serviceOrderDetails.length > 0 && (
                <div className="selected-materials">
                  <h4>Vật liệu thiết kế:</h4>
                  <div style={{ marginBottom: "10px" }}>
                    <Table
                      dataSource={selectedOrder.serviceOrderDetails.map((detail) => {
                        const product = products.find((p) => p.id === detail.productId);
                        const category = categories.find((c) => c.id === product?.categoryId);
                        return {
                          ...detail,
                          product,
                          category,
                        };
                      })}
                      pagination={false}
                      size="small"
                      bordered
                    >
                      <Table.Column
                        title="Sản phẩm"
                        key="product"
                        render={(record) => (
                          <Space>
                            {record.product?.image && (
                              <img
                                src={record.product.image.imageUrl}
                                alt={record.product.name}
                                style={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: "5px",
                                  objectFit: "cover",
                                }}
                              />
                            )}
                            <div>
                              <div>{record.product?.name || "N/A"}</div>
                              {record.category && (
                                <Tag color="green">{record.category.name}</Tag>
                              )}
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
                {selectedOrder.address}
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
              {/* <Descriptions.Item
                // label="Diện tích yêu cầu"
                label={
                  <Space>
                    <LayoutOutlined
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
                      Diện tích yêu cầu
                    </span>
                  </Space>
                }
              >
                {selectedOrder.length * selectedOrder.width} m²
              </Descriptions.Item> */}
              <Descriptions.Item
                label={
                  <span style={{ color: "#666", fontSize: "15px" }}>
                    Tổng chi phí
                  </span>
                }
              >
                {selectedOrder.totalCost.toLocaleString("vi-VN")} đ
              </Descriptions.Item>
            </Descriptions>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {/* Add Update Status button */}
              {selectedOrder.status === "Pending" && (
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  style={{
                    backgroundColor: "#7B68EE", // Medium Slate Blue
                    borderColor: "#7B68EE",
                    width: "100%",
                  }}
                  onClick={handleUpdateToConsulting}
                >
                  Cập nhật sang Tư vấn
                </Button>
              )}

              {selectedOrder.status === "WaitDeposit" && (
                <>
                  {contract ? (
                    <Button
                      type="primary"
                      icon={<FileTextOutlined />}
                      style={{
                        backgroundColor: "#1890ff",
                        borderColor: "#1890ff",
                        width: "100%",
                      }}
                      onClick={handleViewContract}
                    >
                      Xem hợp đồng
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<FileTextOutlined />}
                      loading={contractLoading}
                      style={{
                        backgroundColor: "#1890ff",
                        borderColor: "#1890ff",
                        width: "100%",
                      }}
                      onClick={handleGenerateContract}
                    >
                      Tạo hợp đồng
                    </Button>
                  )}
                </>
              )}
              {selectedOrder.status === "ConsultingAndSketching" && (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  style={{
                  backgroundColor: "#4CAF50",
                  borderColor: "#4CAF50",
                  width: "100%",
                }}
                onClick={() => {
                  navigate("/staff/schedule");
                }}
                // onClick={() => {
                //   Modal.confirm({
                //     title: "Giao task cho designer",
                //     content: "Bạn có chắc chắn muốn giao task này cho designer?",
                //     okText: "Xác nhận",
                //     cancelText: "Hủy",
                //     onOk: () => {
                //       message.success("Đã chuyển đến trang phân công");
                //       navigate("/staff/schedule");
                //     },
                //   });
                // }}
              >
                Giao task cho designer
              </Button>
              )}
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
                    onOk: () => {
                      message.success("Đã hủy đơn hàng thành công");
                    },
                  });
                }}
              >
                Hủy đơn hàng
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Order basic info */}
      <Row gutter={[16, 16]}>
        {/* Customer Info */}
        {/* <Col span={24}>
          <Card
            title="Thông tin khách hàng"
            headStyle={{
              backgroundColor: "#e3f0e1",
              borderBottom: "2px solid #4caf50",
            }}
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} layout="horizontal">
              <Descriptions.Item
                label={
                  <div style={{ fontWeight: "bold" }}>
                    <UserOutlined
                      style={{ color: "#4caf50", marginRight: "5px" }}
                    />{" "}
                    Họ tên
                  </div>
                }
              >
                {order.customerInfo?.name}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div style={{ fontWeight: "bold" }}>
                    <PhoneOutlined
                      style={{ color: "#4caf50", marginRight: "5px" }}
                    />{" "}
                    Số điện thoại
                  </div>
                }
              >
                {order.customerInfo?.phone}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div style={{ fontWeight: "bold" }}>
                    <MailOutlined
                      style={{ color: "#4caf50", marginRight: "5px" }}
                    />{" "}
                    Email
                  </div>
                }
              >
                {order.customerInfo?.email}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div style={{ fontWeight: "bold" }}>
                    <HomeOutlined
                      style={{ color: "#4caf50", marginRight: "5px" }}
                    />{" "}
                    Địa chỉ
                  </div>
                }
              >
                {order.customerInfo?.address}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col> */}

        {/* Order Progress */}
        {/* <Col span={24}>
          <Card title="Tiến độ đơn hàng" bordered={false}>
            <Steps current={currentStep}>
              {orderSteps.map((step, index) => (
                <Step
                  key={index}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </Steps>
          </Card>
        </Col> */}

        {/* Yêu cầu thiết kế */}
        <Col span={24}>
          {/* <Card title="Yêu cầu thiết kế" bordered={false}>
            <p>{order.requirements || "Không có yêu cầu cụ thể"}</p>
            {order.attachments && order.attachments.length > 0 && (
              <div className="attachments">
                <h4>Tài liệu đính kèm:</h4>
                <ul>
                  {order.attachments.map((file, index) => (
                    <li key={index}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card> */}
        </Col>

        {/* Chi phí và thanh toán */}
        {/* <Col span={24}>
          <Card title="Chi phí và thanh toán" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Statistic
                  title="Phí thiết kế"
                  value={order.prices?.designFee || 0}
                  suffix="đ"
                  groupSeparator=","
                />
              </Col>
              <Col xs={24} md={12}>
                <Statistic
                  title="Tổng chi phí vật liệu"
                  value={order.prices?.totalMaterialCost || 0}
                  suffix="đ"
                  groupSeparator=","
                />
              </Col>
              <Col xs={24}>
                <Statistic
                  title="Tổng chi phí"
                  value={order.prices?.totalCost || 0}
                  suffix="đ"
                  groupSeparator=","
                  valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
                />
              </Col>
            </Row>
          </Card>
        </Col> */}

        {/* Timeline */}
        {/* <Col span={24}>
            <Card title="Lịch sử đơn hàng">
              {order.timeline && order.timeline.length > 0 ? (
                <Timeline
                  items={order.timeline.map(item => ({
                    children: (
                      <>
                        <div>{dayjs(item.date).format('DD/MM/YYYY HH:mm')}</div>
                        <div>{item.description}</div>
                      </>
                    )
                  }))}
                />
              ) : (
                <Empty description="Chưa có lịch sử" />
              )}
            </Card>
          </Col> */}
      </Row>

      {/* Dynamic section based on order status */}
      {renderSection()}

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
            height: '80vh',
            padding: '0',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <iframe
          src={contract?.description}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            flex: 1
          }}
          title="Contract PDF"
        />
      </Modal>
      {/* </Card> */}
    </div>
  );
};

export default CustomTemplateOrderDetail;
