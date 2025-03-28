import React, { useState, useEffect } from 'react';
import { 
  Tabs,
  Card,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Typography,
  message,
  Spin
} from 'antd';
import {
  CalendarOutlined,
  TeamOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Calendar from './Calendar';
import DesignerSchedule from './DesignerSchedule';
import useScheduleStore from '../../../stores/useScheduleStore';
import './Schedule.scss';
import useDesignOrderStore from '@/stores/useDesignOrderStore';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const ScheduleList = () => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedDesignerId, setSelectedDesignerId] = useState(null);
  const [form] = Form.useForm();

  // Lấy dữ liệu từ store
  const { 
    designers, 
    fetchDesigners, 
    isLoading, 
    error, 
    addTask,
    getAllTasks
  } = useScheduleStore();
  const{designOrders, fetchDesignOrders} = useDesignOrderStore();

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchDesigners();
    fetchDesignOrders();
  }, [fetchDesigners, fetchDesignOrders]);

  // Xử lý phân công task mới
  const handleAssignTask = (designerId) => {
    setSelectedDesignerId(designerId);
    setAssignModalVisible(true);
  };

  // Xử lý submit form phân công
  const handleAssignSubmit = () => {
    form.validateFields().then((values) => {
      const pendingCustomOrders = designOrders.filter(order => 
        order.isCustom === true && 
        order.status === "Pending"
      );
  
      if (pendingCustomOrders.length === 0) {
        message.warning("Không có đơn hàng thiết kế tùy chỉnh nào đang chờ xử lý");
        return;
      }
  
      const taskData = {
        serviceOrderId: pendingCustomOrders[0].id,
        userId: values.designerId,
        note: values.notes || ''
      };
  
      addTask(taskData)
        .then(() => {
          message.success("Đã phân công công việc mới");
          setAssignModalVisible(false);
          form.resetFields();
        })
        .catch((err) => {
          message.error("Không thể phân công công việc: " + err.message);
        });
    });
  };

  // Lọc designers theo trạng thái
  const getDesignersByStatus = (status) => {
    if (status === 'all') return designers;
    return designers.filter(designer => designer.status === status);
  };

  // Tạo các tab cho từng loại designer
  const items = [
    {
      key: "calendar",
      label: (
        <span>
          <CalendarOutlined />
          Lịch tổng quan
        </span>
      ),
      children: (
        <Calendar 
          designers={designers}
          onAddNew={() => setAssignModalVisible(true)}
        />
      )
    },
    {
      key: "all",
      label: "Tất cả designers",
      children: (
        <div className="designers-grid">
          {isLoading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {getDesignersByStatus('all').map(designer => (
                <Col xs={24} md={12} xl={8} key={designer.id}>
                  <DesignerSchedule 
                    designer={designer} 
                    onAssignTask={handleAssignTask} 
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      )
    },
    {
      key: "available",
      label: "Đang rảnh",
      children: (
        <div className="designers-grid">
          {isLoading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {getDesignersByStatus('đang rảnh').map(designer => (
                <Col xs={24} md={12} xl={8} key={designer.id}>
                  <DesignerSchedule 
                    designer={designer} 
                    onAssignTask={handleAssignTask} 
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      )
    },
    {
      key: "designing",
      label: "Đang thiết kế",
      children: (
        <div className="designers-grid">
          {isLoading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {getDesignersByStatus('thiết kế').map(designer => (
                <Col xs={24} md={12} xl={8} key={designer.id}>
                  <DesignerSchedule 
                    designer={designer} 
                    onAssignTask={handleAssignTask} 
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      )
    },
    {
      key: "consulting",
      label: "Đang tư vấn",
      children: (
        <div className="designers-grid">
          {isLoading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {getDesignersByStatus('tư vấn').map(designer => (
                <Col xs={24} md={12} xl={8} key={designer.id}>
                  <DesignerSchedule 
                    designer={designer} 
                    onAssignTask={handleAssignTask} 
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
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
        title="Phân công công việc mới"
        open={assignModalVisible}  // Change from 'visible' to 'open'
        onCancel={() => setAssignModalVisible(false)}
        onOk={handleAssignSubmit}
        okText="Phân công"
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
          
          <Form.Item
            name="deadline"
            label="Deadline"
            rules={[{ required: true, message: 'Vui lòng chọn deadline' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleList;