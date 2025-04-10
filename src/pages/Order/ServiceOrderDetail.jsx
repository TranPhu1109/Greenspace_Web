import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useServiceOrderStore from "@/stores/useServiceOrderStore";
import useProductStore from "@/stores/useProductStore";
import useRecordStore from "@/stores/useRecordStore";
import {
  Typography,
  Spin,
  Alert,
  Card,
  Row,
  Col,
  Tag,
  Image,
  Layout,
  Button,
  Divider,
  Descriptions,
  Space,
  Timeline,
  Breadcrumb,
  Table,
  message,
  Popconfirm,
  Empty,
  Modal,
  Input
} from "antd";
import { format } from "date-fns";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  PictureOutlined,
  HistoryOutlined,
  ShoppingOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  StopOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

const ServiceOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    loading,
    error,
    getServiceOrderById,
    updateServiceForCus,
    cancelServiceOrder,
    updateServiceOrderStatus
  } = useServiceOrderStore();
  const { getProductById, isLoading: productLoading } = useProductStore();
  const {
    sketchRecords,
    getRecordSketch,
    confirmRecord,
    isLoading: recordLoading,
    error: recordError
  } = useRecordStore();
  const [order, setOrder] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [isRevisionModalVisible, setIsRevisionModalVisible] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define statuses where ONLY phase 0 sketches are shown initially
  const showOnlyPhase0Statuses = [
    'ConsultingAndSketching' // 16
  ];

  // Define statuses where ALL sketch phases are shown
  const showAllPhasesStatuses = [
    'DoneDeterminingDesignPrice', // 22
    'WaitDeposit',                // 21
    'DepositSuccessful',          // 3
    'AssignToDesigner',           // 4
    'DeterminingMaterialPrice',   // 5
    'DoneDesign',                 // 6
    'DoneDeterminingMaterialPrice', // 23
    'PaymentSuccess',             // 7
    'Processing',                 // 8
    'PickedPackageAndDelivery', // 9
    'DeliveryFail',             // 10
    'ReDelivery',               // 11
    'DeliveredSuccessfully',    // 12
    'CompleteOrder',            // 13
    'Warning',                  // 15
    "ReConsultingAndSketching", // 19
    // Add other relevant statuses if needed
  ];

  useEffect(() => {
    const fetchOrderDetailAndSketches = async () => {
      try {
        setLocalError(null);
        setFetchingProducts(false); // Reset product fetching state
        const orderData = await getServiceOrderById(id);
        setOrder(orderData); // Set order state first

        if (!orderData) {
          setLocalError("Không tìm thấy thông tin đơn hàng.");
          return;
        }

        // Fetch products if details exist
        if (orderData.serviceOrderDetails && orderData.serviceOrderDetails.length > 0) {
          setFetchingProducts(true);
          const productPromises = orderData.serviceOrderDetails.map(detail =>
            getProductById(detail.productId)
          );
          const productResults = await Promise.all(productPromises);
          const detailsMap = {};
          productResults.forEach((product, index) => {
            if (product) {
              detailsMap[orderData.serviceOrderDetails[index].productId] = product;
            }
          });
          setProductDetailsMap(detailsMap);
          setFetchingProducts(false);
        }

        // Fetch sketch records if the status requires it
        if (showOnlyPhase0Statuses.includes(orderData.status) || showAllPhasesStatuses.includes(orderData.status)) {
          console.log(`Fetching sketches for order ${id} with status ${orderData.status}`);
          await getRecordSketch(id); // Fetch sketches
        } else {
          console.log(`Sketches not required for status: ${orderData.status}`);
        }

      } catch (err) {
        console.error("Error fetching order details, products, or sketches:", err);
        // Prioritize order fetch error
        const errorMessage = err.message.includes("order")
          ? "Không thể tải thông tin đơn hàng."
          : "Có lỗi xảy ra khi tải dữ liệu.";
        setLocalError(errorMessage);
        setFetchingProducts(false); // Ensure loading states are reset on error
      }
    };

    if (id) {
      fetchOrderDetailAndSketches();
    }
    // Dependencies: id, getServiceOrderById, getProductById, getRecordSketch
  }, [id, getServiceOrderById, getProductById, getRecordSketch]); // Ensure all store actions are dependencies

  // Mapping from backend status number/name to customer-friendly text
  const getStatusText = (status) => {
    const statusMap = {
      0: "Chờ xử lý",
      'Pending': "Chờ xử lý",
      1: "Đang tư vấn & phác thảo",
      'ConsultingAndSketching': "Đang tư vấn & phác thảo",
      2: "Đang tư vấn & phác thảo", // Hide DeterminingDesignPrice
      'DeterminingDesignPrice': "Đang tư vấn & phác thảo", 
      22: "Chờ duyệt phác thảo",
      'DoneDeterminingDesignPrice': "Chờ duyệt phác thảo",
      19: "Đang tư vấn & phác thảo", // Hide ReConsultingAndSketching
      'ReConsultingAndSketching': "Đang tư vấn & phác thảo", 
      21: "Chờ đặt cọc",
      'WaitDeposit': "Chờ đặt cọc",
      3: "Đang thiết kế",
      'DepositSuccessful': "Đang thiết kế",
      4: "Đang thiết kế",
      'AssignToDesigner': "Đang thiết kế",
      5: "Đang thiết kế", 
      'DeterminingMaterialPrice': "Đang thiết kế",
      20: "Đang thiết kế", // Hide ReDesign
      'ReDesign': "Đang thiết kế",
      6: "Đang báo giá vật liệu",
      'DoneDesign': "Đang báo giá vật liệu",
      23: "Chờ thanh toán chi phí còn lại",
      'DoneDeterminingMaterialPrice': "Chờ thanh toán chi phí còn lại",
      7: "Đang chuẩn bị hàng",
      'PaymentSuccess': "Đang chuẩn bị hàng",
      8: "Đang chuẩn bị hàng",
      'Processing': "Đang chuẩn bị hàng",
      9: "Đang giao hàng",
      'PickedPackageAndDelivery': "Đang giao hàng",
      12: "Đã giao hàng thành công",
      'DeliveredSuccessfully': "Đã giao hàng thành công",
      13: "Hoàn thành đơn hàng",
      'CompleteOrder': "Hoàn thành đơn hàng",
      14: "Đã hủy",
      'OrderCancelled': "Đã hủy",
      18: "Đã hủy",
      'StopService': "Đã hủy",
      10: "Giao hàng thất bại",
      'DeliveryFail': "Giao hàng thất bại",
      11: "Đang giao lại",
      'ReDelivery': "Đang giao lại",
      15: "Đang xử lý", // Consider a generic status for Warning
      'Warning': "Đang xử lý",
      16: "Đang hoàn tiền",
      'Refund': "Đang hoàn tiền",
      17: "Đã hoàn tiền",
      'DoneRefund': "Đã hoàn tiền",
      // Add other statuses if needed
    };
    // Return mapped text or the original status if not found
    return statusMap[status] || status?.toString() || 'Không xác định'; 
  };

  // Mapping from backend status number/name to display color
  const getStatusColor = (status) => {
    const colorMap = {
      0: "orange",
      'Pending': "orange",
      1: "blue",
      'ConsultingAndSketching': "blue",
      2: "blue", // Hide DeterminingDesignPrice
      'DeterminingDesignPrice': "blue",
      22: "gold",
      'DoneDeterminingDesignPrice': "gold",
      19: "blue", // Hide ReConsultingAndSketching
      'ReConsultingAndSketching': "blue",
      21: "purple",
      'WaitDeposit': "purple",
      3: "cyan",
      'DepositSuccessful': "cyan",
      4: "cyan",
      'AssignToDesigner': "cyan",
      5: "cyan",
      'DeterminingMaterialPrice': "cyan",
      20: "cyan", // Hide ReDesign
      'ReDesign': "cyan",
      6: "gold",
      'DoneDesign': "gold",
      23: "purple",
      'DoneDeterminingMaterialPrice': "purple",
      7: "processing", // Antd color name
      'PaymentSuccess': "processing",
      8: "processing",
      'Processing': "processing",
      9: "geekblue",
      'PickedPackageAndDelivery': "geekblue",
      12: "success",
      'DeliveredSuccessfully': "success",
      13: "success",
      'CompleteOrder': "success",
      14: "error",
      'OrderCancelled': "error",
      18: "error",
      'StopService': "error",
      10: "error",
      'DeliveryFail': "error",
      11: "geekblue",
      'ReDelivery': "geekblue",
      15: "warning",
      'Warning': "warning",
      16: "orange",
      'Refund': "orange",
      17: "default",
      'DoneRefund': "default",
      // Add other statuses if needed
    };
    // Return mapped color or 'default'
    return colorMap[status] || 'default';
  };

  // Hàm xử lý xác nhận bản phác thảo
  const handleConfirmSketch = async (recordId) => {
    setIsSubmitting(true);
    try {
      // Step 1: Confirm the specific sketch record
      await confirmRecord(recordId);
      message.success('Đã xác nhận bản phác thảo.');

      // Step 2: Update the order status to WaitDeposit (21)
      try {
        await updateServiceOrderStatus(id, 21); // Use the dedicated status update function
        message.success('Đơn hàng chuyển sang trạng thái Chờ đặt cọc.');
      } catch (statusError) {
        message.error('Lỗi cập nhật trạng thái đơn hàng: ' + (statusError.response?.data?.message || statusError.message));
        // Optional: Decide if you need to revert the confirmRecord status if status update fails
        setIsSubmitting(false);
        return; // Stop further execution if status update fails
      }

      // Step 3: Refetch order details to reflect changes
      await getServiceOrderById(id);

    } catch (err) {
      // Handle errors from confirmRecord
      message.error('Không thể chọn bản phác thảo: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Định dạng giá tiền
  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return price.toLocaleString("vi-VN") + " VNĐ";
  };

  // Định nghĩa cột cho bảng sản phẩm
  const productColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => {
        const product = productDetailsMap[record.productId];
        return (
          <Space>
            <Image
              src={product?.image?.imageUrl || '/placeholder.png'}
              alt={product?.name || 'Sản phẩm'}
              width={50}
              height={50}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
              preview={false}
            />
            <Text strong>{product?.name || 'Không tìm thấy tên'}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Đơn giá',
      key: 'price',
      align: 'right',
      render: (_, record) => {
        const product = productDetailsMap[record.productId];
        return <Text>{formatPrice(product?.price)}</Text>;
      },
    },
    {
      title: 'Thành tiền',
      key: 'totalPrice',
      align: 'right',
      render: (_, record) => {
        const product = productDetailsMap[record.productId];
        const totalPrice = product && typeof product.price === 'number' && typeof record.quantity === 'number'
          ? product.price * record.quantity
          : 0;
        return <Text strong style={{ color: '#4caf50' }}>{formatPrice(totalPrice)}</Text>;
      },
    },
  ];

  // Define statuses where material price is considered final and relevant
  const finalMaterialPriceStatuses = [
    'DoneDeterminingMaterialPrice', // 23
    'PaymentSuccess',             // 7
    'Processing',                 // 8
    'PickedPackageAndDelivery', // 9
    'DeliveryFail',             // 10 (Price was likely final before this)
    'ReDelivery',               // 11
    'DeliveredSuccessfully',    // 12
    'CompleteOrder',            // 13
    'OrderCancelled',           // 14 (Price might be relevant for refunds/records)
    // 'ConsultingAndSketching',    // 16 - Material price usually not final here
    // 'NoDesignIdea',             // 17 - Material price usually not final here
    'Warning',                  // 15 (Assuming warning doesn't reset the price)
    // Add other relevant statuses if needed
  ];

  // Define statuses where design price is considered approved for customer view
  const approvedDesignPriceStatuses = [
    'DoneDeterminingDesignPrice', // 22
    'WaitDeposit',                // 21
    'DepositSuccessful',          // 3
    'AssignToDesigner',           // 4
    'DeterminingMaterialPrice',   // 5
    'DoneDesign',                 // 6
    'DoneDeterminingMaterialPrice', // 23
    'PaymentSuccess',             // 7
    'Processing',                 // 8
    'PickedPackageAndDelivery', // 9
    'DeliveredSuccessfully',    // 12
    'CompleteOrder',            // 13
    'Warning',                  // 15
    // Add other relevant statuses if needed
  ];

  // --- Revision Modal Handlers ---
  const handleOpenRevisionModal = () => {
    setRevisionNote(""); // Clear previous note
    setIsRevisionModalVisible(true);
  };

  const handleCloseRevisionModal = () => {
    setIsRevisionModalVisible(false);
  };

  const handleSubmitRevision = async () => {
    if (!revisionNote.trim()) {
      message.warning("Vui lòng nhập lý do yêu cầu phác thảo lại.");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      serviceType: 1,
      status: 19, // ReConsultingAndSketching
      report: revisionNote // Add note to report field
    };
    try {
      // Use updateServiceForCus from useServiceOrderStore
      await updateServiceForCus(id, payload);
      message.success("Đã gửi yêu cầu phác thảo lại.");
      setIsRevisionModalVisible(false);
      await getServiceOrderById(id); // Refetch to show updated status and potentially new report
    } catch (err) {
      message.error("Gửi yêu cầu thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Cancel Order Handler ---
  const handleCancelOrder = async () => {
    setIsSubmitting(true);
    // No need for payload, cancelServiceOrder handles the status update
    try {
      // Use cancelServiceOrder from useServiceOrderStore
      await cancelServiceOrder(id);
      message.success("Đã hủy đơn hàng thành công.");
      await getServiceOrderById(id); // Refetch to show updated status
    } catch (err) {
      message.error("Hủy đơn hàng thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------- Main Render --------
  if (loading || (!order && !localError && !error)) { // Show spinner while order is loading initially
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="flex justify-center items-center">
          <Spin size="large" />
        </Content>
        <Footer />
      </Layout>
    );
  }

  const displayError = localError || error || recordError;
  if (displayError && !order) { // Show blocking error if order fetch failed
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="container mx-auto px-4 py-8 flex flex-col items-center justify-center" style={{ marginTop: "150px" }}>
          <Alert
            type="error"
            message="Lỗi tải dữ liệu"
            description={displayError.toString()}
            showIcon
            className="mb-4 w-full max-w-lg"
          />
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/history-booking-services")}
          >
            Quay lại lịch sử
          </Button>
        </Content>
        <Footer />
      </Layout>
    );
  }

  if (!order) { // Should ideally not be reached if loading/error is handled, but as a fallback
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="container mx-auto px-4 py-8 flex flex-col items-center justify-center" style={{ marginTop: "150px" }}>
          <Alert
            type="warning"
            message="Không tìm thấy đơn hàng"
            description={`Không thể tìm thấy thông tin cho đơn hàng #${id}.`}
            showIcon
            className="mb-4 w-full max-w-lg"
          />
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/history-booking-services")}
          >
            Quay lại lịch sử
          </Button>
        </Content>
        <Footer />
      </Layout>
    );
  }

  // Calculate maxPhase safely
  const maxPhase = sketchRecords && sketchRecords.length > 0
    ? Math.max(...sketchRecords.map(r => r.phase), -1) // Use -1 if empty
    : -1;

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
                      <HomeOutlined style={{ fontSize: '18px' }} />
                      <span style={{ fontSize: '16px' }}>Trang chủ</span>
                    </Space>
                  </Link>
                ),
              },
              {
                title: (
                  <Link to="/history-booking-services">
                    <Space>
                      <HistoryOutlined style={{ fontSize: '18px' }} />
                      <span style={{ fontSize: '16px' }}>Lịch sử đơn đặt thiết kế</span>
                    </Space>
                  </Link>
                ),
              },
              {
                title: (
                  <Space>
                    <ShoppingOutlined style={{ fontSize: '18px' }} />
                    <span style={{ fontSize: '16px' }}>Chi tiết đơn hàng #{id}</span>
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

          <Card
            className="shadow-md mb-6"
            style={{
              marginBottom: '16px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Button
                  type="primary"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/history-booking-services")}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  Quay lại
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                  Đơn hàng <span style={{ color: '#4caf50' }}>#{id}</span>
                </Title>
              </div>
            }
            extra={
              <Tag color={getStatusColor(order?.status)} size="large">
                {getStatusText(order?.status)}
              </Tag>
            }
          >
            <Row gutter={[24, 24]} style={{ marginBottom: '15px' }}>
              <Col xs={24} md={12}>
                <Card
                  title={
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#4caf50',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <UserOutlined />
                      Thông tin khách hàng
                    </span>
                  }
                  style={{
                    height: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Descriptions
                    column={1}
                    labelStyle={{ fontWeight: 'bold', fontSize: '15px' }}
                    contentStyle={{ fontSize: '15px' }}
                    size="middle"
                  >
                    <Descriptions.Item label="Tên khách hàng">
                      {order?.userName || 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {order?.email || 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      {order?.cusPhone || 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">
                      {order?.address?.replace(/\|/g, ', ') || 'Đang tải...'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card
                  title={
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#4caf50',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <HomeOutlined />
                      Thông tin thiết kế
                    </span>
                  }
                  style={{
                    height: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Descriptions
                    column={1}
                    labelStyle={{ fontWeight: 'bold', fontSize: '15px' }}
                    contentStyle={{ fontSize: '15px' }}
                    size="middle"
                  >
                    <Descriptions.Item label="Kích thước">
                      {order?.length !== undefined && order?.width !== undefined
                        ? `${order.length}m x ${order.width}m`
                        : 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại dịch vụ">
                      <Tag color={order?.serviceType === "NoDesignIdea" ? "blue" : "green"}>
                        {order?.serviceType === "NoDesignIdea"
                          ? "Dịch vụ tư vấn & thiết kế"
                          : order?.serviceType || 'Đang tải...'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá thiết kế">
                      {order?.designPrice === 0 || !approvedDesignPriceStatuses.includes(order?.status) ? (
                        <Tag color="gold">Chưa xác định giá thiết kế</Tag>
                      ) : (
                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                          {order?.designPrice !== undefined ? formatPrice(order.designPrice) : '...'}
                        </span>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        finalMaterialPriceStatuses.includes(order?.status)
                          ? "Giá vật liệu"
                          : "Giá vật liệu (dự kiến)"
                      }
                    >
                      {(typeof order?.materialPrice !== 'number' || order.materialPrice <= 0) ? (
                        <Tag color="default">Chưa có</Tag>
                      ) : (
                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                          {formatPrice(order.materialPrice)}
                        </span>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng chi phí">
                      {order?.totalCost === undefined ? 'Đang tải...' :
                        order.totalCost === 0 ? (
                          <Tag color="gold">Chưa xác định tổng</Tag>
                        ) : (
                          <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{formatPrice(order.totalCost)}</span>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      {order?.creationDate ? format(new Date(order.creationDate), "dd/MM/yyyy HH:mm") : 'Đang tải...'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {/* ------------- Conditional Image Display Section ------------- */}
            {(() => {
              // --- Case 1 & 2 Combined: Show sketches based on status ---
              if (showOnlyPhase0Statuses.includes(order?.status) || showAllPhasesStatuses.includes(order?.status)) {
                if (recordLoading && !sketchRecords) { // Show loading only if no sketches are loaded yet
                  return <Card title="Bản phác thảo & Hình ảnh gốc" loading={true} style={{ marginBottom: '24px' }} />;
                }
                if (recordError && !sketchRecords) { // Show error only if fetch failed and no sketches loaded
                  return <Card title="Bản phác thảo & Hình ảnh gốc" style={{ marginBottom: '24px' }}><Alert message="Lỗi tải bản phác thảo" description={recordError.toString()} type="error" showIcon /></Card>;
                }

                const phasesToDisplay = showOnlyPhase0Statuses.includes(order?.status)
                  ? [0] // Only phase 0 for ConsultingAndSketching
                  : (sketchRecords && sketchRecords.length > 0 ? Array.from({ length: maxPhase + 1 }, (_, i) => i) : []); // All phases for others, handle empty

                const cardTitle = showOnlyPhase0Statuses.includes(order?.status)
                  ? "Hình ảnh khách hàng cung cấp (Ban đầu)"
                  : "Bản vẽ phác thảo & Hình ảnh gốc";

                if (phasesToDisplay.length === 0 || !sketchRecords || sketchRecords.length === 0) {
                  return (
                    <Card title={cardTitle} style={{ marginBottom: '24px' }}>
                      <Empty description={recordLoading ? "Đang tải bản phác thảo..." : "Chưa có bản phác thảo hoặc hình ảnh gốc nào."} />
                    </Card>
                  );
                }

                return (
                  <Card
                    title={
                      <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PictureOutlined /> {cardTitle}
                      </span>
                    }
                    style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}
                    loading={recordLoading && sketchRecords.length > 0} // Show loading indicator if refetching
                  >
                    {phasesToDisplay.map(phase => {
                      const phaseRecords = sketchRecords.filter(record => record.phase === phase);
                      if (phaseRecords.length === 0) return null;

                      const phaseTitle = phase === 0
                        ? "Hình ảnh khách hàng cung cấp (Ban đầu)"
                        : `Bản phác thảo lần ${phase}`;

                      const isAnySelectedInPhase = phaseRecords.some(record => record.isSelected);
                      // Determine if selection is allowed for this record
                      const isSelectionAllowed = order?.status === 'DoneDeterminingDesignPrice' && phase > 0 && !sketchRecords.some(r => r.isSelected);

                      return (
                        <div key={phase} style={{ marginBottom: '24px' }}>
                          <Title level={5} style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                            {phaseTitle}
                            {isAnySelectedInPhase && <Tag color="green" style={{ marginLeft: 8 }}>Đã chọn</Tag>}
                          </Title>
                          {phaseRecords.map(record => (
                            <div key={record.id} style={{ marginBottom: '16px' }}>
                              <Card
                                hoverable
                                bodyStyle={{ padding: '12px' }}
                                style={{ border: record.isSelected ? '2px solid #52c41a' : '1px solid #f0f0f0', borderRadius: '8px' }}
                              >
                                <Image.PreviewGroup>
                                  <Row gutter={[12, 12]}>
                                    {record.image?.imageUrl && (
                                      <Col xs={24} sm={12} md={8}>
                                        <Image
                                          src={record.image.imageUrl}
                                          alt={`${phase === 0 ? 'Ảnh gốc' : `Phác thảo ${phase}`} 1`}
                                          style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                                        />
                                      </Col>
                                    )}
                                    {record.image?.image2 && (
                                      <Col xs={24} sm={12} md={8}>
                                        <Image
                                          src={record.image.image2}
                                          alt={`${phase === 0 ? 'Ảnh gốc' : `Phác thảo ${phase}`} 2`}
                                          style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                                        />
                                      </Col>
                                    )}
                                    {record.image?.image3 && (
                                      <Col xs={24} sm={12} md={8}>
                                        <Image
                                          src={record.image.image3}
                                          alt={`${phase === 0 ? 'Ảnh gốc' : `Phác thảo ${phase}`} 3`}
                                          style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                                        />
                                      </Col>
                                    )}
                                    {!record.image?.imageUrl && !record.image?.image2 && !record.image?.image3 && (
                                      <Col span={24}>
                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có ảnh trong bản ghi này" />
                                      </Col>
                                    )}
                                  </Row>
                                </Image.PreviewGroup>
                              </Card>

                              {isSelectionAllowed && (
                                <Popconfirm
                                  title={`Xác nhận chọn bản phác thảo ${phase}?`}
                                  onConfirm={() => handleConfirmSketch(record.id)}
                                  okText="Xác nhận"
                                  cancelText="Hủy"
                                  disabled={isSubmitting || recordLoading}
                                >
                                  <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    style={{ marginTop: '10px', width: '100%' }}
                                    loading={isSubmitting}
                                  >
                                    Chọn bản này
                                  </Button>
                                </Popconfirm>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                    {/* Render action buttons AFTER the loop of phases */}
                    {order?.status === 'DoneDeterminingDesignPrice' && (
                      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                        {maxPhase === 1 && (
                          <Button
                            icon={<EditOutlined />}
                            onClick={handleOpenRevisionModal}
                            disabled={isSubmitting || recordLoading}
                          >
                            Yêu cầu phác thảo lại
                          </Button>
                        )}
                        {/* Show Cancel button if maxPhase is 1 OR 2 */}
                        {maxPhase >= 1 && (
                          <Popconfirm
                            title="Bạn chắc chắn muốn hủy đơn hàng này?"
                            onConfirm={handleCancelOrder}
                            okText="Xác nhận hủy"
                            cancelText="Không"
                            okButtonProps={{ danger: true }}
                            disabled={isSubmitting || recordLoading || order?.status === 'WaitDeposit'}
                          >
                            <Button
                              danger
                              icon={<StopOutlined />}
                              loading={isSubmitting && order?.status === 'OrderCancelled'}
                              disabled={isSubmitting || recordLoading || order?.status === 'WaitDeposit'}
                            >
                              Hủy đơn hàng
                            </Button>
                          </Popconfirm>
                        )}
                        {!sketchRecords.some(r => r.isSelected) && maxPhase >= 1 && (
                          <Text type="secondary" style={{ alignSelf: 'center' }}>Vui lòng chọn một bản phác thảo hoặc thực hiện hành động khác.</Text>
                        )}
                      </div>
                    )}
                  </Card>
                );
              }
              else if (order?.image && (order.image.imageUrl || order.image.image2 || order.image.image3)) {
                // ... Fallback image display logic ...
              }
              else {
                // ... Final fallback Empty component ...
              }
            })()}
            {/* ------------- End Conditional Image Display Section ------------- */}

            {order?.description && (
              <Card
                title={
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FileTextOutlined />
                    Mô tả
                  </span>
                }
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  marginBottom: '24px'
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: order.description,
                  }}
                  style={{
                    fontSize: '15px',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }}
                />
              </Card>
            )}

            {/* Products Table Card ... */}
            {order?.serviceOrderDetails && order.serviceOrderDetails.length > 0 && (
              <Card
                title={
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <TagsOutlined />
                    Danh sách vật liệu đã chọn
                  </span>
                }
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  marginBottom: '24px'
                }}
                loading={fetchingProducts || productLoading} // Use combined loading
              >
                <Table
                  columns={productColumns}
                  dataSource={order?.serviceOrderDetails || []}
                  pagination={false}
                  rowKey={(record, index) => `${record.productId}-${index}`}
                  summary={() => {
                    let totalMaterialCost = 0;
                    (order?.serviceOrderDetails || []).forEach(detail => {
                      const product = productDetailsMap[detail.productId];
                      if (product && typeof product.price === 'number' && typeof detail.quantity === 'number') {
                        totalMaterialCost += product.price * detail.quantity;
                      }
                    });
                    const displayMaterialPrice = finalMaterialPriceStatuses.includes(order?.status) && typeof order?.materialPrice === 'number'
                      ? order.materialPrice
                      : totalMaterialCost;

                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3} align="right">
                          <Text strong>
                            {finalMaterialPriceStatuses.includes(order?.status)
                              ? "Tổng tiền vật liệu (chính thức):"
                              : "Tổng tiền vật liệu (dự kiến):"}
                          </Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <Text strong style={{ color: '#cf1322' }}>
                            {formatPrice(displayMaterialPrice)}
                          </Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            )}

            <Card
              title={
                <span style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#4caf50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <HistoryOutlined />
                  Lịch sử trạng thái
                </span>
              }
              style={{
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Timeline mode="left">
                {/* First item: Order Creation */}             
                <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                  <p style={{ fontSize: '15px', marginBottom: '4px' }}>Đơn hàng được tạo</p>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {order?.creationDate ? format(new Date(order.creationDate), "dd/MM/yyyy HH:mm") : '...'}
                  </Text>
                </Timeline.Item>

                {/* Process and display status history */}            
                {(() => {
                  if (!order?.statusHistory || order.statusHistory.length === 0) {
                    // Show current status if no history available (fallback)
                     return (
                        <Timeline.Item color={getStatusColor(order.status)} dot={<ClockCircleOutlined />}>
                          <p style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '600' }}>
                            {getStatusText(order.status)}
                          </p>
                           {/* Optionally add modification date if available */}
                        </Timeline.Item>
                     );
                  }

                  const displayHistory = [];
                  let lastDisplayedStatusText = null;

                  // Add creation as the effective first status text for comparison
                   lastDisplayedStatusText = "Đơn hàng được tạo"; // Or map status 0/Pending if creation date is the first history entry

                  order.statusHistory.forEach(historyEntry => {
                    const currentStatusText = getStatusText(historyEntry.status);
                    // Display every entry from history
                    displayHistory.push({
                      text: currentStatusText, 
                      color: getStatusColor(historyEntry.status),
                      timestamp: historyEntry.timestamp,
                      // Icon based on status (example: cancel icon)
                      icon: historyEntry.status === 'OrderCancelled' || historyEntry.status === 14 
                            ? <CloseCircleOutlined style={{ fontSize: '16px' }}/> 
                            : <ClockCircleOutlined style={{ fontSize: '16px' }}/>
                    });
                  });

                  // Filter out the final status if it's the same as the last history entry displayed
                  const finalStatusText = getStatusText(order.status);
                  const shouldShowFinalStatusSeparately = lastDisplayedStatusText !== finalStatusText;

                  return (
                    <>
                      {displayHistory.map((item, index) => (
                        <Timeline.Item key={index} color={item.color} dot={item.icon}>
                          <p style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '600' }}>
                            {item.text}
                          </p>
                          <Text type="secondary" style={{ fontSize: '14px' }}>
                             {item.timestamp ? format(new Date(item.timestamp), "dd/MM/yyyy HH:mm") : '...'}
                          </Text>
                        </Timeline.Item>
                      ))}
                    </>
                  );
                 })()}
              </Timeline>
            </Card>

          </Card>
        </div>
      </Content>
      <Footer />

      {/* Revision Request Modal */}
      <Modal
        title="Yêu cầu phác thảo lại"
        visible={isRevisionModalVisible}
        onCancel={handleCloseRevisionModal}
        onOk={handleSubmitRevision}
        confirmLoading={isSubmitting}
        okText="Gửi yêu cầu"
        cancelText="Hủy bỏ"
      >
        <p>Vui lòng cho chúng tôi biết lý do bạn muốn phác thảo lại hoặc những điểm cần chỉnh sửa:</p>
        <TextArea
          rows={4}
          value={revisionNote}
          onChange={(e) => setRevisionNote(e.target.value)}
          placeholder="Ví dụ: Tôi muốn thay đổi màu sắc chủ đạo, thêm nhiều cây xanh hơn..."
        />
      </Modal>

    </Layout>
  );
};

export default ServiceOrderDetail; 