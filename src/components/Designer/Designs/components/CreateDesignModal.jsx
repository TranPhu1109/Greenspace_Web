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
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useCloudinaryStorage } from "../../../../hooks/useCloudinaryStorage";
import useProductStore from "../../../../stores/useProductStore";
import EditorComponent from "@/components/Common/EditorComponent";

const { Option } = Select;

const CreateDesignModal = ({ visible, onCancel, onSubmit, categories }) => {
  const [form] = Form.useForm();
  const { uploadImages } = useCloudinaryStorage();
  const { products, fetchProducts } = useProductStore();
  const [selectedFiles, setSelectedFiles] = useState({
    imageUrl: null,
    image2: null,
    image3: null,
    designImage1URL: null,
    designImage2URL: null,
    designImage3URL: null,
  });
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (values) => {
    try {
      const loadingMessage = message.loading("Đang xử lý...", 0);

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
    >
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

        

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="images"
              label="Ảnh thiết kế"
              rules={[
                { required: true, message: "Vui lòng tải lên ít nhất 3 ảnh!" },
              ]}
            >
              <div
                style={{
                  border: "1px dashed #d9d9d9",
                  borderRadius: "2px",
                  background: "#ffffff",
                  width: "100%",
                  minHeight: "180px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Upload
                  listType="picture"
                  maxCount={3}
                  multiple
                  accept="image/*"
                  style={{ width: "100%", textAlign: "center" }}
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
                    // Tìm key của file cần xóa bằng cách so sánh URL
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
                    return true;
                  }}
                  fileList={Object.entries(selectedFiles)
                    .filter(([key, value]) => ['imageUrl', 'image2', 'image3'].includes(key) && value !== null)
                    .map(([key, value]) => ({
                      uid: key, // Sử dụng key làm uid
                      name: `Ảnh ${key === 'imageUrl' ? '1' : key === 'image2' ? '2' : '3'}`,
                      status: 'done',
                      originFileObj: value,
                      url: URL.createObjectURL(value)
                    }))
                  }
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
                { required: true, message: "Vui lòng tải lên ảnh thiết kế 1!" },
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
                { required: true, message: "Vui lòng tải lên ảnh thiết kế 2!" },
              ]}
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                accept="image/*"
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
                { required: true, message: "Vui lòng tải lên file thiết kế!" },
              ]}
            >
              <Upload
                maxCount={1}
                accept=".pdf,.doc,.docx,.dwg,.skp"
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
                <Button icon={<UploadOutlined />}>Tải lên file thiết kế</Button>
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

        <Form.Item style={{ textAlign: "right", marginTop: 10 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            Thêm mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDesignModal;
