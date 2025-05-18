import React, { useEffect, useState } from 'react';
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
  message
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
  ToolOutlined
} from '@ant-design/icons';
import api from '@/api/api';
import dayjs from 'dayjs';
import useProductStore from '@/stores/useProductStore';
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

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch task details
      const taskResponse = await api.get(`/api/worktask/${id}`);
      console.log('Task details:', taskResponse.data);

      if (taskResponse.status === 200) {
        setTask(taskResponse.data);

        // Fetch full order details
        if (taskResponse.data.serviceOrderId) {
          const orderResponse = await api.get(`/api/serviceorder/${taskResponse.data.serviceOrderId}`);
          console.log('Order details:', orderResponse.data);

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
      console.error('Error fetching task details:', err);
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
        message.success('Cập nhật trạng thái thành công');
        // Refresh task data
        await fetchTaskDetails();
      } else {
        setError('Không thể cập nhật trạng thái công việc');
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Đã xảy ra lỗi khi cập nhật trạng thái công việc');
      message.error('Cập nhật trạng thái thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInstallation = () => {
    Modal.confirm({
      title: 'Xác nhận bắt đầu lắp đặt',
      content: 'Bạn đã đến nơi và sẵn sàng bắt đầu lắp đặt cho khách hàng?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => updateTaskStatus(8, 27) // 8 = Installing for task, 27 = Installing for order
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
      default:
        return status;
    }
  };

  const formatAddress = (address) => {
    return address ? address.replace(/\|/g, ', ') : 'Không có thông tin';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text>Đang tải dữ liệu chi tiết công việc...</Text>
      </div>
    );
  }

  //   if (error) {
  //     return (
  //       <Alert
  //         message="Lỗi"
  //         description={error}
  //         type="error"
  //         showIcon
  //         action={
  //           <Button type="primary" onClick={() => navigate('/contructor/tasks')}>
  //             Quay lại danh sách
  //           </Button>
  //         }
  //       />
  //     );
  //   }

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
                    <Tag color={getStatusColor(task.status)}>
                      {getStatusText(task.status)}  
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
                      // {
                      //   title: 'Giá',
                      //   dataIndex: 'price',
                      //   key: 'price',
                      //   render: (price) => <span>{price.toLocaleString()} đ</span>,
                      // },
                      // {
                      //   title: 'Thành tiền',
                      //   dataIndex: 'totalPrice',
                      //   key: 'totalPrice',
                      //   render: (totalPrice) => <span>{totalPrice.toLocaleString()} đ</span>,
                      // },
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
                      // {
                      //   title: 'Giá',
                      //   dataIndex: 'price',
                      //   key: 'price',
                      //   render: (price) => <span>{price.toLocaleString()} đ</span>,
                      // },
                      // {
                      //   title: 'Thành tiền',
                      //   dataIndex: 'totalPrice',
                      //   key: 'totalPrice',
                      //   render: (totalPrice) => <span>{totalPrice.toLocaleString()} đ</span>,
                      // },
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
                  <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                    {order?.cusPhone || 'Không có thông tin'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><MailOutlined /> Email</>}>
                    {order?.email || 'Không có thông tin'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><HomeOutlined /> Địa chỉ</>}>
                    {formatAddress(order?.address)}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                {/* <Title level={5}>Thông tin đơn hàng</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Phí thiết kế"
                      value={order?.designPrice || 0}
                      prefix={<DollarOutlined />}
                      suffix="đ"
                      groupSeparator=","
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Phí vật liệu"
                      value={order?.materialPrice || 0}
                      prefix={<DollarOutlined />}
                      suffix="đ"
                      groupSeparator=","
                    />
                  </Col>
                  <Col span={24}>
                    <Statistic
                      title="Tổng giá trị đơn hàng"
                      value={order?.totalCost || 0}
                      prefix={<DollarOutlined />}
                      suffix="đ"
                      valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                      groupSeparator=","
                    />
                  </Col>
                </Row> */}
              </Card>

              <Card title="Hình ảnh đơn hàng" className="order-images-card">
                {order?.image ? (
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
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Mô tả đơn hàng" key="description">
          <Card className="description-card">
            <Title level={4}>Mô tả chi tiết</Title>
            <div className="html-content" dangerouslySetInnerHTML={{ __html: order?.description || 'Không có mô tả' }} />
          </Card>
        </TabPane>

        {order?.report && (
          <TabPane tab="Báo cáo đơn hàng" key="report">
            <Card className="report-card">
              <Title level={4}>Báo cáo</Title>
              <div className="html-content" dangerouslySetInnerHTML={{ __html: order.report }} />
            </Card>
          </TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default ContractorTaskDetail;