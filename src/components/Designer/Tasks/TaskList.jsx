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

  const getStatusColor = (status) => {
    const statusColors = {
      ConsultingAndSket: "blue",
      ConsultingAndSketching: "blue",
      WaitDeposit: "gold",
      DoneConsulting: "green",
      DepositSuccessful: "blue",
      AssignToDesigner: "blue",
      DeterminingMaterialPrice: "blue",
      DoneDesign: "blue",
      PaymentSuccess: "blue",
      Processing: "blue",
      Designing: "processing",
      Completed: "success",
      Cancelled: "error",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      ConsultingAndSket: "Tư vấn & Phác thảo",
      ConsultingAndSketching: "Tư vấn & Phác thảo",
      WaitDeposit: "Chờ đặt cọc",
      DoneConsulting: "Hoàn tất tư vấn & Phác thảo",
      DepositSuccessful: "Đã ký hợp đồng và đặt cọc 50% giá thiết kế",
      AssignToDesigner: "Thiết kế đang được Designer thực hiện",
      DeterminingMaterialPrice: "Bản vẽ hoàn chỉnh đã hoàn thành, đang xác định giá vật liệu",
      DoneDesign: "Bản vẽ thiết kế và danh sách vật liệu đã hoàn tất",
      Designing: "Đang thiết kế",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
    };
    return statusTexts[status] || status;
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <span className="font-mono">{text.slice(0, 8)}...</span>
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
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
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
