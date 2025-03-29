import React, { useEffect } from 'react';
import { Typography, Table } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import useWalletStore from '@/stores/useWalletStore';

const { Title, Text } = Typography;

const TransactionHistory = () => {
  const { transactions, fetchTransactions, loading } = useWalletStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => (
        <Text style={{ color: text.includes('+') ? '#52c41a' : '#ff4d4f' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
    },
  ];

  return (
    <div className="transaction-history">
      <div className="history-header">
        <Title level={4}>
          <HistoryOutlined /> Lịch sử giao dịch
        </Title>
        <div className="history-filters">
          {/* Add filters here if needed */}
        </div>
      </div>
      <Table 
        loading={loading}
        columns={columns} 
        dataSource={transactions}
        pagination={{ pageSize: 5 }}
        className="history-table"
      />
    </div>
  );
};

export default TransactionHistory; 