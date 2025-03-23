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
  Alert,
  Progress,
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
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useProductStore from "../../../stores/useProductStore";
import "./ProductsList.scss";
import { Popover } from "antd";
import { useRoleBasedPath } from "../../../hooks/useRoleBasedPath";
import { useCloudinaryStorage } from "../../../hooks/useCloudinaryStorage";

// Import component con
import CreateProductModal from "./components/CreateProductModal";
import UpdateProductModal from "./components/UpdateProductModal";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;
const { TabPane } = Tabs;

const ProductsList = () => {
  const navigate = useNavigate();
  const { getBasePath } = useRoleBasedPath();

  // Replace all path calculations with the hook
  const handleRowClick = (record) => {
    navigate(`${getBasePath()}/products/${record.id}`);
  };

  const goToCategories = () => {
    navigate(`${getBasePath()}/products/categories`);
  };
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
    fetchCategories,
    fetchProducts,
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
    setIsModalVisible(true);
  };

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
    Modal.confirm({
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

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (productData) => {
    try {
      console.log("Submitting product data:", productData); // Add this for debugging

      if (editingProduct) {
        const productId = editingProduct.id;
        await updateProduct(productId, productData);
        message.success("Cập nhật sản phẩm thành công");
      } else {
        await createProduct(productData);
        message.success("Thêm sản phẩm thành công");
      }

      await fetchProducts();
      setIsModalVisible(false);
      form.resetFields();
      setEditingProduct(null);
      return true;
    } catch (error) {
      console.error("Error submitting product:", error);
      message.error("Có lỗi xảy ra: " + error.message);
      return false;
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys); // Fix: was using undefined newSelectedKeys
    },
  };

  // Add columns configuration before the return statement
  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="product-info">
          <img
            src={record.image.imageUrl}
            alt={text}
            className="imageUrl"
            width={50}
            height={50}
            style={{ marginRight: "10px" }}
          />
          <Col className="product-details">
            <span className="product-name">{text}</span>
            <Tag color="processing" className="product-category">
              {getCategoryNameById(record.categoryId)}
              {/* {record.categoryName} */}
            </Tag>
          </Col>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
      sortOrder: sortedInfo.columnKey === "description" && sortedInfo.order,
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
      dataIndex: "stock",
      key: "status",
      render: (stock) => {
        if (stock === 0) {
          return <Tag color="red">Hết hàng</Tag>;
        } else if (stock <= 10) {
          return <Tag color="orange">Sắp hết hàng</Tag>;
        } else {
          return <Tag color="green">Còn hàng</Tag>;
        }
      },
      filters: [
        { text: "Hết hàng", value: "out" },
        { text: "Sắp hết hàng", value: "low" },
        { text: "Còn hàng", value: "in" },
      ],
      onFilter: (value, record) => {
        if (value === "out") return record.stock === 0;
        if (value === "low") return record.stock > 0 && record.stock <= 10;
        if (value === "in") return record.stock > 10;
        return true;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={(e) => {
              e.stopPropagation();
              handleDelete(record.id);
            }}
            onCancel={(e) => e.stopPropagation()}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Add this before the return statement, after columns definition
  // Update the filteredData logic
  const filteredData = Array.isArray(products)
    ? products.filter((item) => {
        // Search across multiple fields
        const searchFields = [
          item.name,
          item.description,
          getCategoryNameById(item.categoryId),
          item.price?.toString(),
          item.stock?.toString(),
        ].map(field => (field || '').toLowerCase());

        const matchSearch = !searchText || searchFields.some(field => 
          field.includes(searchText.toLowerCase())
        );

        const matchCategory = filterCategory
          ? item.categoryId === parseInt(filterCategory)
          : true;

        const matchStatus = filterStatus
          ? (filterStatus === 'out' && item.stock === 0) ||
            (filterStatus === 'low' && item.stock > 0 && item.stock <= 10) ||
            (filterStatus === 'in' && item.stock > 10)
          : true;

        return matchSearch && matchCategory && matchStatus;
      })
    : [];

  return (
    <div className="products-list-container">
      <Card title="Danh sách sản phẩm" className="mb-4">
        <Row gutter={[16, 16]} className="mb-4" align="middle">
          <Col flex="200px">
            <Input
              placeholder="Tìm kiếm sản phẩm"
              prefix={<SearchOutlined />}
              className="search-input"
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col flex="200px">
            <Select
              placeholder="Lọc theo danh mục"
              style={{ width: "100%" }}
              onChange={handleCategoryFilter}
              allowClear
            >
              {Array.isArray(categories)
                ? categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))
                : null}
            </Select>
          </Col>
          <Col flex="200px">
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              onChange={handleStatusFilter}
              allowClear
            >
              <Option value="out">Hết hàng</Option>
              <Option value="low">Sắp hết hàng</Option>
              <Option value="in">Còn hàng</Option>
            </Select>
          </Col>
          <Col flex="auto" style={{ textAlign: "right" }}>
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
      {/* Create Product Modal */}
      <CreateProductModal
        visible={isModalVisible && !editingProduct}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
        categories={categories}
        isLoading={isLoading}
      />

      {/* Edit Product Modal */}
      <UpdateProductModal
        visible={isModalVisible && !!editingProduct}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
        categories={categories}
        isLoading={isLoading}
        product={editingProduct}
      />
    </div>
  );
};

export default ProductsList;
