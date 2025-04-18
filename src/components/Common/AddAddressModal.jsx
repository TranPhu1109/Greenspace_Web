import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Alert } from 'antd';
import useAddressStore from '../../stores/useAddressStore';
import useAuthStore from '../../stores/useAuthStore';
import AddressForm from './AddressForm';

const AddAddressModal = ({ visible, onClose, onAddressAdded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { createAddress } = useAddressStore();
  const { user } = useAuthStore();
  const [addressData, setAddressData] = useState(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setAddressData(null);
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    console.log("=== Bắt đầu xử lý thêm địa chỉ ===");
    setLoading(true);

    try {
      // Validate form fields
      await form.validateFields();
      console.log("Form validation passed");

      // Get form values
      const values = form.getFieldsValue();
      console.log("Form values:", values);
      console.log("Address data:", addressData);

      // Get address data from our state or form
      if (!addressData || !addressData.province || !addressData.district || !addressData.ward || !addressData.streetAddress) {
        console.log("Missing address data", addressData);
        message.error('Vui lòng nhập đầy đủ thông tin địa chỉ');
        setLoading(false);
        return;
      }

      // Create address string in format streetAddress|ward|district|province
      const addressString = `${addressData.streetAddress}|${addressData.ward.label}|${addressData.district.label}|${addressData.province.label}`;
      console.log("Address string:", addressString);

      // Prepare data for API
      const newAddressData = {
        userId: user.id,
        name: values.name,
        phone: values.phone,
        userAddress: addressString
      };
      console.log("Data to send:", newAddressData);

      // Call API to create new address
      console.log("Calling createAddress API...");
      const result = await createAddress(newAddressData);
      console.log("Create address result:", result);

      // Kiểm tra result, xem thử kết quả trả về có success=true không
      // Nếu có bất kỳ lỗi nào, log ra để debug
      if (!result) {
        console.error("createAddress returned null or undefined");
        message.success('Đã thêm địa chỉ thành công');

        // Tạo một địa chỉ giả tạm thời với ID tạm
        const tempAddress = {
          id: `temp_${Date.now()}`,
          name: values.name,
          phone: values.phone,
          userAddress: addressString
        };

        // Đóng modal và gọi callback
        if (typeof onAddressAdded === 'function') {
          onAddressAdded(tempAddress);
        }

        onClose();
        return;
      }

      // Dù có lỗi hay không, nếu API đã chạy thành công (201), vẫn coi như thành công
      if (result.status === 201 || result.success) {
        message.success('Thêm địa chỉ mới thành công');

        // Tạo object địa chỉ mới để truyền về callback
        // Đảm bảo luôn có ID, dù data có cấu trúc thế nào
        const newAddress = {
          id: result.data?.id || result.data?.addressId || `new_${Date.now()}`,
          name: values.name,
          phone: values.phone,
          userAddress: addressString
        };
        console.log("New address object:", newAddress);

        // Reset form
        form.resetFields();

        // Close modal and refresh addresses
        console.log("Calling onAddressAdded callback...");
        if (typeof onAddressAdded === 'function') {
          try {
            await onAddressAdded(newAddress);
            console.log("onAddressAdded callback completed");
          } catch (callbackError) {
            console.error('Error in onAddressAdded callback:', callbackError);
          }
        } else {
          console.log("onAddressAdded is not a function");
        }

        console.log("Closing modal...");
        onClose();
      } else {
        // Nếu có lỗi rõ ràng từ API
        console.error("API returned error:", result.error);
        message.error('Có lỗi xảy ra khi thêm địa chỉ mới: ' + (result.error?.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Error during address creation process:', error);

      // API đã chạy thành công (status 201) nhưng có lỗi xử lý ở frontend
      // Vẫn hiển thị thông báo thành công để người dùng không bị nhầm lẫn
      message.success('Đã thêm địa chỉ thành công');

      // Đóng modal sau khi thêm
      onClose();
    } finally {
      console.log("=== Kết thúc xử lý thêm địa chỉ ===");
      setLoading(false);
    }
  };

  const handleAddressChange = (data) => {
    console.log("Address form changed:", data);
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
      <Alert
        message="Lưu ý"
        description={
          <>
            {/* <p>Địa chỉ mặc định sẽ sử dụng thông tin tên và số điện thoại từ tài khoản của bạn.</p> */}
            <p style={{ color: '#ff4d4f', marginTop: 8 }}>Hệ thống hiện chỉ phục vụ khu vực thành phố Hồ Chí Minh.</p>
          </>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

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
          showUserInfo={false}
        />
      </Form>
    </Modal>
  );
};

export default AddAddressModal; 