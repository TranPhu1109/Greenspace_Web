import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, Typography, Breadcrumb, Spin, Alert, Layout, List, Row, Col, Space, Empty } from 'antd';
import { FilePdfOutlined, FileTextOutlined } from '@ant-design/icons';
import usePolicyStore from '@/stores/usePolicyStore';
import PolicyPreview from '@/components/Manager/Policy/PolicyPreview';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Content } from 'antd/es/layout/layout';

const { Title, Text } = Typography;

const PolicyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchPolicyById, fetchPolicies } = usePolicyStore();
  const [policy, setPolicy] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState(id);

  // Load all policies once
  useEffect(() => {
    let isMounted = true;
    
    const loadAllPolicies = async () => {
      try {
        const data = await fetchPolicies();
        if (isMounted) {
          setPolicies(data || []);
        }
      } catch (err) {
        console.error('Error loading policies:', err);
        if (isMounted) {
          setPolicies([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadAllPolicies();
    
    return () => {
      isMounted = false;
    };
  }, [fetchPolicies]);

  // Load specific policy when ID changes
  useEffect(() => {
    let isMounted = true;
    
    const loadSpecificPolicy = async () => {
      if (id) {
        if (isMounted) {
          setPolicyLoading(true);
          setError(null);
        }
        try {
          const data = await fetchPolicyById(id);
          if (isMounted) {
            setPolicy(data);
            setSelectedPolicyId(id);
          }
        } catch (err) {
          if (isMounted) {
            setError(err.message || 'Không thể tải chính sách');
            setPolicy(null);
          }
        } finally {
          if (isMounted) {
            setPolicyLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setPolicy(null);
          setSelectedPolicyId(null);
          setPolicyLoading(false);
          setError(null);
        }
      }
    };

    loadSpecificPolicy();

    return () => {
      isMounted = false;
    };
  }, [id, fetchPolicyById]);

  // Handle policy click without page reload
  const handlePolicyClick = (policyIdToNavigate) => (e) => {
    e.preventDefault();
    if (policyIdToNavigate === id) return;
    
    // Use navigate with replace option to avoid adding to history stack
    navigate(`/policy/${policyIdToNavigate}`, { replace: false });
    
    // No need to set policy content here as the useEffect will trigger
    // when ID param changes
  };

  if (loading && policies.length === 0) {
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
      <Content style={{ 
        padding: '200px 50px 64px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        width: '100%'
      }}>
        <Breadcrumb style={{
          marginBottom: '24px',
          padding: '12px 16px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Breadcrumb.Item>
            <Link to="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/policy">Chính sách</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{policy?.documentName || 'Chi tiết chính sách'}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={24} style={{ width: '100%' }}>
          <Col xs={24} md={8} style={{ marginBottom: '24px' }}>
            <Card
              title={<Title level={4} style={{ margin: 0 }}>Danh sách chính sách</Title>}
              className="shadow-md"
              style={{ 
                height: '100%', 
                borderRadius: '12px',
                overflow: 'hidden'
              }}
              bodyStyle={{ padding: '12px' }}
            >
              {policies.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={policies}
                  renderItem={(item) => (
                    <List.Item
                      className={`
                        transition-colors duration-150 ease-in-out rounded-lg mb-2 p-3
                        ${item.id === selectedPolicyId
                          ? 'bg-green-50 border-l-4 border-green-500'
                          : 'hover:bg-gray-50 border border-gray-100'
                        }
                      `}
                    >
                      <List.Item.Meta
                        className="pl-4"
                        title={
                          <a
                            href={`/policy/${item.id}`}
                            onClick={handlePolicyClick(item.id)}
                            className={`
                              block w-full whitespace-normal break-words line-clamp-2
                              ${item.id === selectedPolicyId
                                ? 'text-green-600 font-semibold'
                                : 'text-gray-700 font-medium hover:text-green-500'
                              }
                            `}
                          >
                            {item.documentName}
                          </a>
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
              ) : (
                <Empty 
                  description="Không có chính sách nào." 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>
          
          <Col xs={24} md={16}>
            <Card 
              className="shadow-md" 
              style={{ 
                borderRadius: '12px',
                overflow: 'hidden',
                minHeight: '500px'
              }}
              bodyStyle={{ padding: policyLoading ? '16px' : 0 }}
            >
              {policyLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Space direction="vertical" align="center">
                    <Spin size="large" />
                    <Text className="text-gray-500 mt-3">Đang tải nội dung chính sách...</Text>
                  </Space>
                </div>
              ) : error ? (
                <Alert
                  message="Lỗi khi tải chính sách"
                  description={error}
                  type="error"
                  showIcon
                  style={{ margin: '16px' }}
                />
              ) : policy ? (
                <PolicyPreview policy={policy}/>
              ) : (
                <div className="flex justify-center items-center h-full py-20">
                  <Space direction="vertical" align="center">
                    <Empty 
                      description={id && !error ? 'Không tìm thấy chính sách.' : 'Vui lòng chọn một chính sách để xem'} 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  </Space>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Content>
      <Footer />
    </Layout>
  );
};

export default PolicyView; 