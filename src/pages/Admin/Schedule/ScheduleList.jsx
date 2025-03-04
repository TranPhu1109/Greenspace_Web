import React, { useState } from 'react';
import { 
  Tabs,
  Card,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Row,
  Col,
  Typography,
  message
} from 'antd';
import {
  CalendarOutlined,
  TeamOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Calendar from './Calendar';
import DesignerSchedule from './DesignerSchedule';
import './Schedule.scss';
import { designers as mockDesigners, pendingOrders as mockPendingOrders } from './mockData';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ScheduleList = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [form] = Form.useForm();

  // Sử dụng dữ liệu mẫu
  const [designers] = useState(mockDesigners);
  const [pendingOrders] = useState(mockPendingOrders);

  // Tạo mảng tasks từ tất cả các task của designers
  const allTasks = designers.reduce((acc, designer) => {
    return [...acc, ...designer.tasks.map(task => ({
      ...task,
      designer: designer.name
    }))];
  }, []);

  const handleAssignTask = (designerId) => {
    setSelectedDesigner(designerId);
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      // Xử lý logic phân công task
      message.success('Đã phân công thiết kế thành công!');
      setModalVisible(false);
      form.resetFields();
    });
  };

  const handleAddNew = () => {
    setModalVisible(true);
  };

  const items = [
    {
      key: 'calendar',
      label: (
        <span>
          <CalendarOutlined />
          Lịch tổng quan
        </span>
      ),
      children: <Calendar 
        tasks={allTasks} 
        designers={designers}
        onAddNew={handleAddNew}
        pendingOrders={pendingOrders}
      />
    },
    {
      key: 'designers',
      label: (
        <span>
          <TeamOutlined />
          Lịch designers
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {designers.map(designer => (
            <Col xs={24} lg={12} key={designer.id}>
              <DesignerSchedule 
                designer={designer}
                tasks={designer.tasks}
                onAssignTask={handleAssignTask}
              />
            </Col>
          ))}
        </Row>
      )
    }
  ];

  return (
    <div className="schedule-container">
      <Card>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Title level={4}>Quản lý lịch thiết kế</Title>
          </Col>
        </Row>

        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
        />
      </Card>

      <Modal
        title="Phân công thiết kế"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="orderId"
            label="Đơn thiết kế"
            rules={[{ required: true, message: 'Vui lòng chọn đơn thiết kế!' }]}
          >
            <Select placeholder="Chọn đơn thiết kế">
              {pendingOrders.map(order => (
                <Option key={order.id} value={order.id}>
                  {order.orderNumber} - {order.customerName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="deadline"
            label="Deadline"
            rules={[{ required: true, message: 'Vui lòng chọn deadline!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleList; 