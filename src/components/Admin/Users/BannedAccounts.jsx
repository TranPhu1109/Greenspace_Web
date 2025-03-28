import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  message,
  Card,
  Input,
  Tag,
  Modal,
} from 'antd';
import { UndoOutlined } from '@ant-design/icons';
import useUserStore from '@/stores/useUserStore';

const BannedAccounts = () => {
  const [searchText, setSearchText] = useState('');
  const { bannedUsers, isLoading, fetchBannedUsers, unbanUser } = useUserStore();

  useEffect(() => {
    fetchBannedUsers();
  }, [fetchBannedUsers]);


  const handleUnban = (userId) => {
    Modal.confirm({
      title: 'Xác nhận mở khóa',
      content: 'Bạn có chắc chắn muốn mở khóa tài khoản này?',
      okText: 'Mở khóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await unbanUser(userId);
          message.success('Mở khóa tài khoản thành công');
          fetchBannedUsers();
        } catch (error) {
          message.error('Không thể mở khóa tài khoản');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => {
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
                  marginRight: 8
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
      title: 'Vai trò',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (roleName) => (
        <Tag color={
          roleName === 'Admin' ? 'red' :
          roleName === 'Staff' ? 'green' :
          roleName === 'Designer' ? 'purple' :
          roleName === 'Accountant' ? 'blue' :
          roleName === 'Manager' ? 'orange' :
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
        <Button
          type="primary"
          icon={<UndoOutlined />}
          onClick={() => handleUnban(record.id)}
        >
          Mở khóa
        </Button>
      ),
    },
  ];

  return (
    <Card title="Danh sách tài khoản bị khóa">
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm theo tên hoặc email"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={bannedUsers
          .filter(user =>
            user.name.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase())
          )
          .map(user => ({ ...user, key: user.id }))}
        loading={isLoading}
      />
    </Card>
  );
};

export default BannedAccounts;