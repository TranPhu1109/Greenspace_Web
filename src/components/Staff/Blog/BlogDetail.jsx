import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Space, Image, Divider, Button, Card, Tag } from "antd";
import useBlogStore from "@/stores/useBlogStore";
import "./BlogDetail.scss";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { blogs } = useBlogStore();
  const blog = blogs.find((b) => b.id === id);

  if (!blog) {
    return <div>Không tìm thấy bài viết</div>;
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
          Quay lại
        </Button>
        <Title level={3} style={{ flex: 1, textAlign: "center", margin: 0 }}>
          Chi tiết bài viết
        </Title>
        <div style={{ width: 73 }}></div>
      </div>
      <div className="blog-detail-container" style={{ maxWidth: "1200px" }}>
        <Card className="blog-detail-card">
          <div className="blog-header">
            <Title level={2} style={{ marginBottom: 8, textAlign: "center" }}>
              {blog.title}
            </Title>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Space size="middle">
                <Tag icon={<UserOutlined />} color="blue">
                  {blog.author}
                </Tag>
                <Divider
                  type="vertical"
                  style={{
                    height: "24px",
                    margin: "0",
                    borderWidth: "2px",
                    color: "black",
                  }}
                />
                <Tag icon={<CalendarOutlined />}>
                  {formatDate(blog.creationDate)}
                </Tag>
              </Space>
            </div>
          </div>
          {/* {blog.image?.imageUrl && (
            <div style={{ width: "1200px", marginBottom: 16 }}>
              <Image
                src={blog.image.imageUrl}
                alt={blog.title}
                style={{
                  width: "1150px",
                  height: "auto",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
                preview={false}
              />
            </div>
          )} */}
          <div className="blog-content" style={{ marginTop: 24 }}>
            <div className="html-preview" dangerouslySetInnerHTML={{ __html: blog.description }} />
          </div>
        </Card>
      </div>
    </>
  );
};

export default BlogDetail;
