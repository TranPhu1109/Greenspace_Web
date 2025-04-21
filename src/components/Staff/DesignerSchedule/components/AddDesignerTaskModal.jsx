import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Button, message, Spin, Space, Typography, Divider, Tag, DatePicker, TimePicker, Row, Col, ConfigProvider } from 'antd';
import { UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import viVN from 'antd/es/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import useScheduleStore from '@/stores/useScheduleStore';
import './styles/AddDesignerTaskModal.scss';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const AddDesignerTaskModal = ({ visible, onClose, designers, selectedDesignerId = null }) => {
  const [form] = Form.useForm();
  const [serviceOrders, setServiceOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get the addTask function from the schedule store
  const { addTaskDesign, fetchNoIdeaOrders, fetchUsingIdeaOrders } = useScheduleStore();

  // Fetch service orders when the modal opens
  useEffect(() => {
    if (visible) {
      loadServiceOrders();

      // Pre-set the designer if one is selected
      if (selectedDesignerId) {
        form.setFieldsValue({ userId: selectedDesignerId });
      }
    }
  }, [visible, selectedDesignerId, form]);

  // Load both types of service orders
  const loadServiceOrders = async () => {
    setLoadingOrders(true);
    try {
      // Fetch orders in parallel
      const [noIdeaOrders, usingIdeaOrders] = await Promise.all([
        fetchNoIdeaOrders(),
        fetchUsingIdeaOrders()
      ]);

      // Combine and sort by creation date (newest first)
      const allOrders = [...noIdeaOrders, ...usingIdeaOrders]
        .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

      setServiceOrders(allOrders);
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng: ' + error.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Create task data
      const taskData = {
        serviceOrderId: values.serviceOrderId,
        userId: values.userId,
        dateAppointment: values.dateAppointment?.format('YYYY-MM-DD'),
        timeAppointment: values.timeAppointment?.format('HH:mm:ss'),
        note: values.note || 'Công việc mới được giao'
      };

      // Call API to add task
      await addTaskDesign(taskData);

      message.success('Đã giao việc thành công!');
      handleCancel(true); // close and refresh
    } catch (error) {
      if (error.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin nhập vào');
      } else {
        message.error('Không thể giao việc: ' + (error.message || 'Lỗi không xác định'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal cancel
  const handleCancel = (shouldRefresh = false) => {
    form.resetFields();
    onClose(shouldRefresh);
  };

  // Format order status for display
  const getOrderStatusLabel = (status) => {
    const statusMap = {
      'Pending': 'Đang chờ',
      'Consulting': 'Đang tư vấn',
      'DeterminingDesignPrice': 'Đang báo giá thiết kế',
      'DoneDeterminingDesignPrice': 'Đã báo giá thiết kế',
      'DepositSuccessful': 'Đã đặt cọc',
      'AssignToDesigner': 'Đã giao cho designer',
      'DoneDesign': 'Đã thiết kế',
      0: 'Đang chờ',
      1: 'Đang tư vấn',
      2: 'Đang báo giá thiết kế',
      3: 'Đã đặt cọc',
      4: 'Đã giao cho designer',
      6: 'Đã thiết kế'
    };

    return statusMap[status] || `Trạng thái #${status}`;
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    const statusClassMap = {
      'Pending': 'status-pending',
      'Consulting': 'status-consulting',
      'DeterminingDesignPrice': 'status-determining-price',
      'DepositSuccessful': 'status-deposit',
      'AssignToDesigner': 'status-assigned',
      'DoneDesign': 'status-done',
      0: 'status-pending',
      1: 'status-consulting',
      2: 'status-determining-price',
      3: 'status-deposit',
      4: 'status-assigned',
      6: 'status-done'
    };

    return statusClassMap[status] || '';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Custom render option for better display of order information
  const customOrderRender = (order) => {
    const orderId = order.id;
    const customerName = order.user?.name || order.userName || 'Khách hàng';
    const formattedDate = formatDate(order.creationDate);
    const statusClass = getStatusClass(order.status);
    const statusLabel = getOrderStatusLabel(order.status);

    return (
      <div className="order-option-detail">
        <div className="order-info">
          <div className="order-main" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Space align="center">
              <ShoppingOutlined />
              <Text copyable={{ text: orderId }} strong>#{orderId.substring(0, 8)}</Text>
            </Space>
            <Text className="customer-name" ellipsis title={customerName} >
              <UserOutlined />{" "}
              {customerName}
            </Text>
          </div>
          <div className="order-meta">
            <Text type="secondary" className="order-date" style={{ marginRight: '8px' }}>{formattedDate}</Text>
            <Tag color="blue" className={statusClass}>{statusLabel}</Tag>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      title="Giao việc cho Designer"
      open={visible}
      onCancel={() => handleCancel(false)}
      footer={[
        <Button key="cancel" onClick={() => handleCancel(false)}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
          className="submit-button"
        >
          Giao việc
        </Button>
      ]}
      width={600}
      maskClosable={false}
      className="add-designer-task-modal"
    >
      <ConfigProvider locale={viVN}>
        <Spin spinning={submitting}>
          <Form
            form={form}
            layout="vertical"
            requiredMark="optional"
            className="designer-task-form"
          >
            <Form.Item
              name="userId"
              label="Designer"
              rules={[{ required: true, message: 'Vui lòng chọn designer' }]}
              className="form-item"
            >
              <Select
                placeholder="Chọn designer..."
                showSearch
                optionFilterProp="children"
                loading={submitting}
                disabled={submitting}
                className="select-item"
                allowClear
              >
                {Array.isArray(designers) && designers.map(designer => (
                  <Option key={designer.id} value={designer.id}>
                    <Space className="designer-option">
                      <UserOutlined />
                      {designer.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="serviceOrderId"
              label="Đơn hàng"
              rules={[{ required: true, message: 'Vui lòng chọn đơn hàng' }]}
              className="form-item"
            >
              <Select
                placeholder="Chọn đơn hàng..."
                showSearch
                optionFilterProp="label"
                loading={loadingOrders || submitting}
                disabled={loadingOrders || submitting}
                notFoundContent={loadingOrders ? <Spin size="small" /> : 'Không tìm thấy đơn hàng'}
                className="select-item"
                allowClear
                filterOption={(input, option) => {
                  // Tìm kiếm theo mã đơn hàng, tên khách hàng
                  const label = option.label || '';
                  return label.toLowerCase().includes(input.toLowerCase());
                }}
                optionLabelProp="label"
              >
                {serviceOrders.map(order => (
                  <Option
                    key={order.id}
                    value={order.id}
                    label={`${order.id.substring(0, 8)} - ${order.user?.name || order.userName || 'Khách hàng'}`}
                  >
                    {customOrderRender(order)}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Divider className="form-divider" />
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="dateAppointment"
                  label="Ngày hẹn làm việc với khách hàng"
                  className="form-item"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn làm việc' }]}
                  style={{ marginBottom: 0, width: '100%' }}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    style={{ width: '100%' }}
                    disabledDate={(current) => {
                      const today = dayjs().startOf('day');
                      const maxDate = dayjs().add(30, 'day').endOf('day');
                      const day = current.day();
                      return current < today || current > maxDate 
                    }}
                    
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="timeAppointment"
                  label="Giờ hẹn làm việc với khách hàng"
                  className="form-item"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ hẹn làm việc' }]}
                  style={{ marginBottom: 0, width: '100%' }}
                >
                  <TimePicker
                    format="HH:mm"
                    showSecond={false}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Divider className="form-divider" />


            <Form.Item
              name="note"
              label="Ghi chú"
              className="form-item"
            >
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú cho task này..."
                disabled={submitting}
                className="text-area"
                allowClear
              />
            </Form.Item>
          </Form>
        </Spin>
      </ConfigProvider>
    </Modal >
  );
};

export default AddDesignerTaskModal; 