import React, { useState } from 'react';
import { 
  Card, Form, Input, Button, Space, Upload, message, 
  Steps, Descriptions, Tag, Timeline, Image 
} from 'antd';
import { 
  UploadOutlined, 
  CheckCircleOutlined, 
  CarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './DeliverySection.scss';

const { TextArea } = Input;
const { Step } = Steps;

const DeliverySection = ({ order, onUpdateStatus }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const deliverySteps = [
    {
      title: 'Chuẩn bị',
      description: 'Chuẩn bị vật liệu',
      status: ['material_ordered']
    },
    {
      title: 'Đang giao',
      description: 'Đang vận chuyển',
      status: ['delivering']
    },
    {
      title: 'Hoàn thành',
      description: 'Đã giao hàng',
      status: ['completed']
    }
  ];

  const getCurrentStep = () => {
    return deliverySteps.findIndex(step => 
      step.status.includes(order.status)
    );
  };

  const handleStartDelivery = async (values) => {
    setLoading(true);
    try {
      const updatedOrder = {
        ...order,
        status: 'delivering',
        delivery: {
          ...order.delivery,
          startTime: new Date().toISOString(),
          trackingCode: values.trackingCode,
          estimatedTime: values.estimatedTime,
          notes: values.notes,
          proof: values.proof?.fileList.map(file => ({
            url: file.url || URL.createObjectURL(file.originFileObj),
            name: file.name
          }))
        },
        timeline: [
          ...order.timeline,
          {
            date: new Date().toISOString(),
            status: 'delivering',
            description: `Bắt đầu giao hàng - Mã vận đơn: ${values.trackingCode}`
          }
        ]
      };

      await onUpdateStatus(updatedOrder);
      form.resetFields();
      message.success('Đã bắt đầu giao hàng');
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật trạng thái giao hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDelivery = async (values) => {
    setLoading(true);
    try {
      const updatedOrder = {
        ...order,
        status: 'completed',
        delivery: {
          ...order.delivery,
          completionTime: new Date().toISOString(),
          completionNotes: values.notes,
          completionProof: values.proof?.fileList.map(file => ({
            url: file.url || URL.createObjectURL(file.originFileObj),
            name: file.name
          }))
        },
        timeline: [
          ...order.timeline,
          {
            date: new Date().toISOString(),
            status: 'completed',
            description: 'Đã hoàn thành giao hàng'
          }
        ]
      };

      await onUpdateStatus(updatedOrder);
      form.resetFields();
      message.success('Đã hoàn thành giao hàng');
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật trạng thái giao hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Quản lý giao hàng" className="delivery-section">
      <Steps current={getCurrentStep()} className="delivery-steps">
        {deliverySteps.map((step, index) => (
          <Step
            key={index}
            title={step.title}
            description={step.description}
          />
        ))}
      </Steps>

      <div className="delivery-info">
        <Descriptions title="Thông tin giao hàng" bordered>
          <Descriptions.Item label={<><UserOutlined /> Người nhận</>}>
            {order.customerInfo.name}
          </Descriptions.Item>
          <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
            {order.customerInfo.phone}
          </Descriptions.Item>
          <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>}>
            {order.customerInfo.address}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {order.status === 'material_ordered' && (
        <Card title="Bắt đầu giao hàng" className="delivery-form">
          <Form
            form={form}
            onFinish={handleStartDelivery}
            layout="vertical"
          >
            <Form.Item
              name="trackingCode"
              label="Mã vận đơn"
              rules={[{ required: true, message: 'Vui lòng nhập mã vận đơn' }]}
            >
              <Input placeholder="Nhập mã vận đơn" />
            </Form.Item>

            <Form.Item
              name="estimatedTime"
              label="Thời gian dự kiến"
              rules={[{ required: true, message: 'Vui lòng nhập thời gian dự kiến' }]}
            >
              <Input placeholder="VD: 3-5 ngày" />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Ghi chú"
            >
              <TextArea rows={4} placeholder="Nhập ghi chú giao hàng nếu có" />
            </Form.Item>

            <Form.Item
              name="proof"
              label="Ảnh vận đơn"
              rules={[{ required: true, message: 'Vui lòng tải lên ảnh vận đơn' }]}
            >
              <Upload
                listType="picture"
                multiple={false}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
              </Upload>
            </Form.Item>

            <Form.Item className="form-actions">
              <Button
                type="primary"
                htmlType="submit"
                icon={<CarOutlined />}
                loading={loading}
              >
                Bắt đầu giao hàng
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {order.status === 'delivering' && (
        <Card title="Xác nhận hoàn thành" className="delivery-form">
          <Form
            form={form}
            onFinish={handleCompleteDelivery}
            layout="vertical"
          >
            <Form.Item
              name="notes"
              label="Ghi chú"
              rules={[{ required: true, message: 'Vui lòng nhập ghi chú hoàn thành' }]}
            >
              <TextArea rows={4} placeholder="Nhập ghi chú hoàn thành giao hàng" />
            </Form.Item>

            <Form.Item
              name="proof"
              label="Ảnh xác nhận"
              rules={[{ required: true, message: 'Vui lòng tải lên ảnh xác nhận' }]}
            >
              <Upload
                listType="picture"
                multiple={true}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
              </Upload>
            </Form.Item>

            <Form.Item className="form-actions">
              <Button
                type="primary"
                htmlType="submit"
                icon={<CheckCircleOutlined />}
                loading={loading}
              >
                Xác nhận hoàn thành
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {order.delivery && (
        <Timeline className="delivery-timeline">
          {order.timeline
            .filter(item => ['material_ordered', 'delivering', 'completed'].includes(item.status))
            .map((item, index) => (
              <Timeline.Item key={index}>
                <div className="timeline-item">
                  <div className="timeline-header">
                    <span className="timeline-date">
                      {dayjs(item.date).format('DD/MM/YYYY HH:mm')}
                    </span>
                    <Tag color={item.status === 'completed' ? 'success' : 'processing'}>
                      {item.description}
                    </Tag>
                  </div>
                  {item.status === 'delivering' && order.delivery.proof && (
                    <div className="timeline-content">
                      <Space>
                        {order.delivery.proof.map((img, imgIndex) => (
                          <Image
                            key={imgIndex}
                            src={img.url}
                            alt={img.name}
                            width={100}
                          />
                        ))}
                      </Space>
                    </div>
                  )}
                </div>
              </Timeline.Item>
            ))}
        </Timeline>
      )}
    </Card>
  );
};

export default DeliverySection; 