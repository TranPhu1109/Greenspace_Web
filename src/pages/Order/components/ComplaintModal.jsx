import React, { useState, useEffect } from 'react';
import { Modal, Form, Checkbox, Input, Upload, Button, message, Space, Divider, Progress, Card, Image, Radio, Row, Col, Typography, InputNumber, Alert } from 'antd';
import { UploadOutlined, VideoCameraOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import useComplaintStore from '../../../stores/useComplaintStore';
import useProductStore from '../../../stores/useProductStore';
import useAuthStore from '../../../stores/useAuthStore';
import { useCloudinaryStorage } from '@/hooks/useCloudinaryStorage';
import Paragraph from 'antd/es/skeleton/Paragraph';

const { TextArea } = Input;
const { Title, Text } = Typography;

const REFUND_REASONS = [
  "Tôi đổi ý và muốn trả hàng",
  "Sản phẩm bị lỗi kỹ thuật",
  "Sản phẩm bị hư hỏng trong quá trình vận chuyển",
  "Giao sai sản phẩm",
  "Sản phẩm giao thiếu",
  "Sản phẩm không đúng mô tả",
  "Sản phẩm quá hạn sử dụng",
  "Không còn nhu cầu sử dụng",
  "Đã thanh toán nhưng không nhận được hàng",
  "Sản phẩm bị lỗi sản xuất",
  "Giao hàng trễ so với cam kết"
];

const EXCHANGE_REASONS = [
  "Sản phẩm không đúng kích thước hoặc màu sắc",
  "Sản phẩm không phù hợp với phong cách không gian của tôi",
  "Muốn đổi sang mẫu thiết kế khác phù hợp hơn",
  "Tặng quà không phù hợp, muốn đổi sang sản phẩm khác",
  "Nhân viên tư vấn sai hoặc chưa đúng nhu cầu",
  "Sản phẩm có lỗi nhẹ, mong muốn đổi cái khác",
  "Bao bì sản phẩm bị rách hoặc móp méo khi nhận",
  "Không tương thích với không gian hiện tại (kích thước, màu sắc, chất liệu)"
];

const ComplaintModal = ({
  visible,
  onCancel,
  type,
  selectedProductForComplaint,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [videoFile, setVideoFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [complaintType, setComplaintType] = useState(type || 'refund');
  const { createComplaint, loading } = useComplaintStore();
  const { getProductById } = useProductStore();
  const { user } = useAuthStore();
  const { uploadImages, progress, error } = useCloudinaryStorage();

  useEffect(() => {
    if (visible) {
      fetchProductDetails();
      setSelectedProducts([]);
      setSelectedReasons([]);
      setComplaintType(type || 'refund');
      setVideoFile(null);
      setImageFiles([]);
      form.resetFields();
    }
  }, [visible, selectedProductForComplaint, type, form]);

  const fetchProductDetails = async () => {
    if (!selectedProductForComplaint?.orderDetails) return;

    const details = {};
    for (const item of selectedProductForComplaint.orderDetails) {
      try {
        const product = await getProductById(item.productId);
        if (product) {
          details[item.productId] = product;
        }
      } catch (error) {
        console.error(`Error fetching product ${item.productId}:`, error);
      }
    }
    setProductDetails(details);
  };

  const handleProductSelect = (product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.productId === product.productId);
      if (isSelected) {
        return prev.filter(p => p.productId !== product.productId);
      } else {
        return [...prev, { ...product, selectedQuantity: product.quantity }];
      }
    });
  };

  const handleQuantityChange = (productId, value) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.productId === productId
          ? { ...p, selectedQuantity: value }
          : p
      )
    );
  };

  const handleSubmit = async (values) => {
    if (selectedProducts.length === 0) {
      message.error('Vui lòng chọn ít nhất một sản phẩm cần khiếu nại');
      return;
    }

    if (!videoFile) {
      message.error('Vui lòng tải lên một video minh chứng');
      return;
    }

    try {
      setIsUploading(true);

      // Upload video and images
      let uploadedFiles = [];
      const filesToUpload = [videoFile, ...imageFiles];

      if (filesToUpload.length > 0) {
        try {
          uploadedFiles = await uploadImages(filesToUpload);
          if (error) {
            throw new Error('Lỗi khi tải lên');
          }
        } catch (uploadError) {
          message.error('Lỗi khi tải lên. Vui lòng thử lại.');
          setIsUploading(false);
          return;
        }
      }

      // Combine selected reasons and custom reason
      const allReasons = [
        ...selectedReasons,
        ...(values.customReason ? [values.customReason] : [])
      ].join('; ');

      const images = {
        imageUrl: uploadedFiles[0] || '', // Video URL
        image2: uploadedFiles[1] || '',   // First image URL
        image3: uploadedFiles[2] || ''    // Second image URL
      };

      // Prepare complaint details for all selected products
      const complaintDetails = selectedProducts.map(product => ({
        productId: product.productId,
        quantity: product.selectedQuantity
      }));

      // Create a single complaint with all product details
      await createComplaint({
        userId: user?.id,
        orderId: selectedProductForComplaint.parentOrder.id,
        complaintType: values.complaintType === 'refund' ? 1 : 0, // 1 for refund, 0 for exchange
        reason: allReasons,
        image: images,
        complaintDetails: complaintDetails
      });

      message.success(values.complaintType === 'refund'
        ? 'Yêu cầu hoàn tiền đã được gửi thành công'
        : 'Yêu cầu đổi trả đã được gửi thành công'
      );

      onCancel();
      form.resetFields();
      setVideoFile(null);
      setImageFiles([]);
      setSelectedReasons([]);
      setSelectedProducts([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error('Có lỗi xảy ra khi gửi yêu cầu');
      console.error('Error submitting complaint:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoUpload = (info) => {
    const { file } = info;
    // Only process when status is 'done' or it's a raw File object
    if (file && (file.status === 'done' || file instanceof File)) {
      // Check if it's a video file
      if (!file.type || !file.type.includes('video/')) {
        message.error('Vui lòng tải lên một tệp video');
        return;
      }
      console.log('Setting video file:', file);
      setVideoFile(file.originFileObj || file);
    }
  };

  const handleImageUpload = (info) => {
    const { fileList } = info;
    // Filter to maximum 2 images and extract just the file objects
    const filteredFileList = fileList
      .slice(0, 2)
      .map(file => {
        if (file.originFileObj) {
          return file.originFileObj;
        }
        return file;
      });

    setImageFiles(filteredFileList);
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
  };

  const handleRemoveImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleReasonChange = (checkedValues) => {
    setSelectedReasons(checkedValues);
  };

  const handleComplaintTypeChange = (e) => {
    const newType = e.target.value;
    setComplaintType(newType);
    setSelectedReasons([]);
    form.setFieldsValue({ complaintType: newType });
  };

  // Function to create object URL for preview
  const getFilePreviewUrl = (file) => {
    if (!file || !(file instanceof File)) return '';
    try {
      console.log('Creating preview URL for:', file.name, file.type);
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Error creating object URL:', error);
      return '';
    }
  };

  return (
    <Modal
      title="Yêu cầu trả/đổi hàng"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      styles={{
        body: {
          padding: 0,
          maxHeight: '83vh',
          overflow: 'hidden',
        },
      }}
    >
      <div
        style={{
          padding: '0px 16px',
          maxHeight: 'calc(83vh - 60px)', // Trừ chiều cao tiêu đề
          overflowY: 'auto',
          scrollbarWidth: 'thin', // Firefox
          scrollbarColor: '#d9d9d9 transparent',
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ complaintType: complaintType }}
        >
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Form.Item
                name="complaintType"
                label="Loại yêu cầu"
                rules={[{ required: true, message: 'Vui lòng chọn loại yêu cầu' }]}
              >
                <Radio.Group onChange={handleComplaintTypeChange} value={complaintType}>
                  <Radio.Button value="refund">Trả hàng & Hoàn tiền</Radio.Button>
                  <Radio.Button value="exchange">Đổi hàng</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Card
                style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 16 }}
                bodyStyle={{ padding: 16 }}
              >
                <Space direction="vertical" size={4}>
                  <Text strong style={{ fontSize: 16 }}>🛍️ Cách chọn sản phẩm khiếu nại</Text>
                  <Text type="secondary">
                    • Nhấn vào từng sản phẩm bên dưới để <Text strong>chọn hoặc bỏ chọn</Text> sản phẩm muốn khiếu nại.
                  </Text>
                  <Text type="secondary">
                    • Sau khi chọn, bạn có thể <Text strong>điều chỉnh số lượng</Text> sản phẩm muốn hoàn tiền hoặc đổi hàng.
                  </Text>
                  <Text type="secondary">
                    • Vui lòng chọn ít nhất <Text strong>một sản phẩm</Text> trước khi gửi yêu cầu.
                  </Text>
                  <Text type="secondary">
                    • Bạn có thể chọn nhiều sản phẩm trong cùng một yêu cầu 💡
                  </Text>
                </Space>
              </Card>

              <Title level={5}>Chọn sản phẩm cần khiếu nại</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                {selectedProductForComplaint?.orderDetails?.map((item) => {
                  const isSelected = selectedProducts.some(p => p.productId === item.productId);
                  const selectedProduct = selectedProducts.find(p => p.productId === item.productId);
                  const productDetail = productDetails[item.productId];

                  return (
                    <Card
                      key={item.productId}
                      hoverable
                      style={{
                        width: '100%',
                        border: isSelected ? '2px solid #52c41a' : '1px solid #f0f0f0',
                        cursor: 'pointer'
                      }}
                      styles={{ body: { padding: '12px' } }}
                      onClick={() => handleProductSelect(item)}
                    >
                      <Row align="middle" gutter={16}>
                        <Col>
                          <Image
                            src={productDetail?.image?.imageUrl}
                            alt={productDetail?.name}
                            width={80}
                            height={80}
                            style={{ objectFit: 'cover' }}
                          />
                        </Col>
                        <Col flex="auto">
                          <Text strong>{productDetail?.name}</Text>
                          <br />
                          <Text type="secondary">Số lượng đặt: {item.quantity}</Text>
                          <br />
                          <Text type="secondary">Đơn giá: {item.price.toLocaleString()}đ</Text>
                          {isSelected && (
                            <div style={{ marginTop: 8 }}>
                              <Text>Số lượng {complaintType === 'refund' ? 'hoàn tiền' : 'đổi trả'}:</Text>
                              <InputNumber
                                min={1}
                                max={item.quantity}
                                value={selectedProduct?.selectedQuantity}
                                onChange={(value) => handleQuantityChange(item.productId, value)}
                                style={{ marginLeft: 8, width: 80 }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}
                        </Col>
                      </Row>
                    </Card>
                  );
                })}
              </Space>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Lý do khiếu nại"
                required
                tooltip="Vui lòng chọn ít nhất một lý do hoặc nhập lý do khác"
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Checkbox.Group
                    style={{ width: '100%' }}
                    onChange={handleReasonChange}
                    value={selectedReasons}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {(complaintType === 'refund' ? REFUND_REASONS : EXCHANGE_REASONS).map((reason, index) => (
                        <Checkbox key={index} value={reason} style={{ marginLeft: 0 }}>
                          {reason}
                        </Checkbox>
                      ))}
                    </Space>
                  </Checkbox.Group>

                  <Divider>Lý do khác</Divider>

                  <Form.Item
                    name="customReason"
                    style={{ marginBottom: 0 }}
                  >
                    <TextArea
                      placeholder="Nhập lý do khác (nếu có)"
                      rows={3}
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                </Space>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Card
                style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', marginBottom: 16 }}
                bodyStyle={{ padding: 16 }}
              >
                <Space direction="vertical" size={4}>
                  <Text strong style={{ fontSize: 16 }}>📸 Hướng dẫn đính kèm minh chứng</Text>
                  <Text type="secondary">
                    • <Text strong>Bắt buộc:</Text> Tải lên <Text underline>01 video minh chứng</Text> cho sản phẩm bị lỗi, không đúng mô tả hoặc có vấn đề.
                  </Text>
                  <Text type="secondary">
                    • <Text strong>Tùy chọn:</Text> Bạn có thể tải thêm tối đa <Text underline>02 hình ảnh</Text> để hỗ trợ xử lý nhanh hơn.
                  </Text>
                  <Text type="secondary">
                    • Hỗ trợ định dạng: <Text code>.mp4, .mov</Text> cho video – <Text code>.jpg, .png</Text> cho hình ảnh.
                  </Text>
                </Space>
              </Card>
            </Col>

            <Col span={24}>
              <Form.Item
                label={<span>Video minh chứng <span style={{ color: '#ff4d4f' }}>*</span></span>}
                required
                tooltip="Vui lòng tải lên video minh chứng vấn đề của sản phẩm (bắt buộc)"
              >
                {!videoFile ? (
                  <Upload
                    accept="video/*"
                    showUploadList={false}
                    customRequest={({ file, onSuccess }) => {
                      setTimeout(() => {
                        onSuccess("ok");
                      }, 0);
                    }}
                    onChange={handleVideoUpload}
                  >
                    <Button icon={<VideoCameraOutlined />}>Tải lên video</Button>
                  </Upload>
                ) : (
                  <Card>
                    <Row align="middle" justify="space-between">
                      <Col>
                        <Space>
                          <VideoCameraOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                          <Text>{videoFile.name}</Text>
                        </Space>
                      </Col>
                      <Col>
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          onClick={handleRemoveVideo}
                        />
                      </Col>
                    </Row>
                    <div style={{ marginTop: 12 }}>
                      <video
                        src={getFilePreviewUrl(videoFile)}
                        controls
                        style={{ width: '100%', maxHeight: '200px' }}
                        onError={(e) => console.error('Video error:', e)}
                      />
                    </div>
                  </Card>
                )}
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Hình ảnh minh chứng (tối đa 2 hình)"
                tooltip="Bạn có thể tải lên tối đa 2 hình ảnh bổ sung"
              >
                <Upload
                  accept="image/*"
                  listType="picture-card"
                  fileList={imageFiles.map((file, index) => ({
                    uid: `-${index}`,
                    name: file.name,
                    status: 'done',
                    url: file instanceof File ? getFilePreviewUrl(file) : file.url,
                    originFileObj: file instanceof File ? file : null
                  }))}
                  onChange={handleImageUpload}
                  onPreview={(file) => {
                    const previewUrl = file.url || getFilePreviewUrl(file.originFileObj);
                    window.open(previewUrl, '_blank');
                  }}
                  beforeUpload={(file) => {
                    // Check if it's an image file
                    if (!file.type || !file.type.includes('image/')) {
                      message.error('Vui lòng tải lên một tệp hình ảnh');
                      return Upload.LIST_IGNORE;
                    }

                    // Check if we already have 2 images
                    if (imageFiles.length >= 2) {
                      message.warning('Chỉ được tải lên tối đa 2 hình ảnh');
                      return Upload.LIST_IGNORE;
                    }

                    // Prevent default upload behavior
                    return false;
                  }}
                  maxCount={2}
                  multiple={false}
                  customRequest={({ file, onSuccess }) => {
                    setTimeout(() => {
                      onSuccess("ok");
                    }, 0);
                  }}
                >
                  {imageFiles.length < 2 && (
                    <div>
                      <PictureOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>
                {isUploading && (
                  <Progress percent={progress} status={error ? 'exception' : 'active'} />
                )}
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                  <Button onClick={onCancel}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading || isUploading}
                    disabled={
                      selectedProducts.length === 0 ||
                      (selectedReasons.length === 0 && !form.getFieldValue('customReason')) ||
                      !videoFile
                    }
                  >
                    Gửi yêu cầu
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

export default ComplaintModal; 