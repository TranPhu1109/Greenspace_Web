import React, { useEffect, useCallback } from 'react';
import { Typography, Divider, Spin } from 'antd';
import useWalletStore from '@/stores/useWalletStore';

const { Text } = Typography;

const WalletBalance = () => {
  const { balance, loading, error, fetchBalance } = useWalletStore();

  const loadWalletData = useCallback(async () => {
    try {
      await fetchBalance();
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  }, [fetchBalance]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  console.log('Current balance state:', { balance, loading, error });

  if (loading) {
    return (
      <div className="wallet-balance flex items-center justify-center py-4">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-balance text-red-500">
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    <>
      <div className="wallet-balance">
        <Text>Số dư hiện tại:</Text>
        <Text className="balance-amount">
          {(balance ?? 0).toLocaleString('vi-VN')} VNĐ
        </Text>
      </div>
      <Divider />
    </>
  );
};

export default WalletBalance; 