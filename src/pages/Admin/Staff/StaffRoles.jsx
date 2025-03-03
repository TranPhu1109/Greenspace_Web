import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Modal, 
  Form, 
  Input, 
  Checkbox, 
  message, 
  Popconfirm,
  Tag,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './StaffRoles.scss';

const { Title, Text } = Typography;
const { confirm } = Modal;

const StaffRoles = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();
  
  // Dữ liệu mẫu cho vai trò
  const [rolesData, setRolesData] = useState([
    {
      key: '1',
      name: 'Admin',
      description: 'Quản trị viên hệ thống với toàn quyền truy cập',
      users: 2,
      permissions: [
        'dashboard_view', 'dashboard_edit',
        'users_view', 'users_create', 'users_edit', 'users_delete',
        'products_view', 'products_create', 'products_edit', 'products_delete',
        'orders_view', 'orders_create', 'orders_edit', 'orders_delete',
        'staff_view', 'staff_create', 'staff_edit', 'staff_delete',
        'settings_view', 'settings_edit'
      ],
    },
    {
      key: '2',
      name: 'Manager',
      description: 'Quản lý với quyền truy cập hạn chế vào các tính năng quản trị',
      users: 3,
      permissions: [
        'dashboard_view',
        'users_view',
        'products_view', 'products_create', 'products_edit',
        'orders_view', 'orders_create', 'orders_edit',
        'staff_view',
        'settings_view'
      ],
    },
    {
      key: '3',
      name: 'Staff',
      description: 'Nhân viên với quyền truy cập cơ bản',
      users: 5,
      permissions: [
        'dashboard_view',
        'products_view',
        'orders_view', 'orders_create',
      ],
    },
    {
      key: '4',
      name: 'Designer',
      description: 'Nhà thiết kế với quyền truy cập vào sản phẩm',
      users: 2,
      permissions: [
        'dashboard_view',
        'products_view', 'products_create', 'products_edit',
      ],
    },
    {
      key: '5',
      name: 'Accountant',
      description: 'Kế toán với quyền truy cập vào đơn hàng và báo cáo',
      users: 1,
      permissions: [
        'dashboard_view',
        'orders_view',
        'reports_view',
      ],
    },
  ]);

  // Danh sách quyền
  const permissionsList = [
    { label: 'Xem tổng quan', value: 'dashboard_view' },
    { label: 'Chỉnh sửa tổng quan', value: 'dashboard_edit' },
    { label: 'Xem người dùng', value: 'users_view' },
    { label: 'Thêm người dùng', value: 'users_create' },
    { label: 'Sửa người dùng', value: 'users_edit' },
    { label: 'Xóa người dùng', value: 'users_delete' },
    { label: 'Xem sản phẩm', value: 'products_view' },
    { label: 'Thêm sản phẩm', value: 'products_create' },
    { label: 'Sửa sản phẩm', value: 'products_edit' },
    { label: 'Xóa sản phẩm', value: 'products_delete' },
    { label: 'Xem đơn hàng', value: 'orders_view' },
    { label: 'Tạo đơn hàng', value: 'orders_create' },
    { label: 'Sửa đơn hàng', value: 'orders_edit' },
    { label: 'Xóa đơn hàng', value: 'orders_delete' },
    { label: 'Xem nhân viên', value: 'staff_view' },
    { label: 'Thêm nhân viên', value: 'staff_create' },
    { label: 'Sửa nhân viên', value: 'staff_edit' },
    { label: 'Xóa nhân viên', value: 'staff_delete' },
    { label: 'Xem báo cáo', value: 'reports_view' },
    { label: 'Xem cài đặt', value: 'settings_view' },
    { label: 'Sửa cài đặt', value: 'settings_edit' },
  ];

  // Hiển thị modal thêm/sửa vai trò
  const showModal = (role = null) => {
    setEditingRole(role);
    setIsModalVisible(true);
    
    if (role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
    } else {
      form.resetFields();
    }
  };

  // Xử lý khi hủy modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRole(null);
    form.resetFields();
  };

  // Xử lý khi submit form
  const handleSubmit = (values) => {
    const newRole = {
      key: editingRole ? editingRole.key : `${rolesData.length + 1}`,
      name: values.name,
      description: values.description,
      users: editingRole ? editingRole.users : 0,
      permissions: values.permissions,
    };

    if (editingRole) {
      // Cập nhật vai trò
      setRolesData(rolesData.map(item => 
        item.key === editingRole.key ? newRole : item
      ));
      message.success('Cập nhật vai trò thành công!');
    } else {
      // Thêm vai trò mới
      setRolesData([...rolesData, newRole]);
      message.success('Thêm vai trò thành công!');
    }

    setIsModalVisible(false);
    setEditingRole(null);
    form.resetFields();
  };

  // Xử lý khi xóa vai trò
  const handleDelete = (key) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa vai trò này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        setRolesData(rolesData.filter(item => item.key !== key));
        message.success('Xóa vai trò thành công!');
      },
    });
  };

  // Cấu hình cột cho bảng vai trò
  const columns = [
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Số người dùng',
      dataIndex: 'users',
      key: 'users',
      render: (users) => <Tag color="blue">{users}</Tag>,
    },
    {
      title: 'Quyền hạn',
      key: 'permissions',
      render: (_, record) => (
        <div className="permissions-tags">
          {record.permissions.length > 3 ? (
            <>
              {record.permissions.slice(0, 3).map(perm => {
                const permLabel = permissionsList.find(p => p.value === perm)?.label || perm;
                return <Tag key={perm}>{permLabel}</Tag>;
              })}
              <Tag color="processing">+{record.permissions.length - 3}</Tag>
            </>
          ) : (
            record.permissions.map(perm => {
              const permLabel = permissionsList.find(p => p.value === perm)?.label || perm;
              return <Tag key={perm}>{permLabel}</Tag>;
            })
          )}
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa vai trò này?"
            onConfirm={() => handleDelete(record.key)}
            okText="Xóa"
            cancelText="Hủy"
            disabled={record.name === 'Admin'}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              title="Xóa"
              disabled={record.name === 'Admin'}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Nhóm quyền theo module
  const permissionGroups = [
    {
      title: 'Tổng quan',
      permissions: ['dashboard_view', 'dashboard_edit'],
    },
    {
      title: 'Người dùng',
      permissions: ['users_view', 'users_create', 'users_edit', 'users_delete'],
    },
    {
      title: 'Sản phẩm',
      permissions: ['products_view', 'products_create', 'products_edit', 'products_delete'],
    },
    {
      title: 'Đơn hàng',
      permissions: ['orders_view', 'orders_create', 'orders_edit', 'orders_delete'],
    },
    {
      title: 'Nhân viên',
      permissions: ['staff_view', 'staff_create', 'staff_edit', 'staff_delete'],
    },
    {
      title: 'Báo cáo',
      permissions: ['reports_view'],
    },
    {
      title: 'Cài đặt',
      permissions: ['settings_view', 'settings_edit'],
    },
  ];

  return (
    <div className="staff-roles-container">
      <Card className="mb-4">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/staff')}
              >
                Quay lại
              </Button>
              <Title level={4} style={{ margin: 0 }}>Phân quyền nhân viên</Title>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Thêm vai trò
            </Button>
          </Col>
        </Row>
      </Card>
      
      <Card>
        <Table 
          columns={columns} 
          dataSource={rolesData} 
          pagination={false}
          className="roles-table"
        />
      </Card>
      
      {/* Modal thêm/sửa vai trò */}
      <Modal
        title={editingRole ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên vai trò"
            rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}
          >
            <Input placeholder="Nhập tên vai trò" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả vai trò!' }]}
          >
            <Input.TextArea placeholder="Nhập mô tả vai trò" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="permissions"
            label="Quyền hạn"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một quyền!' }]}
          >
            <div className="permissions-groups">
              {permissionGroups.map(group => (
                <div key={group.title} className="permission-group">
                  <Divider orientation="left">{group.title}</Divider>
                  <Checkbox.Group>
                    <Row>
                      {permissionsList
                        .filter(perm => group.permissions.includes(perm.value))
                        .map(perm => (
                          <Col span={12} key={perm.value}>
                            <Checkbox value={perm.value}>{perm.label}</Checkbox>
                          </Col>
                        ))
                      }
                    </Row>
                  </Checkbox.Group>
                </div>
              ))}
            </div>
          </Form.Item>
          
          <Form.Item className="form-actions">
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingRole ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffRoles; 