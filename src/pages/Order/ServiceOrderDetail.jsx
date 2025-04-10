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
  CheckCircleOutlined
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
    isLoading: recordLoading 
  } = useRecordStore();
  const [order, setOrder] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [fetchingProducts, setFetchingProducts] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLocalError(null);
        const data = await getServiceOrderById(id);
        setOrder(data);

        if (data && data.serviceOrderDetails && data.serviceOrderDetails.length > 0) {
          setFetchingProducts(true);
          const productPromises = data.serviceOrderDetails.map(detail =>
            getProductById(detail.productId)
          );
          const productResults = await Promise.all(productPromises);
          const detailsMap = {};
          productResults.forEach((product, index) => {
            if (product) {
              detailsMap[data.serviceOrderDetails[index].productId] = product;
            }
          });
          setProductDetailsMap(detailsMap);
          setFetchingProducts(false);
        }
      } catch (error) {
        console.error("Error fetching order or product details:", error);
        setLocalError(error.message || "Không thể tải thông tin đơn hàng hoặc sản phẩm");
        setFetchingProducts(false);
      }
    };

    if (id) {
      fetchOrderDetail();
    }

    // Fetch sketch records nếu đơn hàng ở trạng thái ConsultingAndSketching
    if (selectedOrder && selectedOrder.status === 'ConsultingAndSketching') {
      getRecordSketch(id);
    }
  }, [id, getServiceOrderById, getProductById, selectedOrder?.status, getRecordSketch]);

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

  if (loading) {
    return (
      <Spin
        size="large"
        className="flex justify-center items-center min-h-[400px]"
      />
    );
  }

  console.log(selectedOrder);

  const displayError = localError || error;

  if (!selectedOrder) {
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
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/history-booking-services")}
            >
              Quay lại
            </Button>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <Header />
        <Content>
          <div className="container mx-auto px-4 py-8" style={{ marginTop: "200px" }}>
            <Alert
              type="warning"
              message="Không tìm thấy thông tin đơn hàng"
              className="mb-4"
            />
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/history-booking-services")}
            >
              Quay lại
            </Button>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

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
              <Tag color={getStatusColor(selectedOrder.status)} size="large">
                {getStatusText(selectedOrder.status)}
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
                      {order.userName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {order.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      {order.cusPhone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">
                      {order.address.replace(/\|/g, ', ')}
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
                      {order.length}m x {order.width}m
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại dịch vụ">
                      <Tag color={order.serviceType === "NoDesignIdea" ? "blue" : "green"}>
                        {order.serviceType === "NoDesignIdea"
                          ? "Dịch vụ tư vấn & thiết kế"
                          : order.serviceType}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng chi phí">
                      {order.totalCost === 0 ? (
                        <Tag color="gold">Chưa xác định giá thiết kế</Tag>
                      ) : (
                        <span style={{ color: '#4caf50' }}>{`${order.totalCost.toLocaleString("vi-VN")} VNĐ`}</span>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      {format(new Date(order.creationDate), "dd/MM/yyyy HH:mm")}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {/* Hiển thị ảnh phác thảo hoặc ảnh gốc */}
            {(selectedOrder.status === 'ConsultingAndSketching' && sketchRecords.length > 0) ? (
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
                    Bản vẽ phác thảo
                  </span>
                }
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  marginBottom: '24px'
                }}
                loading={recordLoading} // Loading khi fetch record
              >
                {/* Nhóm bản ghi theo phase */} 
                {[0, 1, 2].map(phase => {
                  const phaseRecords = sketchRecords.filter(record => record.phase === phase);
                  if (phaseRecords.length === 0) return null;

                  const phaseTitle = phase === 0 
                    ? "Ảnh khách hàng cung cấp" 
                    : `Bản phác thảo lần ${phase}`;
                  
                  const isSelectedPhase = phaseRecords.some(record => record.isSelected);

                  return (
                    <div key={phase} style={{ marginBottom: '20px' }}>
                      <Title level={5} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                        {phaseTitle}
                        {isSelectedPhase && <Tag color="green" style={{ marginLeft: 8 }}>Đã chọn</Tag>}
                      </Title>
                      <Row gutter={[16, 16]}>
                        {phaseRecords.map(record => (
                          <Col xs={24} sm={8} key={record.id}>
                            <Card 
                              hoverable 
                              // Thêm style border nếu được chọn
                              style={record.isSelected ? { border: '2px solid #52c41a' } : {}}
                              bodyStyle={{ padding: 0 }} // Bỏ padding mặc định của Card body
                            >
                              <Image
                                src={record.image?.imageUrl || '/placeholder.png'}
                                alt={`Ảnh ${phaseTitle} 1`}
                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                              />
                              {record.image?.image2 && (
                                <Image
                                  src={record.image.image2}
                                  alt={`Ảnh ${phaseTitle} 2`}
                                  style={{ width: '100%', height: '200px', objectFit: 'cover', marginTop: '8px' }}
                                />
                              )}
                              {record.image?.image3 && (
                                <Image
                                  src={record.image.image3}
                                  alt={`Ảnh ${phaseTitle} 3`}
                                  style={{ width: '100%', height: '200px', objectFit: 'cover', marginTop: '8px' }}
                                />
                              )}
                            </Card>
                             {/* Nút chọn chỉ hiển thị cho phase 1 và 2 và khi chưa có bản nào được chọn */} 
                            {phase > 0 && !sketchRecords.some(r => r.isSelected) && (
                              <Popconfirm
                                title="Xác nhận chọn bản phác thảo này?"
                                onConfirm={() => handleConfirmSketch(record.id)}
                                okText="Xác nhận"
                                cancelText="Hủy"
                              >
                                <Button 
                                  type="primary" 
                                  icon={<CheckCircleOutlined />} 
                                  style={{ marginTop: '10px', width: '100%' }}
                                >
                                  Chọn bản này
                                </Button>
                              </Popconfirm>
                            )}
                          </Col>
                        ))}
                      </Row>
                    </div>
                  );
                })}
                {/* Hiển thị nếu không có bản ghi nào */} 
                {sketchRecords.length === 0 && !recordLoading && (
                  <Empty description="Chưa có bản phác thảo nào được tải lên." />
                )}
              </Card>
            ) : (
              // Hiển thị ảnh gốc nếu không phải trạng thái ConsultingAndSketching hoặc không có sketchRecords
              order.image && (
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
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    marginBottom: '24px'
                  }}
                >
                  <Row gutter={[16, 16]}>
                    {order.image.imageUrl && (
                      <Col xs={24} sm={8}>
                        <Image
                          src={order.image.imageUrl}
                          alt="Hình ảnh 1"
                          className="rounded-lg"
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                      </Col>
                    )}
                    {order.image.image2 && (
                      <Col xs={24} sm={8}>
                        <Image
                          src={order.image.image2}
                          alt="Hình ảnh 2"
                          className="rounded-lg"
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                      </Col>
                    )}
                    {order.image.image3 && (
                      <Col xs={24} sm={8}>
                        <Image
                          src={order.image.image3}
                          alt="Hình ảnh 3"
                          className="rounded-lg"
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                      </Col>
                    )}
                     {/* Hiển thị nếu object image tồn tại nhưng không có url nào */} 
                    {!order.image.imageUrl && !order.image.image2 && !order.image.image3 && (
                      <Col span={24}>
                         <Empty description="Khách hàng không cung cấp hình ảnh." />
                      </Col>
                    )}
                  </Row>
                </Card>
              )
            )}

            {order.description && (
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

            {/* Bảng sản phẩm đã chọn */}
            {selectedOrder.serviceOrderDetails && selectedOrder.serviceOrderDetails.length > 0 && (
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
                loading={fetchingProducts} // Thêm trạng thái loading cho Card
              >
                <Table
                  columns={productColumns}
                  dataSource={selectedOrder.serviceOrderDetails}
                  pagination={false}
                  rowKey={(record, index) => `${record.productId}-${index}`} // Key duy nhất cho mỗi dòng
                  summary={() => {
                    let totalMaterialCost = 0;
                    selectedOrder.serviceOrderDetails.forEach(detail => {
                      const product = productDetailsMap[detail.productId];
                      if (product && typeof product.price === 'number' && typeof detail.quantity === 'number') {
                        totalMaterialCost += product.price * detail.quantity;
                      }
                    });
                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3} align="right">
                          <Text strong>Tổng tiền vật liệu:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <Text strong style={{ color: '#cf1322' }}>{formatPrice(totalMaterialCost)}</Text>
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
                    {format(new Date(order.creationDate), "dd/MM/yyyy HH:mm")}
                  </Text>
                </Timeline.Item>
                <Timeline.Item color={getStatusColor(order.status)}>
                  <p style={{ fontSize: '15px', marginBottom: '4px', color: '#4caf50', fontWeight: '600' }}>
                    {getStatusText(order.status)}
                  </p>
                </Timeline.Item>
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