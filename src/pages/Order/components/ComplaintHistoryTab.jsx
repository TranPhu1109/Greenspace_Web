import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Image,
  Descriptions,
  Alert,
  Button,
  message,
  Modal,
  Tooltip,
  App,
} from "antd";
import { format } from "date-fns";
import { ShoppingOutlined, ReloadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import useComplaintStore from "../../../stores/useComplaintStore";
import useAuthStore from "../../../stores/useAuthStore";
import useProductStore from "../../../stores/useProductStore";

const { Title, Text } = Typography;
const { confirm } = Modal;

const ComplaintHistoryTab = ({ complaints: propsComplaints }) => {
  const { fetchUserComplaints, updateComplaintStatus } = useComplaintStore();
  const { user } = useAuthStore();
  const { getProductById } = useProductStore();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [confirmingComplaint, setConfirmingComplaint] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Use complaints from props if available, otherwise fetch them
  useEffect(() => {
    if (propsComplaints) {
      setComplaints(propsComplaints);
      setLoading(false);
    } else {
      const fetchComplaints = async () => {
        if (!user?.id) return;

        try {
          setLoading(true);
          const data = await fetchUserComplaints(user.id);
          setComplaints(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchComplaints();
    }
  }, [user?.id, fetchUserComplaints, propsComplaints]);

  // Force refresh data function for manual refresh
  const refreshData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await fetchUserComplaints(user.id);
      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle confirm received refund
  const handleConfirmRefund = (complaintId, complaintType) => {
    setConfirmingComplaint(complaintId);

    // Different title and content based on complaint type
    const isProductReturn = complaintType === 'ProductReturn';
    const title = isProductReturn
      ? 'Xác nhận đã nhận được hàng đổi trả'
      : 'Xác nhận đã nhận được tiền hoàn về ví';
    const content = isProductReturn
      ? 'Bạn đã kiểm tra và xác nhận đã nhận được sản phẩm mới đổi trả?'
      : 'Bạn đã kiểm tra và xác nhận đã nhận được tiền hoàn về ví của mình?';
    const okText = isProductReturn ? 'Đã nhận được hàng' : 'Đã nhận được tiền';
    const deliveryCode = complaints.find(complaint => complaint.id === complaintId)?.deliveryCode;

    confirm({
      title: title,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: content,
      okText: okText,
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await updateComplaintStatus(
            complaintId,
            5, // Status 5 = Complete
            isProductReturn ? 0 : 1, // ComplaintType: 0 for ProductReturn, 1 for Refund
            deliveryCode
          );
          messageApi.success(isProductReturn
            ? 'Đã xác nhận nhận hàng thành công!'
            : 'Đã xác nhận nhận tiền hoàn thành công!');
          // Refresh data after confirmation
          refreshData();
        } catch (error) {
          messageApi.error(`Lỗi: ${error.message}`);
        } finally {
          setConfirmingComplaint(null);
        }
      },
      onCancel: () => {
        setConfirmingComplaint(null);
      }
    });
  };

  // Fetch product details for all products in complaints
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!complaints || complaints.length === 0) return;

      const productIds = complaints.flatMap(
        (complaint) => complaint.complaintDetails?.map((detail) => detail.productId) || []
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
          console.error(`Error fetching product ${productId}:`, error);
        }
      }

      if (hasNewData) {
        setProductDetails(newDetails);
      }
    };

    fetchProductDetails();
  }, [complaints, getProductById]);

  const getComplaintTypeTag = (type) => {
    const typeMap = {
      'refund': { color: 'red', text: 'Trả hàng và hoàn tiền' },
      'ProductReturn': { color: 'orange', text: 'Đổi hàng' }
    };
    return typeMap[type] || { color: 'default', text: 'Không xác định' };
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'pending': { color: 'warning', text: 'Đang chờ xử lý' },
      'ItemArrivedAtWarehouse': { color: 'processing', text: 'Hàng đã về kho kiểm tra' },
      'Approved': { color: 'success', text: 'Đã phê duyệt' },
      'Processing': { color: 'processing', text: 'Đang xử lý' },
      'refund': { color: 'success', text: 'Đã hoàn tiền' },
      'Complete': { color: 'success', text: 'Đã hoàn thành' },
      'reject': { color: 'error', text: 'Đã từ chối' },
      'Delivery': { color: 'processing', text: 'Giao hàng' },
      'delivered': { color: 'success', text: 'Giao hàng thành công' }
    };
    return statusMap[status] || { color: 'default', text: 'Không xác định' };
  };

  // Determine if a complaint can be confirmed as received
  const canConfirmReceived = (record) => {
    return (
      (record.complaintType === 'refund' && record.status === 'refund') ||
      (record.complaintType === 'ProductReturn' && (record.status === 'delivered' || record.status === '8'))
    );
  };

  const columns = [
    {
      title: "Mã khiếu nại",
      dataIndex: "id",
      key: "id",
      width: 60,
      render: (id) => <Text strong copyable={{ text: id }}>#{id.slice(0, 8)}...</Text>,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      width: 60,
      render: (id) => <Text strong copyable={{ text: id }}>#{id.slice(0, 8)}...</Text>,
    },
    {
      title: "Loại khiếu nại",
      dataIndex: "complaintType",
      key: "complaintType",
      width: 100,
      render: (type) => {
        const { color, text } = getComplaintTypeTag(type);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      width: 150,
      ellipsis: true,
      render: (reason) => (
        // <Text ellipsis={{ tooltip: reason }}>{reason}</Text>
        <Tooltip
          title={
            reason.split(";").map((item, index) => (
              <div key={index} style={{ marginBottom: 4 }}>
                • {item.trim()}
              </div>
            ))
          }
          color="#ffffff"
          styles={{
            body: {
              backgroundColor: "#f9f9f9",
              color: "#000",
              fontSize: 14,
              padding: 12,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            },
          }}
        >
          <Text ellipsis style={{ cursor: "pointer" }}>
            {reason}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status) => {
        const { color, text } = getStatusTag(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "creationDate",
      key: "creationDate",
      width: 80,
      render: (date) => format(new Date(date), "dd/MM/yyyy HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space>
          {canConfirmReceived(record) && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              loading={confirmingComplaint === record.id}
              onClick={() => handleConfirmRefund(record.id, record.complaintType)}
            >
              {record.complaintType === 'ProductReturn'
                ? 'Đã nhận hàng'
                : 'Đã nhận tiền'}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <Card size="small" className="expanded-row-card">
        <Descriptions column={3} bordered>
          <Descriptions.Item label="Tên người dùng" span={2}>
            {record.userName}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {record.cusPhone}
          </Descriptions.Item>
          <Descriptions.Item label="Mã vận đơn" span={1}>
            {record.deliveryCode
              ? <Text copyable strong type="success">{record.deliveryCode}</Text>
              : '-----'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật" span={2}>
            {record.modificationDate ? format(new Date(record.modificationDate), "dd/MM/yyyy HH:mm") : '--'}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={3}>
            {record.address.replace(/\|/g, ', ')}
          </Descriptions.Item>
          <Descriptions.Item label="Hình ảnh/Video" span={3}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {record.image?.imageUrl && (
                <div style={{
                  backgroundColor: '#fafafa',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #f0f0f0',
                  flex: '1 1 320px',
                  maxWidth: 360
                }}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}> 🎥 Video minh chứng:</Typography.Text>
                  <video
                    src={record.image.imageUrl}
                    controls
                    width={320}
                    style={{ borderRadius: 6, maxHeight: 220 }}
                  />
                </div>
              )}

              {(record.image?.image2 || record.image?.image3) && (
                <div style={{
                  backgroundColor: '#fafafa',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #f0f0f0',
                  flex: '1 1 320px',
                  maxWidth: 360
                }}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>🖼️ Hình ảnh bổ sung:</Typography.Text>
                  <Space size="middle" wrap>
                    {record.image?.image2 && (
                      <Image
                        src={record.image.image2}
                        alt="Hình ảnh 1"
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }}
                      />
                    )}
                    {record.image?.image3 && (
                      <Image
                        src={record.image.image3}
                        alt="Hình ảnh 2"
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }}
                      />
                    )}
                  </Space>
                </div>
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>
        <Table
          columns={[
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
              dataIndex: "totalPrice",
              key: "totalPrice",
              render: (price) => (
                <Text type="success" strong>{price.toLocaleString()}đ</Text>
              ),
            },
          ]}
          dataSource={record.complaintDetails}
          pagination={false}
          rowKey="productId"
        />

        {/* Show confirmation button in expanded row as well */}
        {
          canConfirmReceived(record) && (
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={confirmingComplaint === record.id}
                onClick={() => handleConfirmRefund(record.id, record.complaintType)}
              >
                {record.complaintType === 'ProductReturn'
                  ? 'Xác nhận đã nhận được hàng đổi trả'
                  : 'Xác nhận đã nhận được tiền hoàn vào ví'}
              </Button>
            </div>
          )
        }
      </Card >
    );
  };

  // if (error) {
  //   return (
  //     <Alert
  //       message="Lỗi"
  //       description={error}
  //       type="error"
  //       showIcon
  //     />
  //   );
  // }

  return (
    <App>
      {contextHolder}
      <div>
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Title level={4} style={{ margin: 0 }}>
                Lịch sử khiếu nại
              </Title>
            </Space>
          </Col>
          <Col span={24}>
            <Table
              columns={columns}
              dataSource={complaints}
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => true,
              }}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} khiếu nại`,
              }}
              // scroll={{ x: 'max-content' }}
              size="middle"
            />
          </Col>
        </Row>
      </div>
    </App>
  );
};

export default ComplaintHistoryTab; 