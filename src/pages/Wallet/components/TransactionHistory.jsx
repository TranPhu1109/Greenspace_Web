import React, { useEffect } from 'react';
import { Table, Tag, Spin } from 'antd';
import useWalletStore from '@/stores/useWalletStore';
import dayjs from 'dayjs';

const TransactionHistory = () => {
  const { transactions, transactionsLoading, transactionsError, fetchTransactions } = useWalletStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (transactionsLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Spin />
      </div>
    );
  }

  // if (transactionsError) {
  //   return <div className="text-red-500">{transactionsError}</div>;
  // }

  // Lọc chỉ lấy những giao dịch có type là Deposit
  const depositTransactions = transactions.filter(transaction => transaction.type === 'Deposit');

  const columns = [
    {
      title: 'Ngày giao dịch',
      dataIndex: 'creationDate',
      key: 'creationDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
      sorter: (a, b) => dayjs(a.creationDate).unix() - dayjs(b.creationDate).unix(),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount) => (
        <span className="text-green-500">
          +{Math.abs(amount).toLocaleString('vi-VN')}đ
        </span>
      ),
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      key: 'source',
      filters: [
        { text: 'VNPay', value: 'VNPay' },
        { text: 'Hệ thống', value: 'System' }
      ],
      onFilter: (value, record) => record.source === value,
      render: (source) => (
        <Tag color="purple">{source || 'Không xác định'}</Tag>
      ),
    },
    {
      title: 'Mã giao dịch',
      dataIndex: 'transactionNo',
      key: 'transactionNo',
      render: (transactionNo, record) => (
        <span className="font-mono">
          {transactionNo || 'N/A'}
          {record.txnRef && (
            <span className="text-gray-500 text-xs block">
              Mã tham chiếu: {record.txnRef}
            </span>
          )}
        </span>
      ),
    }
  ];

  return (
    <div className="transaction-history">
      <Table
        dataSource={depositTransactions}
        columns={columns}
        rowKey={(record) => `${record.transactionNo || Math.random()}-${record.txnRef || Math.random()}`}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng số ${total} giao dịch nạp tiền`,
        }}
        className="w-full"
        locale={{ emptyText: 'Không có lịch sử nạp tiền' }}
      />
    </div>
  );
};

export default TransactionHistory;