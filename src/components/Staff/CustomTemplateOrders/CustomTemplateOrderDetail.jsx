import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Descriptions, Steps, Button, Table, 
  Tag, Space, Modal, Form, Input, Select, message, 
  Divider, Timeline, Badge, Statistic, Empty, Tooltip
} from 'antd';
import {
  UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined,
  DollarOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ArrowLeftOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { customTemplateOrders } from '../mockData/customTemplateOrders';
import { orderStatuses, customizableMaterials } from '../mockData/templateOrders';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import ConsultingSection from './sections/ConsultingSection';
import DesignSection from './sections/DesignSection';
import MaterialSection from './sections/MaterialSection';
import DepositSection from './sections/DepositSection';
import DeliverySection from './sections/DeliverySection';
import './CustomTemplateOrderDetail.scss';

const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const CustomTemplateOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] = useState(false);
  const [isUpdateMaterialModalVisible, setIsUpdateMaterialModalVisible] = useState(false);
  const [isUpdatePaymentModalVisible, setIsUpdatePaymentModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  const orderSteps = [
    {
      title: 'Tiếp nhận',
      description: 'Xem xét và tiếp nhận đơn',
      status: ['pending']
    },
    {
      title: 'Tư vấn',
      description: 'Designer tư vấn cho khách hàng',
      status: ['processing', 'consulting']
    },
    {
      title: 'Thiết kế',
      description: 'Thực hiện thiết kế và chỉnh sửa',
      status: ['designing', 'design_review']
    },
    {
      title: 'Đặt cọc & Vật liệu',
      description: 'Xác nhận đặt cọc và chọn vật liệu',
      status: ['waiting_deposit', 'material_selecting', 'material_ordered']
    },
    {
      title: 'Hoàn thành',
      description: 'Giao vật liệu và thanh toán',
      status: ['delivering', 'completed']
    }
  ];

  useEffect(() => {
    // Fetch order data
    const orderData = customTemplateOrders.find(o => o.id === id);
    if (orderData) {
      setOrder(orderData);
    }
  }, [id]);

  useEffect(() => {
    const currentStatus = order?.status;
    const stepIndex = orderSteps.findIndex(step => 
      step.status.includes(currentStatus)
    );
    setCurrentStep(stepIndex !== -1 ? stepIndex : 0);
  }, [order?.status]);

  const handleUpdateStatus = async (updatedOrder) => {
    setLoading(true);
    try {
      // TODO: Call API to update order
      setOrder(updatedOrder);
      return true;
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật đơn hàng');
      return false;
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <Card>
        <Empty description="Không tìm thấy thông tin đơn hàng" />
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </Card>
    );
  }

  // Tính toán chi phí vật liệu
  const calculateMaterialCosts = () => {
    if (!order.selectedMaterials || order.selectedMaterials.length === 0) {
      return {
        originalTotal: 0,
        selectedTotal: 0,
        difference: 0
      };
    }

    const originalTotal = order.selectedMaterials.reduce((total, material) => {
      return total + (material.originalPrice || 0) * (material.quantity || 0);
    }, 0);

    const selectedTotal = order.selectedMaterials.reduce((total, material) => {
      return total + (material.selectedPrice || 0) * (material.quantity || 0);
    }, 0);

    return {
      originalTotal,
      selectedTotal,
      difference: selectedTotal - originalTotal
    };
  };

  const renderSection = () => {
    switch (order.status) {
      case 'pending':
        return null; // Show default order info
      case 'processing':
      case 'consulting':
        return <ConsultingSection order={order} onUpdateStatus={handleUpdateStatus} />;
      case 'designing':
      case 'design_review':
        return <DesignSection order={order} onUpdateStatus={handleUpdateStatus} />;
      // case 'waiting_deposit':
      //   return <DepositSection order={order} onUpdateStatus={handleUpdateStatus} />;
      case 'material_selecting':
      case 'material_ordered':
        return <MaterialSection order={order} onUpdateStatus={handleUpdateStatus} />;
      case 'delivering':
      // case 'completed':
      //   return <DeliverySection order={order} onUpdateStatus={handleUpdateStatus} />;
      default:
        return null;
    }
  };

  return (
    <div className="custom-template-order-detail">
      <Card>
        <div className="header-actions">
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
            >
              Quay lại
            </Button>
          </Space>
        </div>

        {/* Order basic info */}
        <Row gutter={[16, 16]}>
          {/* Customer Info */}
          <Col span={24}>
            <Card title="Thông tin khách hàng" bordered={false}>
              <Descriptions column={{ xs: 1, sm: 2, md: 3 }} layout="horizontal" bordered>
                <Descriptions.Item label={<><UserOutlined /> Họ tên</>}>
                  {order.customerInfo?.name}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                  {order.customerInfo?.phone}
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                  {order.customerInfo?.email}
                </Descriptions.Item>
                <Descriptions.Item label={<><HomeOutlined /> Địa chỉ</>}>
                  {order.customerInfo?.address}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Order Progress */}
          <Col span={24}>
            <Card title="Tiến độ đơn hàng" bordered={false}>
              <Steps current={currentStep}>
                {orderSteps.map((step, index) => (
                  <Step
                    key={index}
                    title={step.title}
                    description={step.description}
                  />
                ))}
              </Steps>
            </Card>
          </Col>

          {/* Yêu cầu thiết kế */}
          <Col span={24}>
            <Card title="Yêu cầu thiết kế" bordered={false}>
              <p>{order.requirements || 'Không có yêu cầu cụ thể'}</p>
              {order.attachments && order.attachments.length > 0 && (
                <div className="attachments">
                  <h4>Tài liệu đính kèm:</h4>
                  <ul>
                    {order.attachments.map((file, index) => (
                      <li key={index}>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          {file.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </Col>

          {/* Chi phí và thanh toán */}
          <Col span={24}>
            <Card title="Chi phí và thanh toán" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Statistic
                    title="Phí thiết kế"
                    value={order.prices?.designFee || 0}
                    suffix="đ"
                    groupSeparator=","
                  />
                </Col>
                <Col xs={24} md={12}>
                  <Statistic
                    title="Tổng chi phí vật liệu"
                    value={order.prices?.totalMaterialCost || 0}
                    suffix="đ"
                    groupSeparator=","
                  />
                </Col>
                <Col xs={24}>
                  <Statistic
                    title="Tổng chi phí"
                    value={order.prices?.totalCost || 0}
                    suffix="đ"
                    groupSeparator=","
                    valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Timeline */}
          {/* <Col span={24}>
            <Card title="Lịch sử đơn hàng">
              {order.timeline && order.timeline.length > 0 ? (
                <Timeline
                  items={order.timeline.map(item => ({
                    children: (
                      <>
                        <div>{dayjs(item.date).format('DD/MM/YYYY HH:mm')}</div>
                        <div>{item.description}</div>
                      </>
                    )
                  }))}
                />
              ) : (
                <Empty description="Chưa có lịch sử" />
              )}
            </Card>
          </Col> */}
        </Row>

        {/* Dynamic section based on order status */}
        {renderSection()}
      </Card>
    </div>
  );
};

export default CustomTemplateOrderDetail; 