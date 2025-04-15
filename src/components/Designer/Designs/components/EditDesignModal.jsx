import React, { useState, useEffect } from "react";
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

const EditDesignModal = ({
  visible,
  onCancel,
  onSubmit,
  categories,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const { uploadImages, progress } = useCloudinaryStorage();
  const { products, fetchProducts } = useProductStore();
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({
    imageUrl: null,
    image2: null,
    image3: null,
    designImage1URL: null,
    designImage2URL: null,
    designImage3URL: null,
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (initialValues && visible) {
      const initialQuantities = {};
      const initialProductIds = [];

      initialValues.productDetails?.forEach((detail) => {
        initialQuantities[detail.productId] = detail.quantity;
        initialProductIds.push(detail.productId);
      });

      setProductQuantities(initialQuantities);
      setSelectedProducts(initialProductIds);

      form.setFieldsValue({
        ...initialValues,
        productDetails: initialProductIds,
      });
    }
  }, [initialValues, visible, form]);

  const handleSubmit = async (values) => {
    try {
      const loadingMessage = message.loading("Đang xử lý...", 0);
      setUploading(true);

      const uploadPromises = [];
      const imageUrls = {
        imageUrl: selectedFiles.imageUrl
          ? ""
          : initialValues?.image?.imageUrl || "",
        image2: selectedFiles.image2 ? "" : initialValues?.image?.image2 || "",
        image3: selectedFiles.image3 ? "" : initialValues?.image?.image3 || "",
      };

      const designImages = {
        designImage1URL: selectedFiles.designImage1URL ? "" : initialValues?.designImage1URL || "",
        designImage2URL: selectedFiles.designImage2URL ? "" : initialValues?.designImage2URL || "",
        designImage3URL: selectedFiles.designImage3URL ? "" : initialValues?.designImage3URL || "",
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

      const designData = {
        ...values,
        id: initialValues.id,
        image: imageUrls,
        productDetails: selectedProducts.map(productId => ({
          productId: productId,
          quantity: productQuantities[productId] || 1
        })),
        ...designImages
      };

      await onSubmit(designData);
      loadingMessage();
      setUploading(false);
      setSelectedFiles({
        imageUrl: null,
        image2: null,
        image3: null,
        designImage1URL: null,
        designImage2URL: null,
        designImage3URL: null,
      });
    } catch (error) {
      setUploading(false);
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  const getFileList = (url, fieldName) => {
    if (!url) return [];
    return [
      {
        uid: "-1",
        name: fieldName,
        status: "done",
        url: url,
      },
    ];
  };

  return (
    <Modal
      title="Chỉnh sửa mẫu thiết kế"
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
        padding: '24px 24px 16px 24px' // Restore padding
      }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên mẫu thiết kế"
                rules={[{ required: true, message: "Vui lòng nhập tên mẫu thiết kế" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="designPrice"
                label="Giá mẫu thiết kế"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
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
                rules={[{ required: true, message: "Vui lòng chọn ít nhất một sản phẩm" }]}
              >
                <div>
                  <Select
                    mode="multiple"
                    placeholder="Chọn sản phẩm"
                    style={{ marginBottom: 16 }}
                    value={selectedProducts}
                    onChange={(selectedIds) => {
                      const newQuantities = { ...productQuantities };
                      selectedIds.forEach((id) => {
                        if (!newQuantities[id]) {
                          newQuantities[id] = 1;
                        }
                      });
                      setProductQuantities(newQuantities);
                      setSelectedProducts(selectedIds);
                      form.setFieldsValue({ productDetails: selectedIds });
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

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="images"
                label="Ảnh thiết kế"
                rules={[
                  {
                    required: !initialValues?.image?.imageUrl && !initialValues?.image?.image2 && !initialValues?.image?.image3,
                    message: "Vui lòng tải lên ít nhất 3 ảnh!",
                  },
                ]}
              >
                <Upload.Dragger
                  listType="picture-card"
                  maxCount={3}
                  multiple
                  accept="image/*"
                  fileList={[
                    ...Object.entries(selectedFiles)
                      .filter(([key, value]) => ['imageUrl', 'image2', 'image3'].includes(key) && value !== null)
                      .map(([key, value]) => ({
                        uid: key,
                        name: `Ảnh mới ${key === 'imageUrl' ? '1' : key === 'image2' ? '2' : '3'}`,
                        status: 'done',
                        originFileObj: value,
                        url: value instanceof File ? URL.createObjectURL(value) : null
                      })),
                    ...(!selectedFiles.imageUrl && initialValues?.image?.imageUrl ? [{
                      uid: "1",
                      name: "Ảnh 1",
                      status: "done",
                      url: initialValues.image.imageUrl,
                    }] : []),
                    ...(!selectedFiles.image2 && initialValues?.image?.image2 ? [{
                      uid: "2",
                      name: "Ảnh 2",
                      status: "done",
                      url: initialValues.image.image2,
                    }] : []),
                    ...(!selectedFiles.image3 && initialValues?.image?.image3 ? [{
                      uid: "3",
                      name: "Ảnh 3",
                      status: "done",
                      url: initialValues.image.image3,
                    }] : [])
                  ]}
                  beforeUpload={(file, fileList) => {
                    // Determine which files to add based on available slots
                    const availableSlots = ['imageUrl', 'image2', 'image3'].filter(
                      key => !selectedFiles[key] && (!initialValues?.image?.[key] || key === 'imageUrl' && !initialValues?.image?.imageUrl || key === 'image2' && !initialValues?.image?.image2 || key === 'image3' && !initialValues?.image?.image3)
                    );
                    
                    if (fileList.length > 1) {
                      // Handle multiple files upload
                      const newSelectedFiles = { ...selectedFiles };
                      let slotIndex = 0;
                      
                      for (let i = 0; i < fileList.length && slotIndex < availableSlots.length; i++) {
                        if (availableSlots[slotIndex]) {
                          newSelectedFiles[availableSlots[slotIndex]] = fileList[i];
                          slotIndex++;
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
                    if (file.originFileObj) {
                      // For newly added files
                      const keyToRemove = file.uid;
                      setSelectedFiles(prev => ({
                        ...prev,
                        [keyToRemove]: null
                      }));
                    } else {
                      // For existing files
                      const keyMap = {
                        '1': 'imageUrl',
                        '2': 'image2',
                        '3': 'image3'
                      };
                      
                      const keyToRemove = keyMap[file.uid];
                      if (keyToRemove) {
                        // Mark in the form that we want to remove this image
                        const imageUrls = { ...initialValues?.image };
                        imageUrls[keyToRemove] = '';
                        form.setFieldsValue({ image: imageUrls });
                      }
                    }
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
                  {
                    required: initialValues?.designImage1URL ? false : true,
                    message: "Vui lòng tải lên ảnh thiết kế!",
                  },
                ]}
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  accept="image/*"
                  fileList={
                    selectedFiles.designImage1URL
                      ? [
                          {
                            uid: "-1",
                            name: "Ảnh mới",
                            status: "done",
                            url: URL.createObjectURL(selectedFiles.designImage1URL),
                          },
                        ]
                      : getFileList(initialValues?.designImage1URL, "Ảnh thiết kế")
                  }
                  beforeUpload={(file) => {
                    setSelectedFiles((prev) => ({ ...prev, designImage1URL: file }));
                    return false;
                  }}
                  onRemove={() => {
                    setSelectedFiles((prev) => ({ ...prev, designImage1URL: null }));
                    form.setFieldsValue({ designImage1URL: "" });
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
                  {
                    required: initialValues?.designImage2URL ? false : true,
                    message: "Vui lòng tải lên file hướng dẫn lắp đặt (PDF)!",
                  },
                ]}
              >
                <Upload
                  maxCount={1}
                  accept=".pdf"
                  fileList={
                    selectedFiles.designImage2URL
                      ? [
                          {
                            uid: "-1",
                            name: "File PDF mới",
                            status: "done",
                          },
                        ]
                      : getFileList(initialValues?.designImage2URL, "Hướng dẫn lắp đặt (PDF)")
                  }
                  beforeUpload={(file) => {
                    setSelectedFiles((prev) => ({ ...prev, designImage2URL: file }));
                    return false;
                  }}
                  onRemove={() => {
                    setSelectedFiles((prev) => ({ ...prev, designImage2URL: null }));
                    form.setFieldsValue({ designImage2URL: "" });
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
                  {
                    required: initialValues?.designImage3URL ? false : true,
                    message: "Vui lòng tải lên video hướng dẫn lắp đặt!",
                  },
                ]}
              >
                <Upload
                  maxCount={1}
                  accept="video/*,.mp4,.avi,.mov,.wmv"
                  fileList={
                    selectedFiles.designImage3URL
                      ? [
                          {
                            uid: "-1",
                            name: "Video mới",
                            status: "done",
                          },
                        ]
                      : getFileList(initialValues?.designImage3URL, "Video hướng dẫn lắp đặt")
                  }
                  beforeUpload={(file) => {
                    setSelectedFiles((prev) => ({ ...prev, designImage3URL: file }));
                    return false;
                  }}
                  onRemove={() => {
                    setSelectedFiles((prev) => ({ ...prev, designImage3URL: null }));
                    form.setFieldsValue({ designImage3URL: "" });
                  }}
                >
                  <Button icon={<UploadOutlined />}>Tải lên video</Button>
                </Upload>
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
          Cập nhật
        </Button>
      </div>
    </Modal>
  );
};

export default EditDesignModal;
