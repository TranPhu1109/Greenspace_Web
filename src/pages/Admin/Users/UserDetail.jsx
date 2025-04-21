import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Descriptions, 
  Button, 
  Space, 
  Tabs, 
  Table, 
  Tag, 
  Avatar, 
  Divider,
  Form,
  Input,
  Select,
  Switch,
  message,
  Modal,
  Empty
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  EditOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  ShoppingOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import './UserDetail.scss';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { confirm } = Modal;

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [isResetPasswordModalVisible, setIsResetPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  
  // Dữ liệu mẫu cho người dùng
  const [userData, setUserData] = useState({
    id,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0901234567',
    role: 'admin',
    status: 'active',
    lastLogin: '28/2/2025 14:30',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    address: 'Quận 1, TP.HCM',
    createdAt: '15/1/2025',
    orders: [],
  });

  // Kiểm tra xem người dùng có phải là customer hoặc guest không
  const isCustomerOrGuest = userData.role === 'customer' || userData.role === 'guest';

  // Cập nhật dữ liệu người dùng dựa trên ID
  useEffect(() => {
    // Giả lập việc lấy dữ liệu từ API
    if (id === '6') {
      setUserData({
        id,
        name: 'Trương Thị F',
        email: 'truongthif@example.com',
        phone: '0956789012',
        role: 'customer',
        status: 'active',
        lastLogin: '27/2/2025 09:15',
        avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
        address: 'Quận 6, TP.HCM',
        createdAt: '10/1/2025',
        orders: [
          {
            key: '1',
            orderNumber: 'ORD-2023-1234',
            date: '28/2/2025',
            total: '700.000 VND',
            status: 'completed',
          },
          {
            key: '2',
            orderNumber: 'ORD-2023-1235',
            date: '25/2/2025',
            total: '500.000 VND',
            status: 'processing',
          },
          {
            key: '3',
            orderNumber: 'ORD-2023-1236',
            date: '20/2/2025',
            total: '300.000 VND',
            status: 'completed',
          },
          {
            key: '4',
            orderNumber: 'ORD-2023-1237',
            date: '15/2/2025',
            total: '450.000 VND',
            status: 'completed',
          },
          {
            key: '5',
            orderNumber: 'ORD-2023-1238',
            date: '10/2/2025',
            total: '600.000 VND',
            status: 'cancelled',
          },
        ],
      });
    } else if (id === '7') {
      setUserData({
        id,
        name: 'Đỗ Văn G',
        email: 'dovang@example.com',
        phone: '0967890123',
        role: 'customer',
        status: 'active',
        lastLogin: '26/2/2025 14:20',
        avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
        address: 'Quận 7, TP.HCM',
        createdAt: '05/1/2025',
        orders: [
          {
            key: '1',
            orderNumber: 'ORD-2023-2234',
            date: '26/2/2025',
            total: '800.000 VND',
            status: 'processing',
          },
          {
            key: '2',
            orderNumber: 'ORD-2023-2235',
            date: '23/2/2025',
            total: '600.000 VND',
            status: 'completed',
          },
          {
            key: '3',
            orderNumber: 'ORD-2023-2236',
            date: '18/2/2025',
            total: '350.000 VND',
            status: 'completed',
          },
        ],
      });
    } else if (id === '8') {
      setUserData({
        id,
        name: 'Ngô Thị H',
        email: 'ngothih@example.com',
        phone: '0978901234',
        role: 'guest',
        status: 'active',
        lastLogin: '25/2/2025 11:10',
        avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
        address: 'Quận 8, TP.HCM',
        createdAt: '20/1/2025',
        orders: [
          {
            key: '1',
            orderNumber: 'ORD-2023-3234',
            date: '25/2/2025',
            total: '400.000 VND',
            status: 'pending',
          },
        ],
      });
    }
    
    // Cập nhật form với dữ liệu người dùng
    if (userData) {
      form.setFieldsValue({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        address: userData.address,
        status: userData.status === 'active',
      });
    }
  }, [id, form]);

  // Cấu hình cột cho bảng đơn hàng
  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <a onClick={() => navigate(`/admin/orders/${text.split('-')[2]}`)}>{text}</a>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = 'Không xác định';
        
        switch (status) {
          case 'completed':
            color = 'green';
            text = 'Hoàn thành';
            break;
          case 'processing':
            color = 'blue';
            text = 'Đang xử lý';
            break;
          case 'pending':
            color = 'gold';
            text = 'Chờ xác nhận';
            break;
          case 'cancelled':
            color = 'red';
            text = 'Đã hủy';
            break;
          default:
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          onClick={() => navigate(`/admin/orders/${record.orderNumber.split('-')[2]}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Bắt đầu chỉnh sửa
  const startEditing = () => {
    setIsEditing(true);
    form.setFieldsValue({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      address: userData.address,
      status: userData.status === 'active',
    });
  };

  // Hủy chỉnh sửa
  const cancelEditing = () => {
    setIsEditing(false);
  };

  // Lưu thông tin người dùng
  const saveUserInfo = () => {
    form.validateFields()
      .then(values => {
        const updatedUserData = {
          ...userData,
          name: values.name,
          email: values.email,
          phone: values.phone,
          role: values.role,
          address: values.address,
          status: values.status ? 'active' : 'inactive',
        };
        
        setUserData(updatedUserData);
        setIsEditing(false);
        message.success('Cập nhật thông tin người dùng thành công!');
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  // Mở modal đặt lại mật khẩu
  const showResetPasswordModal = () => {
    setIsResetPasswordModalVisible(true);
    passwordForm.resetFields();
  };

  // Đặt lại mật khẩu
  const handleResetPassword = () => {
    passwordForm.validateFields()
      .then(values => {
        if (values.newPassword !== values.confirmPassword) {
          message.error('Mật khẩu xác nhận không khớp!');
          return;
        }
        
        // Giả lập API call để đặt lại mật khẩu
        message.success('Đặt lại mật khẩu thành công!');
        setIsResetPasswordModalVisible(false);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  // Xác nhận xóa người dùng
  const confirmDelete = () => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa người dùng này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        // Giả lập API call để xóa người dùng
        message.success('Xóa người dùng thành công!');
        navigate('/admin/users');
      },
    });
  };

  // Dữ liệu mẫu cho lịch sử đơn hàng
  const ordersData = [
    {
      key: '1',
      orderId: 'ORD001',
      date: '01/01/2025',
      total: '1,500,000 VND',
      status: 'Đã giao',
    },
    {
      key: '2',
      orderId: 'ORD002',
      date: '05/01/2025',
      total: '2,000,000 VND',
      status: 'Đang xử lý',
    },
    // Thêm các đơn hàng khác nếu cần
  ];

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <div className="user-detail-container">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/admin/users')}
                  >
                    Quay lại
                  </Button>
                  <Title level={4} style={{ margin: 0 }}>
                    Chi tiết người dùng
                  </Title>
                </Space>
              </Col>
              <Col>
                <Space>
                  {!isEditing ? (
                    <>
                      <Button 
                        icon={<LockOutlined />}
                        onClick={showResetPasswordModal}
                      >
                        Đặt lại mật khẩu
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={startEditing}
                      >
                        Chỉnh sửa
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={cancelEditing}>
                        Hủy
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />}
                        onClick={saveUserInfo}
                      >
                        Lưu
                      </Button>
                    </>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Thông tin cá nhân" key="info">
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={8}>
                    <div className="user-profile-card">
                      <div className="user-avatar">
                        <Avatar 
                          size={120} 
                          src={userData.avatar}
                          icon={<UserOutlined />}
                        />
                      </div>
                      <div className="user-basic-info">
                        <Title level={4}>{userData.name}</Title>
                        <Tag color={userData.status === 'active' ? 'green' : 'red'}>
                          {userData.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </Tag>
                        <Tag color="blue">{userData.role}</Tag>
                        <div className="user-contact">
                          <p><MailOutlined /> {userData.email}</p>
                          <p><PhoneOutlined /> {userData.phone}</p>
                          <p><HomeOutlined /> {userData.address}</p>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={16}>
                    {!isEditing ? (
                      <Descriptions 
                        title="Thông tin chi tiết" 
                        bordered 
                        column={{ xs: 1, sm: 2 }}
                      >
                        <Descriptions.Item label="Họ tên">{userData.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{userData.phone}</Descriptions.Item>
                        <Descriptions.Item label="Vai trò">{userData.role}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{userData.address}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <Tag color={userData.status === 'active' ? 'green' : 'red'}>
                            {userData.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">{userData.createdAt}</Descriptions.Item>
                        <Descriptions.Item label="Đăng nhập gần nhất">{userData.lastLogin}</Descriptions.Item>
                        {isCustomerOrGuest && (
                          <Descriptions.Item label="Số đơn hàng">{userData.orders.length}</Descriptions.Item>
                        )}
                      </Descriptions>
                    ) : (
                      <Form
                        form={form}
                        layout="vertical"
                      >
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="name"
                              label="Họ tên"
                              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                            >
                              <Input placeholder="Nhập họ tên" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="email"
                              label="Email"
                              rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                              ]}
                            >
                              <Input placeholder="Nhập email" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="phone"
                              label="Số điện thoại"
                              rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                              ]}
                            >
                              <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="role"
                              label="Vai trò"
                              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                            >
                              <Select placeholder="Chọn vai trò">
                                <Option value="admin">Admin</Option>
                                <Option value="manager">Manager</Option>
                                <Option value="staff">Staff</Option>
                                <Option value="accountant">Accountant</Option>
                                <Option value="designer">Designer</Option>
                                <Option value="customer">Customer</Option>
                                <Option value="guest">Guest</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col span={24}>
                            <Form.Item
                              name="address"
                              label="Địa chỉ"
                            >
                              <Input placeholder="Nhập địa chỉ" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col span={12}>
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
                          </Col>
                        </Row>
                      </Form>
                    )}
                  </Col>
                </Row>
              </TabPane>
              
              {isCustomerOrGuest && (
                <TabPane tab="Đơn hàng" key="orders" className="user-orders-tab">
                  {userData.orders.length > 0 ? (
                    <Table 
                      columns={orderColumns} 
                      dataSource={userData.orders} 
                      pagination={false}
                    />
                  ) : (
                    <Empty description="Không có đơn hàng nào" />
                  )}
                </TabPane>
              )}
            </Tabs>
          </Card>
        </Col>
      </Row>
      
      {/* Modal đặt lại mật khẩu */}
      <Modal
        title="Đặt lại mật khẩu"
        visible={isResetPasswordModalVisible}
        onCancel={() => setIsResetPasswordModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsResetPasswordModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleResetPassword}>
            Đặt lại
          </Button>,
        ]}
      >
        <Form
          form={passwordForm}
          layout="vertical"
        >
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu" />
          </Form.Item>
        </Form>
      </Modal>
      
      <Card style={{ marginTop: 20 }}>
        <Title level={4}>Lịch sử đơn hàng</Title>
        <Table 
          columns={columns} 
          dataSource={ordersData} 
          pagination={false} 
        />
      </Card>
    </div>
  );
};

export default UserDetail; 