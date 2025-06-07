import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Card,
  Tag,
  Space,
  Button,
  Tooltip,
  message,
  Radio,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import useAccountantStore from "../../stores/useAccountantStore";
import { useSignalRMessage } from "@/hooks/useSignalR";
import dayjs from "dayjs";

const ServiceOrderList = () => {
  const navigate = useNavigate();
  const {
    serviceOrders,
    materialPriceOrders,
    isLoading,
    fetchServiceOrders,
    fetchMaterialPriceOrders,
    fetchServiceOrdersSilent,
    fetchMaterialPriceOrdersSilent
  } = useAccountantStore();
  const [filterStatus, setFilterStatus] = useState("all");
  const [allOrders, setAllOrders] = useState([]);

  // Silent fetch functions that don't trigger loading state
  const silentLoadAllOrders = useCallback(async () => {
    try {
      console.log('🔄 Silent load all orders...');
      await Promise.all([
        fetchMaterialPriceOrdersSilent()
        // fetchServiceOrdersSilent() // Uncomment if needed
      ]);
      console.log('✅ Silent load all orders completed');
    } catch (error) {
      console.warn('⚠️ Silent load all orders failed:', error);
    }
  }, [fetchMaterialPriceOrdersSilent]);

  const loadAllOrders = useCallback(async () => {
    try {
      await Promise.all([
        // fetchServiceOrders(),
        fetchMaterialPriceOrders()
      ]);
    } catch (error) {
      // message.error("Không thể tải danh sách đơn hàng");
    }
  }, [fetchMaterialPriceOrders]);

  useEffect(() => {
    loadAllOrders();
  }, [loadAllOrders]);

  useEffect(() => {
    filterOrders();
  }, [filterStatus, serviceOrders, materialPriceOrders]);

  // SignalR integration using optimized hook with silent fetch
  useSignalRMessage(
    () => {
      console.log('📡 SignalR message received, performing silent data refresh...');
      silentLoadAllOrders();
    },
    [silentLoadAllOrders]
  );

  const filterOrders = () => {
    let filteredOrders = [];
    
    if (filterStatus === "all") {
      // Kết hợp cả hai danh sách và loại bỏ trùng lặp
      const combinedOrders = [...serviceOrders, ...materialPriceOrders];
      const uniqueOrders = combinedOrders.filter((order, index, self) => 
        index === self.findIndex((o) => o.id === order.id)
      );
      filteredOrders = uniqueOrders;
    } else if (filterStatus === "designPrice") {
      // Lọc đơn hàng có trạng thái DeterminingDesignPrice
      filteredOrders = serviceOrders.filter(order => 
        order.status === "DeterminingDesignPrice"
      );
    } else if (filterStatus === "materialPrice") {
      // Lấy đơn hàng từ materialPriceOrders
      filteredOrders = materialPriceOrders;
    }
    
    setAllOrders(filteredOrders);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "gold",
      ConsultingAndSketching: "blue",
      DeterminingDesignPrice: "purple",
      DepositSuccessful: "green",
      DeterminingMaterialPrice: "cyan",
      AssignToDesigner: "orange",
      DoneDesign: "volcano",
      PaymentSuccess: "green",
      Processing: "processing",
      PickedPackageAndDelivery: "processing",
      DeliveryFail: "error",
      ReDelivery: "warning",
      DeliveredSuccessfully: "success",
      CompleteOrder: "success",
      OrderCancelled: "error",
      Warning: "orange",
      Refund: "purple",
      DoneRefund: "green",
      Completed: "success",
      ReConsultingAndSketching: "blue",
      ReDesign: "volcano",
      WaitDeposit: "gold",
      ReDetermineMaterialPrice: "volcano",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      DeterminingDesignPrice: "Đang xác định giá thiết kế",
      DepositSuccessful: "Đặt cọc thành công",
      DeterminingMaterialPrice: "Xác định giá vật liệu",
      AssignToDesigner: "Đã giao cho nhà thiết kế",
      DoneDesign: "Hoàn thành thiết kế",
      PaymentSuccess: "Thanh toán thành công",
      Processing: "Đang xử lý",
      PickedPackageAndDelivery: "Đã lấy hàng & đang giao",
      DeliveryFail: "Giao hàng thất bại",
      ReDelivery: "Giao lại",
      DeliveredSuccessfully: "Đã giao hàng thành công",
      CompleteOrder: "Hoàn thành đơn hàng",
      OrderCancelled: "Đơn hàng đã bị hủy",
      Warning: "Cảnh báo vượt 30%",
      Refund: "Hoàn tiền",
      DoneRefund: "Đã hoàn tiền",
      Completed: "Hoàn thành",
      ReConsultingAndSketching: "Phác thảo lại",
      ReDesign: "Thiết kế lại",
      WaitDeposit: "Chờ đặt cọc",
      ReDetermineMaterialPrice: "Yêu cầu điều chỉnh giá sản phẩm",
    };
    return statusTexts[status] || status;
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: (text) => <span>#{text.substring(0, 8)}</span>,
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
      title: "Ngày tạo",
      dataIndex: "creationDate",
      key: "creationDate",
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Tổng chi phí",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (text) => (
        <span>{text?.toLocaleString("vi-VN") || "0"} đ</span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip 
           styles={{
            body: {
              maxHeight: 500,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#d9d9d9 #f0f0f0',
            },
          }}
          title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/accountant/service-orders/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Danh sách đơn thiết kế">
      <div className="mb-4">
        <Radio.Group 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="all">Tất cả đơn hàng</Radio.Button>
          <Radio.Button value="designPrice">Xác định giá thiết kế</Radio.Button>
          <Radio.Button value="materialPrice">Xác định giá vật liệu</Radio.Button>
        </Radio.Group>
      </div>
      <Table
        columns={columns}
        dataSource={allOrders}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} đơn hàng`,
        }}
      />
    </Card>
  );
};

export default ServiceOrderList; 