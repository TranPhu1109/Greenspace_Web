import React, { useEffect, useState } from "react";
import { Table, Card, Button, Input, Row, Col, Select, DatePicker } from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import StatusTag from "../../../pages/Admin/DesignOrders/components/StatusTag";
import PaymentStatusTag from "../../../pages/Admin/DesignOrders/components/PaymentStatusTag";
import { customTemplateOrders } from "../mockData/customTemplateOrders";
import { orderStatuses } from "../mockData/templateOrders";
import { useNavigate } from "react-router-dom";
import { Popover } from "antd";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";
import useDesignOrderStore from "@/stores/useDesignOrderStore";

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

  const { designOrders, isLoading, fetchDesignOrders } = useDesignOrderStore();
  const { getBasePath } = useRoleBasedPath();

  useEffect(() => {
    fetchDesignOrders();
  }, []);

  const filteredOrders = Array.isArray(designOrders)
    ? designOrders
        .filter((order) => order.isCustom)
        .filter(
          (order) =>
            (searchText
              ? order.userName
                  .toLowerCase()
                  .includes(searchText.toLowerCase()) ||
                order.cusPhone.includes(searchText)
              : true) &&
            (filterStatus ? order.status === filterStatus : true) &&
            (dateRange ? true : true)
        )
    : [];

  const statusOptions = [
    { value: "Pending", label: "Chờ xử lý" },
    { value: "Processing", label: "Đang xử lý" },
    { value: "Completed", label: "Hoàn thành" },
    { value: "Cancelled", label: "Đã hủy" },
  ];

  console.log(designOrders);

  // Replace all path calculations with the hook
  const handleViewDetail = (id) => {
    navigate(`${getBasePath()}/design-orders/custom-template-orders/${id}`);
  };

  const handleAssignOrder = (order) => {
    setSelectedOrder(order);
    setIsAssignModalVisible(true);
  };

  const handleRejectOrder = (order) => {
    setSelectedOrder(order);
    setIsRejectModalVisible(true);
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
      title: "Giá thiết kế",
      dataIndex: "designPrice",
      key: "designPrice",
      render: (value) => (value ? `${value.toLocaleString()}đ` : "0đ"),
    },
    {
      title: "Giá vật liệu",
      dataIndex: "materialPrice",
      key: "materialPrice",
      render: (value) => (value ? `${value.toLocaleString()}đ` : "0đ"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (value) => (value ? `${value.toLocaleString()}đ` : "0đ"),
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
      render: (_, record) => {
        return (
          <div onClick={(e) => e.stopPropagation()}>
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
                    disabled={record.status !== "Pending"}
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
                    disabled={record.status !== "Pending"}
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
          </div>
        );
      },
    },
  ];

  // const features = {
  //   // 1. Xem danh sách đơn hàng
  //   listOrders: {
  //     search: "Tìm kiếm theo mã đơn, tên khách hàng",
  //     filter: "Lọc theo trạng thái, ngày đặt",
  //     sort: "Sắp xếp theo ngày, giá trị đơn",
  //   },

  //   // 2. Xử lý đơn mới
  //   handleNewOrder: {
  //     accept: "Nhận đơn và phân công designer",
  //     reject: "Từ chối đơn và ghi chú lý do",
  //   },

  //   // 3. Quản lý vật liệu
  //   manageMaterials: {
  //     view: "Xem danh sách vật liệu gốc",
  //     update: "Cập nhật/thay đổi vật liệu",
  //     calculate: "Tính toán chi phí thay đổi",
  //   },

  //   // 4. Quản lý thanh toán
  //   managePayments: {
  //     deposit: "Xác nhận đặt cọc 50%",
  //     final: "Xác nhận thanh toán còn lại",
  //     status: "Theo dõi trạng thái thanh toán",
  //   },

  //   // 5. Cập nhật trạng thái
  //   updateStatus: {
  //     material: "Cập nhật trạng thái chọn/đặt vật liệu",
  //     delivery: "Cập nhật trạng thái giao vật liệu",
  //     completion: "Xác nhận hoàn thành đơn hàng",
  //   },

  //   // 6. Theo dõi tiến độ
  //   trackProgress: {
  //     timeline: "Xem lịch sử thay đổi trạng thái",
  //     notes: "Thêm ghi chú cho đơn hàng",
  //   },
  // };

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
    </>
  );
};

export default CustomTemplateOrdersList;
