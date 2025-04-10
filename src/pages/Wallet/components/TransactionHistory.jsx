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

  if (transactionsError) {
    return <div className="text-red-500">{transactionsError}</div>;
  }

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
      title: 'Loại giao dịch',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Nạp tiền', value: 'Deposit' },
        { text: 'Thanh toán', value: 'Payment' },
        { text: 'Hoàn tiền', value: 'Refund' }
      ],
      onFilter: (value, record) => record.type === value,
      render: (type) => {
        let color = 'blue';
        let text = type;

        switch (type) {
          case 'Deposit':
            color = 'green';
            text = 'Nạp tiền';
            break;
          case 'Payment':
            color = 'blue';
            text = 'Thanh toán';
            break;
          case 'Refund':
            color = 'orange';
            text = 'Hoàn tiền';
            break;
          default:
            color = 'default';
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount, record) => {
        const isPositive = record.type === 'Deposit' || record.type === 'Refund';
        return (
          <span className={isPositive ? 'text-green-500' : 'text-blue-500'}>
            {isPositive ? '+' : '-'}{Math.abs(amount).toLocaleString('vi-VN')}đ
          </span>
        );
      },
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
        <Tag color="purple">{source}</Tag>
      ),
    },
    {
      title: 'Mã giao dịch',
      dataIndex: 'transactionNo',
      key: 'transactionNo',
      render: (transactionNo, record) => (
        <span className="font-mono">
          {transactionNo}
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
        dataSource={transactions}
        columns={columns}
        rowKey={(record) => `${record.transactionNo}-${record.txnRef}`}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng số ${total} giao dịch`,
        }}
        className="w-full"
      />
    </div>
  );
};

export default TransactionHistory;