import React, { useEffect, useState, useRef, useCallback } from "react";
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
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { Popover } from "antd";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import { useSignalRMessage } from "@/hooks/useSignalR";
import api from "@/api/api";

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
  const componentId = useRef(`template-orders-list-${Date.now()}`).current;

  const { getBasePath } = useRoleBasedPath();
  const { designOrders, isLoading, error, fetchDesignOrders, fetchDesignOrdersSilent } =
    useDesignOrderStore();

  const handleViewDetail = (id) => {
    navigate(`${getBasePath()}/design-orders/template-orders/${id}`);
  };

  // Silent fetch function for SignalR updates (no loading state) - using store function
  const fetchDesignOrdersSilentWrapper = useCallback(async () => {
    try {
      console.log(`[${componentId}] Fetching template orders silently...`);
      await fetchDesignOrdersSilent(componentId, 0, 1000);
    } catch (err) {
      console.error(`[${componentId}] Error fetching template orders silently:`, err);
    }
  }, [fetchDesignOrdersSilent, componentId]);

  useEffect(() => {
    fetchDesignOrders(componentId, 0, 1000);

    // Cleanup function to abort any pending requests when component unmounts
    return () => {
      api.clearPendingRequests(componentId);
    };
  }, [fetchDesignOrders, componentId]);

  // SignalR integration using optimized hook for real-time updates
  useSignalRMessage(
    async () => {
      console.log(`[${componentId}] SignalR message received - refreshing template orders`);
      // Refresh template orders data silently to avoid loading state flicker
      await fetchDesignOrdersSilentWrapper();
    },
    [fetchDesignOrdersSilentWrapper]
  );

  // Filter design orders to only get non-custom orders
  const filteredOrders = (designOrders || [])
    .filter((order) => !order.isCustom)
    .filter(
      (order) =>
        (searchText
          ? order.userName.toLowerCase().includes(searchText.toLowerCase()) ||
            order.cusPhone.includes(searchText)
          : true) &&
        (filterStatus ? order.status === filterStatus : true) &&
        (dateRange
          ? // Add date filtering logic here when API provides creation date
            true
          : true)
    );

  const getStatusDisplay = (status) => {
    switch (status) {
      case "Pending": return "Chờ xử lý";
      case "ConsultingAndSketching": return "Đang tư vấn & phác thảo";
      case "DeterminingDesignPrice": return "Đang xác định giá";
      case "DepositSuccessful": return "Đặt cọc thành công";
      case "AssignToDesigner": return "Đã giao cho nhà thiết kế";
      case "DeterminingMaterialPrice": return "Xác định giá vật liệu";
      case "DoneDesign": return "Hoàn thành thiết kế";
      case "PaymentSuccess": return "Thanh toán thành công";
      case "Processing": return "Đang xử lý";
      case "PickedPackageAndDelivery": return "Đã lấy hàng & đang giao";
      case "DeliveryFail": return "Giao hàng thất bại";
      case "ReDelivery": return "Giao lại";
      case "DeliveredSuccessfully": return "Đã giao hàng thành công";
      case "CompleteOrder": return "Hoàn thành đơn hàng";
      case "OrderCancelled": return "Đơn hàng đã bị hủy";
      case "DesignPriceConfirm": return "Xác nhận giá thiết kế";
      case "Refund": return "Hoàn tiền";
      case "DoneRefund": return "Đã hoàn tiền";
      case "StopService": return "Ngừng dịch vụ";
      case "ReConsultingAndSketching": return "Phác thảo lại";
      case "ReDesign": return "Thiết kế lại";
      case "WaitDeposit": return "Chờ đặt cọc";
      case "DoneDeterminingDesignPrice": return "Đã xác định giá thiết kế";
      case "DoneDeterminingMaterialPrice": return "Đã xác định giá vật liệu";
      case "ReDeterminingDesignPrice": return "Xác định lại giá thiết kế";
      case "ExchangeProdcut": return "Đổi sản phẩm";
      case "WaitForScheduling": return "Chờ lên lịch";
      case "Installing": return "Đang lắp đặt";
      case "DoneInstalling": return "Đã lắp đặt xong";
      case "ReInstall": return "Lắp đặt lại";
      case "CustomerConfirm": return "Khách hàng xác nhận";
      case "Successfully": return "Thành công";
      case "ReDetermineMaterialPrice": return "Xác định lại giá vật liệu";
      case "MaterialPriceConfirmed": return "Đã xác nhận giá vật liệu";
      default: return "Không xác định";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "WaitDeposit":
      case "WaitForScheduling":
        return "default";
      
      case "ConsultingAndSketching":
      case "DeterminingDesignPrice":
      case "DeterminingMaterialPrice":
      case "Processing":
      case "PickedPackageAndDelivery":
      case "Installing":
        return "processing";
      
      case "DeliveryFail":
      case "OrderCancelled":
      case "StopService":
        return "error";
      
      case "ReDelivery":
      case "ReConsultingAndSketching":
      case "ReDesign":
      case "ReInstall":
      case "ReDeterminingDesignPrice":
      case "ReDetermineMaterialPrice":
        return "warning";
      
      case "DepositSuccessful":
      case "DoneDesign":
      case "PaymentSuccess":
      case "DeliveredSuccessfully":
      case "CompleteOrder":
      case "DoneInstalling":
      case "CustomerConfirm":
      case "Successfully":
      case "DoneRefund":
      case "DoneDeterminingDesignPrice":
      case "DoneDeterminingMaterialPrice":
      case "MaterialPriceConfirmed":
        return "success";
      
      default:
        return "default";
    }
  };

  const handleAssignOrder = (order) => {
    setSelectedOrder(order);
    setIsAssignModalVisible(true);
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

  const statusOptions = [
    { value: "Pending", label: "Chờ xử lý" },
    { value: "PaymentSuccess", label: "Đã thanh toán" },
    { value: "Processing", label: "Đang xử lý" },
    { value: "PickedPackageAndDelivery", label: "Đang giao hàng" },
    { value: "DeliveryFail", label: "Giao hàng thất bại" },
    { value: "ReDelivery", label: "Giao hàng lại" },
    { value: "DeliveredSuccessfully", label: "Đã giao hàng" },
    { value: "CompleteOrder", label: "Hoàn thành" },
    { value: "OrderCancelled", label: "Đã hủy" }
  ];

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => <span>#{id.slice(0, 8)}</span>,
    },
    {
      title: "Khách hàng",
      key: "userInfo",
      render: (_, record) => (
        <div>
          <div>{record.userName}</div>
          <div className="text-sm text-gray-500">{record.cusPhone}</div>
        </div>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (address) => (
        <Tooltip title={address.split('|').join(', ')}>
          <span>{address.split('|').join(', ').length > 20 ? `${address.split('|').join(', ').slice(0, 150)}` : address.split('|').join(', ')}</span>
        </Tooltip>
      ),
    },
    {
      title: "Tổng tiền",
      key: "totalCost",
      render: (_, record) => {
        const totalCost = (record.designPrice || 0) + (record.materialPrice || 0);
        return totalCost.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        });
      },
    },
    // {
    //   title: "Mã đơn",
    //   dataIndex: "deliveryCode",
    //   key: "deliveryCode",

    // },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusDisplay(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
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
                  disabled={record.status !== "Pending"}
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
                  disabled={record.status !== "Pending"}
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
        </div>
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
              {statusOptions.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          loading={isLoading}
          rowKey="id"
          // scroll={{ x: 1300 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
          onRow={(record) => ({
            onClick: () => handleViewDetail(record.id),
            style: { cursor: "pointer" },
          })}
        />
      </Card>
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
