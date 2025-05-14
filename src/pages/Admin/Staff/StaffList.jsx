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
  Switch,
  Avatar
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
  LockOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import './StaffList.scss';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const StaffList = () => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [sortedInfo, setSortedInfo] = useState({});
  
  // Dữ liệu mẫu cho nhân viên
  const [staffData, setStaffData] = useState([
    {
      key: '1',
      name: 'Nguyễn Văn Admin',
      email: 'admin@example.com',
      phone: '0901234567',
      role: 'admin',
      department: 'Ban quản trị',
      status: 'active',
      lastLogin: '15/01/2025 08:30',
      createdAt: '10/01/2025',
    },
    {
      key: '2',
      name: 'Trần Thị Manager',
      email: 'manager@example.com',
      phone: '0912345678',
      role: 'manager',
      department: 'Quản lý cửa hàng',
      status: 'active',
      lastLogin: '14/01/2025 14:45',
      createdAt: '05/01/2025',
    },
    {
      key: '3',
      name: 'Lê Văn Staff',
      email: 'staff@example.com',
      phone: '0923456789',
      role: 'staff',
      department: 'Nhân viên bán hàng',
      status: 'active',
      lastLogin: '10/01/2025 10:15',
      createdAt: '01/01/2025',
    },
    {
      key: '4',
      name: 'Phạm Thị Support',
      email: 'support@example.com',
      phone: '0934567890',
      role: 'designer',
      department: 'Thiết kế',
      status: 'active',
      lastLogin: '16/01/2025 09:20',
      createdAt: '15/12/2024',
    },
    {
      key: '5',
      name: 'Hoàng Văn Shipper',
      email: 'shipper@example.com',
      phone: '0945678901',
      role: 'shipper',
      department: 'Giao hàng',
      status: 'inactive',
      lastLogin: '13/01/2025 16:30',
      createdAt: '20/12/2024',
    },
    {
      key: '6',
      name: 'Ngô Thị Accountant',
      email: 'accountant@example.com',
      phone: '0956789012',
      role: 'accountant',
      department: 'Kế toán',
      status: 'active',
      lastLogin: '12/01/2025 11:45',
      createdAt: '25/12/2024',
    },
  ]);

  // Hiển thị modal thêm/sửa nhân viên
  const showModal = (staff = null) => {
    setEditingStaff(staff);
    setIsModalVisible(true);
    
    if (staff) {
      form.setFieldsValue({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        department: staff.department,
        status: staff.status === 'active',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        role: 'staff',
        status: true,
      });
    }
  };

  // Xử lý khi hủy modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingStaff(null);
    form.resetFields();
  };

  // Xử lý khi submit form
  const handleSubmit = (values) => {
    const newStaff = {
      key: editingStaff ? editingStaff.key : `${staffData.length + 1}`,
      name: values.name,
      email: values.email,
      phone: values.phone,
      role: values.role,
      department: values.department,
      status: values.status ? 'active' : 'inactive',
      lastLogin: editingStaff ? editingStaff.lastLogin : '-',
      createdAt: editingStaff ? editingStaff.createdAt : dayjs().format('DD/MM/YYYY'),
    };

    if (editingStaff) {
      // Cập nhật nhân viên
      setStaffData(staffData.map(item => 
        item.key === editingStaff.key ? newStaff : item
      ));
      message.success('Cập nhật nhân viên thành công!');
    } else {
      // Thêm nhân viên mới
      setStaffData([...staffData, newStaff]);
      message.success('Thêm nhân viên thành công!');
    }

    setIsModalVisible(false);
    setEditingStaff(null);
    form.resetFields();
  };

  // Xử lý khi xóa nhân viên
  const handleDelete = (key) => {
    setStaffData(staffData.filter(item => item.key !== key));
    message.success('Xóa nhân viên thành công!');
  };

  // Xử lý khi xóa nhiều nhân viên
  const handleBulkDelete = () => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa các nhân viên đã chọn?',
      icon: <ExclamationCircleOutlined />,
      content: `Số lượng: ${selectedRowKeys.length} nhân viên`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        setStaffData(staffData.filter(item => !selectedRowKeys.includes(item.key)));
        setSelectedRowKeys([]);
        message.success('Xóa nhân viên thành công!');
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
  const filteredData = staffData.filter(item => {
    const matchSearch = !searchText || 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone.includes(searchText) ||
      item.department.toLowerCase().includes(searchText.toLowerCase());
    
    const matchRole = !filterRole || item.role === filterRole;
    const matchStatus = !filterStatus || item.status === filterStatus;
    
    return matchSearch && matchRole && matchStatus;
  });

  // Hàm lấy màu cho vai trò
  const getRoleColor = (role) => {
    const roleColors = {
      admin: 'red',
      manager: 'orange',
      staff: 'blue',
      support: 'green',
      shipper: 'purple',
      accountant: 'cyan',
      designer: 'magenta',
      contractor: 'lime'
    };
    return roleColors[role] || 'default';
  };

  // Hàm lấy tên hiển thị cho vai trò
  const getRoleName = (role) => {
    const roleNames = {
      admin: 'Admin',
      manager: 'Manager',
      staff: 'Staff',
      // support: 'Hỗ trợ khách hàng',
      // shipper: 'Nhân viên giao hàng',
      designer: 'Designer',
      accountant: 'Accountant',
      contractor: 'Contractor'
    };
    return roleNames[role] || role;
  };

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <div>
              <Text type="secondary">{record.email}</Text>
            </div>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>{getRoleName(role)}</Tag>
      ),
      filters: [
        { text: 'Quản trị viên', value: 'admin' },
        { text: 'Quản lý', value: 'manager' },
        { text: 'Nhân viên', value: 'staff' },
        { text: 'Hỗ trợ khách hàng', value: 'support' },
        { text: 'Nhân viên giao hàng', value: 'shipper' },
        { text: 'Kế toán', value: 'accountant' },
        { text: 'Đội thi công', value: 'contractor' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    // {
    //   title: 'Phòng ban',
    //   dataIndex: 'department',
    //   key: 'department',
    //   sorter: (a, b) => a.department.localeCompare(b.department),
    //   sortOrder: sortedInfo.columnKey === 'department' && sortedInfo.order,
    // },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : 'error'} 
          text={status === 'active' ? 'Hoạt động' : 'Không hoạt động'} 
        />
      ),
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
    //   sorter: (a, b) => dayjs(a.lastLogin, 'DD/MM/YYYY HH:mm').valueOf() - dayjs(b.lastLogin, 'DD/MM/YYYY HH:mm').valueOf(),
    //   sortOrder: sortedInfo.columnKey === 'lastLogin' && sortedInfo.order,
    // },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/admin/staff/${record.key}`)}
            title="Xem chi tiết"
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa nhân viên này?"
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

  return (
    <div className="staff-list-container">
      <Card className="mb-4">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4}>Quản lý nhân viên</Title>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<UserAddOutlined />}
              onClick={() => showModal()}
            >
              Thêm nhân viên
            </Button>
          </Col>
        </Row>
      </Card>
      
      <Card>
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input 
              placeholder="Tìm kiếm nhân viên..." 
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
              <Option value="admin">Quản trị viên</Option>
              <Option value="manager">Quản lý</Option>
              <Option value="staff">Nhân viên</Option>
              <Option value="designer">Nhà thiết kế</Option>
              <Option value="accountant">Kế toán</Option>
              <Option value="contractor">Đội thi công</Option>
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
                <Text>Đã chọn {selectedRowKeys.length} nhân viên</Text>
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
            showTotal: (total) => `Tổng cộng ${total} nhân viên`,
          }}
          className="staff-table"
        />
      </Card>
      
      {/* Modal thêm/sửa nhân viên */}
      <Modal
        title={editingStaff ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
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
              <Option value="admin">Quản trị viên</Option>
              <Option value="manager">Quản lý</Option>
              <Option value="staff">Nhân viên</Option>
              <Option value="designer">Nhà thiết kế</Option>
              <Option value="accountant">Kế toán</Option>
              <Option value="contractor">Đội thi công</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="department"
            label="Phòng ban"
            rules={[{ required: true, message: 'Vui lòng nhập phòng ban!' }]}
          >
            <Input prefix={<TeamOutlined />} placeholder="Nhập phòng ban" />
          </Form.Item>
          
          {!editingStaff && (
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
              {editingStaff ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffList; 