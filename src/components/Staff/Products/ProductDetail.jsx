import React, { useState, useEffect, useRef } from "react";
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
import api from "../../../api/api";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// Add notification to imports
import { notification } from "antd";
import { useRoleBasedPath } from "../../../hooks/useRoleBasedPath";

const ProductDetail = () => {
  const { getBasePath } = useRoleBasedPath();
  const componentId = useRef(`product-detail-${Date.now()}`).current;
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);

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
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        // Fetch both data in parallel
        const [categoriesData, productResult] = await Promise.all([
          fetchCategories(componentId),
          getProductById(id, componentId)
        ]);
        
        if (productResult) {
          setProductData(productResult);
          form.setFieldsValue({
            name: productResult.name,
            categoryId: productResult.categoryId,
            price: productResult.price,
            stock: productResult.stock,
            status: productResult.status === "active",
            description: productResult.description,
            size: productResult.size,
            specifications: productResult.specifications,
            highlights: productResult.highlights,
          });
        } else {
          setFetchError("Không thể tải thông tin sản phẩm");
        }
      } catch (error) {
        if (error.message !== 'canceled') {
          setFetchError(error.message || "Không thể tải thông tin sản phẩm");
          message.error("Không thể tải thông tin sản phẩm");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }

    // Cleanup function to abort any pending requests when component unmounts
    return () => {
      api.clearPendingRequests(componentId);
    };
  }, [id, form, getProductById, fetchCategories, componentId]);

  const handleBack = () => {
    navigate(`${getBasePath()}/products`);
  };
  
  const handleUpdate = async (values) => {
    try {
      const updatedData = {
        ...productData, // Giữ lại tất cả dữ liệu cũ
        ...values, // Cập nhật với dữ liệu mới
        status: values.status ? "active" : "inactive",
      };
      await updateProduct(id, updatedData, componentId);
      message.success("Cập nhật sản phẩm thành công");
      setIsEditing(false);
      const newData = await getProductById(id, componentId);
      setProductData(newData);
    } catch (error) {
      message.error("Cập nhật sản phẩm thất bại: " + (error.message || "Lỗi không xác định"));
    }
  };

  // Thêm hàm mới để xử lý khi bấm nút chỉnh sửa
  const handleEdit = () => {
    form.setFieldsValue({
      name: productData.name,
      categoryId: productData.categoryId,
      price: productData.price,
      stock: productData.stock,
      status: productData.status === "active",
      size: productData.size,
      description: productData.description,
      specifications: productData.specifications,
      highlights: productData.highlights,
      
    });
    setIsEditing(true);
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
          await deleteProduct(id, componentId);
          notification.success({
            message: "Thành công",
            description: "Xóa sản phẩm thành công",
            placement: "topRight",
          });
          navigate(`${getBasePath()}/products`);
        } catch (error) {
          notification.error({
            message: "Thất bại",
            description: "Xóa sản phẩm thất bại: " + (error.message || "Lỗi không xác định"),
            placement: "topRight",
          });
        }
      },
    });
  };

  if (loading) return <Spin size="large" className="loading-spinner" />;

  if (!productData) return (
    <>
      <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>Quay lại</Button>
      <Empty description="Không tìm thấy sản phẩm" />
    </>
  );
  
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
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Image
                    src={productData.image.imageUrl}
                    alt="Hình ảnh sản phẩm chính"
                    width="100%"
                    style={{ borderRadius: 8 }}
                  />
                </Col>
                <Col span={12}>
                  <Image
                    src={
                      productData.image.imageUrl2 || productData.image.imageUrl
                    }
                    alt="Hình ảnh phụ 1"
                    width="100%"
                    style={{ borderRadius: 8 }}
                  />
                </Col>
                <Col span={12}>
                  <Image
                    src={
                      productData.image.imageUrl3 || productData.image.imageUrl
                    }
                    alt="Hình ảnh phụ 2"
                    width="100%"
                    style={{ borderRadius: 8 }}
                  />
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col flex="auto">
                  <Statistic
                    title="Tồn kho"
                    value={productData.stock}
                    prefix={<ShoppingOutlined />}
                  />
                </Col>
                <Col flex="auto">
                  <Statistic
                    title="Đã bán"
                    value={productData.salesCount}
                    prefix={<ShoppingOutlined />}
                  />
                </Col>
              </Row>

              <Divider />
              <Descriptions column={1}>
                <Descriptions.Item label="Ngày tạo">
                  {dayjs(productData.createdAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
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
                        {productData.price.toLocaleString()}đ
                      </Descriptions.Item>
                      <Descriptions.Item label="Tồn kho">
                        {productData.stock}
                      </Descriptions.Item>
                      <Descriptions.Item label="Kích thước">
                        {productData.size}
                      </Descriptions.Item>
                      <Descriptions.Item label="File hướng dẫn PDF">
                        <Space>
                          <Button
                            type="primary"
                            // icon={<EyeOutlined />}
                            onClick={() => setIsPdfModalVisible(true)}
                          >
                            Xem chi tiết PDF
                          </Button>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mô tả">
                      <div dangerouslySetInnerHTML={{ __html: productData.description }} />
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
                        name="categoryId"
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
                        name="size"
                        label="Kích thước"
                        rules={[{ required: true }]}
                      >
                        <InputNumber style={{ width: "100%" }} />
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

      <Modal
        title="Xem trước file PDF"
        open={isPdfModalVisible}
        onCancel={() => setIsPdfModalVisible(false)}
        footer={null}
        width={1000}
      >
        <iframe
          src={productData.designImage1URL}
          style={{ width: '100%', height: '600px' }}
          title="PDF Preview"
        />
      </Modal>
    </div>
  );
};

export default ProductDetail;
