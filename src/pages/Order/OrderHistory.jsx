import React from "react";
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
} from "antd";
import { format } from "date-fns";
import { HomeOutlined, ShoppingOutlined } from "@ant-design/icons";
import useOrderHistoryStore from "../../stores/useOrderHistoryStore";
import useProductStore from "../../stores/useProductStore";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const { Title, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;

const OrderHistory = () => {
  const { orders, loading, error, fetchOrderHistory } = useOrderHistoryStore();
  const { getProductById } = useProductStore();
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [productDetails, setProductDetails] = React.useState({});

  React.useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  React.useEffect(() => {
    const fetchProductDetails = async () => {
      if (!orders) return;
      
      const productIds = orders.flatMap(order => 
        order.orderDetails?.map(detail => detail.productId) || []
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
      1: { color: "blue", text: "Đang xử lý" },
      2: { color: "orange", text: "Đang giao hàng" },
      3: { color: "green", text: "Đã giao hàng" },
      4: { color: "red", text: "Đã hủy" },
    };
    return statusMap[status] || { color: "default", text: "Không xác định" };
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: "15%",
      render: (id) => <Text strong>#{id.slice(0, 8)}...</Text>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "creationDate",
      key: "creationDate",
      width: "15%",
      render: (date) => format(new Date(date), "dd/MM/yyyy HH:mm"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: "25%",
    },
    {
      title: "Phí ship",
      dataIndex: "shipPrice",
      key: "shipPrice",
      width: "10%",
      render: (price) => (
        <Text type="secondary">{price.toLocaleString()}đ</Text>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: "15%",
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
      width: "15%",
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
        width: "40%",
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
        width: "20%",
        render: (quantity) => <Text>{quantity}</Text>,
      },
      {
        title: "Đơn giá",
        dataIndex: "price",
        key: "price",
        width: "20%",
        render: (price) => (
          <Text type="secondary">{price.toLocaleString()}đ</Text>
        ),
      },
      {
        title: "Thành tiền",
        key: "total",
        width: "20%",
        render: (_, record) => (
          <Text type="success" strong>
            {(record.price * record.quantity).toLocaleString()}đ
          </Text>
        ),
      },
    ];

    return (
      <Card size="small" className="expanded-row-card">
        <Table
          columns={detailColumns}
          dataSource={record.orderDetails}
          pagination={false}
          rowKey="productId"
        />
      </Card>
    );
  };

  const filteredOrders = React.useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  if (error) {
    return <div>Error: {error}</div>;
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
          <Card className="order-history-card" style={{ padding: "24px" }}>
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
                    <Option value="3">Đã giao hàng</Option>
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
