import React, { useState, useEffect } from 'react';
import { Upload, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { useCloudinaryStorage } from '../../hooks/useCloudinaryStorage';

/**
 * Component upload ảnh lên Cloudinary với khả năng hiển thị preview
 * @param {Object} props - Component props
 * @param {string} props.value - URL ảnh hiện tại (nếu có)
 * @param {Function} props.onChange - Callback khi ảnh thay đổi
 * @param {number} props.maxCount - Số lượng ảnh tối đa có thể upload (mặc định: 1)
 * @param {string} props.label - Nhãn hiển thị (mặc định: 'Tải lên')
 * @param {boolean} props.showPreview - Có hiển thị preview ảnh hay không (mặc định: true)
 */
const CloudinaryUploadWidget = ({
  value,
  onChange,
  maxCount = 1,
  label = 'Tải lên',
  showPreview = true,
}) => {
  const { uploadImages, progress, error } = useCloudinaryStorage();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(value);

  // Cập nhật imageUrl khi value thay đổi từ bên ngoài
  useEffect(() => {
    setImageUrl(value);
  }, [value]);

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    
    try {
      setLoading(true);
      const [url] = await uploadImages([file]);
      setImageUrl(url);
      onSuccess(url);
      
      // Gọi onChange để cập nhật giá trị form
      if (onChange) {
        onChange(url);
      }
      
      message.success('Tải ảnh lên thành công!');
    } catch (error) {
      console.error('Lỗi khi tải ảnh lên:', error);
      onError(error);
      message.error(`Lỗi khi tải ảnh lên: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>
        {loading ? `Đang tải ${progress}%` : label}
      </div>
    </div>
  );

  return (
    <div className="cloudinary-upload-widget">
      <Upload
        listType="picture-card"
        showUploadList={false}
        customRequest={handleUpload}
        maxCount={maxCount}
        accept="image/*"
      >
        {imageUrl && showPreview ? (
          <img 
            src={imageUrl} 
            alt="Ảnh đã tải lên" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          uploadButton
        )}
      </Upload>
      {error && <div className="upload-error" style={{ color: 'red', marginTop: 5 }}>{error.message}</div>}
    </div>
  );
};

export default CloudinaryUploadWidget;