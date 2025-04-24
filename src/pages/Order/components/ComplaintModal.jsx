import React, { useState, useEffect } from 'react';
import { Modal, Form, Checkbox, Input, Upload, Button, message, Space, Divider, Progress, Card, Image, Radio, Row, Col, Typography, InputNumber } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import useComplaintStore from '../../../stores/useComplaintStore';
import useProductStore from '../../../stores/useProductStore';
import useAuthStore from '../../../stores/useAuthStore';
import { useCloudinaryStorage } from '@/hooks/useCloudinaryStorage';

const { TextArea } = Input;
const { Title, Text } = Typography;

const REFUND_REASONS = [
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
  "Sản phẩm không đúng size/màu",
  "Sản phẩm không phù hợp với nhu cầu sử dụng",
  "Khách hàng muốn đổi sang mẫu khác",
  "Khách hàng đổi ý, muốn trả hàng",
  "Đổi vì lý do tặng quà không phù hợp",
  "Nhân viên tư vấn sai sản phẩm",
  "Sản phẩm bị lỗi nhẹ, cần đổi cái khác",
  "Bao bì bị rách hoặc không còn nguyên vẹn",
  "Muốn nâng cấp sang sản phẩm giá trị cao hơn",
  "Không tương thích với thiết bị đang dùng"
];

const ComplaintModal = ({ 
  visible, 
  onCancel, 
  type,
  selectedProductForComplaint,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
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

    try {
      setIsUploading(true);
      
      // Upload images first
      let imageUrls = [];
      if (fileList.length > 0) {
        try {
          imageUrls = await uploadImages(fileList);
          if (error) {
            throw new Error('Lỗi khi tải ảnh lên');
          }
        } catch (uploadError) {
          message.error('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
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
        imageUrl: imageUrls[0] || '',
        image2: imageUrls[1] || '',
        image3: imageUrls[2] || ''
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
      setFileList([]);
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

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
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

  return (
    <Modal
      title="Yêu cầu trả/đổi hàng"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
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
              label="Lý do"
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
                
                <Divider>Hoặc</Divider>
                
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
            <Form.Item
              label="Hình ảnh minh chứng"
              extra="Tải lên tối đa 3 hình ảnh"
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
              </Upload>
              {isUploading && (
                <Progress percent={progress} status={error ? 'exception' : 'active'} />
              )}
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading || isUploading} 
                  disabled={selectedProducts.length === 0 || (selectedReasons.length === 0 && !form.getFieldValue('customReason'))}
                >
                  Gửi yêu cầu
                </Button>
                <Button onClick={onCancel}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ComplaintModal; 