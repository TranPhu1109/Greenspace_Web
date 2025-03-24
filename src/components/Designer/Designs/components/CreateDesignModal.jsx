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
import { PlusOutlined } from "@ant-design/icons";
import { useCloudinaryStorage } from "../../../../hooks/useCloudinaryStorage";
import useProductStore from "../../../../stores/useProductStore";

const { Option } = Select;

const CreateDesignModal = ({ visible, onCancel, onSubmit, categories }) => {
  const [form] = Form.useForm();
  const { uploadImages } = useCloudinaryStorage();
  const { products, fetchProducts } = useProductStore();
  const [selectedFiles, setSelectedFiles] = useState({
    imageUrl: null,
    image2: null,
    image3: null,
  });

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (values) => {
    try {
      const loadingMessage = message.loading("Đang xử lý...", 0);

      const uploadPromises = [];
      const imageUrls = { imageUrl: "", image2: "", image3: "" };

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

      await Promise.all(uploadPromises);

      const designData = {
        ...values,
        image: imageUrls,
        productDetails: values.productDetails.map(product => ({
          productId: product.productId || product.value,
          quantity: product.quantity || 1
        }))
      };

      await onSubmit(designData);
      loadingMessage();
      form.resetFields();
      setSelectedFiles({
        imageUrl: null,
        image2: null,
        image3: null,
      });
      
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
              rules={[{ required: true, message: "Vui lòng nhập tên mẫu thiết kế" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="price"
              label="Giá"
              rules={[{ required: true, message: "Vui lòng nhập giá" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
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
                {categories.map(category => (
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
              <Select
                mode="multiple"
                placeholder="Chọn sản phẩm"
                optionLabelProp="label"
                labelInValue
                onChange={(values) => {
                  // Transform the selected values to include productId and quantity
                  const productDetails = values.map(item => ({
                    ...item,
                    productId: item.value,
                    quantity: item.quantity || 1
                  }));
                  form.setFieldsValue({ productDetails });
                }}
              >
                {products.map(product => (
                  <Option 
                    key={product.id} 
                    value={product.id}
                    label={`${product.name} (${product.price ? product.price.toLocaleString() + ' đ' : 'N/A'})`}
                  >
                    <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                      <Col span={16}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {product.image?.imageUrl && (
                            <img 
                              src={product.image.imageUrl} 
                              alt={product.name} 
                              style={{ width: 40, height: 40, marginRight: 10, objectFit: 'cover' }} 
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                            <div style={{ fontSize: '12px', color: '#888' }}>
                              {product.price ? product.price.toLocaleString() + ' đ' : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col span={8} style={{ textAlign: 'right' }}>
                        <InputNumber
                          min={1}
                          defaultValue={1}
                          style={{ width: '80px' }}
                          onChange={(quantity) => {
                            // Update the quantity in the form values
                            const currentDetails = form.getFieldValue('productDetails') || [];
                            const updatedDetails = currentDetails.map(detail => 
                              detail.productId === product.id 
                                ? { ...detail, quantity } 
                                : detail
                            );
                            form.setFieldsValue({ productDetails: updatedDetails });
                            
                            // Also update the quantity in the select's internal state
                            const selectedValues = form.getFieldValue('productDetails');
                            if (selectedValues) {
                              const found = selectedValues.find(item => item.productId === product.id);
                              if (found) {
                                found.quantity = quantity;
                              }
                            }
                          }}
                          onClick={e => e.stopPropagation()}
                        />
                      </Col>
                    </Row>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <Input.TextArea />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="imageUrl"
              label="Ảnh chính"
              rules={[{ required: true, message: "Vui lòng tải lên ảnh chính!" }]}
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={(file) => {
                  setSelectedFiles((prev) => ({ ...prev, imageUrl: file }));
                  return false;
                }}
                onRemove={() => {
                  setSelectedFiles((prev) => ({ ...prev, imageUrl: null }));
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
            <Form.Item name="image2" label="Ảnh phụ 1">
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={(file) => {
                  setSelectedFiles((prev) => ({ ...prev, image2: file }));
                  return false;
                }}
                onRemove={() => {
                  setSelectedFiles((prev) => ({ ...prev, image2: null }));
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
            <Form.Item name="image3" label="Ảnh phụ 2">
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={(file) => {
                  setSelectedFiles((prev) => ({ ...prev, image3: file }));
                  return false;
                }}
                onRemove={() => {
                  setSelectedFiles((prev) => ({ ...prev, image3: null }));
                }}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

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