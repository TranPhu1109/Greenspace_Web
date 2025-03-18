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
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Alert,
} from "antd";
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ShoppingOutlined,
  TruckOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  MailOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import useOrderStore from "../../../stores/orderStore";
import "./OrderDetail.scss";
import { Tooltip } from "antd";

const { Title, Text } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [form] = Form.useForm();

  const {
    selectedOrder,
    getOrderById,
    isLoading,
    error,
    updatePaymentStatus,
    updateOrderStatus,
  } = useOrderStore();

  useEffect(() => {
    getOrderById(id);
  }, [id, getOrderById]);

  const handleBack = () => {
    navigate("/staff/orders");
  };

  const handleUpdatePaymentStatus = async (values) => {
    try {
      const success = await updatePaymentStatus(
        id,
        values.status,
        values.paymentDate
          ? dayjs(values.paymentDate).format("DD/MM/YYYY")
          : null
      );

      if (success) {
        message.success("Cập nhật trạng thái thanh toán thành công");
        setPaymentModalVisible(false);
        // Refresh order data
        await getOrderById(id);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật trạng thái thanh toán");
    }
  };

  // Thêm hàm xử lý chấp nhận/từ chối đơn hàng
  const handleAcceptOrder = async () => {
    try {
      const success = await updateOrderStatus(id, "đã xác nhận");
      if (success) {
        message.success("Đã xác nhận đơn hàng thành công");
        await getOrderById(id);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi xác nhận đơn hàng");
    }
  };

  const handleRejectOrder = async () => {
    try {
      const success = await updateOrderStatus(id, "đơn bị từ chối");
      if (success) {
        message.success("Đã từ chối đơn hàng");
        await getOrderById(id);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi từ chối đơn hàng");
    }
  };

  // Hàm tạo chữ cái đầu tiên cho avatar
  const getAvatarText = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Hàm lấy màu cho trạng thái đơn hàng
  const getStatusColor = (status) => {
    switch (status) {
      case "đã giao hàng":
        return "green";
      case "đang giao hàng":
        return "blue";
      case "đã giao cho đơn vị vận chuyển":
        return "cyan";
      case "đã xác nhận":
        return "processing";
      case "chờ xác nhận":
        return "warning";
      case "đơn bị từ chối":
      case "đã hủy":
        return "red";
      default:
        return "default";
    }
  };

  // Hàm lấy màu cho trạng thái thanh toán
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "đã thanh toán":
        return "green";
      case "chưa thanh toán":
        return "gold";
      case "COD":
        return "blue";
      case "Banking":
        return "green";
      default:
        return "default";
    }
  };

  // Hàm lấy bước hiện tại trong quy trình đơn hàng
  const getCurrentStep = (status) => {
    if (!selectedOrder) return 0;

    switch (status) {
      case "đã giao hàng":
        return 3;
      case "đang giao hàng":
      case "đã giao cho đơn vị vận chuyển":
        return 2;
      case "đã xác nhận":
        return 1;
      case "chờ xác nhận":
        return 0;
      default:
        return 0;
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : "";
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "product",
      key: "product",
      render: (text) => (
        <div className="product-cell">
          <div className="product-name">{text}</div>
        </div>
      ),
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

  if (error) {
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

  // Kiểm tra xem có thể cập nhật trạng thái hay không
  const canUpdateStatus = (status) => {
    return (
      status !== "đã hủy" &&
      status !== "đơn bị từ chối" &&
      status !== "đã giao hàng"
    );
  };

  // Kiểm tra xem có thể hủy đơn hàng hay không
  const canCancelOrder = (status) => {
    return (
      status !== "đã hủy" &&
      status !== "đơn bị từ chối" &&
      status !== "đã giao hàng"
    );
  };

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

  // Lấy thông tin đơn hàng
  const {
    orderNumber,
    customer = {}, // Thêm giá trị mặc định là đối tượng rỗng
    orderDate,
    orderStatus,
    details = [],
    payment,
  } = selectedOrder;

  // Tính tổng tiền
  const subtotal =
    details.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    ) || 0;
  const shippingFee = 0; // Giả sử phí vận chuyển là 0 nếu không có trong API
  const discount = 0; // Giả sử giảm giá là 0 nếu không có trong API
  const total = subtotal + shippingFee - discount;

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
          <Title level={4}>Chi tiết đơn hàng #{orderNumber}</Title>
          {orderStatus === "chờ xác nhận" && (
            <Alert
              message="Đơn hàng đang chờ xác nhận"
              description="Vui lòng xem xét và xác nhận hoặc từ chối đơn hàng này."
              type="warning"
              showIcon
              // style={{ width: "100%" }}
              // className="ml-4"
            />
          )}
        </div>
      </Card>

      <Row gutter={16} className="order-content">
        <Col xs={24} lg={16}>
          {/* Thông tin đơn hàng */}
          <Card
            title="Thông tin đơn hàng"
            className="order-info-card"
            style={{ marginBottom: 16 }}
          >
            <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical" bordered>
              <Descriptions.Item
                label={
                  <span style={{ fontWeight: "bold" }}>
                    <UserOutlined /> Khách hàng
                  </span>
                }
              >
                {customer.name}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ fontWeight: "bold" }}>
                    <MailOutlined /> Email
                  </span>
                }
              >
                {customer.email}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ fontWeight: "bold" }}>
                    <PhoneOutlined /> Số điện thoại
                  </span>
                }
              >
                {customer.phone}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ fontWeight: "bold" }}>
                    <CalendarOutlined /> Ngày đặt hàng
                  </span>
                }
              >
                {orderDate}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ fontWeight: "bold" }}>
                    <EnvironmentOutlined /> Địa chỉ giao hàng
                  </span>
                }
              >
                {customer.address}
              </Descriptions.Item>
            </Descriptions>
        
        <Divider />
        
            <div className="order-items">
              <Title level={5}>Sản phẩm</Title>
        <Table 
                dataSource={details}
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
                      {discount > 0 && (
              <Table.Summary.Row>
                          <Table.Summary.Cell
                            colSpan={3}
                            className="summary-label"
                          >
                            Giảm giá
                </Table.Summary.Cell>
                          <Table.Summary.Cell align="right">
                            -{discount.toLocaleString("vi-VN")}đ
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
          {/* Thông tin thanh toán */}
          <Card title="Thông tin thanh toán" style={{ marginBottom: "10px" }}>
            <Descriptions column={1}>
              <Descriptions.Item
                label={
                  <span style={{ fontWeight: "bold" }}>
                    <CreditCardOutlined /> Phương thức thanh toán
                  </span>
                }
              >
                <Tag color={getPaymentStatusColor(payment?.method)}>
                  {capitalizeFirstLetter(payment?.method || "N/A")}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ fontWeight: "bold" }}>
                    <DollarOutlined /> Trạng thái thanh toán
                  </span>
                }
              >
                <Space>
                  <Tag color={getPaymentStatusColor(payment?.status)}>
                    {capitalizeFirstLetter(
                      payment?.status || "Chưa thanh toán"
                    )}
                  </Tag>
                </Space>
              </Descriptions.Item>
              {payment?.status === "đã thanh toán" && payment.date && (
                <Descriptions.Item
                  label={
                    <span style={{ fontWeight: "bold" }}>
                      <CalendarOutlined /> Ngày thanh toán
                    </span>
                  }
                >
                  <Space>
                    {payment.date}
                    {/* <Tag color={getPaymentStatusColor(payment?.status)}>
                    {capitalizeFirstLetter(
                      payment?.status || "Chưa thanh toán"
                    )}
                  </Tag> */}
                    {/* {payment?.status === "đã thanh toán" && payment.date && ( */}
                    {/* <span style={{ fontWeight: "bold" }}> */}
                    {/* Ngày thanh toán: {payment.date} */}
                    {/* </span> */}
                    {/* )} */}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Button
              type="primary"
              onClick={() => setPaymentModalVisible(true)}
              style={{ marginTop: 16 }}
            >
              Cập nhật trạng thái thanh toán
            </Button>
          </Card>
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
                  <Tag
                    style={{ fontSize: "14px" }}
                    color={
                      orderStatus === "đơn bị từ chối" ||
                      orderStatus === "đã hủy"
                        ? "red"
                        : orderStatus === "đã giao hàng"
                        ? "green"
                        : "gold"
                    }
                  >
                    {capitalizeFirstLetter(orderStatus || "Đang xử lý")}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                {orderStatus === "chờ xác nhận" && (
                  <>
                    <Button
                      type="primary"
                      onClick={handleAcceptOrder}
                      style={{ marginRight: 10 }}
                    >
                      <Tooltip title="Xác nhận">
                        <CheckCircleOutlined />
                      </Tooltip>
                    </Button>
                    <Button danger onClick={handleRejectOrder}>
                      <Tooltip title="Từ chối">
                        <CloseCircleOutlined />
                      </Tooltip>
                    </Button>
                  </>
                )}
              </Col>
            </Row>

            <Divider />

            {/* Trạng thái đơn hàng */}
            <div className="order-status-tracker">
              <Title level={5}>Trạng thái đơn hàng</Title>
              <Steps
                direction="vertical"
                current={getCurrentStep(orderStatus)}
                status={
                  orderStatus === "đơn bị từ chối" || orderStatus === "đã hủy"
                    ? "error"
                    : "process"
                }
                className="order-steps"
              >
                <Step
                  title="Chờ xác nhận"
                  description={
                    <div className="step-description">
                      <p>Đơn hàng đang chờ xác nhận</p>
                      {orderStatus === "chờ xác nhận" && (
                        <p className="text-gray-500">{orderDate}</p>
                      )}
                    </div>
                  }
                  icon={<ShoppingOutlined />}
                />
                <Step
                  title="Đã xác nhận"
                  description={
                    <div className="step-description">
                      <p>Đơn hàng đã được xác nhận</p>
                      {orderStatus === "đã xác nhận" && (
                        <p className="text-gray-500">{orderDate}</p>
                      )}
                    </div>
                  }
                  icon={<CheckCircleOutlined />}
                />
                <Step
                  title="Đang giao hàng"
                  description={
                    <div className="step-description">
                      <p>Đơn hàng đang được giao</p>
                      {(orderStatus === "đang giao hàng" ||
                        orderStatus === "đã giao cho đơn vị vận chuyển") && (
                        <p className="text-gray-500">{orderDate}</p>
                      )}
                    </div>
                  }
                  icon={<TruckOutlined />}
                />
                <Step
                  title="Đã giao hàng"
                  description={
                    <div className="step-description">
                      <p>Đơn hàng đã được giao thành công</p>
                      {orderStatus === "đã giao hàng" && (
                        <p className="text-gray-500">{orderDate}</p>
                      )}
                    </div>
                  }
                  icon={<CheckCircleOutlined />}
                />
              </Steps>
            </div>
      </Card>
        </Col>
      </Row>

      {/* Modal cập nhật trạng thái thanh toán */}
      <Modal
        title="Cập nhật trạng thái thanh toán"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
      >
        <Form
          onFinish={handleUpdatePaymentStatus}
          initialValues={{
            status: payment?.status || "chưa thanh toán",
            paymentDate: payment?.date
              ? dayjs(payment.date, "DD/MM/YYYY")
              : null,
          }}
        >
          <Form.Item
            name="status"
            label="Trạng thái thanh toán"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn trạng thái thanh toán",
              },
            ]}
          >
            <Select>
              <Option value="đã thanh toán">Đã thanh toán</Option>
              <Option value="chưa thanh toán">Chưa thanh toán</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.status !== currentValues.status
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("status") === "đã thanh toán" ? (
                <Form.Item
                  name="paymentDate"
                  label="Ngày thanh toán"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn ngày thanh toán",
                    },
                  ]}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày thanh toán"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button onClick={() => setPaymentModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderDetail; 
