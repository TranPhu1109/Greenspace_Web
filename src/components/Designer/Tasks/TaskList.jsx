import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Table, Tag, Space, Tooltip, Popover, Input, DatePicker, Select, Row, Col } from "antd";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import useDesignerTask from "@/stores/useDesignerTask";
import useAuthStore from "@/stores/useAuthStore";
import useNotificationStore from "@/stores/useNotificationStore";
import { BellOutlined } from "@ant-design/icons";
import { getFormattedNotificationContent, getNotificationType } from "@/utils/notificationUtils";
import { useSignalRMessage } from "@/hooks/useSignalR";

dayjs.extend(isBetween);

const TaskList = () => {
  const { tasks: rawTasks, fetchTasks, fetchTasksSilent } = useDesignerTask();
  const { notifications } = useNotificationStore();
  const { user } = useAuthStore();

  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedOrderStatuses, setSelectedOrderStatuses] = useState([]);
  const [selectedTaskStatuses, setSelectedTaskStatuses] = useState([]);
  const [appointmentDateRange, setAppointmentDateRange] = useState(null);
  const [creationDateRange, setCreationDateRange] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSilentUpdating, setIsSilentUpdating] = useState(false);
  const [cachedTasks, setCachedTasks] = useState([]);

  const silentFetchTimeoutRef = useRef(null);
  const isSilentUpdatingRef = useRef(false);
  const latestTasksRef = useRef([]);

  const userId = user?.id;

  useEffect(() => {
    if (rawTasks) {
      latestTasksRef.current = rawTasks;

      if (!isSilentUpdatingRef.current) {
        setCachedTasks(rawTasks);
      } else {
        setTimeout(() => {
          setCachedTasks(rawTasks);
        }, 50);
      }
    }
  }, [rawTasks]);

  const silentFetch = useCallback(async () => {
    if (isSilentUpdatingRef.current || !userId) {
      return;
    }

    if (silentFetchTimeoutRef.current) {
      clearTimeout(silentFetchTimeoutRef.current);
    }

    silentFetchTimeoutRef.current = setTimeout(async () => {
      try {
        isSilentUpdatingRef.current = true;
        setIsSilentUpdating(true);

        await fetchTasksSilent(userId);
      } catch (error) {
        console.error("Silent fetch error:", error);
      } finally {
        isSilentUpdatingRef.current = false;
        setIsSilentUpdating(false);
      }
    }, 100); // 100ms debounce for faster response
  }, [userId, fetchTasksSilent]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (silentFetchTimeoutRef.current) {
        clearTimeout(silentFetchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      if (userId) {
        try {
          await fetchTasks(userId);
        } finally {
          setInitialLoading(false);
        }
      }
    };
    loadInitialData();
  }, [userId, fetchTasks]);

  // SignalR integration using optimized hook with silent fetch
  useSignalRMessage(
    () => {
      silentFetch();
    },
    [silentFetch]
  );
  
  

  const unreadTaskMap = useMemo(() => {
    const map = {};
    notifications
      .filter(n => !n.isSeen)
      .forEach(n => {
        const match = n.title.match(/: ([\w-]{36})$/); // Tìm UUID
        const taskId = match?.[1];
        if (taskId) {
          // const isNewTask = n.title.startsWith("Nhiệm vụ mới");
          map[taskId] = {
            content: n.content,
            notificationId: n.id,
            // type: isNewTask ? 'new' : 'update'
            type: getNotificationType(n)
          };
        }
      });
    return map;
  }, [notifications]);

  const getRowStyle = (type) => {
    switch (type) {
      case "new_task":
        return { backgroundColor: "#e6fffb", borderLeft: "4px solid #13c2c2" }; // xanh
      case "task_update":
      case "order_update":
        return { backgroundColor: "#fffbe6", borderLeft: "4px solid #faad14" }; // vàng
      case "warning":
        return { backgroundColor: "#fff1f0", borderLeft: "4px solid #ff4d4f" }; // đỏ
      default:
        return {};
    }
  };
  

  // Use cached tasks to prevent table clearing during updates
  const allTasks = useMemo(() => {
    // Use cached tasks if available, otherwise fallback to raw tasks
    const tasksToUse = cachedTasks.length > 0 ? cachedTasks : (rawTasks || []);
    return tasksToUse;
  }, [cachedTasks, rawTasks]);

  // Memoize filtered tasks to prevent re-computation on every render
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

    filteredTasks.sort((a, b) => {
      const modA = a.serviceOrder?.modificationDate ? dayjs(a.serviceOrder.modificationDate) : dayjs(0);
      const modB = b.serviceOrder?.modificationDate ? dayjs(b.serviceOrder.modificationDate) : dayjs(0);
      return modB.valueOf() - modA.valueOf(); // mới nhất lên trước
    });

    return filteredTasks;
  }, [allTasks, globalSearch, selectedOrderStatuses, selectedTaskStatuses, appointmentDateRange, creationDateRange]);



  // --- Màu và Text cho TRẠNG THÁI ĐƠN HÀNG ---
  const serviceOrderStatusColors = {
    Pending: "default",
    ConsultingAndSketching: "processing", // Đang tư vấn & phác thảo
    DeterminingDesignPrice: "warning", // Đang xác định giá
    DepositSuccessful: "success", // Đặt cọc thành công
    AssignToDesigner: "processing", // Đã giao cho nhà thiết kế
    DeterminingMaterialPrice: "warning", // Xác định giá vật liệu
    DoneDesign: "success", // Hoàn thành thiết kế
    PaymentSuccess: "success", // Thanh toán thành công
    Processing: "processing", // Đang xử lý
    PickedPackageAndDelivery: "processing", // Đã lấy hàng & đang giao
    DeliveryFail: "error", // Giao hàng thất bại
    ReDelivery: "warning", // Giao lại
    DeliveredSuccessfully: "success", // Đã giao hàng thành công
    CompleteOrder: "success", // Hoàn thành đơn hàng
    OrderCancelled: "error", // Đơn hàng đã bị hủy
    Warning: "error", // Cảnh báo vượt 30%
    Refund: "warning", // Hoàn tiền
    DoneRefund: "success", // Hoàn tiền thành công
    Completed: "success", // Hoàn thành
    ReConsultingAndSketching: "warning", // Phác thảo lại
    ReDesign: "warning", // Thiết kế lại
    WaitDeposit: "warning", // Chờ đặt cọc
    DoneDeterminingDesignPrice: "success", // Đã xác định giá
    DoneDeterminingMaterialPrice: "success", // Đã xác định giá vật liệu
    ReDeterminingDesignPrice: "warning", // Xác định giá lại
    ReDetermineMaterialPrice: "warning", // Xác định giá vật liệu lại
    MaterialPriceConfirmed: "success", // Giá vật liệu đã xác định
    Installing: "processing", // Đang lắp đặt
    DoneInstalling: "success", // Đã lắp đặt
    ReInstall: "warning", // Lắp đặt lại
    Successfully: "success", // Đơn hàng hoàn tất
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
    WaitDeposit: "Chờ đặt cọc",
    DoneDeterminingDesignPrice: "Đã xác định giá",
    DoneDeterminingMaterialPrice: "Đã xác định giá vật liệu",
    ReDeterminingDesignPrice: "Xác định giá lại",
    ReDetermineMaterialPrice: "Yêu cầu điều chỉnh vật liệu",
    MaterialPriceConfirmed: "Giá vật liệu đã xác định",
    Installing: "Đang lắp đặt",
    DoneInstalling: "Đã lắp đặt",
    ReInstall: "Lắp đặt lại",
    Successfully: "Đơn hàng hoàn tất"
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
      render: (id) => {
        const notif = unreadTaskMap[id];
      
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {notif && (
              <Tooltip title={notif ? getFormattedNotificationContent(notif) : undefined}>
                <BellOutlined style={{ color: notif.type === 'new' ? '#13c2c2' : '#fa541c' }} />
              </Tooltip>
            )}
            <span className="font-mono">#{id.slice(0, 8)}</span>
          </div>
        );
      }
      
      // render: (text) => (
      //   <span className="font-mono">#{text.slice(0, 8)}</span>
      // ),
    },
    {
      title: "Khách hàng",
      dataIndex: ["serviceOrder", "userName"],
      key: "customerName",
      filters: customerFilters,
      onFilter: (value, record) => record.serviceOrder?.userName === value,
      filterSearch: true
    },
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
        return dayjs(`${date} ${time}`).format("DD/MM/YYYY - HH:mm");
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
        loading={initialLoading}
        style={{
          opacity: isSilentUpdating ? 0.8 : 1,
          transition: 'opacity 0.2s ease'
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} công việc`,
        }}
        onRow={(record) => {
          const notif = unreadTaskMap[record.id];
          return {
            onClick: () => {
              if (notif?.notificationId) {
                useNotificationStore.getState().markAsRead(notif.notificationId);
              }
            },
            style: notif ? getRowStyle(notif.type) : {},
          };
        }}
      />
    </div>
  );
};

export default TaskList;
