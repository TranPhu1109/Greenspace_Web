import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Card,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Form,
  Rate,
  Input,
  Button,
  message,
  notification,
  Modal,
  Image,
  Descriptions,
  Alert,
  Spin,
} from "antd";
import { format } from "date-fns";
import { ShoppingOutlined, LoadingOutlined } from "@ant-design/icons";
import useOrderHistoryStore from "../../../stores/useOrderHistoryStore";
import useProductStore from "../../../stores/useProductStore";
import useAuthStore from "../../../stores/useAuthStore";
import ComplaintModal from '../../../components/Order/ComplaintModal';
import useComplaintStore from '../../../stores/useComplaintStore';
import { checkToxicContent } from "../../../services/moderationService";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const OrderHistoryTab = () => {
  const { orders, loading: ordersLoading, error, fetchOrderHistory, cancelOrder } = useOrderHistoryStore();
  const { getProductById, createProductFeedback } = useProductStore();
  const { user } = useAuthStore();
  const { fetchUserComplaints } = useComplaintStore();
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [productDetails, setProductDetails] = React.useState({});
  const [feedbackForm] = Form.useForm();
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [selectedProductForFeedback, setSelectedProductForFeedback] = useState(null);
  const [complaintModalVisible, setComplaintModalVisible] = useState(false);
  const [selectedComplaintType, setSelectedComplaintType] = useState(null);
  const [selectedProductForComplaint, setSelectedProductForComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);

  // Kết hợp fetch orders và complaints trong một effect
  useEffect(() => {
    const initializeData = async () => {
      setDataInitialized(false);
      
      // Fetch order history
      await fetchOrderHistory();
      
      // Fetch complaints nếu user đã đăng nhập
      if (user?.id) {
        setComplaintsLoading(true);
        try {
          const data = await fetchUserComplaints(user.id);
          setComplaints(data || []);
        } catch (err) {
          console.error("Error fetching complaints:", err);
          setComplaints([]);
        } finally {
          setComplaintsLoading(false);
        }
      }
      
      setDataInitialized(true);
    };
    
    initializeData();
  }, [fetchOrderHistory, fetchUserComplaints, user?.id]);

  // Helper function to check if an order has a complaint
  const hasComplaint = (orderId) => {
    if (!complaints || !Array.isArray(complaints) || complaints.length === 0) return false;
    return complaints.some(complaint => complaint.orderId === orderId);
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!orders || orders.length === 0) return;

      const productIds = orders.flatMap(
        (order) => order.orderDetails?.map((detail) => detail.productId) || []
      );

      const uniqueProductIds = [...new Set(productIds)];
      const missingProductIds = uniqueProductIds.filter(id => !productDetails[id]);
      
      if (missingProductIds.length === 0) {
        return;
      }
      
      let newDetails = { ...productDetails };
      let hasNewData = false;

      for (const productId of missingProductIds) {
        try {
          const product = await getProductById(productId);
          if (product) {
            newDetails[productId] = product;
            hasNewData = true;
          }
        } catch (error) {
        }
      }

      if (hasNewData) {
        setProductDetails(newDetails);
      }
    };

    if (dataInitialized) {
      fetchProductDetails();
    }
  }, [orders, getProductById, dataInitialized]);

  // Cập nhật complaints sau khi đóng modal khiếu nại
  useEffect(() => {
    if (!complaintModalVisible && user?.id && dataInitialized) {
      const refreshComplaints = async () => {
        setComplaintsLoading(true);
        try {
          const data = await fetchUserComplaints(user.id);
          setComplaints(data || []);
        } catch (err) {
          console.error("Error refreshing complaints:", err);
        } finally {
          setComplaintsLoading(false);
        }
      };
      
      refreshComplaints();
    }
  }, [complaintModalVisible, user?.id, fetchUserComplaints, dataInitialized]);

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
      width: 120,
      render: (id) => <Text strong>#{id.slice(0, 8)}...</Text>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "creationDate",
      key: "creationDate",
      width: 100,
      render: (date) => format(new Date(date), "dd/MM/yyyy HH:mm"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: 200,
      render: (address) => address.replace(/\|/g, ', '),
    },
    {
      title: "Mã vận đơn",
      dataIndex: "deliveryCode",
      key: "deliveryCode",
      width: 100,
      render: (deliveryCode) => <Text strong>{deliveryCode || "--"}</Text>,
    },
    {
      title: "Phí ship",
      dataIndex: "shipPrice",
      key: "shipPrice",
      width: 100,
      render: (price) => (
        <Text type="secondary">{price.toLocaleString()}đ</Text>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 100,
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
      width: 100,
      render: (status) => {
        const { color, text } = getStatusTag(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      render: (_, record) => {
        const isCompleted = record.status === 9 || record.status === "9";
        const hasExistingComplaint = hasComplaint(record.id);

        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            {record.status === 0 || record.status === "0" ? (
              <Button
                danger
                block
                onClick={() => {
                  Modal.confirm({
                    title: "Xác nhận hủy đơn hàng",
                    content: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
                    okText: "Hủy đơn",
                    cancelText: "Đóng",
                    okButtonProps: { danger: true },
                    onOk: async () => {
                      try {
                        const success = await cancelOrder(record.id);
                        if (success) {
                          message.success("Đã hủy đơn hàng và hoàn tiền thành công");
                        } else if (error) {
                          message.error(error);
                        }
                      } catch (err) {
                        message.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
                      }
                    },
                  });
                }}
              >
                Hủy đơn
              </Button>
            ) : null}
            {isCompleted && (
              <>
                <Button
                  type="dashed"
                  danger
                  block
                  disabled={hasExistingComplaint}
                  onClick={() => {
                    setSelectedProductForComplaint({
                      parentOrder: record,
                      orderDetails: record.orderDetails
                    });
                    setSelectedComplaintType('refund');
                    setComplaintModalVisible(true);
                  }}
                >
                  {hasExistingComplaint ? 'Đã gửi yêu cầu' : 'Yêu cầu hoàn tiền'}
                </Button>
                <Button
                  type="dashed"
                  danger
                  block
                  disabled={hasExistingComplaint}
                  onClick={() => {
                    setSelectedProductForComplaint({
                      parentOrder: record,
                      orderDetails: record.orderDetails
                    });
                    setSelectedComplaintType('exchange');
                    setComplaintModalVisible(true);
                  }}
                >
                  {hasExistingComplaint ? 'Đã gửi yêu cầu' : 'Yêu cầu đổi trả'}
                </Button>
              </>
            )}
          </Space>
        );
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

          // Show loading state if product is being fetched
          if (!product) {
            return (
              <Space>
                <div style={{ width: 50, height: 50, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                  <ShoppingOutlined style={{ fontSize: 20, color: '#bbb' }} />
                </div>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Đang tải thông tin sản phẩm...</Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    #{productId.slice(0, 8)}...
                  </Text>
                </Space>
              </Space>
            );
          }

          // Normal rendering with product details
          return (
            <Space>
              {product?.image?.imageUrl ? (
                <img
                  src={product.image.imageUrl}
                  alt={product.name}
                  style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
                />
              ) : (
                <div style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                  <ShoppingOutlined style={{ fontSize: 20, color: '#999' }} />
                </div>
              )}
              <Space direction="vertical" size={0}>
                <Text strong>{product.name}</Text>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {product.categoryName || `#${productId.slice(0, 8)}...`}
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
        title: "Thao tác",
        render: (_, record) => {
          const orderStatus = record?.parentOrder?.status;
          if (orderStatus === 9 || orderStatus === "9") {
            return (
              <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
                <Button
                  type="dashed"
                  onClick={() => {
                    const product = productDetails[record.productId];
                    if (!product) {
                      message.warning("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
                      return;
                    }
                    setSelectedProductForFeedback({
                      ...record,
                      productId: record.productId,
                      product: product,
                    });
                  }}
                >
                  ✨ Đánh giá sản phẩm
                </Button>
              </div>
            );
          }
          return null;
        },
      },
    ];

    return (
      <Card size="small" className="expanded-row-card">
        <Table
          columns={detailColumns}
          dataSource={record.orderDetails.map((detail) => ({
            ...detail,
            parentOrder: record,
            key: detail.productId, // Ensure each row has a unique key
          }))}
          pagination={false}
          rowKey="productId"
        />
      </Card>
    );
  };

  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

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

  const isLoading = ordersLoading || complaintsLoading || !dataInitialized;

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
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
              disabled={isLoading}
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
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} 
                tip="Đang tải dữ liệu..." 
              />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredOrders}
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => record.orderDetails?.length > 0,
              }}
              rowKey="id"
              pagination={{
                // pageSize: 10,
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
          )}
        </Col>
      </Row>
      <ComplaintModal
        visible={complaintModalVisible}
        onCancel={() => {
          setComplaintModalVisible(false);
          setSelectedComplaintType(null);
          setSelectedProductForComplaint(null);
        }}
        type={selectedComplaintType}
        selectedProductForComplaint={selectedProductForComplaint}
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
    </div>
  );
};

export default OrderHistoryTab; 