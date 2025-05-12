import React, { useEffect, useMemo, useState } from "react";
import { Table, Tag, Space, Tooltip, Popover, Input, DatePicker, Select, Row, Col } from "antd";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import useDesignerTask from "@/stores/useDesignerTask";
import useAuthStore from "@/stores/useAuthStore";

dayjs.extend(isBetween);

const TaskList = () => {
  const { tasks: rawTasks, isLoading, fetchTasks } = useDesignerTask();
  const { user } = useAuthStore();

  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedOrderStatuses, setSelectedOrderStatuses] = useState([]);
  const [selectedTaskStatuses, setSelectedTaskStatuses] = useState([]);
  const [appointmentDateRange, setAppointmentDateRange] = useState(null);
  const [creationDateRange, setCreationDateRange] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
    }
  }, [user]);

  const allTasks = useMemo(() => rawTasks ?? [], [rawTasks]);

  // Giữ riêng dữ liệu đã filter search chung
  const tasks = useMemo(() => {
    let filteredTasks = allTasks;

    if (globalSearch) {
      const lower = globalSearch.toLowerCase();
      filteredTasks = filteredTasks.filter(t =>
        (t.userName && t.userName.toLowerCase().includes(lower)) ||
        (t.serviceOrder?.userName && t.serviceOrder.userName.toLowerCase().includes(lower)) ||
        (t.status && t.status.toLowerCase().includes(lower))
      );
    }

    if (selectedOrderStatuses.length > 0) {
      filteredTasks = filteredTasks.filter(t => t.serviceOrder && selectedOrderStatuses.includes(t.serviceOrder.status));
    }

    if (selectedTaskStatuses.length > 0) {
      filteredTasks = filteredTasks.filter(t => selectedTaskStatuses.includes(t.status));
    }

    if (appointmentDateRange && appointmentDateRange[0] && appointmentDateRange[1]) {
      filteredTasks = filteredTasks.filter(t => {
        if (!t.dateAppointment || !t.timeAppointment) return false;
        const appointmentDate = dayjs(`${t.dateAppointment} ${t.timeAppointment}`);
        return appointmentDate.isBetween(appointmentDateRange[0], appointmentDateRange[1], 'day', '[]');
      });
    }

    if (creationDateRange && creationDateRange[0] && creationDateRange[1]) {
      filteredTasks = filteredTasks.filter(t => {
        if (!t.creationDate) return false;
        const creationDate = dayjs(t.creationDate);
        return creationDate.isBetween(creationDateRange[0], creationDateRange[1], 'day', '[]');
      });
    }

    return filteredTasks;
  }, [allTasks, globalSearch, selectedOrderStatuses, selectedTaskStatuses, appointmentDateRange, creationDateRange]);

  

  // --- Màu và Text cho TRẠNG THÁI ĐƠN HÀNG ---
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

  const getOrderStatusColor = (status) => serviceOrderStatusColors[status] || "default";
  const getOrderStatusText = (status) => serviceOrderStatusTexts[status] || status;

  // --- Màu và Text cho TRẠNG THÁI CÔNG VIỆC (TASK) ---
  const taskStatusColors = {
    ConsultingAndSket: "purple",
    DoneConsulting: "green",
    Design: "processing",
    DoneDesign: "success",
    DesignDetail: "processing",
    DoneDesignDetail: "success"
  };

  const taskStatusTexts = {
    ConsultingAndSket: "Tư vấn & Phác thảo",
    DoneConsulting: "Hoàn thành tư vấn",
    Design: "Đang thiết kế",
    DoneDesign: "Hoàn thành thiết kế",
    DesignDetail: "Đang thiết kế chi tiết",
    DoneDesignDetail: "Hoàn thành thiết kế chi tiết"
  };

  const getTaskStatusColor = (status) => taskStatusColors[status] || "default";
  const getTaskStatusText = (status) => taskStatusTexts[status] || status;


  // Tạo filters động
  const customerFilters = useMemo(() => {
    return Array.from(
      new Set(
        allTasks
          .map(t => t.serviceOrder?.userName)
          .filter(Boolean)
      )
    ).map(u => ({ text: u, value: u }));
  }, [allTasks]);

  const orderStatusFilterOptions = useMemo(() => {
    return Array.from(
      new Set(
        allTasks
          .map(t => t.serviceOrder?.status)
          .filter(Boolean)
      )
    ).map(s => ({ label: getOrderStatusText(s), value: s }));
  }, [allTasks]);

  const taskStatusFilterOptions = useMemo(() => {
    return Array.from(
      new Set(
        allTasks
          .map(t => t.status)
          .filter(Boolean)
      )
    ).map(s => ({ label: getTaskStatusText(s), value: s }));
  }, [allTasks]);

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
      filters: customerFilters,
      onFilter: (value, record) => record.serviceOrder?.userName === value,
      filterSearch: true
    },
    // {
    //   title: "Loại dịch vụ",
    //   dataIndex: ["serviceOrder", "serviceType"],
    //   key: "serviceType",
    //   render: (text) =>
    //     text === "UsingDesignIdea"
    //       ? "Sử dụng mẫu thiết kế"
    //       : "Thiết kế tùy chỉnh",
    // },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (noteHtml) => {
        if (!noteHtml) return "Không có";
        return (
          <Popover
            placement="right"
            title="Ghi chú"
            content={<div className="html-preview" dangerouslySetInnerHTML={{ __html: noteHtml }} />}
            trigger="hover"
          >
            <div
              className="cursor-pointer hover:underline"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              dangerouslySetInnerHTML={{ __html: noteHtml }}
            />
          </Popover>
        );
      },
    },
    {
      title: "Lịch hẹn gặp khách hàng",
      dataIndex: ["dateAppointment", "timeAppointment"],
      key: "appointment",
      render: (_, record) => {
        if (!record.dateAppointment && !record.timeAppointment) return "Không có";
        const date = record.dateAppointment;
        const time = record.timeAppointment;
        return dayjs(`${date} ${time}`).format("DD/MM/YYYY HH:mm");
      },
    },
    {
      title: "Trạng thái đơn hàng",
      key: "orderStatus",
      render: (_, record) => {
        const orderStatus = record.serviceOrder?.status;
        if (!orderStatus) return <Tag>Không có</Tag>;
        return (
          <Tag color={getOrderStatusColor(orderStatus)}>
            {getOrderStatusText(orderStatus)}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái công việc",
      dataIndex: "status",
      key: "taskStatus",
      render: (status) => (
        <Tag color={getTaskStatusColor(status)}>
          {getTaskStatusText(status)}
        </Tag>
      ),
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
      <Row gutter={[16, 16]} className="mb-4" align="bottom">
        <Col>
          <div style={{ marginBottom: '8px', fontWeight: 500 }}>Tìm kiếm:</div>
          <Input.Search
            placeholder="Tìm kiếm theo khách, task, status…"
            allowClear
            onSearch={setGlobalSearch}
            style={{ width: 300 }}
          />
        </Col>
        <Col>
          <div style={{ marginBottom: '8px', fontWeight: 500 }}>Trạng thái đơn hàng:</div>
          <Select
            mode="multiple"
            allowClear
            style={{ width: 200 }}
            placeholder="Trạng thái đơn hàng"
            onChange={setSelectedOrderStatuses}
            options={orderStatusFilterOptions}
            maxTagCount="responsive"
          />
        </Col>
        <Col>
          <div style={{ marginBottom: '8px', fontWeight: 500 }}>Trạng thái công việc:</div>
          <Select
            mode="multiple"
            allowClear
            style={{ width: 200 }}
            placeholder="Trạng thái công việc"
            onChange={setSelectedTaskStatuses}
            options={taskStatusFilterOptions}
            maxTagCount="responsive"
          />
        </Col>
        <Col>
          <div style={{ marginBottom: '8px', fontWeight: 500 }}>Lịch hẹn:</div> 
          <DatePicker.RangePicker
            style={{ width: 240 }}
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={setAppointmentDateRange}
          />
        </Col>
        <Col>
          <div style={{ marginBottom: '8px', fontWeight: 500 }}>Ngày tạo:</div>
          <DatePicker.RangePicker
            style={{ width: 240 }}
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={setCreationDateRange}
          />
        </Col>
      </Row>
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
