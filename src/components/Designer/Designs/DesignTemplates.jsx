import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Image,
  message,
  Space,
  Modal,
  Table,
  Tag,
  Typography,
  Descriptions,
  Input,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import useDesignIdeaStore from "../../../stores/useDesignIdeaStore";
import useDesignCategoryStore from "../../../stores/useDesignCategoryStore";
import CreateDesignModal from "./components/CreateDesignModal";
import EditDesignModal from "./components/EditDesignModal";
import useProductStore from "@/stores/useProductStore";

const DesignTemplates = () => {
  const {
    designIdeas,
    isLoading,
    fetchDesignIdeas,
    createDesignIdea,
    updateDesignIdea,
    deleteDesignIdea,
  } = useDesignIdeaStore();
  const { categories, fetchCategories } = useDesignCategoryStore();
  const { products, fetchProducts } = useProductStore();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentDesign, setCurrentDesign] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchDesignIdeas();
    fetchCategories();
    fetchProducts();
  }, [fetchDesignIdeas, fetchCategories, fetchProducts]);

  console.log(products);
  const handleCreateSubmit = async (values) => {
    try {
      await createDesignIdea(values);
      message.success("Thêm mẫu thiết kế thành công");
      setCreateModalVisible(false);
      fetchDesignIdeas();
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      await updateDesignIdea(values.id, values);
      message.success("Cập nhật mẫu thiết kế thành công");
      setEditModalVisible(false);
      setCurrentDesign(null);
      fetchDesignIdeas();
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleEdit = (design) => {
    setCurrentDesign(design);
    setEditModalVisible(true);
  };

  const handleDelete = (design) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa mẫu thiết kế "${design.name}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteDesignIdea(design.id);
          message.success("Xóa mẫu thiết kế thành công");
          fetchDesignIdeas();
        } catch (error) {
          message.error("Có lỗi xảy ra: " + error.message);
        }
      },
    });
  };

  // Định nghĩa các cột cho bảng
  const columns = [
    {
      title: "Tên mẫu thiết kế",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          {record.image?.imageUrl && (
            <Image
              src={record.image.imageUrl}
              alt={text}
              width={50}
              height={50}
              style={{ objectFit: "cover", borderRadius: 8, marginRight: 8 }}
              preview={false}
            />
          )}
          <Typography.Text strong>{text}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price ? price.toLocaleString("vi-VN") : 0}đ`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (category) => <Tag color="blue">{category}</Tag>,
      filters: categories.map((cat) => ({ text: cat.name, value: cat.name })),
      onFilter: (value, record) => record.categoryName === value,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Quản lý mẫu thiết kế"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Thêm mẫu thiết kế
          </Button>
        }
      >
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
            style={{ width: "30%" }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={designIdeas
            .filter(
              (item) =>
                (item?.name?.toLowerCase() || "").includes(
                  searchText.toLowerCase()
                ) ||
                (item?.description?.toLowerCase() || "").includes(
                  searchText.toLowerCase()
                )
            )
            .map((idea) => ({ ...idea, key: idea.id }))}
          loading={isLoading}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <Image
                        src={record.image?.imageUrl}
                        alt={record.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: 300,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        {record.image?.image2 && (
                          <Image
                            src={record.image.image2}
                            alt={`${record.name} - 2`}
                            style={{
                              width: 100,
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        )}
                        {record.image?.image3 && (
                          <Image
                            src={record.image.image3}
                            alt={`${record.name} - 3`}
                            style={{
                              width: 100,
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </Col>
                  <Col span={16}>
                    <Descriptions title={record.name} column={1} bordered>
                      <Descriptions.Item label="Giá">
                        {record.price
                          ? record.price.toLocaleString("vi-VN")
                          : 0}
                        đ
                      </Descriptions.Item>
                      <Descriptions.Item label="Danh mục">
                        {record.categoryName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Mô tả">
                        {record.description}
                      </Descriptions.Item>
                    </Descriptions>
                    {record.productDetails &&
                      record.productDetails.length > 0 && (
                        <>
                          <Typography.Title level={5}>
                            Sản phẩm gợi ý
                          </Typography.Title>
                          <Table
                            size="small"
                            pagination={false}
                            columns={[
                              {
                                title: "Tên sản phẩm",
                                dataIndex: "productName",
                                key: "productName",
                              },
                              {
                                title: "Số lượng",
                                dataIndex: "quantity",
                                key: "quantity",
                              },
                            ]}
                            dataSource={record.productDetails.map(
                              (detail, index) => {
                                // Find the product name from the products array using productId
                                const product = products.find(
                                  (p) => p.id === detail.productId
                                );
                                return {
                                  key: index,
                                  productName: product
                                    ? product.name
                                    : "Không có tên",
                                  quantity: detail.quantity || 1,
                                };
                              }
                            )}
                          />
                        </>
                      )}
                  </Col>
                </Row>
              </div>
            ),
            rowExpandable: (record) => true,
          }}
        />
      </Card>

      <CreateDesignModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateSubmit}
        categories={categories}
      />

      <EditDesignModal
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentDesign(null);
        }}
        onSubmit={handleEditSubmit}
        categories={categories}
        initialValues={currentDesign}
      />
    </div>
  );
};

export default DesignTemplates;
