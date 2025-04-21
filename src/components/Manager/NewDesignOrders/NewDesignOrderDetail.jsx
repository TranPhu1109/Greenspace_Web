import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useServiceOrderStore from "@/stores/useServiceOrderStore";
import useProductStore from "@/stores/useProductStore";
import useRecordStore from "@/stores/useRecordStore";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import EditorComponent from "@/components/Common/EditorComponent";
import {
  Typography,
  Spin,
  Alert,
  Card,
  Row,
  Col,
  Tag,
  Image,
  Button,
  Descriptions,
  Space,
  Breadcrumb,
  Empty,
  Table,
  Timeline,
  message,
  Popconfirm,
  Modal,
  Input,
  Form,
  InputNumber,
  Tooltip,
  Slider,
} from "antd";
import { format } from "date-fns";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  PictureOutlined,
  ShoppingOutlined,
  ProjectOutlined,
  TagsOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  FilePdfOutlined,
  PlayCircleOutlined,
  EditOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const { Title, Text, TextArea } = Typography;

const NewDesignOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedOrder,
    loading: orderLoading,
    error: orderError,
    getServiceOrderById,
  } = useServiceOrderStore();
  const { getProductById } = useProductStore();
  const { sketchRecords, designRecords, getRecordSketch, getRecordDesign, isLoading: recordLoading } = useRecordStore();
  const { updateStatus, updateDepositSettings } = useDesignOrderStore();
  const [localError, setLocalError] = useState(null);
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [reportManagerModalVisible, setReportManagerModalVisible] = useState(false);
  const [reportManagerText, setReportManagerText] = useState('');
  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(0);
  const [refundPercentage, setRefundPercentage] = useState(0);
  const [depositForm] = Form.useForm();

  useEffect(() => {
    const fetchOrderDetailAndRelatedData = async () => {
      if (!id) return;

      // Reset local states on new ID
      setLocalError(null);
      setFetchingProducts(false);
      setProductDetailsMap({});

      try {
        console.log(`[Effect] Fetching order details for ID: ${id}`);
        // Trigger the main order fetch (updates store's selectedOrder, loading, error)
        await getServiceOrderById(id);

        // Get the result directly from the store *after* the fetch
        const freshlyFetchedOrder = useServiceOrderStore.getState().selectedOrder;
        console.log('[Effect] Fetched order details result:', freshlyFetchedOrder);

        // Fetch related data only if the main fetch was successful and matches the current ID
        if (freshlyFetchedOrder && freshlyFetchedOrder.id === id) {
          const currentStatus = freshlyFetchedOrder.status;
          console.log(`[Effect] Current order status: ${currentStatus}`);

          // Fetch sketch records for most statuses (EXCEPT Pending/Consulting)
          if (currentStatus !== 'Pending' && currentStatus !== 0 && currentStatus !== 'ConsultingAndSketching' && currentStatus !== 1) {
            console.log('[Effect] Status is past initial phase, fetching sketch records...');
            getRecordSketch(id);
          } else {
            console.log('[Effect] Status is Pending or Consulting, skipping sketch record fetch.');
          }

          // Fetch design records specifically when design is done
          if (currentStatus === 'DoneDesign' || currentStatus === 6) { // Check for both string and potential number
            console.log('[Effect] Fetching design records...');
            getRecordDesign(id);
          }

          // Fetch product details
          if (freshlyFetchedOrder.serviceOrderDetails && freshlyFetchedOrder.serviceOrderDetails.length > 0) {
            console.log('[Effect] Triggering product details fetch...');
            fetchProductDetails(freshlyFetchedOrder.serviceOrderDetails);
          } else {
            console.log('[Effect] No product details to fetch.');
          }
        } else if (!freshlyFetchedOrder) {
          console.warn('[Effect] Order not found after fetch.');
        } else if (freshlyFetchedOrder.id !== id) {
          console.warn('[Effect] Fetched order ID mismatch. URL ID:', id, 'Fetched ID:', freshlyFetchedOrder.id);
        }
      } catch (error) {
        // Errors from getServiceOrderById are set in the store (orderError)
        console.error("[Effect] Error during getServiceOrderById call:", error);
      }
    };

    fetchOrderDetailAndRelatedData();

    // Cleanup function
    return () => {
      console.log('[Effect Cleanup] Cleaning up for ID:', id);
      // Reset local component states
      setProductDetailsMap({});
      setFetchingProducts(false);
      setLocalError(null);
      // Optionally clear store state if needed on unmount
      // useServiceOrderStore.setState({ selectedOrder: null, error: null });
    };
  }, [id, getServiceOrderById, getRecordSketch, getRecordDesign]);

  useEffect(() => {
    if (selectedOrder) {
      // API format uses 1.0 = 1%, no conversion needed
      setDepositPercentage(selectedOrder.depositPercentage || 0);
      setRefundPercentage(selectedOrder.refundPercentage || 0);
    }
  }, [selectedOrder]);

  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return price.toLocaleString("vi-VN") + " VNĐ";
  };

  const fetchProductDetails = async (details) => {
    if (fetchingProducts) {
      console.log('[fetchProductDetails] Already fetching, skipping.');
      return;
    }
    setFetchingProducts(true);
    console.log('[fetchProductDetails] Starting fetch...');
    try {
      const productPromises = details.map(detail => getProductById(detail.productId));
      const productResults = await Promise.all(productPromises);
      const detailsMap = {};
      productResults.forEach((product, index) => {
        if (product) {
          detailsMap[details[index].productId] = product;
        }
      });
      console.log('[fetchProductDetails] Fetched details map:', detailsMap);
      setProductDetailsMap(detailsMap);
    } catch (error) {
      console.error("[fetchProductDetails] Error fetching product details:", error);
      setLocalError("Lỗi khi tải chi tiết sản phẩm.");
    } finally {
      console.log('[fetchProductDetails] Setting fetchingProducts to false.');
      setFetchingProducts(false);
    }
  };

  const handleStatusUpdate = async (orderId, status, successMessage, errorMessagePrefix) => {
    if (!orderId) return;
    try {
      await updateStatus(orderId, status);
      message.success(successMessage);
      await getServiceOrderById(orderId);
    } catch (err) {
      message.error(`${errorMessagePrefix}: ${err.message}`);
    }
  };

  const handleApprovePrice = () => {
    handleStatusUpdate(
      selectedOrder?.id,
      22,
      'Đã duyệt giá thiết kế thành công.',
      'Lỗi duyệt giá'
    );
  };

  const handleRejectPrice = () => {
    // Tạo một mẫu báo cáo làm điểm khởi đầu
    const initialTemplate = `<h3>Yêu cầu điều chỉnh</h3>
<p>Sau khi xem xét bản phác thảo và giá thiết kế, chúng tôi yêu cầu điều chỉnh các nội dung sau:</p>
<h4>Về phác thảo:</h4>
<ul>
    <li>...</li>
    <li>...</li>
</ul>
<h4>Về giá thiết kế:</h4>
<ul>
    <li>...</li>
    <li>...</li>
</ul>
<p>Vui lòng cập nhật và gửi lại để chúng tôi xem xét.</p>`;

    setReportManagerText(initialTemplate);
    setReportManagerModalVisible(true);
  };

  const handleRejectPriceSubmit = () => {
    // Kiểm tra nội dung rich text có trống không 
    // (loại bỏ các thẻ HTML trống và khoảng trắng)
    const isEmptyContent = !reportManagerText ||
      reportManagerText.replace(/<[^>]*>/g, '').trim() === '';

    if (isEmptyContent) {
      message.error('Vui lòng nhập lý do yêu cầu điều chỉnh');
      return;
    }

    // Call the store's updateReport method to update status and report
    try {
      useDesignOrderStore.getState().updateReport(
        selectedOrder?.id,
        24,
        reportManagerText,
        ""
      );
      message.success('Đã gửi yêu cầu điều chỉnh thành công.');
      // Refresh order data
      getServiceOrderById(selectedOrder?.id);
    } catch (err) {
      message.error(`Lỗi yêu cầu điều chỉnh: ${err.message}`);
    }

    setReportManagerModalVisible(false);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "orange",
      ConsultingAndSketching: "blue",
      DeterminingDesignPrice: "purple",
      DoneDeterminingDesignPrice: "green",
      ReDeterminingDesignPrice: "red",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      DeterminingDesignPrice: "Chờ xác định giá",
      DoneDeterminingDesignPrice: "Đã duyệt giá thiết kế",
      ReDeterminingDesignPrice: "Yêu cầu sửa giá TK",
    };
    return statusTexts[status] || status;
  };

  const showDepositModal = () => {
    // Get values directly from currentOrder to ensure consistency with what's displayed in the UI
    const currentDepositPercentage = currentOrder?.depositPercentage || 0;
    const currentRefundPercentage = currentOrder?.refundPercentage || 0;

    // Set reasonable values for initial setup (when they're 1.0/1%)
    const finalDepositPercentage = currentDepositPercentage <= 1.0 ? 50.0 : currentDepositPercentage;
    const finalRefundPercentage = currentRefundPercentage <= 1.0 ? 30.0 : currentRefundPercentage;

    // Update local state
    setDepositPercentage(finalDepositPercentage);
    setRefundPercentage(finalRefundPercentage);

    // Update form values
    depositForm.setFieldsValue({
      depositPercentage: finalDepositPercentage,
      refundPercentage: finalRefundPercentage
    });

    // Show modal
    setIsDepositModalVisible(true);
  };

  // Update the isDepositSettingsValid function - 1.0 means 1%, not 100%
  const isDepositSettingsValid = () => {
    // Check if deposit percentage has been set to a reasonable value (not 1%)
    const isDepositReasonable = (selectedOrder?.depositPercentage || 0) >= 10.0;

    // Check if refund percentage doesn't exceed deposit percentage
    const isRefundValid = (selectedOrder?.refundPercentage || 0) <= (selectedOrder?.depositPercentage || 0);

    return isDepositReasonable && isRefundValid;
  };

  // Update the warning message function
  const getDepositSettingsWarning = () => {
    if ((selectedOrder?.depositPercentage || 0) < 10.0) {
      return 'Vui lòng điều chỉnh tỷ lệ tiền cọc (tối thiểu 10%)';
    }

    if ((selectedOrder?.refundPercentage || 0) > (selectedOrder?.depositPercentage || 0)) {
      return 'Tỷ lệ hoàn tiền không được lớn hơn tỷ lệ tiền đặt cọc';
    }

    return '';
  };

  // Now modify the handleDepositSettingsSubmit function to add validation
  const handleDepositSettingsSubmit = async () => {
    try {
      const values = await depositForm.validateFields();

      // Add additional validation for refund percentage
      if (values.refundPercentage > values.depositPercentage) {
        message.error('Tỷ lệ hoàn tiền không được lớn hơn tỷ lệ tiền đặt cọc');
        return;
      }

      // Convert percentages back to the format the API expects (1.0 = 1%)
      const depositPercentForAPI = values.depositPercentage;
      const refundPercentForAPI = values.refundPercentage;

      await updateDepositSettings(
        selectedOrder?.id,
        depositPercentForAPI,
        refundPercentForAPI
      );

      // Update local state with displayed percentage values
      setDepositPercentage(values.depositPercentage);
      setRefundPercentage(values.refundPercentage);

      message.success('Cập nhật tỷ lệ tiền cọc và hoàn trả thành công');
      setIsDepositModalVisible(false);

      // Refresh order data
      getServiceOrderById(selectedOrder?.id);
    } catch (error) {
      if (error.errorFields) {
        // Form validation error
        message.error('Vui lòng kiểm tra lại thông tin nhập vào');
      } else {
        // API error
        message.error(`Lỗi khi cập nhật: ${error.message}`);
      }
    }
  };

  if (orderLoading) {
    console.log("Render: Loading state (orderLoading is true)");
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <Spin size="large" tip="Đang tải thông tin đơn hàng..." />
      </div>
    );
  }

  const displayError = orderError || localError;
  if (displayError) {
    console.error("Render: Error state", { displayError, orderError, localError });
    return (
      <div className="container mx-auto px-4 py-8" style={{ paddingTop: "20px" }}>
        <Alert
          type="error"
          message="Lỗi"
          description={displayError || "Không thể tải thông tin đơn hàng. Vui lòng thử lại."}
          className="mb-4"
        />
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/manager/new-design-orders")}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  if (!selectedOrder || selectedOrder.id !== id) {
    console.warn(`Render: Data not ready or mismatch. URL ID: ${id}, selectedOrder ID: ${selectedOrder?.id}. Showing loading/wait state.`);
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <Spin size="large" tip={`Đang tải dữ liệu cho đơn hàng ${id ? id.substring(0, 8) : ''}...`} />
      </div>
    );
  }

  console.log("Render: Rendering main content for order:", selectedOrder.id);
  const currentOrder = selectedOrder;
  const hasImages = currentOrder.image && (currentOrder.image.imageUrl || currentOrder.image.image2 || currentOrder.image.image3);

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
        const displayPrice = typeof record.price === 'number' && record.price > 0
          ? record.price
          : product?.price;
        return <Text>{formatPrice(displayPrice)}</Text>;
      },
    },
    {
      title: 'Thành tiền',
      key: 'totalPrice',
      align: 'right',
      render: (_, record) => {
        if (typeof record.totalPrice === 'number' && record.totalPrice > 0) {
          return <Text strong style={{ color: '#4caf50' }}>{formatPrice(record.totalPrice)}</Text>;
        }
        const product = productDetailsMap[record.productId];
        const price = typeof record.price === 'number' && record.price > 0
          ? record.price
          : product?.price;
        const quantity = record.quantity;
        const calculatedTotalPrice = (typeof price === 'number' && typeof quantity === 'number')
          ? price * quantity
          : 0;
        return <Text strong style={{ color: '#4caf50' }}>{formatPrice(calculatedTotalPrice)}</Text>;
      },
    },
    {
      title: 'Hướng dẫn',
      key: 'guide',
      align: 'center',
      render: (_, record) => {
        const product = productDetailsMap[record.productId];
        const guideUrl = product?.designImage1URL;
        if (guideUrl) {
          const isPdf = guideUrl.toLowerCase().endsWith('.pdf');
          const buttonText = isPdf ? 'Xem PDF' : 'Xem Video';
          return (
            <Button
              type="link"
              href={guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              icon={isPdf ? <FilePdfOutlined /> : <PlayCircleOutlined />}
            >
              {buttonText}
            </Button>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
  ];

  const renderCostCard = () => {
    if (!currentOrder?.designPrice && !currentOrder?.materialPrice) return null;

    return (
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
            <DollarOutlined />
            Chi phí
          </span>
        }
        style={{
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px'
        }}
        extra={
          (currentOrder?.status === 'DeterminingDesignPrice' || currentOrder?.status === 'ReDeterminingDesignPrice' ||
            currentOrder?.status === 2 || currentOrder?.status === 24) && (
            <Tooltip title="Chỉnh sửa tỷ lệ tiền cọc và hoàn trả">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={showDepositModal}
              >
                Cài đặt tiền cọc
              </Button>
            </Tooltip>
          )
        }
      >
        <Descriptions column={1} size="middle">
          {typeof currentOrder.designPrice === 'number' && (
            <Descriptions.Item label="Giá thiết kế">{formatPrice(currentOrder.designPrice)}</Descriptions.Item>
          )}
          <Descriptions.Item label="Tỷ lệ tiền cọc giá thiết kế">
            <Text strong style={{ color: '#1890ff' }}>
              {currentOrder.depositPercentage.toFixed(1)}%
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tỷ lệ hoàn trả giá thiết kế">
            <Text strong style={{ color: '#1890ff' }}>
              {currentOrder.refundPercentage.toFixed(1)}%
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền cần cọc giá thiết kế">
            <Text strong style={{ fontSize: '1.1em', color: '#1890ff' }}>
              {formatPrice(currentOrder.designPrice * currentOrder.depositPercentage)}
            </Text>
          </Descriptions.Item>
          {typeof currentOrder.materialPrice === 'number' && (
            <Descriptions.Item label="Giá vật liệu">{formatPrice(currentOrder.materialPrice)}</Descriptions.Item>
          )}
          <Descriptions.Item label="Tổng cộng">
            <Text strong style={{ fontSize: '1.1em', color: '#cf1322' }}>
              {formatPrice(currentOrder.totalCost || (currentOrder.designPrice + currentOrder.materialPrice))}
            </Text>
          </Descriptions.Item>



          {/* Add deposit information */}
          {/* {(currentOrder?.status === 'DeterminingDesignPrice' || currentOrder?.status === 'ReDeterminingDesignPrice' ||
            currentOrder?.status === 2 || currentOrder?.status === 24) && (
              <>
                <Descriptions.Item label="Tỷ lệ tiền cọc">
                  <Text strong style={{ color: '#1890ff' }}>
                    {currentOrder.depositPercentage.toFixed(1)}%
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tỷ lệ hoàn trả">
                  <Text strong style={{ color: '#1890ff' }}>
                    {currentOrder.refundPercentage.toFixed(1)}%
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền cần cọc">
                  <Text strong style={{ fontSize: '1.1em', color: '#1890ff' }}>
                    {formatPrice(currentOrder.designPrice * currentOrder.depositPercentage)}
                  </Text>
                </Descriptions.Item>
              </>
            )} */}
        </Descriptions>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ paddingTop: "20px" }}>
      <Breadcrumb
        items={[
          {
            title: (
              <Link to="/manager/dashboard">
                <Space>
                  <HomeOutlined style={{ fontSize: '18px' }} />
                  <span style={{ fontSize: '16px' }}>Dashboard</span>
                </Space>
              </Link>
            ),
          },
          {
            title: (
              <Link to="/manager/new-design-orders">
                <Space>
                  <ProjectOutlined style={{ fontSize: '18px' }} />
                  <span style={{ fontSize: '16px' }}>Đơn đặt thiết kế mới</span>
                </Space>
              </Link>
            ),
          },
          {
            title: (
              <Space>
                <ShoppingOutlined style={{ fontSize: '18px' }} />
                <span style={{ fontSize: '16px' }}>Chi tiết đơn #{id.substring(0, 8)}</span>
              </Space>
            ),
          },
        ]}
        style={{
          marginBottom: '16px',
          padding: '12px 16px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      />

      <Card
        className="shadow-md mb-6"
        style={{
          marginBottom: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/manager/new-design-orders")}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              Quay lại
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              Chi tiết đơn <span style={{ color: '#4caf50' }}>#{id.substring(0, 8)}</span>
            </Title>
          </div>
        }
        extra={
          <Tag color={getStatusColor(currentOrder.status)} size="large">
            {getStatusText(currentOrder.status)}
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
              style={{ height: '100%', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)' }}
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Tên">{currentOrder.userName}</Descriptions.Item>
                <Descriptions.Item label="Email">{currentOrder.email}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{currentOrder.cusPhone}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{currentOrder.address?.replace(/\|/g, ', ') ?? 'N/A'}</Descriptions.Item>
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
                  Thông tin yêu cầu
                </span>
              }
              style={{ height: '100%', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)' }}
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Kích thước">{currentOrder.length}m x {currentOrder.width}m</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">{format(new Date(currentOrder.creationDate), "dd/MM/yyyy HH:mm")}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {(currentOrder.status === 'ConsultingAndSketching' && sketchRecords.length > 0) ||
          (currentOrder.status === 'DoneDesign' && designRecords.length > 0) ? (
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
                <PictureOutlined />
                {currentOrder.status === 'ConsultingAndSketching' ? 'Bản vẽ phác thảo' : 'Bản vẽ thiết kế'}
              </span>
            }
            style={{
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              marginBottom: '24px'
            }}
            loading={recordLoading}
          >
            {[0, 1, 2].map(phase => {
              const recordsInPhase = (currentOrder.status === 'ConsultingAndSketching' ? sketchRecords : designRecords)
                .filter(record => record.phase === phase);
              if (recordsInPhase.length === 0) return null;

              const phaseTitle = phase === 0
                ? "Ảnh khách hàng cung cấp"
                : `${currentOrder.status === 'ConsultingAndSketching' ? 'Bản phác thảo' : 'Bản thiết kế'} lần ${phase}`;
              const isSelectedPhase = recordsInPhase.some(record => record.isSelected);

              return (
                <div key={phase} style={{ marginBottom: '20px' }}>
                  <Title level={5} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                    {phaseTitle}
                    {isSelectedPhase && <Tag color="green" style={{ marginLeft: 8 }}>Đã chọn</Tag>}
                  </Title>
                  <Row gutter={[16, 16]}>
                    {recordsInPhase.map(record => (
                      <Col xs={24} sm={8} key={record.id}>
                        <Card hoverable style={record.isSelected ? { border: '2px solid #52c41a' } : {}} bodyStyle={{ padding: 0 }}>
                          <Image src={record.image?.imageUrl || '/placeholder.png'} alt={`Ảnh ${phaseTitle} 1`} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                          {record.image?.image2 && <Image src={record.image.image2} alt={`Ảnh ${phaseTitle} 2`} style={{ width: '100%', height: '200px', objectFit: 'cover', marginTop: '8px' }} />}
                          {record.image?.image3 && <Image src={record.image.image3} alt={`Ảnh ${phaseTitle} 3`} style={{ width: '100%', height: '200px', objectFit: 'cover', marginTop: '8px' }} />}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              );
            })}
            {(currentOrder.status === 'ConsultingAndSketching' && sketchRecords.length === 0 && !recordLoading) ||
              (currentOrder.status === 'DoneDesign' && designRecords.length === 0 && !recordLoading) ? (
              <Empty description={`Chưa có ${currentOrder.status === 'ConsultingAndSketching' ? 'bản phác thảo' : 'bản thiết kế'} nào được tải lên.`} />
            ) : null}
          </Card>
        ) : (
          hasImages && (
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
                  <PictureOutlined />
                  Hình ảnh khách hàng cung cấp
                </span>
              }
              style={{
                borderRadius: '8px',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                marginBottom: '24px'
              }}
            >
              <Row gutter={[16, 16]}>
                {currentOrder.image.imageUrl && (
                  <Col xs={24} sm={8}>
                    <Image src={currentOrder.image.imageUrl} alt="Hình ảnh 1" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                  </Col>
                )}
                {currentOrder.image.image2 && (
                  <Col xs={24} sm={8}>
                    <Image src={currentOrder.image.image2} alt="Hình ảnh 2" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                  </Col>
                )}
                {currentOrder.image.image3 && (
                  <Col xs={24} sm={8}>
                    <Image src={currentOrder.image.image3} alt="Hình ảnh 3" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                  </Col>
                )}
                {!currentOrder.image.imageUrl && !currentOrder.image.image2 && !currentOrder.image.image3 && (
                  <Col span={24}>
                    <Empty description="Khách hàng không cung cấp hình ảnh." />
                  </Col>
                )}
              </Row>
            </Card>
          )
        )}

        {currentOrder.description && (
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
                Mô tả yêu cầu
              </span>
            }
            style={{
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              marginBottom: '24px'
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: currentOrder.description }} />
          </Card>
        )}

        {currentOrder.report && (
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
                <EditOutlined />
                Ghi chú / Báo cáo từ Designer
              </span>
            }
            style={{
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              marginBottom: '24px'
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: currentOrder.report }} />
          </Card>
        )}

        {renderCostCard()}

        {currentOrder?.status === 'DeterminingDesignPrice' && currentOrder?.designPrice > 0 && (
          <Card
            title="Xác nhận giá thiết kế"
            style={{
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              marginTop: '24px'
            }}
            bodyStyle={{ textAlign: 'right' }}
          >
            {!isDepositSettingsValid() && (
              <Alert
                message={
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d46b08' }}>
                    ⚠️ Cảnh báo về cài đặt tiền cọc
                  </div>
                }
                description={
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#d48806' }}>{getDepositSettingsWarning()}</p>
                    <p>
                      Trước khi duyệt giá thiết kế, bạn cần đảm bảo các thông số <strong>tiền cọc</strong> và <strong>hoàn trả</strong> được thiết lập hợp lý.
                    </p>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={showDepositModal}
                      style={{ marginTop: '8px' }}
                    >
                      Cài đặt tiền cọc
                    </Button>
                  </div>
                }
                type="warning"
                // showIcon
                style={{ marginBottom: '16px', textAlign: 'left' }}
              />
            )}
            <Space size="middle">
              <Button danger icon={<CloseCircleOutlined />} onClick={handleRejectPrice}>
                Yêu cầu điều chỉnh phác thảo/giá thiết kế
              </Button>

              <Popconfirm
                title="Bạn chắc chắn muốn DUYỆT mức giá thiết kế này?"
                onConfirm={handleApprovePrice}
                okText="Duyệt"
                cancelText="Hủy"
                disabled={!isDepositSettingsValid()}
              >
                <Button type="primary" icon={<CheckCircleOutlined />} disabled={!isDepositSettingsValid()}>
                  Duyệt giá thiết kế
                </Button>
              </Popconfirm>
            </Space>
          </Card>
        )}

      </Card>

      <Modal
        title="Yêu cầu điều chỉnh phác thảo/giá thiết kế"
        open={reportManagerModalVisible}
        onOk={handleRejectPriceSubmit}
        onCancel={() => setReportManagerModalVisible(false)}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        width={800}
      >
        <div className="instruction-container" style={{ marginBottom: '16px' }}>
          <div style={{
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <Typography.Title level={5} style={{ color: '#52c41a', marginTop: 0 }}>
              Yêu cầu điều chỉnh
            </Typography.Title>
            <Typography.Paragraph>
              Vui lòng nhập chi tiết lý do yêu cầu điều chỉnh phác thảo hoặc giá thiết kế.
              Thông tin này sẽ được gửi trực tiếp đến designer để thực hiện chỉnh sửa.
            </Typography.Paragraph>
            <Typography.Paragraph strong>
              Hãy cung cấp các thông tin cụ thể:
            </Typography.Paragraph>
            <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>
              <li>Điều gì cần thay đổi trong bản phác thảo?</li>
              <li>Lý do giá thiết kế cần điều chỉnh?</li>
              <li>Các gợi ý về mức giá phù hợp (nếu có)</li>
            </ul>
          </div>
        </div>

        <EditorComponent
          value={reportManagerText}
          onChange={(content) => setReportManagerText(content)}
          height={500}
        />
      </Modal>

      <Modal
        title="Thiết lập tỷ lệ tiền cọc và hoàn trả"
        open={isDepositModalVisible}
        onOk={handleDepositSettingsSubmit}
        onCancel={() => setIsDepositModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Alert
          message="Thiết lập tỷ lệ tiền cọc và hoàn trả"
          description={getDepositSettingsWarning() || "Điều chỉnh tỷ lệ tiền cọc khách hàng cần đặt trước khi thiết kế và tỷ lệ hoàn trả nếu khách hàng hủy đơn."}
          type={getDepositSettingsWarning() ? "warning" : "info"}
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Form
          form={depositForm}
          layout="vertical"
          initialValues={{
            depositPercentage: depositPercentage,
            refundPercentage: refundPercentage
          }}
          onValuesChange={(changedValues) => {
            // Update local state when form values change
            if ('depositPercentage' in changedValues) {
              const value = changedValues.depositPercentage;
              if (value !== null && value !== undefined && !isNaN(value)) {
                setDepositPercentage(value);
              }
            }
            if ('refundPercentage' in changedValues) {
              const value = changedValues.refundPercentage;
              if (value !== null && value !== undefined && !isNaN(value)) {
                setRefundPercentage(value);
              }
            }
          }}
        >
          <Form.Item
            name="depositPercentage"
            label="Tỷ lệ tiền cọc (%)"
            extra={`Khách hàng sẽ phải đặt cọc ${(!depositPercentage || isNaN(depositPercentage)) ? '0' : Number(depositPercentage).toFixed(1)}% giá thiết kế (${formatPrice((currentOrder?.designPrice || 0) * (depositPercentage / 100 || 0))})`}
            rules={[
              { required: true, message: 'Vui lòng nhập tỷ lệ tiền cọc' },
              { type: 'number', min: 10, max: 100, message: 'Tỷ lệ phải từ 10 đến 100%' }
            ]}
          >
            <Space style={{ width: '100%' }} direction="vertical">
              <Slider
                min={10}
                max={100}
                step={1}
                onChange={(value) => {
                  // Don't allow depositPercentage to be less than refundPercentage or below 10%
                  const refundValue = depositForm.getFieldValue('refundPercentage') || 0;
                  const safeValue = Math.max(value, refundValue, 10);

                  depositForm.setFieldsValue({ depositPercentage: safeValue });
                  // Trigger form validation and re-render
                  depositForm.validateFields(['depositPercentage']);
                  // Update extra text immediately by updating local state
                  setDepositPercentage(safeValue);
                }}
                value={depositForm.getFieldValue('depositPercentage')}
                marks={{
                  10: '10%',
                  30: '30%',
                  50: '50%',
                  70: '70%',
                  90: '90%',
                  100: '100%'
                }}
                tooltip={{
                  formatter: (value) => {
                    if (value === null || value === undefined || isNaN(value)) return '0%';
                    return `${Number(value).toFixed(1)}%`;
                  }
                }}
              />

              {/* Simplified buttons - reduced number for cleaner UI */}
              <Row gutter={[16, 16]} style={{ marginTop: '8px' }}>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {[10, 30, 50, 70, 100].map(percent => (
                      <Button
                        key={percent}
                        type={depositPercentage === percent ? 'primary' : 'default'}
                        style={{ width: '18%', margin: '0 1%' }}
                        onClick={() => {
                          const refundValue = depositForm.getFieldValue('refundPercentage') || 0;
                          // Only allow setting if greater than refund percentage
                          if (percent >= refundValue) {
                            depositForm.setFieldsValue({ depositPercentage: percent });
                            setDepositPercentage(percent);
                          } else {
                            message.warning(`Tỷ lệ tiền cọc không thể thấp hơn tỷ lệ hoàn trả (${refundValue}%)`);
                          }
                        }}
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>
                </Col>

                <Col span={24}>
                  <Card size="small" style={{ textAlign: 'center', background: '#f5f5f5' }}>
                    <Space align="center">
                      <Text>Giá trị hiện tại:</Text>
                      <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                        {depositForm.getFieldValue('depositPercentage')}%
                      </Text>

                      <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => {
                          const currentValue = depositForm.getFieldValue('depositPercentage') || 0;
                          const refundValue = depositForm.getFieldValue('refundPercentage') || 0;
                          // Don't allow below 10% or refund percentage
                          const newValue = Math.max(currentValue - 1, refundValue, 10);
                          depositForm.setFieldsValue({ depositPercentage: newValue });
                          setDepositPercentage(newValue);
                        }}
                        disabled={depositForm.getFieldValue('depositPercentage') <= Math.max((depositForm.getFieldValue('refundPercentage') || 0), 10)}
                      />
                      <Button
                        icon={<ArrowRightOutlined />}
                        onClick={() => {
                          const currentValue = depositForm.getFieldValue('depositPercentage') || 0;
                          const newValue = Math.min(currentValue + 1, 100);
                          depositForm.setFieldsValue({ depositPercentage: newValue });
                          setDepositPercentage(newValue);
                        }}
                        disabled={depositForm.getFieldValue('depositPercentage') >= 100}
                      />
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Space>
          </Form.Item>

          <Form.Item
            name="refundPercentage"
            label="Tỷ lệ hoàn trả (%)"
            extra="Tỷ lệ tiền hoàn trả khi khách hàng hủy đơn sau khi đã đặt cọc, không được lớn hơn tỷ lệ tiền đặt cọc."
            rules={[
              { required: true, message: 'Vui lòng nhập tỷ lệ hoàn trả' },
              { type: 'number', min: 0, max: 100, message: 'Tỷ lệ phải từ 0 đến 100%' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('depositPercentage') >= value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Tỷ lệ hoàn trả không được lớn hơn tỷ lệ tiền đặt cọc'));
                },
              }),
            ]}
          >
            <Space style={{ width: '100%' }} direction="vertical">
              <Slider
                min={0}
                max={100}
                step={1}
                onChange={(value) => {
                  // Don't allow refundPercentage to be greater than depositPercentage
                  const depositValue = depositForm.getFieldValue('depositPercentage') || 0;
                  const safeValue = Math.min(value, depositValue);

                  depositForm.setFieldsValue({ refundPercentage: safeValue });
                  // Trigger form validation and re-render
                  depositForm.validateFields(['refundPercentage']);
                  // Update local state
                  setRefundPercentage(safeValue);
                }}
                value={depositForm.getFieldValue('refundPercentage')}
                marks={{
                  0: '0%',
                  25: '25%',
                  50: '50%',
                  75: '75%',
                  100: '100%'
                }}
                tooltip={{
                  formatter: (value) => {
                    if (value === null || value === undefined || isNaN(value)) return '0%';
                    return `${Number(value).toFixed(1)}%`;
                  }
                }}
              />

              {/* Simplified buttons - reduced number for cleaner UI */}
              <Row gutter={[16, 16]} style={{ marginTop: '8px' }}>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {[0, 20, 30, 40, 60, 80].map(percent => (
                      <Button
                        key={percent}
                        type={refundPercentage === percent ? 'primary' : 'default'}
                        style={{ width: '18%', margin: '0 1%' }}
                        onClick={() => {
                          const depositValue = depositForm.getFieldValue('depositPercentage') || 0;
                          // Only allow setting if less than deposit percentage
                          if (percent <= depositValue) {
                            depositForm.setFieldsValue({ refundPercentage: percent });
                            setRefundPercentage(percent);
                          } else {
                            message.warning(`Tỷ lệ hoàn trả không thể cao hơn tỷ lệ tiền cọc (${depositValue}%)`);
                          }
                        }}
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>
                </Col>

                <Col span={24}>
                  <Card size="small" style={{ textAlign: 'center', background: '#f5f5f5' }}>
                    <Space align="center">
                      <Text>Giá trị hiện tại:</Text>
                      <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                        {depositForm.getFieldValue('refundPercentage')}%
                      </Text>

                      <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => {
                          const currentValue = depositForm.getFieldValue('refundPercentage') || 0;
                          const newValue = Math.max(currentValue - 1, 0);
                          depositForm.setFieldsValue({ refundPercentage: newValue });
                          setRefundPercentage(newValue);
                        }}
                        disabled={depositForm.getFieldValue('refundPercentage') <= 0}
                      />
                      <Button
                        icon={<ArrowRightOutlined />}
                        onClick={() => {
                          const currentValue = depositForm.getFieldValue('refundPercentage') || 0;
                          const depositValue = depositForm.getFieldValue('depositPercentage') || 0;
                          const newValue = Math.min(currentValue + 1, depositValue);
                          depositForm.setFieldsValue({ refundPercentage: newValue });
                          setRefundPercentage(newValue);
                        }}
                        disabled={depositForm.getFieldValue('refundPercentage') >= depositForm.getFieldValue('depositPercentage')}
                      />
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default NewDesignOrderDetail; 