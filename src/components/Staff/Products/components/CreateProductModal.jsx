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
  message,
  Upload,
  Divider,
  Space,
} from "antd";
import EditorComponent from "@/components/Common/EditorComponent";
import { useCloudinaryStorage } from "../../../../hooks/useCloudinaryStorage";
import { PlusOutlined } from "@ant-design/icons";
import useProductStore from "@/stores/useProductStore";

const { Option } = Select;

const CreateProductModal = ({
  visible,
  onCancel,
  onSubmit,
  form,
  categories,
  isLoading,
}) => {
  const { uploadImages } = useCloudinaryStorage();
  const [newCategory, setNewCategory] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const { createCategory } = useProductStore();
  const [isDuplicateCategory, setIsDuplicateCategory] = useState(false);
  const [isDuplicateProduct, setIsDuplicateProduct] = useState(false);
  const { products, fetchCategories, fetchProducts } = useProductStore();

  const handleCreateCategory = async () => {
    try {
      if (!newCategory) return;
      const newCategoryData = {
        name: newCategory,
        description: categoryDescription,
      };
      await createCategory(newCategoryData);
      setNewCategory("");
      setCategoryDescription("");
      fetchCategories();
      message.success("Tạo danh mục mới thành công");
    } catch (error) {
      message.error("Không thể tạo danh mục mới: " + error.message);
    }
  };

  // State to store selected files before upload
  const [selectedFiles, setSelectedFiles] = useState({
    imageUrl: null,
    image2: null,
    image3: null,
  });

  const handleSubmit = async (values) => {
    try {
      const loadingMessage = message.loading("Đang xử lý...", 0);

      // Upload images only when form is submitted
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

      // Wait for all images to upload
      await Promise.all(uploadPromises);

      const productData = {
        name: values.name,
        categoryId: values.categoryId,
        price: parseFloat(values.price),
        stock: parseInt(values.stock),
        description: values.description || "",
        size: parseFloat(values.size) || 0,
        image: imageUrls,
      };

      await onSubmit(productData);
      loadingMessage();

      // Reset selected files after successful submission
      setSelectedFiles({
        imageUrl: null,
        image2: null,
        image3: null,
      });

      fetchProducts();
    } catch (error) {
      console.error("Error submitting product:", error);
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  // Add these validation functions
  const checkDuplicateCategory = (value) => {
    const isDuplicate = categories.some(
      (category) => category.name.toLowerCase() === value.toLowerCase()
    );
    setIsDuplicateCategory(isDuplicate);
    setNewCategory(value);
  };

  const checkDuplicateProduct = (value) => {
    const isDuplicate = products.some(
      (product) => product.name.toLowerCase() === value.toLowerCase()
    );
    setIsDuplicateProduct(isDuplicate);
  };

  return (
    <Modal
      title="Thêm sản phẩm mới"
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
                {
                  validator: async (_, value) => {
                    if (value && isDuplicateProduct) {
                      throw new Error("Tên sản phẩm đã tồn tại");
                    }
                  },
                },
              ]}
            >
              <Input
                placeholder="Nhập tên sản phẩm"
                onChange={(e) => checkDuplicateProduct(e.target.value)}
                status={isDuplicateProduct ? "error" : ""}
              />
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
              <Select
                placeholder="Chọn danh mục"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Input
                        placeholder="Tên danh mục mới"
                        value={newCategory}
                        onChange={(e) => checkDuplicateCategory(e.target.value)}
                        status={isDuplicateCategory ? "error" : ""}
                      />
                      {isDuplicateCategory && (
                        <div style={{ color: "#ff4d4f", fontSize: "12px" }}>
                          Tên danh mục đã tồn tại
                        </div>
                      )}
                      <Input.TextArea
                        placeholder="Mô tả danh mục"
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        rows={2}
                      />
                      <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
                        <Button
                          type="primary"
                          onClick={handleCreateCategory}
                          disabled={!newCategory || !categoryDescription}
                        >
                          Thêm danh mục mới
                        </Button>
                      </div>
                    </Space>
                  </>
                )}
              >
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
                min={1}
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

        {/* Image Upload Section */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="imageUrl"
              label="Ảnh chính"
              rules={[
                { required: true, message: "Vui lòng tải lên ảnh chính!" },
              ]}
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={(file) => {
                  setSelectedFiles((prev) => ({ ...prev, imageUrl: file }));
                  return false; // Prevent automatic upload
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
                  return false; // Prevent automatic upload
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
                  return false; // Prevent automatic upload
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
        <Form.Item
          name="description"
          label="Mô tả"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mô tả!",
            },
          ]}
        >
          <EditorComponent
            value={form.getFieldValue("description") || ""}
            onChange={(value) => form.setFieldsValue({ description: value })}
            height={350}
          />
        </Form.Item>
        <Form.Item
          className="form-actions"
          style={{ textAlign: "right", marginTop: 10 }}
        >
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Thêm mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateProductModal;
