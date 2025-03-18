import React from 'react';
import { Modal, Form, Select, Input, DatePicker, Space } from 'antd';
import './styles/AddTaskModal.scss';

const { Option } = Select;
const { TextArea } = Input;

const AddTaskModal = ({ 
  visible, 
  onCancel, 
  onOk, 
  form, 
  designers = [] 
}) => {
  return (
    <Modal
      title="Thêm công việc mới"
      visible={visible}
      onCancel={onCancel}
      onOk={onOk}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Tiêu đề công việc"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề công việc' }]}
        >
          <Input placeholder="Nhập tiêu đề công việc" />
        </Form.Item>
        
        <Form.Item
          name="customer"
          label="Khách hàng"
          rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
        >
          <Input placeholder="Nhập tên khách hàng" />
        </Form.Item>
        
        <Form.Item
          name="designerId"
          label="Designer"
          rules={[{ required: true, message: 'Vui lòng chọn designer' }]}
        >
          <Select placeholder="Chọn designer">
            {designers.map(designer => (
              <Option key={designer.id} value={designer.id}>
                {designer.name} ({designer.status})
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Space style={{ display: 'flex', width: '100%' }}>
          <Form.Item
            name="date"
            label="Ngày"
            rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Space>
        
        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTaskModal; 