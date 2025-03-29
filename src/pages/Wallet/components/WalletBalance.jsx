import React, { useEffect } from 'react';
import { Typography, Divider } from 'antd';
import useWalletStore from '@/stores/useWalletStore';

const { Text } = Typography;

const WalletBalance = () => {
  const { balance, fetchBalance } = useWalletStore();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <>
      <div className="wallet-balance">
        <Text>Số dư hiện tại:</Text>
        <Text className="balance-amount">
          {balance.toLocaleString('vi-VN')} VNĐ
        </Text>
      </div>
      <Divider />
    </>
  );
};

export default WalletBalance; 