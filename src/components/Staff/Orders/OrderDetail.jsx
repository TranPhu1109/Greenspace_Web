import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Divider,
  Typography,
  Steps,
  Row,
  Col,
  Spin,
  message,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  TruckOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "./OrderDetail.scss";
import { Tooltip } from "antd";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";
import useShippingStore from "@/stores/useShippingStore";
import useOrderStore from "@/stores/orderStore";
import useProductStore from "@/stores/useProductStore";

const { Title, Text } = Typography;
const { Step } = Steps;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { createShippingOrder, order_code } = useShippingStore();
  const { selectedOrder, getOrderById, isLoading, error, updateOrderStatus } =
    useOrderStore();

  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        if (!id) {
          message.error("ID đơn hàng không hợp lệ");
          navigate(-1);
          return;
        }
        await getOrderById(id);
        await fetchProducts();
      } catch (error) {
        message.error("Không thể tải thông tin đơn hàng");
        navigate(-1);
      }
    };
    fetchOrderDetail();
  }, [id, getOrderById, navigate, fetchProducts]);

  const { getBasePath } = useRoleBasedPath();

  const handleBack = () => {
    navigate(`${getBasePath()}/orders`);
  };

  // Thêm hàm xử lý chấp nhận/từ chối đơn hàng
  const handleAcceptOrder = async () => {
    try {
      // Tạo đơn ship
      const addressParts = selectedOrder.address
        .split(",")
        .map((part) => part.trim());
      const toAddress = addressParts[0];
      const toWard = addressParts[1];
      const toDistrict = addressParts[2];
      const toProvince = addressParts[3];

      const shippingData = {
        toName: selectedOrder.userName,
        toPhone: selectedOrder.phone,
        toAddress: toAddress,
        toProvince: toProvince,
        toDistrict: toDistrict,
        toWard: toWard,
        items: selectedOrder.orderDetails.map((item) => {
          const product = products.find(p => p.id === item.productId);
          return {
            name: product ? product.name : item.productName,
            code: item.productId,
            quantity: item.quantity,
          };
        }),
      };

      const shippingResponse = await createShippingOrder(shippingData);

      if (shippingResponse.data?.code === 200) {
        const success = await updateOrderStatus(id, {
          status: "1",
          deliveryCode: shippingResponse.data?.data?.order_code,
        });

        if (success) {
          message.success("Đã xác nhận đơn hàng thành công");
          await getOrderById(id);
        } else {
          throw new Error("Không thể cập nhật trạng thái đơn hàng");
        }
      } else {
        throw new Error("Tạo đơn vận chuyển thất bại");
      }
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi xác nhận đơn hàng");
    }
  };

  // Hàm lấy bước hiện tại trong quy trình đơn hàng
  const getCurrentStep = (status) => {
    if (!selectedOrder) return 0;
    const statusNum = parseInt(status);
    if (statusNum === 0) return 0; // Chờ xử lý
    if (statusNum === 1 || statusNum === 2) return 1; // Đang xử lý/Đã xử lý
    if (statusNum >= 6 && statusNum <= 8) return 2; // Đang giao hàng
    if (statusNum === 9) return 3; // Đã giao hàng
    if (statusNum >= 3 && statusNum <= 5) return -1; // Các trạng thái hủy/hoàn tiền
    return 0;
  };

  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : "";
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productId",
      key: "product",
      render: (productId) => {
        const product = products.find((p) => p.id === productId);
        return (
          <div className="product-cell">
            {product ? (
              <>
                <div className="product-image">
                  <img
                    src={product.image?.imageUrl}
                    alt={product.name}
                    style={{ width: 50, height: 50, objectFit: "cover" }}
                  />
                </div>
                <div className="product-name">{product.name}</div>
              </>
            ) : (
              <div className="product-name">Sản phẩm không tồn tại</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price) => `${Number(price).toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Thành tiền",
      key: "total",
      align: "right",
      render: (_, record) =>
        `${(Number(record.price) * record.quantity).toLocaleString("vi-VN")}đ`,
    },
  ];

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (error && error !== "Không tìm thấy đơn hàng") {
    return (
      <div className="error-container">
        <Title level={4}>Đã xảy ra lỗi</Title>
        <Text type="danger">{error}</Text>
        <Button type="primary" onClick={handleBack}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="not-found-container">
        <Title level={4}>Không tìm thấy đơn hàng</Title>
        <Button type="primary" onClick={handleBack}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Tính tổng tiền
  const subtotal =
    selectedOrder?.orderDetails?.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    ) || 0;
  const shippingFee = selectedOrder.shipPrice || 0;
  const total = selectedOrder.totalAmount || subtotal + shippingFee;

  return (
    <div className="order-detail-container">
      {/* Header */}
      <Card className="page-header-card">
        <div className="page-header">
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="back-button"
          />
          <Title level={4}>Chi tiết đơn hàng #{id}</Title>
          {selectedOrder.status === "0" && (
            <Alert
              message="Đơn hàng đang chờ xác nhận"
              description="Vui lòng xem xét và xác nhận hoặc từ chối đơn hàng này."
              type="warning"
              showIcon
            />
          )}
        </div>
      </Card>

      <Row gutter={16} className="order-content">
        <Col xs={24} lg={16}>
          {/* Thông tin đơn hàng */}
          <Card title="Thông tin đơn hàng" className="order-info-card">
            <Descriptions
              column={{ xs: 1, sm: 2 }}
              layout="horizontal"
              bordered
              size="small"
            >
              <Descriptions.Item
                label={
                  <span style={{ fontWeight: "bold" }}>
                    <UserOutlined /> Khách hàng
                  </span>
                }
              >
                {selectedOrder.userName}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ fontWeight: "bold" }}>
                    <PhoneOutlined /> Số điện thoại
                  </span>
                }
              >
                {selectedOrder.phone}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ fontWeight: "bold" }}>
                    <CalendarOutlined /> Ngày đặt hàng
                  </span>
                }
              >
                {new Intl.DateTimeFormat("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).format(new Date(selectedOrder.creationDate))}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ fontWeight: "bold" }}>
                    <EnvironmentOutlined /> Địa chỉ giao hàng
                  </span>
                }
              >
                {selectedOrder.address}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className="order-items">
              <Title level={5}>Sản phẩm</Title>
              <Table
                dataSource={selectedOrder.orderDetails}
                columns={columns}
                pagination={false}
                rowKey="product"
                className="products-table"
                summary={(pageData) => {
                  return (
                    <>
                      <Table.Summary.Row>
                        <Table.Summary.Cell
                          colSpan={3}
                          className="summary-label"
                        >
                          Tạm tính
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="right">
                          {subtotal.toLocaleString("vi-VN")}đ
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                      {shippingFee > 0 && (
                        <Table.Summary.Row>
                          <Table.Summary.Cell
                            colSpan={3}
                            className="summary-label"
                          >
                            Phí vận chuyển
                          </Table.Summary.Cell>
                          <Table.Summary.Cell align="right">
                            {shippingFee.toLocaleString("vi-VN")}đ
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      )}
                      <Table.Summary.Row className="total-row">
                        <Table.Summary.Cell
                          colSpan={3}
                          className="summary-label"
                        >
                          Tổng cộng
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="right">
                          {total.toLocaleString("vi-VN")}đ
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </>
                  );
                }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Thông tin trạng thái */}
          <Card className="order-summary-card">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div>
                  <div style={{ marginBottom: 10 }}>
                    <Text strong style={{ fontSize: "16px", marginBottom: 10 }}>
                      Trạng thái đơn hàng
                    </Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Tag
                      style={{ fontSize: "14px" }}
                      color={
                        selectedOrder.status === "3" ||
                        selectedOrder.status === "7"
                          ? "red"
                          : selectedOrder.status === "9"
                          ? "green"
                          : selectedOrder.status === "1"
                          ? "blue"
                          : "gold"
                      }
                    >
                      {selectedOrder.status === "0"
                        ? "Chờ xử lý"
                        : selectedOrder.status === "1"
                        ? "Đang xử lý"
                        : selectedOrder.status === "2"
                        ? "Đã xử lý"
                        : selectedOrder.status === "3"
                        ? "Đã hủy"
                        : selectedOrder.status === "4"
                        ? "Đã hoàn tiền"
                        : selectedOrder.status === "5"
                        ? "Đã hoàn tiền xong"
                        : selectedOrder.status === "6"
                        ? "Đã lấy hàng & đang giao"
                        : selectedOrder.status === "7"
                        ? "Giao hàng thất bại"
                        : selectedOrder.status === "8"
                        ? "Giao lại"
                        : selectedOrder.status === "9"
                        ? "Đã giao hàng thành công"
                        : "Đang xử lý"}
                    </Tag>
                    {selectedOrder.status === "0" && (
                      <Button
                        type="primary"
                        onClick={handleAcceptOrder}
                      >
                        <Tooltip title="Xác nhận">
                          <CheckCircleOutlined /> Xác nhận
                        </Tooltip>
                      </Button>
                    )}
                    {selectedOrder.status === "1" && (
                      <Button
                        type="primary"
                        onClick={async () => {
                          try {
                            const success = await updateOrderStatus(selectedOrder.id, { status: 6, deliveryCode: order_code });
                            if (success) {
                              message.success("Đã cập nhật trạng thái đơn hàng");
                              await getOrderById(id);
                            }
                          } catch (error) {
                            message.error("Không thể cập nhật trạng thái đơn hàng");
                          }
                        }}
                      >
                        <Tooltip title="Đã lấy hàng">
                          <CheckCircleOutlined /> Đã lấy hàng
                        </Tooltip>
                      </Button>
                    )}
                    {(selectedOrder.status === "6" || selectedOrder.status === "8") && (
                      <Space>
                        <Button
                          type="primary"
                          onClick={async () => {
                            try {
                              const success = await updateOrderStatus(selectedOrder.id, { status: 9, deliveryCode: order_code });
                              if (success) {
                                message.success("Đã cập nhật trạng thái đơn hàng");
                                await getOrderById(id);
                              }
                            } catch (error) {
                              message.error("Không thể cập nhật trạng thái đơn hàng");
                            }
                          }}
                        >
                          <Tooltip title="Giao thành công">
                            <CheckCircleOutlined /> Giao thành công
                          </Tooltip>
                        </Button>
                        <Button
                          danger
                          onClick={async () => {
                            try {
                              const success = await updateOrderStatus(selectedOrder.id, { status: 7, deliveryCode: order_code });
                              if (success) {
                                message.success("Đã cập nhật trạng thái đơn hàng");
                                await getOrderById(id);
                              }
                            } catch (error) {
                              message.error("Không thể cập nhật trạng thái đơn hàng");
                            }
                          }}
                        >
                          <Tooltip title="Giao thất bại">
                            <CloseCircleOutlined /> Giao thất bại
                          </Tooltip>
                        </Button>
                      </Space>
                    )}
                    {selectedOrder.status === "7" && (
                      <Button
                        type="primary"
                        onClick={async () => {
                          try {
                            const success = await updateOrderStatus(selectedOrder.id, { status: 8, deliveryCode: order_code });
                            if (success) {
                              message.success("Đã cập nhật trạng thái đơn hàng");
                              await getOrderById(id);
                            }
                          } catch (error) {
                            message.error("Không thể cập nhật trạng thái đơn hàng");
                          }
                        }}
                      >
                        <Tooltip title="Giao lại">
                          <CheckCircleOutlined /> Giao lại
                        </Tooltip>
                      </Button>
                    )}
                  </div>
                </div>
              </Col>
              <Col span={12}></Col>
            </Row>

            <Divider />

            {/* Trạng thái đơn hàng */}
            <div className="order-status-tracker">
              <Title level={5}>Trạng thái đơn hàng</Title>
              <Steps
                direction="vertical"
                current={getCurrentStep(selectedOrder.status)}
                status={
                  selectedOrder.status === "3" ||
                  selectedOrder.status === "4" ||
                  selectedOrder.status === "5" ||
                  selectedOrder.status === "7"
                    ? "error"
                    : selectedOrder.status === "9"
                    ? "finish"
                    : "process"
                }
                className="order-steps"
                progressDot
              >
                <Step
                  title="Chờ xử lý"
                  description={
                    <div className="step-description">
                      <p>Đơn hàng đang chờ xác nhận</p>
                      {selectedOrder.status === "0" && (
                        <p className="step-time">
                          {new Date(selectedOrder.creationDate).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  }
                  icon={<ShoppingOutlined style={{ fontSize: '24px' }} />}
                />
                <Step
                  title="Đã xác nhận"
                  description={
                    <div className="step-description">
                      <p>Đơn hàng đã được xác nhận và đang xử lý</p>
                      {(selectedOrder.status === "1" || selectedOrder.status === "2") && (
                        <p className="step-time">
                          {new Date(selectedOrder.updatedDate || selectedOrder.creationDate).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  }
                  icon={<CheckCircleOutlined style={{ fontSize: '24px' }} />}
                />
                <Step
                  title="Đang giao hàng"
                  description={
                    <div className="step-description">
                      <p>Đơn hàng đang được giao</p>
                      {(selectedOrder.status === "6" || selectedOrder.status === "8") && (
                        <p className="step-time">
                          {new Date(selectedOrder.updatedDate || selectedOrder.creationDate).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  }
                  icon={<TruckOutlined style={{ fontSize: '24px' }} />}
                />
                <Step
                  title="Đã giao hàng"
                  description={
                    <div className="step-description">
                      <p>Đơn hàng đã được giao thành công</p>
                      {selectedOrder.status === "9" && (
                        <p className="step-time">
                          {new Date(selectedOrder.updatedDate || selectedOrder.creationDate).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  }
                  icon={<CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
                />
              </Steps>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetail;
