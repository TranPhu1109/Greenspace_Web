import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Spin,
  Card,
  Typography,
  Descriptions,
  Tag,
  Button,
  Space,
  Modal,
  Timeline,
  Tabs,
  Row,
  Col,
  Table,
  Avatar,
  Divider,
  Badge,
  Image,
  Alert,
  Statistic,
  Empty,
  message,
  List,
  notification
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  FileDoneOutlined,
  DollarOutlined,
  ShoppingOutlined,
  PictureOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  CopyOutlined,
  ToolOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import api from '@/api/api';
import dayjs from 'dayjs';
import useProductStore from '@/stores/useProductStore';
import useDesignIdeaStore from '@/stores/useDesignIdeaStore';
import './ContractorTasks.scss';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ContractorTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { products, fetchProducts, getProductById } = useProductStore();
  const { fetchDesignIdeaById } = useDesignIdeaStore();
  const [designIdea, setDesignIdea] = useState(null);
  const [loadingDesignIdea, setLoadingDesignIdea] = useState(false);
  const pdfViewerRef = useRef(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  useEffect(() => {
    // Fetch design idea if order is UsingDesignIdea and has designIdeaId
    if (order && order.serviceType === "UsingDesignIdea" && order.designIdeaId) {
      fetchDesignIdeaDetails(order.designIdeaId);
    }
  }, [order]);

  const fetchDesignIdeaDetails = async (designIdeaId) => {
    try {
      setLoadingDesignIdea(true);
      const designData = await fetchDesignIdeaById(designIdeaId);
      setDesignIdea(designData);
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải thông tin mẫu thiết kế',
        icon: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
        placement: 'topRight',
      });
    } finally {
      setLoadingDesignIdea(false);
    }
  };

  const fetchTaskDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch task details
      const taskResponse = await api.get(`/api/worktask/${id}`);

      if (taskResponse.status === 200) {
        setTask(taskResponse.data);

        // Fetch full order details
        if (taskResponse.data.serviceOrderId) {
          const orderResponse = await api.get(`/api/serviceorder/${taskResponse.data.serviceOrderId}`);

          if (orderResponse.status === 200) {
            const orderData = orderResponse.data;

            // Fetch product details for each item in serviceOrderDetails
            if (orderData.serviceOrderDetails && orderData.serviceOrderDetails.length > 0) {
              await fetchProducts(); // Ensure products are loaded in the store
              const detailedProducts = await Promise.all(
                orderData.serviceOrderDetails.map(async (detail) => {
                  const product = await getProductById(detail.productId);
                  return {
                    ...detail,
                    productName: product ? product.name : 'Không tìm thấy tên',
                    productImage: product && product.image ? product.image.imageUrl : null,
                  };
                })
              );
              orderData.serviceOrderDetails = detailedProducts;
            }
            setOrder(orderData);
          }
        }
      } else {
        setError('Không thể tải thông tin công việc');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải thông tin chi tiết công việc');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskStatus, orderStatus) => {
    try {
      setLoading(true);
      
      // Update task status
      const taskResponse = await api.put(`/api/worktask/${id}`, {
        serviceOrderId: task.serviceOrderId,
        userId: task.userId,
        dateAppointment: task.dateAppointment,
        timeAppointment: task.timeAppointment,
        status: taskStatus,
        note: task.note
      });

      // Update order status
      if (task.serviceOrderId) {
        const orderResponse = await api.put(`/api/serviceorder/status/${task.serviceOrderId}`, {
          status: orderStatus,
          reportManger: "",
          reportAccoutant: ""
        });

        if (orderResponse.status !== 200) {
          throw new Error('Không thể cập nhật trạng thái đơn hàng');
        }
      }

      if (taskResponse.status === 200) {
        notification.success({
          message: 'Thành công',
          description: 'Cập nhật trạng thái thành công',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          placement: 'topRight',
        });
        // Refresh task data
        await fetchTaskDetails();
      } else {
        setError('Không thể cập nhật trạng thái công việc');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi cập nhật trạng thái công việc');
      notification.error({
        message: 'Lỗi',
        description: 'Cập nhật trạng thái thất bại: ' + err.message,
        icon: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const isCurrentTimeMatchTaskTime = (task) => {
    if (!task.dateAppointment || !task.timeAppointment) return false;
  
    const taskDateTime = dayjs(`${task.dateAppointment} ${task.timeAppointment}`);
    const now = dayjs();
  
    return now.isBefore(taskDateTime.add(30, 'minute'));
  };  

  const handleStartInstallation = () => {
    if (!task) {
      notification.error({
        message: 'Lỗi',
        description: 'Không tìm thấy công việc',
        placement: 'topRight',
      });
      return;
    }
    if (!isCurrentTimeMatchTaskTime(task)) {
      notification.warning({
        message: 'Chưa đến thời gian lắp đặt',
        description: `Chỉ được phép bắt đầu lắp đặt từ ${dayjs(`${task.dateAppointment} ${task.timeAppointment}`).format('HH:mm')} ngày ${dayjs(task.dateAppointment).format('DD/MM/YYYY')}`,
        placement: 'topRight',
        duration: 5
      });
      return;
    }

    Modal.confirm({
      title: 'Xác nhận bắt đầu lắp đặt',
      content: 'Bạn đã đến nơi và sẵn sàng bắt đầu lắp đặt cho khách hàng?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => updateTaskStatus(8, 27) // 8 = Installing for task, 27 = Installing for order
    });
  };

  const handleCancelInstallation = () => {
    Modal.confirm({
      title: 'Xác nhận hủy lắp đặt',
      content: 'Bạn có chắc chắn muốn hủy lắp đặt?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => updateTaskStatus(11, 10) // 11 = ReInstall for task, 10 = ReInstall for order
    });
  };

  const handleCompleteInstallation = () => {
    Modal.confirm({
      title: 'Xác nhận hoàn thành lắp đặt',
      content: 'Bạn đã hoàn thành việc lắp đặt cho khách hàng?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => updateTaskStatus(9, 28) // 9 = DoneInstalling for task, 28 = DoneInstalling for order
    });
  };

  const getStatusColor = (status) => {
    if (status === 8 || status === 'Installing') return 'blue';
    if (status === 9 || status === 'DoneInstalling') return 'green';
    
    switch (status) {
      case 'Pending':
        return 'orange';
      case 'Installing':
        return 'blue';
      case 'DoneInstalling':
        return 'green';
      case 'ReInstall':
        return 'red';
      case 'Completed':
        return 'green';
      case 'cancel':
        return 'red';
      case 'DeliveryFail':
        return 'red';
      case 'ReDelivery':
        return 'blue';
      default:
        return 'blue';
    }
  };

  const getStatusText = (status) => {
    if (status === 8 || status === 'Installing') return 'Đang lắp đặt';
    if (status === 9 || status === 'DoneInstalling') return 'Đã lắp đặt xong';
    
    switch (status) {
      case 'Pending':
        return 'Đang chờ';
      case 'Installing':
        return 'Đang lắp đặt';
      case 'DoneInstalling':
        return 'Đã lắp đặt xong';
      case 'ReInstall':
        return 'Yêu cầu lắp đặt lại';
      case 'Completed':
        return 'Đã hoàn thành';
      case 'cancel':
        return 'Giao hàng thất bại';
      case 'DeliveryFail':
        return 'Giao hàng thất bại';
      case 'ReDelivery':
        return 'Giao hàng lại';
      default:
        return status;
    }
  };

  const formatAddress = (address) => {
    return address ? address.replace(/\|/g, ', ') : 'Không có thông tin';
  };

  // Function to determine if a URL is a PDF
  const isPDF = (url) => {
    return url && url.toLowerCase().endsWith('.pdf');
  };

  // Function to determine if a URL is a video
  const isVideo = (url) => {
    return url && /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  // Check if design guides exist
  const hasDesignGuides = () => {
    return order?.serviceType === "UsingDesignIdea" && 
           designIdea && 
           (designIdea.designImage1URL || designIdea.designImage2URL || designIdea.designImage3URL);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text>Đang tải dữ liệu chi tiết công việc...</Text>
      </div>
    );
  }

  if (!task) {
    return (
      <Alert
        message="Không tìm thấy thông tin"
        description="Không tìm thấy thông tin công việc được yêu cầu"
        type="warning"
        showIcon
        action={
          <Button type="primary" onClick={() => navigate('/contructor/tasks')}>
            Quay lại danh sách
          </Button>
        }
      />
    );
  }

  return (
    <div className="contractor-task-detail-container">
      <div className="back-navigation">
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/contructor/tasks')}
        >
          Quay lại danh sách công việc
        </Button>
      </div>

      <Card className="task-detail-header-card">
        <Row gutter={16}>
          <Col span={24}>
            <div className="task-header">
              <div>
                <Title level={3}>Chi tiết công việc <Text copyable={{ text: task.id }} style={{ fontWeight: 'normal', fontSize: '16px' }}>#{task.id.substring(0, 8)}</Text></Title>
                <Tag color={getStatusColor(task.status)} className="status-tag" title="Trạng thái công việc">
                  {getStatusText(task.status)}
                </Tag>
              </div>
              {(task.status === 'Pending' || task.status === 'ReInstall') && (
                <Space>
                  <Button
                    type="primary"
                    icon={<ToolOutlined />}
                    onClick={handleStartInstallation}
                    style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                  >
                    {task.status === 'ReInstall' ? 'Bắt đầu lắp đặt lại' : 'Bắt đầu lắp đặt'}
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<PhoneOutlined />}
                    onClick={handleCancelInstallation}
                    // style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                  >
                    Không liên hệ được KH
                  </Button>
                </Space>
              )}
              {(task.status === 8 || task.status === 'Installing') && (
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={handleCompleteInstallation}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Xác nhận hoàn thành lắp đặt
                  </Button>
                </Space>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      <Tabs defaultActiveKey="overview" className="task-detail-tabs">
        <TabPane tab="Tổng quan" key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Thông tin công việc" className="task-info-card">
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                  <Descriptions.Item label="Mã đơn hàng">
                    <Text copyable={{ text: task.serviceOrderId, icon: <CopyOutlined /> }} strong>#{task.serviceOrderId}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái đơn hàng">
                    <Tag color={getStatusColor(task.serviceOrder.status)}>
                      {getStatusText(task.serviceOrder.status)}  
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày giao hàng và lắp đặt">
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    {task.dateAppointment ? dayjs(task.dateAppointment).format('DD/MM/YYYY') : 'Chưa có lịch'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giờ giao hàng và lắp đặt">
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    {task.timeAppointment || 'Chưa có lịch'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo" span={2}>
                    {task.creationDate ? dayjs(task.creationDate).format('DD/MM/YYYY - HH:mm:ss') : 'Không có thông tin'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {task.note || 'Không có ghi chú'}
                  </Descriptions.Item>
                  {order?.serviceType === "UsingDesignIdea" && (
                    <Descriptions.Item label="Loại dịch vụ" span={2}>
                      <Tag color="green">Sử dụng mẫu thiết kế có sẵn</Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              <Card title="Danh sách sản phẩm" className="products-card">
                {order && order.serviceOrderDetails && order.serviceOrderDetails.length > 0 ? (
                  <Table
                    dataSource={order.serviceOrderDetails}
                    rowKey="productId"
                    pagination={false}
                    columns={[
                      {
                        title: 'Sản phẩm',
                        key: 'productInfo',
                        render: (_, record) => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {record.productImage ? (
                              <Image
                                src={record.productImage}
                                alt={record.productName}
                                width={50}
                                height={50}
                                style={{ objectFit: 'cover', borderRadius: 4 }}
                              />
                            ) : (
                              <Avatar icon={<UserOutlined />} />
                            )}
                            <span style={{ fontWeight: 500 }}>{record.productName}</span>
                          </div>
                        ),
                      },
                      {
                        title: 'Số lượng',
                        dataIndex: 'quantity',
                        key: 'quantity',
                      },
                      {
                        title: 'Hướng dẫn',
                        key: 'designGuide',
                        width: 120,
                        render: (_, record) => {
                          const product = products.find(p => p.id === record.productId);
                          return product?.designImage1URL ? (
                            <Button
                              type="primary"
                              size="small"
                              icon={<FilePdfOutlined />}
                              onClick={() => {
                                if (isPDF(product.designImage1URL)) {
                                  Modal.info({
                                    title: `Hướng dẫn sử dụng ${product.name}`,
                                    width: '80%',
                                    content: (
                                      <div style={{ height: '80vh', width: '100%' }}>
                                        <iframe
                                          src={`${product.designImage1URL}#toolbar=1&navpanes=1&scrollbar=1`}
                                          width="100%"
                                          height="100%"
                                          style={{ border: 'none' }}
                                          title="PDF Viewer"
                                        />
                                      </div>
                                    ),
                                    okText: 'Đóng',
                                    onOk() {},
                                  });
                                } else {
                                  window.open(product.designImage1URL, '_blank');
                                }
                              }}
                            >
                              {isPDF(product?.designImage1URL) ? 'Xem PDF' : 'Xem hướng dẫn'}
                            </Button>
                          ) : null
                        }
                      },
                    ]}
                  />
                ) : (
                  <Empty description="Không có sản phẩm" />
                )}
              </Card>

              {order && order.externalProducts && order.externalProducts.length > 0 && (
                <Card title="Sản phẩm bổ sung" className="external-products-card">
                  <Table
                    dataSource={order.externalProducts}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      {
                        title: 'Sản phẩm',
                        key: 'product',
                        render: (_, record) => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Image
                              src={record.imageURL}
                              alt="Sản phẩm"
                              width={60}
                              height={60}
                              style={{ objectFit: 'cover', borderRadius: 4 }}
                              fallback="https://via.placeholder.com/60?text=No+Image"
                            />
                            <span style={{ fontWeight: 500 }}>{record.name}</span>
                          </div>
                        ),
                      },
                      {
                        title: 'Số lượng',
                        dataIndex: 'quantity',
                        key: 'quantity',
                      },
                    ]}
                  />
                </Card>
              )}
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Thông tin khách hàng" className="customer-card">
                <div className="customer-header">
                  <Avatar size={64} icon={<UserOutlined />} />
                  <div className="customer-name">
                    <Text strong>{order?.userName || 'Không có thông tin'}</Text>
                  </div>
                </div>
                <Descriptions column={1} className="customer-descriptions">
                  <Descriptions.Item label={<span><PhoneOutlined /> Số điện thoại</span>}>
                    {order?.cusPhone || 'Không có thông tin'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<span><MailOutlined /> Email</span>}>
                    {order?.email || 'Không có thông tin'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<span><HomeOutlined /> Địa chỉ</span>}>
                    {formatAddress(order?.address)}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />
              </Card>

              <Card title="Hình ảnh đơn hàng" className="order-images-card">
                {loadingDesignIdea ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin />
                    <div style={{ marginTop: '10px' }}>Đang tải thông tin thiết kế...</div>
                  </div>
                ) : (
                  order?.serviceType === "UsingDesignIdea" && designIdea?.image ? (
                    <div className="order-images">
                      {designIdea.image.imageUrl && (
                        <div className="image-item">
                          <Image
                            src={designIdea.image.imageUrl}
                            alt="Hình ảnh thiết kế"
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      {designIdea.image.image2 && (
                        <div className="image-item">
                          <Image
                            src={designIdea.image.image2}
                            alt="Hình ảnh thiết kế"
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      {designIdea.image.image3 && (
                        <div className="image-item">
                          <Image
                            src={designIdea.image.image3}
                            alt="Hình ảnh thiết kế"
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                    </div>
                  ) : order?.image ? (
                    <div className="order-images">
                      {order.image.imageUrl && (
                        <div className="image-item">
                          <Image
                            src={order.image.imageUrl}
                            alt="Hình ảnh sản phẩm"
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      {order.image.image2 && (
                        <div className="image-item">
                          <Image
                            src={order.image.image2}
                            alt="Hình ảnh sản phẩm"
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      {order.image.image3 && (
                        <div className="image-item">
                          <Image
                            src={order.image.image3}
                            alt="Hình ảnh sản phẩm"
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <Empty description="Không có hình ảnh" />
                  )
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Mô tả đơn hàng" key="description">
          <Card className="description-card">
            <Title level={4}>Mô tả chi tiết</Title>
            {order?.serviceType === "UsingDesignIdea" && designIdea ? (
              <>
                <div className="html-content" dangerouslySetInnerHTML={{ __html: designIdea.description || 'Không có mô tả' }} />
                <Divider />
                <Title level={5}>Thông tin thiết kế</Title>
                <Descriptions bordered>
                  <Descriptions.Item label="Tên thiết kế" span={3}>{designIdea.name}</Descriptions.Item>
                  <Descriptions.Item label="Danh mục" span={3}>{designIdea.categoryName}</Descriptions.Item>
                </Descriptions>
              </>
            ) : (
              <div className="html-content" dangerouslySetInnerHTML={{ __html: order?.description || 'Không có mô tả' }} />
            )}
          </Card>
        </TabPane>

        {/* Add the new design guides tab */}
        {hasDesignGuides() && (
          <TabPane tab="Tài liệu hướng dẫn thiết kế" key="design-guides">
            <Card className="design-guides-card">
              <Row gutter={[24, 24]}>
                {/* Design Guide Images */}
                {designIdea.designImage1URL && !isPDF(designIdea.designImage1URL) && !isVideo(designIdea.designImage1URL) && (
                  <Col xs={24} md={24} lg={designIdea.designImage2URL || designIdea.designImage3URL ? 12 : 24}>
                    <Card 
                      title={<><FileImageOutlined /> Hình ảnh hướng dẫn</>} 
                      className="guide-card"
                      extra={<Button type="link" href={designIdea.designImage1URL} target="_blank">Mở trong tab mới</Button>}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <Image
                          src={designIdea.designImage1URL}
                          alt="Hình ảnh hướng dẫn"
                          style={{ maxWidth: '100%', maxHeight: '500px' }}
                        />
                      </div>
                    </Card>
                  </Col>
                )}

                {/* PDF Documents */}
                {designIdea.designImage2URL && isPDF(designIdea.designImage2URL) && (
                  <Col xs={24} md={24} lg={designIdea.designImage1URL || designIdea.designImage3URL ? 12 : 24}>
                    <Card 
                      title={<><FilePdfOutlined /> Tài liệu PDF</>} 
                      className="guide-card"
                      extra={<Button type="link" href={designIdea.designImage2URL} target="_blank">Mở trong tab mới</Button>}
                    >
                      <div style={{ height: '600px', width: '100%' }}>
                        <iframe
                          src={`${designIdea.designImage2URL}#toolbar=1&navpanes=1&scrollbar=1`}
                          width="100%"
                          height="100%"
                          style={{ border: 'none' }}
                          title="PDF Viewer"
                          ref={pdfViewerRef}
                        />
                      </div>
                    </Card>
                  </Col>
                )}

                {/* Video Guides */}
                {designIdea.designImage3URL && isVideo(designIdea.designImage3URL) && (
                  <Col xs={24} md={24} lg={designIdea.designImage1URL || designIdea.designImage2URL ? 12 : 24}>
                    <Card 
                      title={<><PlayCircleOutlined /> Video hướng dẫn</>} 
                      className="guide-card"
                      extra={<Button type="link" href={designIdea.designImage3URL} target="_blank">Mở trong tab mới</Button>}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <video
                          controls
                          width="100%"
                          height="auto"
                          style={{ maxHeight: '500px' }}
                          preload="metadata"
                        >
                          <source src={designIdea.designImage3URL} />
                          Trình duyệt của bạn không hỗ trợ thẻ video.
                        </video>
                      </div>
                    </Card>
                  </Col>
                )}

                {/* Fallback for other file types */}
                {((designIdea.designImage1URL && (isPDF(designIdea.designImage1URL) || isVideo(designIdea.designImage1URL))) ||
                  (designIdea.designImage2URL && (!isPDF(designIdea.designImage2URL))) ||
                  (designIdea.designImage3URL && (!isVideo(designIdea.designImage3URL)))) && (
                  <Col xs={24}>
                    <Card title="Các tài liệu khác" className="guide-card">
                      <List
                        itemLayout="horizontal"
                        dataSource={[
                          {
                            key: 'designImage1URL',
                            url: designIdea.designImage1URL,
                            title: isPDF(designIdea.designImage1URL) ? 'Tài liệu PDF' : isVideo(designIdea.designImage1URL) ? 'Video hướng dẫn' : 'Hình ảnh hướng dẫn',
                            icon: isPDF(designIdea.designImage1URL) ? <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} /> :
                                  isVideo(designIdea.designImage1URL) ? <PlayCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} /> :
                                  <FileImageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                          },
                          {
                            key: 'designImage2URL',
                            url: designIdea.designImage2URL,
                            title: isPDF(designIdea.designImage2URL) ? 'Tài liệu PDF' : isVideo(designIdea.designImage2URL) ? 'Video hướng dẫn' : 'Hình ảnh hướng dẫn',
                            icon: isPDF(designIdea.designImage2URL) ? <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} /> :
                                  isVideo(designIdea.designImage2URL) ? <PlayCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} /> :
                                  <FileImageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                          },
                          {
                            key: 'designImage3URL',
                            url: designIdea.designImage3URL,
                            title: isPDF(designIdea.designImage3URL) ? 'Tài liệu PDF' : isVideo(designIdea.designImage3URL) ? 'Video hướng dẫn' : 'Hình ảnh hướng dẫn',
                            icon: isPDF(designIdea.designImage3URL) ? <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} /> :
                                  isVideo(designIdea.designImage3URL) ? <PlayCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} /> :
                                  <FileImageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                          }
                        ].filter(item => item.url && 
                          ((item.key === 'designImage1URL' && (isPDF(item.url) || isVideo(item.url))) ||
                           (item.key === 'designImage2URL' && !isPDF(item.url)) ||
                           (item.key === 'designImage3URL' && !isVideo(item.url)))
                        )}
                        renderItem={item => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={item.icon}
                              title={item.title}
                              description={
                                <Button 
                                  type="primary" 
                                  onClick={() => window.open(item.url, '_blank')}
                                  style={{ marginTop: '8px' }}
                                >
                                  {isPDF(item.url) ? 'Xem tài liệu PDF' : 
                                   isVideo(item.url) ? 'Xem video hướng dẫn' : 'Xem hình ảnh'}
                                </Button>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                )}

                {/* No design guides available */}
                {!designIdea.designImage1URL && !designIdea.designImage2URL && !designIdea.designImage3URL && (
                  <Col span={24}>
                    <Empty description="Không có tài liệu hướng dẫn" />
                  </Col>
                )}
              </Row>
            </Card>
          </TabPane>
        )}

        {order?.report && (
          <TabPane tab="Báo cáo đơn hàng" key="report">
            <Card className="report-card">
              <Title level={4}>Báo cáo</Title>
              <div className="html-content" dangerouslySetInnerHTML={{ __html: order.report }} />
            </Card>
          </TabPane>
        )}
      </Tabs>

      {/* Add CSS for design guides */}
      <style jsx>{`
        .design-guides-card {
          margin-bottom: 24px;
        }
        .guide-card {
          height: 100%;
        }
        .guide-card .ant-card-head {
          background-color: #f9f9f9;
        }
      `}</style>
    </div>
  );
};

export default ContractorTaskDetail;