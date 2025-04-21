import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag,
  Tooltip,
  Modal,
  Form,
  Select,
  message
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './PendingDesignOrders.scss';
import { designOrdersData } from './data/designOrdersData';
import StatusTag from './components/StatusTag';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PendingDesignOrders = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState(
    designOrdersData.filter(order => order.status === 'pending')
  );
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form] = Form.useForm();

  // Xử lý khi click vào một đơn hàng
  const handleRowClick = (record) => {
    navigate(`/admin/design-orders/${record.id}`);
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
    
    if (!value) {
      setData(designOrdersData.filter(order => order.status === 'pending'));
      return;
    }
    
    const filteredData = designOrdersData
      .filter(order => order.status === 'pending')
      .filter(item => 
        item.orderNumber.toLowerCase().includes(value.toLowerCase()) ||
        item.customerName.toLowerCase().includes(value.toLowerCase()) ||
        item.customerEmail.toLowerCase().includes(value.toLowerCase())
      );
    
    setData(filteredData);
  };

  // Xử lý khi mở modal phân công
  const handleAssignModalOpen = (record) => {
    setSelectedOrder(record);
    setAssignModalVisible(true);
    form.resetFields();
  };

  // Xử lý khi đóng modal phân công
  const handleAssignModalClose = () => {
    setAssignModalVisible(false);
    setSelectedOrder(null);
  };

  // Xử lý khi phân công designer
  const handleAssignDesigner = () => {
    form.validateFields().then(values => {
      // Trong thực tế, đây sẽ là một API call để cập nhật dữ liệu
      message.success(`Đã phân công ${values.designer} cho đơn hàng ${selectedOrder.orderNumber}`);
      
      // Cập nhật trạng thái đơn hàng
      const updatedData = data.filter(item => item.id !== selectedOrder.id);
      setData(updatedData);
      
      setAssignModalVisible(false);
    });
  };

  // Xử lý khi từ chối đơn hàng
  const handleRejectOrder = (record) => {
    Modal.confirm({
      title: 'Từ chối đơn hàng',
      content: 'Bạn có chắc chắn muốn từ chối đơn hàng này?',
      okText: 'Từ chối',
      cancelText: 'Hủy',
      onOk: () => {
        // Trong thực tế, đây sẽ là một API call để cập nhật dữ liệu
        message.success(`Đã từ chối đơn hàng ${record.orderNumber}`);
        
        // Cập nhật trạng thái đơn hàng
        const updatedData = data.filter(item => item.id !== record.id);
        setData(updatedData);
      }
    });
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (_, record) => (
        <div className="customer-info">
          <span className="customer-name">{record.customerName}</span>
          <span className="customer-email">{record.customerEmail}</span>
        </div>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
    },
    {
      title: 'Diện tích (m²)',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: 'Giá trị (VND)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => (
        <span className="price-value">{price.toLocaleString('vi-VN')}</span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(record);
              }} 
            />
          </Tooltip>
          <Tooltip title="Phân công">
            <Button 
              type="text" 
              icon={<UserAddOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                handleAssignModalOpen(record);
              }} 
            />
          </Tooltip>
          <Tooltip title="Từ chối">
            <Button 
              type="text" 
              danger
              icon={<CloseOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                handleRejectOrder(record);
              }} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="pending-design-orders-container">
      <Card>
        <Title level={4}>Đơn đặt thiết kế chờ xử lý</Title>
        
        <Row gutter={16} className="mb-4">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              value={searchText}
              className="search-input"
            />
          </Col>
        </Row>
        
        <Table 
          columns={columns} 
          dataSource={data}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`,
          }}
          className="pending-orders-table"
          locale={{ emptyText: 'Không có đơn hàng nào đang chờ xử lý' }}
        />
      </Card>
      
      <Modal
        title="Phân công thiết kế"
        open={assignModalVisible}
        onCancel={handleAssignModalClose}
        onOk={handleAssignDesigner}
        okText="Phân công"
        cancelText="Hủy"
      >
        {selectedOrder && (
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="Mã đơn hàng"
            >
              <Input value={selectedOrder.orderNumber} disabled />
            </Form.Item>
            
            <Form.Item
              label="Khách hàng"
            >
              <Input value={selectedOrder.customerName} disabled />
            </Form.Item>
            
            <Form.Item
              name="designer"
              label="Người thiết kế"
              rules={[{ required: true, message: 'Vui lòng chọn người thiết kế' }]}
            >
              <Select placeholder="Chọn người thiết kế">
                <Option value="Nguyễn Văn A">Nguyễn Văn A</Option>
                <Option value="Trần Thị B">Trần Thị B</Option>
                <Option value="Lê Văn C">Lê Văn C</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="notes"
              label="Ghi chú"
            >
              <TextArea rows={4} placeholder="Nhập ghi chú cho người thiết kế" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default PendingDesignOrders; 