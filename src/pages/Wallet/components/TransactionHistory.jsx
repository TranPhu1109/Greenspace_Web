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
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'type',
      key: 'type',
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = status;

        switch (status) {
          case 'Success':
            color = 'success';
            text = 'Thành công';
            break;
          case 'Pending':
            color = 'processing';
            text = 'Đang xử lý';
            break;
          case 'Failed':
            color = 'error';
            text = 'Thất bại';
            break;
          default:
            color = 'default';
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <div className="transaction-history">
      
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
        />
    </div>
  );
};

export default TransactionHistory; 