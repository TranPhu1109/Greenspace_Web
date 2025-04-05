import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Input, DatePicker, Space, message } from 'antd';
import useScheduleStore from '../../../../stores/useScheduleStore';
import './styles/AddTaskModal.scss';

const { Option } = Select;
const { TextArea } = Input;

const AddTaskModal = ({ 
  open, 
  onCancel, 
  onSuccess, 
  designers = [],
  noIdeaOrders = [],
  usingIdeaOrders = [] 
}) => {
  const [form] = Form.useForm();
  const { addTask } = useScheduleStore();
  const [serviceOrders, setServiceOrders] = useState([]);
  
  // Sử dụng orders từ props
  useEffect(() => {
    if (noIdeaOrders?.length > 0 || usingIdeaOrders?.length > 0) {
      setServiceOrders([...noIdeaOrders, ...usingIdeaOrders]);
    }
  }, [JSON.stringify(noIdeaOrders), JSON.stringify(usingIdeaOrders)]);

  console.log('designers', noIdeaOrders, usingIdeaOrders, designers);
  return (
    <Modal
      title="Thêm công việc mới"
      open={open}
      onCancel={onCancel}
      onOk={async () => {
        form.validateFields().then((values) => {
          const taskData = {
            serviceOrderId: values.serviceOrderId,
            userId: designers[0]?.id,
            note: values.note || ''
          };
          addTask(taskData)
            .then(() => {
              message.success("Đã thêm công việc mới");
              form.resetFields();
              onSuccess?.();
            })
            .catch((error) => {
              message.error("Không thể thêm công việc: " + error.message);
            });
        });
      }}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="serviceOrderId"
          label="Chọn đơn thiết kế"
          rules={[{ required: true, message: 'Vui lòng chọn đơn thiết kế' }]}
        >
          <Select
            placeholder="Chọn đơn thiết kế"
            optionLabelProp="label"
          >
            {serviceOrders.map(order => (
              <Option 
                key={order.id} 
                value={order.id}
                label={`Mã đơn: ${order.id.substring(0, 8)}`}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>Mã đơn: {order.id.substring(0, 8)}</span>
                  <span>Khách hàng: {order.userName}</span>
                  <span>Email: {order.email}</span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="note"
          label="Ghi chú"
        >
          <TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTaskModal;