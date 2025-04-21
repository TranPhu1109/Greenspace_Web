import React, { use, useEffect } from "react";
import { Descriptions, Steps, Table, Typography, Divider } from "antd";
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CarOutlined,
  InboxOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  MoneyCollectOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import useProductStore from "@/stores/useProductStore";
import { MdOutlineLocalShipping } from "react-icons/md";

const { Step } = Steps;
const { Text } = Typography;

const OrderExpandedRow = ({ order }) => {
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  // Xác định bước hiện tại dựa trên trạng thái đơn hàng
  const getCurrentStep = (status) => {
    switch (status) {
      case "0":
        return 0; // Chờ xử lý
      case "1":
        return 1; // Đang xử lý
      case "2":
        return 1; // Đã xử lý
      case "3":
        return -1; // Đã hủy
      case "4":
        return -1; // Đã hoàn tiền
      case "5":
        return -1; // Đã hoàn tiền xong
      case "6":
        return 2; // Đã lấy hàng và giao hàng
      case "7":
        return 2; // Giao hàng thất bại
      case "8":
        return 2; // Giao lại
      case "9":
        return 3; // Đã giao hàng thành công
      default:
        return 0;
    }
  };

  const currentStep = getCurrentStep(order.status);
  const isErrorStatus = ["3", "4", "5", "7"].includes(order.status);
  console.log(order);
  console.log(currentStep);

  // Tính tổng tiền đơn hàng (bao gồm phí vận chuyển nếu có)
  const calculateTotal = () => {
    if (!order || !order.orderDetails || !Array.isArray(order.orderDetails)) {
      return 0;
    }
    const subtotal = order.orderDetails.reduce(
      (total, item) => total + Number(item?.price || 0) * (item?.quantity || 0),
      0
    );
    return subtotal;
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productId",
      key: "productId",
      render: (productId) => {
        const product = products.find((p) => p.id === productId);
        return product ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src={product.image.imageUrl}
              alt={product.name}
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <span>{product.name}</span>
          </div>
        ) : (
          "Sản phẩm không tồn tại"
        );
      },
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
          status={isErrorStatus ? "error" : "process"}
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
            size="small"
            column={{ xs: 2, sm: 3 }}
            className="bg-white rounded-md"
          >
            <Descriptions.Item
              label={
                <span style={{ fontWeight: "bold" }}>
                  <UserOutlined
                    style={{ marginRight: "4px", color: "green" }}
                  />{" "}
                  Khách hàng
                </span>
              }
            >
              {order.userName}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span style={{ fontWeight: "bold" }}>
                  <PhoneOutlined
                    style={{ marginRight: "4px", color: "green" }}
                  />{" "}
                  Số điện thoại
                </span>
              }
            >
              {order.phone}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span style={{ fontWeight: "bold" }}>
                  <CalendarOutlined
                    style={{ marginRight: "4px", color: "green" }}
                  />{" "}
                  Ngày đặt hàng
                </span>
              }
            >
              {new Date(order.creationDate).toLocaleString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span style={{ fontWeight: "bold" }}>
                  <MdOutlineLocalShipping style={{ marginRight: "4px", color: "green" }} />{" "}
                  Phí giao hàng
                </span>
              }
            >
              {order.shipPrice.toLocaleString("vi-VN")}đ
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span style={{ fontWeight: "bold" }}>
                  <MoneyCollectOutlined
                    style={{ marginRight: "4px", color: "green" }}
                  />{" "}
                  Tổng tiền
                </span>
              }
            >
              {order.totalAmount.toLocaleString("vi-VN")}đ
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span style={{ fontWeight: "bold" }}>
                  <TagsOutlined
                    style={{ marginRight: "4px", color: "green" }}
                  />{" "}
                  Mã vận đơn
                </span>
              }
            >
              {order.deliveryCode || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item
              span={3}
              label={
                <span style={{ fontWeight: "bold" }}>
                  <EnvironmentOutlined
                    style={{ marginRight: "4px", color: "green" }}
                  />{" "}
                  Địa chỉ
                </span>
              }
            >
              {order.address?.replace(/\|/g, ', ')}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>

      <Divider orientation="left">Chi tiết đơn hàng</Divider>

      <Table
        columns={columns}
        dataSource={order.orderDetails}
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
