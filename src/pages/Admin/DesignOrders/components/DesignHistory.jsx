import React, { useState } from 'react';
import { 
  Timeline, 
  Typography, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select,
  Card,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DesignHistory = ({ history = [], onAdd }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const showModal = () => {
    setIsModalVisible(true);
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  
  const handleSubmit = () => {
    form.validateFields().then(values => {
      onAdd(values);
      setIsModalVisible(false);
      form.resetFields();
    });
  };
  
  return (
    <div className="design-history-container">
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={5}>Lịch sử thiết kế</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showModal}
        >
          Thêm ghi chú
        </Button>
      </div>
      
      <Card>
        <Timeline mode="left">
          {history.length > 0 ? (
            history.map((item, index) => (
              <Timeline.Item 
                key={item.id} 
                color={getTimelineItemColor(item.action)}
                label={item.date}
              >
                <div className="timeline-content">
                  <Text strong>{item.action}</Text>
                  <Text type="secondary"> - {item.user}</Text>
                  <Paragraph style={{ marginTop: 8 }}>{item.notes}</Paragraph>
                </div>
                {index < history.length - 1 && <Divider style={{ margin: '12px 0' }} />}
              </Timeline.Item>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Text type="secondary">Chưa có lịch sử nào</Text>
            </div>
          )}
        </Timeline>
      </Card>
      
      <Modal
        title="Thêm ghi chú lịch sử"
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="action"
            label="Hành động"
            rules={[{ required: true, message: 'Vui lòng chọn hành động' }]}
          >
            <Select placeholder="Chọn hành động">
              <Option value="Cập nhật yêu cầu">Cập nhật yêu cầu</Option>
              <Option value="Phản hồi khách hàng">Phản hồi khách hàng</Option>
              <Option value="Cập nhật thiết kế">Cập nhật thiết kế</Option>
              <Option value="Điều chỉnh giá">Điều chỉnh giá</Option>
              <Option value="Thay đổi trạng thái">Thay đổi trạng thái</Option>
              <Option value="Ghi chú nội bộ">Ghi chú nội bộ</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Ghi chú"
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
          >
            <TextArea rows={4} placeholder="Nhập ghi chú" />
          </Form.Item>
          
          <Form.Item
            name="user"
            label="Người tạo"
            rules={[{ required: true, message: 'Vui lòng nhập người tạo' }]}
            initialValue="Admin"
          >
            <Input placeholder="Nhập tên người tạo" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Hàm xác định màu cho timeline item dựa trên hành động
const getTimelineItemColor = (action) => {
  switch (action) {
    case 'Tạo đơn hàng':
      return 'green';
    case 'Phân công designer':
      return 'blue';
    case 'Cập nhật yêu cầu':
      return 'orange';
    case 'Điều chỉnh giá':
      return 'red';
    case 'Hoàn thành thiết kế':
      return 'green';
    default:
      return 'blue';
  }
};

export default DesignHistory; 