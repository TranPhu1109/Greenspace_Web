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
import useShippingStore from "../../../../stores/useShippingStore";
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
  const { createShippingOrder } = useShippingStore();
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
      content: `Bạn có chắc chắn muốn nhận đơn hàng ${record.id} không?`,
      onOk: async () => {
        try {
          // Tạo đơn ship
          const shippingData = {
            toName: record.userName,
            toPhone: record.phone,
            toAddress: record.address,
            toProvince: record.province,
            toDistrict: record.district,
            toWard: record.ward,
            items: record.orderDetails.map(item => ({
              name: item.productName,
              code: item.productId,
              quantity: item.quantity
            }))
          };

          await createShippingOrder(shippingData);

          // Cập nhật trạng thái đơn hàng
          const success = await updateOrderStatus(record.id, "2");
          if (success) {
            message.success(`Đã nhận đơn hàng ${record.id}`);
          } else {
            throw new Error('Không thể cập nhật trạng thái đơn hàng');
          }
        } catch (error) {
          message.error(error.message || "Có lỗi xảy ra khi xử lý đơn hàng");
        }
      },
    });
  };

  const handleRejectOrder = (e, record) => {
    e.stopPropagation();
    confirm({
      title: "Xác nhận từ chối đơn hàng",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn từ chối đơn hàng ${record.id} không?`,
      onOk: async () => {
        const success = await updateOrderStatus(record.id, "5");
        if (success) {
          message.success(`Đã từ chối đơn hàng ${record.id}`);
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
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <span className="font-medium">
          #{text.substring(0, 8)}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "userName",
      key: "userName",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.userName}</span>
          <span className="text-xs text-gray-500">{record.phone}</span>
        </div>
      ),
    },
    {
      title: "Địa chỉ giao hàng",
      dataIndex: "address",
      key: "address",
      render: (text) => (
        <span className="text-xs text-gray-500">{text}</span>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
    },
    {
      title: "Tổng tiền",
      key: "totalAmount",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {record.totalAmount.toLocaleString("vi-VN")} đ
          </span>
          <span className="text-xs text-gray-500">
            Phí ship: {record.shipPrice.toLocaleString("vi-VN")} đ
          </span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color;
        switch (status) {
          case "1":
            color = "warning";
            status = "Chờ xác nhận";
            break;
          case "2":
            color = "processing";
            status = "Đã xác nhận";
            break;
          case "3":
            color = "blue";
            status = "Đang giao hàng";
            break;
          case "4":
            color = "success";
            status = "Đã giao hàng";
            break;
          case "5":
            color = "error";
            status = "Đã hủy";
            break;
          default:
            color = "default";
            status = "Không xác định";
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
                disabled={record.status !== "1"}
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
                disabled={record.status !== "1"}
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
