import React, { useEffect, useState } from 'react';
import { Card, Tabs, message, Spin, Typography } from 'antd';
import LogoManagement from './LogoManagement';
import BannerManagement from './BannerManagement';
import useWebManageStore from '@/stores/useWebManageStore';

const { Title } = Typography;

const WebManage = () => {
  const [activeKey, setActiveKey] = useState('1');
  const { fetchLogo, fetchBanners, logoLoading, bannerLoading } = useWebManageStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Use Promise.allSettled to handle both requests, even if one fails
        await Promise.allSettled([fetchLogo(), fetchBanners()]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        // No need to show error message as per user's request
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [fetchLogo, fetchBanners]);

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  const items = [
    {
      key: '1',
      label: 'Quản lý Logo',
      children: <LogoManagement />
    },
    {
      key: '2',
      label: 'Quản lý Banner',
      children: <BannerManagement />
    }
  ];

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">Quản lý Logo & Banner</Title>

      <Card className="shadow-sm">
        <Tabs 
          activeKey={activeKey} 
          onChange={handleTabChange}
          tabPosition="top"
          size="large"
          items={items}
        />
      </Card>
    </div>
  );
};

export default WebManage; 