import React, { useEffect } from "react";
import { Table, Tag, Space, Tooltip } from "antd";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import useDesignerTask from "@/stores/useDesignerTask";
import useAuthStore from "@/stores/useAuthStore";

const TaskList = () => {
  const { tasks, isLoading, fetchTasks } = useDesignerTask();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
    }
  }, [user]);

  const getStatusColor = (status, serviceOrderStatus) => {
    // Task status colors
    const taskStatusColors = {
      ConsultingAndSket: "purple",
      DoneConsulting: "green",
      Design: "processing",
      DoneDesign: "success",
      DesignDetail: "processing",
      DoneDesignDetail: "success"
    };

    // Service order status colors
    const serviceOrderStatusColors = {
      Pending: "default",
      ConsultingAndSketching: "blue",
      DeterminingDesignPrice: "orange",
      DepositSuccessful: "green",
      AssignToDesigner: "blue",
      DeterminingMaterialPrice: "orange",
      DoneDesign: "success",
      PaymentSuccess: "green",
      Processing: "processing",
      PickedPackageAndDelivery: "processing",
      DeliveryFail: "error",
      ReDelivery: "warning",
      DeliveredSuccessfully: "success",
      CompleteOrder: "success",
      OrderCancelled: "error",
      Warning: "warning",
      Refund: "warning",
      DoneRefund: "success",
      Completed: "success",
      ReConsultingAndSketching: "orange",
      ReDesign: "orange",
      WaitDeposit: "gold"
    };

    // Return color based on service order status if available, otherwise use task status
    return serviceOrderStatusColors[serviceOrderStatus] || taskStatusColors[status] || "default";
  };

  const getStatusText = (status, serviceOrderStatus) => {
    // Task status texts
    const taskStatusTexts = {
      ConsultingAndSket: "Tư vấn & Phác thảo",
      DoneConsulting: "Hoàn thành tư vấn",
      Design: "Đang thiết kế",
      DoneDesign: "Hoàn thành thiết kế",
      DesignDetail: "Đang thiết kế chi tiết",
      DoneDesignDetail: "Hoàn thành thiết kế chi tiết"
    };

    // Service order status texts
    const serviceOrderStatusTexts = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      DeterminingDesignPrice: "Đang xác định giá",
      DepositSuccessful: "Đặt cọc thành công",
      AssignToDesigner: "Đã giao cho nhà thiết kế",
      DeterminingMaterialPrice: "Xác định giá vật liệu",
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
      DoneRefund: "Hoàn tiền thành công",
      Completed: "Hoàn thành",
      ReConsultingAndSketching: "Phác thảo lại",
      ReDesign: "Thiết kế lại",
      WaitDeposit: "Chờ đặt cọc"
    };

    // Return text based on service order status if available, otherwise use task status
    return serviceOrderStatusTexts[serviceOrderStatus] || taskStatusTexts[status] || status;
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <span className="font-mono">#{text.slice(0, 8)}</span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: ["serviceOrder", "userName"],
      key: "customerName",
    },
    {
      title: "Loại dịch vụ",
      dataIndex: ["serviceOrder", "serviceType"],
      key: "serviceType",
      render: (text) =>
        text === "UsingDesignIdea"
          ? "Sử dụng mẫu thiết kế"
          : "Thiết kế tùy chỉnh",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={getStatusColor(status, record.serviceOrder?.status)}>
            {getStatusText(status, record.serviceOrder?.status)}
          </Tag>
          {record.serviceOrder?.status && record.serviceOrder.status !== status && (
            <Tag color={getStatusColor(status)}>
              Task: {getStatusText(status)}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Ghi chú từ staff",
      dataIndex: "note",
      key: "note",
      render: (text) => {
        const displayText = text || "---";
        const truncatedText = displayText.length > 50 
          ? displayText.slice(0, 50) + "..." 
          : displayText;
        
        return (
          <Tooltip title={displayText}>
            <span>{truncatedText}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "creationDate",
      key: "creationDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Link
            to={`/designer/tasks/${record.id}`}
            className="text-blue-500 hover:text-blue-700"
          >
            Xem chi tiết
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Danh sách công việc</h1>
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} công việc`,
        }}
      />
    </div>
  );
};

export default TaskList;
