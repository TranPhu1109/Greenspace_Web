import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  Upload,
  message,
} from "antd";
import { PlusOutlined, UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { useCloudinaryStorage } from "../../../../hooks/useCloudinaryStorage";
import useProductStore from "../../../../stores/useProductStore";
import EditorComponent from "@/components/Common/EditorComponent";

const { Option } = Select;

const CreateDesignModal = ({ visible, onCancel, onSubmit, categories }) => {
  const [form] = Form.useForm();
  const { uploadImages, progress } = useCloudinaryStorage();
  const { products, fetchProducts } = useProductStore();
  const [selectedFiles, setSelectedFiles] = useState({
    imageUrl: null,
    image2: null,
    image3: null,
    designImage1URL: null,
    designImage2URL: null,
    designImage3URL: null,
  });
  const [uploading, setUploading] = useState(false);
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (values) => {
    try {
      const loadingMessage = message.loading("Đang xử lý...", 0);
      setUploading(true);

      const uploadPromises = [];
      const imageUrls = { imageUrl: "", image2: "", image3: "" };
      let designImages = {
        designImage1URL: "",
        designImage2URL: "",
        designImage3URL: "",
      };

      // Upload main images
      if (selectedFiles.imageUrl) {
        uploadPromises.push(
          uploadImages([selectedFiles.imageUrl]).then((urls) => {
            imageUrls.imageUrl = urls[0];
          })
        );
      }

      if (selectedFiles.image2) {
        uploadPromises.push(
          uploadImages([selectedFiles.image2]).then((urls) => {
            imageUrls.image2 = urls[0];
          })
        );
      }

      if (selectedFiles.image3) {
        uploadPromises.push(
          uploadImages([selectedFiles.image3]).then((urls) => {
            imageUrls.image3 = urls[0];
          })
        );
      }

      // Upload design images
      if (selectedFiles.designImage1URL) {
        uploadPromises.push(
          uploadImages([selectedFiles.designImage1URL]).then((urls) => {
            designImages.designImage1URL = urls[0];
          })
        );
      }

      if (selectedFiles.designImage2URL) {
        uploadPromises.push(
          uploadImages([selectedFiles.designImage2URL]).then((urls) => {
            designImages.designImage2URL = urls[0];
          })
        );
      }

      // Upload design file
      if (selectedFiles.designImage3URL) {
        uploadPromises.push(
          uploadImages([selectedFiles.designImage3URL]).then((urls) => {
            designImages.designImage3URL = urls[0];
          })
        );
      }

      await Promise.all(uploadPromises);

      const productDetails = selectedProducts.map((productId) => ({
        productId: productId,
        quantity: productQuantities[productId] || 1,
      }));

      const designData = {
        ...values,
        image: imageUrls,
        productDetails: productDetails,
        ...designImages,
      };

      await onSubmit(designData);
      loadingMessage();
      setUploading(false);
      form.resetFields();
      setSelectedFiles({
        imageUrl: null,
        image2: null,
        image3: null,
        designImage1URL: null,
        designImage2URL: null,
        designImage3URL: null,
      });
      setSelectedProducts([]);
      setProductQuantities({});
    } catch (error) {
      setUploading(false);
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  return (
    <Modal
      title="Thêm mẫu thiết kế mới"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      bodyStyle={{ 
        height: 'calc(85vh - 110px)', // 85vh minus header and footer space
        overflow: 'hidden', // Changed from overflowY: 'auto'
        padding: 0, // Remove default padding
        position: 'relative' // For absolute positioning of footer
      }}
      style={{ 
        top: '50px', // Position from top of screen
        maxHeight: '90vh' // Maximum height relative to viewport
      }}
    >
      <div style={{ 
        height: 'calc(100% - 64px)', // Full height minus footer height
        overflow: 'auto',
        padding: '24px 24px 16px 24px', // Restore padding
        scrollbarWidth: 'thin',
        scrollbarColor: '#808080 #f0f0f0'
      }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên mẫu thiết kế"
                rules={[
                  { required: true, message: "Vui lòng nhập tên mẫu thiết kế" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="designPrice"
                label="Giá thiết kế"
                rules={[
                  { required: true, message: "Vui lòng nhập giá thiết kế" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="designIdeasCategoryId"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select>
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="productDetails"
                label="Sản phẩm"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một sản phẩm",
                  },
                ]}
              >
                <div>
                  <Select
                    mode="multiple"
                    placeholder="Chọn sản phẩm"
                    style={{ marginBottom: 16 }}
                    onChange={(selectedIds) => {
                      const newQuantities = {};
                      selectedIds.forEach((id) => {
                        newQuantities[id] = productQuantities[id] || 1;
                      });
                      setProductQuantities(newQuantities);
                      setSelectedProducts(selectedIds);

                      const productDetails = selectedIds.map((id) => ({
                        value: id,
                        quantity: newQuantities[id],
                      }));
                      form.setFieldsValue({ productDetails });
                    }}
                  >
                    {products.map((product) => (
                      <Option key={product.id} value={product.id}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {product.image?.imageUrl && (
                            <img
                              src={product.image.imageUrl}
                              alt={product.name}
                              style={{
                                width: 40,
                                height: 40,
                                marginRight: 10,
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: "bold" }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#888" }}>
                              {product.price
                                ? product.price.toLocaleString() + " đ"
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>

                  {selectedProducts.length > 0 && (
                    <div
                      style={{
                        border: "1px solid #d9d9d9",
                        padding: "16px",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
                        Số lượng sản phẩm:
                      </div>
                      {selectedProducts.map((productId) => {
                        const product = products.find((p) => p.id === productId);
                        return (
                          <div
                            key={productId}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "8px",
                            }}
                          >
                            <img
                              src={product?.image?.imageUrl}
                              alt={product?.name}
                              style={{
                                width: 30,
                                height: 30,
                                marginRight: 10,
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                            <span style={{ flex: 1 }}>{product?.name}</span>
                            <InputNumber
                              min={1}
                              value={productQuantities[productId]}
                              onChange={(quantity) => {
                                const newQuantities = {
                                  ...productQuantities,
                                  [productId]: quantity,
                                };
                                setProductQuantities(newQuantities);

                                const updatedDetails = selectedProducts.map(
                                  (id) => ({
                                    value: id,
                                    quantity:
                                      id === productId
                                        ? quantity
                                        : productQuantities[id] || 1,
                                  })
                                );
                                form.setFieldsValue({
                                  productDetails: updatedDetails,
                                });
                              }}
                              style={{ width: 80 }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>

          {uploading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>Đang tải lên: {progress}%</div>
              <div style={{ width: '100%', background: '#f0f0f0', borderRadius: 4 }}>
                <div 
                  style={{ 
                    height: 8, 
                    background: '#1890ff', 
                    borderRadius: 4,
                    width: `${progress}%`,
                    transition: 'width 0.3s'
                  }} 
                />
              </div>
            </div>
          )}

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="images"
                label="Ảnh thiết kế"
                rules={[
                  { required: true, message: "Vui lòng tải lên ít nhất 3 ảnh!" },
                ]}
              >
                <Upload.Dragger
                  listType="picture-card"
                  maxCount={3}
                  multiple
                  accept="image/*"
                  fileList={Object.entries(selectedFiles)
                    .filter(([key, value]) => ['imageUrl', 'image2', 'image3'].includes(key) && value !== null)
                    .map(([key, value]) => ({
                      uid: key,
                      name: `Ảnh ${key === 'imageUrl' ? '1' : key === 'image2' ? '2' : '3'}`,
                      status: 'done',
                      originFileObj: value,
                      url: value instanceof File ? URL.createObjectURL(value) : null
                    }))
                  }
                  beforeUpload={(file, fileList) => {
                    // Determine which files to add based on available slots
                    const availableSlots = ['imageUrl', 'image2', 'image3'].filter(
                      key => !selectedFiles[key]
                    );
                    
                    if (fileList.length > 1) {
                      // Handle multiple files upload
                      const newSelectedFiles = { ...selectedFiles };
                      let slotIndex = 0;
                      
                      for (let i = 0; i < fileList.length && i < 3; i++) {
                        if (availableSlots[slotIndex]) {
                          newSelectedFiles[availableSlots[slotIndex]] = fileList[i];
                          slotIndex++;
                        } else {
                          // No more slots available
                          break;
                        }
                      }
                      
                      setSelectedFiles(newSelectedFiles);
                    } else {
                      // Handle single file upload
                      if (availableSlots.length > 0) {
                        setSelectedFiles(prev => ({
                          ...prev,
                          [availableSlots[0]]: file
                        }));
                      } else {
                        message.warning('Bạn đã tải lên tối đa 3 ảnh. Vui lòng xóa một ảnh trước khi tải lên ảnh mới.');
                      }
                    }
                    return false; // Prevent default upload behavior
                  }}
                  onRemove={(file) => {
                    const keyToRemove = file.uid;
                    setSelectedFiles(prev => ({
                      ...prev,
                      [keyToRemove]: null
                    }));
                    return true;
                  }}
                  style={{ 
                    background: '#f7f9fc' 
                  }}
                >
                  {Object.values(selectedFiles).filter(Boolean).length >= 3 ? null : (
                    <div style={{ padding: '16px 0' }}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: '#40a9ff', fontSize: '48px' }} />
                      </p>
                      <p className="ant-upload-text" style={{ fontWeight: 500, marginBottom: '8px' }}>
                        Kéo thả ảnh vào đây hoặc nhấp để tải lên
                      </p>
                      <p className="ant-upload-hint" style={{ color: '#888' }}>
                        Hỗ trợ tải lên đơn lẻ hoặc hàng loạt. Tối đa 3 ảnh.
                      </p>
                      <p style={{ fontSize: '12px', color: '#1890ff', marginTop: '8px' }}>
                        Nên sử dụng ảnh có chất lượng cao để hiển thị tốt nhất
                      </p>
                    </div>
                  )}
                </Upload.Dragger>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="designImage1URL"
                label="Ảnh thiết kế"
                rules={[
                  { required: true, message: "Vui lòng tải lên ảnh thiết kế!" },
                ]}
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  accept="image/*"
                  beforeUpload={(file) => {
                    setSelectedFiles((prev) => ({
                      ...prev,
                      designImage1URL: file,
                    }));
                    return false;
                  }}
                  onRemove={() => {
                    setSelectedFiles((prev) => ({
                      ...prev,
                      designImage1URL: null,
                    }));
                  }}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên ảnh</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="designImage2URL"
                label="Hướng dẫn lắp đặt (PDF)"
                rules={[
                  { required: true, message: "Vui lòng tải lên file hướng dẫn lắp đặt (PDF)!" },
                ]}
              >
                <Upload
                  maxCount={1}
                  accept=".pdf"
                  beforeUpload={(file) => {
                    setSelectedFiles((prev) => ({
                      ...prev,
                      designImage2URL: file,
                    }));
                    return false;
                  }}
                  onRemove={() => {
                    setSelectedFiles((prev) => ({
                      ...prev,
                      designImage2URL: null,
                    }));
                  }}
                >
                  <Button icon={<UploadOutlined />}>Tải lên file PDF</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="designImage3URL"
                label="Video hướng dẫn lắp đặt"
                rules={[
                  { required: true, message: "Vui lòng tải lên video hướng dẫn lắp đặt!" },
                ]}
              >
                <Upload
                  maxCount={1}
                  accept="video/*,.mp4,.avi,.mov,.wmv"
                  beforeUpload={(file) => {
                    setSelectedFiles((prev) => ({
                      ...prev,
                      designImage3URL: file,
                    }));
                    return false;
                  }}
                  onRemove={() => {
                    setSelectedFiles((prev) => ({
                      ...prev,
                      designImage3URL: null,
                    }));
                  }}
                >
                  <Button icon={<UploadOutlined />}>Tải lên video</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <EditorComponent
              value={form.getFieldValue('description') || ''}
              onChange={(value) => form.setFieldsValue({ description: value })}
              height={300}
            />
          </Form.Item>
        </Form>
      </div>
      
      {/* Fixed footer */}
      <div style={{ 
        position: 'absolute',
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #f0f0f0',
        padding: '16px 24px',
        textAlign: 'right',
        background: '#fff',
        zIndex: 1
      }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Hủy
        </Button>
        <Button type="primary" onClick={() => form.submit()} loading={uploading}>
          Thêm mới
        </Button>
      </div>
    </Modal>
  );
};

export default CreateDesignModal;
