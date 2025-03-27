import React, { useEffect, useState } from 'react';
import { Table, Card, Input, Button, Space, Tag, Descriptions, Spin, DatePicker, Select, Modal } from 'antd';
import { SearchOutlined, UserAddOutlined, DownloadOutlined } from '@ant-design/icons';
import useCustomerStore from '../../../stores/managerStore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import useUserStore from '@/stores/useUserStore';

const { RangePicker } = DatePicker;
const { Option } = Select;

const CustomerList = () => {
  // const { customers, loading, error, fetchCustomers } = useCustomerStore();
  const {users, fetchUsers, isLoading, error }=useUserStore();
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    status: undefined,
    dateRange: undefined,
  });

  useEffect(() => {
    fetchUsers();
  }, [ fetchUsers ]);
  console.log(users);

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={record.avatar || 'https://via.placeholder.com/32'} 
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    // {
    //   title: 'Ngày tham gia',
    //   dataIndex: 'joinDate',
    //   key: 'joinDate',
    // },
  ];

  // Add expandable row configuration
  const expandedRowRender = (record) => {
    return (
      <Descriptions title="Thông tin chi tiết" bordered column={2}>
        <Descriptions.Item label="Họ và tên">{record.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{record.phone}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={record.status === 'active' ? 'green' : 'red'}>
            {record.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ" span={2}>
          {record.address || "Chưa cập nhật"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tham gia">{record.joinDate}</Descriptions.Item>
        <Descriptions.Item label="Số đơn hàng">{record.orderCount || 0}</Descriptions.Item>
      </Descriptions>
    );
  };

  if (isLoading) {
    return (
      <Card title="Danh sách khách hàng">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    console.error('Error fetching users:', error);
    // Don't return error card unless it's a critical error
    if (!users || users.length === 0) {
      return (
        <Card title="Danh sách khách hàng">
          <div style={{ textAlign: 'center', color: 'red' }}>
            Không thể tải dữ liệu khách hàng
          </div>
        </Card>
      );
    }
  }

  const handleExport = () => {
    let filteredData = [...users];

    // Apply status filter
    if (exportFilters.status) {
      filteredData = filteredData.filter(users => users.status === exportFilters.status);
    }

    // Apply date range filter
    if (exportFilters.dateRange) {
      const [startDate, endDate] = exportFilters.dateRange;
      filteredData = filteredData.filter(users => {
        const customerDate = new Date(users.joinDate);
        return customerDate >= startDate && customerDate <= endDate;
      });
    }

    // Prepare data for export
    const exportData = filteredData.map(users => ({
      'Họ và tên': users.name,
      'Email': users.email,
      'Số điện thoại': users.phone,
      'Trạng thái': users.status === 'active' ? 'Hoạt động' : 'Không hoạt động',
      'Địa chỉ': users.address || 'Chưa cập nhật',
      'Ngày tham gia': users.joinDate,
      'Số đơn hàng': users.orderCount || 0,
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file
    saveAs(data, `customers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsExportModalVisible(false);
  };

  return (
    <Card title="Danh sách khách hàng">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="Tìm kiếm theo tên hoặc email"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => {
              const searchText = e.target.value.toLowerCase();
              const filtered = users.filter(user => 
                user.name.toLowerCase().includes(searchText) ||
                user.email.toLowerCase().includes(searchText)
              );
            }}
          />
          {/* <Button type="primary" icon={<UserAddOutlined />}>
            Thêm khách hàng
          </Button> */}
          <Button 
            icon={<DownloadOutlined />}
            type="primary"
            onClick={() => setIsExportModalVisible(true)}
          >
            Xuất Excel
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={users.filter(user => user.roleName === 'Customer')}
        loading={isLoading}
        expandable={{
          expandedRowRender,
          expandRowByClick: true,
        }}
        pagination={{
          total: users.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} khách hàng`,
        }}
        rowKey="id"
      />
      <Modal
        title="Xuất danh sách khách hàng"
        open={isExportModalVisible}
        onOk={handleExport}
        onCancel={() => setIsExportModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 8 }}>Trạng thái:</div>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn trạng thái"
              onChange={(value) => setExportFilters(prev => ({ ...prev, status: value }))}
              allowClear
            >
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>Khoảng thời gian:</div>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => setExportFilters(prev => ({ ...prev, dateRange: dates }))}
            />
          </div>
        </Space>
      </Modal>
    </Card>
  );
};

export default CustomerList;