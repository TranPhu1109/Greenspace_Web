import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Alert, Space, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import usePolicyStore from '@/stores/usePolicyStore';
import EditorComponent from '@/components/Common/EditorComponent';
import PolicyPreview from './PolicyPreview';

const PolicyCreate = ({ onSuccess, onCancel }) => {
  const {
    createPolicy,
    isLoading,
    error,
    clearError
  } = usePolicyStore();

  const [form] = Form.useForm();
  const [documentContent, setDocumentContent] = useState('');
  const [formData, setFormData] = useState({
    documentName: '',
    document1: ''
  });

  // Reset form khi component mount
  useEffect(() => {
    form.resetFields();
    setDocumentContent('');
    return () => {
      clearError();
    };
  }, []);

  // Cập nhật formData khi documentContent thay đổi (để xem trước)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      document1: documentContent
    }));
  }, [documentContent]);

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      // Kiểm tra nội dung không được rỗng
      if (!documentContent || documentContent.trim() === '') {
        message.error('Vui lòng nhập nội dung chính sách');
        return;
      }

      const policyData = {
        documentName: values.documentName,
        document1: documentContent
      };

      await createPolicy(policyData);
      message.success('Tạo mới chính sách thành công!');
      onSuccess();
    } catch (error) {
      message.error('Lỗi khi tạo chính sách: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // Xử lý thay đổi nội dung từ EditorComponent
  const handleEditorChange = (content) => {
    setDocumentContent(content);
  };

  // Xử lý khi thay đổi form thông thường
  const handleFormChange = (changedValues, allValues) => {
    setFormData(prev => ({
      ...prev,
      ...allValues
    }));
  };

  return (
    <div className="py-4">
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Row gutter={16}>
        {/* Left Column - Form Input */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            className="mb-4"
            title="Tạo mới chính sách"
            style={{ 
              height: '100%', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
              borderRadius: '8px',
              backgroundColor: '#fff',
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onValuesChange={handleFormChange}
            >
              <Form.Item
                name="documentName"
                label="Tên chính sách"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên chính sách' }
                ]}
              >
                <Input placeholder="Nhập tên chính sách" />
              </Form.Item>

              <Form.Item
                label="Nội dung chính sách"
                required
                help="Sử dụng công cụ soạn thảo để tạo nội dung phong phú"
              >
                <EditorComponent
                  value={documentContent}
                  onChange={handleEditorChange}
                  height={860}
                />
              </Form.Item>

              <Form.Item className="mt-6">
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={isLoading ? <LoadingOutlined /> : <SaveOutlined />}
                    loading={isLoading}
                  >
                    Tạo chính sách
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={onCancel}
                  >
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Column - Preview */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            className="mb-4"
            title="Xem trước"
            style={{ 
              height: '100%', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}
          >
            <div className="policy-preview-wrapper" style={{ maxHeight: '900px', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#aaa transparent' }}>
              <PolicyPreview
                policy={formData}
                previewMode={true}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div >
  );
};

export default PolicyCreate; 