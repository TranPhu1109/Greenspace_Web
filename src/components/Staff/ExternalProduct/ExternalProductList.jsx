// ExternalProductList.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Spin,
  Tooltip,
  Select,
  Upload,
  Row,
  Col,
  Tag,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "@/api/api";
import useProductStore from "@/stores/useProductStore";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import EditorComponent from "@/components/Common/EditorComponent";
import DOMPurify from "dompurify";
import Title from "antd/es/typography/Title";

const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;


const ExternalProductList = () => {
  const [externalProducts, setExternalProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [selectedFiles, setSelectedFiles] = useState({
    imageUrl: null,
    image2: null,
    image3: null,
    designImage1URL: null,
  });
  const [searchText, setSearchText] = useState("");
  const [sortPrice, setSortPrice] = useState(null); // 'asc' | 'desc' | null
  const [filterStatus, setFilterStatus] = useState(null); // true | false | null

  const { uploadImages } = useCloudinaryStorage();
  const { categories, fetchCategories } = useProductStore();

  const fetchExternalProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/externalproduct", {
        params: { pageNumber: 0, pageSize: 50 },
      });
      // Đảm bảo externalProducts luôn là mảng
      let products = [];
      if (Array.isArray(res.data)) {
        products = res.data;
      } else if (Array.isArray(res.data?.items)) {
        products = res.data.items;
      }
      setExternalProducts(products);
    } catch (err) {
      message.error("Không thể tải danh sách sản phẩm.");
      setExternalProducts([]); // fallback là mảng rỗng
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchExternalProducts();
  }, []);

  const handleCreate = (record) => {
    setSelectedProduct(record);
    form.setFieldsValue({
      name: record.name,
      price: record.price,
      stock: record.quantity,
      description: record.description,
      categoryId: undefined,
      size: "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const loadingMessage = message.loading("Đang xử lý...", 0);

      const uploadPromises = [];
      const imageUrls = {
        imageUrl: selectedProduct.imageURL, // Default to original image
        image2: "",
        image3: "",
      };
      let designImage1URL = "";

      // Add handling for main image upload
      if (selectedFiles.imageUrl) {
        uploadPromises.push(
          uploadImages([selectedFiles.imageUrl]).then((urls) => {
            imageUrls.imageUrl = urls[0]; // Update with new uploaded image
          })
        );
      }

      if (selectedFiles.image2) {
        uploadPromises.push(
          uploadImages([selectedFiles.image2]).then((urls) => {
            imageUrls.image2 = urls[0];
          })
        );
      }

      if (selectedFiles.image3) {
        uploadPromises.push(
          uploadImages([selectedFiles.image3]).then((urls) => {
            imageUrls.image3 = urls[0];
          })
        );
      }

      if (selectedFiles.designImage1URL) {
        uploadPromises.push(
          uploadImages([selectedFiles.designImage1URL]).then((urls) => {
            designImage1URL = urls[0];
          })
        );
      }

      await Promise.all(uploadPromises);

      const productData = {
        name: values.name,
        categoryId: values.categoryId,
        price: values.price,
        stock: values.stock,
        description: values.description,
        size: values.size,
        image: imageUrls,
        designImage1URL,
      };

      await api.post("/api/product", productData);
      await api.put(`/api/externalproduct/price/${selectedProduct.id}`, {
        price: values.price,
        isSell: true,
      });

      loadingMessage();
      message.success("Tạo sản phẩm thành công");
      setModalOpen(false);
      fetchExternalProducts();

      setSelectedFiles({
        imageUrl: null,
        image2: null,
        image3: null,
        designImage1URL: null,
      });
    } catch (error) {
      message.error("Lỗi khi tạo sản phẩm: " + error.message);
    }
  };

  const getImagePreview = (imageUrl) => {
    if (!imageUrl) return null;
    return (
      <img
        src={imageUrl}
        alt="Preview"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    );
  };

  // Hàm định dạng giá VNĐ
  const formatVND = (value) =>
    value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) ||
    "";

  // Filter & sort logic
  const getFilteredProducts = () => {
    let data = Array.isArray(externalProducts) ? [...externalProducts] : [];

    // Search by id or name
    if (searchText.trim()) {
      const lower = searchText.trim().toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(lower) ||
          item.id.toLowerCase().includes(lower)
      );
    }

    // Filter by isSell
    if (filterStatus !== null) {
      data = data.filter((item) => item.isSell === filterStatus);
    }

    // Sort by price
    if (sortPrice === "asc") {
      data.sort((a, b) => a.price - b.price);
    } else if (sortPrice === "desc") {
      data.sort((a, b) => b.price - a.price);
    }

    return data;
  };

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Tooltip title={text}>
          <Typography.Text copyable={{ text }} style={{ fontWeight: 500 }}>
            {text.slice(0, 8)}...
          </Typography.Text>
        </Tooltip>
      )
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={record.imageURL}
            alt={text}
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 4,
              marginRight: 12,
              border: "1px solid #ddd",
            }}
          />
          <span>{text}</span>
        </div>
      ),
    },
    // {
    //   title: "Số lượng",
    //   dataIndex: "quantity",
    //   key: "quantity",
    //   align: "center",
    // },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "left",
      render: (value) => <span>{formatVND(value)}</span>,
    },

    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 500,
      align: "left",
      render: (text) => {
        const hasImage = /<img[\s\S]*?>/i.test(text);

        // Tạo bản text không chứa hình ảnh cho cell
        const sanitizedForCell = DOMPurify.sanitize(text, {
          ALLOWED_TAGS: [
            "b",
            "i",
            "u",
            "strong",
            "em",
            "p",
            "br",
            "ul",
            "ol",
            "li",
            "span",
          ],
          ALLOWED_ATTR: ["style"],
        });

        const clampStyle = {
          display: "-webkit-box",
          WebkitLineClamp: hasImage ? 1 : 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: "14px",
        };

        return (
          <Tooltip
            color="white"
            title={
              <div
                className="html-preview"
                dangerouslySetInnerHTML={{ __html: text }}
                style={{
                  fontSize: "14px",
                  maxHeight: 500,
                  overflowY: "auto",
                  paddingRight: 8,
                  scrollbarWidth: "thin", // Firefox
                  scrollbarColor: "#888 #f1f1f1", // Firefox
                }}
              />
            }
            styles={{
              root: {
                maxWidth: 700,
              },
              inner: {
                maxHeight: 500,
                overflowY: "auto",
              },
            }}
          >
            <div
              className="html-preview"
              dangerouslySetInnerHTML={{ __html: sanitizedForCell }}
              style={clampStyle}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isSell",
      key: "isSell",
      align: "left",
      render: (isSell) =>
        isSell ? (
          <Tag color="success" style={{ fontWeight: 500 }}>Đã đăng bán</Tag>
        ) : (
          <Tag color="warning" style={{ fontWeight: 500 }}>
            Chưa đăng bán
          </Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleCreate(record)}
          disabled={record.isSell}
        >
          Đăng bán
        </Button>
      ),
    },
  ];

  return (
    <>
      <Title level={3} style={{ marginBottom: "20px" }}>
        Sản phẩm từ thiết kế
      </Title>
      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={12} lg={12}>
            <Search
              placeholder="Tìm theo tên hoặc mã sản phẩm"
              allowClear
              enterButton="Tìm kiếm"
              onSearch={setSearchText}
              onChange={e => setSearchText(e.target.value)}
              value={searchText}
            />
          </Col>
          <Col xs={24} sm={6} md={6} lg={6}>
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Lọc trạng thái"
              value={filterStatus}
              onChange={val => setFilterStatus(val)}
            >
              <Option value={true}>Đã đăng bán</Option>
              <Option value={false}>Chưa đăng bán</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={6} lg={6}>
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Sắp xếp theo giá"
              value={sortPrice}
              onChange={val => setSortPrice(val)}
            >
              <Option value="asc">Giá tăng dần</Option>
              <Option value="desc">Giá giảm dần</Option>
            </Select>
          </Col>
        </Row>
        <Table
          dataSource={getFilteredProducts()}
          columns={columns}
          rowKey="id"
          pagination={{
            // pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
        />
      </Spin>

      <Modal
        title="Đăng bán sản phẩm"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        width={900}
        bodyStyle={{
          maxHeight: 700,
          overflowY: "auto",
          paddingRight: 24,
          scrollbarWidth: "thin",
          scrollbarColor: "#888 #f1f1f1", // Firefox
          WebkitOverflowScrolling: "touch", // iOS smooth scrolling
        }}
        style={{
          top: 32,
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Nhóm thông tin chung */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn danh mục">
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stock"
                label="Tồn kho"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="size" label="Kích thước (cm)">
                <Input placeholder="VD: 100cm x 100cm" />
              </Form.Item>
            </Col>
          </Row>

          {/* Ảnh sản phẩm */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Ảnh chính" style={{ marginBottom: 0 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={(file) => {
                      setSelectedFiles((prev) => ({ ...prev, imageUrl: file }));
                      return false;
                    }}
                    onRemove={() => {
                      setSelectedFiles((prev) => ({ ...prev, imageUrl: null }));
                    }}
                  >
                    {selectedFiles.imageUrl ? null : selectedProduct?.imageURL ? (
                      getImagePreview(selectedProduct.imageURL)
                    ) : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải ảnh mới</div>
                      </div>
                    )}
                  </Upload>
                  {selectedProduct?.imageURL && !selectedFiles.imageUrl && (
                    <div
                      style={{
                        marginTop: 4,
                        color: "#666",
                        textAlign: "center",
                        fontSize: "12px",
                        fontStyle: "italic",
                        width: "100%",
                        lineHeight: 1.2,
                      }}
                    >
                      (Ảnh gốc từ sản phẩm)
                    </div>
                  )}
                </div>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Ảnh phụ 1">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={(file) => {
                    setSelectedFiles((prev) => ({ ...prev, image2: file }));
                    return false;
                  }}
                  onRemove={() => {
                    setSelectedFiles((prev) => ({ ...prev, image2: null }));
                  }}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Ảnh phụ 2">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={(file) => {
                    setSelectedFiles((prev) => ({ ...prev, image3: file }));
                    return false;
                  }}
                  onRemove={() => {
                    setSelectedFiles((prev) => ({ ...prev, image3: null }));
                  }}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* PDF hướng dẫn */}
          <Form.Item label="File hướng dẫn (PDF)">
            <Upload
              listType="text"
              maxCount={1}
              accept=".pdf"
              beforeUpload={(file) => {
                if (file.type !== "application/pdf") {
                  message.error("Chỉ chấp nhận file PDF!");
                  return Upload.LIST_IGNORE;
                }
                setSelectedFiles((prev) => ({
                  ...prev,
                  designImage1URL: file,
                }));
                return false;
              }}
            >
              <Button icon={<PlusOutlined />}>Tải lên file PDF</Button>
            </Upload>
          </Form.Item>

          {/* Mô tả sản phẩm */}
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true }]}
          >
            <EditorComponent
              value={form.getFieldValue("description") || ""}
              onChange={(value) => form.setFieldsValue({ description: value })}
              height={400}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ExternalProductList;
