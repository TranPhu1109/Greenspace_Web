import React, { useState, useEffect } from 'react';
import { Upload, message, Row, Col } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { useCloudinaryStorage } from '../../hooks/useCloudinaryStorage';

/**
 * Component upload nhiều ảnh lên Cloudinary
 * @param {Object} props - Component props
 * @param {Array} props.values - Mảng URL ảnh hiện tại (nếu có)
 * @param {Function} props.onChange - Callback khi ảnh thay đổi
 * @param {number} props.maxCount - Số lượng ảnh tối đa cho mỗi ô upload
 * @param {Array} props.labels - Nhãn hiển thị cho từng ô upload
 */
const CloudinaryMultiUpload = ({
  values = [],
  onChange,
  maxCount = 1,
  labels = ['Ảnh chính', 'Ảnh phụ 1', 'Ảnh phụ 2'],
  showPreview = true,
}) => {
  const { uploadImages, progress, error } = useCloudinaryStorage();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState(values);

  // Cập nhật imageUrls khi values thay đổi từ bên ngoài
  useEffect(() => {
    setImageUrls(values);
  }, [values]);

  const handleUpload = async (file, index) => {
    try {
      setLoading(true);
      const [url] = await uploadImages([file]);
      
      // Cập nhật URL ảnh tại vị trí index
      const newImageUrls = [...imageUrls];
      newImageUrls[index] = url;
      setImageUrls(newImageUrls);
      
      // Gọi onChange để cập nhật giá trị form
      if (onChange) {
        onChange(newImageUrls);
      }
      
      message.success(`Tải ảnh ${labels[index]} lên thành công!`);
      return url;
    } catch (error) {
      console.error(`Lỗi khi tải ảnh ${labels[index]} lên:`, error);
      message.error(`Lỗi khi tải ảnh ${labels[index]} lên: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const customRequest = (index) => async (options) => {
    const { file, onSuccess, onError } = options;
    
    try {
      const url = await handleUpload(file, index);
      onSuccess(url);
    } catch (error) {
      onError(error);
    }
  };

  const renderUploadButton = (index) => (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>
        {loading ? `Đang tải ${progress}%` : labels[index]}
      </div>
    </div>
  );

  return (
    <Row gutter={16}>
      {labels.map((label, index) => (
        <Col span={8} key={index}>
          <div style={{ marginBottom: 8 }}>{label}</div>
          {imageUrls[index] && showPreview && (
            <div style={{ marginBottom: 8 }}>
              <img 
                src={imageUrls[index]} 
                alt={label}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }} 
              />
            </div>
          )}
          <Upload
            listType="picture-card"
            showUploadList={false}
            customRequest={customRequest(index)}
            maxCount={maxCount}
            accept="image/*"
          >
            {renderUploadButton(index)}
          </Upload>
        </Col>
      ))}
      {error && <div className="upload-error" style={{ color: 'red', marginTop: 5, width: '100%' }}>{error.message}</div>}
    </Row>
  );
};

export default CloudinaryMultiUpload;