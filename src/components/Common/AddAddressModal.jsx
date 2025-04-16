import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import useAddressStore from '../../stores/useAddressStore';
import useAuthStore from '../../stores/useAuthStore';
import AddressForm from './AddressForm';

const AddAddressModal = ({ visible, onClose, onAddressAdded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { createAddress } = useAddressStore();
  const { user } = useAuthStore();
  const [addressData, setAddressData] = useState(null);

  const handleSubmit = async () => {
    try {
      // Validate form
      await form.validateFields();
      
      // Get form values
      const values = form.getFieldsValue();
      
      // Check if we have address data from the AddressForm component
      if (!addressData || !addressData.province || !addressData.district || !addressData.ward) {
        message.error('Vui lòng chọn địa chỉ đầy đủ');
        return;
      }
      
      // Prepare address string
      const addressString = `${addressData.streetAddress}|${addressData.ward.label}|${addressData.district.label}|${addressData.province.label}`;
      
      // Prepare data for API
      const newAddressData = {
        userId: user.id,
        name: values.name,
        phone: values.phone,
        userAddress: addressString
      };
      
      setLoading(true);
      
      // Create address
      await createAddress(newAddressData);
      
      message.success('Thêm địa chỉ mới thành công');
      
      // Reset form
      form.resetFields();
      
      // Close modal and refresh
      onAddressAdded();
      onClose();
    } catch (error) {
      console.error('Error creating address:', error);
      message.error('Có lỗi xảy ra khi thêm địa chỉ mới');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddressChange = (data) => {
    setAddressData(data);
  };
  
  return (
    <Modal
      title="Thêm địa chỉ mới"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Thêm địa chỉ"
      cancelText="Hủy"
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Tên người nhận"
          rules={[
            { required: true, message: 'Vui lòng nhập tên người nhận' }
          ]}
        >
          <Input placeholder="Nhập tên người nhận" />
        </Form.Item>
        
        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
        
        <AddressForm
          form={form}
          onAddressChange={handleAddressChange}
          useExistingAddress={false}
        />
      </Form>
    </Modal>
  );
};

export default AddAddressModal; 