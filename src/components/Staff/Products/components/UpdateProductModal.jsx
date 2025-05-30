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
import EditorComponent from "@/components/Common/EditorComponent";
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

  // State to store selected files before upload
  const [selectedFiles, setSelectedFiles] = useState({
    imageUrl: null,
    image2: null,
    image3: null,
  });

  useEffect(() => {
    if (product && visible) {
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

      // Upload images only when form is submitted and new files are selected
      const uploadPromises = [];
      const imageUrls = {
        imageUrl: product?.image?.imageUrl || "",
        image2: product?.image?.image2 || "",
        image3: product?.image?.image3 || ""
      };
      let designImage1URL = product?.designImage1URL || "";

      // Only process image uploads if there are new files
      if (
        selectedFiles.imageUrl ||
        selectedFiles.image2 ||
        selectedFiles.image3 ||
        selectedFiles.designImage1URL
      ) {
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

        if (selectedFiles.designImage1URL) {
          uploadPromises.push(
            uploadImages([selectedFiles.designImage1URL]).then((urls) => {
              designImage1URL = urls[0];
            })
          );
        }

        await Promise.all(uploadPromises);
      }

      const productData = {
        ...product,
        name: values.name,
        categoryId: values.categoryId,
        price: parseFloat(values.price),
        stock: parseInt(values.stock),
        description: values.description || "",
        size: values.size, // Không cần parseFloat nữa, lưu nguyên chuỗi
        image: imageUrls,
        designImage1URL: designImage1URL
      };

      // Only include image data if there are either existing images or new uploads
      if (
        selectedFiles.imageUrl ||
        selectedFiles.image2 ||
        selectedFiles.image3 ||
        product?.image?.imageUrl ||
        product?.image?.image2 ||
        product?.image?.image3
      ) {
        productData.image = imageUrls;
      }

      await onSubmit(productData);
      loadingMessage();

      // Reset selected files after successful submission
      setSelectedFiles({
        imageUrl: null,
        image2: null,
        image3: null,
        designImage1URL: null
      });
    } catch (error) {
      console.error("Error updating product:", error);
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  // Update the image upload section
  const renderImageUpload = () => (
    <Row gutter={16} style={{marginTop: 16}}>
      <Col span={8}>
        <Form.Item
          name="imageUrl"
          label="Ảnh chính"
          rules={[{ required: false }]}
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
            defaultFileList={
              product?.image?.imageUrl
                ? [
                    {
                      uid: "-1",
                      name: "image.png",
                      status: "done",
                      url: product.image.imageUrl,
                    },
                  ]
                : []
            }
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
          rules={[{ required: false }]}
        >
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
            defaultFileList={
              product?.image?.image2
                ? [
                    {
                      uid: "-1",
                      name: "image.png",
                      status: "done",
                      url: product.image.image2,
                    },
                  ]
                : []
            }
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
          rules={[{ required: false }]}
        >
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
            defaultFileList={
              product?.image?.image3
                ? [
                    {
                      uid: "-1",
                      name: "image.png",
                      status: "done",
                      url: product.image.image3,
                    },
                  ]
                : []
            }
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
          name="designImage1URL"
          label="File hướng dẫn (PDF)"
          rules={[{ required: false }]}
        >
          <Upload
            listType="text"
            maxCount={1}
            accept=".pdf"
            beforeUpload={(file) => {
              if (file.type !== 'application/pdf') {
                message.error('Chỉ chấp nhận file PDF!');
                return Upload.LIST_IGNORE;
              }
              setSelectedFiles((prev) => ({ ...prev, designImage1URL: file }));
              return false;
            }}
            onRemove={() => {
              setSelectedFiles((prev) => ({ ...prev, designImage1URL: null }));
            }}
            defaultFileList={
              product?.designImage1URL
                ? [
                    {
                      uid: "-1",
                      name: "Hướng dẫn.pdf",
                      status: "done",
                      url: product.designImage1URL,
                    },
                  ]
                : []
            }
          >
            <Button icon={<PlusOutlined />}>Tải lên file PDF</Button>
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
              label="Kích thước"
            >
              <Input
                style={{ width: "100%" }}
                placeholder="Nhập kích thước (VD: 40cm x 60cm)"
              />
            </Form.Item>
          </Col>
        </Row>
        {renderImageUpload()}

        <Form.Item name="description" label="Mô tả">
          <EditorComponent 
            value={form.getFieldValue('description') || ''}
            onChange={(value) => form.setFieldsValue({ description: value })}
            height={300}
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
