import React, { useEffect, useState } from 'react';
import { Table, Card, Input, Button, Space, Tag, Descriptions, Select, Spin } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import useManagerStore from '../../../stores/managerStore';

const { Option } = Select;

const EmployeeList = () => {
  const { employees, employeesLoading, employeesError, fetchEmployees } = useManagerStore();
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={record.avatar} 
            alt={text}
            style={{ width: 32, height: 32, borderRadius: '50%' }}
          />
          <span>{text}</span>
        </div>
      ),
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
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleColors = {
          staff: 'blue',
          accountant: 'purple',
          designer: 'green'
        };
        const roleNames = {
          staff: 'Nhân viên bán hàng',
          accountant: 'Kế toán',
          designer: 'Thiết kế viên'
        };
        return <Tag color={roleColors[role]}>{roleNames[role]}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Đang làm việc' : 'Đã nghỉ việc'}
        </Tag>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <Descriptions title="Thông tin chi tiết" bordered column={2}>
        <Descriptions.Item label="Họ và tên">{record.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{record.phone}</Descriptions.Item>
        <Descriptions.Item label="Vai trò">
          {record.role === 'staff' && 'Nhân viên bán hàng'}
          {record.role === 'accountant' && 'Kế toán'}
          {record.role === 'designer' && 'Thiết kế viên'}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ" span={2}>
          {record.address}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày vào làm">{record.joinDate}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={record.status === 'active' ? 'green' : 'red'}>
            {record.status === 'active' ? 'Đang làm việc' : 'Đã nghỉ việc'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const filteredEmployees = employees.filter(employee => {
    const matchSearch = searchText ? 
      employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchText.toLowerCase()) : true;
    const matchRole = roleFilter ? employee.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  if (employeesLoading) {
    return (
      <Card title="Danh sách nhân viên">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (employeesError) {
    return (
      <Card title="Danh sách nhân viên">
        <div style={{ textAlign: 'center', color: 'red' }}>
          Error: {employeesError}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Danh sách nhân viên">
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Tìm kiếm nhân viên"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Lọc theo vai trò"
            style={{ width: 200 }}
            onChange={setRoleFilter}
            allowClear
          >
            <Option value="staff">Nhân viên bán hàng</Option>
            <Option value="accountant">Kế toán</Option>
            <Option value="designer">Thiết kế viên</Option>
          </Select>
          <Button type="primary" icon={<UserAddOutlined />}>
            Thêm nhân viên
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={filteredEmployees}
        expandable={{
          expandedRowRender,
          expandRowByClick: true,
        }}
        pagination={{
          total: filteredEmployees.length,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} nhân viên`,
        }}
        rowKey="id"
      />
    </Card>
  );
};

export default EmployeeList;