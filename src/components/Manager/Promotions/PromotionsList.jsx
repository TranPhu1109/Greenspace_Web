import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  Table,
  Button,
  Input,
  Space,
  Card,
  Row,
  Col,
  Tag,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Typography,
  Transfer,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "./PromotionsList.scss";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

import { generateRandomCode } from "../../../utils/helpers";
import useProductStore from "../../../stores/useProductStore";
import usePromotionStore from "../../../stores/usePromotionStore";

const PromotionsList = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [form] = Form.useForm();

  const { products, fetchProducts } = useProductStore();
  const {
    promotions,
    isLoading,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
  } = usePromotionStore();

  useEffect(() => {
    fetchProducts();
    fetchPromotions();
  }, [fetchProducts, fetchPromotions]);

  const handleGenerateCode = () => {
    const code = generateRandomCode(8);
    form.setFieldsValue({ code });
  };

  const handleAdd = () => {
    setEditingPromotion(null);
    setSelectedProducts([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingPromotion(record);
    setSelectedProducts(record.products); // Update this line
    form.setFieldsValue({
      ...record,
      code: record.code,
      name: record.name,
      type: record.type,
      value: record.value,
      dateRange: [moment(record.startDate), moment(record.endDate)],
      selectedProducts: record.products // Add this line
    });
    setIsModalVisible(true);
  };

const handleDelete = async (id) => {
  try {
    // Send DELETE request to delete promotion
    const response = await deletePromotion(id);
    
    // Check if deletion was successful (status 200)
    if (response.status === 200) {
      // Refresh promotions list
      await fetchPromotions();
      message.success("Xóa khuyến mãi thành công");
    } else {
      // Handle non-200 status
      message.error("Không thể xóa khuyến mãi. Vui lòng thử lại sau.");
    }
  } catch (error) {
    // Handle any errors during deletion
    console.error("Error deleting promotion:", error);
    message.error("Có lỗi xảy ra: " + error.message);
  }
};

  // Update handleSubmit
  const handleSubmit = async (values) => {
    try {
      const promotionData = {
        code: values.code,
        name: values.name,
        type: values.type,
        value: values.value,
        products: selectedProducts,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        status: "active",
      };

      if (editingPromotion) {
        await updatePromotion(editingPromotion.id, promotionData);
      } else {
        await createPromotion(promotionData);
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedProducts([]);
      fetchPromotions();
      message.success(
        editingPromotion
          ? "Cập nhật khuyến mãi thành công"
          : "Thêm khuyến mãi thành công"
      );
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  const columns = [
    {
      title: "Mã khuyến mãi",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Tên khuyến mãi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "percentage" ? "blue" : "green"}>
          {type === "percentage" ? "Phần trăm" : "Số tiền cố định"}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (value, record) =>
        record.type === "percentage"
          ? `${value}%`
          : `${value.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Thời gian",
      key: "dateRange",
      render: (_, record) =>
        `${moment(record.startDate).format("DD/MM/YYYY HH:mm")} - 
         ${moment(record.endDate).format("DD/MM/YYYY HH:mm")}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Đang áp dụng" : "Đã kết thúc"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa khuyến mãi này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Update the filteredPromotions to include sorting
  const filteredPromotions = promotions
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.code.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by startDate in descending order (most recent first)
      return new Date(b.startDate) - new Date(a.startDate);
    });

  return (
    <div className="promotions-container">
      <Card title="Danh sách khuyến mãi">
        <Row gutter={[16, 16]} className="mb-4">
          <Col flex="300px">
            <Input
              placeholder="Tìm kiếm khuyến mãi..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col flex="auto" style={{ textAlign: "right" }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchPromotions()}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Thêm khuyến mãi
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredPromotions}
          rowKey="id"
          loading={isLoading}
        />
      </Card>

      <Modal
        title={
          editingPromotion ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"
        }
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedProducts([]);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label="Mã khuyến mãi"
            rules={[
              { required: true, message: "Vui lòng nhập mã khuyến mãi!" },
            ]}
          >
            <Input.Group compact style={{ width: "100%", display: "flex" }}>
              <Form.Item name="code" noStyle>
                <Input style={{ flex: 1 }} placeholder="Nhập mã khuyến mãi" />
              </Form.Item>
              <Button onClick={handleGenerateCode}>Tạo mã ngẫu nhiên</Button>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên khuyến mãi"
            rules={[
              { required: true, message: "Vui lòng nhập tên khuyến mãi!" },
            ]}
          >
            <Input placeholder="Nhập tên khuyến mãi" />
          </Form.Item>

          <Form.Item
            name="selectedProducts"
            label="Sản phẩm áp dụng"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ít nhất một sản phẩm!",
              },
            ]}
          >
            <Transfer
              dataSource={products.map(product => ({
                key: product.id,
                title: product.name,
                description: `${product.price.toLocaleString('vi-VN')}đ`,
                thumbnail: product.thumbnail
              }))}
              showSearch
              filterOption={(search, item) =>
                item.title.toLowerCase().indexOf(search.toLowerCase()) >= 0
              }
              render={item => (
                <div style={{ display: 'flex', alignItems: 'center', padding: '4px' }}>
                  <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    style={{ width: 40, height: 40, marginRight: 8, borderRadius: '50%' }}
                  />
                  <div>
                    <div>{item.title}</div>
                    <Text type="secondary">{item.description}</Text>
                  </div>
                </div>
              )}
              titles={['Sản phẩm có sẵn', 'Sản phẩm được chọn']}
              targetKeys={selectedProducts}
              onChange={setSelectedProducts}
              listStyle={{
                width: "100%",
                height: 300,
              }}
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại khuyến mãi"
            rules={[
              { required: true, message: "Vui lòng chọn loại khuyến mãi!" },
            ]}
          >
            <Select placeholder="Chọn loại khuyến mãi">
              <Option value="percentage">Phần trăm</Option>
              <Option value="fixed">Số tiền cố định</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="value"
            label="Giá trị"
            rules={[
              { required: true, message: "Vui lòng nhập giá trị khuyến mãi!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              max={100}
              placeholder="Nhập giá trị khuyến mãi"
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian áp dụng"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian áp dụng!" },
            ]}
          >
            <RangePicker
              style={{ width: "100%" }}
              showTime
              format="DD/MM/YYYY HH:mm"
            />
          </Form.Item>

          <Form.Item className="form-actions">
            <Space style={{ float: "right" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedProducts([]);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingPromotion ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionsList;
