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
import signalRService from "@/services/signalRService";

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

  useEffect(() => {
    const handleOrderUpdate = (messageType, messageData) => {
       // Log all messages received for debugging
      console.log(`SignalR received in NewDesignOrdersList - Type: ${messageType}, Data: ${messageData}`);

      const relevantUpdateTypes = [
          "UpdateOrderService", // From previous context
          "OrderCancelled",     // Example: If cancellation affects this list
          "CreateOrderService", // When a new order is created
        ];

      if (relevantUpdateTypes.includes(messageType)) {
        console.log(`Relevant SignalR message received (${messageType}), refreshing order list.`);
        fetchOrders(); // Refetch the data
      }
    };

    try {
      signalRService.startConnection().then(() => { // Ensure connection is attempted
         console.log("SignalR connection ready for NewDesignOrdersList listener.");
         signalRService.on("messageReceived", handleOrderUpdate);
      }).catch(err => {
          console.error("SignalR connection failed in NewDesignOrdersList:", err);
      });
    } catch (err) {
         console.error("Error initiating SignalR connection for NewDesignOrdersList:", err);
    }
    return () => {
      console.log("Removing SignalR listener from NewDesignOrdersList.");
      signalRService.off("messageReceived", handleOrderUpdate);
    };
  }, []); // Empty dependency array ensures this runs once on mount

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
    const numericStatusMap = {
      "0": "Chờ xử lý",
      "1": "Đang tư vấn & phác thảo",
      "2": "Đang xác định giá TK",
      "3": "Đặt cọc thành công",
      "4": "Đã giao cho NKT",
      "5": "Đang xác định giá VL",
      "6": "Hoàn thành thiết kế",
      "7": "Thanh toán thành công",
      "8": "Đang xử lý",
      "9": "Đang giao hàng",
      "10": "Giao hàng thất bại",
      "11": "Giao lại",
      "12": "Đã giao hàng thành công",
      "13": "Hoàn thành đơn hàng",
      "14": "Đã hủy",
      "15": "Cảnh báo (>30%)",
      "16": "Hoàn tiền",
      "17": "Đã hoàn tiền",
      "18": "Ngừng dịch vụ",
      "19": "Phác thảo lại",
      "20": "Thiết kế lại",
      "21": "Chờ đặt cọc",
      "22": "Hoàn thành giá TK",
      "23": "Hoàn thành giá VL",
      "24": "Xác định lại giá TK",
      "25": "Đổi sản phẩm",
      "26": "Chờ lên lịch thi công",
      "27": "Đang lắp đặt",
      "28": "Đã lắp đặt xong",
      "29": "Lắp đặt lại",
      "30": "Khách hàng xác nhận",
      "31": "Thành công",
      "32": "Điều chỉnh giá vật liệu",
      "33": "Đã xác nhận giá vật liệu ngoài",
    };
  
    const stringStatusMap = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      DeterminingDesignPrice: "Đang xác định giá TK",
      DepositSuccessful: "Đặt cọc thành công",
      AssignToDesigner: "Đã giao cho NKT",
      DeterminingMaterialPrice: "Đang xác định giá VL",
      DoneDesign: "Hoàn thành thiết kế",
      PaymentSuccess: "Thanh toán thành công",
      Processing: "Đang xử lý",
      PickedPackageAndDelivery: "Đang giao hàng",
      DeliveryFail: "Giao hàng thất bại",
      ReDelivery: "Giao lại",
      DeliveredSuccessfully: "Đã giao hàng thành công",
      CompleteOrder: "Hoàn thành đơn hàng",
      OrderCancelled: "Đã hủy",
      Warning: "Cảnh báo (>30%)",
      Refund: "Hoàn tiền",
      DoneRefund: "Đã hoàn tiền",
      StopService: "Ngừng dịch vụ",
      ReConsultingAndSketching: "Phác thảo lại",
      ReDesign: "Thiết kế lại",
      WaitDeposit: "Chờ đặt cọc",
      DoneDeterminingDesignPrice: "Hoàn thành giá TK",
      DoneDeterminingMaterialPrice: "Hoàn thành giá VL",
      ReDeterminingDesignPrice: "Xác định lại giá TK",
      ExchangeProduct: "Đổi sản phẩm",
      WaitForScheduling: "Chờ lên lịch thi công",
      Installing: "Đang lắp đặt",
      DoneInstalling: "Đã lắp đặt xong",
      ReInstall: "Lắp đặt lại",
      CustomerConfirm: "Khách hàng xác nhận",
      Successfully: "Thành công",
      ReDetermineMaterialPrice: "Điều chỉnh giá vật liệu",
      MaterialPriceConfirmed: "Đã xác nhận giá vật liệu ngoài"
    };
  
    return numericStatusMap[status] || stringStatusMap[status] || status || "Không xác định";
  };  

  const getStatusColor = (status) => {
    const numericColorMap = {
      "0": "blue",         // Chờ xử lý
      "1": "cyan",         // Tư vấn & phác thảo
      "2": "purple",       // Xác định giá TK
      "3": "green",        // Đặt cọc thành công
      "4": "geekblue",     // Giao cho NTK
      "5": "magenta",      // Xác định giá VL
      "6": "volcano",      // Hoàn thành thiết kế
      "7": "green",        // Thanh toán thành công
      "8": "blue",         // Đang xử lý
      "9": "cyan",         // Đang giao hàng
      "10": "red",         // Giao hàng thất bại
      "11": "purple",      // Giao lại
      "12": "green",       // Giao hàng thành công
      "13": "success",     // Hoàn thành đơn hàng
      "14": "error",       // Hủy
      "15": "warning",     // Cảnh báo
      "16": "gold",        // Hoàn tiền
      "17": "success",     // Đã hoàn tiền
      "18": "default",     // Ngừng dịch vụ
      "19": "processing",  // Phác thảo lại
      "20": "processing",  // Thiết kế lại
      "21": "orange",      // Chờ đặt cọc
      "22": "success",     // Đã xác định giá TK
      "23": "success",     // Đã xác định giá VL
      "24": "warning",     // Xác định lại giá TK
      "25": "lime",        // Đổi sản phẩm
      "26": "gold",        // Chờ lên lịch
      "27": "cyan",        // Đang lắp đặt
      "28": "green",       // Đã lắp đặt xong
      "29": "orange",      // Lắp đặt lại
      "30": "blue",        // Khách xác nhận
      "31": "success",     // Thành công
      "32": "volcano",     // Điều chỉnh giá VL
      "33": "success",     // Đã xác nhận giá VL ngoài
    };
  
    const stringColorMap = {
      Pending: "blue",
      ConsultingAndSketching: "cyan",
      DeterminingDesignPrice: "purple",
      DepositSuccessful: "green",
      AssignToDesigner: "geekblue",
      DeterminingMaterialPrice: "magenta",
      DoneDesign: "volcano",
      PaymentSuccess: "green",
      Processing: "blue",
      PickedPackageAndDelivery: "cyan",
      DeliveryFail: "red",
      ReDelivery: "purple",
      DeliveredSuccessfully: "green",
      CompleteOrder: "success",
      OrderCancelled: "error",
      Warning: "warning",
      Refund: "gold",
      DoneRefund: "success",
      StopService: "default",
      ReConsultingAndSketching: "processing",
      ReDesign: "processing",
      WaitDeposit: "orange",
      DoneDeterminingDesignPrice: "success",
      DoneDeterminingMaterialPrice: "success",
      ReDeterminingDesignPrice: "warning",
      ReDetermineMaterialPrice: "volcano",
      ExchangeProduct: "lime",
      WaitForScheduling: "gold",
      Installing: "cyan",
      DoneInstalling: "green",
      ReInstall: "orange",
      CustomerConfirm: "blue",
      Successfully: "success",
      MaterialPriceConfirmed: "success"
    };
  
    return numericColorMap[status] || stringColorMap[status] || "default";
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
            title={<span className="html-preview" dangerouslySetInnerHTML={{ __html: text }}></span>}
            color="#fff"
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
          {(record.status === "0" || record.status === "Pending" || record.status === "ReConsultingAndSketching" || record.status === "DepositSuccessful" || record.status === "ReDesign") && (
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
      <Card title="Quản lý đơn thiết kế mới (Không có mẫu sẵn)">
        <div className="filters-section">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6} lg={5} xl={4}>
              <Select
                placeholder="Trạng thái"
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                allowClear // Allow clearing the filter
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="0">Chờ xử lý</Option>
                <Option value="1">Đang tư vấn & phác thảo</Option>
                <Option value="19">Phác thảo lại</Option> 
                <Option value="2">Đang xác định giá TK</Option>
                <Option value="24">Xác định lại giá TK</Option>
                <Option value="22">Hoàn thành giá TK</Option>
                <Option value="21">Chờ đặt cọc</Option>
                <Option value="14">Đã hủy</Option>
                {/* Add other relevant statuses for filtering if needed */}
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
                {/* <Button type="primary" icon={<FilterOutlined />} onClick={applyFilters}> Lọc </Button> - Filtering happens onChange now */}
                <Button onClick={resetFilters}>Đặt lại bộ lọc</Button>
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
