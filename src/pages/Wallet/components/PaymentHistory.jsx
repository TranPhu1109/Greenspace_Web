import React, { useEffect } from 'react';
import { Table, Tag, Spin, Typography } from 'antd';
import useWalletStore from '@/stores/useWalletStore';
import dayjs from 'dayjs';

const { Text } = Typography;

const PaymentHistory = () => {
  const { bills, transactions, loading, error, fetchBalance, fetchTransactions } = useWalletStore();

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Spin />
      </div>
    );
  }

  // if (error) {
  //   return <div className="text-red-500">{error}</div>;
  // }
  console.log(bills);
  // Format service order ID for display
  const formatServiceOrderId = (id) => {
    if (!id) return 'Không có mã đơn';
    return `#${id.substring(0, 8)}`;
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'serviceOrderId',
      key: 'serviceOrderId',
      render: (serviceOrderId, record) => {
        // Ưu tiên hiển thị serviceOrderId (đơn dịch vụ), nếu không có thì hiển thị orderId (đơn sản phẩm)
        const idToShow = serviceOrderId || record.orderId;
        const idType = serviceOrderId ? 'Dịch vụ' : 'Sản phẩm';
        
        return idToShow ? (
          <Text copyable={{ text: idToShow }} strong>
            #{idToShow.slice(0, 8)}... ({idType})
          </Text>
        ) : (
          <Text type="secondary">Không có mã đơn hàng</Text>
        );
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => <span title={text}>{text || 'Không có mô tả'}</span>
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount) => (
        <span className="text-blue-500">
          {Math.abs(amount).toLocaleString('vi-VN')}đ
        </span>
      ),
    },
    {
      title: 'Loại',
      key: 'type',
      render: (_, record) => {
        const isDeposit = record.description && record.description.includes('cọc');
        const isFinalPayment = record.description && record.description.includes('còn lại');
        
        let color = 'blue';
        let text = 'Thanh toán';
        
        if (isDeposit) {
          color = 'gold';
          text = 'Đặt cọc';
        } else if (isFinalPayment) {
          color = 'green';
          text = 'Thanh toán cuối';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    }
  ];

  return (
    <div className="payment-history">
      <Table
        dataSource={bills || []}
        columns={columns}
        rowKey={(record, index) => `${record.serviceOrderId || ''}-${index}`}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng số ${total} thanh toán`,
        }}
        className="w-full"
        locale={{ emptyText: 'Không có lịch sử thanh toán' }}
      />
    </div>
  );
};

export default PaymentHistory; 