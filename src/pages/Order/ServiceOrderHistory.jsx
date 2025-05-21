import React, { useEffect, useState, useRef } from "react";
import useServiceOrderStore from "@/stores/useServiceOrderStore";
import {
  Typography,
  Spin,
  Alert,
  Table,
  Tag,
  Layout,
  Button,
  Space,
  Tooltip,
  Dropdown,
  Modal,
  message,
  Breadcrumb,
  Form,
  DatePicker,
  TimePicker,
  Input,
  Select
} from "antd";
import { format } from "date-fns";
import dayjs from "dayjs";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import useAuthStore from "@/stores/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  HistoryOutlined,
  ToolOutlined,
  CheckOutlined,
  SearchOutlined,
  FilterOutlined
} from "@ant-design/icons";
import api from "@/api/api";

const { Title, Text } = Typography;
const { Content } = Layout;
const { confirm } = Modal;
const { TextArea } = Input;

const ServiceOrderHistory = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    serviceOrders,
    loading,
    error,
    getServiceOrdersNoUsingIdea,
    cancelServiceOrder
  } = useServiceOrderStore();
  const [localError, setLocalError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [reinstallModalVisible, setReinstallModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [reinstallForm] = Form.useForm();
  const [reinstallLoading, setReinstallLoading] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.id) {
        try {
          setLocalError(null);
          const response = await getServiceOrdersNoUsingIdea(user.id);
          setAllOrders(response);
          setDataLoaded(true);
        } catch (err) {
          console.error("Error fetching service orders:", err);
          setLocalError(err.message || "Không thể tải danh sách đơn hàng");
        }
      }
    };

    fetchOrders();
  }, [user?.id, getServiceOrdersNoUsingIdea]);

  // Apply both filters and get the filtered data
  const getFilteredOrders = () => {
    let filtered = [...allOrders];

    // Apply search by ID if keyword exists
    if (searchKeyword) {
      filtered = filtered.filter(order =>
        order.id?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // Apply status filter if selected
    if (statusFilter) {
      filtered = filtered.filter(order =>
        order.status === statusFilter
      );
    }

    return filtered;
  };

  // Get the filtered data
  const filteredOrders = getFilteredOrders();

  // Handle search by order ID
  const handleSearch = (value) => {
    const keyword = value.trim().toLowerCase().replace('#', '');
    setSearchKeyword(keyword);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle filter by status
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchKeyword('');
    setStatusFilter(null);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCancelOrder = (orderId) => {
    confirm({
      title: 'Xác nhận hủy đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.',
      okText: 'Hủy đơn hàng',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setCancellingOrderId(orderId);
          await cancelServiceOrder(orderId);
          message.success('Đã hủy đơn hàng thành công');
        } catch (err) {
          message.error(err.message || 'Không thể hủy đơn hàng');
        } finally {
          setCancellingOrderId(null);
        }
      },
    });
  };

  const handleCompleteInstallation = async (orderId, worktaskId) => {
    confirm({
      title: 'Xác nhận hoàn thành đơn hàng',
      content: 'Bạn có chắc chắn muốn xác nhận đơn hàng đã được lắp đặt hoàn tất và hài lòng?',
      icon: <CheckOutlined style={{ color: '#52c41a' }} />,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setProcessingOrder(orderId);

          // First update order status to Successfully (31)
          const orderResponse = await api.put(`/api/serviceorder/status/${orderId}`, {
            status: 31, // Successfully
            reportManger: "",
            reportAccoutant: ""
          });

          // Find the order to get work tasks and other information
          const order = serviceOrders.find(order => order.id === orderId);

          // Find most recent workTask if available
          if (order?.workTasks && order.workTasks.length > 0) {
            // Sort by creationDate (newest first)
            const sortedTasks = [...order.workTasks].sort((a, b) =>
              new Date(b.creationDate) - new Date(a.creationDate)
            );

            const latestTask = sortedTasks[0];

            // Update the latest task to Completed (6)
            const taskResponse = await api.put(`/api/worktask/${latestTask.id}`, {
              serviceOrderId: orderId,
              userId: latestTask.userId,
              dateAppointment: order.contructionDate,
              timeAppointment: order.contructionTime,
              status: 6, // Completed
              note: "Khách hàng đã xác nhận hoàn thành lắp đặt và hài lòng với sản phẩm" // Standard completion message
            });
          }
          // Fallback to using worktaskId if workTasks array not available
          else if (worktaskId) {
            const taskResponse = await api.put(`/api/worktask/${worktaskId}`, {
              serviceOrderId: orderId,
              userId: order.userId,
              dateAppointment: order.contructionDate,
              timeAppointment: order.contructionTime,
              status: 6, // Completed
              note: "Khách hàng đã xác nhận hoàn thành lắp đặt và hài lòng với sản phẩm" // Standard completion message
            });
          }

          // Refresh service orders
          await getServiceOrdersNoUsingIdea(user.id);

          message.success('Xác nhận hoàn thành đơn hàng thành công');
        } catch (err) {
          message.error(err.message || 'Không thể hoàn thành đơn hàng');
        } finally {
          setProcessingOrder(null);
        }
      },
    });
  };

  const showReinstallModal = (orderId, taskId) => {
    setSelectedOrderId(orderId);
    setSelectedTaskId(taskId);
    reinstallForm.resetFields();

    // Set default date/time values based on current time
    const today = dayjs();
    const defaultDate = today.add(2, 'day'); // Mặc định là 2 ngày sau ngày hiện tại
    const defaultTime = dayjs('09:00', 'HH:mm');

    reinstallForm.setFieldsValue({
      date: defaultDate,
      time: defaultTime
    });

    setReinstallModalVisible(true);
  };

  const handleReinstallCancel = () => {
    setReinstallModalVisible(false);
    setSelectedOrderId(null);
    setSelectedTaskId(null);
  };

  const handleReinstallSubmit = async () => {
    try {
      const values = await reinstallForm.validateFields();
      setReinstallLoading(true);

      // Format the date and time for API
      const contructionDate = values.date.format('YYYY-MM-DD');
      const contructionTime = values.time.format('HH:mm:00'); // Format giống DeliveryScheduler
      const reason = values.reason; // Get reason from form

      // Step 1: Set construction date and time
      const contructorResponse = await api.put(`/api/serviceorder/contructor/${selectedOrderId}`, {
        contructionDate: contructionDate,
        contructionTime: contructionTime,
        contructionPrice: 0
      });

      if (contructorResponse.status !== 200) {
        throw new Error('Không thể cập nhật thời gian lắp đặt lại');
      }

      // Step 2: Update order status to ReInstall (29)
      const orderResponse = await api.put(`/api/serviceorder/status/${selectedOrderId}`, {
        status: 29, // ReInstall
        reportManger: "",
        reportAccoutant: ""
      });

      // Find the order to get work tasks and other information
      const order = serviceOrders.find(order => order.id === selectedOrderId);

      // Step 3: Find most recent workTask and update it to ReInstall (10)
      if (order?.workTasks && order.workTasks.length > 0) {
        // Sort by creationDate (newest first)
        const sortedTasks = [...order.workTasks].sort((a, b) =>
          new Date(b.creationDate) - new Date(a.creationDate)
        );

        const latestTask = sortedTasks[0];

        const taskResponse = await api.put(`/api/worktask/${latestTask.id}`, {
          serviceOrderId: selectedOrderId,
          userId: latestTask.userId,
          dateAppointment: contructionDate,
          timeAppointment: contructionTime,
          status: 10, // ReInstall
          note: reason // Use the reason provided in the form
        });
      }
      // Fallback to using workTaskId if workTasks array not available
      else if (selectedTaskId) {
        const taskResponse = await api.put(`/api/worktask/${selectedTaskId}`, {
          serviceOrderId: selectedOrderId,
          userId: order.userId,
          dateAppointment: contructionDate,
          timeAppointment: contructionTime,
          status: 10, // ReInstall
          note: reason // Use the reason provided in the form
        });
      }

      // Refresh service orders
      await getServiceOrdersNoUsingIdea(user.id);

      message.success('Đã gửi yêu cầu lắp đặt lại thành công');
      setReinstallModalVisible(false);
      setSelectedOrderId(null);
      setSelectedTaskId(null);
    } catch (err) {
      message.error(err.message || 'Không thể gửi yêu cầu lắp đặt lại');
    } finally {
      setReinstallLoading(false);
    }
  };

  const handleRequestReinstall = (orderId, worktaskId) => {
    showReinstallModal(orderId, worktaskId);
  };

  // Function to scroll to top of table
  const scrollToTop = () => {
    const tableContainer = document.getElementById('service-orders-table');
    if (tableContainer) {
      const yOffset = -120; // Adjust this value to account for header or other fixed elements
      const y = tableContainer.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      // Fallback
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <Spin
        size="large"
        className="flex justify-center items-center min-h-[400px]"
      />
    );
  }

  // Use local error state if available, otherwise use store error
  const displayError = localError || error;

  if (!serviceOrders) {
    return (
      <Layout>
        <Header />
        <Content>
          <div className="container mx-auto px-4 py-8" style={{ marginTop: "200px" }}>
            <Alert
              type="error"
              message="Lỗi"
              description={displayError}
              className="mb-4"
            />
            <Button type="primary" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "orange",
      ConsultingAndSketching: "blue",
      DeterminingDesignPrice: "blue",
      DepositSuccessful: "green",
      AssignToDesigner: "geekblue",
      DeterminingMaterialPrice: "geekblue",
      DoneDesign: "volcano",
      PaymentSuccess: "green",
      Processing: "blue",
      PickedPackageAndDelivery: "cyan",
      DeliveryFail: "red",
      ReDelivery: "purple",
      DeliveredSuccessfully: "green",
      CompleteOrder: "green",
      OrderCancelled: "red",
      Warning: "orange",
      Refund: "gold",
      DoneRefund: "green",
      Completed: "green",
      NoDesignIdea: "default",
      StopService: "default", // Added missing status
      ReConsultingAndSketching: "warning", // Added missing status
      ReDesign: "warning", // Added missing status
      WaitDeposit: "purple", // Added missing status
      DoneDeterminingDesignPrice: "green", // Added missing status
      DoneDeterminingMaterialPrice: "green", // Added missing status
      ReDeterminingDesignPrice: "warning", // Added missing status
      ExchangeProdcut: "warning", // Added missing status
      Installing: "blue",
      DoneInstalling: "green",
      ReInstall: "red",
      Successfully: "green",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      DeterminingDesignPrice: "Đang tư vấn & phác thảo",
      DepositSuccessful: "Đặt cọc thành công",
      AssignToDesigner: "Đang trong quá trình thiết kế",
      DeterminingMaterialPrice: "Đang trong quá trình thiết kế",
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
      NoDesignIdea: "Không có mẫu thiết kế",
      StopService: "Dừng dịch vụ", // Added missing status
      ReConsultingAndSketching: "Phác thảo lại", // Added missing status
      ReDesign: "Thiết kế lại", // Added missing status
      WaitDeposit: "Chờ đặt cọc", // Added missing status
      DoneDeterminingDesignPrice: "Hoàn thành tư vấn & phác thảo", // Added missing status
      DoneDeterminingMaterialPrice: "Đã hoàn thành xác định giá vật liệu", // Added missing status
      ReDeterminingDesignPrice: "Xác định lại giá thiết kế", // Added missing status
      ExchangeProdcut: "Đổi sản phẩm", // Added missing status
      Installing: "Đang lắp đặt",
      DoneInstalling: "Đã lắp đặt xong",
      ReInstall: "Yêu cầu lắp đặt lại",
      Successfully: "Đơn hàng hoàn tất",
    };
    return statusTexts[status] || status;
  };

  // Create status options for the filter dropdown
  const statusOptions = [
    { value: 'Pending', label: 'Chờ xử lý' },
    { value: 'ConsultingAndSketching', label: 'Đang tư vấn & phác thảo' },
    { value: 'DeterminingDesignPrice', label: 'Đang xác định giá thiết kế' },
    { value: 'DepositSuccessful', label: 'Đặt cọc thành công' },
    { value: 'AssignToDesigner', label: 'Đang trong quá trình thiết kế' },
    { value: 'DeterminingMaterialPrice', label: 'Đang xác định giá vật liệu' },
    { value: 'DoneDesign', label: 'Hoàn thành thiết kế' },
    { value: 'PaymentSuccess', label: 'Thanh toán thành công' },
    { value: 'Processing', label: 'Đang xử lý' },
    { value: 'PickedPackageAndDelivery', label: 'Đang giao hàng' },
    { value: 'DeliveryFail', label: 'Giao hàng thất bại' },
    { value: 'DeliveredSuccessfully', label: 'Đã giao hàng thành công' },
    { value: 'Installing', label: 'Đang lắp đặt' },
    { value: 'DoneInstalling', label: 'Đã lắp đặt xong' },
    { value: 'ReInstall', label: 'Yêu cầu lắp đặt lại' },
    { value: 'OrderCancelled', label: 'Đã hủy' },
    { value: 'Successfully', label: 'Hoàn tất' },
  ];

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 150,
      render: (id) => (
        <Text copyable={{ text: id }}>#{id.slice(0, 8)}</Text>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "creationDate",
      key: "creationDate",
      width: 130,
      render: (date) => {
        const dateObj = new Date(date);
        return (
          <div>
            <div>{format(dateObj, "dd/MM/yyyy")}</div>
            <div style={{ color: '#888', fontSize: '12px' }}>{format(dateObj, "HH:mm")}</div>
          </div>
        );
      },      
      sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 180,
      render: (_, record) => (
        <div>
          <div>{record.userName}</div>
          <div>{record.cusPhone}</div>
        </div>
      ),
    },
    {
      title: "Kích thước",
      key: "dimensions",
      width: 150,
      render: (_, record) => `${record.length}m x ${record.width}m`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          style={{ maxWidth: '120px', whiteSpace: 'normal', wordBreak: 'break-word' }}
        >
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            label: (
              <Link to={`/service-order/${record.id}`}>
                <Space>
                  <EyeOutlined />
                  <span>Xem chi tiết</span>
                </Space>
              </Link>
            ),
          },
        ];

        // Add cancel option for pending orders
        if (record.status === 'Pending') {
          items.push({
            key: 'cancel',
            label: (
              <Space onClick={() => handleCancelOrder(record.id)}>
                <ExclamationCircleOutlined />
                <span>Hủy đơn hàng</span>
              </Space>
            ),
            danger: true,
          });
        }

        // Add complete installation and reinstall options for DoneInstalling orders
        if (record.status === 'DoneInstalling' || record.status === 28) {
          items.push({
            key: 'complete',
            label: (
              <Space onClick={() => handleCompleteInstallation(record.id, record.worktaskId)}>
                <CheckOutlined />
                <span>Xác nhận hoàn thành</span>
              </Space>
            ),
            style: { color: '#52c41a' },
          });

          items.push({
            key: 'reinstall',
            label: (
              <Space onClick={() => handleRequestReinstall(record.id, record.worktaskId)}>
                <ToolOutlined />
                <span>Yêu cầu lắp đặt lại</span>
              </Space>
            ),
            danger: true,
          });
        }

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              menu={{ items }}
              trigger={['click']}
              placement="bottomRight"
              disabled={cancellingOrderId === record.id || processingOrder === record.id}
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                loading={cancellingOrderId === record.id || processingOrder === record.id}
              />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  // Disable dates before today + 2 days (match DeliveryScheduler logic)
  const disabledDate = (current) => {
    const minAllowedDate = dayjs().add(2, 'day');
    return current && current < minAllowedDate.startOf('day');
  };

  return (
    <Layout>
      <Header />
      <Content>
        <div className="container mx-auto px-4 py-8" style={{ marginTop: "200px" }}>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/Home">
                    <Space>
                      <HomeOutlined style={{ fontSize: '16px' }} />
                      <span style={{ fontSize: '16px' }}>Trang chủ</span>
                    </Space>
                  </Link>
                ),
              },
              {
                title: (
                  <Space>
                    <HistoryOutlined style={{ fontSize: '16px' }} />
                    <span style={{ fontSize: '16px' }}>Lịch sử đơn đặt thiết kế mới</span>
                  </Space>
                ),
              },
            ]}
            style={{
              marginBottom: '16px',
              padding: '12px 16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          />
          <div id="service-orders-section" style={{
            marginBottom: "16px"
          }}>
            <div style={{
              marginBottom: 16,
              padding: '12px 16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}>
              <Space wrap size="middle">
                <Input.Search
                  prefix={<SearchOutlined />}
                  placeholder="Tìm theo mã đơn hàng"
                  allowClear
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onSearch={handleSearch}
                  style={{ width: 300 }}
                />

                <Select
                  allowClear
                  placeholder="Lọc theo trạng thái"
                  style={{ width: 200 }}
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  options={statusOptions}
                  suffixIcon={<FilterOutlined />}
                />

                {(searchKeyword || statusFilter) && (
                  <Button onClick={clearFilters}>Xóa bộ lọc</Button>
                )}
              </Space>
            </div>

            {/* <div id="service-orders-table" style={{
            marginBottom: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
          }}> */}
            <Table
              dataSource={filteredOrders}
              columns={columns}
              bordered
              loading={!dataLoaded}
              // size="middle"
              rowKey="id"
              tableLayout="fixed" 
              locale={{
                emptyText: filteredOrders.length === 0
                  ? (searchKeyword || statusFilter)
                    ? 'Không tìm thấy đơn hàng phù hợp với điều kiện lọc'
                    : 'Bạn chưa có đơn đặt thiết kế nào'
                  : undefined
              }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredOrders.length,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20', '50'],
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize });
                  setTimeout(() => {
                    scrollToTop();
                  }, 100);
                },
                style: { marginRight: '16px' }
              }}
              className="shadow-md"
              onRow={(record) => ({
                onClick: (e) => {
                  if (e.target.tagName !== 'BUTTON' &&
                    !e.target.closest('button') &&
                    e.target.tagName !== 'A' &&
                    !e.target.closest('a') &&
                    !e.target.closest('.ant-dropdown-trigger')) {
                    navigate(`/service-order/${record.id}`);
                  }
                },
                style: { cursor: 'pointer' }
              })}
            />
          </div>
        </div>

        {/* Modal for selecting reinstallation time */}
        <Modal
          title="Chọn thời gian lắp đặt lại"
          open={reinstallModalVisible}
          onCancel={handleReinstallCancel}
          footer={null}
          destroyOnClose={true}
        >
          <Form
            form={reinstallForm}
            layout="vertical"
            onFinish={handleReinstallSubmit}
          >
            <Alert
              message="Lưu ý về thời gian lắp đặt lại"
              description={
                <Text>
                  Để chuẩn bị sản phẩm và sắp xếp đội thi công, thời gian lắp đặt sớm nhất là sau 2 ngày kể từ ngày yêu cầu.
                </Text>
              }
              type="info"
              showIcon
              style={{ marginBottom: '20px' }}
            />
            <Form.Item
              name="date"
              label="Ngày lắp đặt lại"
              rules={[{ required: true, message: 'Vui lòng chọn ngày lắp đặt lại!' }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                placeholder="Chọn ngày"
                disabledDate={disabledDate}
              />
            </Form.Item>
            <Form.Item
              name="time"
              label="Giờ lắp đặt lại"
              rules={[{ required: true, message: 'Vui lòng chọn giờ lắp đặt lại!' }]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder="Chọn giờ"
                minuteStep={15}
              />
            </Form.Item>
            <Form.Item
              name="reason"
              label="Lý do lắp đặt lại"
              rules={[{ required: true, message: 'Vui lòng nhập lý do lắp đặt lại!' }]}
            >
              <TextArea
                rows={4}
                placeholder="Vui lòng nhập lý do cần lắp đặt lại"
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={handleReinstallCancel}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={reinstallLoading}
                  danger
                >
                  Xác nhận
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
      <Footer />
    </Layout>
  );
};

export default ServiceOrderHistory;
