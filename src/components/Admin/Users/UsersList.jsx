import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Card,
  Input,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useUserStore from '../../../stores/useUserStore';
import CreateUserModal from './components/CreateUserModal';

// Add delete handler in UsersList component
const UsersList = () => {
  const { users, isLoading, fetchUsers } = useUserStore();
  const [searchText, setSearchText] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
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
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const handleCreateUser = async (values) => {
    try {
      await useUserStore.getState().createUser(values);
      message.success('Tạo người dùng mới thành công');
      setCreateModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + error.message);
    }
  };

  const handleDelete = (user) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa người dùng "${user.name}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await useUserStore.getState().deleteUser(user.id);
          message.success('Xóa người dùng thành công');
          fetchUsers();
        } catch (error) {
          message.error('Có lỗi xảy ra: ' + error.message);
        }
      },
    });
  };

  return (
    <Card
      title="Quản lý người dùng"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Thêm người dùng
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm theo tên hoặc email"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={users
          .filter(
            (user) =>
              user.name.toLowerCase().includes(searchText.toLowerCase()) ||
              user.email.toLowerCase().includes(searchText.toLowerCase())
          )
          .map((user) => ({ ...user, key: user.id }))}
        loading={isLoading}
      />

      <CreateUserModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateUser}
      />
    </Card>
  );
};

export default UsersList;