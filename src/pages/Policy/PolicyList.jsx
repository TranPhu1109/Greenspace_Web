import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography, List, Spin, Alert, Breadcrumb, Layout, Space, Empty } from 'antd';
import { FilePdfOutlined, FileTextOutlined } from '@ant-design/icons';
import usePolicyStore from '@/stores/usePolicyStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const { Content } = Layout;
const { Title, Text } = Typography;

const PolicyListPage = () => {
  const { fetchPolicies, isLoading, error } = usePolicyStore();
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const data = await fetchPolicies();
        setPolicies(data || []);
      } catch (err) {
        console.error('Error loading policies:', err);
      }
    };

    loadPolicies();
  }, [fetchPolicies]);

  if (isLoading) {
    return (
      <Layout>
        <Header />
        <Content className="min-h-screen flex items-center justify-center" style={{ padding: '0 50px' }}>
          <Card className="w-full max-w-4xl shadow-md">
            <div className="py-20 flex flex-col items-center">
              <Spin size="large" />
              <Text className="mt-4 text-gray-600">Đang tải danh sách chính sách...</Text>
            </div>
          </Card>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Content style={{ padding: '200px 50px 64px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Breadcrumb 
          style={{
            marginBottom: '24px',
            padding: '12px 16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Breadcrumb.Item>
            <Link to="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Chính sách</Breadcrumb.Item>
        </Breadcrumb>

        <Card 
          className="policy-list-card"
          style={{ 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <div className="p-4 sm:p-6">
            <Title 
              level={2} 
              style={{ 
                marginBottom: '24px', 
                fontSize: '28px',
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: '16px'
              }}
            >
              Chính sách
            </Title>

            {error ? (
              <Alert
                message="Lỗi khi tải danh sách chính sách"
                description={error}
                type="error"
                showIcon
                className="mb-4"
              />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={policies}
                renderItem={(item) => (
                  <List.Item
                    className="hover:bg-gray-50 transition-colors rounded-lg p-3"
                    style={{ marginBottom: '8px', border: '1px solid #f0f0f0' }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-full">
                          {item.fileType === 'pdf' ? 
                            <FilePdfOutlined style={{ fontSize: '20px', color: '#389e0d' }} /> : 
                            <FileTextOutlined style={{ fontSize: '20px', color: '#389e0d' }} />
                          }
                        </div>
                      }
                      title={
                        <Link 
                          to={`/policy/${item.id}`} 
                          className="text-lg font-medium hover:text-green-600 transition-colors"
                        >
                          {item.documentName}
                        </Link>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          {item.description && (
                            <Text type="secondary" className="line-clamp-2">
                              {item.description}
                            </Text>
                          )}
                          {item.updatedAt && (
                            <Text type="secondary" className="text-xs">
                              Cập nhật: {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ 
                  emptyText: <Empty 
                    description="Không có chính sách nào." 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  /> 
                }}
              />
            )}
          </div>
        </Card>
      </Content>
      <Footer />
    </Layout>
  );
};

export default PolicyListPage; 