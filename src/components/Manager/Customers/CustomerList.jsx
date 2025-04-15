import React, { useEffect, useState } from 'react';
import { Table, Card, Input, Button, Space, Tag, Descriptions, Spin, DatePicker, Select, Modal } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import useUserStore from '@/stores/useUserStore';

const { RangePicker } = DatePicker;
const { Option } = Select;

const CustomerList = () => {
  const { users, fetchUsers, fetchBannedUsers, isLoading, error } = useUserStore();
  const [bannedUsers, setBannedUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    status: undefined,
    dateRange: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUsers();
        const banned = await fetchBannedUsers();
        setBannedUsers(banned || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setBannedUsers([]);
      }
    };
    fetchData();
  }, [fetchUsers, fetchBannedUsers]);

  const isUserBanned = (userId) => {
    return bannedUsers?.some(user => user.id === userId) || false;
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
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
                alt={text}
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
            {text}
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
      title: 'Trạng thái',
      dataIndex: 'id',
      key: 'status',
      render: (id) => {
        const isBanned = isUserBanned(id);
        return (
          <Tag color={isBanned ? 'red' : 'green'}>
            {isBanned ? 'Không hoạt động' : 'Hoạt động'}
          </Tag>
        );
      },
    },
  ];

  const expandedRowRender = (record) => {
    const isBanned = isUserBanned(record.id);
    return (
      <Descriptions title="Thông tin chi tiết" bordered column={2}>
        <Descriptions.Item label="Họ và tên">{record.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{record.phone}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={isBanned ? 'red' : 'green'}>
            {isBanned ? 'Không hoạt động' : 'Hoạt động'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ" span={2}>
          {record.address ? record.address.replace(/\|/g, ', ') : "Chưa cập nhật"}
        </Descriptions.Item>
        {/* <Descriptions.Item label="Ngày tham gia">{record.joinDate}</Descriptions.Item> */}
        {/* <Descriptions.Item label="Số đơn hàng">{record.orderCount || 0}</Descriptions.Item> */}
      </Descriptions>
    );
  };

  const handleExport = () => {
    let filteredData = [...(users || [])];

    // Apply status filter
    if (exportFilters.status) {
      filteredData = filteredData.filter(user => {
        const isBanned = isUserBanned(user.id);
        return exportFilters.status === 'active' ? !isBanned : isBanned;
      });
    }

    // Apply date range filter
    if (exportFilters.dateRange) {
      const [startDate, endDate] = exportFilters.dateRange;
      filteredData = filteredData.filter(user => {
        const customerDate = new Date(user.joinDate);
        return customerDate >= startDate && customerDate <= endDate;
      });
    }

    // Prepare data for export
    const exportData = filteredData.map(user => {
      const isBanned = isUserBanned(user.id);
      return {
        'Họ và tên': user.name,
        'Email': user.email,
        'Số điện thoại': user.phone,
        'Trạng thái': isBanned ? 'Không hoạt động' : 'Hoạt động',
        'Địa chỉ': user.address || 'Chưa cập nhật',
        'Ngày tham gia': user.joinDate,
        'Số đơn hàng': user.orderCount || 0,
      };
    });

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

  return (
    <Card title="Danh sách khách hàng">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="Tìm kiếm theo tên hoặc email"
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
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
        dataSource={(users || [])
          .filter(user => 
            // First filter by role
            user.roleName === 'Customer' &&
            // Then filter by search text
            (user.name.toLowerCase().includes(searchText.toLowerCase()) ||
             user.email.toLowerCase().includes(searchText.toLowerCase()))
          )
          .map(user => ({ ...user, key: user.id }))}
        loading={isLoading}
        expandable={{
          expandedRowRender,
          expandRowByClick: true,
        }}
        pagination={{
          total: users?.filter(user => user.roleName === 'Customer').length || 0,
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