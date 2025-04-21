import React, { useState } from 'react';
import { 
  Typography, 
  Row, 
  Col, 
  Image, 
  Card, 
  Button, 
  Upload, 
  Modal,
  message
} from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const DesignImages = ({ images = [], onUpload, onDelete, readOnly = false }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  
  const handlePreview = (image, index) => {
    setPreviewImage(image);
    setPreviewTitle(`Hình ảnh ${index + 1}`);
    setPreviewVisible(true);
  };
  
  const handleCancel = () => setPreviewVisible(false);
  
  const handleUpload = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} đã được tải lên thành công`);
      if (onUpload) onUpload(info.file.response);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} tải lên thất bại.`);
    }
  };
  
  const handleDelete = (index) => {
    if (onDelete) onDelete(index);
  };
  
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  );
  
  return (
    <div className="design-images-container">
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={5}>Hình ảnh thiết kế</Title>
        {!readOnly && (
          <Upload
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            listType="picture-card"
            showUploadList={false}
            onChange={handleUpload}
          >
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
            >
              Tải lên hình ảnh
            </Button>
          </Upload>
        )}
      </div>
      
      <Row gutter={[16, 16]}>
        {images.length > 0 ? (
          images.map((image, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card
                hoverable
                cover={
                  <div 
                    style={{ height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => handlePreview(image, index)}
                  >
                    <Image
                      alt={`Hình ảnh ${index + 1}`}
                      src={image}
                      style={{ objectFit: 'cover', width: '100%' }}
                      preview={false}
                    />
                  </div>
                }
                actions={!readOnly ? [
                  <DeleteOutlined key="delete" onClick={() => handleDelete(index)} />
                ] : []}
              >
                <Card.Meta
                  title={`Hình ảnh ${index + 1}`}
                  description={`Tải lên: ${new Date().toLocaleDateString()}`}
                />
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text type="secondary">Chưa có hình ảnh nào</Text>
            </div>
          </Col>
        )}
      </Row>
      
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default DesignImages; 