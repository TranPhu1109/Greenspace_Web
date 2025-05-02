import React, { useState } from 'react';
import { Table, Button, Space, Typography, message, Tooltip, Empty, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import usePolicyStore from '@/stores/usePolicyStore';
import PolicyPreview from './PolicyPreview';

const { Title, Text } = Typography;
const { confirm } = Modal;

const PolicyList = ({ onEditPolicy, onCreatePolicy }) => {
  const { policies, deletePolicy, isLoading, error } = usePolicyStore();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewPolicy, setPreviewPolicy] = useState(null);

  // Xử lý xem trước chính sách
  const handlePreview = (policy) => {
    setPreviewPolicy(policy);
    setPreviewVisible(true);
  };

  // Xử lý xóa chính sách
  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa chính sách này?',
      icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
      content: 'Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await deletePolicy(id);
          // Không cần gọi fetchPolicies ở đây vì state đã được cập nhật trong deletePolicy
          message.success('Đã xóa chính sách thành công!');
        } catch (error) {
          message.error('Lỗi khi xóa chính sách: ' + error.message);
        }
      },
    });
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 80,
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Tên Chính sách',
      dataIndex: 'documentName',
      key: 'documentName',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem trước">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              onClick={() => handlePreview(record)}
              size="middle"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="default" 
              icon={<EditOutlined />} 
              onClick={() => onEditPolicy(record.id)}
              size="middle"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => showDeleteConfirm(record.id)}
              size="middle"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Nếu không có dữ liệu
  if (!isLoading && (!policies || policies.length === 0)) {
    return (
      <div className="my-8 text-center">
        <Empty 
          description={
            <span>
              {error ? `Lỗi: ${error}` : 'Chưa có chính sách nào được tạo'}
            </span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        {!error && (
          <Button 
            type="primary" 
            onClick={onCreatePolicy} 
            className="mt-4"
            icon={<PlusOutlined />}
          >
            Tạo chính sách mới
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="my-4">
      <div className="flex justify-between mb-4">
        <Title level={4}>Danh sách chính sách</Title>
        <Button 
          type="primary" 
          onClick={onCreatePolicy}
          icon={<PlusOutlined />}
        >
          Tạo chính sách mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={policies}
        rowKey="id"
        loading={isLoading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng cộng ${total} chính sách`,
        }}
      />

      {/* Modal xem trước chính sách */}
      <Modal
        title={`Xem trước: ${previewPolicy?.documentName || 'Chính sách'}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {previewPolicy && <PolicyPreview policy={previewPolicy} />}
      </Modal>
    </div>
  );
};

export default PolicyList; 