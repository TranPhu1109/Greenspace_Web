import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Upload, 
  message, 
  Image, 
  Space, 
  Typography, 
  Spin, 
  Empty, 
  Modal,
  Alert 
} from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined, 
  PictureOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import useWebManageStore from '@/stores/useWebManageStore';
import { useCloudinaryStorage } from '@/hooks/useCloudinaryStorage';

const { Title, Text } = Typography;

const LogoManagement = () => {
  const { 
    logo, 
    logoLoading, 
    logoError, 
    fetchLogo, 
    createLogo, 
    updateLogo 
  } = useWebManageStore();
  
  const { uploadImages, progress, error: uploadError } = useCloudinaryStorage();
  
  const [imageUrl, setImageUrl] = useState('');
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (logo?.imageLogo) {
      setImageUrl(logo.imageLogo);
    } else {
      setImageUrl('');
    }
  }, [logo]);

  const handlePreview = () => {
    setPreviewImage(imageUrl || (fileList[0]?.thumbUrl || fileList[0]?.url));
    setPreviewVisible(true);
  };

  const handleBeforeUpload = (file) => {
    // Check file is image
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Bạn chỉ có thể tải lên tệp hình ảnh!');
      return Upload.LIST_IGNORE;
    }
    
    // Check file size (limit to 2MB)
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Hình ảnh phải nhỏ hơn 2MB!');
      return Upload.LIST_IGNORE;
    }

    // Add file to fileList manually
    setFileList([file]);
    
    // Return false to prevent automatic upload
    return false;
  };

  const handleRemove = () => {
    setFileList([]);
    return true;
  };

  const handleSubmit = async () => {
    if (!fileList.length && !imageUrl) {
      message.warning('Vui lòng chọn logo trước khi lưu!');
      return;
    }

    try {
      setUploading(true);
      
      // If there's a new file to upload
      let logoImageUrl = imageUrl;
      if (fileList.length > 0) {
        const uploadedUrls = await uploadImages(fileList);
        if (uploadedUrls && uploadedUrls.length > 0) {
          logoImageUrl = uploadedUrls[0];
          setImageUrl(logoImageUrl);
        } else {
          throw new Error('Không thể tải logo lên máy chủ');
        }
      }

      // Prepare logo data
      const logoData = {
        imageLogo: logoImageUrl
      };

      // Check if logo exists to create or update
      if (logo?.id) {
        await updateLogo(logo.id, logoData);
        message.success('Cập nhật logo thành công!');
      } else {
        await createLogo(logoData);
        message.success('Tạo mới logo thành công!');
      }

      // Refresh logo data
      await fetchLogo();
      setFileList([]);
    } catch (error) {
      console.error('Error saving logo:', error);
      message.error('Lỗi khi lưu logo: ' + (error.message || 'Đã xảy ra lỗi không xác định'));
    } finally {
      setUploading(false);
    }
  };

  if (logoLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="mb-6">
        <Alert
          message="Thông tin về Logo"
          description={
            <div>
              <p>Logo sẽ được hiển thị trên header của website và trong các trang khác.</p>
              <p>Khuyến nghị: Logo có kích thước 200x80 pixels, định dạng PNG với nền trong suốt.</p>
              <p>Kích thước tệp tối đa: 2MB.</p>
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          className="mb-6"
        />

        <Title level={4} className="mb-4">Logo hiện tại</Title>
        {imageUrl ? (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="p-4 border border-dashed rounded-lg bg-gray-50 w-fit">
                <Image
                  src={imageUrl}
                  alt="Website Logo"
                  style={{ maxHeight: '100px' }}
                  preview={false}
                  onClick={handlePreview}
                  className="cursor-pointer"
                />
              </div>
              <Button
                type="link"
                onClick={handlePreview}
                icon={<PictureOutlined />}
                className="ml-4"
              >
                Xem hình ảnh
              </Button>
            </div>
            <Text type="secondary">URL: {imageUrl}</Text>
          </div>
        ) : (
          <Empty description="Chưa có logo. Vui lòng tạo mới." className="mb-6" />
        )}

        <Title level={4} className="mb-4">{logo?.id ? 'Cập nhật Logo' : 'Tạo mới Logo'}</Title>
        <div className="mb-6">
          <Upload
            listType="picture"
            maxCount={1}
            fileList={fileList}
            beforeUpload={handleBeforeUpload}
            onRemove={handleRemove}
            showUploadList={{
              showPreviewIcon: true,
              showRemoveIcon: true,
            }}
          >
            <Button icon={<UploadOutlined />} disabled={uploading}>
              Chọn Logo
            </Button>
          </Upload>
        </div>

        <Button
          type="primary"
          onClick={handleSubmit}
          loading={uploading}
          icon={<SaveOutlined />}
          disabled={(!fileList.length && !imageUrl) || uploading}
          className="mt-4"
        >
          {logo?.id ? 'Cập nhật Logo' : 'Tạo mới Logo'}
        </Button>
      </Card>

      <Modal
        open={previewVisible}
        title="Xem trước Logo"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
      >
        <div className="flex justify-center items-center">
          <Image
            alt="Logo Preview"
            src={previewImage}
            preview={false}
            style={{ maxHeight: '300px' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default LogoManagement; 