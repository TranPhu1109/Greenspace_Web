import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Badge,
  Modal,
  message,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  MoreOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useServiceOrderStore from "@/stores/useServiceOrderStore";
import dayjs from "dayjs";
import "./NewDesignOrdersList.scss";
import { Tooltip } from "antd";
import { Popover } from "antd";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const NewDesignOrdersList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const { serviceOrders, loading, getServiceOrdersNoIdea, cancelServiceOrder } =
    useServiceOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      await getServiceOrdersNoIdea();
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/staff/design-orders/new-design-orders/${id}`);
  };

  const handleAssignToDesigner = (id) => {
    navigate(`/staff/schedule`);
  };

  const handleRejectOrder = (id) => {
    confirm({
      title: 'Xác nhận từ chối đơn hàng',
      icon: <CloseCircleOutlined />,
      content: 'Bạn có chắc chắn muốn từ chối đơn hàng này?',
      okText: 'Xác nhận',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await cancelServiceOrder(id);
          message.success('Đã từ chối đơn hàng thành công');
          fetchOrders(); // Refresh the list
        } catch (error) {
          message.error('Không thể từ chối đơn hàng: ' + error.message);
        }
      },
    });
  };

  const applyFilters = () => {
    let filteredOrders = [...serviceOrders];

    // Filter by status
    if (statusFilter !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) => order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by keyword
    if (searchText) {
      const keyword = searchText.toLowerCase();
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.id.toLowerCase().includes(keyword) ||
          order.userName.toLowerCase().includes(keyword) ||
          order.cusPhone.includes(keyword) ||
          (order.email && order.email.toLowerCase().includes(keyword))
      );
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = dateRange;
      filteredOrders = filteredOrders.filter((order) => {
        const orderDate = dayjs(order.creationDate);
        return (
          orderDate.isAfter(startDate) &&
          orderDate.isBefore(endDate.add(1, "day"))
        );
      });
    }

    return filteredOrders;
  };

  // Cập nhật dataSource cho Table
  const filteredData = applyFilters();

  const resetFilters = () => {
    setStatusFilter("all");
    setSearchText("");
    setDateRange(null);
    fetchOrders();
  };

  const getStatusText = (status) => {
    // Nếu status là số (dạng string)
    const numericStatusMap = {
      "0": "Chờ xử lý",
      "1": "Đang tư vấn & phác thảo",
      "2": "Đang xác định giá",
      "3": "Đặt cọc thành công",
      "4": "Đã giao cho nhà thiết kế",
      "5": "Xác định giá vật liệu",
      "6": "Hoàn thành thiết kế",
      "7": "Thanh toán thành công",
      "8": "Đang xử lý",
      "9": "Đã lấy hàng & đang giao",
      "10": "Giao hàng thất bại",
      "11": "Giao lại",
      "12": "Đã giao hàng thành công",
      "13": "Hoàn thành đơn hàng",
      "14": "Đơn hàng đã bị hủy",
      "15": "Cảnh báo vượt 30%",
      "16": "Hoàn tiền",
      "17": "Đã hoàn tiền",
      "18": "Hoàn thành",
    };

    // Nếu status là chuỗi tiếng Anh
    const stringStatusMap = {
      "Pending": "Chờ xử lý",
      "ConsultingAndSketching": "Đang tư vấn & phác thảo",
      "DeterminingDesignPrice": "Đang xác định giá",
      "DepositSuccessful": "Đặt cọc thành công",
      "AssignToDesigner": "Đã giao cho nhà thiết kế",
      "DeterminingMaterialPrice": "Xác định giá vật liệu",
      "DoneDesign": "Hoàn thành thiết kế",
      "PaymentSuccess": "Thanh toán thành công",
      "Processing": "Đang xử lý",
      "PickedPackageAndDelivery": "Đã lấy hàng & đang giao",
      "DeliveryFail": "Giao hàng thất bại",
      "ReDelivery": "Giao lại",
      "DeliveredSuccessfully": "Đã giao hàng thành công",
      "CompleteOrder": "Hoàn thành đơn hàng",
      "OrderCancelled": "Đơn hàng đã bị hủy",
      "Warning": "Cảnh báo vượt 30%",
      "Refund": "Hoàn tiền",
      "DoneRefund": "Đã hoàn tiền",
      "Completed": "Hoàn thành",
      "NoDesignIdea": "Không có mẫu thiết kế",
    };

    // Kiểm tra nếu status là số (dạng string)
    if (numericStatusMap[status]) {
      return numericStatusMap[status];
    }
    
    // Kiểm tra nếu status là chuỗi tiếng Anh
    if (stringStatusMap[status]) {
      return stringStatusMap[status];
    }
    
    // Trả về giá trị gốc nếu không tìm thấy trong cả hai map
    return status || "Không xác định";
  };

  const getStatusColor = (status) => {
    // Map màu cho status dạng số
    const numericColorMap = {
      "0": "blue", // Pending
      "1": "cyan", // ConsultingAndSketching
      "2": "purple", // DeterminingDesignPrice
      "3": "green", // DepositSuccessful
      "4": "geekblue", // AssignToDesigner
      "5": "magenta", // DeterminingMaterialPrice
      "6": "volcano", // DoneDesign
      "7": "green", // PaymentSuccess
      "8": "blue", // Processing
      "9": "cyan", // PickedPackageAndDelivery
      "10": "red", // DeliveryFail
      "11": "purple", // ReDelivery
      "12": "green", // DeliveredSuccessfully
      "13": "green", // CompleteOrder
      "14": "red", // OrderCancelled
      "15": "orange", // Warning
      "16": "gold", // Refund
      "17": "green", // DoneRefund
      "18": "green", // Completed
    };

    // Map màu cho status dạng chuỗi tiếng Anh
    const stringColorMap = {
      "Pending": "blue",
      "ConsultingAndSketching": "cyan",
      "DeterminingDesignPrice": "purple",
      "DepositSuccessful": "green",
      "AssignToDesigner": "geekblue",
      "DeterminingMaterialPrice": "magenta",
      "DoneDesign": "volcano",
      "PaymentSuccess": "green",
      "Processing": "blue",
      "PickedPackageAndDelivery": "cyan",
      "DeliveryFail": "red",
      "ReDelivery": "purple",
      "DeliveredSuccessfully": "green",
      "CompleteOrder": "green",
      "OrderCancelled": "red",
      "Warning": "orange",
      "Refund": "gold",
      "DoneRefund": "green",
      "Completed": "green",
      "NoDesignIdea": "default",
    };

    // Kiểm tra nếu status là số (dạng string)
    if (numericColorMap[status]) {
      return numericColorMap[status];
    }
    
    // Kiểm tra nếu status là chuỗi tiếng Anh
    if (stringColorMap[status]) {
      return stringColorMap[status];
    }
    
    // Trả về màu mặc định nếu không tìm thấy trong cả hai map
    return "default";
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <span className="order-number">#{text.slice(0, 8)}...</span>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <div>
          <div>{record.userName}</div>
          <div className="customer-contact">{record.cusPhone}</div>
        </div>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "creationDate",
      key: "creationDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Yêu cầu",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <div className="requirements-preview">
          <Tooltip
            title={<span dangerouslySetInnerHTML={{ __html: text }}></span>}
            color="orange"
            placement="topLeft"
          >
            <span
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
              }}
              dangerouslySetInnerHTML={{ __html: text }}
            ></span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        return <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail(record.id);
              }}
            />
          </Tooltip>
          {(record.status === "0" || record.status === "Pending") && (
            <>
              <Tooltip title="Giao task cho designer">
                <Button
                  type="primary"
                  icon={<UserOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssignToDesigner(record.id);
                  }}
                />
              </Tooltip>
              <Tooltip title="Từ chối đơn">
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRejectOrder(record.id);
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="new-design-orders-list">
      <Card title="Quản lý đơn thiết kế mới">
        <div className="filters-section">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6} lg={5} xl={4}>
              <Select
                placeholder="Trạng thái"
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="0">Chờ xử lý</Option>
                <Option value="1">Đang tư vấn & phác thảo</Option>
                <Option value="2">Đang xác định giá</Option>
                <Option value="3">Đặt cọc thành công</Option>
                <Option value="4">Đã giao cho nhà thiết kế</Option>
                <Option value="5">Xác định giá vật liệu</Option>
                <Option value="6">Hoàn thành thiết kế</Option>
                <Option value="7">Thanh toán thành công</Option>
                <Option value="8">Đang xử lý</Option>
                <Option value="9">Đã lấy hàng & đang giao</Option>
                <Option value="10">Giao hàng thất bại</Option>
                <Option value="11">Giao lại</Option>
                <Option value="12">Đã giao hàng thành công</Option>
                <Option value="13">Hoàn thành đơn hàng</Option>
                <Option value="14">Đơn hàng đã bị hủy</Option>
                <Option value="15">Cảnh báo vượt 30%</Option>
                <Option value="16">Hoàn tiền</Option>
                <Option value="17">Đã hoàn tiền</Option>
                <Option value="18">Hoàn thành</Option>
              </Select>
            </Col>
            <Col xs={24} sm={16} md={10} lg={8} xl={6}>
              <RangePicker
                style={{ width: "100%" }}
                placeholder={["Từ ngày", "Đến ngày"]}
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
              />
            </Col>
            <Col xs={24} sm={16} md={8} lg={7} xl={6}>
              <Input
                placeholder="Tìm kiếm theo mã, tên, SĐT..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8} md={6} lg={4} xl={4}>
              <Space>
                <Button
                  type="primary"
                  icon={<FilterOutlined />}
                  onClick={applyFilters}
                >
                  Lọc
                </Button>
                <Button onClick={resetFilters}>Đặt lại</Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
          onRow={(record) => ({
            onClick: () => handleViewDetail(record.id),
            style: { cursor: "pointer" },
          })}
        />
      </Card>
    </div>
  );
};

export default NewDesignOrdersList;
