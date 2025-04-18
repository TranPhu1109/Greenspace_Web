import React, { useEffect } from 'react';
import { Table, Tag, Spin, Typography } from 'antd';
import useWalletStore from '@/stores/useWalletStore';
import dayjs from 'dayjs';

const { Text } = Typography;

const RefundHistory = () => {
  const { transactions, loading, error, fetchTransactions } = useWalletStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  console.log(transactions);

  // Filter refund transactions
  const refundTransactions = transactions?.filter(log => log.type === 'Refund') || [];
  

  console.log(refundTransactions);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Spin />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const columns = [
    {
      title: 'Nguồn gốc',
      dataIndex: 'source',
      key: 'source',
      ellipsis: true,
      render: (text) => <span title={text}>{text || 'Không có mô tả'}</span>
    },
    {
      title: 'Mã giao dịch',
      dataIndex: 'txnRef',
      key: 'txnRef',
      render: (txnRef) => txnRef ? <Typography.Text copyable>{txnRef}</Typography.Text> : 'N/A',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount) => (
        <span className="text-green-500">
          {Math.abs(amount).toLocaleString('vi-VN')}đ
        </span>
      ),
    },
    {
      title: 'Ngày hoàn tiền',
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: (a, b) => new Date(b.creationDate) - new Date(a.creationDate),
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Loại',
      key: 'type',
      render: () => <Tag color="gold">Hoàn tiền</Tag>
    }
  ];

  return (
    <div className="refund-history">
      <Table
        dataSource={refundTransactions}
        columns={columns}
        rowKey={(record, index) => `${record.txnRef || ''}-${index}`}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng số ${total} giao dịch hoàn tiền`,
        }}
        className="w-full"
        locale={{ emptyText: 'Không có lịch sử hoàn tiền' }}
      />
    </div>
  );
};

export default RefundHistory; 