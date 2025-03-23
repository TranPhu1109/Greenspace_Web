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
  message,
  Upload,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useCloudinaryStorage } from "../../../../hooks/useCloudinaryStorage";

const { Option } = Select;

const UpdateProductModal = ({
  visible,
  onCancel,
  onSubmit,
  form,
  categories,
  isLoading,
  product,
}) => {
  const { uploadImages } = useCloudinaryStorage();
  const [imageUrls, setImageUrls] = useState({
    imageUrl: '',
    image2: '',
    image3: ''
  });

  useEffect(() => {
    if (product && visible) {
      setImageUrls({
        imageUrl: product.image?.imageUrl || '',
        image2: product.image?.image2 || '',
        image3: product.image?.image3 || ''
      });
      
      form.setFieldsValue({
        name: product.name,
        categoryId: product.categoryId,
        price: product.price,
        stock: product.stock,
        size: product.size,
        description: product.description,
      });
    }
  }, [product, form, visible]);

  const handleSubmit = async (values) => {
    try {
      const loadingMessage = message.loading("Đang xử lý...", 0);
      
      const productData = {
        name: values.name,
        categoryId: values.categoryId,
        price: parseFloat(values.price),
        stock: parseInt(values.stock),
        description: values.description || "",
        size: parseFloat(values.size) || 0,
        image: {
          imageUrl: imageUrls.imageUrl,
          image2: imageUrls.image2,
          image3: imageUrls.image3,
        }
      };

      await onSubmit(productData);
      loadingMessage();
      message.success("Cập nhật sản phẩm thành công");
    } catch (error) {
      console.error("Error updating product:", error);
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  // Replace the CloudinaryMultiUpload with separate Upload components
  const renderImageUpload = () => (
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
            beforeUpload={async (file) => {
              try {
                const urls = await uploadImages([file]);
                setImageUrls(prev => ({ ...prev, imageUrl: urls[0] }));
                return false;
              } catch (error) {
                message.error("Tải ảnh thất bại");
                return false;
              }
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
          name="image2"
          label="Ảnh phụ 1"
        >
          <Upload
            listType="picture-card"
            maxCount={1}
            beforeUpload={async (file) => {
              try {
                const urls = await uploadImages([file]);
                setImageUrls(prev => ({ ...prev, image2: urls[0] }));
                return false;
              } catch (error) {
                message.error("Tải ảnh thất bại");
                return false;
              }
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
          name="image3"
          label="Ảnh phụ 2"
        >
          <Upload
            listType="picture-card"
            maxCount={1}
            beforeUpload={async (file) => {
              try {
                const urls = await uploadImages([file]);
                setImageUrls(prev => ({ ...prev, image3: urls[0] }));
                return false;
              } catch (error) {
                message.error("Tải ảnh thất bại");
                return false;
              }
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
  );

  // Update the form to use the new image upload section
  return (
    <Modal
      title="Chỉnh sửa sản phẩm"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[
                { required: true, message: "Vui lòng nhập tên sản phẩm!" },
              ]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Giá"
              rules={[
                { required: true, message: "Vui lòng nhập giá sản phẩm!" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                placeholder="Nhập giá sản phẩm"
                min={0}
              />
            </Form.Item>

            <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
            >
              <Select placeholder="Chọn danh mục">
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="stock"
              label="Tồn kho"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số lượng tồn kho!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập số lượng tồn kho"
                min={0}
              />
            </Form.Item>

            <Form.Item
              name="size"
              label="Kích thước (cm)"
              rules={[{ required: true, message: "Vui lòng nhập kích thước!" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập kích thước"
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea placeholder="Nhập mô tả" />
        </Form.Item>

        {renderImageUpload()}

        <Form.Item className="form-actions">
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateProductModal;
