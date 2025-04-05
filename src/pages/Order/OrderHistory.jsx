import React, { useState } from "react";
import {
  Table,
  Tag,
  Card,
  Select,
  Space,
  Typography,
  Layout,
  Breadcrumb,
  Row,
  Col,
  Spin,
  Form,
  Rate,
  Input,
  Button,
  message,
  notification,
  Modal,
  Image,
  Descriptions,
} from "antd";
import { format } from "date-fns";
import { HomeOutlined, ShoppingOutlined } from "@ant-design/icons";
import useOrderHistoryStore from "../../stores/useOrderHistoryStore";
import useProductStore from "../../stores/useProductStore";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { checkToxicContent } from "@/services/moderationService";
import useAuthStore from "@/stores/useAuthStore";
import { render } from "sass";

const { TextArea } = Input;

const { Title, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;

const OrderHistory = () => {
  const { orders, loading, error, fetchOrderHistory } = useOrderHistoryStore();
  const { getProductById, createProductFeedback } = useProductStore();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [productDetails, setProductDetails] = React.useState({});
  const [feedbackForm] = Form.useForm();
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [selectedProductForFeedback, setSelectedProductForFeedback] =
    useState(null);

  React.useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  React.useEffect(() => {
    const fetchProductDetails = async () => {
      if (!orders) return;

      const productIds = orders.flatMap(
        (order) => order.orderDetails?.map((detail) => detail.productId) || []
      );

      const uniqueProductIds = [...new Set(productIds)];
      const details = {};

      for (const productId of uniqueProductIds) {
        try {
          const product = await getProductById(productId);
          if (product) {
            details[productId] = product;
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }

      setProductDetails(details);
    };

    if (orders && orders.length > 0) {
      fetchProductDetails();
    }
  }, [orders, getProductById]);

  const getStatusTag = (status) => {
    const statusMap = {
      0: { color: "warning", text: "Chờ xử lý" },
      1: { color: "processing", text: "Đã xác nhận đơn hàng" },
      2: { color: "success", text: "Đã xử lý" },
      3: { color: "error", text: "Đã huỷ" },
      4: { color: "warning", text: "Đã hoàn tiền" },
      5: { color: "success", text: "Đã hoàn tiền xong" },
      6: { color: "processing", text: "Đã lấy hàng & đang giao" },
      7: { color: "error", text: "Giao hàng thất bại" },
      8: { color: "warning", text: "Giao lại" },
      9: { color: "success", text: "Đã giao hàng thành công" },
    };
    return statusMap[status] || { color: "default", text: "Không xác định" };
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text strong>#{id.slice(0, 8)}...</Text>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "creationDate",
      key: "creationDate",
      render: (date) => format(new Date(date), "dd/MM/yyyy HH:mm"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Mã vận đơn",
      dataIndex: "deliveryCode",
      key: "deliveryCode",
      render: (deliveryCode) => <Text strong>{deliveryCode || "--"}</Text>,
    },
    {
      title: "Phí ship",
      dataIndex: "shipPrice",
      key: "shipPrice",
      render: (price) => (
        <Text type="secondary">{price.toLocaleString()}đ</Text>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <Text type="success" strong>
          {amount.toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const { color, text } = getStatusTag(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];
  const expandedRowRender = (record) => {
    const detailColumns = [
      {
        title: "Sản phẩm",
        dataIndex: "productId",
        key: "productId",
        render: (productId) => {
          const product = productDetails[productId];
          return (
            <Space>
              {product?.image?.imageUrl && (
                <img
                  src={product.image.imageUrl}
                  alt={product.name}
                  style={{ width: 50, height: 50, objectFit: "cover" }}
                />
              )}
              <Space direction="vertical" size={0}>
                <Text strong>{product?.name || "Sản phẩm không tồn tại"}</Text>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  #{productId.slice(0, 8)}...
                </Text>
              </Space>
            </Space>
          );
        },
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        render: (quantity) => <Text>{quantity}</Text>,
      },
      {
        title: "Đơn giá",
        dataIndex: "price",
        key: "price",
        render: (price) => (
          <Text type="secondary">{price.toLocaleString()}đ</Text>
        ),
      },
      {
        title: "Thành tiền",
        key: "total",
        render: (_, record) => (
          <Text type="success" strong>
            {(record.price * record.quantity).toLocaleString()}đ
          </Text>
        ),
      },
      {
        key: "feedback",
        render: (_, record) => {
          const orderStatus = record.parentOrder.status;
          if (orderStatus === 9 || orderStatus === "9") {
            return (
              <Button
                type="dashed"
                onClick={() => {
                  const product = productDetails[record.productId];
                  setSelectedProductForFeedback({
                    ...record,
                    productId: record.productId,
                    product: product,
                  });
                }}
              >
                ✨ Đánh giá sản phẩm
              </Button>
            );
          }
          return null;
        },
      },
    ];

    const handleFeedbackSubmit = async (values) => {
      if (!user) {
        message.warning("Vui lòng đăng nhập để gửi đánh giá");
        return;
      }

      setIsSubmittingFeedback(true);
      try {
        const moderationResult = await checkToxicContent(values.description);

        if (moderationResult.isToxic) {
          notification.error({
            message: "Không thể gửi đánh giá",
            description: moderationResult.reason,
            duration: 3,
            placement: "topRight",
          });
          return;
        }

        await createProductFeedback({
          userId: user.id,
          productId: selectedProductForFeedback.productId,
          rating: values.rating,
          description: values.description,
        });

        message.success({
          content: "Cảm ơn bạn đã gửi đánh giá!",
          duration: 3,
          style: { marginTop: "20vh" },
        });

        feedbackForm.resetFields();
        setSelectedProductForFeedback(null);
      } catch (error) {
        console.error(error);
        message.error({
          content: "Không thể gửi đánh giá. Vui lòng thử lại sau.",
          duration: 3,
          style: { marginTop: "20vh" },
        });
      } finally {
        setIsSubmittingFeedback(false);
      }
    };

    return (
      <Card size="small" className="expanded-row-card">
        <Table
          columns={detailColumns}
          dataSource={record.orderDetails.map((detail) => ({
            ...detail,
            parentOrder: record,
          }))}
          pagination={false}
          rowKey="productId"
        />
        <Modal
          title="Đánh giá sản phẩm"
          open={selectedProductForFeedback !== null}
          onCancel={() => setSelectedProductForFeedback(null)}
          footer={null}
          width={800}
        >
          {selectedProductForFeedback && selectedProductForFeedback.product && (
            <Row gutter={[24, 24]}>
              <Col span={10}>
                <Image
                  src={selectedProductForFeedback.product.image.imageUrl}
                  alt={selectedProductForFeedback.product.name}
                  style={{
                    width: "300px",
                    height: "200px",
                    objectFit: "cover",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  }}
                />
                <Descriptions
                  column={1}
                >
                  <Descriptions.Item >
                    <Text strong style={{ fontSize: "16px", textAlign: "center" }}>{selectedProductForFeedback.product.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Đơn giá">
                    <Text type="success" strong>{
                      selectedProductForFeedback.product.price?.toLocaleString()
                    }đ</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={14}>
                <Form
                  form={feedbackForm}
                  onFinish={handleFeedbackSubmit}
                  layout="vertical"
                >
                  <Form.Item
                    name="rating"
                    label="Đánh giá"
                    rules={[
                      { required: true, message: "Vui lòng chọn số sao" },
                    ]}
                  >
                    <Rate />
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label="Nhận xét"
                    rules={[
                      { required: true, message: "Vui lòng nhập nhận xét" },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          feedbackForm.submit();
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmittingFeedback}
                      >
                        Gửi đánh giá
                      </Button>
                      <Button
                        onClick={() => setSelectedProductForFeedback(null)}
                      >
                        Hủy
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          )}
        </Modal>
      </Card>
    );
  };

  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  if (error) {
    return (
      <Layout>
        <Header />
        <Content style={{ marginTop: 200 }}>
          <div className="container mx-auto px-4">
            <Alert
              message="Lỗi"
              description={error}
              type="error"
              showIcon
            />
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Content style={{ marginTop: 200 }}>
        <div className="container mx-auto px-4">
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item href="/Home">
              <HomeOutlined /> Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <ShoppingOutlined /> Lịch sử đơn hàng
            </Breadcrumb.Item>
          </Breadcrumb>
          <Card className="order-history-card" >
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Title level={4} style={{ margin: 0 }}>
                    Lịch sử đặt sản phẩm
                  </Title>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 200 }}
                  >
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="1">Đang xử lý</Option>
                    <Option value="2">Đang giao hàng</Option>
                    <Option value="9">Đã giao hàng</Option>
                    <Option value="4">Đã hủy</Option>
                  </Select>
                </Space>
              </Col>
              <Col span={24}>
                <Table
                  columns={columns}
                  dataSource={filteredOrders}
                  expandable={{
                    expandedRowRender,
                    rowExpandable: (record) => record.orderDetails?.length > 0,
                  }}
                  loading={loading}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} đơn hàng`,
                  }}
                  locale={{
                    emptyText: (
                      <div style={{ padding: "24px 0" }}>
                        <ShoppingOutlined style={{ fontSize: 24, marginBottom: 16 }} />
                        <p>Chưa có đơn hàng nào</p>
                      </div>
                    )
                  }}
                />
              </Col>
            </Row>
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default OrderHistory;
