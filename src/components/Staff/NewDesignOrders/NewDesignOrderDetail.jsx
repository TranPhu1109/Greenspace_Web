import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Space, Descriptions, Tag, 
  message, Modal, Form, Input, Divider, Steps, Image, Empty
} from 'antd';
import { 
  ArrowLeftOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, UserOutlined, PhoneOutlined,
  MailOutlined, HomeOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewDesignOrderById, orderStatusConfig } from '../mockData/newDesignOrders';
import CustomerInfoSection from './sections/CustomerInfoSection';
import RequirementsSection from './sections/RequirementsSection';
import MaterialSuggestionsSection from './sections/MaterialSuggestionsSection';
import './NewDesignOrderDetail.scss';

const { TextArea } = Input;
const { Step } = Steps;
const { confirm } = Modal;

const NewDesignOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();

  useEffect(() => {
    try {
      console.log("Fetching order with ID:", id);
      const orderData = getNewDesignOrderById(id);
      console.log("Order data:", orderData);
      if (orderData) {
        setOrder(orderData);
      } else {
        message.error('Không tìm thấy đơn hàng');
        navigate('/admin/design-orders/new-design-orders');
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    }
  }, [id, navigate]);

  const handleAcceptOrder = () => {
    confirm({
      title: 'Xác nhận nhận đơn thiết kế',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn nhận đơn thiết kế này không?',
      onOk: async () => {
        setLoading(true);
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const updatedOrder = {
            ...order,
            status: 'processing',
            assignedTo: 'Nguyễn Văn A', // Current staff
            timeline: [
              ...order.timeline,
              {
                date: new Date().toISOString(),
                status: 'processing',
                description: 'Đơn hàng được tiếp nhận bởi Nguyễn Văn A'
              }
            ]
          };
          
          setOrder(updatedOrder);
          message.success('Đã nhận đơn thiết kế thành công');
        } catch (error) {
          message.error('Có lỗi xảy ra khi nhận đơn thiết kế');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleRejectOrder = () => {
    setIsRejectModalVisible(true);
  };

  const handleRejectSubmit = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedOrder = {
        ...order,
        status: 'rejected',
        rejectionReason: values.reason,
        timeline: [
          ...order.timeline,
          {
            date: new Date().toISOString(),
            status: 'rejected',
            description: `Đơn hàng bị từ chối: ${values.reason}`
          }
        ]
      };
      
      setOrder(updatedOrder);
      setIsRejectModalVisible(false);
      rejectForm.resetFields();
      message.success('Đã từ chối đơn thiết kế');
    } catch (error) {
      message.error('Có lỗi xảy ra khi từ chối đơn thiết kế');
    } finally {
      setLoading(false);
    }
  };

  // Thêm console.log để debug
  console.log("Current order state:", order);

  if (!order) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="new-design-order-detail">
      <Card>
        <div className="header-actions">
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
            >
              Quay lại
            </Button>
            <span className="order-number">Đơn hàng: {order.orderNumber}</span>
          </Space>
          
          {order.status === 'pending' && (
            <Space>
              <Button 
                type="primary" 
                danger
                icon={<CloseCircleOutlined />}
                onClick={handleRejectOrder}
                loading={loading}
              >
                Từ chối
              </Button>
              <Button 
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleAcceptOrder}
                loading={loading}
              >
                Nhận đơn
              </Button>
            </Space>
          )}
        </div>

        <Divider />

        <Row gutter={[16, 16]}>
          {/* Customer Information */}
          <Col span={24}>
            <CustomerInfoSection customer={order.customerInfo} />
          </Col>

          {/* Requirements */}
          <Col span={24}>
            <RequirementsSection 
              requirements={order.requirements}
              attachments={order.attachments}
              dimensions={order.dimensions}
            />
          </Col>

          {/* Material Suggestions - Only show if in processing status */}
          {order.status === 'processing' && order.materialSuggestions && (
            <Col span={24}>
              <MaterialSuggestionsSection 
                materials={order.materialSuggestions} 
              />
            </Col>
          )}

          {/* Rejection Reason - Only show if rejected */}
          {order.status === 'rejected' && order.rejectionReason && (
            <Col span={24}>
              <Card title="Lý do từ chối" className="rejection-section">
                <p>{order.rejectionReason}</p>
              </Card>
            </Col>
          )}
        </Row>
      </Card>

      {/* Reject Modal */}
      <Modal
        title="Từ chối đơn thiết kế"
        open={isRejectModalVisible}
        onCancel={() => setIsRejectModalVisible(false)}
        footer={null}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectSubmit}
        >
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do từ chối đơn hàng" />
          </Form.Item>
          <Form.Item className="form-actions">
            <Space>
              <Button onClick={() => setIsRejectModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" danger htmlType="submit" loading={loading}>
                Xác nhận từ chối
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NewDesignOrderDetail; 