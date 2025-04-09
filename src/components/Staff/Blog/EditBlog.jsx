import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Upload } from "antd";
import "./NewBlog.scss";
import useBlogStore from "@/stores/useBlogStore";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import EditorComponent from "@/components/Common/EditorComponent";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [fileList, setFileList] = useState([]);
  const { uploadImages } = useCloudinaryStorage();
  const { updateBlog, loading, blogs } = useBlogStore();

  useEffect(() => {
    const blog = blogs.find((b) => b.id === id);
    if (blog) {
      form.setFieldsValue({
        title: blog.title,
        author: blog.author,
      });
      setDescription(blog.description);
      if (blog.image) {
        const existingImages = [blog.image.imageUrl, blog.image.image2, blog.image.image3]
          .filter(Boolean)
          .map((url) => ({
            uid: `existing-${Date.now()}-${url}`,
            name: 'existing-image',
            status: 'done',
            url: url
          }));
        setImages(existingImages);
        setFileList(existingImages);
      }
    }
  }, [id, blogs, form]);

  const handleSubmit = async (values) => {
    try {
      if (!images || images.length === 0) {
        message.error("Vui lòng tải lên ít nhất một ảnh");
        return;
      }

      // Kiểm tra xem có ảnh mới cần upload không
      let imageUrl = '';
      const hasNewImage = fileList.some(img => img.originFileObj);
      
      if (hasNewImage) {
        // Nếu có ảnh mới, upload lên Cloudinary
        const filesToUpload = images
          .filter(img => img.originFileObj)
          .map(img => img.originFileObj);
        const uploadedUrls = await uploadImages(filesToUpload);
        if (uploadedUrls[0]) {
          imageUrl = uploadedUrls[0];
        }
      } else {
        // Nếu không có ảnh mới, giữ nguyên URL ảnh cũ
        imageUrl = images[0]?.url || '';
      }
      console.log(imageUrl);
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

      await updateBlog(id, blogData);
      message.success("Cập nhật blog thành công");
      navigate("/staff/blog");
    } catch (error) {
      message.error("Không thể cập nhật blog: " + error.message);
    }
  };

  return (
    <div className="new-blog">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
          Quay lại
        </Button>
        <h1 style={{ margin: 0 }}>Chỉnh Sửa Blog</h1>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="new-blog-form"
      >
        <div style={{ display: 'flex', gap: '16px' }}>
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

        <Form.Item
          label="Hình ảnh blog"
          required
          rules={[
            { required: true, message: "Vui lòng tải lên ít nhất một ảnh" },
          ]}
        >
          <Upload
            listType="picture-card"
            showUploadList={{ showRemoveIcon: true }}
            onRemove={() => {
              setImages([]);
              setFileList([]);
            }}
            fileList={fileList}
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                // Xóa preview URL của ảnh cũ nếu có
                if (images.length > 0) {
                  images.forEach(image => {
                    if (image.preview) {
                      URL.revokeObjectURL(image.preview);
                    }
                  });
                }

                const newFile = {
                  ...file,
                  preview: URL.createObjectURL(file),
                  originFileObj: file // Lưu file gốc để upload
                };

                // Cập nhật state với ảnh mới
                setImages([newFile]);
                setFileList([{
                  uid: newFile.uid,
                  name: newFile.name,
                  status: 'done',
                  url: newFile.preview,
                  originFileObj: newFile.originFileObj // Lưu file gốc để upload
                }]);
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
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: "16px" }}>
            Cập nhật blog
          </Button>
          <Button onClick={() => navigate("/staff/blog")}>Hủy</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditBlog;
