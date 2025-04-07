import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Card,
  Tag,
  Space,
  Button,
  Tooltip,
  message,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import useAccountantStore from "../../stores/useAccountantStore";
import dayjs from "dayjs";

const ServiceOrderList = () => {
  const navigate = useNavigate();
  const { serviceOrders, isLoading, fetchServiceOrders } = useAccountantStore();

  useEffect(() => {
    fetchServiceOrders();
  }, []);

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
          <Tooltip title="Xem chi tiết">
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
      <Table
        columns={columns}
        dataSource={serviceOrders}
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