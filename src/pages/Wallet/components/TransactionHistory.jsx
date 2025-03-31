import React, { useEffect } from 'react';
import { Typography, Table, Card, Space, Tag, Badge } from 'antd';
import { HistoryOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import useWalletStore from '@/stores/useWalletStore';

const { Title, Text } = Typography;

const TransactionHistory = () => {
  const { transactions, fetchTransactions, loading } = useWalletStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text) => (
        <Badge count={text.slice(0, 8)} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'deposit' ? 'blue' : 'red'}>
          {type === 'deposit' ? 'Nạp tiền' : 'Rút tiền'}
        </Tag>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <Space>
          {record.type === 'deposit' ? (
            <ArrowUpOutlined style={{ color: '#52c41a' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
          )}
          <Text strong style={{ color: record.type === 'deposit' ? '#52c41a' : '#ff4d4f' }}>
            {amount.toLocaleString('vi-VN')} VND
          </Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ padding: '4px 8px' }}>
          {status === 'success' ? 'Thành công' : status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
        </Tag>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      render: (method) => (
        <Tag color="purple">
          {method === 'bank' ? 'Chuyển khoản' : method === 'card' ? 'Thẻ tín dụng' : method}
        </Tag>
      ),
    },
  ];

  return (
    <Card className="transaction-history">
      <div className="history-header">
        <Title level={4}>
          <HistoryOutlined /> Lịch sử giao dịch
        </Title>
      </div>
      <Table 
        loading={loading}
        columns={columns} 
        dataSource={transactions}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} giao dịch`,
        }}
        scroll={{ x: 1200 }}
        rowClassName={(record) => record.status.toLowerCase() === 'pending' ? 'highlight-row' : ''}
      />
    </Card>
  );
};

export default TransactionHistory; 