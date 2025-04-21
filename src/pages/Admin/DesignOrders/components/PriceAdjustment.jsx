import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Typography, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Space,
  Popconfirm,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PriceAdjustment = ({ adjustments, onAdd, onDelete, totalPrice }) => {
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
  
  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text style={{ color: amount >= 0 ? '#4caf50' : '#f5222d' }}>
          {amount >= 0 ? '+' : ''}{amount.toLocaleString('vi-VN')} VND
        </Text>
      ),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa điều chỉnh này?"
          onConfirm={() => onDelete(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      ),
    },
  ];
  
  return (
    <div className="price-adjustment-container">
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={5}>Điều chỉnh giá</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showModal}
        >
          Thêm điều chỉnh
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={adjustments} 
        rowKey="id"
        pagination={false}
      />
      
      <Divider />
      
      <div className="price-summary" style={{ textAlign: 'right' }}>
        <Text strong>Tổng giá trị sau điều chỉnh: </Text>
        <Text strong style={{ fontSize: 16, color: '#4caf50' }}>
          {totalPrice.toLocaleString('vi-VN')} VND
        </Text>
      </div>
      
      <Modal
        title="Thêm điều chỉnh giá"
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
            name="amount"
            label="Số tiền điều chỉnh"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập số tiền (dương: tăng, âm: giảm)"
            />
          </Form.Item>
          
          <Form.Item
            name="reason"
            label="Lý do điều chỉnh"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do điều chỉnh giá" />
          </Form.Item>
          
          <Form.Item
            name="createdBy"
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

export default PriceAdjustment; 