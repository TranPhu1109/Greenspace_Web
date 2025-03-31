import React, { useState, useEffect } from "react";
import { Modal, Select, Form, Input, Space, message } from "antd";
import useOrderStore from "../../../../stores/orderStore";

const { Option } = Select;
const { TextArea } = Input;

const OrderStatusModal = ({ visible, setVisible, order }) => {
  const { updateOrderStatus } = useOrderStore();
  const [form] = Form.useForm();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        status: order.orderStatus,
        note: ''
      });
    }
  }, [visible, order]);

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setIsUpdating(true);
      
      const success = await updateOrderStatus(
        order.id, 
        values.status, 
        values.note
      );

      if (success) {
        message.success('Cập nhật trạng thái đơn hàng thành công');
        setVisible(false);
      }
    } catch (error) {
      message.error('Vui lòng kiểm tra lại thông tin');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      title="Cập nhật trạng thái đơn hàng"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isUpdating}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="status"
          label="Trạng thái mới"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select>
            <Option value="chờ xác nhận">Chờ xác nhận</Option>
            <Option value="đã xác nhận">Đã xác nhận</Option>
            <Option value="đã giao cho đơn vị vận chuyển">Đã giao cho ĐVVC</Option>
            <Option value="đang giao hàng">Đang giao hàng</Option>
            <Option value="đã giao hàng">Đã giao hàng</Option>
            <Option value="đơn bị từ chối">Đơn bị từ chối</Option>
            <Option value="đã hủy">Đã hủy</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="note"
          label="Ghi chú"
        >
          <TextArea 
            rows={4}
            placeholder="Nhập ghi chú về việc thay đổi trạng thái (nếu có)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderStatusModal; 