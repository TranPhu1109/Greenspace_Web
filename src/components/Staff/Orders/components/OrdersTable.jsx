import React from "react";
import {
  Table,
  Space,
  Button,
  Tag,
  Tooltip,
  Modal,
  message,
  Steps,
} from "antd";
import {
  EyeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useOrderStore from "../../../../stores/orderStore";
import OrderExpandedRow from "./OrderExpandedRow";
import { Popover } from "antd";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";

const { Step } = Steps;
const { confirm } = Modal;

const OrdersTable = ({
  data,
  isLoading,
  expandedRowKeys,
  setExpandedRowKeys,
}) => {
  const navigate = useNavigate();
  const { updateOrderStatus } = useOrderStore();
  const { getBasePath } = useRoleBasedPath();

  const handleViewOrderDetail = (record) => {
    // navigate(`/staff/orders/${record.id}`);
    navigate(`${getBasePath()}/orders/${record.id}`);
  };

  const handleAcceptOrder = (e, record) => {
    e.stopPropagation();
    confirm({
      title: "Xác nhận nhận đơn hàng",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn nhận đơn hàng ${record.orderNumber} không?`,
      onOk: async () => {
        const success = await updateOrderStatus(record.id, "đã xác nhận");
        if (success) {
          message.success(`Đã nhận đơn hàng ${record.orderNumber}`);
        } else {
          message.error("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng");
        }
      },
    });
  };

  const handleRejectOrder = (e, record) => {
    e.stopPropagation();
    confirm({
      title: "Xác nhận từ chối đơn hàng",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn từ chối đơn hàng ${record.orderNumber} không?`,
      onOk: async () => {
        const success = await updateOrderStatus(record.id, "đơn bị từ chối");
        if (success) {
          message.success(`Đã từ chối đơn hàng ${record.orderNumber}`);
        } else {
          message.error("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng");
        }
      },
    });
  };

  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : "";
  };

  const expandedRowRender = (record) => {
    return <OrderExpandedRow order={record} />;
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: ["customer", "name"],
      key: "customerName",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.customer.name}</span>
          <span className="text-xs text-gray-500">{record.customer.phone}</span>
        </div>
      ),
    },
    {
      title: "Địa chỉ giao hàng",
      dataIndex: ["customer", "address"],
      key: "address",
      render: (_, record) => (
        <span className="text-xs text-gray-500">{record.customer.address}</span>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
    },
    {
      title: "Thanh toán",
      key: "payment",
      render: (_, record) => {
        const statusColor =
          record.payment.status === "đã thanh toán" ? "success" : "warning";
        const methodColor =
          record.payment.method === "COD" ? "processing" : "success";

        return (
          <div className="flex flex-row gap-1">
            <Tag color={statusColor}>
              {capitalizeFirstLetter(record.payment.status)}
            </Tag>
            <Tag color={methodColor}>
              {capitalizeFirstLetter(record.payment.method)}
            </Tag>
          </div>
        );
      },
    },
    // {
    //   title: "Thanh toán",
    //   dataIndex: ["payment", "status"],
    //   key: "paymentStatus",
    //   render: (status) => {
    //     const color = status === "đã thanh toán" ? "success" : "warning";
    //     return <Tag color={color}>{capitalizeFirstLetter(status)}</Tag>;
    //   },
    // },
    // {
    //   title: "Phương thức thanh toán",
    //   dataIndex: ["payment", "method"],
    //   key: "paymentMethod",
    //   render: (method) => {
    //     const color = method === "COD" ? "processing" : "success";
    //     return <Tag color={color}>{capitalizeFirstLetter(method)}</Tag>;
    //   },
    // },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => {
        let color;
        switch (status) {
          case "chờ xác nhận":
            color = "warning";
            break;
          case "đã xác nhận":
            color = "processing";
            break;
          case "đã giao cho đơn vị vận chuyển":
          case "đang giao hàng":
            color = "blue";
            break;
          case "đã giao hàng":
            color = "success";
            break;
          case "đơn bị từ chối":
          case "đã hủy":
            color = "error";
            break;
          default:
            color = "default";
        }

        return <Tag color={color}>{capitalizeFirstLetter(status)}</Tag>;
      },
    },

    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Popover
          placement="bottom"
          trigger="click"
          onClick={(e) => e.stopPropagation()}
          content={
            <div
              className="flex flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                type="default"
                style={{
                  backgroundColor: "beige",
                  marginBottom: "5px",
                  justifyContent: "flex-start",
                }}
                onClick={() => handleViewOrderDetail(record)}
                icon={<EyeOutlined />}
              >
                Xem chi tiết
              </Button>

              <Button
                type="primary"
                disabled={record.orderStatus !== "chờ xác nhận"}
                onClick={(e) => handleAcceptOrder(e, record)}
                style={{
                  marginBottom: "5px",
                  justifyContent: "flex-start",
                }}
                icon={<CheckCircleOutlined />}
              >
                Xác nhận
              </Button>
              <Button
                danger
                disabled={record.orderStatus !== "chờ xác nhận"}
                onClick={(e) => handleRejectOrder(e, record)}
                style={{
                  marginBottom: "5px",
                  justifyContent: "flex-start",
                }}
                icon={<CloseCircleOutlined />}
              >
                Từ chối
              </Button>

              <Button
                disabled={record.orderStatus !== "đã xác nhận"}
                type="dashed"
                style={{ backgroundColor: "darkgoldenrod", color: 'white', justifyContent: "flex-start" }}
                icon={<PrinterOutlined />}
              >
                In đơn
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
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      expandable={{
        expandedRowRender,
        expandRowByClick: true,
        expandedRowKeys,
        onExpand: (expanded, record) => {
          const keys = [...expandedRowKeys];
          if (expanded) {
            keys.push(record.id);
          } else {
            const index = keys.indexOf(record.id);
            if (index !== -1) {
              keys.splice(index, 1);
            }
          }
          setExpandedRowKeys(keys);
        },
      }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} của ${total} đơn hàng`,
      }}
      className="overflow-x-auto"
      loading={isLoading}
    />
  );
};

export default OrdersTable;
