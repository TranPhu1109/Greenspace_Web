import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Input, DatePicker, Space, message, Tag, Descriptions } from 'antd';
import useScheduleStore from '../../../../stores/useScheduleStore';
import useServiceOrderStore from '../../../../stores/useServiceOrderStore';
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
  const { updateServiceOrderStatus } = useServiceOrderStore();
  const [serviceOrders, setServiceOrders] = useState([]);

  // Sử dụng orders từ props
  useEffect(() => {
    if (noIdeaOrders?.length > 0 || usingIdeaOrders?.length > 0) {
      setServiceOrders([...noIdeaOrders, ...usingIdeaOrders]);
    }
  }, [JSON.stringify(noIdeaOrders), JSON.stringify(usingIdeaOrders)]);

  //console.log('designers', noIdeaOrders, usingIdeaOrders, designers);

  const renderServiceType = (type) => {
    switch (type) {
      case "UsingDesignIdea":
        return "Sử dụng mẫu thiết kế";
      case "NoDesignIdea":
        return "Không có mẫu thiết kế";
      default:
        return "Không xác định";
    }
  };

  const getServiceTypeColor = (type) => {
    switch (type) {
      case "UsingDesignIdea":
        return "blue";
      case "NoDesignIdea":
        return "purple";
      default:
        return "default";
    }
  };


  return (
    <Modal
      title="Thêm công việc mới"
      open={open}
      onCancel={onCancel}
      onOk={async () => {
        try {
          const values = await form.validateFields();
          const taskData = {
            serviceOrderId: values.serviceOrderId,
            userId: designers[0]?.id,
            note: values.note || ''
          };
          
          // Thêm task mới
          await addTask(taskData);
          
          // Cập nhật trạng thái đơn hàng thành 1 (Đang tư vấn & phác thảo)
          await updateServiceOrderStatus(values.serviceOrderId, 1);
          
          message.success("Đã thêm công việc mới và cập nhật trạng thái đơn hàng");
          form.resetFields();
          onSuccess?.();
        } catch (error) {
          message.error("Không thể thêm công việc: " + error.message);
        }
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

                <Descriptions
                  column={1}
                  bordered
                  size="middle"
                  labelStyle={{
                    fontWeight: '600',
                    color: '#555',
                    width: '120px',
                  }}
                  contentStyle={{
                    fontSize: '15px',
                  }}
                  style={{
                    // padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Descriptions.Item label="Mã đơn" style={{fontWeight: '600', color: '#555', width: '120px'}}>
                    #{order.id.substring(0, 8)}
                  </Descriptions.Item>

                  <Descriptions.Item label="Loại đơn">
                    <Tag color={getServiceTypeColor(order.serviceType)}>
                      {renderServiceType(order.serviceType)}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Khách hàng">
                    {order.userName}
                  </Descriptions.Item>

                  <Descriptions.Item label="Email">
                    {order.email}
                  </Descriptions.Item>
                </Descriptions>


              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="note"
          label="Ghi chú"
          rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
        >
          <TextArea rows={4} placeholder="Nhập ghi chú" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTaskModal;