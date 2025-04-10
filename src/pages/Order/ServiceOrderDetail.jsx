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
  Empty
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
  CloseCircleOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const ServiceOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, loading, error, getServiceOrderById } = useServiceOrderStore();
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

  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "orange",
      PaymentSuccess: "green",
      Processing: "blue",
      PickedPackageAndDelivery: "cyan",
      DeliveryFail: "red",
      ReDelivery: "purple",
      DeliveredSuccessfully: "green",
      CompleteOrder: "green",
      OrderCancelled: "red",
      ConsultingAndSketching: "blue",
      NoDesignIdea: "default",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      PaymentSuccess: "Đã thanh toán",
      Processing: "Đang xử lý",
      PickedPackageAndDelivery: "Đã nhận gói và giao hàng",
      DeliveryFail: "Giao hàng thất bại",
      ReDelivery: "Giao hàng lại",
      DeliveredSuccessfully: "Giao hàng thành công",
      CompleteOrder: "Hoàn thành đơn hàng",
      OrderCancelled: "Đã hủy đơn hàng",
      ConsultingAndSketching: "Đang tư vấn và phác thảo",
      NoDesignIdea: "Không có mẫu thiết kế",
    };
    return statusTexts[status] || status;
  };

  // Hàm xử lý xác nhận bản phác thảo
  const handleConfirmSketch = async (recordId) => {
    try {
      await confirmRecord(recordId);
      message.success('Đã chọn bản phác thảo thành công!');
      // Fetch lại dữ liệu đơn hàng để cập nhật trạng thái và giao diện
      await getServiceOrderById(id);
      // Hoặc có thể chỉ cần fetch lại sketch records nếu API confirm không trả về đủ thông tin
      // await getRecordSketch(id);
    } catch (err) {
      message.error('Không thể chọn bản phác thảo: ' + err.message);
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

  // -------- Main Render --------
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
              // --- Case 1: Show ONLY Phase 0 Sketches ---
              if (showOnlyPhase0Statuses.includes(order?.status)) {
                if (recordLoading) {
                   return <Card title="Hình ảnh khách hàng cung cấp (Ban đầu)" loading={true} style={{ marginBottom: '24px' }} />;
                }
                if (recordError) {
                  return <Card title="Hình ảnh khách hàng cung cấp (Ban đầu)" style={{ marginBottom: '24px' }}><Alert message="Lỗi tải bản phác thảo" description={recordError.toString()} type="error" showIcon /></Card>;
                }
                const phase0Records = sketchRecords?.filter(record => record.phase === 0) || [];
                if (phase0Records.length > 0) {
                  return (
                    <Card
                       title={
                          <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <PictureOutlined /> Hình ảnh khách hàng cung cấp (Ban đầu)
                          </span>
                       }
                       style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}
                    >
                       {/* Display records for Phase 0 */}
                        {phase0Records.map(record => (
                          <div key={record.id} style={{ marginBottom: '16px' }}>
                             <Card 
                                hoverable 
                                bodyStyle={{ padding: '12px' }} 
                                style={{ border: '1px solid #f0f0f0', borderRadius: '8px' }} 
                             > 
                                <Image.PreviewGroup>
                                  <Row gutter={[12, 12]}> { /* Inner grid for images */}
                                    {record.image?.imageUrl && (
                                      <Col xs={24} sm={12} md={8}> { /* Responsive column */}
                                        <Image
                                          src={record.image.imageUrl}
                                          alt={`Ảnh gốc 1`}
                                          style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                                        />
                                      </Col>
                                    )}
                                    {record.image?.image2 && (
                                      <Col xs={24} sm={12} md={8}>
                                        <Image
                                          src={record.image.image2}
                                          alt={`Ảnh gốc 2`}
                                          style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                                        />
                                      </Col>
                                    )}
                                    {record.image?.image3 && (
                                      <Col xs={24} sm={12} md={8}>
                                        <Image
                                          src={record.image.image3}
                                          alt={`Ảnh gốc 3`}
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
                          </div>
                        ))}
                    </Card>
                  );
                } else {
                   return (
                     <Card title="Hình ảnh khách hàng cung cấp (Ban đầu)" style={{ marginBottom: '24px' }}>
                       <Empty description="Không tìm thấy hình ảnh ban đầu trong bản ghi phác thảo." />
                     </Card>
                   );
                }
              }
              // --- Case 2: Show ALL Sketch Phases ---
              else if (showAllPhasesStatuses.includes(order?.status)) {
                 if (recordLoading) {
                   return <Card title="Bản vẽ phác thảo & Hình ảnh gốc" loading={true} style={{ marginBottom: '24px' }} />;
                 }
                  if (recordError) {
                    return <Card title="Bản vẽ phác thảo & Hình ảnh gốc" style={{ marginBottom: '24px' }}><Alert message="Lỗi tải bản phác thảo" description={recordError.toString()} type="error" showIcon /></Card>;
                  }
                 if (sketchRecords && sketchRecords.length > 0) {
                    const maxPhase = Math.max(...sketchRecords.map(r => r.phase), 0);
                    const phasesToShow = Array.from({ length: maxPhase + 1 }, (_, i) => i);

                    return (
                       <Card
                          title={
                             <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PictureOutlined /> Bản vẽ phác thảo & Hình ảnh gốc
                             </span>
                          }
                          style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}
                          loading={recordLoading}
                       >
                          {phasesToShow.map(phase => {
                              const phaseRecords = sketchRecords.filter(record => record.phase === phase);
                              if (phaseRecords.length === 0) return null;

                              const phaseTitle = phase === 0
                                ? "Hình ảnh khách hàng cung cấp (Ban đầu)"
                                : `Bản phác thảo lần ${phase}`;

                              const isAnySelectedInPhase = phaseRecords.some(record => record.isSelected);
                              const canSelect = phase > 0 && !sketchRecords.some(r => r.isSelected);

                              return (
                                <div key={phase} style={{ marginBottom: '24px' }}> { /* Margin between phases */}
                                  <Title level={5} style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                                    {phaseTitle}
                                    {isAnySelectedInPhase && <Tag color="green" style={{ marginLeft: 8 }}>Đã chọn</Tag>}
                                  </Title>
                                  {/* Loop through records within the phase */}
                                  {phaseRecords.map(record => (
                                     <div key={record.id} style={{ marginBottom: '16px' }}> { /* Margin between records in same phase */}
                                        <Card 
                                           hoverable 
                                           bodyStyle={{ padding: '12px' }} 
                                           style={{ border: record.isSelected ? '2px solid #52c41a' : '1px solid #f0f0f0', borderRadius: '8px' }}
                                        >
                                           <Image.PreviewGroup>
                                              <Row gutter={[12, 12]}> { /* Inner grid for images */}
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
                                         {/* Selection button - Place AFTER the image card */} 
                                         {canSelect && (
                                           <Popconfirm
                                             title="Xác nhận chọn bản phác thảo này?"
                                             onConfirm={() => handleConfirmSketch(record.id)}
                                             okText="Xác nhận"
                                             cancelText="Hủy"
                                             disabled={recordLoading} 
                                           >
                                             <Button
                                               type="primary"
                                               icon={<CheckCircleOutlined />}
                                               style={{ marginTop: '10px', width: '100%' }} 
                                               loading={recordLoading} 
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
                          {phasesToShow.every(p => sketchRecords.filter(r => r.phase === p).length === 0) && (
                             <Empty description="Không tìm thấy bản phác thảo phù hợp." />
                          )}
                       </Card>
                    );
                 } else {
                    return (
                       <Card title="Bản vẽ phác thảo & Hình ảnh gốc" style={{ marginBottom: '24px' }}>
                          <Empty description="Chưa có bản phác thảo nào được tải lên." />
                       </Card>
                    );
                 }
              }
              // --- Case 3: Fallback to order.image (Layout seems OK here already) ---
              else if (order?.image && (order.image.imageUrl || order.image.image2 || order.image.image3)) {
                 return (
                    <Card
                       title={
                          <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <PictureOutlined /> Hình ảnh khách hàng cung cấp
                          </span>
                       }
                       style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}
                    >
                       <Image.PreviewGroup>
                          <Row gutter={[16, 16]}> { /* Existing good layout */}
                              {order.image.imageUrl && (
                                <Col xs={24} sm={12} md={8}>
                                  <Image src={order.image.imageUrl} alt="Hình ảnh 1" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                                </Col>
                              )}
                              {order.image.image2 && (
                                <Col xs={24} sm={12} md={8}>
                                  <Image src={order.image.image2} alt="Hình ảnh 2" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                                </Col>
                              )}
                              {order.image.image3 && (
                                <Col xs={24} sm={12} md={8}>
                                  <Image src={order.image.image3} alt="Hình ảnh 3" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}/>
                                </Col>
                              )}
                           </Row>
                        </Image.PreviewGroup>
                    </Card>
                 );
              }
              // --- Final Fallback: No Images Available ---
              else {
                 return (
                    <Card title="Hình ảnh" style={{ marginBottom: '24px' }}>
                       <Empty description="Không có hình ảnh nào được cung cấp cho đơn hàng này." />
                    </Card>
                 );
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
              <Timeline>
                <Timeline.Item color="green">
                  <p style={{ fontSize: '15px', marginBottom: '4px' }}>Đơn hàng được tạo</p>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {order?.creationDate ? format(new Date(order.creationDate), "dd/MM/yyyy HH:mm") : '...'}
                  </Text>
                </Timeline.Item>
                {order?.status && (
                  <Timeline.Item color={getStatusColor(order.status)}>
                    <p style={{ fontSize: '15px', marginBottom: '4px', color: '#4caf50', fontWeight: '600' }}>
                      {getStatusText(order.status)}
                    </p>
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>

          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default ServiceOrderDetail; 