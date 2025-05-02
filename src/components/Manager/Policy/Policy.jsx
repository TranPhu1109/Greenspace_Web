import React, { useState, useEffect } from 'react';
import { Card, message, Spin, Typography, Empty, Button } from 'antd';
import PolicyList from './PolicyList';
import PolicyCreate from './PolicyCreate';
import PolicyEdit from './PolicyEdit';
import usePolicyStore from '@/stores/usePolicyStore';

const { Title } = Typography;

const Policy = () => {
  const { fetchPolicies, isLoading, error, clearError } = usePolicyStore();
  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPolicies();
      } catch (err) {
        console.error('Error loading policies:', err);
      }
    };

    loadData();
    
    return () => {
      clearError();
    };
  }, []);

  // Xử lý khi chọn một chính sách để edit
  const handleEditPolicy = (policyId) => {
    setSelectedPolicyId(policyId);
    setView('edit');
  };

  // Xử lý khi bấm nút tạo mới
  const handleCreatePolicy = () => {
    setView('create');
  };

  // Xử lý khi hoàn thành chỉnh sửa hoặc tạo mới
  const handleFormSubmitSuccess = () => {
    // Tải lại danh sách chính sách
    fetchPolicies();
    // Chuyển về danh sách
    setView('list');
    setSelectedPolicyId(null);
  };

  // Xử lý khi hủy form
  const handleFormCancel = () => {
    setView('list');
    setSelectedPolicyId(null);
  };

  // Hiển thị loading
  if (isLoading && !error && view === 'list') {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  // Render nội dung chính dựa trên view hiện tại
  const renderContent = () => {
    switch (view) {
      case 'create':
        return (
          <Card 
            title="Tạo mới chính sách" 
            className="shadow-sm"
            extra={
              <Button href="#" onClick={() => setView('list')}>Quay lại danh sách</Button>
            }
          >
            <PolicyCreate 
              onSuccess={handleFormSubmitSuccess}
              onCancel={handleFormCancel}
            />
          </Card>
        );
      case 'edit':
        return (
          <Card 
            title="Chỉnh sửa chính sách" 
            className="shadow-sm"
            extra={
              <Button href="#" onClick={() => setView('list')}>Quay lại danh sách</Button>
            }
          >
            <PolicyEdit 
              policyId={selectedPolicyId}
              onSuccess={handleFormSubmitSuccess}
              onCancel={handleFormCancel}
            />
          </Card>
        );
      case 'list':
      default:
        return (
          <Card className="shadow-sm">
            <PolicyList 
              onEditPolicy={handleEditPolicy} 
              onCreatePolicy={handleCreatePolicy}
            />
          </Card>
        );
    }
  };

  return (
    <div >
      <Title level={2}>Quản lý Chính sách</Title>
      {renderContent()}
    </div>
  );
};

export default Policy; 