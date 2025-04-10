import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Space, Descriptions, Tag, 
  message, Modal, Form, Input, Divider, Steps, Image, Empty,
  Spin
} from 'antd';
import { 
  ArrowLeftOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, UserOutlined, PhoneOutlined,
  MailOutlined, HomeOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import useServiceOrderStore from '@/stores/useServiceOrderStore';
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
  const { selectedOrder: order, loading, error, getServiceOrderById } = useServiceOrderStore();
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();

  console.log('Order Detail:', order);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        if (!id) {
          message.error('ID đơn thiết kế không hợp lệ');
          navigate('/staff/design-orders/new-design-orders');
          return;
        }
        const response = await getServiceOrderById(id);
        if (!response) {
          message.error('Không tìm thấy đơn thiết kế');
          navigate('/staff/design-orders/new-design-orders');
        }
      } catch (error) {
      }
    };
    fetchOrderDetail();
  }, [id, getServiceOrderById, navigate]);

  const handleAcceptOrder = () => {
    confirm({
      title: 'Xác nhận nhận đơn thiết kế',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn nhận đơn thiết kế này không?',
      onOk: async () => {
        try {
          // TODO: Implement API call to accept order
          message.success('Đã nhận đơn thiết kế thành công');
          await getServiceOrderById(id); // Refresh order data
        } catch (error) {
          message.error('Có lỗi xảy ra khi nhận đơn thiết kế');
        }
      }
    });
  };

  const handleRejectOrder = () => {
    setIsRejectModalVisible(true);
  };

  const handleRejectSubmit = async (values) => {
    try {
      // TODO: Implement API call to reject order
      setIsRejectModalVisible(false);
      rejectForm.resetFields();
      message.success('Đã từ chối đơn thiết kế');
      await getServiceOrderById(id); // Refresh order data
    } catch (error) {
      message.error('Có lỗi xảy ra khi từ chối đơn thiết kế');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '70vh' 
      }}>
        <Spin size="large">Đang tải...</Spin>
      </div>
    );
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  if (!order) {
    return <div>Không tìm thấy đơn hàng</div>;
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
            <span className="order-number">Đơn hàng: {order.id}</span>
          </Space>
          
          {order.status === 'Pending' && (
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
            <CustomerInfoSection customer={order} />
          </Col>

          {/* Requirements */}
          <Col span={24}>
            <RequirementsSection 
              requirements={order}
              attachments={order.image}
              dimensions={order}
              budget={order.totalCost}
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