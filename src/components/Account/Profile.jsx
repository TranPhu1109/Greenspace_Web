import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Space, Descriptions, message, Upload, Row, Col, Divider, Modal, Popover } from 'antd';
import { EditOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined, MailOutlined, IdcardOutlined, EyeOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/useAuthStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import AddressForm from '@/components/Common/AddressForm';
import { useCloudinaryStorage } from '@/hooks/useCloudinaryStorage';

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user, updateUser } = useAuthStore();
  const [addressData, setAddressData] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const { uploadImages, progress } = useCloudinaryStorage();
  
  // Parse address when entering edit mode
  useEffect(() => {
    if (isEditing && user?.address) {
      // No longer need to manually set street address
      // initialization is now handled by AddressForm component
      console.log("Entering edit mode with address:", user.address);
    }
  }, [isEditing, user, form]);
  
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Format address string as "street|ward|district|province"
      let formattedAddress = user?.address || '';
      
      if (addressData && !addressData.useDefaultAddress) {
        // Only update if we have complete address data from the form
        if (addressData.ward?.label && addressData.district?.label && addressData.province?.label) {
          formattedAddress = [
            values.streetAddress || '',
            addressData.ward.label,
            addressData.district.label,
            addressData.province.label
          ].join('|');
        }
      }
      
      // Update user information using the updateUser function from useAuthStore
      await updateUser({
        name: values.name,
        phone: values.phone,
        address: formattedAddress
        // No need to include avatarUrl since updateUser will keep it
      });
      
      message.success('Cập nhật thông tin thành công');
      setIsEditing(false);
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle address change from AddressForm
  const handleAddressChange = (data) => {
    setAddressData(data);
  };

  // Get first letter of name or use fallback
  const getInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const toggleEdit = () => {
    if (isEditing) {
      setIsEditing(false);
      form.resetFields();
    } else {
      setIsEditing(true);
    }
  };

  // Format address for display
  const formatAddressForDisplay = (address) => {
    if (!address) return '(Chưa cập nhật)';
    
    try {
      const parts = address.split('|');
      if (parts.length === 4) {
        return `${parts[0]}, ${parts[1]}, ${parts[2]}, ${parts[3]}`;
      }
      // Fallback to simple replacement if not in expected format
      return address.replace(/\|/g, ', ');
    } catch (error) {
      return address;
    }
  };

  // Handle avatar click - show popover with options
  const avatarContent = (
    <Space direction="vertical">
      <Button 
        icon={<EyeOutlined />} 
        onClick={() => setPreviewVisible(true)}
        disabled={!user?.avatarUrl}
      >
        Xem ảnh đại diện
      </Button>
      <Button 
        icon={<UploadOutlined />} 
        onClick={() => setUploadVisible(true)}
      >
        Cập nhật ảnh đại diện
      </Button>
    </Space>
  );

  // Upload configuration for avatar image
  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể tải lên file hình ảnh!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    
    setImageFile(file);
    return false; // Prevent automatic upload
  };

  // Handle upload avatar
  const handleAvatarUpload = async () => {
    if (!imageFile) {
      message.error('Vui lòng chọn một hình ảnh!');
      return;
    }

    setUploadLoading(true);
    try {
      // Upload image to Cloudinary
      const urls = await uploadImages([imageFile]);
      if (urls && urls.length > 0) {
        // Update user avatar - no need to include other fields with updated updateUser function
        await updateUser({
          avatarUrl: urls[0]
        });
        message.success('Cập nhật ảnh đại diện thành công');
        setUploadVisible(false);
        setImageFile(null);
      }
    } catch (error) {
      message.error('Lỗi khi tải lên ảnh đại diện');
      console.error('Avatar upload error:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <Card 
      title="Thông tin cá nhân"
      className="profile-card"
      extra={
        <Button 
          type="primary"
          icon={<EditOutlined />} 
          onClick={toggleEdit}
          ghost={isEditing}
        >
          {isEditing ? 'Hủy' : 'Chỉnh sửa'}
        </Button>
      }
    >
      <Row gutter={[24, 24]} align="middle">
        <Col xs={24} md={6} className="profile-avatar-section">
          <div className="profile-avatar-container">
            <Popover 
              content={avatarContent} 
              title="Tùy chọn ảnh đại diện" 
              trigger="click"
              placement="right"
            >
              <div className="avatar-wrapper">
                <Avatar className="profile-avatar-shadcn">
                  {user?.avatarUrl ? (
                    <AvatarImage 
                      src={user.avatarUrl} 
                      alt={user?.name || "User"} 
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback 
                    className={cn(
                      "avatar-fallback", 
                      !user?.avatarUrl && "bg-green-600 text-white font-semibold"
                    )}
                  >
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="avatar-overlay">
                  <EditOutlined />
                </div>
              </div>
            </Popover>
            <div className="user-role">
              <IdcardOutlined /> {user?.roleName}
            </div>
          </div>
        </Col>
        
        <Col xs={24} md={18}>
          {isEditing ? (
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                name: user?.name,
                email: user?.email,
                phone: user?.phone,
              }}
              onFinish={handleSubmit}
              className="profile-form"
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="email"
                    label="Email"
                  >
                    <Input prefix={<MailOutlined />} disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Địa chỉ</Divider>
              
              <AddressForm 
                form={form} 
                onAddressChange={handleAddressChange}
                useExistingAddress={false} // Disable showing saved address section
                initialAddress={user?.address} // Pass existing address for initialization
              />

              <Divider style={{ margin: '12px 0 20px' }} />

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Lưu thay đổi
                  </Button>
                  <Button onClick={toggleEdit}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          ) : (
            <div className="profile-info">
              <Descriptions bordered column={{ xs: 1, sm: 1, md: 1 }} size="large" className="profile-descriptions">
                <Descriptions.Item label={<><UserOutlined /> Họ và tên</>}>{user?.name || '(Chưa cập nhật)'}</Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Email</>}>{user?.email || '(Chưa cập nhật)'}</Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>{user?.phone || '(Chưa cập nhật)'}</Descriptions.Item>
                <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>}>
                  {formatAddressForDisplay(user?.address)}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Col>
      </Row>

      {/* Avatar preview modal */}
      <Modal
        open={previewVisible}
        title="Ảnh đại diện"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        {user?.avatarUrl && (
          <img alt="Avatar" style={{ width: '100%' }} src={user.avatarUrl} />
        )}
      </Modal>

      {/* Avatar upload modal */}
      <Modal
        open={uploadVisible}
        title="Cập nhật ảnh đại diện"
        onOk={handleAvatarUpload}
        onCancel={() => {
          setUploadVisible(false);
          setImageFile(null);
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        okButtonProps={{ loading: uploadLoading, disabled: !imageFile }}
      >
        <div className="avatar-upload-container">
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
            accept="image/*"
          >
            {imageFile ? (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Avatar"
                style={{ width: '100%' }}
              />
            ) : uploadLoading ? (
              <div>
                <LoadingOutlined />
                <div style={{ marginTop: 8 }}>Đang tải... {progress}%</div>
              </div>
            ) : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            )}
          </Upload>
          <div style={{ marginTop: 16 }}>
            <p>Kích thước ảnh tối đa: 2MB</p>
            <p>Định dạng hỗ trợ: JPG, PNG, GIF</p>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default Profile;