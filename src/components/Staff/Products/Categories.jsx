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
  // Remove notification from imports
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
import { Select } from "antd";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";

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

  // Move store usage inside component
  const {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  } = useProductStore();

  const { getBasePath } = useRoleBasedPath();

  const handleBack = () => {
    navigate(`${getBasePath()}/products`);
  };

  // Fetch categories khi component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Xử lý khi chọn hàng
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys); // Fixed parameter name
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
    // notification.info({
    //   message: "Thông báo",
    //   description: "Vui lòng cập nhật thông tin danh mục",
    //   placement: "topRight"
    // });
  };

  // Xử lý xóa
  const handleDelete = async (id) => {
    try {
      const response = await deleteCategory(id);
      if (response && response.data) {
        message.success("Xóa danh mục thành công");
        fetchCategories();
      }
    } catch (error) {
      message.error("Xóa danh mục thất bại: " + error.message);
    }
  };

  // In handleBatchDelete
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
          for (const id of selectedRowKeys) {
            const response = await deleteCategory(id);
            if (!response || !response.data) {
              throw new Error('Có lỗi khi xóa danh mục');
            }
          }
          setSelectedRowKeys([]);
          message.success("Xóa các danh mục đã chọn thành công");
          fetchCategories();
        } catch (error) {
          message.error("Xóa danh mục thất bại: " + error.message);
        }
      },
    });
  };

  // In handleOk
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!values.name || typeof values.name !== 'string') {
        throw new Error('Tên danh mục không hợp lệ');
      }

      if (!values.description || typeof values.description !== 'string') {
        throw new Error('Mô tả danh mục không hợp lệ');
      }

      const categoryData = {
        name: values.name.trim(),
        description: values.description.trim()
      };

      let response;
      if (editingCategory) {
        response = await updateCategory(editingCategory.id, categoryData);
        if (response?.status === 200) {
          message.success("Cập nhật danh mục thành công");
          setIsModalVisible(false);
          form.resetFields();
          fetchCategories();
        } else {
          throw new Error('Cập nhật danh mục thất bại');
        }
      } else {
        response = await createCategory(categoryData);
        if (response?.status === 201) {
          message.success("Thêm danh mục thành công");
          setIsModalVisible(false);
          form.resetFields();
          fetchCategories();
        } else {
          throw new Error('Thêm danh mục thất bại');
        }
      }
    } catch (error) {
      message.error(error.message || "Đã có lỗi xảy ra");
    }
  };

  // In handleCancel
  const handleCancel = () => {
    setIsModalVisible(false);
    message.info("Đã hủy thao tác");
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  // Add new state for status filter
  const [statusFilter, setStatusFilter] = useState(null);

  // Update filteredData to include status filter
  const filteredData = categories.filter(
    (item) =>
      ((item.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
        (item.description?.toLowerCase() || '').includes(searchText.toLowerCase())) &&
      (!statusFilter || item.status === statusFilter)
  );

  // Cấu hình rowSelection
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Cấu hình cột
  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 60,
      fixed: "left",
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
      title: "Ngày tạo",
      dataIndex: "creationDate",
      key: "creationDate",
      render: (date) => {
        const formattedDate = new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
        return formattedDate;
      },
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
      <div className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={16}>
            <Button
              type="dashed"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{ marginRight: 8 }}
            >
              Quay lại
            </Button>
          </Col>
        </Row>
      </div>

      <Card title="Danh sách danh mục">
        <Row gutter={[16, 16]} className="mb-4">
          <Col flex="300px">
            <Input
              placeholder="Tìm kiếm theo tên, mô tả..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col flex="200px">
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </Col>
          <Col flex="auto" style={{ textAlign: "right" }}>
            {selectedRowKeys.length > 0 && (
              <Button
                danger
                onClick={handleBatchDelete}
                style={{ marginRight: 8 }}
              >
                Xóa đã chọn ({selectedRowKeys.length})
              </Button>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm danh mục
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

          {/* <Form.Item
            name="status"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Hoạt động"
              unCheckedChildren="Không hoạt động"
            />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
