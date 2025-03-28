import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import useUserStore from '../../../../stores/useUserStore';

const EditUserModal = ({ visible, onCancel, user }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { updateUser } = useUserStore();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await updateUser(user.id, values);
      onCancel();
      form.resetFields();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        name: user.name,
        phone: user.phone,
        address: user.address || '',
      });
    }
  }, [visible, user, form]);

  return (
    <Modal
      title="Chỉnh sửa thông tin nhân viên"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Tên"
          rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
        >
          <Input placeholder="Nhập tên người dùng" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
        >
          <Input placeholder="Nhập địa chỉ" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu mới"
        >
          <Input.Password placeholder="Để trống nếu không muốn thay đổi mật khẩu" />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;