import React, { useState } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Row,
  Col,
  Select,
  DatePicker,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ShoppingOutlined,
  CarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  PhoneFilled,
  MoreOutlined,
} from "@ant-design/icons";
import StatusTag from "../../../pages/Admin/DesignOrders/components/StatusTag";
import PaymentStatusTag from "../../../pages/Admin/DesignOrders/components/PaymentStatusTag";
import { customTemplateOrders } from "../mockData/customTemplateOrders";
import { orderStatuses } from "../mockData/templateOrders";
import { useNavigate } from "react-router-dom";
import { Popover } from "antd";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const CustomTemplateOrdersList = () => {
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const navigate = useNavigate();

  // Định nghĩa mapping cho icons
  const icons = {
    ClockCircleOutlined: ClockCircleOutlined,
    SyncOutlined: SyncOutlined,
    EditOutlined: EditOutlined,
    ShoppingOutlined: ShoppingOutlined,
    CarOutlined: CarOutlined,
    CheckCircleOutlined: CheckCircleOutlined,
    CloseCircleOutlined: CloseCircleOutlined,
  };

  const handleViewDetail = (id) => {
    navigate(`/staff/design-orders/custom-template-orders/${id}`);
  };

  const handleAssignOrder = (order) => {
    setSelectedOrder(order);
    setIsAssignModalVisible(true);
  };

  const handleRejectOrder = (order) => {
    setSelectedOrder(order);
    setIsRejectModalVisible(true);
  };

  // Cập nhật phần render trạng thái
  const renderStatus = (status) => {
    const statusConfig = orderStatuses[status];
    const IconComponent = icons[statusConfig.icon];
    return (
      <Tag color={statusConfig.color} icon={IconComponent && <IconComponent />}>
        {statusConfig.label}
      </Tag>
    );
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: "Mẫu gốc",
      dataIndex: "templateName",
      key: "templateName",
      render: (templateName) => (
        <Tooltip title={templateName}>
           <div
            className="overflow-hidden text-ellipsis"
            style={{
              maxWidth: "200px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {templateName}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: ["customerInfo", "name"],
      key: "customerName",
      render: (_, record) => (
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
          <div className="flex flex-col">
            <span>
              <UserOutlined style={{ color: "green" }} />{" "}
              {record.customerInfo.name}
            </span>
            <span>
              <PhoneOutlined style={{ color: "green" }} />{" "}
              {record.customerInfo.phone}
            </span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Yêu cầu tùy chỉnh",
      dataIndex: "requirements",
      key: "requirements",
      render: (requirements) => (
        <Tooltip title={requirements}>
          <div
            style={{
              maxWidth: "300px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              whiteSpace: "normal",
            }}
          >
            {requirements}
          </div>
        </Tooltip>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        return (
          <Popover
            placement="bottom"
            trigger="click"
            content={
              <div className="flex flex-col gap-2">
                {/* <Button type="text">Chi tiết</Button> */}
                {/* <Button>Phân công</Button> */}
                {/* <Button>Từ chối</Button> */}
                <Button
                  type="default"
                  style={{
                    backgroundColor: "beige",
                    marginBottom: "5px",
                    justifyContent: "flex-start",
                  }}
                  onClick={() => handleViewDetail(record.id)}
                >
                  <EyeOutlined /> Chi tiết
                </Button>
                <Button
                  type="primary"
                  disabled={record.status !== "pending"}
                  style={{
                    marginBottom: "5px",
                    justifyContent: "flex-start",
                  }}
                  onClick={() => handleAssignOrder(record)}
                >
                  <CheckCircleOutlined /> Nhận đơn
                </Button>
                <Button
                  danger
                  disabled={record.status !== "pending"}
                  style={{
                    justifyContent: "flex-start",
                  }}
                  onClick={() => handleRejectOrder(record)}
                >
                  <CloseCircleOutlined /> Từ chối đơn
                </Button>
              </div>
            }
          >
            <MoreOutlined style={{ fontSize: "20px", fontWeight: "bold" }} />
          </Popover>
        );
      },
    },
  ];

  // Chức năng quản lý danh sách
  const features = {
    // 1. Xem danh sách đơn hàng
    listOrders: {
      search: "Tìm kiếm theo mã đơn, tên khách hàng",
      filter: "Lọc theo trạng thái, ngày đặt",
      sort: "Sắp xếp theo ngày, giá trị đơn",
    },

    // 2. Xử lý đơn mới
    handleNewOrder: {
      accept: "Nhận đơn và phân công designer",
      reject: "Từ chối đơn và ghi chú lý do",
    },

    // 3. Quản lý vật liệu
    manageMaterials: {
      view: "Xem danh sách vật liệu gốc",
      update: "Cập nhật/thay đổi vật liệu",
      calculate: "Tính toán chi phí thay đổi",
    },

    // 4. Quản lý thanh toán
    managePayments: {
      deposit: "Xác nhận đặt cọc 50%",
      final: "Xác nhận thanh toán còn lại",
      status: "Theo dõi trạng thái thanh toán",
    },

    // 5. Cập nhật trạng thái
    updateStatus: {
      material: "Cập nhật trạng thái chọn/đặt vật liệu",
      delivery: "Cập nhật trạng thái giao vật liệu",
      completion: "Xác nhận hoàn thành đơn hàng",
    },

    // 6. Theo dõi tiến độ
    trackProgress: {
      timeline: "Xem lịch sử thay đổi trạng thái",
      notes: "Thêm ghi chú cho đơn hàng",
    },
  };

  return (
    <>
      <Card title="Danh sách đơn tùy chỉnh từ mẫu">
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
          dataSource={customTemplateOrders}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
        />
      </Card>

    </>
  );
};

export default CustomTemplateOrdersList;
