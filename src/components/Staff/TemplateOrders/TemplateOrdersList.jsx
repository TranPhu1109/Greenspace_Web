import React, { useEffect, useState, useRef } from "react";
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
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import StatusTag from "@/pages/Admin/DesignOrders/components/StatusTag";
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
  const { designOrders, isLoading, error, fetchDesignOrders } =
    useDesignOrderStore();

  const handleViewDetail = (id) => {
    navigate(`${getBasePath()}/design-orders/template-orders/${id}`);
  };

  useEffect(() => {
    fetchDesignOrders(componentId);
    
    // Cleanup function to abort any pending requests when component unmounts
    return () => {
      api.clearPendingRequests(componentId);
    };
  }, [fetchDesignOrders, componentId]);

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

  const statusOptions = [
    { value: "Pending", label: "Chờ xử lý" },
    { value: "Processing", label: "Đang xử lý" },
    { value: "Completed", label: "Hoàn thành" },
    { value: "Cancelled", label: "Đã hủy" },
  ];


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
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Số điện thoại",
      dataIndex: "cusPhone",
      key: "cusPhone",
    },
    {
      title: "Kích thước",
      key: "size",
      render: (_, record) => `${record.length}m x ${record.width}m`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (value) => `${value.toLocaleString()}đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusTag status={status.toLowerCase()} />,
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
