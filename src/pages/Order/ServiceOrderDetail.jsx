import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useServiceOrderStore from "@/stores/useServiceOrderStore";
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
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const ServiceOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, loading, error, getServiceOrderById } = useServiceOrderStore();
  const [order, setOrder] = useState(null);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLocalError(null);
        const data = await getServiceOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setLocalError(error.message || "Không thể tải thông tin đơn hàng");
      }
    };

    if (id) {
      fetchOrderDetail();
    }
  }, [id, getServiceOrderById]);

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

  if (loading) {
    return (
      <Spin
        size="large"
        className="flex justify-center items-center min-h-[400px]"
      />
    );
  }

  console.log(selectedOrder);

  // Use local error state if available, otherwise use store error
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
                      {order.serviceType === "NoDesignIdea"
                        ? "Không có mẫu thiết kế"
                        : order.serviceType}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng chi phí">
                      {order.totalCost.toLocaleString("vi-VN")} VNĐ
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      {format(new Date(order.creationDate), "dd/MM/yyyy HH:mm")}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

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

            {order.image && (
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
                    Hình ảnh
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
                </Row>
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
                  <p style={{ fontSize: '15px', marginBottom: '4px' }}>
                    Trạng thái hiện tại: {getStatusText(order.status)}
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