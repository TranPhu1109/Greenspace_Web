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
  Table,
  Popconfirm,
  Modal,
  Empty,
  Alert,
  Tooltip,
  Row,
  Col,
  Divider
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  CaretRightOutlined
} from '@ant-design/icons';
import useWebManageStore from '@/stores/useWebManageStore';
import { useCloudinaryStorage } from '@/hooks/useCloudinaryStorage';

const { Title, Text } = Typography;

const BannerManagement = () => {
  const {
    banners,
    bannerLoading,
    bannerError,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner
  } = useWebManageStore();

  const { uploadImages, progress, error: uploadError } = useCloudinaryStorage();

  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [editFileList, setEditFileList] = useState([]);

  const showPreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  const handleBeforeUpload = (file, fileList, setter) => {
    // Check file is image
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Bạn chỉ có thể tải lên tệp hình ảnh!');
      return Upload.LIST_IGNORE;
    }

    // Check file size (limit to 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Hình ảnh phải nhỏ hơn 5MB!');
      return Upload.LIST_IGNORE;
    }

    // Add file to fileList manually
    setter([file]);

    // Return false to prevent automatic upload
    return false;
  };

  const handleAddBanner = async () => {
    if (!fileList.length) {
      message.warning('Vui lòng chọn hình ảnh banner trước khi thêm!');
      return;
    }

    try {
      setUploading(true);
      
      // Upload the new banner image
      const uploadedUrls = await uploadImages(fileList);
      
      if (uploadedUrls && uploadedUrls.length > 0) {
        const bannerData = {
          imageBanner: uploadedUrls[0]
        };

        // Create the new banner
        await createBanner(bannerData);
        message.success('Thêm banner mới thành công!');
        
        // Refresh banners and reset form
        await fetchBanners();
        setFileList([]);
        setIsAddModalVisible(false);
      } else {
        throw new Error('Không thể tải hình ảnh lên máy chủ');
      }
    } catch (error) {
      console.error('Error adding banner:', error);
      message.error('Lỗi khi thêm banner: ' + (error.message || 'Đã xảy ra lỗi không xác định'));
    } finally {
      setUploading(false);
    }
  };

  const handleEditBanner = async () => {
    if (!currentBanner) {
      message.error('Không tìm thấy thông tin banner để cập nhật!');
      return;
    }

    try {
      setUploading(true);
      
      // If there's a new file to upload
      let bannerImageUrl = currentBanner.imageBanner;
      
      if (editFileList.length > 0) {
        const uploadedUrls = await uploadImages(editFileList);
        if (uploadedUrls && uploadedUrls.length > 0) {
          bannerImageUrl = uploadedUrls[0];
        } else {
          throw new Error('Không thể tải hình ảnh lên máy chủ');
        }
      }

      // Prepare banner data
      const bannerData = {
        imageBanner: bannerImageUrl
      };

      // Update the banner
      await updateBanner(currentBanner.id, bannerData);
      message.success('Cập nhật banner thành công!');
      
      // Refresh banners and reset form
      await fetchBanners();
      setEditFileList([]);
      setCurrentBanner(null);
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Error updating banner:', error);
      message.error('Lỗi khi cập nhật banner: ' + (error.message || 'Đã xảy ra lỗi không xác định'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    try {
      await deleteBanner(id);
      message.success('Xóa banner thành công!');
      
      // Refresh banners
      await fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      message.error('Lỗi khi xóa banner: ' + (error.message || 'Đã xảy ra lỗi không xác định'));
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imageBanner',
      key: 'imageBanner',
      render: (url) => (
        <Image
          src={url}
          alt="Banner"
          style={{ height: '60px', objectFit: 'contain' }}
          preview={false}
          onClick={() => showPreview(url)}
          className="cursor-pointer"
        />
      ),
    },
    {
      title: 'URL',
      dataIndex: 'imageBanner',
      key: 'url',
      ellipsis: true,
      render: (url) => (
        <Tooltip title={url}>
          <Text ellipsis style={{ maxWidth: 300 }}>{url}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            block
            onClick={() => showPreview(record.imageBanner)}
          >
            Xem
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            block
            onClick={() => {
              setCurrentBanner(record);
              setIsEditModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa banner này?"
            onConfirm={() => handleDeleteBanner(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              block
            >
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (bannerLoading) {
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
          message="Thông tin về Banner"
          description={
            <div>
              <p>Banner sẽ được hiển thị trên trang chủ của website.</p>
              <p>Khuyến nghị: Banner có kích thước 1920x600 pixels để hiển thị tốt nhất.</p>
              <p>Kích thước tệp tối đa: 5MB.</p>
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          className="mb-6"
        />

        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Danh sách Banner</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalVisible(true)}
          >
            Thêm Banner mới
          </Button>
        </div>

        {Array.isArray(banners) && banners.length > 0 ? (
          <Table
            columns={columns}
            dataSource={banners}
            rowKey="id"
            pagination={{
              defaultPageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20'],
              showTotal: (total) => `Tổng cộng ${total} banner`,
            }}
          />
        ) : (
          <Empty 
            description="Chưa có banner nào. Vui lòng thêm mới."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      {/* Banner preview modal */}
      <Modal
        open={previewVisible}
        title="Xem chi tiết Banner"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={1000}
        centered
      >
        <div className="flex justify-center items-center">
          <Image
            alt="Banner Preview"
            src={previewImage}
            style={{ maxWidth: '100%' }}
            preview={false}
          />
        </div>
        {previewImage && (
          <div className="mt-4">
            <Text type="secondary">URL: {previewImage}</Text>
          </div>
        )}
      </Modal>

      {/* Add banner modal */}
      <Modal
        open={isAddModalVisible}
        title="Thêm Banner mới"
        okText="Thêm"
        cancelText="Hủy"
        onOk={handleAddBanner}
        onCancel={() => {
          setIsAddModalVisible(false);
          setFileList([]);
        }}
        confirmLoading={uploading}
      >
        <div className="mb-4">
          <Text>Chọn hình ảnh banner để tải lên:</Text>
          <div className="mt-3">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={(file) => handleBeforeUpload(file, fileList, setFileList)}
              onRemove={() => {
                setFileList([]);
                return true;
              }}
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
              }}
            >
              {fileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </div>
        </div>

        <Alert
          message="Lưu ý"
          description="Hình ảnh banner nên có tỷ lệ 16:5 hoặc 1920x600 pixels để hiển thị tốt nhất."
          type="warning"
          showIcon
        />
      </Modal>

      {/* Edit banner modal */}
      <Modal
        open={isEditModalVisible}
        title="Chỉnh sửa Banner"
        okText="Cập nhật"
        cancelText="Hủy"
        onOk={handleEditBanner}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditFileList([]);
          setCurrentBanner(null);
        }}
        confirmLoading={uploading}
      >
        {currentBanner && (
          <>
            <div className="mb-4">
              <Text>Banner hiện tại:</Text>
              <div className="mt-2 border border-dashed border-gray-300 p-2 rounded">
                <Image 
                  src={currentBanner.imageBanner} 
                  alt="Current Banner"
                  style={{ maxWidth: '100%' }}
                  preview={false}
                />
              </div>
            </div>

            <Divider />

            <div className="mb-4">
              <Text>Chọn hình ảnh banner mới (nếu muốn thay đổi):</Text>
              <div className="mt-3">
                <Upload
                  listType="picture-card"
                  fileList={editFileList}
                  beforeUpload={(file) => handleBeforeUpload(file, editFileList, setEditFileList)}
                  onRemove={() => {
                    setEditFileList([]);
                    return true;
                  }}
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                  }}
                >
                  {editFileList.length === 0 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>
              </div>
            </div>

            <Alert
              message="Lưu ý"
              description="Để giữ nguyên banner hiện tại, không cần tải lên hình ảnh mới."
              type="info"
              showIcon
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default BannerManagement; 