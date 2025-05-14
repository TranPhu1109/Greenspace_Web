import React from 'react';
import { Card, Typography, Divider, Empty } from 'antd';
import ReactMarkdown from 'react-markdown';
import './PolicyPreview.scss';
import EditorJSRenderer from '@/components/Common/EditorJSRenderer';

const { Title } = Typography;

const PolicyPreview = ({ policy, previewMode = false }) => {
  if (!policy || (!policy.document1 && !previewMode)) {
    return (
      <Empty
        description="Không có nội dung để hiển thị"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="policy-preview-container" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <div className="policy-preview-header">
        <Title level={2} className="policy-preview-title">
          {policy.documentName || 'Tên chính sách'}
        </Title>
        <Divider className="policy-preview-divider" />
      </div>

      <div
        className="html-preview"
        dangerouslySetInnerHTML={{ __html: policy.document1 || '<p>Nội dung chính sách sẽ được hiển thị ở đây.</p>' }}
      />
    </div>
  );
};

export default PolicyPreview; 