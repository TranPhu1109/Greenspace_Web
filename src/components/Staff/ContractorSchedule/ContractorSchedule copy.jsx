import React, { useState, useEffect } from 'react';
import {
  Card,
  Calendar,
  Select,
  Button,
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Input,
  Typography,
  Badge,
  Space,
  Empty,
  message,
  Spin,
  Row,
  Col,
  Tooltip,
  Alert,
  Tabs,
  List,
  Avatar,
  Tag,
  Drawer,
  Descriptions
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  MailOutlined,
  HomeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/es/date-picker/locale/vi_VN';
import useContractorStore from '@/stores/useContractorStore';
import { useLocation } from 'react-router-dom';
import api from '@/api/api';
import useProductStore from '@/stores/useProductStore';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ContractorSchedule = () => {
  const location = useLocation();
  const { state } = location;
  const serviceOrderFromNav = state?.serviceOrderId;
  const customerNameFromNav = state?.customerName;
  const addressFromNav = state?.address;
  const autoOpenModal = state?.autoOpenModal;
  const existingConstructionDate = state?.contructionDate;
  const existingConstructionTime = state?.contructionTime;

  const [form] = Form.useForm();
  const {
    contractors,
    contractorTasks,
    serviceOrders,
    selectedContractor,
    isLoading,
    fetchContractors,
    fetchContractorTasks,
    createContractorTask,
    fetchAvailableServiceOrders,
    selectContractor
  } = useContractorStore();

  // Thêm productStore để fetch thông tin sản phẩm
  const { products, fetchProducts, getProductById } = useProductStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activeTab, setActiveTab] = useState('calendar');

  // State to track if a task has been successfully created
  const [taskCreated, setTaskCreated] = useState(false);

  // New states for task details display
  const [isTaskDetailsVisible, setIsTaskDetailsVisible] = useState(false);
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);
  const [selectedDateFormatted, setSelectedDateFormatted] = useState('');
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [loadingTaskDetails, setLoadingTaskDetails] = useState(false);

  // State để lưu tất cả các tasks từ tất cả contractors
  const [allContractorTasks, setAllContractorTasks] = useState([]);

  // State để lưu thông tin sản phẩm đã fetch
  const [productDetails, setProductDetails] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Thêm state mới để theo dõi contractor được chọn để xem lịch
  const [viewingContractor, setViewingContractor] = useState(null);

  // Log khi selectedTaskDetails thay đổi
  useEffect(() => {
    console.log("selectedTaskDetails changed:", selectedTaskDetails);
  }, [selectedTaskDetails]);

  useEffect(() => {
    // Load contractors when component mounts
    const loadInitialData = async () => {
      try {
        await fetchContractors();
        await fetchAvailableServiceOrders();

        // Tải tất cả các tasks ngay khi component load
        try {
          const allTasksResponse = await api.get('/api/worktask/contructor');
          if (allTasksResponse.status === 200 && allTasksResponse.data) {
            // Lưu tất cả các tasks vào state local
            const allTasks = allTasksResponse.data || [];
            // Không dùng set vì nó không được export từ store
            // set({ contractorTasks: allTasks });
            // Thay vào đó, lưu vào state local
            if (allTasks.length > 0) {
              setAllContractorTasks(allTasks);
            }
          }
        } catch (taskError) {
          console.error('Error fetching all tasks:', taskError);
          message.error('Không thể tải toàn bộ lịch làm việc của các đội. Dữ liệu có thể không đầy đủ.');
        }

        // If a contractor is already selected, fetch their tasks
        if (selectedContractor && selectedContractor.id) {
          await fetchContractorTasks(selectedContractor.id);
        }

        // Auto open modal if navigated from order detail page
        if (autoOpenModal && serviceOrderFromNav) {
          setTimeout(() => {
            showCreateTaskModal(dayjs(), serviceOrderFromNav);
          }, 500); // Small delay to ensure data is loaded
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        // message.error('Không thể tải dữ liệu: ' + (error.message || 'Lỗi không xác định'));
      }
    };

    loadInitialData();
  }, []);

  // Function to handle contractor selection
  const handleContractorChange = async (contractorId) => {
    const contractor = contractors.find(c => c.id === contractorId);
    selectContractor(contractor);

    // Fetch tasks for the selected contractor
    if (contractor) {
      await fetchContractorTasks(contractor.id);
    }
  };

  // Function to show the task creation modal
  const showCreateTaskModal = (date, preselectedOrderId = null) => {
    setSelectedDate(date);

    // Set initial form values
    const initialValues = {
      dateAppointment: existingConstructionDate ? dayjs(existingConstructionDate) : date,
      timeAppointment: existingConstructionTime ? dayjs(existingConstructionTime, 'HH:mm:ss') : date.hour(9).minute(0),
    };

    // If preselected order ID is provided, set it in the form
    if (preselectedOrderId) {
      initialValues.serviceOrderId = preselectedOrderId;
    }

    form.setFieldsValue(initialValues);
    setIsModalVisible(true);
  };

  // Function to handle task creation form submission
  const handleCreateTask = async (values) => {
    if (!selectedContractor) {
      message.error('Vui lòng chọn đội lắp đặt trước khi tạo lịch');
      return;
    }

    try {
      const taskData = {
        serviceOrderId: values.serviceOrderId,
        userId: selectedContractor.id,
        dateAppointment: values.dateAppointment.format('YYYY-MM-DD'),
        timeAppointment: values.timeAppointment.format('HH:mm:ss'),
        note: values.note || ''
      };

      await createContractorTask(taskData);

      // Refresh the tasks
      await fetchContractorTasks(selectedContractor.id);

      // Update the order status to Processing (8)
      if (serviceOrderFromNav) {
        try {
          const updateStatusResponse = await api.put(`/api/serviceorder/status/${serviceOrderFromNav}`, {
            status: 8, // Processing
          });

          if (updateStatusResponse.status === 200) {
            console.log('Order status updated to Processing (8) successfully');
          } else {
            console.warn('Failed to update order status:', updateStatusResponse);
          }
        } catch (statusError) {
          console.error('Error updating order status:', statusError);
          // Don't show error to user as the main task creation succeeded
        }
      }

      // Show success message
      message.success('Đã tạo lịch giao hàng và cập nhật trạng thái đơn hàng thành công');

      // Close the modal and reset form
      setIsModalVisible(false);
      form.resetFields();

      // Mark task as created
      setTaskCreated(true);

      // Clear navigation state to prevent modal from reopening
      if (window.history.replaceState) {
        window.history.replaceState(null, document.title, window.location.pathname);
      }
    } catch (error) {
      // Error handling is done in the store
      console.error("Failed to create task:", error);
    }
  };

  // New function to fetch order details for a task
  const fetchOrderDetails = async (taskId, serviceOrderId) => {
    setLoadingTaskDetails(true);
    try {
      console.log(`Fetching order details for task ${taskId}, serviceOrderId: ${serviceOrderId}`);
      const response = await api.get(`/api/serviceorder/${serviceOrderId}`);
      if (response.status === 200) {
        console.log("Order details received:", response.data);
        const foundTask = contractorTasks.find(task => task.id === taskId) ||
          allContractorTasks.find(task => task.id === taskId);

        console.log("Found task:", foundTask);

        const taskDetails = {
          task: foundTask,
          order: response.data
        };

        console.log("Setting selectedTaskDetails:", taskDetails);
        setSelectedTaskDetails(taskDetails);

        // Fetch product details for the products in this order
        await fetchProductDetailsForOrder(response.data);
      } else {
        // message.error('Không thể tải thông tin đơn hàng');
        console.error('Error response:', response);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      message.error('Không thể tải thông tin đơn hàng: ' + (error.response?.data?.message || error.message || 'Lỗi không xác định'));
      // Tạo dữ liệu task mặc định để không bị trống UI
      const task = contractorTasks.find(task => task.id === taskId) ||
        allContractorTasks.find(task => task.id === taskId);
      if (task) {
        setSelectedTaskDetails({
          task: task,
          order: {
            id: serviceOrderId,
            userName: 'Không thể tải thông tin',
            address: 'Không thể tải thông tin',
            cusPhone: 'Không thể tải thông tin',
            email: 'Không thể tải thông tin',
            status: 'Không thể tải thông tin'
          }
        });
        message.warning('Đang hiển thị thông tin cơ bản, không thể tải đầy đủ chi tiết đơn hàng');
      }
    } finally {
      setLoadingTaskDetails(false);
    }
  };

  // Function to fetch product details for all products in an order
  const fetchProductDetailsForOrder = async (order) => {
    if (!order || !order.serviceOrderDetails || order.serviceOrderDetails.length === 0) {
      return;
    }

    setLoadingProducts(true);

    try {
      // Ensure products are loaded
      if (products.length === 0) {
        await fetchProducts();
      }

      // Create a map of product details
      const newProductDetails = { ...productDetails };

      // Get product details for each product in the order
      for (const detail of order.serviceOrderDetails) {
        if (!detail.productId) continue;

        // Skip if we already have this product's details
        if (newProductDetails[detail.productId]) continue;

        // First check if the product is in the loaded products
        let product = products.find(p => p.id === detail.productId);

        // If not found, try to fetch it individually
        if (!product) {
          try {
            product = await getProductById(detail.productId);
          } catch (err) {
            console.error(`Error fetching product ${detail.productId}:`, err);
          }
        }

        if (product) {
          newProductDetails[detail.productId] = product;
        }
      }

      setProductDetails(newProductDetails);
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Function to handle task details view
  const showTaskDetails = (taskId, serviceOrderId) => {
    console.log("showTaskDetails called with taskId:", taskId, "serviceOrderId:", serviceOrderId);

    // Kiểm tra xem taskId và serviceOrderId có tồn tại không
    if (!taskId || !serviceOrderId) {
      console.error("Missing taskId or serviceOrderId");
      message.error("Không thể xem chi tiết: Thiếu thông tin task");
      return;
    }

    // Kiểm tra trước xem task có tồn tại không
    const taskForDisplay = contractorTasks.find(t => t.id === taskId) ||
      allContractorTasks.find(t => t.id === taskId);

    if (!taskForDisplay) {
      console.error("Task not found with ID:", taskId);
      message.error("Không tìm thấy thông tin task");
      return;
    }

    console.log("Found task for details:", taskForDisplay);

    // Ensure the Drawer's date context is set for the task being viewed
    const taskDate = dayjs(taskForDisplay.dateAppointment);
    setSelectedDate(taskDate);
    setSelectedDateFormatted(taskDate.format('DD/MM/YYYY'));

    // Populate selectedDateTasks for the task's date
    // getTasksForDate considers the currently selectedContractor
    const tasksOnThisDate = getTasksForDate(taskDate);
    setSelectedDateTasks(tasksOnThisDate);

    // Now fetch order details and make the drawer visible
    fetchOrderDetails(taskId, serviceOrderId);
    setIsTaskDetailsVisible(true);
  };

  // Function to get tasks for a specific date
  const getTasksForDate = (date) => {
    // Nếu đang xem lịch của contractor cụ thể, chỉ hiển thị task của contractor đó
    if (viewingContractor && viewingContractor.id) {
      return contractorTasks && contractorTasks.filter(task => {
        const taskDate = dayjs(task.dateAppointment);
        return date.isSame(taskDate, 'day');
      }) || [];
    }
    // Nếu có contractor được chọn cho task, chỉ hiển thị task của contractor đó
    else if (selectedContractor && selectedContractor.id) {
      return contractorTasks && contractorTasks.filter(task => {
        const taskDate = dayjs(task.dateAppointment);
        return date.isSame(taskDate, 'day');
      }) || [];
    }
    // Nếu chưa chọn contractor, hiển thị tất cả task
    else {
      return allContractorTasks && allContractorTasks.filter(task => {
        const taskDate = dayjs(task.dateAppointment);
        return date.isSame(taskDate, 'day');
      }) || [];
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'Pending':
        return <Tag color="blue">Đang chuẩn bị hàng</Tag>;
      case 'Installing':
        return <Tag color="processing">Đang thực hiện</Tag>;
      case 'DoneInstalling':
        return <Tag color="blue">Hoàn tất lắp đặt</Tag>;
      case 'Completed':
        return <Tag color="success">Hoàn tất giao hàng</Tag>;
      default:
        return <Tag color="error">Không xác định</Tag>;
    }
  };

  const getOrderStatusTag = (status) => {
    switch (status) {
      case 'Pending':
        return <Tag color="default">Chờ xử lý</Tag>;
      case 'Processing':
        return <Tag color="blue">Đang xử lý</Tag>;
      case 'Installing':
        return <Tag color="blue">Đang lắp đặt</Tag>;
      case 'ReInstall':
        return <Tag color="orange">Lắp lại</Tag>;
      case 'Successfully':
      case 'DoneInstalling':
      case 'Completed':
        return <Tag color="green">Hoàn tất</Tag>;
      default:
        return <Tag color="red">Không xác định</Tag>;
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#d9d9d9';         // xám nhạt
      case 'Installing': return '#bae7ff';      // xanh lam nhạt
      case 'DoneInstalling': return '#adc6ff';  // xanh lá nhạt
      case 'Completed': return '#d9f7be';       // tím nhạt
      default: return '#ffccc7';                // đỏ nhạt (lỗi)
    }
  };
  // Function to render cell content for the calendar
  const dateCellRender = (date) => {
    const tasks = getTasksForDate(date);

    if (tasks.length === 0) {
      return null;
    }

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks.map((task, index) => (
          <li key={index} style={{ marginBottom: 4 }}>
            <Tooltip
              color="#fff"
              title={
                <div style={{ lineHeight: 1.6 }}>
                  <div><strong>🕒 Giờ hẹn:</strong> {task.timeAppointment || 'Không xác định'}</div>
                  <div><strong>📌 Mã công việc:</strong> {task.id}</div>
                  <div><strong>📦 Mã đơn hàng:</strong> {task.serviceOrderId}</div>
                  <div><strong>📝 Ghi chú:</strong> {task.note || 'Không có ghi chú'}</div>
                  <div><strong>📍 Trạng thái:</strong> {getStatusTag(task.status)}</div>
                </div>
              }
              styles={{
                body: {
                  color: '#333',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 0 8px rgba(0,0,0,0.1)',
                  maxWidth: 300,
                  fontSize: 13,
                }
              }}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  showTaskDetails(task.id, task.serviceOrderId);
                }}
                style={{
                  backgroundColor: getStatusColor(task.status),
                  borderRadius: 6,
                  padding: '6px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontWeight: 500 }}>{task.timeAppointment || '--:--'}</span>
                <span style={{ fontSize: 11, color: '#333' }}>
                  #{task.serviceOrderId?.substring(0, 8) || 'N/A'}
                </span>
              </div>
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  // Function to handle calendar date selection
  const handleDateSelect = (date) => {
    // Nhận tất cả các task cho ngày được chọn, không chỉ của contractor đã chọn
    let tasks = [];

    if (selectedContractor && selectedContractor.id) {
      // Nếu đã chọn contractor, chỉ lấy task của contractor đó
      tasks = contractorTasks.filter(task => {
        const taskDate = dayjs(task.dateAppointment);
        return date.isSame(taskDate, 'day');
      }) || [];
    } else {
      // Nếu chưa chọn contractor, lấy tất cả các task cho ngày đó từ allContractorTasks
      tasks = allContractorTasks.filter(task => {
        const taskDate = dayjs(task.dateAppointment);
        return date.isSame(taskDate, 'day');
      }) || [];
    }

    console.log("Tasks for selected date:", tasks);
    setSelectedDate(date);
    setSelectedDateFormatted(date.format('DD/MM/YYYY'));

    if (tasks.length > 0) {
      // If there are tasks on this date, show task list
      setSelectedDateTasks(tasks);
      setIsTaskDetailsVisible(true);
    } else {
      // If no tasks, show task creation modal
      if (selectedContractor && selectedContractor.id) {
        showCreateTaskModal(date);
      } else {
        message.info('Hãy chọn một đội lắp đặt trước khi tạo lịch mới');
        setActiveTab('contractors');
      }
    }
  };

  // Find the order details from the serviceOrderId if available
  const preselectedOrder = serviceOrderFromNav
    ? serviceOrders?.find(order => order.id === serviceOrderFromNav)
    : null;

  // Determine whether to show the contractor selection UI
  const showContractorSelection = serviceOrderFromNav && !selectedContractor && !taskCreated;

  // Function to handle basic task details view without API call
  const showBasicTaskDetails = (task) => {
    console.log("Showing basic task details for:", task);

    // Create a basic order object with default values
    const basicOrder = {
      id: task.serviceOrderId,
      userName: "Đang tải thông tin...",
      address: "Đang tải thông tin...",
      cusPhone: "Đang tải thông tin...",
      email: "Đang tải thông tin...",
      status: "Đang tải thông tin..."
    };

    // Set basic task details first to show something immediately
    setSelectedTaskDetails({
      task: task,
      order: basicOrder
    });

    // Then fetch complete details
    fetchOrderDetails(task.id, task.serviceOrderId);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Show alert if navigated from order detail with customer info */}
      {showContractorSelection && customerNameFromNav && (
        <Alert
          message={<span style={{ fontWeight: 'bold' }}>Chọn đội lắp đặt để giao hàng</span>}
          description={
            <div>
              <p><strong>Đơn hàng:</strong> #{serviceOrderFromNav}</p>
              <p><strong>Khách hàng:</strong> {customerNameFromNav}</p>
              {addressFromNav && <p><strong>Địa chỉ:</strong> {addressFromNav.replace(/\|/g, ', ')}</p>}
              {existingConstructionDate && existingConstructionTime && (
                <p>
                  <strong>Lịch giao hàng đã được đặt:</strong>{' '}
                  {dayjs(existingConstructionDate).format('DD/MM/YYYY')} vào lúc {existingConstructionTime}
                </p>
              )}
              <p>Vui lòng chọn một đội lắp đặt phù hợp từ danh sách bên dưới để xem lịch và tạo nhiệm vụ giao hàng.</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      {/* Display contractor selection cards when navigated from order detail */}
      {showContractorSelection && (
        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col span={24}>
            <Card
              title={
                <Space>
                  <TeamOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                  <span>Chọn đội lắp đặt giao hàng</span>
                </Space>
              }
              style={{ marginBottom: '20px' }}
            >
              {isLoading || allContractorTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                  <p>Đang tải dữ liệu lịch làm việc của các đội...</p>
                </div>
              ) : contractors && contractors.length > 0 ? (
                <>
                  {existingConstructionDate && (
                    (() => {
                      const deliveryDate = dayjs(existingConstructionDate);
                      const availableContractors = contractors.filter(contractor => {
                        const tasksOnDeliveryDate = allContractorTasks.filter(task =>
                          task.userId === contractor.id &&
                          dayjs(task.dateAppointment).isSame(deliveryDate, 'day')
                        );
                        return tasksOnDeliveryDate.length === 0; // Only show contractors with no tasks on this date
                      });

                      if (availableContractors.length === 0) {
                        return (
                          <Alert
                            message="Không có đội lắp đặt nào rảnh vào ngày này"
                            description={
                              <div>
                                <p><strong>Ngày giao hàng yêu cầu:</strong> {deliveryDate.format('DD/MM/YYYY')}</p>
                                <p>Tất cả các đội lắp đặt đã có lịch làm việc vào ngày này. Vui lòng xem lại lịch của từng đội hoặc liên hệ với khách hàng để hẹn lịch mới.</p>
                              </div>
                            }
                            type="warning"
                            showIcon
                            style={{ marginBottom: '16px' }}
                          />
                        );
                      }
                      return null;
                    })()
                  )}
                  <Row gutter={[16, 16]}>
                    {contractors
                      .filter(contractor => {
                        // If there's a specific date from service order, check availability
                        if (existingConstructionDate) {
                          const deliveryDate = dayjs(existingConstructionDate);
                          const tasksOnDeliveryDate = allContractorTasks.filter(task =>
                            task.userId === contractor.id &&
                            dayjs(task.dateAppointment).isSame(deliveryDate, 'day')
                          );
                          return tasksOnDeliveryDate.length === 0; // Only show contractors with no tasks on this date
                        }
                        // If no specific date, show all contractors
                        return true;
                      })
                      .map(contractor => {
                        // Calculate how many tasks this contractor has on the delivery date
                        const deliveryDate = existingConstructionDate ? dayjs(existingConstructionDate) : dayjs().add(2, 'day');
                        const tasksOnDeliveryDate = allContractorTasks
                          .filter(task =>
                            task.userId === contractor.id &&
                            dayjs(task.dateAppointment).isSame(deliveryDate, 'day')
                          ) || [];

                        const availability = tasksOnDeliveryDate.length === 0 ? 'high' :
                          tasksOnDeliveryDate.length === 1 ? 'medium' : 'low';

                        const availabilityColor = {
                          'high': 'green',
                          'medium': 'orange',
                          'low': 'red'
                        }[availability];

                        const availabilityText = {
                          'high': 'Sẵn sàng (không có công việc)',
                          'medium': 'Bận vừa phải',
                          'low': 'Đã có lịch'
                        }[availability];

                        return (
                          <Col xs={24} sm={12} md={8} key={contractor.id}>
                            <Card
                              hoverable
                              style={{
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                              actions={[
                                <Button
                                  type="primary"
                                  onClick={() => {
                                    selectContractor(contractor);
                                    fetchContractorTasks(contractor.id).then(() => {
                                      // After fetching tasks, show the task creation modal
                                      if (serviceOrderFromNav) {
                                        showCreateTaskModal(dayjs(), serviceOrderFromNav);
                                      }
                                    });
                                  }}
                                >
                                  Chọn đội này
                                </Button>
                              ]}
                            >
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '12px',
                                flexWrap: 'wrap',
                                gap: '12px'
                              }}>
                                <Avatar
                                  // size={64}
                                  icon={<UserOutlined />}
                                  src={contractor.avatarUrl}
                                  style={{
                                    width: 64,
                                    height: 64,
                                    backgroundColor: !contractor.avatarUrl ? '#1890ff' : undefined,
                                    flexShrink: 0
                                  }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <Title level={5} style={{ margin: 0 }}>{contractor.name}</Title>
                                  <Tag color={availabilityColor}
                                    style={{
                                      maxWidth: 160,
                                      whiteSpace: 'normal',
                                      wordBreak: 'break-word',
                                    }}>{availabilityText}</Tag>
                                </div>
                              </div>

                              <div style={{ color: '#666', fontSize: '14px' }}>
                                <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center' }}>
                                  <PhoneOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                  {contractor.phone}
                                </p>
                                <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center' }}>
                                  <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                  {contractor.email}
                                </p>
                                <p style={{ margin: '4px 0', display: 'flex', alignItems: 'flex-start' }}>
                                  <HomeOutlined style={{ marginRight: '8px', marginTop: '3px', color: '#1890ff' }} />
                                  <span style={{ flex: 1 }}>{contractor.address?.replace(/\|/g, ', ')}</span>
                                </p>

                                {/* Show existing tasks if any */}
                                {tasksOnDeliveryDate.length > 0 && (
                                  <div style={{ marginTop: '10px' }}>
                                    <Text strong>Lịch làm việc {deliveryDate.format('DD/MM/YYYY')}:</Text>
                                    <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                                      {tasksOnDeliveryDate.map((task, idx) => (
                                        <li key={idx}>
                                          <Text>{task.timeAppointment} - Đơn #{task.serviceOrderId}</Text>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </Card>
                          </Col>
                        );
                      })}
                  </Row>
                </>
              ) : (
                <Empty description="Không có đội lắp đặt nào" />
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Card
        title={
          <Space size="middle">
            <CalendarOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <span>Lịch làm việc đội lắp đặt</span>
          </Space>
        }
        extra={
          <Space>
            {serviceOrderFromNav && (
              <Button
                type="primary"
                onClick={() => showCreateTaskModal(dayjs(), serviceOrderFromNav)}
                icon={<PlusOutlined />}
              >
                Tạo lịch giao hàng
              </Button>
            )}
            <Select
              placeholder="Chọn đội lắp đặt"
              style={{ width: 250 }}
              onChange={(contractorId) => {
                const contractor = contractors.find(c => c.id === contractorId);
                setViewingContractor(contractor);
                if (contractor) {
                  fetchContractorTasks(contractor.id);
                }
              }}
              value={viewingContractor?.id || selectedContractor?.id}
            >
              {contractors && contractors.map(contractor => (
                <Option key={contractor.id} value={contractor.id}>
                  {contractor.name}
                </Option>
              ))}
            </Select>
          </Space>
        }
        style={{ marginBottom: '20px' }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>


          <TabPane
            tab={
              <span>
                <CalendarOutlined /> Lịch làm việc
              </span>
            }
            key="calendar"
          >
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
              </div>
            ) : !viewingContractor && !selectedContractor ? (
              <Alert
                message="Vui lòng chọn đội lắp đặt"
                description={serviceOrderFromNav ?
                  "Hãy chọn một đội lắp đặt từ danh sách bên trên để xem lịch làm việc và tạo lịch giao hàng." :
                  "Hãy chọn một đội lắp đặt để xem lịch làm việc của họ"}
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
              />
            ) : (
              <>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                </div>

                <div style={{
                  /* Add a container with styles to apply to its children */
                }}>
                  <style>
                    {`
                    /* Custom scrollbar styling for calendar */
                    .ant-picker-calendar-date-content::-webkit-scrollbar {
                      width: 4px;
                      height: 4px;
                    }
                    .ant-picker-calendar-date-content::-webkit-scrollbar-thumb {
                      background: #d9d9d9;
                      borderRadius: 4px;
                    }
                    .ant-picker-calendar-date-content::-webkit-scrollbar-track {
                      background: #f0f0f0;
                      borderRadius: 4px;
                    }
                    /* General scrollbar styling */
                    ::-webkit-scrollbar {
                      width: 4px;
                      height: 4px;
                    }
                    ::-webkit-scrollbar-thumb {
                      background: #d9d9d9;
                      borderRadius: 4px;
                    }
                    ::-webkit-scrollbar-track {
                      background: #f0f0f0;
                      borderRadius: 4px;
                    }
                    `}
                  </style>
                  <Calendar
                    dateCellRender={dateCellRender}
                    onSelect={handleDateSelect}
                    locale={locale}
                  />
                </div>
              </>
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined /> Thông tin đội lắp đặt
              </span>
            }
            key="contractors"
          >
            <Row gutter={[16, 16]}>
              {contractors && contractors.length > 0 ? (
                contractors.map(contractor => (
                  <Col xs={24} sm={12} md={8} key={contractor.id}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: '8px',
                        boxShadow: viewingContractor?.id === contractor.id ? '0 0 8px rgba(24,144,255,0.5)' : 'none',
                        border: viewingContractor?.id === contractor.id ? '1px solid #1890ff' : '1px solid #e8e8e8'
                      }}
                      actions={[
                        <Button
                          type="primary"
                          onClick={() => {
                            setViewingContractor(contractor);
                            fetchContractorTasks(contractor.id);
                            setActiveTab('calendar');
                          }}
                        >
                          Xem lịch
                        </Button>
                      ]}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <Avatar
                          size={64}
                          icon={<UserOutlined />}
                          src={contractor.avatarUrl}
                          style={{ marginRight: '16px', backgroundColor: '#1890ff' }}
                        />
                        <div>
                          <Title level={5} style={{ margin: 0 }}>{contractor.name}</Title>
                          <Tag color="blue">Đội lắp đặt</Tag>
                        </div>
                      </div>

                      <div style={{ color: '#666', fontSize: '14px' }}>
                        <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center' }}>
                          <PhoneOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                          {contractor.phone}
                        </p>
                        <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center' }}>
                          <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                          {contractor.email}
                        </p>
                        <p style={{ margin: '4px 0', display: 'flex', alignItems: 'flex-start' }}>
                          <HomeOutlined style={{ marginRight: '8px', marginTop: '3px', color: '#1890ff' }} />
                          <span style={{ flex: 1 }}>{contractor.address}</span>
                        </p>
                      </div>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Empty description="Không có đội lắp đặt nào" />
                </Col>
              )}
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Task Creation Modal */}
      <Modal
        title={serviceOrderFromNav ? "Tạo lịch giao hàng" : "Tạo lịch làm việc mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          // Clear navigation state to prevent modal from reopening
          if (window.history.replaceState) {
            window.history.replaceState(null, document.title, window.location.pathname);
          }
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTask}
        >
          <Form.Item
            name="serviceOrderId"
            label="Đơn hàng"
            rules={[{ required: true, message: 'Vui lòng chọn đơn hàng' }]}
          >
            <Select
              placeholder="Chọn đơn hàng"
              disabled={serviceOrderFromNav !== null}
            >
              {serviceOrders && serviceOrders.map(order => (
                <Option key={order.id} value={order.id}>
                  #{order.id} - {order.userName} - {order.address?.replace(/\|/g, ', ')}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {preselectedOrder && (
            <Alert
              message="Thông tin đơn hàng"
              description={
                <div>
                  <p><strong>Khách hàng:</strong> {preselectedOrder.userName}</p>
                  <p><strong>Địa chỉ:</strong> {preselectedOrder.address?.replace(/\|/g, ', ')}</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          <Form.Item
            name="dateAppointment"
            label="Ngày giao hàng"
            rules={[{ required: true, message: 'Vui lòng chọn ngày giao hàng' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              locale={locale}
              disabled={Boolean(existingConstructionDate && serviceOrderFromNav)}
              disabledDate={(current) => {
                // Cannot select days before today
                return current && current < dayjs().startOf('day');
              }}
            />
          </Form.Item>

          <Form.Item
            name="timeAppointment"
            label="Giờ giao hàng"
            rules={[{ required: true, message: 'Vui lòng chọn giờ giao hàng' }]}
          >
            <TimePicker
              style={{ width: '100%' }}
              format="HH:mm:ss"
              minuteStep={15}
              disabled={Boolean(existingConstructionTime && serviceOrderFromNav)}
            />
          </Form.Item>

          {existingConstructionDate && existingConstructionTime && serviceOrderFromNav && (
            <Alert
              message="Thông tin lịch giao hàng đã được đặt"
              description={
                <div>
                  <p>Đơn hàng này đã có lịch giao hàng được khách hàng đặt trước đó. Hệ thống sẽ sử dụng thời gian này để gán cho đội lắp đặt.</p>
                  <p><strong>Ngày giao hàng:</strong> {dayjs(existingConstructionDate).format('DD/MM/YYYY')}</p>
                  <p><strong>Giờ giao hàng:</strong> {existingConstructionTime}</p>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <Input.TextArea rows={4} placeholder="Nhập ghi chú cho lịch giao hàng" />
          </Form.Item>

          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  // Clear navigation state
                  if (window.history.replaceState) {
                    window.history.replaceState(null, document.title, window.location.pathname);
                  }
                }}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  {serviceOrderFromNav ? "Xác nhận lịch giao hàng" : "Tạo lịch"}
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Task Details Drawer */}
      <Drawer
        title={`Lịch làm việc ngày ${selectedDateFormatted}`}
        placement="right"
        onClose={() => {
          setIsTaskDetailsVisible(false);
          setSelectedTaskDetails(null);
        }}
        open={isTaskDetailsVisible}
        width={700}
      >
        {selectedDateTasks.length > 0 ? (
          <div>
            {!selectedContractor && (
              <Alert
                message="Lưu ý"
                description="Bạn đang xem tất cả các lịch làm việc. Để tạo lịch mới, vui lòng chọn một đội lắp đặt trước."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}
            <List
              itemLayout="horizontal"
              dataSource={selectedDateTasks}
              renderItem={task => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      onClick={() => showTaskDetails(task.id, task.serviceOrderId)}
                    >
                      Chi tiết
                    </Button>
                  ]}
                  onClick={() => showBasicTaskDetails(task)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<CalendarOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={<span>Đơn hàng #{task.serviceOrderId}</span>}
                    description={
                      <Space direction="vertical">
                        <Text>Thời gian: {task.timeAppointment}</Text>
                        {task.note && <Text>Ghi chú: {task.note}</Text>}
                        {/* <Text type="secondary">Đội lắp đặt: {task.userName || "Không có thông tin"}</Text> */}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />

            {selectedTaskDetails && (
              <div style={{ marginTop: '24px', border: '1px solid #f0f0f0', padding: '16px', borderRadius: '8px' }}>
                <Title level={5}>Chi tiết đơn hàng #{selectedTaskDetails.task?.serviceOrderId}</Title>

                {loadingTaskDetails ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin />
                  </div>
                ) : selectedTaskDetails.order ? (
                  <>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Khách hàng">
                        {selectedTaskDetails.order?.userName || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ">
                        {selectedTaskDetails.order?.address?.replace(/\|/g, ', ') || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        {selectedTaskDetails.order?.cusPhone || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {selectedTaskDetails.order?.email || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày giao hàng">
                        {selectedTaskDetails.task?.dateAppointment ? dayjs(selectedTaskDetails.task?.dateAppointment).format('DD/MM/YYYY') : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giờ giao hàng">
                        {selectedTaskDetails.task?.timeAppointment || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ghi chú">
                        {selectedTaskDetails.task?.note || 'Không có ghi chú'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái đơn hàng">
                        {getOrderStatusTag(selectedTaskDetails.order?.status)}
                      </Descriptions.Item>
                    </Descriptions>

                    {selectedTaskDetails.order?.serviceOrderDetails && selectedTaskDetails.order.serviceOrderDetails.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <Title level={5}>Danh sách sản phẩm</Title>
                        <List
                          size="small"
                          bordered
                          dataSource={selectedTaskDetails.order.serviceOrderDetails}
                          renderItem={detail => {
                            const product = productDetails[detail.productId];
                            return (
                              <List.Item>
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                  {product && product.image?.imageUrl ? (
                                    <Avatar
                                      src={product.image.imageUrl}
                                      shape="square"
                                      size={64}
                                      style={{ marginRight: '12px' }}
                                    />
                                  ) : (
                                    <Avatar
                                      icon={<FileTextOutlined />}
                                      shape="square"
                                      size={64}
                                      style={{ marginRight: '12px', backgroundColor: '#f0f0f0', color: '#999' }}
                                    />
                                  )}
                                  <div style={{ flex: 1 }}>
                                    <Text strong>
                                      {product ? product.name : `#${detail.productId} - ${detail.categoryName || detail.name || 'Sản phẩm'}`}
                                    </Text>
                                    <div>
                                      <Text type="secondary">Số lượng: x{detail.quantity}</Text>
                                      <Text type="secondary" style={{ marginLeft: '12px' }}>Đơn giá: {(detail.price || 0).toLocaleString()} đ</Text>
                                    </div>
                                  </div>
                                </div>
                              </List.Item>
                            );
                          }}
                          loading={loadingProducts}
                        />
                      </div>
                    )}

                    {selectedTaskDetails.order?.externalProducts && selectedTaskDetails.order.externalProducts.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <Title level={5}>Sản phẩm bổ sung</Title>
                        <List
                          size="small"
                          bordered
                          dataSource={selectedTaskDetails.order.externalProducts}
                          renderItem={product => (
                            <List.Item>
                              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                {product.imageURL ? (
                                  <Avatar
                                    src={product.imageURL}
                                    shape="square"
                                    size={64}
                                    style={{ marginRight: '12px' }}
                                  />
                                ) : (
                                  <Avatar
                                    icon={<FileTextOutlined />}
                                    shape="square"
                                    size={64}
                                    style={{ marginRight: '12px', backgroundColor: '#f0f0f0', color: '#999' }}
                                  />
                                )}
                                <div style={{ flex: 1 }}>
                                  <Text strong>{product.name}</Text>
                                  <div>
                                    <Text type="secondary">Số lượng: x{product.quantity}</Text>
                                    <Text type="secondary" style={{ marginLeft: '12px' }}>Đơn giá: {(product.price || 0).toLocaleString()} đ</Text>
                                  </div>
                                  {/* {product.description && (
                                    <Text type="secondary" style={{ fontSize: '12px' }}>{product.description}</Text>
                                  )} */}
                                </div>
                              </div>
                            </List.Item>
                          )}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <Empty description="Không thể tải thông tin đơn hàng" />
                )}
              </div>
            )}
          </div>
        ) : (
          <Empty description="Không có lịch làm việc nào trong ngày này" />
        )}
      </Drawer>

      {/* Show success message after task creation */}
      {taskCreated && serviceOrderFromNav && (
        <Alert
          message="Đã giao việc thành công"
          description={
            <div>
              <p>Đã gán đội lắp đặt <strong>{selectedContractor?.name}</strong> cho đơn hàng #{serviceOrderFromNav} thành công.</p>
              <p>Trạng thái đơn hàng đã được cập nhật thành <strong>Đang xử lý (Processing)</strong>.</p>
              <p>Bạn có thể tiếp tục xem lịch làm việc của đội lắp đặt hoặc quay lại trang đơn hàng.</p>
              <div style={{ marginTop: '12px' }}>
                <Button
                  type="primary"
                  onClick={() => window.history.back()}
                  style={{ marginRight: '8px' }}
                >
                  Quay lại trang đơn hàng
                </Button>
                <Button
                  onClick={() => setTaskCreated(false)}
                >
                  Tiếp tục quản lý lịch
                </Button>
              </div>
            </div>
          }
          type="success"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}
    </div>
  );
};

export default ContractorSchedule; 