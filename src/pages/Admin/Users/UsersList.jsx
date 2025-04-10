import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Badge, 
  Dropdown, 
  Menu,
  Row,
  Col,
  Card,
  Typography,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tooltip,
  Switch
} from 'antd';
import { 
  SearchOutlined, 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined, 
  EyeOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import './UsersList.scss';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const UsersList = () => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [sortedInfo, setSortedInfo] = useState({});
  
  // Dữ liệu mẫu cho người dùng
  const [usersData, setUsersData] = useState([
    {
      key: '1',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
      role: 'customer',
      status: 'active',
      orders: 5,
      lastLogin: '15/01/2025 08:30',
      createdAt: '10/01/2025',
    },
    {
      key: '2',
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0912345678',
      role: 'customer',
      status: 'active',
      orders: 3,
      lastLogin: '14/01/2025 14:45',
      createdAt: '05/01/2025',
    },
    {
      key: '3',
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      phone: '0923456789',
      role: 'guest',
      status: 'inactive',
      orders: 0,
      lastLogin: '10/01/2025 10:15',
      createdAt: '01/01/2025',
    },
    {
      key: '4',
      name: 'Phạm Thị D',
      email: 'phamthid@example.com',
      phone: '0934567890',
      role: 'customer',
      status: 'active',
      orders: 8,
      lastLogin: '16/01/2025 09:20',
      createdAt: '15/12/2024',
    },
    {
      key: '5',
      name: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      phone: '0945678901',
      role: 'customer',
      status: 'active',
      orders: 2,
      lastLogin: '13/01/2025 16:30',
      createdAt: '20/12/2024',
    },
    {
      key: '6',
      name: 'Ngô Thị F',
      email: 'ngothif@example.com',
      phone: '0956789012',
      role: 'guest',
      status: 'active',
      orders: 0,
      lastLogin: '12/01/2025 11:45',
      createdAt: '25/12/2024',
    },
  ]);

  // Hiển thị modal thêm/sửa người dùng
  const showModal = (user = null) => {
    setEditingUser(user);
    setIsModalVisible(true);
    
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status === 'active',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        role: 'customer',
        status: true,
      });
    }
  };

  // Xử lý khi hủy modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  // Xử lý khi submit form
  const handleSubmit = (values) => {
    const newUser = {
      key: editingUser ? editingUser.key : `${usersData.length + 1}`,
      name: values.name,
      email: values.email,
      phone: values.phone,
      role: values.role,
      status: values.status ? 'active' : 'inactive',
      orders: editingUser ? editingUser.orders : 0,
      lastLogin: editingUser ? editingUser.lastLogin : '-',
      createdAt: editingUser ? editingUser.createdAt : moment().format('DD/MM/YYYY'),
    };

    if (editingUser) {
      // Cập nhật người dùng
      setUsersData(usersData.map(item => 
        item.key === editingUser.key ? newUser : item
      ));
      message.success('Cập nhật người dùng thành công!');
    } else {
      // Thêm người dùng mới
      setUsersData([...usersData, newUser]);
      message.success('Thêm người dùng thành công!');
    }

    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  // Xử lý khi xóa người dùng
  const handleDelete = (key) => {
    setUsersData(usersData.filter(item => item.key !== key));
    message.success('Xóa người dùng thành công!');
  };

  // Xử lý khi xóa nhiều người dùng
  const handleBulkDelete = () => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa các người dùng đã chọn?',
      icon: <ExclamationCircleOutlined />,
      content: `Số lượng: ${selectedRowKeys.length} người dùng`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        setUsersData(usersData.filter(item => !selectedRowKeys.includes(item.key)));
        setSelectedRowKeys([]);
        message.success('Xóa người dùng thành công!');
      },
    });
  };

  // Xử lý khi tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Xử lý khi lọc theo vai trò
  const handleFilterRole = (value) => {
    setFilterRole(value);
  };

  // Xử lý khi lọc theo trạng thái
  const handleFilterStatus = (value) => {
    setFilterStatus(value);
  };

  // Xử lý khi sắp xếp
  const handleSort = (sorter) => {
    setSortedInfo(sorter);
  };

  // Lọc dữ liệu theo điều kiện tìm kiếm và lọc
  const filteredData = usersData.filter(item => {
    const matchSearch = !searchText || 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone.includes(searchText);
    
    const matchRole = !filterRole || item.role === filterRole;
    const matchStatus = !filterStatus || item.status === filterStatus;
    
    return matchSearch && matchRole && matchStatus;
  });

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'Tên người dùng',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="user-info">
          <div className="user-avatar">
            {/* {record.name.charAt(0).toUpperCase()} */}
          </div>
          <div className="user-details">
            <Text strong>{record.name}</Text>
            <div className="user-contact">
              <Text type="secondary"><MailOutlined /> {record.email}</Text><br/>
              <Text type="secondary"><PhoneOutlined /> {record.phone}</Text>
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = role === 'customer' ? 'blue' : 'purple';
        let text = role === 'customer' ? 'Khách hàng' : 'Khách vãng lai';
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Khách hàng', value: 'customer' },
        { text: 'Khách vãng lai', value: 'guest' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'orders',
      key: 'orders',
      sorter: (a, b) => a.orders - b.orders,
      sortOrder: sortedInfo.columnKey === 'orders' && sortedInfo.order,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'active' ? 'green' : 'red';
        let text = status === 'active' ? 'Hoạt động' : 'Không hoạt động';
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Không hoạt động', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    // {
    //   title: 'Đăng nhập gần nhất',
    //   dataIndex: 'lastLogin',
    //   key: 'lastLogin',
    //   sorter: (a, b) => {
    //     if (a.lastLogin === '-') return 1;
    //     if (b.lastLogin === '-') return -1;
    //     return moment(a.lastLogin, 'DD/MM/YYYY HH:mm').diff(moment(b.lastLogin, 'DD/MM/YYYY HH:mm'));
    //   },
    //   sortOrder: sortedInfo.columnKey === 'lastLogin' && sortedInfo.order,
    // },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => moment(a.createdAt, 'DD/MM/YYYY').diff(moment(b.createdAt, 'DD/MM/YYYY')),
      sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/admin/users/${record.key}`)}
            title="Xem chi tiết"
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.key)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Cấu hình chọn hàng
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  // Cấu hình tải lên hình ảnh
  const uploadProps = {
    beforeUpload: () => false,
    onChange: (info) => {
      console.log('File changed:', info.file, info.fileList);
    },
  };

  return (
    <div className="users-list-container">
      <Card className="mb-4">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4}>Quản lý khách hàng</Title>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<UserAddOutlined />}
              onClick={() => showModal()}
            >
              Thêm khách hàng
            </Button>
          </Col>
        </Row>
      </Card>
      
      <Card>
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input 
              placeholder="Tìm kiếm khách hàng..." 
              prefix={<SearchOutlined />} 
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Lọc theo vai trò"
              style={{ width: '100%' }}
              allowClear
              onChange={handleFilterRole}
            >
              <Option value="customer">Khách hàng</Option>
              <Option value="guest">Khách vãng lai</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              allowClear
              onChange={handleFilterStatus}
            >
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </Col>
        </Row>
        
        {selectedRowKeys.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Space>
                <Text>Đã chọn {selectedRowKeys.length} khách hàng</Text>
                <Button 
                  type="primary" 
                  danger 
                  onClick={handleBulkDelete}
                >
                  Xóa đã chọn
                </Button>
                <Button 
                  onClick={() => setSelectedRowKeys([])}
                >
                  Bỏ chọn
                </Button>
              </Space>
            </Col>
          </Row>
        )}
        
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          onChange={(pagination, filters, sorter) => handleSort(sorter)}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} khách hàng`,
          }}
          className="users-table"
        />
      </Card>
      
      {/* Modal thêm/sửa người dùng */}
      <Modal
        title={editingUser ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập họ tên" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Nhập email" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="customer">Khách hàng</Option>
              <Option value="guest">Khách vãng lai</Option>
            </Select>
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}
          
          <Form.Item
            name="status"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Hoạt động" 
              unCheckedChildren="Không hoạt động" 
            />
          </Form.Item>
          
          <Form.Item className="form-actions">
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingUser ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersList; 