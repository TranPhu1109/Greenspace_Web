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
import { PlusOutlined } from "@ant-design/icons";
import { useCloudinaryStorage } from "../../../../hooks/useCloudinaryStorage";
import useProductStore from "../../../../stores/useProductStore";

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
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // useEffect(() => {
  //   if (initialValues && visible) {
  //     // Transform productDetails to match the format expected by the Select component
  //     const transformedProductDetails = initialValues.productDetails?.map(
  //       (detail) => ({
  //         label:
  //           products.find((p) => p.id === detail.productId)?.name ||
  //           "Unknown Product",
  //         value: detail.productId,
  //         productId: detail.productId,
  //         quantity: detail.quantity,
  //       })
  //     );

  //     form.setFieldsValue({
  //       ...initialValues,
  //       productDetails: transformedProductDetails,
  //     });
  //   }
  // }, [initialValues, visible, form, products]);

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
      // Khởi tạo imageUrls với giá trị rỗng nếu đã chọn file mới, hoặc giữ giá trị cũ nếu không
      const imageUrls = {
        imageUrl: selectedFiles.imageUrl
          ? ""
          : initialValues?.image?.imageUrl || "",
        image2: selectedFiles.image2 ? "" : initialValues?.image?.image2 || "",
        image3: selectedFiles.image3 ? "" : initialValues?.image?.image3 || "",
      };

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
        id: initialValues.id,
        image: imageUrls,
        productDetails: selectedProducts.map(productId => ({
          productId: productId,
          quantity: productQuantities[productId] || 1
        }))
      };
      // const designData = {
      //   ...values,
      //   id: initialValues.id,
      //   image: imageUrls,
      //   productDetails: values.productDetails.map((product) => ({
      //     productId: product.productId || product.value,
      //     quantity: product.quantity || 1,
      //   })),
      // };

      await onSubmit(designData);
      loadingMessage();
      setSelectedFiles({
        imageUrl: null,
        image2: null,
        image3: null,
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
              rules={[
                { required: true, message: "Vui lòng nhập tên mẫu thiết kế" },
              ]}
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

            {/* <Form.Item
              name="productDetails"
              label="Sản phẩm"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất một sản phẩm",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn sản phẩm"
                optionLabelProp="label"
                labelInValue
                onChange={(values) => {
                  // Transform the selected values to include productId and quantity
                  const productDetails = values.map((item) => ({
                    ...item,
                    productId: item.value,
                    quantity: item.quantity || 1,
                  }));
                  form.setFieldsValue({ productDetails });
                }}
              >
                {products.map((product) => (
                  <Option
                    key={product.id}
                    value={product.id}
                    label={`${product.name} (${
                      product.price
                        ? product.price.toLocaleString() + " đ"
                        : "N/A"
                    })`}
                  >
                    <Row
                      justify="space-between"
                      align="middle"
                      style={{ width: "100%" }}
                    >
                      <Col span={16}>
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
                      </Col>
                      <Col span={8} style={{ textAlign: "right" }}>
                        <InputNumber
                          min={1}
                          defaultValue={1}
                          style={{ width: "80px" }}
                          onChange={(quantity) => {
                            // Update the quantity in the form values
                            const currentDetails =
                              form.getFieldValue("productDetails") || [];
                            const updatedDetails = currentDetails.map(
                              (detail) =>
                                detail.productId === product.id
                                  ? { ...detail, quantity }
                                  : detail
                            );
                            form.setFieldsValue({
                              productDetails: updatedDetails,
                            });

                            // Also update the quantity in the select's internal state
                            const selectedValues =
                              form.getFieldValue("productDetails");
                            if (selectedValues) {
                              const found = selectedValues.find(
                                (item) => item.productId === product.id
                              );
                              if (found) {
                                found.quantity = quantity;
                              }
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Col>
                    </Row>
                  </Option>
                ))}
              </Select>
            </Form.Item> */}
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
              rules={[
                {
                  required: initialValues?.image?.imageUrl ? false : true,
                  message: "Vui lòng tải lên ảnh chính!",
                },
              ]}
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                fileList={
                  selectedFiles.imageUrl
                    ? [
                        {
                          uid: "-1",
                          name: "Ảnh mới",
                          status: "done",
                          url: URL.createObjectURL(selectedFiles.imageUrl),
                        },
                      ]
                    : getFileList(initialValues?.image?.imageUrl, "Ảnh chính")
                }
                beforeUpload={(file) => {
                  setSelectedFiles((prev) => ({ ...prev, imageUrl: file }));
                  return false;
                }}
                onRemove={() => {
                  setSelectedFiles((prev) => ({ ...prev, imageUrl: null }));
                  // Đánh dấu là đã xóa ảnh cũ
                  const imageUrls = { ...initialValues?.image };
                  imageUrls.imageUrl = "";
                  form.setFieldsValue({ image: imageUrls });
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
                fileList={
                  selectedFiles.image2
                    ? [
                        {
                          uid: "-1",
                          name: "Ảnh mới",
                          status: "done",
                          url: URL.createObjectURL(selectedFiles.image2),
                        },
                      ]
                    : getFileList(initialValues?.image?.image2, "Ảnh phụ 1")
                }
                beforeUpload={(file) => {
                  setSelectedFiles((prev) => ({ ...prev, image2: file }));
                  return false;
                }}
                onRemove={() => {
                  setSelectedFiles((prev) => ({ ...prev, image2: null }));
                  // Đánh dấu là đã xóa ảnh cũ
                  const imageUrls = { ...initialValues?.image };
                  imageUrls.image2 = "";
                  form.setFieldsValue({ image: imageUrls });
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
                fileList={
                  selectedFiles.image3
                    ? [
                        {
                          uid: "-1",
                          name: "Ảnh mới",
                          status: "done",
                          url: URL.createObjectURL(selectedFiles.image3),
                        },
                      ]
                    : getFileList(initialValues?.image?.image3, "Ảnh phụ 2")
                }
                beforeUpload={(file) => {
                  setSelectedFiles((prev) => ({ ...prev, image3: file }));
                  return false;
                }}
                onRemove={() => {
                  setSelectedFiles((prev) => ({ ...prev, image3: null }));
                  // Đánh dấu là đã xóa ảnh cũ
                  const imageUrls = { ...initialValues?.image };
                  imageUrls.image3 = "";
                  form.setFieldsValue({ image: imageUrls });
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditDesignModal;
