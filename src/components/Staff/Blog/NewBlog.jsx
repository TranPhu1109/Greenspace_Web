import React, { useState } from "react";
import { Form, Input, Button, message, Upload } from "antd";
import EditorComponent from "@/components/Common/EditorComponent";
import "./NewBlog.scss";
import useBlogStore from "@/stores/useBlogStore";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

const NewBlog = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [fileList, setFileList] = useState([]);
  const { uploadImages } = useCloudinaryStorage();
  const { createBlog, loading } = useBlogStore();

  const handleSubmit = async (values) => {
    try {
      if (!images || images.length === 0) {
        message.error("Vui lòng tải lên ít nhất một ảnh");
        return;
      }

      // Chỉ upload file mới, không phải URL preview
      const filesToUpload = images.map((img) => img.originFileObj || img);
      const uploadedUrls = await uploadImages(filesToUpload);

      // Đảm bảo luôn có đủ 3 ảnh, nếu không sẽ dùng giá trị mặc định là null
      const [imageUrl = null] = uploadedUrls;

      const blogData = {
        title: values.title,
        description,
        author: values.author,
        image: {
          imageUrl,
          // image2,
          // image3,
        },
      };

      await createBlog(blogData);
      message.success("Tạo blog mới thành công");
      form.resetFields();
      setDescription("");
      navigate("/staff/blog");
    } catch (error) {
      message.error("Không thể tạo blog mới: " + error.message);
    }
  };

  return (
    <div className="new-blog">
      <h1 style={{ margin: "0 0 20px" }}>Thêm Blog Mới</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="new-blog-form"
      >
        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Nhập tiêu đề blog" />
          </Form.Item>

          <Form.Item
            name="author"
            label="Tác giả"
            rules={[{ required: true, message: "Vui lòng nhập tên tác giả" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Nhập tên tác giả" />
          </Form.Item>
        </div>
        <Form.Item label="Hình ảnh blog" required>
          <Upload
            listType="picture-card"
            showUploadList={{ showRemoveIcon: true }}
            onRemove={() => {
              setImages([]);
              setFileList([]);
            }}
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                if (images[0]) URL.revokeObjectURL(images[0]);
                const newFile = {
                  ...file,
                  preview: URL.createObjectURL(file),
                  originFileObj: file, // Lưu file gốc để upload
                };
                setImages([newFile]);
                setFileList([{ uid: newFile.uid, name: newFile.name }]);
                onSuccess();
              } catch (error) {
                onError(error);
              }
            }}
            maxCount={1}
            accept="image/*"
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Ảnh chính</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Nội dung bài viết"
          required
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <EditorComponent value={description} onChange={setDescription} />
        </Form.Item>

        <Form.Item className="form-actions">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ marginRight: 10 }}
          >
            Đăng blog
          </Button>
          <Button onClick={() => navigate("/staff/blog")}>Hủy</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NewBlog;
