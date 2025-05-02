import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Alert, Space, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import usePolicyStore from '@/stores/usePolicyStore';
import EditorComponent from '@/components/Common/EditorComponent';
import PolicyPreview from './PolicyPreview';

const PolicyEdit = ({ policyId, onSuccess, onCancel }) => {
  const { 
    currentPolicy, 
    fetchPolicyById, 
    updatePolicy, 
    resetCurrentPolicy,
    isLoading, 
    error 
  } = usePolicyStore();
  
  const [form] = Form.useForm();
  const [documentContent, setDocumentContent] = useState('');
  const [formData, setFormData] = useState({
    documentName: '',
    document1: ''
  });
  const [loadingData, setLoadingData] = useState(true);

  // Tải dữ liệu chính sách khi component mount
  useEffect(() => {
    if (!policyId) return;
  
    let isMounted = true;
    const loadPolicy = async () => {
      setLoadingData(true);
      try {
        const data = await fetchPolicyById(policyId);
  
        if (!isMounted) return;
  
        if (!data || !data.documentName) throw new Error('Dữ liệu chính sách không hợp lệ');
  
        form.setFieldsValue({ documentName: data.documentName });
        setDocumentContent(data.document1 || '');
        setFormData({
          documentName: data.documentName,
          document1: data.document1 || ''
        });
      } catch (err) {
        if (isMounted) {
          message.error('Không thể tải dữ liệu chính sách: ' + err.message);
          onCancel();
        }
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };
  
    loadPolicy();
  
    return () => {
      isMounted = false;
      resetCurrentPolicy(); // giữ lại nếu bạn cần clear store
    };
  }, [policyId]);
  

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

      await updatePolicy(policyId, policyData);
      message.success('Cập nhật chính sách thành công!');
      onSuccess();
    } catch (error) {
      message.error('Lỗi khi cập nhật chính sách: ' + (error.message || 'Lỗi không xác định'));
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

  if (loadingData) {
    return (
      <Card bordered={false} className="mb-4">
        <div className="text-center py-5">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-3">Đang tải dữ liệu chính sách...</p>
        </div>
      </Card>
    );
  }

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
            title="Chỉnh sửa chính sách"
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
              initialValues={formData}
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
                  height={500}
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
                    Cập nhật chính sách
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
              backgroundColor: '#fff',
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
    </div>
  );
};

export default PolicyEdit; 