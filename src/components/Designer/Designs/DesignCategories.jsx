import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import useDesignCategoryStore from "../../../stores/useDesignCategoryStore";

const DesignCategories = () => {
  const {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useDesignCategoryStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (record) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      message.success("Xóa danh mục thành công");
    } catch (error) {
      message.error("Không thể xóa danh mục: " + error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        const formData = new FormData();
        formData.append("Id", editingCategory.id);
        formData.append("Name", values.name);

        await updateCategory(editingCategory.id, formData);
        message.success("Cập nhật danh mục thành công");
      } else {
        await createCategory(values);
        message.success("Thêm danh mục thành công");
      }
      setModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  // Add these state variables at the top of the component
  const [searchText, setSearchText] = useState("");
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  // Add this function before the columns definition
  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Update the columns definition
  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      filteredValue: filteredInfo.name || null,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      filteredValue: filteredInfo.description || null,
      onFilter: (value, record) =>
        record.description.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Ngày tạo",
      dataIndex: "creationDate",
      key: "creationDate",
      sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
      sortOrder: sortedInfo.columnKey === "creationDate" && sortedInfo.order,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  // Add search functionality
  const filteredData = categories.filter(
    (item) =>
      (item?.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (item?.description?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  // Update the return statement to add search input
  return (
    <div>
      <Card title="Quản lý danh mục thiết kế">
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Input.Search
            placeholder="Tìm kiếm theo tên hoặc mô tả"
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: "20%" }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategory(null);
              setModalVisible(true);
            }}
          >
            Thêm danh mục
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          onChange={handleChange}
          pagination={{
            // defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} danh mục`,
          }}
        />

        <Modal
          title={editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
          open={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Tên danh mục"
              rules={[
                { required: true, message: "Vui lòng nhập tên danh mục" },
              ]}
            >
              <Input />
            </Form.Item>
            {!editingCategory && (
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả danh mục" },
                ]}
              >
                <Input.TextArea />
              </Form.Item>
            )}
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default DesignCategories;
