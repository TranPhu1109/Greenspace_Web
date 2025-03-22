import React, { useEffect } from "react";
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
} from "antd";
import { CloudinaryMultiUpload } from "../../../../components/CloudinaryUpload";
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

  // Cập nhật form khi product thay đổi
  useEffect(() => {
    if (product && visible) {
      // Tạo mảng URLs ảnh từ product.image
      const imageUrls = [];
      if (product.image?.imageUrl) imageUrls[0] = product.image.imageUrl;
      if (product.image?.image2) imageUrls[1] = product.image.image2;
      if (product.image?.image3) imageUrls[2] = product.image.image3;
      
      form.setFieldsValue({
        name: product.name,
        categoryId: product.categoryId,
        price: product.price,
        stock: product.stock,
        size: product.size,
        description: product.description,
        images: imageUrls, // Set giá trị cho CloudinaryMultiUpload
      });
    }
  }, [product, form, visible]);

  const handleSubmit = async (values) => {
    try {
      // Hiển thị thông báo đang xử lý
      const loadingMessage = message.loading("Đang xử lý...", 0);
      
      // Lấy URLs ảnh từ form (đã được upload bởi CloudinaryMultiUpload)
      const imageUrls = values.images || [];
      
      // Sử dụng ảnh mới nếu có, nếu không thì giữ nguyên ảnh cũ
      const productData = {
        name: values.name,
        categoryId: values.categoryId,
        price: parseFloat(values.price),
        stock: parseInt(values.stock),
        description: values.description || "",
        size: parseFloat(values.size) || 0,
        image: {
          imageUrl: imageUrls[0] || product?.image?.imageUrl || "",
          image2: imageUrls[1] || product?.image?.image2 || "",
          image3: imageUrls[2] || product?.image?.image3 || "",
        }
      };

      // Gửi dữ liệu sản phẩm lên API
      await onSubmit(productData);
      loadingMessage();
      message.success("Cập nhật sản phẩm thành công");
    } catch (error) {
      console.error("Error updating product:", error);
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

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

        {/* Image Upload Section */}
        <Form.Item
          name="images"
          label="Hình ảnh sản phẩm"
          rules={[{ required: true, message: "Vui lòng tải lên ít nhất một ảnh!" }]}
        >
          <CloudinaryMultiUpload 
            labels={["Ảnh chính", "Ảnh phụ 1", "Ảnh phụ 2"]} 
            maxCount={1}
          />
        </Form.Item>

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
