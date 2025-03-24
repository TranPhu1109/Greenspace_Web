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
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  MoreOutlined,
  CloseOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  newDesignOrders,
  orderStatusConfig,
} from "../mockData/newDesignOrders";
import dayjs from "dayjs";
import "./NewDesignOrdersList.scss";
import { Tooltip } from "antd";
import { Popover } from "antd";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const NewDesignOrdersList = () => {
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState(newDesignOrders);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFilteredData(newDesignOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (id) => {
    // navigate(`/admin/design-orders/new-design-orders/${id}`);
    navigate(`/staff/design-orders/new-design-orders/${id}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    let filteredOrders = [...newDesignOrders];

    // Filter by status
    if (statusFilter !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === statusFilter
      );
    }

    // Filter by keyword
    if (searchText) {
      const keyword = searchText.toLowerCase();
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(keyword) ||
          order.customerInfo.name.toLowerCase().includes(keyword) ||
          order.customerInfo.phone.includes(keyword) ||
          order.customerInfo.email.toLowerCase().includes(keyword)
      );
    }

    // Filter by date range
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filteredOrders = filteredOrders.filter((order) => {
        const orderDate = dayjs(order.orderDate);
        return (
          (!startDate || orderDate.isAfter(startDate)) &&
          (!endDate || orderDate.isBefore(endDate.add(1, "day")))
        );
      });
    }

    setFilteredData(filteredOrders);
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setSearchText("");
    setDateRange(null);
    setFilteredData(newDesignOrders);
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text) => <span className="order-number">{text}</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerInfo",
      key: "customerInfo",
      render: (customerInfo) => (
        <div>
          <div>{customerInfo.name}</div>
          <div className="customer-contact">{customerInfo.phone}</div>
        </div>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Yêu cầu",
      dataIndex: "requirements",
      key: "requirements",
      // width: 400,
      render: (text) => (
        <div className="requirements-preview">
          <Tooltip title={text} color="orange" placement="topLeft">
            <span
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
              }}
            >
              {text}
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = "Không xác định";

        switch (status) {
          case "pending":
            color = "blue";
            text = "Chờ xử lý";
            break;
          case "processing":
            color = "processing";
            text = "Đang xử lý";
            break;
          case "rejected":
            color = "error";
            text = "Đã từ chối";
            break;
          default:
            break;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Popover
          placement="bottom"
          trigger="click"
          content={
            <div className="flex flex-col gap-2">
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
                  onClick={() => handleViewDetail(record.id)}
                >
                  <CheckCircleOutlined /> Nhận đơn
                </Button>
                <Button
                  danger
                  disabled={record.status !== "pending"}
                  style={{
                    justifyContent: "flex-start",
                  }}
                >
                  <CloseCircleOutlined /> Từ chối
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
                <Option value="pending">Chờ xử lý</Option>
                <Option value="processing">Đang xử lý</Option>
                <Option value="rejected">Đã từ chối</Option>
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
            style: { cursor: 'pointer' }
          })}
        />
      </Card>
    </div>
  );
};

export default NewDesignOrdersList;
