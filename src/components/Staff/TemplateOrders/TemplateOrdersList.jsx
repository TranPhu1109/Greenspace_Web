import React, { useState } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Row,
  Col,
  Select,
  DatePicker,
  Tooltip,
  Tag,
  Badge,
  Progress,
  Modal,
  Form,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { templateOrders, orderStatuses } from "../mockData/templateOrders";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { Popover } from "antd";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const TemplateOrdersList = () => {
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const navigate = useNavigate();
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);

  const getPaymentStatus = (payments, totalCost) => {
    const depositRequired = totalCost * 0.5; // 50% tổng giá trị
    const depositPaid =
      payments.deposit?.status === "paid" ? payments.deposit.amount : 0;
    const finalPaid =
      payments.final?.status === "paid" ? payments.final.amount : 0;

    if (finalPaid > 0) {
      return {
        status: "completed",
        text: "Đã thanh toán đủ",
        color: "success",
        amount: totalCost,
      };
    }

    if (depositPaid >= depositRequired) {
      return {
        status: "deposit",
        text: "Đã đặt cọc",
        color: "processing",
        amount: depositPaid,
      };
    }

    return {
      status: "unpaid",
      text: "Chưa đặt cọc",
      color: "error",
      amount: 0,
    };
  };

  const handleViewDetail = (id) => {
    navigate(`/staff/design-orders/template-orders/${id}`);
  };

  const handleAssignOrder = (order) => {
    setSelectedOrder(order);
    setIsAssignModalVisible(true);
  };

  const handleAssignSubmit = (values) => {
    // Xử lý nhận đơn
    const updatedOrder = {
      ...selectedOrder,
      status: "processing",
      designer: values.designer,
      timeline: [
        ...selectedOrder.timeline,
        {
          date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          status: "assigned",
          description: `Đơn hàng được phân công cho designer ${values.designer}`,
        },
      ],
    };

    // Cập nhật state và gọi API
    message.success("Nhận đơn thành công");
    setIsAssignModalVisible(false);
  };

  const handleRejectOrder = (order) => {
    setSelectedOrder(order);
    setIsRejectModalVisible(true);
  };

  const handleRejectSubmit = (values) => {
    // Xử lý từ chối đơn
    const updatedOrder = {
      ...selectedOrder,
      status: "cancelled",
      timeline: [
        ...selectedOrder.timeline,
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

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: "Mẫu thiết kế",
      dataIndex: "templateName",
      key: "templateName",
    },
    {
      title: "Khách hàng",
      dataIndex: ["customerInfo", "name"],
      key: "customerName",
      render: (text, record) => (
        <Tooltip
          title={
            <div>
              <p>
                <UserOutlined /> {record.customerInfo.name}
              </p>
              <p>
                <PhoneOutlined /> {record.customerInfo.phone}
              </p>
              <p>
                <MailOutlined /> {record.customerInfo.email}
              </p>
            </div>
          }
        >
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = orderStatuses[status];
        return <Badge status={statusConfig.color} text={statusConfig.label} />;
      },
    },
    {
      title: "Thanh toán",
      key: "payment",
      render: (_, record) => {
        const totalCost = record.prices.totalCost;
        const depositRequired = totalCost * 0.5;
        const paymentStatus = getPaymentStatus(record.payments, totalCost);

        return (
          <Space direction="vertical" size="small">
            <Badge
              status={paymentStatus.color}
              text={
                <Tooltip
                  title={
                    <div>
                      <p>Tổng tiền: {totalCost.toLocaleString("vi-VN")}đ</p>
                      <p>
                        Đặt cọc (50%): {depositRequired.toLocaleString("vi-VN")}
                        đ
                      </p>
                      <p>
                        Đã thanh toán:{" "}
                        {paymentStatus.amount.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  }
                >
                  <span>{paymentStatus.text}</span>
                </Tooltip>
              }
            />
            <div style={{ fontSize: "13px" }}>
              <span
                style={{
                  color:
                    paymentStatus.color === "success" ? "#52c41a" : "#1890ff",
                }}
              >
                {paymentStatus.amount.toLocaleString("vi-VN")}đ
              </span>
              <span style={{ color: "#8c8c8c" }}>
                /{totalCost.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: ["prices", "totalCost"],
      key: "totalCost",
      render: (value) => (
        <span
        // style={{ color: '#1890ff' }}
        >
          {value.toLocaleString("vi-VN")} đ
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <Popover
          placement="bottomLeft"
          trigger="click"
          content={
            <div className="flex flex-col gap-1">
              <Button
                type="default"
                style={{
                  backgroundColor: "white",
                  width: "120px",
                  marginBottom: "5px",
                  justifyContent: "flex-start",
                }}
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record.id)}
              >
                Chi tiết
              </Button>
              <Button
                type="primary"
                style={{
                  width: "120px",
                  marginBottom: "5px",
                  justifyContent: "flex-start",
                }}
                disabled={record.status !== "pending"}
                icon={<CheckCircleOutlined />}
                onClick={() => handleAssignOrder(record)}
              >
                Nhận đơn
              </Button>
              <Button
                type="primary"
                danger
                style={{
                  width: "120px",
                  marginBottom: "5px",
                  justifyContent: "flex-start",
                }}
                disabled={record.status !== "pending"}
                icon={<CloseCircleOutlined />}
                onClick={() => handleRejectOrder(record)}
              >
                Từ chối
              </Button>
            </div>
          }
        >
          <MoreOutlined style={{ fontSize: "20px", fontWeight: "bold" }} />
        </Popover>
      ),
    },
  ];

  return (
    <>
      <Card title="Danh sách đơn đặt theo mẫu">
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm đơn hàng"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Lọc theo trạng thái"
              allowClear
              onChange={(value) => setFilterStatus(value)}
            >
              {Object.entries(orderStatuses).map(([key, { label }]) => (
                <Option key={key} value={key}>
                  {label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={(dates) => setDateRange(dates)}
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={templateOrders}
          rowKey="id"
          // scroll={{ x: 1300 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
        />
      </Card>

      {/* <Modal
        title="Nhận đơn thiết kế"
        open={isAssignModalVisible}
        onCancel={() => setIsAssignModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleAssignSubmit}>
          <Form.Item
            name="designer"
            label="Designer"
            rules={[{ required: true, message: "Vui lòng chọn designer" }]}
          >
            <Select placeholder="Chọn designer">
              <Option value="Nguyễn Văn A">Nguyễn Văn A</Option>
              <Option value="Trần Thị B">Trần Thị B</Option>
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item className="text-right">
            <Space>
              <Button onClick={() => setIsAssignModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Xác nhận
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal> */}

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
    </>
  );
};

export default TemplateOrdersList;
