import React from "react";
import { Descriptions, Steps, Table, Typography, Divider } from "antd";
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CarOutlined,
  InboxOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  TagOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { BsCashStack } from "react-icons/bs";
import { MdOutlinePayments } from "react-icons/md";
import { Tag } from "antd";

const { Step } = Steps;
const { Text } = Typography;

const OrderExpandedRow = ({ order }) => {
  // Xác định bước hiện tại dựa trên trạng thái đơn hàng
  const getCurrentStep = (status) => {
    switch (status) {
      case "chờ xác nhận":
        return 0;
      case "đã xác nhận":
        return 1;
      case "đã giao cho đơn vị vận chuyển":
      case "đang giao hàng":
        return 2;
      case "đã giao hàng":
        return 3;
      case "đơn bị từ chối":
      case "đã hủy":
        return -1; // Trạng thái đặc biệt
      default:
        return 0;
    }
  };

  const currentStep = getCurrentStep(order.orderStatus);

  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : "";
  };

  // Tính tổng tiền đơn hàng
  const calculateTotal = () => {
    return order.details.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    );
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price) => `${Number(price).toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Thành tiền",
      key: "total",
      align: "right",
      render: (_, record) =>
        `${(Number(record.price) * record.quantity).toLocaleString("vi-VN")} đ`,
    },
  ];

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="mb-6">
        <Steps
          current={currentStep}
          status={
            order.orderStatus === "đơn bị từ chối" ||
            order.orderStatus === "đã hủy"
              ? "error"
              : "process"
          }
          size="small"
          className="max-w-4xl mx-auto"
        >
          <Step
            title="Đặt hàng"
            description="Đơn hàng đã được tạo"
            icon={<ShoppingCartOutlined />}
          />
          <Step
            title="Xác nhận"
            description="Đơn hàng đã được xác nhận"
            icon={<CheckCircleOutlined />}
          />
          <Step
            title="Vận chuyển"
            description="Đơn hàng đang được giao"
            icon={<CarOutlined />}
          />
          <Step
            title="Hoàn thành"
            description="Đơn hàng đã giao thành công"
            icon={<InboxOutlined />}
          />
        </Steps>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Descriptions
            title="Thông tin khách hàng"
            bordered
            size="middle"
            column={{ xs: 2, sm: 3 }}
            className="bg-white rounded-md"
          >
            <Descriptions.Item
              label={
                <span style={{ fontWeight: "bold" }}>
                  <UserOutlined /> Khách hàng
                </span>
              }
            >
              {order.customer.name}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span style={{ fontWeight: "bold" }}>
                  <MailOutlined /> Email
                </span>
              }
            >
              {order.customer.email}
            </Descriptions.Item>
            <Descriptions.Item 
            label={
                <span style={{ fontWeight: "bold" }}>
                  <PhoneOutlined/> Số điện thoại
                </span>
              }
            >
              {order.customer.phone}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <span style={{ fontWeight: "bold" }}>
                  <MdOutlinePayments /> Phương thức thanh toán
                </span>
              }
            >
              <Tag
                color={order.payment.method === "Banking" ? "green" : "blue"}
              >
                {capitalizeFirstLetter(order.payment.method)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <span style={{ fontWeight: "bold" }}>
                  <BsCashStack /> Trạng thái thanh toán
                </span>
              }
            >
              <Tag
                color={
                  order.payment.status === "đã thanh toán" ? "green" : "gold"
                }
              >
                {capitalizeFirstLetter(order.payment.status)}
              </Tag>
            </Descriptions.Item>
            {/* {order.payment.date && ( */}
            <Descriptions.Item 
              label={
                <span style={{ fontWeight: "bold" }}>
                  <CalendarOutlined /> Ngày thanh toán
                </span>
              }
            >
              {order.payment.date || 'Chưa thanh toán'}
            </Descriptions.Item>
            {/* )} */}
            <Descriptions.Item 
            label={
                <span style={{ fontWeight: "bold" }}>
                  <EnvironmentOutlined /> Địa chỉ
                </span>
              }
            >
              {order.customer.address}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* <div>
          <Descriptions
            title="Thông tin thanh toán"
            bordered
            size="small"
            column={1}
            className="bg-white rounded-md"
          >
            <Descriptions.Item label="Phương thức thanh toán">
              <Tag color={order.payment.method === "Banking" ? "green" : "blue"}>
                {capitalizeFirstLetter(order.payment.method)  }
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái thanh toán">
              <Tag color={order.payment.status === "đã thanh toán" ? "green" : "gold"}>
                {capitalizeFirstLetter(order.payment.status)}
              </Tag>
            </Descriptions.Item>
            {order.payment.date && (
              <Descriptions.Item label="Ngày thanh toán">
                {order.payment.date}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Tổng tiền">
              <Text strong className="text-red-500">
                {calculateTotal().toLocaleString("vi-VN")} đ
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </div> */}
      </div>

      <Divider orientation="left">Chi tiết đơn hàng</Divider>

      <Table
        columns={columns}
        dataSource={order.details}
        pagination={false}
        rowKey={(record) => `${record.product}-${Math.random()}`}
        className="bg-white rounded-md"
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3} className="text-right">
                <Text strong>Tổng cộng:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} className="text-right">
                <Text strong className="text-red-500">
                  {calculateTotal().toLocaleString("vi-VN")} đ
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
};

export default OrderExpandedRow;
