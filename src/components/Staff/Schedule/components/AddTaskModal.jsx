import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Space, message, Tag, Descriptions, Card, Row, Col } from 'antd';
import useScheduleStore from '../../../../stores/useScheduleStore';
import useServiceOrderStore from '../../../../stores/useServiceOrderStore';
import './styles/AddTaskModal.scss';

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
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
      width={800}
      className="add-task-modal"
      onOk={async () => {
        try {
          const values = await form.validateFields();
          if (!selectedOrderId) {
            message.error('Vui lòng chọn một đơn thiết kế');
            return;
          }
          const taskData = {
            serviceOrderId: selectedOrderId,
            userId: designers[0]?.id,
            note: values.note || ''
          };
          
          // Thêm task mới
          await addTask(taskData);
          
          // Cập nhật trạng thái đơn hàng thành 1 (Đang tư vấn & phác thảo)
          await updateServiceOrderStatus(selectedOrderId, 1);
          
          message.success("Đã thêm công việc mới và cập nhật trạng thái đơn hàng");
          form.resetFields();
          setSelectedOrderId(null);
          onSuccess?.();
        } catch (error) {
          message.error("Vui lòng chọn đơn thiết kế và nhập ghi chú");
        }
      }}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Chọn đơn thiết kế"
          required
        >
          <div className="order-selection-container">
            <Row gutter={[16, 16]}>
              {serviceOrders.map(order => (
                <Col key={order.id} xs={24} sm={12}>
                  <Card
                    hoverable
                    className={`order-card ${selectedOrderId === order.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOrderId(order.id)}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <Descriptions
                      column={1}
                      bordered
                      size="small"
                      labelStyle={{
                        fontWeight: '600',
                        color: '#555',
                        width: '100px',
                        padding: '8px 10px'
                      }}
                      contentStyle={{
                        fontSize: '14px',
                        padding: '8px 10px'
                      }}
                    >
                      <Descriptions.Item label="Mã đơn">
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
                    </Descriptions>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
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