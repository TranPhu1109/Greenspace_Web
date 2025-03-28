import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCloudinaryStorage } from '../../hooks/useCloudinaryStorage';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';

const CloudinaryUpload = ({
  value,
  onChange,
  maxCount = 1,
  label = 'Tải lên',
  showPreview = true,
  previewUrl = null,
}) => {
  const { uploadImages, progress, error, cld } = useCloudinaryStorage();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(previewUrl);

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
      {loading ? null : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{loading ? `Đang tải ${progress}%` : label}</div>
    </div>
  );

  return (
    <div className="cloudinary-upload">
      <Upload
        listType="picture-card"
        showUploadList={false}
        customRequest={handleUpload}
        maxCount={maxCount}
        accept="image/*"
      >
        {imageUrl && showPreview ? (
          <img src={imageUrl} alt="Ảnh đã tải lên" style={{ width: '100%' }} />
        ) : (
          uploadButton
        )}
      </Upload>
      {error && <div className="upload-error">{error.message}</div>}
    </div>
  );
};

export default CloudinaryUpload;