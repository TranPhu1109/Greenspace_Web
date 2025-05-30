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

  // Filter refund transactions
  const refundTransactions = transactions?.filter(log => log.type === 'Refund') || [];
  
  // Sort by creationDate descending (newest first)
  const sortedRefundTransactions = [...refundTransactions].sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
  
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
      render: (text) => (
        <div
          style={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}
          title={text}
        >
          {text || 'Không có mô tả'}
        </div>
      )
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
        dataSource={sortedRefundTransactions}
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
        defaultSortOrder="descend"
        sortDirections={["descend", "ascend"]}
      />
    </div>
  );
};

export default RefundHistory; 