import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Card,
  Row,
  Col,
  Typography,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Switch,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useProductStore from "../../../stores/useProductStore";
import "./Categories.scss";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

const Categories = () => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // Sử dụng store
  const {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useProductStore();

  // Fetch categories khi component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Xử lý khi chọn hàng
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedKeys);
  };

  // Xử lý thêm mới
  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Xử lý chỉnh sửa
  const handleEdit = (record) => {
    setEditingCategory(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      status: record.status === "active",
    });
    setIsModalVisible(true);
  };

  // Xử lý xóa
  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      message.success("Xóa danh mục thành công");
    } catch (error) {
      message.error("Xóa danh mục thất bại: " + error.message);
    }
  };

  // Xử lý xóa nhiều
  const handleBatchDelete = () => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa các danh mục đã chọn?",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // Xóa lần lượt các danh mục đã chọn
          for (const id of selectedRowKeys) {
            await deleteCategory(id);
          }
          setSelectedRowKeys([]);
          message.success("Xóa danh mục thành công");
        } catch (error) {
          message.error("Xóa danh mục thất bại: " + error.message);
        }
      },
    });
  };

  // Xử lý submit form
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Chuyển đổi trạng thái từ boolean sang string
      const categoryData = {
        ...values,
        status: values.status ? "active" : "inactive",
      };

      if (editingCategory) {
        // Cập nhật
        await updateCategory(editingCategory.id, categoryData);
        message.success("Cập nhật danh mục thành công");
      } else {
        // Thêm mới
        await createCategory(categoryData);
        message.success("Thêm danh mục thành công");
      }

      setIsModalVisible(false);
    } catch (error) {
      message.error("Lỗi: " + error.message);
    }
  };

  // Xử lý hủy
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredData = categories.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // Cấu hình rowSelection
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Cấu hình cột
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa danh mục này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="categories-container">
      <Card className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={16}>
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/staff/products")}
                style={{ marginRight: 8 }}
              >
                Quay lại
              </Button>
              <Title level={4}>Quản lý danh mục</Title>
          </Col>
          <Col xs={24} sm={12} md={8} style={{ textAlign: "right" }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm danh mục
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên, mô tả..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={16} style={{ textAlign: "right" }}>
            <Button
              danger
              disabled={selectedRowKeys.length === 0}
              onClick={handleBatchDelete}
            >
              Xóa đã chọn ({selectedRowKeys.length})
            </Button>
          </Col>
        </Row>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} danh mục`,
          }}
          className="categories-table"
        />
      </Card>

      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingCategory ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả danh mục!" },
            ]}
          >
            <TextArea placeholder="Nhập mô tả danh mục" rows={4} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Hoạt động"
              unCheckedChildren="Không hoạt động"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
