import React, { useState } from 'react';
import { Drawer, Typography, Space, Button, Descriptions, Tag, Badge, Divider, Timeline, Modal, message, Spin, Select, Form } from 'antd';
import { UserOutlined, FileTextOutlined, ClockCircleOutlined, EditOutlined, ExclamationCircleOutlined, CheckOutlined } from '@ant-design/icons';
import moment from 'moment';
import useScheduleStore from '@/stores/useScheduleStore';
import './styles/TaskDetailDrawer.scss';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const TaskDetailDrawer = ({ visible, task, onClose, designers }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  
  // Get functions from store
  const { updateTask, deleteTask } = useScheduleStore();
  
  // Status options for the task
  const statusOptions = [
    { value: 0, label: 'Tư vấn & phác thảo', color: 'blue' },
    { value: 1, label: 'Đã phác thảo', color: 'cyan' },
    { value: 2, label: 'Thiết kế', color: 'purple' },
    { value: 3, label: 'Đã thiết kế', color: 'green' },
    { value: 'ConsultingAndSket', label: 'Tư vấn & phác thảo', color: 'blue' },
    { value: 'DoneConsulting', label: 'Đã phác thảo', color: 'cyan' },
    { value: 'Design', label: 'Thiết kế', color: 'purple' },
    { value: 'DoneDesign', label: 'Đã thiết kế', color: 'green' },
  ];
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };
  
  // Get status display info
  const getStatusInfo = (status) => {
    const statusMap = {
      0: { text: 'Tư vấn & phác thảo', color: 'blue', status: 'processing' },
      1: { text: 'Đã phác thảo', color: 'cyan', status: 'success' },
      2: { text: 'Thiết kế', color: 'purple', status: 'processing' },
      3: { text: 'Đã thiết kế', color: 'green', status: 'success' },
      'ConsultingAndSket': { text: 'Tư vấn & phác thảo', color: 'blue', status: 'processing' },
      'DoneConsulting': { text: 'Đã phác thảo', color: 'cyan', status: 'success' },
      'Design': { text: 'Thiết kế', color: 'purple', status: 'processing' },
      'DoneDesign': { text: 'Đã thiết kế', color: 'green', status: 'success' },
    };
    return statusMap[status] || { text: `Trạng thái #${status}`, color: 'default', status: 'default' };
  };
  
  // Handle edit task button click
  const handleEdit = () => {
    form.setFieldsValue({
      userId: task.userId,
      status: task.status,
      note: task.note
    });
    setIsEditing(true);
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    form.resetFields();
  };
  
  // Save task updates
  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      setIsLoading(true);
      
      // Create update data
      const updateData = {
        userId: values.userId,
        status: values.status,
        note: values.note
      };
      
      await updateTask(task.id, updateData);
      
      message.success('Cập nhật thành công!');
      setIsEditing(false);
      onClose(true); // close with refresh
    } catch (error) {
      if (error.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin nhập vào');
      } else {
        message.error('Không thể cập nhật: ' + (error.message || 'Lỗi không xác định'));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle task deletion
  const handleDelete = () => {
    confirm({
      title: 'Xác nhận xóa task',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa task này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setIsLoading(true);
          await deleteTask(task.id);
          message.success('Đã xóa task thành công!');
          onClose(true); // close with refresh
        } catch (error) {
          message.error('Không thể xóa task: ' + (error.message || 'Lỗi không xác định'));
          setIsLoading(false);
        }
      },
    });
  };
  
  // Get designer name from their ID
  const getDesignerName = (userId) => {
    const designer = designers.find(d => d.id === userId);
    return designer ? designer.name : task.userName || 'Chưa xác định';
  };
  
  return (
    <Drawer
      title={
        <Space>
          <FileTextOutlined />
          <span>Chi tiết công việc</span>
        </Space>
      }
      width={600}
      open={visible}
      onClose={() => onClose(false)}
      className="task-detail-drawer"
      footer={
        <div className="drawer-footer">
          <Space>
            <Button onClick={() => onClose(false)}>Đóng</Button>
            {!isEditing && (
              <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                Chỉnh sửa
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <Spin spinning={isLoading}>
        {isEditing ? (
          <div className="edit-form">
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="userId"
                label="Designer"
                rules={[{ required: true, message: 'Vui lòng chọn designer' }]}
              >
                <Select placeholder="Chọn designer...">
                  {designers.map(designer => (
                    <Option key={designer.id} value={designer.id}>
                      <Space>
                        <UserOutlined />
                        {designer.name}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái...">
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      <Tag color={option.color}>{option.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="note"
                label="Ghi chú"
              >
                <Input.TextArea rows={4} placeholder="Nhập ghi chú..." />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button onClick={handleCancelEdit}>Hủy</Button>
                  <Button type="primary" onClick={handleSaveEdit} icon={<CheckOutlined />}>
                    Lưu thay đổi
                  </Button>
                  <Button type="danger" onClick={handleDelete} style={{ marginLeft: 'auto' }}>
                    Xóa task
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <div className="task-details">
            <div className="task-header">
              <Title level={4}>{task.id}</Title>
              <Space align="center">
                <Badge status={getStatusInfo(task.status).status} />
                <Tag color={getStatusInfo(task.status).color}>
                  {getStatusInfo(task.status).text}
                </Tag>
              </Space>
            </div>
            
            <Descriptions bordered column={1} className="task-description">
              <Descriptions.Item label="Designer">
                <Space>
                  <UserOutlined />
                  {getDesignerName(task.userId)}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Đơn hàng">
                {task.serviceOrder ? (
                  <Text copyable>
                    {task.serviceOrder.id}
                  </Text>
                ) : (
                  <Text type="secondary">Không có đơn hàng</Text>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày tạo">
                <Space>
                  <ClockCircleOutlined />
                  {formatDate(task.creationDate)}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Lần cập nhật cuối">
                <Space>
                  <ClockCircleOutlined />
                  {formatDate(task.modificationDate)}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Ghi chú">
                {task.note ? (
                  <Paragraph>{task.note}</Paragraph>
                ) : (
                  <Text type="secondary">Không có ghi chú</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
            
            {task.serviceOrder && (
              <>
                <Divider orientation="left">Thông tin đơn hàng</Divider>
                <Descriptions bordered column={1} className="order-description">
                  <Descriptions.Item label="Trạng thái đơn">
                    <Tag color="blue">{task.serviceOrder.status}</Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Ngày tạo đơn">
                    {formatDate(task.serviceOrder.creationDate)}
                  </Descriptions.Item>
                  
                  {task.serviceOrder.totalPrice !== undefined && (
                    <Descriptions.Item label="Tổng giá trị">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(task.serviceOrder.totalPrice)}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Spin>
    </Drawer>
  );
};

export default TaskDetailDrawer; 