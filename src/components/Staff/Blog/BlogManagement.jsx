import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Modal, message } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import "./BlogManagement.scss";
import useBlogStore from "@/stores/useBlogStore";
import { useNavigate } from "react-router-dom";

const BlogManagement = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const { loading, blogs, fetchBlogs } = useBlogStore();

  // Fetch blogs data
  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa blog này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await useBlogStore.getState().deleteBlog(id);
          message.success("Xóa blog thành công");
          fetchBlogs();
        } catch (error) {
          message.error(error.response?.data?.message || "Không thể xóa blog");
        }
      },
    });
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      filteredValue: [searchText],
      onFilter: (value, record) =>
        (record.title &&
          record.title.toLowerCase().includes(value.toLowerCase())) ||
        (record.author &&
          record.author.toLowerCase().includes(value.toLowerCase())),
      render: (text, record) => (
        <Space>
          {record.image?.imageUrl && (
            <img
              src={record.image.imageUrl}
              alt="Blog thumbnail"
              style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "8px"  }}
            />
          )}
          <span>{text}</span>
        </Space>
      ),
    },

    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Ngày đăng",
      dataIndex: "creationDate",
      key: "creationDate",
      render: (date) => {
        const formattedDate = new Date(date).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
        return formattedDate;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => navigate(`/staff/blog/${record.id}`)}>
            Xem chi tiết
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/staff/blog/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="blog-management">
      <div className="blog-management-header">
        <h1>Quản lý Blog</h1>
        <Space>
          <Input
            placeholder="Tìm kiếm blog..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/staff/blog/new-blog")}
          >
            Thêm Blog Mới
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={blogs}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default BlogManagement;
