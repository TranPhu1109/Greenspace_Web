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
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]); // Add this state

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

      // Ensure productDetails exists and is an array
      const productDetails = selectedProducts.map(productId => ({
        productId: productId,
        quantity: productQuantities[productId] || 1
      }));

      const designData = {
        ...values,
        image: imageUrls,
        productDetails: productDetails
      };

      await onSubmit(designData);
      loadingMessage();
      form.resetFields();
      setSelectedFiles({
        imageUrl: null,
        image2: null,
        image3: null,
      });
      setSelectedProducts([]); // Reset selected products
      setProductQuantities({}); // Reset quantities
      
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
              name="designPrice"
              label="Giá thiết kế"
              rules={[{ required: true, message: "Vui lòng nhập giá thiết kế" }]}
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
              <div>
                <Select
                  mode="multiple"
                  placeholder="Chọn sản phẩm"
                  style={{ marginBottom: 16 }}
                  onChange={(selectedIds) => {
                    const newQuantities = {};
                    selectedIds.forEach(id => {
                      newQuantities[id] = productQuantities[id] || 1;
                    });
                    setProductQuantities(newQuantities);
                    setSelectedProducts(selectedIds); // Update selected products
                    
                    const productDetails = selectedIds.map(id => ({
                      value: id,
                      quantity: newQuantities[id]
                    }));
                    form.setFieldsValue({ productDetails });
                  }}
                >
                  {products.map(product => (
                    <Option key={product.id} value={product.id}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {product.image?.imageUrl && (
                          <img 
                            src={product.image.imageUrl} 
                            alt={product.name} 
                            style={{ width: 40, height: 40, marginRight: 10, objectFit: 'cover', borderRadius: '4px' }} 
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            {product.price ? product.price.toLocaleString() + ' đ' : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>

                {selectedProducts.length > 0 && (
                  <div style={{ border: '1px solid #d9d9d9', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Số lượng sản phẩm:</div>
                    {selectedProducts.map(productId => {
                      const product = products.find(p => p.id === productId);
                      return (
                        <div key={productId} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <img 
                            src={product?.image?.imageUrl} 
                            alt={product?.name}
                            style={{ width: 30, height: 30, marginRight: 10, objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <span style={{ flex: 1 }}>{product?.name}</span>
                          <InputNumber
                            min={1}
                            value={productQuantities[productId]}
                            onChange={(quantity) => {
                              const newQuantities = { ...productQuantities, [productId]: quantity };
                              setProductQuantities(newQuantities);
                              
                              const updatedDetails = selectedProducts.map(id => ({
                                value: id,
                                quantity: id === productId ? quantity : (productQuantities[id] || 1)
                              }));
                              form.setFieldsValue({ productDetails: updatedDetails });
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