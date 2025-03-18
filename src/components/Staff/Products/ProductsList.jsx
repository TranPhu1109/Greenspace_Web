import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Modal,
  Form,
  Select,
  InputNumber,
  Upload,
  message,
  Popconfirm,
  Tooltip,
  Tabs,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  TagOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useProductStore from "../../../stores/useProductStore";
import "./ProductsList.scss";
import { Popover } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;
const { confirm } = Modal;
const { TabPane } = Tabs;

const ProductsList = () => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [sortedInfo, setSortedInfo] = useState({});

  // Sử dụng store
  const {
    products,
    categories,
    isLoading,
    error,
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategoryNameById,
  } = useProductStore();

  // Fetch data khi component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Xử lý lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(`Đã xảy ra lỗi: ${error}`);
    }
  }, [error]);

  // Xử lý khi click vào hàng
  const handleRowClick = (record) => {
    navigate(`/staff/products/${record.id}`);
  };

  // Xử lý khi chọn hàng
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedKeys);
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Xử lý lọc theo danh mục
  const handleCategoryFilter = (value) => {
    setFilterCategory(value);
  };

  // Xử lý lọc theo trạng thái
  const handleStatusFilter = (value) => {
    setFilterStatus(value);
  };

  // Xử lý sắp xếp
  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  // Xử lý thêm mới sản phẩm
  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Xử lý chỉnh sửa sản phẩm
  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue({
      name: record.name,
      price: record.price,
      category_id: record.category_id,
      stock: record.stock,
      status: record.status,
      description: record.description,
      // Không set image vì Upload component không hỗ trợ
    });
    setIsModalVisible(true);
  };

  // Xử lý xóa sản phẩm
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      message.success("Xóa sản phẩm thành công");
    } catch (error) {
      message.error("Xóa sản phẩm thất bại");
    }
  };

  // Xử lý xóa nhiều sản phẩm
  const handleBatchDelete = () => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn?",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác",
      onOk: async () => {
        try {
          // Xóa từng sản phẩm đã chọn
          await Promise.all(selectedRowKeys.map((id) => deleteProduct(id)));
          setSelectedRowKeys([]);
          message.success("Xóa sản phẩm thành công");
        } catch (error) {
          message.error("Xóa sản phẩm thất bại");
        }
      },
    });
  };

  // Xử lý hủy modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        // Cập nhật sản phẩm
        await updateProduct(editingProduct.id, values);
        message.success("Cập nhật sản phẩm thành công");
      } else {
        // Thêm mới sản phẩm
        await createProduct(values);
        message.success("Thêm sản phẩm thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  // Lọc dữ liệu
  const filteredData = products.filter((item) => {
    const matchSearch = searchText
      ? item.name.toLowerCase().includes(searchText.toLowerCase())
      : true;

    const matchCategory = filterCategory
      ? item.category_id === parseInt(filterCategory)
      : true;

    const matchStatus = filterStatus ? item.status === filterStatus : true;

    return matchSearch && matchCategory && matchStatus;
  });

  // Cấu hình rowSelection
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Thêm hàm điều hướng đến trang Categories
  const goToCategories = () => {
    navigate("/staff/products/categories");
  };

  // Cấu hình cột
  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="product-info">
          <img
            src={record.thumbnail}
            alt={text}
            className="product-thumbnail"
            width={50}
            height={50}
          />
          <div className="product-details">
            <span className="product-name">{text}</span>
            <span className="product-category">
              {getCategoryNameById(record.category_id)}
            </span>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString("vi-VN")} đ`,
      sorter: (a, b) => a.price - b.price,
      sortOrder: sortedInfo.columnKey === "price" && sortedInfo.order,
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      sorter: (a, b) => a.stock - b.stock,
      sortOrder: sortedInfo.columnKey === "stock" && sortedInfo.order,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Đang bán" : "Ngừng bán"}
        </Tag>
      ),
      filters: [
        { text: "Đang bán", value: "active" },
        { text: "Ngừng bán", value: "inactive" },
      ],
      filteredValue: filterStatus ? [filterStatus] : null,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Popover
          size="small"
          placement="bottomLeft"
          content={
            <div className="flex flex-col gap-2">
              <Button
                type="default"
                style={{
                  backgroundColor: "beige",
                  marginBottom: "5px",
                  justifyContent: "flex-start",
                }}
                icon={<EyeOutlined />}
                onClick={() => handleRowClick(record)}
              >
                Xem chi tiết
              </Button>
              <Button
                type="primary"
                style={{
                  marginBottom: "5px",
                  justifyContent: "flex-start",
                }}
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(record);
                }}
              >
                Chỉnh sửa
              </Button>
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa sản phẩm này?"
                onConfirm={(e) => {
                  e.stopPropagation();
                  handleDelete(record.id);
                }}
                okText="Có"
                cancelText="Không"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  style={{
                    justifyContent: "flex-start",
                    backgroundColor: "red",
                    color: "white",
                  }}
                  icon={<DeleteOutlined />}
                >
                  Xóa
                </Button>
              </Popconfirm>
            </div>
          }
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Popover>
      ),
    },
  ];

  return (
    <div className="products-list-container">
      <Card className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Title level={4} style={{ margin: 0 }}>
              Quản lý sản phẩm
            </Title>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={goToCategories} icon={<TagOutlined />}>
                Quản lý danh mục
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Thêm sản phẩm
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Tìm kiếm sản phẩm"
              prefix={<SearchOutlined />}
              className="search-input"
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Lọc theo danh mục"
              style={{ width: "100%" }}
              onChange={handleCategoryFilter}
              allowClear
            >
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              onChange={handleStatusFilter}
              allowClear
            >
              <Option value="active">Đang bán</Option>
              <Option value="inactive">Ngừng bán</Option>
            </Select>
          </Col>
        </Row>

        {selectedRowKeys.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Button danger onClick={handleBatchDelete}>
                Xóa {selectedRowKeys.length} sản phẩm đã chọn
              </Button>
            </Col>
          </Row>
        )}

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          className="products-table"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
          }}
        />
      </Card>

      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm!" }]}
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
            name="category_id"
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

          <Form.Item
            name="stock"
            label="Tồn kho"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng tồn kho!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập số lượng tồn kho"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            initialValue="active"
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Đang bán</Option>
              <Option value="inactive">Ngừng bán</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả sản phẩm!" },
            ]}
          >
            <TextArea placeholder="Nhập mô tả sản phẩm" rows={4} />
          </Form.Item>

          <Form.Item name="image" label="Hình ảnh">
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item className="form-actions">
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingProduct ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsList;
