import React, { useState } from "react";
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
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  templateOrders,
  orderStatuses,
  customizableMaterials,
} from "../mockData/templateOrders";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import { Alert } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const TemplateOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(templateOrders.find((o) => o.id === id));
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] =
    useState(false);
  const [isUpdateMaterialModalVisible, setIsUpdateMaterialModalVisible] =
    useState(false);
  const [isUpdatePaymentModalVisible, setIsUpdatePaymentModalVisible] =
    useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [form] = Form.useForm();
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);

  if (!order) {
    return (
      <Card>
        <Empty description="Không tìm thấy thông tin đơn hàng" />
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </Card>
    );
  }

  // Tính toán tiến độ thanh toán
  const paymentProgress = {
    deposit: order.payments?.deposit?.status === "paid",
    final: order.payments?.final?.status === "paid",
  };

  // Tính toán tổng chi phí vật liệu
  const calculateMaterialCosts = () => {
    const originalTotal = order.selectedMaterials.reduce(
      (total, item) => total + item.originalPrice * item.quantity,
      0
    );
    const selectedTotal = order.selectedMaterials.reduce(
      (total, item) => total + item.selectedPrice * item.quantity,
      0
    );
    const difference = selectedTotal - originalTotal;

    return { originalTotal, selectedTotal, difference };
  };

  // Columns cho bảng vật liệu
  const materialsColumns = [
    // {
    //   title: 'Vật liệu gốc',
    //   dataIndex: 'original',
    //   key: 'original',
    //   width: 200,
    //   render: (text, record) => (
    //     <Space direction="vertical" size="small">
    //       <span>{text}</span>
    //       <span style={{ color: '#8c8c8c', fontSize: '13px' }}>
    //         {record.originalPrice.toLocaleString('vi-VN')}đ/{record.unit}
    //       </span>
    //     </Space>
    //   )
    // },
    {
      title: "Vật liệu đã chọn",
      dataIndex: "selected",
      key: "selected",
      width: 200,
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <span
          // style={{ color: text !== record.original ? '#1890ff' : 'inherit' }}
          >
            {text}
          </span>
          <span style={{ color: "#8c8c8c", fontSize: "13px" }}>
            {record.selectedPrice.toLocaleString("vi-VN")}đ/{record.unit}
          </span>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (value, record) => `${value} ${record.unit}`,
    },
    {
      title: "Thành tiền",
      key: "totalPrice",
      width: 200,
      render: (_, record) => {
        const originalTotal = record.originalPrice * record.quantity;
        const selectedTotal = record.selectedPrice * record.quantity;
        const difference = selectedTotal - originalTotal;

        return (
          <Space direction="vertical" size="small">
            <span>{selectedTotal.toLocaleString("vi-VN")}đ</span>
            {/* {difference !== 0 && (
              <span
                style={{
                  color: difference > 0 ? "#f5222d" : "#52c41a",
                  fontSize: "13px",
                }}
              >
                {difference > 0 ? "+" : ""}
                {difference.toLocaleString("vi-VN")}đ
              </span>
            )} */}
          </Space>
        );
      },
    },
    // {
    //   title: "Thao tác",
    //   key: "action",
    //   width: 100,
    //   fixed: "right",
    //   render: (_, record) => (
    //     <Button type="link" onClick={() => handleUpdateMaterial(record)}>
    //       Cập nhật
    //     </Button>
    //   ),
    // },
  ];

  const handleUpdateStatus = (values) => {
    const updatedOrder = {
      ...order,
      status: values.status,
      timeline: [
        ...order.timeline,
        {
          date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          status: values.status,
          description: `Cập nhật trạng thái: ${
            orderStatuses[values.status].label
          }`,
        },
      ],
    };
    setOrder(updatedOrder);
    message.success("Cập nhật trạng thái thành công");
    setIsUpdateStatusModalVisible(false);
  };

  const handleUpdateMaterial = (material) => {
    form.setFieldsValue(material);
    setIsUpdateMaterialModalVisible(true);
  };

  const handleMaterialUpdate = (values) => {
    // Xử lý cập nhật vật liệu
    message.success("Cập nhật vật liệu thành công");
    setIsUpdateMaterialModalVisible(false);
  };

  const handleUpdatePayment = (paymentType) => {
    setSelectedPayment(paymentType);
    setIsUpdatePaymentModalVisible(true);
  };

  const handlePaymentUpdate = (values) => {
    if (!selectedPayment) return;

    const updatedOrder = {
      ...order,
      payments: {
        ...order.payments,
        [selectedPayment]: {
          ...order.payments[selectedPayment],
          status: "paid",
          date: dayjs().format("YYYY-MM-DD"),
        },
      },
      timeline: [
        ...order.timeline,
        {
          date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          status: `${selectedPayment}_paid`,
          description: `Đã thanh toán ${
            selectedPayment === "deposit" ? "đặt cọc" : "số tiền còn lại"
          }`,
        },
      ],
    };

    setOrder(updatedOrder);
    message.success("Cập nhật thanh toán thành công");
    setIsUpdatePaymentModalVisible(false);
  };

  const handleAssignOrder = () => {
    setIsUpdateStatusModalVisible(true);
  };

  const handleRejectOrder = () => {
    setIsRejectModalVisible(true);
  };

  const handleRejectSubmit = (values) => {
    // Xử lý từ chối đơn
    const updatedOrder = {
      ...order,
      status: "cancelled",
      timeline: [
        ...order.timeline,
        {
          date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          status: "cancelled",
          description: `Đơn hàng bị từ chối: ${values.reason}`,
        },
      ],
    };

    message.success("Đã từ chối đơn hàng");
    setIsRejectModalVisible(false);
  };

  return (
    <div className="template-order-detail">
      {/* <Card> */}
      <div
        className="header-actions"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {/* Nút quay lại */}
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>

        {/* Alert thông báo */}
        {order.status === "pending" && (
          <Alert
            message="Đơn hàng đang chờ xác nhận"
            type="warning"
            showIcon
            style={{
              flex: 1, // Alert mở rộng theo chiều ngang
              height: 33, // Đồng bộ chiều cao với nút
              display: "flex",
              alignItems: "center",
              padding: "0 16px", // Tạo khoảng cách nội dung
            }}
          />
        )}

        {/* Hai nút hành động */}
        {order.status === "pending" && (
          <>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleAssignOrder}
            >
              Nhận đơn
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleRejectOrder}
            >
              Từ chối đơn
            </Button>
          </>
        )}
      </div>

      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card title="Thông tin đơn hàng">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã đơn">
                {order.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge
                  status={orderStatuses[order.status]?.color || "default"}
                  text={orderStatuses[order.status]?.label || "Không xác định"}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Mẫu thiết kế">
                {order.templateName}
              </Descriptions.Item>
              <Descriptions.Item label="Diện tích mẫu thiết kế">
                {order.area}m²
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng" span={2}>
                <Space direction="vertical">
                  <div>
                    <UserOutlined /> {order.customerInfo.name}
                  </div>
                  <div>
                    <PhoneOutlined /> {order.customerInfo.phone}
                  </div>
                  <div>
                    <MailOutlined /> {order.customerInfo.email}
                  </div>
                  <div>
                    <HomeOutlined /> {order.customerInfo.address}
                  </div>
                </Space>
              </Descriptions.Item>
              {/* <Descriptions.Item label="Designer">{order.designer || 'Chưa phân công'}</Descriptions.Item> */}
              <Descriptions.Item label="Ngày tạo">
                {dayjs(order.orderDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Thông tin thanh toán" className="payment-card">
            <Statistic
              title="Tổng giá trị đơn hàng"
              value={order.prices.totalCost}
              suffix="đ"
              groupSeparator=","
            />
            <Divider />
            <Steps
              direction="vertical"
              current={Object.values(paymentProgress).filter(Boolean).length}
              items={[
                {
                  title: "Đặt cọc (50%)",
                  description: (
                    <>
                      <div>
                        {order.payments.deposit.amount.toLocaleString("vi-VN")}đ
                      </div>
                      <Tag
                        color={paymentProgress.deposit ? "success" : "default"}
                      >
                        {paymentProgress.deposit
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </Tag>
                      {!paymentProgress.deposit && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => handleUpdatePayment("deposit")}
                        >
                          Cập nhật
                        </Button>
                      )}
                    </>
                  ),
                },
                {
                  title: "Thanh toán còn lại",
                  description: (
                    <>
                      <div>
                        {order.payments.final.amount.toLocaleString("vi-VN")}đ
                      </div>
                      <Tag color={paymentProgress.final ? "success" : "gold"}>
                        {paymentProgress.final
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </Tag>
                      {!paymentProgress.final && paymentProgress.deposit && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => handleUpdatePayment("final")}
                        >
                          Cập nhật
                        </Button>
                      )}
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Danh sách vật liệu */}
      <Card title="Chi tiết vật liệu">
        <Table
          columns={materialsColumns}
          dataSource={order.selectedMaterials}
          rowKey="category"
          pagination={false}
          scroll={{ x: 1000 }}
        />
        <Divider />
        <Row justify="end">
          <Col>
            <Space
              direction="vertical"
              size="middle"
              style={{ textAlign: "right" }}
            >
              <Statistic
                title="Tổng chi phí vật liệu gốc"
                value={calculateMaterialCosts().originalTotal}
                suffix="đ"
                groupSeparator=","
              />
              <Statistic
                title="Tổng chi phí sau điều chỉnh"
                value={calculateMaterialCosts().selectedTotal}
                suffix="đ"
                groupSeparator=","
                valueStyle={{ color: "#1890ff" }}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập nhật trạng thái"
        open={isUpdateStatusModalVisible}
        onCancel={() => setIsUpdateStatusModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleUpdateStatus}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              {Object.entries(orderStatuses).map(([key, { label }]) => (
                <Option key={key} value={key}>
                  {label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* <Form.Item
            name="note"
            label="Ghi chú"
          >
            <TextArea rows={4} />
          </Form.Item> */}
          <Form.Item className="text-right">
            <Space>
              <Button onClick={() => setIsUpdateStatusModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal cập nhật vật liệu */}
      <Modal
        title="Cập nhật vật liệu"
        open={isUpdateMaterialModalVisible}
        onCancel={() => setIsUpdateMaterialModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleMaterialUpdate}>
          <Form.Item
            name="selected"
            label="Vật liệu"
            rules={[{ required: true, message: "Vui lòng chọn vật liệu" }]}
          >
            <Select>
              {Object.entries(customizableMaterials).map(([key, material]) =>
                material.options.map((option) => (
                  <Option key={option.name} value={option.name}>
                    {option.name} - {option.price.toLocaleString("vi-VN")}đ/
                    {option.unit}
                  </Option>
                ))
              )}
            </Select>
          </Form.Item>
          <Form.Item className="text-right">
            <Space>
              <Button onClick={() => setIsUpdateMaterialModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cập nhật thanh toán"
        open={isUpdatePaymentModalVisible}
        onCancel={() => setIsUpdatePaymentModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handlePaymentUpdate}>
          <Form.Item
            name="paymentMethod"
            label="Phương thức thanh toán"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn phương thức thanh toán",
              },
            ]}
          >
            <Select>
              <Option value="cash">Tiền mặt</Option>
              <Option value="transfer">Chuyển khoản</Option>
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item className="text-right">
            <Space>
              <Button onClick={() => setIsUpdatePaymentModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Xác nhận
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal từ chối đơn */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
            Từ chối đơn thiết kế
          </Space>
        }
        open={isRejectModalVisible}
        onCancel={() => setIsRejectModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleRejectSubmit}>
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item className="text-right">
            <Space>
              <Button onClick={() => setIsRejectModalVisible(false)}>
                Hủy
              </Button>
              <Button danger type="primary" htmlType="submit">
                Xác nhận từ chối
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TemplateOrderDetail;
