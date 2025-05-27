import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Button, message, Spin, Space, Typography, Divider, Tag, DatePicker, TimePicker, Row, Col, ConfigProvider, Alert, Avatar, Badge } from 'antd';
import { UserOutlined, ShoppingOutlined, InfoCircleOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import viVN from 'antd/es/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import useScheduleStore from '@/stores/useScheduleStore';
import './styles/AddDesignerTaskModal.scss';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const AddDesignerTaskModal = ({ 
  visible, 
  onClose, 
  designers, 
  selectedDesignerId = null,
  preselectedOrderId = null,
  customerName = null,
  address = null
}) => {
  const [form] = Form.useForm();
  const [serviceOrders, setServiceOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDesigner, setSelectedDesigner] = useState(null);

  // Get the addTask function from the schedule store
  const { addTaskDesign, fetchNoIdeaOrders, fetchUsingIdeaOrders } = useScheduleStore();

  // Fetch service orders when the modal opens
  useEffect(() => {
    if (visible) {
      loadServiceOrders();

      // Pre-set the designer if one is selected
      if (selectedDesignerId) {
        const designer = designers.find(d => d.id === selectedDesignerId);
        setSelectedDesigner(designer);
        form.setFieldsValue({ userId: selectedDesignerId });
      }
      
      // Pre-set default values
      form.setFieldsValue({
        dateAppointment: dayjs().add(1, 'day'),
        timeAppointment: dayjs('09:00:00', 'HH:mm:ss'),
      });
      
      // Pre-set the order if one is provided from navigation
      if (preselectedOrderId) {
        form.setFieldsValue({ serviceOrderId: preselectedOrderId });
      }
    }
  }, [visible, selectedDesignerId, preselectedOrderId, form, designers]);

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
      
      // If we have a preselected order ID, find it in the loaded orders
      if (preselectedOrderId) {
        const foundOrder = allOrders.find(order => order.id === preselectedOrderId);
        if (foundOrder) {
          setSelectedOrder(foundOrder);
        }
      }
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng: ' + error.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Handle designer selection change
  const handleDesignerChange = (designerId) => {
    const designer = designers.find(d => d.id === designerId);
    setSelectedDesigner(designer);
  };

  // Handle order selection change
  const handleOrderChange = (orderId) => {
    const order = serviceOrders.find(o => o.id === orderId);
    setSelectedOrder(order);
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
      handleCancel(true, values.userId, true); // close and refresh with success
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
  const handleCancel = (shouldRefresh = false, designerId = null, success = false) => {
    form.resetFields();
    setSelectedOrder(null);
    setSelectedDesigner(null);
    onClose(shouldRefresh, designerId, success);
  };

  // Format order status for display
  const getOrderStatusLabel = (status) => {
    const statusMap = {
      'Pending': 'Đang chờ',
      'Consulting': 'Đang tư vấn',
      'ConsultingAndSketching': 'Tư vấn & phác thảo',
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
      'ConsultingAndSketching': 'status-consulting',
      'DeterminingDesignPrice': 'status-determining-price',
      'DoneDeterminingDesignPrice': 'status-determining-price',
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

  // Get status tag color
  const getStatusColor = (status) => {
    const colorMap = {
      'Pending': 'gold',
      'Consulting': 'blue',
      'ConsultingAndSketching': 'blue',
      'DeterminingDesignPrice': 'purple',
      'DoneDeterminingDesignPrice': 'geekblue',
      'DepositSuccessful': 'green',
      'AssignToDesigner': 'magenta',
      'DoneDesign': 'orange',
      0: 'gold',
      1: 'blue',
      2: 'purple',
      3: 'green',
      4: 'magenta',
      6: 'orange'
    };

    return colorMap[status] || 'default';
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

  // Render designer option with more details
  const renderDesignerOption = (designer) => (
    <div className="designer-option-item">
      <Space align="center">
        <Avatar 
          icon={<UserOutlined />} 
          src={designer.avatarUrl}
          style={{ backgroundColor: !designer.avatarUrl ? '#1890ff' : undefined }}
        />
        <div className="designer-info">
          <Text strong>{designer.name}</Text>
          {designer.phone && (
            <div className="designer-contact">
              <PhoneOutlined style={{ fontSize: '12px', marginRight: '4px', color: '#1890ff' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>{designer.phone}</Text>
            </div>
          )}
        </div>
      </Space>
    </div>
  );

  // Custom render option for better display of order information
  const customOrderRender = (order) => {
    const orderId = order.id;
    const customerName = order.user?.name || order.userName || 'Khách hàng';
    const formattedDate = formatDate(order.creationDate);
    const statusClass = getStatusClass(order.status);
    const statusLabel = getOrderStatusLabel(order.status);
    const statusColor = getStatusColor(order.status);
    const address = order.address?.replace(/\|/g, ', ') || 'Không có địa chỉ';

    return (
      <div className="order-option-detail">
        <div className="order-info">
          <div className="order-header">
            <Badge status="processing" text={
              <Text strong style={{ fontSize: '14px' }}>#{orderId.substring(0, 8)}</Text>
            } />
            <Tag color={statusColor} className={statusClass}>{statusLabel}</Tag>
          </div>
          <div className="order-body">
            <div className="customer-info">
              <Space align="center">
                <UserOutlined style={{ color: '#1890ff' }} />
                <Text>{customerName}</Text>
              </Space>
            </div>
            <div className="address-info">
              <Space align="start" style={{ width: '100%' }}>
                <HomeOutlined style={{ color: '#1890ff' }} />
                <Text ellipsis={{ tooltip: address }} style={{ maxWidth: 380 }}>{address}</Text>
              </Space>
            </div>
            <div className="date-info">
              <Space>
                <Badge status="default" />
                <Text type="secondary" style={{ fontSize: '12px' }}>{formattedDate}</Text>
              </Space>
            </div>
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
          {preselectedOrderId && customerName && (
            <Alert
              type="info"
              showIcon
              icon={<InfoCircleOutlined style={{ fontSize: '18px' }} />}
              message={
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  Thông tin đơn hàng được chọn
                </div>
              }
              description={
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f0f7ff',
                  borderRadius: '8px',
                  marginTop: '8px'
                }}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Badge status="processing" />
                      <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                        Mã đơn hàng: #{preselectedOrderId}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserOutlined style={{ color: '#1890ff' }} />
                      <span style={{ fontSize: '15px' }}>
                        Khách hàng: {customerName}
                      </span>
                    </div>
                    {address && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <HomeOutlined style={{ color: '#1890ff', marginTop: '4px' }} />
                        <span style={{ fontSize: '15px', flex: 1 }}>
                          Địa chỉ: {address.replace(/\|/g, ', ')}
                        </span>
                      </div>
                    )}
                  </Space>
                </div>
              }
              style={{
                border: '1px solid #91d5ff',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
            />
          )}
          
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
                onChange={handleDesignerChange}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                optionLabelProp="label"
              >
                {Array.isArray(designers) && designers.map(designer => (
                  <Option 
                    key={designer.id} 
                    value={designer.id} 
                    label={designer.name}
                  >
                    {renderDesignerOption(designer)}
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
                disabled={loadingOrders || submitting || preselectedOrderId}
                notFoundContent={loadingOrders ? <Spin size="small" /> : 'Không tìm thấy đơn hàng'}
                className="select-item order-select"
                allowClear={!preselectedOrderId}
                onChange={handleOrderChange}
                listHeight={400}
                optionLabelProp="label"
              >
                {serviceOrders.map(order => (
                  <Option 
                    key={order.id} 
                    value={order.id} 
                    label={`#${order.id.substring(0, 8)} - ${order.userName || 'Khách hàng'}`}
                  >
                    {customOrderRender(order)}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="dateAppointment"
                  label="Ngày làm việc"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                  className="form-item"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                    disabled={submitting}
                    disabledDate={(current) => {
                      // Không thể chọn ngày trong quá khứ
                      return current && current < dayjs().startOf('day');
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="timeAppointment"
                  label="Thời gian"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
                  className="form-item"
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm:ss"
                    placeholder="Chọn giờ"
                    disabled={submitting}
                    minuteStep={15}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="note"
              label="Ghi chú"
              className="form-item"
            >
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú cho công việc này (nếu có)..."
                disabled={submitting}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>

          {selectedDesigner && (
            <div className="designer-preview">
              <Divider orientation="left">Thông tin Designer được chọn</Divider>
              <Space align="center">
                <Avatar 
                  size={48}
                  icon={<UserOutlined />} 
                  src={selectedDesigner.avatarUrl}
                  style={{ backgroundColor: !selectedDesigner.avatarUrl ? '#1890ff' : undefined }}
                />
                <div>
                  <Text strong style={{ fontSize: '16px' }}>{selectedDesigner.name}</Text>
                  <div>
                    {selectedDesigner.phone && (
                      <Space style={{ marginRight: '16px' }}>
                        <PhoneOutlined style={{ color: '#1890ff' }} />
                        <Text type="secondary">{selectedDesigner.phone}</Text>
                      </Space>
                    )}
                    {selectedDesigner.email && (
                      <Space>
                        <MailOutlined style={{ color: '#1890ff' }} />
                        <Text type="secondary">{selectedDesigner.email}</Text>
                      </Space>
                    )}
                  </div>
                </div>
              </Space>
            </div>
          )}

          {selectedOrder && !preselectedOrderId && (
            <div className="order-preview">
              <Divider orientation="left">Thông tin đơn hàng được chọn</Divider>
              <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>#{selectedOrder.id}</Text>
                    <Tag color={getStatusColor(selectedOrder.status)}>
                      {getOrderStatusLabel(selectedOrder.status)}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text>{selectedOrder.userName || selectedOrder.user?.name || 'Không có thông tin'}</Text>
                  </div>
                  {selectedOrder.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <HomeOutlined style={{ color: '#1890ff', marginTop: '4px' }} />
                      <Text style={{ flex: 1 }}>{selectedOrder.address.replace(/\|/g, ', ')}</Text>
                    </div>
                  )}
                </Space>
              </div>
            </div>
          )}
        </Spin>
      </ConfigProvider>
    </Modal>
  );
};

export default AddDesignerTaskModal; 