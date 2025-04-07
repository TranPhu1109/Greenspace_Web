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
import useOrderHistoryStore from "@/stores/useOrderHistoryStore";

const { Step } = Steps;
const { confirm } = Modal;

const OrdersTable = ({
  data,
  isLoading,
  expandedRowKeys,
  setExpandedRowKeys,
  products,
}) => {
  const navigate = useNavigate();
  const { updateOrderStatus, fetchOrders } = useOrderStore();
  const { cancelOrder } = useOrderHistoryStore();
  const { createShippingOrder, order_code } = useShippingStore();
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
          const addressParts = record.address
            .split("|")
            .map((part) => part.trim());
          const toAddress = addressParts[0];
          const toWard = addressParts[1];
          const toDistrict = addressParts[2];
          const toProvince = addressParts[3];

          const shippingData = {
            toName: record.userName,
            toPhone: record.phone,
            toAddress: toAddress,
            toProvince: toProvince,
            toDistrict: toDistrict,
            toWard: toWard,
            items: record.orderDetails.map((item) => {
              // Tìm thông tin sản phẩm từ products
              const product = products.find((p) => p.id === item.productId);
              const productName = product ? product.name : item.productName;
              return {
                name: productName,
                code: item.productId,
                quantity: item.quantity,
              };
            }),
          };

          const shippingResponse = await createShippingOrder(shippingData);
          console.log("shippingResponse", shippingResponse);

          if (shippingResponse.data?.code === 200) {
            // Cập nhật trạng thái đơn hàng với mã vận đơn
            console.log("record.id", record.id);
            console.log(
              "deliveryCode",
              shippingResponse.data?.data?.order_code
            );

            const success = await updateOrderStatus(record.id, {
              status: 1,
              deliveryCode: shippingResponse.data?.data?.order_code,
            });

            if (success) {
              message.success(`Đã nhận đơn hàng ${record.id}`);
              fetchOrders(); // Gọi lại fetchOrders để cập nhật danh sách đơn hàng
            } else {
              throw new Error("Không thể cập nhật trạng thái đơn hàng");
            }
          } else {
            throw new Error("Tạo đơn vận chuyển thất bại");
          }
        } catch (error) {
          message.error(error.message || "Có lỗi xảy ra khi xử lý đơn hàng");
        }
      },
    });
  };

  const handleRejectOrder = (e, record) => {
    e.stopPropagation();
    Modal.confirm({
      title: "Xác nhận hủy đơn hàng",
      content: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      okText: "Hủy đơn",
      cancelText: "Đóng",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const success = await cancelOrder(record.id);
          if (success) {
            message.success("Đã hủy đơn hàng thành công");
          }
          fetchOrders();
        } catch (error) {
          message.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
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
        <span className="font-medium" style={{ color: "#1890ff" }}>
          #{text.substring(0, 8)}...
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
      render: (text) => {
        const formattedAddress = text.replace(/\|/g, ', ');
        return <span className="text-xs text-gray-500">{formattedAddress}</span>;
      },
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
      title: "Mã vận đơn",
      dataIndex: "deliveryCode",
      key: "deliveryCode",
      render: (text) => (
        <div className="flex flex-col">
          <Tag color={text ? "success" : "orange"} className="font-medium">
            {text || "---"}
          </Tag>
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
          case "0":
            color = "warning";
            status = "Chờ xử lý";
            break;
          case "1":
            color = "processing";
            status = "Đang xử lý";
            break;
          case "2":
            color = "blue";
            status = "Đã xử lý";
            break;
          case "3":
            color = "error";
            status = "Đã hủy";
            break;
          case "4":
            color = "purple";
            status = "Đã hoàn tiền";
            break;
          case "5":
            color = "cyan";
            status = "Đã hoàn tiền xong";
            break;
          case "6":
            color = "geekblue";
            status = "Đã lấy hàng & đang giao";
            break;
          case "7":
            color = "red";
            status = "Giao hàng thất bại";
            break;
          case "8":
            color = "orange";
            status = "Giao lại";
            break;
          case "9":
            color = "success";
            status = "Đã giao hàng thành công";
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
      render: (_, record) => {
        const getAvailableActions = (status) => {
          switch (status) {
            case "0":
              return [
                {
                  label: "Xác nhận",
                  type: "primary",
                  icon: <CheckCircleOutlined />,
                  onClick: (e) => handleAcceptOrder(e, record),
                  disabled: false
                },
                {
                  label: "Từ chối",
                  type: "danger",
                  icon: <CloseCircleOutlined />,
                  onClick: (e) => handleRejectOrder(e, record),
                  disabled: false
                }
              ];
            case "1":
              return [
                {
                  label: "Đã lấy hàng",
                  type: "primary",
                  icon: <CheckCircleOutlined />,
                  onClick: async (e) => {
                    e.stopPropagation();
                    try {
                      const success = await updateOrderStatus(record.id, { status: 6, deliveryCode: order_code });
                      if (success) {
                        message.success("Đã cập nhật trạng thái đơn hàng");
                        fetchOrders();
                      }
                    } catch (error) {
                      message.error("Không thể cập nhật trạng thái đơn hàng");
                    }
                  },
                  disabled: false
                }
              ];
            case "6":
            case "8":
              return [
                {
                  label: "Giao thành công",
                  type: "primary",
                  icon: <CheckCircleOutlined />,
                  onClick: async (e) => {
                    e.stopPropagation();
                    try {
                      const success = await updateOrderStatus(record.id, { status: 9, deliveryCode: order_code });
                      if (success) {
                        message.success("Đã cập nhật trạng thái đơn hàng");
                        fetchOrders();
                      }
                    } catch (error) {
                      message.error("Không thể cập nhật trạng thái đơn hàng");
                    }
                  },
                  disabled: false
                },
                {
                  label: "Giao thất bại",
                  type: "danger",
                  icon: <CloseCircleOutlined />,
                  onClick: async (e) => {
                    e.stopPropagation();
                    try {
                      const success = await updateOrderStatus(record.id, { status: 7, deliveryCode: order_code });
                      if (success) {
                        message.success("Đã cập nhật trạng thái đơn hàng");
                        fetchOrders();
                      }
                    } catch (error) {
                      message.error("Không thể cập nhật trạng thái đơn hàng");
                    }
                  },
                  disabled: false
                }
              ];
            case "7":
              return [
                {
                  label: "Giao lại",
                  type: "primary",
                  icon: <CheckCircleOutlined />,
                  onClick: async (e) => {
                    e.stopPropagation();
                    try {
                      const success = await updateOrderStatus(record.id, { status: 8, deliveryCode: order_code });
                      if (success) {
                        message.success("Đã cập nhật trạng thái đơn hàng");
                        fetchOrders();
                      }
                    } catch (error) {
                      message.error("Không thể cập nhật trạng thái đơn hàng");
                    }
                  },
                  disabled: false
                }
              ];
            default:
              return [];
          }
        };

        const actions = getAvailableActions(record.status);

        return (
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

                {actions.map((action, index) => (
                  <Button
                    key={index}
                    type={action.type}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    icon={action.icon}
                    style={{
                      marginBottom: "5px",
                      justifyContent: "flex-start",
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            }
          >
            <MoreOutlined style={{ fontSize: "20px", fontWeight: "bold" }} />
          </Popover>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      expandable={{
        expandedRowRender,
        // expandRowByClick: true,
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

      onRow={(record) => ({
        onClick: () => handleViewOrderDetail(record)
      })}
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
