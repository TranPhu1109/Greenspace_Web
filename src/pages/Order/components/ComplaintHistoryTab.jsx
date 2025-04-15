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
} from "antd";
import { format } from "date-fns";
import { ShoppingOutlined } from "@ant-design/icons";
import useComplaintStore from "../../../stores/useComplaintStore";
import useAuthStore from "../../../stores/useAuthStore";
import useProductStore from "../../../stores/useProductStore";

const { Title, Text } = Typography;

const ComplaintHistoryTab = () => {
  const { fetchUserComplaints } = useComplaintStore();
  const { user } = useAuthStore();
  const { getProductById } = useProductStore();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
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
  }, [user?.id, fetchUserComplaints]);

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
        console.log("All complaint products already loaded");
        return;
      }
      
      console.log(`Fetching ${missingProductIds.length} missing complaint products`);
      let newDetails = { ...productDetails };
      let hasNewData = false;

      for (const productId of missingProductIds) {
        try {
          console.log("Fetching complaint product details for:", productId);
          const product = await getProductById(productId);
          if (product) {
            console.log("Product details received:", product.name);
            newDetails[productId] = product;
            hasNewData = true;
          } else {
            console.warn(`No product data returned for ID: ${productId}`);
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }

      if (hasNewData) {
        console.log("Updated complaint product details:", Object.keys(newDetails).length);
        setProductDetails(newDetails);
      }
    };

    fetchProductDetails();
  }, [complaints, getProductById]);

  const getComplaintTypeTag = (type) => {
    const typeMap = {
      'refund': { color: 'red', text: 'Trả hàng và hoàn tiền' },
      'ProductReturn': { color: 'orange', text: 'Đổi trả' }
    };
    return typeMap[type] || { color: 'default', text: 'Không xác định' };
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'pending': { color: 'warning', text: 'Đang chờ xử lý' },
      'approved': { color: 'success', text: 'Đã chấp nhận' },
      'rejected': { color: 'error', text: 'Đã từ chối' },
      'completed': { color: 'success', text: 'Đã hoàn thành' }
    };
    return statusMap[status] || { color: 'default', text: 'Không xác định' };
  };

  const columns = [
    {
      title: "Mã khiếu nại",
      dataIndex: "id",
      key: "id",
      width: 60,
      render: (id) => <Text strong>#{id.slice(0, 8)}...</Text>,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      width: 60,
      render: (id) => <Text strong>#{id.slice(0, 8)}...</Text>,
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
        <Text ellipsis={{ tooltip: reason }}>{reason}</Text>
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
  ];

  const expandedRowRender = (record) => {
    return (
      <Card size="small" className="expanded-row-card">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Tên người dùng" span={2}>
            {record.userName}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {record.address.replace(/\|/g, ', ')}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {record.cusPhone}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {record.modificationDate ? format(new Date(record.modificationDate), "dd/MM/yyyy HH:mm") : '--'}
          </Descriptions.Item>
          <Descriptions.Item label="Hình ảnh" span={2}>
            <Space>
              {record.image?.imageUrl && (
                <Image
                  src={record.image.imageUrl}
                  alt="Hình ảnh 1"
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover' }}
                />
              )}
              {record.image?.image2 && (
                <Image
                  src={record.image.image2}
                  alt="Hình ảnh 2"
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover' }}
                />
              )}
              {record.image?.image3 && (
                <Image
                  src={record.image.image3}
                  alt="Hình ảnh 3"
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover' }}
                />
              )}
            </Space>
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
      </Card>
    );
  };

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
          <Title level={4} style={{ margin: 0 }}>
            Lịch sử khiếu nại
          </Title>
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
  );
};

export default ComplaintHistoryTab; 