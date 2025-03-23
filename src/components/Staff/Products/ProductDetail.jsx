import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Button,
  Space,
  Tabs,
  Tag,
  Image,
  Divider,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  message,
  Modal,
  Statistic,
  Spin,
  Alert,
  Empty,
  Table,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
  ShoppingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import useProductStore from "../../../stores/useProductStore";
import "./ProductDetail.scss";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// Add notification to imports
import { notification } from "antd";
import { useRoleBasedPath } from "../../../hooks/useRoleBasedPath";

const ProductDetail = () => {
  const { getBasePath } = useRoleBasedPath();

  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const {
    getProductById,
    updateProduct,
    deleteProduct,
    isLoading,
    error,
    categories,
    fetchCategories,
  } = useProductStore();
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    fetchCategories();
    getProductById(id);
  }, [fetchCategories]);

  // useEffect(() => {
  //   const fetchProduct = async () => {
  //     try {
  //       const data = await getProductById(id);
  //       if (data) {
  //         setProductData(data);
  //         // Update form fields to match API response structure
  //         form.setFieldsValue({
  //           name: data.name,
  //           categoryId: data.categoryId, // Changed from category_id
  //           price: data.price,
  //           stock: data.stock,
  //           status: data.status === "active",
  //           description: data.description,
  //           size: data.size,
  //         });
  //       }
  //     } catch (err) {
  //       message.error("Không thể tải thông tin sản phẩm");
  //     }
  //   };
  //   if (id) fetchProduct();
  // }, [id, form, getProductById]);

  

  const handleBack = () => {
    navigate(`${getBasePath()}/products`);
  };
  // Update the handleDelete function
  const handleDelete = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      content: "Hành động này không thể hoàn tác!",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteProduct(id);
          notification.success({
            message: "Thành công",
            description: "Xóa sản phẩm thành công",
            placement: "topRight",
          });
          navigate("/staff/products");
        } catch (error) {
          notification.error({
            message: "Thất bại",
            description: "Xóa sản phẩm thất bại",
            placement: "topRight",
          });
        }
      },
    });
  };

  if (isLoading) return <Spin size="large" className="loading-spinner" />;
  if (error)
    return (
      <>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}></Button>
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </>
    );
  if (!productData) return <Empty description="Không tìm thấy sản phẩm" />;

  return (
    <div className="product-detail-container">
      <div style={{ marginBottom: 10 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                Quay lại
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                Chi tiết sản phẩm: {productData.name}
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              {!isEditing ? (
                <>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                  >
                    Xóa
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(false)}>Hủy</Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                  >
                    Lưu
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Row gutter={[16, 16]}>
          <Col span={10}>
            <Card>
              <Image
                src={productData.thumbnail}
                alt="Hình ảnh sản phẩm"
                width="100%"
                style={{ borderRadius: 8 }}
              />
              {/* <Divider /> */}
              {/* <Statistic
                title="Lượt xem"
                value={productData.views}
                prefix={<EyeOutlined />}
              /> */}
              <Divider />
              <Statistic
                title="Đã bán"
                value={productData.salesCount}
                prefix={<ShoppingOutlined />}
              />
              <Divider />
              <Descriptions column={1}>
                <Descriptions.Item label="Ngày tạo">
                  {dayjs(productData.createdAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                {/* <Descriptions.Item label="Cập nhật lần cuối">
                  {dayjs(productData.updatedAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item> */}
              </Descriptions>
            </Card>
          </Col>

          <Col span={14}>
            <Card>
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Thông tin cơ bản" key="info">
                  {!isEditing ? (
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Tên sản phẩm">
                        {productData.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Danh mục">
                        {/* {categories.find(
                          (c) => c.id === productData.category_id
                        )?.name || "Không xác định"} */}
                        {productData.categoryName || "Không xác định"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giá bán">
                        {productData.price.toLocaleString()} VND
                      </Descriptions.Item>
                      <Descriptions.Item label="Tồn kho">
                        {productData.stock}
                      </Descriptions.Item>
                      
                      <Descriptions.Item label="Mô tả">
                        {productData.description}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <>
                      <Form.Item
                        name="name"
                        label="Tên sản phẩm"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="category_id"
                        label="Danh mục"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          {categories.map((c) => (
                            <Option key={c.id} value={c.id}>
                              {c.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name="price"
                        label="Giá bán"
                        rules={[{ required: true }]}
                      >
                        <InputNumber style={{ width: "100%" }} />
                      </Form.Item>
                      <Form.Item
                        name="stock"
                        label="Tồn kho"
                        rules={[{ required: true }]}
                      >
                        <InputNumber style={{ width: "100%" }} />
                      </Form.Item>
                      <Form.Item
                        name="status"
                        label="Trạng thái"
                        valuePropName="checked"
                      >
                        <Switch
                          checkedChildren="Đang bán"
                          unCheckedChildren="Ngừng bán"
                        />
                      </Form.Item>
                      <Form.Item name="description" label="Mô tả">
                        <TextArea rows={4} />
                      </Form.Item>
                    </>
                  )}
                </TabPane>

                <TabPane tab="Thông số kỹ thuật" key="specifications">
                  {!isEditing ? (
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Chất liệu">
                        {productData.specifications?.material}
                      </Descriptions.Item>
                      <Descriptions.Item label="Kích thước">
                        {productData.specifications?.dimensions}
                      </Descriptions.Item>
                      <Descriptions.Item label="Trọng lượng">
                        {productData.specifications?.weight}
                      </Descriptions.Item>
                      <Descriptions.Item label="Bảo hành">
                        {productData.specifications?.warranty}
                      </Descriptions.Item>
                      <Descriptions.Item label="Xuất xứ">
                        {productData.specifications?.origin}
                      </Descriptions.Item>
                      <Descriptions.Item label="Hướng dẫn bảo quản">
                        {productData.specifications?.care_instructions}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <>
                      <Form.Item
                        name={["specifications", "material"]}
                        label="Chất liệu"
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name={["specifications", "dimensions"]}
                        label="Kích thước"
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name={["specifications", "weight"]}
                        label="Trọng lượng"
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name={["specifications", "warranty"]}
                        label="Bảo hành"
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name={["specifications", "origin"]}
                        label="Xuất xứ"
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name={["specifications", "care_instructions"]}
                        label="Hướng dẫn bảo quản"
                      >
                        <TextArea rows={3} />
                      </Form.Item>
                    </>
                  )}
                </TabPane>

                <TabPane tab="Điểm nổi bật" key="highlights">
                  {!isEditing ? (
                    <ul className="highlights-list">
                      {productData.highlights?.map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  ) : (
                    <Form.List name="highlights">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <Form.Item required={false} key={field.key}>
                              <Form.Item
                                {...field}
                                validateTrigger={["onChange", "onBlur"]}
                                noStyle
                              >
                                <Input
                                  style={{ width: "95%" }}
                                  placeholder="Nhập điểm nổi bật"
                                />
                              </Form.Item>
                              <Button
                                type="link"
                                onClick={() => remove(field.name)}
                              >
                                Xóa
                              </Button>
                            </Form.Item>
                          ))}
                          <Form.Item>
                            <Button type="dashed" onClick={() => add()} block>
                              Thêm điểm nổi bật
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  )}
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductDetail;
