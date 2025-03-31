import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Card,
  Input,
  Tag,
  Select,
  Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BlockOutlined, StopOutlined } from '@ant-design/icons';
import useUserStore from '../../../stores/useUserStore';
import CreateUserModal from './components/CreateUserModal';

const StaffList = () => {
  const { users, isLoading, fetchUsers, banUser } = useUserStore();
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);


  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const roles = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Accountant', label: 'Accountant' },
    { value: 'Staff', label: 'Staff' },
    { value: 'Designer', label: 'Designer' },
  ];

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => {
        // Generate a consistent color based on email
        const stringToColor = (str) => {
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
          }
          const color = '#' + ('00000' + (hash & 0xFFFFFF).toString(16)).slice(-6);
          return color;
        };

        const avatarColor = stringToColor(record.email);

        return (
          <Space>
            {record.avatarUrl ? (
              <img
                src={record.avatarUrl}
                alt={name}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  marginRight: 8
                }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: avatarColor,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 0
                }}
              >
                {record.email.charAt(0).toUpperCase()}
              </div>
            )}
            {name}
          </Space>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Vai trò',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (roleName) => (
        <Tag color={
          roleName === 'Admin' ? 'red' :
          roleName === 'Staff' ? 'green' :
          roleName === 'Designer' ? 'purple' :
          roleName === 'Accountant' ? 'blue' :
          roleName === 'Manager'? 'orange' :
          'default'
        }>
          {roleName}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          />
           <Tooltip
            title="Vô hiệu hóa tài khoản"
          >
            <Button
              type="text"
              danger
              icon={<StopOutlined />}
              onClick={() => handleBanUser(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleCreateUser = async (values) => {
    setCreateLoading(true);
    try {
      await useUserStore.getState().createUser(values);
      message.success('Tạo người dùng mới thành công');
      setCreateModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleBanUser = (user) => {
    Modal.confirm({
      title: 'Xác nhận vô hiệu hóa tài khoản',
      content: `Bạn có chắc chắn muốn vô hiệu hóa tài khoản nhân viên "${user.name}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await banUser(user.id);
          message.success('Xóa nhân viên thành công');
          fetchUsers();
        } catch (error) {
          message.error('Có lỗi xảy ra: ' + error.message);
        }
      },
    });
  };

  const handleEdit = (user) => {
    // Implement edit functionality
    console.log('Edit user:', user);
  };

  return (
    <Card
      title="Quản lý nhân viên"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setCreateModalVisible(true)}}
        >
          Thêm nhân viên
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm theo tên hoặc email"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300, marginRight: 16 }}
        />
        <Select
          defaultValue="all"
          style={{ width: 200 }}
          onChange={setSelectedRole}
          options={roles}
        />
      </div>

      <Table
        columns={columns}
        dataSource={users
          .filter(user => 
            user.roleName !== 'Customer' &&
            (selectedRole === 'all' || user.roleName === selectedRole) &&
            (user.name.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase()))
          )
          .map((user) => ({ ...user, key: user.id }))}
        loading={isLoading}
      />
      <CreateUserModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateUser}
        loading={createLoading}
      />
    </Card>
  );
};

export default StaffList;