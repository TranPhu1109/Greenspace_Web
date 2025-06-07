import React, { useState } from 'react';
import { Card, Form, Input, Button, Space, Upload, message, Tabs, Image } from 'antd';
import { UploadOutlined, SendOutlined, CheckOutlined } from '@ant-design/icons';
import './DesignSection.scss';

const { TextArea } = Input;


const DesignSection = ({ order, onUpdateStatus }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('draft');

  const handleSubmitDesign = async (values) => {
    setLoading(true);
    try {
      const updatedOrder = {
        ...order,
        designs: [
          ...(order.designs || []),
          {
            type: activeTab,
            images: values.images?.fileList.map(file => ({
              url: file.url || URL.createObjectURL(file.originFileObj),
              name: file.name
            })),
            description: values.description,
            date: new Date().toISOString()
          }
        ],
        status: 'design_review',
        timeline: [
          ...order.timeline,
          {
            date: new Date().toISOString(),
            status: 'design_review',
            description: `Đã gửi bản ${activeTab === 'draft' ? 'phác thảo' : 'thiết kế'} cho khách hàng`
          }
        ]
      };

      await onUpdateStatus(updatedOrder);
      form.resetFields();
      message.success('Đã gửi thiết kế cho khách hàng');
    } catch (error) {
      message.error('Có lỗi xảy ra khi gửi thiết kế');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToDeposit = async () => {
    try {
      const updatedOrder = {
        ...order,
        status: 'waiting_deposit',
        timeline: [
          ...order.timeline,
          {
            date: new Date().toISOString(),
            status: 'waiting_deposit',
            description: 'Chờ khách hàng đặt cọc'
          }
        ]
      };

      await onUpdateStatus(updatedOrder);
      message.success('Đã chuyển sang giai đoạn đặt cọc');
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const renderDesignHistory = (type) => {
    const designs = order.designs?.filter(d => d.type === type) || [];
    return designs.map((design, index) => (
      <div key={index} className="design-item">
        <div className="design-images">
          {design.images.map((image, imgIndex) => (
            <div key={imgIndex} className="image-item">
              <Image
                src={image.url}
                alt={image.name}
                width={200}
              />
            </div>
          ))}
        </div>
        <div className="design-description">
          <p>{design.description}</p>
          <span className="design-date">
            {new Date(design.date).toLocaleString()}
          </span>
        </div>
      </div>
    ));
  };

  return (
    <Card title="Quản lý thiết kế" className="design-section">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "draft",
            label: "Bản phác thảo",
            children: (
              <div className="design-history">
                {renderDesignHistory('draft')}
              </div>
            )
          },
          {
            key: "design",
            label: "Bản thiết kế",
            children: (
              <div className="design-history">
                {renderDesignHistory('design')}
              </div>
            )
          }
        ]}
      />

      <Form
        form={form}
        onFinish={handleSubmitDesign}
        layout="vertical"
        className="design-form"
      >
        <Form.Item
          name="images"
          rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh thiết kế' }]}
        >
          <Upload
            multiple
            listType="picture-card"
            beforeUpload={() => false}
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Tải lên hình ảnh</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả thiết kế' }]}
        >
          <TextArea 
            rows={4}
            placeholder="Nhập mô tả chi tiết thiết kế..."
          />
        </Form.Item>

        <Form.Item className="form-actions">
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={loading}
            >
              Gửi {activeTab === 'draft' ? 'bản phác thảo' : 'bản thiết kế'}
            </Button>
            {activeTab === 'design' && (
              <Button 
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleProceedToDeposit}
              >
                Hoàn tất thiết kế
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default DesignSection; 