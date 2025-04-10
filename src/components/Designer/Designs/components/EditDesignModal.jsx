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
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
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
  const { uploadImages } = useCloudinaryStorage();
  const { products, fetchProducts } = useProductStore();
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
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
      setSelectedFiles({
        imageUrl: null,
        image2: null,
        image3: null,
        designImage1URL: null,
        designImage2URL: null,
        designImage3URL: null,
      });
    } catch (error) {
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
    >
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
              <div style={{ 
                border: '1px dashed #d9d9d9', 
                borderRadius: '2px', 
                background: '#ffffff',
                width: '100%',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <Upload
                  listType="picture"
                  maxCount={3}
                  multiple
                  accept="image/*"
                  style={{ width: '100%', textAlign: 'center' }}
                  beforeUpload={(file, fileList) => {
                    if (fileList.length > 1) {
                      const files = fileList.slice(0, 3);
                      const imageKeys = ['imageUrl', 'image2', 'image3'];
                      const newSelectedFiles = { ...selectedFiles };
                      
                      files.forEach((file, index) => {
                        if (index < 3) {
                          newSelectedFiles[imageKeys[index]] = file;
                        }
                      });
                      
                      setSelectedFiles(newSelectedFiles);
                    } else {
                      const emptyKey = Object.keys(selectedFiles).find(
                        (key) => !selectedFiles[key] && ['imageUrl', 'image2', 'image3'].includes(key)
                      );
                      if (emptyKey) {
                        setSelectedFiles(prev => ({
                          ...prev,
                          [emptyKey]: file
                        }));
                      }
                    }
                    return false;
                  }}
                  onRemove={(file) => {
                    if (file.originFileObj) {
                      const fileUrl = URL.createObjectURL(file.originFileObj);
                      const entries = Object.entries(selectedFiles);
                      for (const [key, value] of entries) {
                        if (value && URL.createObjectURL(value) === fileUrl) {
                          setSelectedFiles(prev => ({
                            ...prev,
                            [key]: null
                          }));
                          break;
                        }
                      }
                    } else {
                      const keyMap = {
                        'imageUrl': ['1', 'imageUrl'],
                        'image2': ['2', 'image2'],
                        'image3': ['3', 'image3']
                      };
                      
                      for (const [key, [uid, fieldName]] of Object.entries(keyMap)) {
                        if (file.uid === uid) {
                          setSelectedFiles(prev => ({
                            ...prev,
                            [key]: null
                          }));
                          
                          const imageUrls = { ...initialValues?.image };
                          imageUrls[fieldName] = '';
                          form.setFieldsValue({ image: imageUrls });
                          break;
                        }
                      }
                    }
                    return true;
                  }}
                  fileList={[
                    ...Object.entries(selectedFiles)
                      .filter(([key, value]) => ['imageUrl', 'image2', 'image3'].includes(key) && value !== null)
                      .map(([key, value]) => ({
                        uid: key,
                        name: `Ảnh mới ${key === 'imageUrl' ? '1' : key === 'image2' ? '2' : '3'}`,
                        status: 'done',
                        originFileObj: value,
                        url: URL.createObjectURL(value)
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
                >
                  <div
                    style={{
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UploadOutlined
                      style={{ fontSize: "32px", color: "#999" }}
                    />
                    <div
                      style={{
                        color: "#666666",
                        fontSize: "14px",
                        marginTop: "8px",
                      }}
                    >
                      Nhấp hoặc kéo thả file vào khu vực này để tải lên
                    </div>
                    <div>Tối đa 3 ảnh</div>
                  </div>
                </Upload>
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="designImage1URL"
              label="Ảnh thiết kế 1"
              rules={[
                {
                  required: initialValues?.designImage1URL ? false : true,
                  message: "Vui lòng tải lên ảnh thiết kế 1!",
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
                    : getFileList(initialValues?.designImage1URL, "Ảnh thiết kế 1")
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
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="designImage2URL"
              label="Ảnh thiết kế 2"
              rules={[
                {
                  required: initialValues?.designImage2URL ? false : true,
                  message: "Vui lòng tải lên ảnh thiết kế 2!",
                },
              ]}
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                accept="image/*"
                fileList={
                  selectedFiles.designImage2URL
                    ? [
                        {
                          uid: "-1",
                          name: "Ảnh mới",
                          status: "done",
                          url: URL.createObjectURL(selectedFiles.designImage2URL),
                        },
                      ]
                    : getFileList(initialValues?.designImage2URL, "Ảnh thiết kế 2")
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
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="designImage3URL"
              label="File thiết kế"
              rules={[
                {
                  required: initialValues?.designImage3URL ? false : true,
                  message: "Vui lòng tải lên file thiết kế!",
                },
              ]}
            >
              <Upload
                maxCount={1}
                accept=".pdf,.doc,.docx,.dwg,.skp"
                fileList={
                  selectedFiles.designImage3URL
                    ? [
                        {
                          uid: "-1",
                          name: "File mới",
                          status: "done",
                        },
                      ]
                    : getFileList(initialValues?.designImage3URL, "File thiết kế")
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
                <Button icon={<UploadOutlined />}>Tải lên file thiết kế</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ textAlign: "right", marginTop: 10 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditDesignModal;
