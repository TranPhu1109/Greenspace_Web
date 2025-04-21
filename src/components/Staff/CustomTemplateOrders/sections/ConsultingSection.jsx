import React, { useState } from 'react';
import { Card, Form, Input, Button, Space, Upload, message } from 'antd';
import { UploadOutlined, SendOutlined } from '@ant-design/icons';
import './ConsultingSection.scss';

const { TextArea } = Input;

const ConsultingSection = ({ order, onUpdateStatus }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSendConsultation = async (values) => {
    setLoading(true);
    try {
      // TODO: Gửi tư vấn cho khách hàng
      const updatedOrder = {
        ...order,
        consultations: [
          ...(order.consultations || []),
          {
            content: values.content,
            attachments: values.attachments,
            date: new Date().toISOString(),
            sender: 'designer'
          }
        ]
      };

      await onUpdateStatus(updatedOrder);
      form.resetFields();
      message.success('Đã gửi tư vấn cho khách hàng');
    } catch (error) {
      message.error('Có lỗi xảy ra khi gửi tư vấn');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToDesign = async () => {
    try {
      const updatedOrder = {
        ...order,
        status: 'designing',
        timeline: [
          ...order.timeline,
          {
            date: new Date().toISOString(),
            status: 'designing',
            description: 'Bắt đầu giai đoạn thiết kế'
          }
        ]
      };

      await onUpdateStatus(updatedOrder);
      message.success('Đã chuyển sang giai đoạn thiết kế');
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  return (
    <Card title="Tư vấn thiết kế" className="consulting-section">
      <div className="consultation-history">
        {order.consultations?.map((consultation, index) => (
          <div 
            key={index}
            className={`consultation-item ${consultation.sender}`}
          >
            <div className="consultation-content">
              <p>{consultation.content}</p>
              {consultation.attachments?.map((file, fileIndex) => (
                <div key={fileIndex} className="attachment">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    {file.name}
                  </a>
                </div>
              ))}
            </div>
            <div className="consultation-date">
              {new Date(consultation.date).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <Form
        form={form}
        onFinish={handleSendConsultation}
        layout="vertical"
        className="consultation-form"
      >
        <Form.Item
          name="content"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung tư vấn' }]}
        >
          <TextArea 
            rows={4}
            placeholder="Nhập nội dung tư vấn cho khách hàng..."
          />
        </Form.Item>

        <Form.Item name="attachments">
          <Upload
            multiple
            beforeUpload={() => false}
            listType="text"
          >
            <Button icon={<UploadOutlined />}>Đính kèm tệp</Button>
          </Upload>
        </Form.Item>

        <Form.Item className="form-actions">
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={loading}
            >
              Gửi tư vấn
            </Button>
            <Button 
              type="primary"
              onClick={handleProceedToDesign}
            >
              Chuyển sang thiết kế
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ConsultingSection; 