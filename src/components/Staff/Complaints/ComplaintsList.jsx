import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Row,
  Col,
  Select,
  Tag,
  Space,
  Typography,
  Modal,
  Image,
  Descriptions,
  Badge,
  Tooltip,
  message,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import useComplaintStore from "../../../stores/useComplaintStore";
import useProductStore from "../../../stores/useProductStore";
import "./ComplaintsList.scss";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ComplaintsList = () => {
  const { complaints, loading, error, fetchComplaints, updateComplaint } = useComplaintStore();
  const { getProductById } = useProductStore();
  
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [productDetails, setProductDetails] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    if (!complaints?.length) return;
    
    const fetchProductDetails = async () => {
      const newDetails = { ...productDetails };
      let hasNewData = false;
      
      // Collect all unique product IDs across all complaints
      const productIds = new Set();
      complaints.forEach(complaint => {
        complaint.complaintDetails?.forEach(detail => {
          if (detail.productId && !newDetails[detail.productId]) {
            productIds.add(detail.productId);
          }
        });
      });
      
      // Fetch details for each product
      for (const productId of productIds) {
        try {
          const product = await getProductById(productId);
          if (product) {
            newDetails[productId] = product;
            hasNewData = true;
          }
        } catch (error) {
          console.error(`Error fetching details for product ${productId}:`, error);
        }
      }
      
      if (hasNewData) {
        setProductDetails(newDetails);
      }
    };
    
    fetchProductDetails();
  }, [complaints, getProductById]);

  // Handle complaint status change
  const handleStatusChange = async () => {
    if (!selectedComplaint || !selectedStatus) return;
    
    try {
      await updateComplaint(selectedComplaint.id, selectedStatus);
      message.success(`Cập nhật trạng thái khiếu nại thành công!`);
      fetchComplaints(); // Refresh data
      setIsDetailModalVisible(false);
      setSelectedComplaint(null);
      setSelectedStatus(null);
    } catch (error) {
      message.error(`Lỗi khi cập nhật trạng thái: ${error.message}`);
    }
  };

  const handleAcceptComplaint = async () => {
    try {
      await createShippingOrder(complaintData);
      const complaintData = {
        complaintType: selectedComplaint.complaintType,
        deliveryCode: selectedComplaint.deliveryCode || '',
        status: selectedComplaint.status,
      };
      await updateComplaint(selectedComplaint.id, complaintData); // Update status to 1 (ItemArrivedAtWarehouse)
      fetchComplaints(); // Refresh data
    } catch (error) {
      console.error(`Error accepting complaint: ${error.message}`);
    }
  };
  

  // Filter complaints based on search text, status, type, and date range
  const filteredComplaints = complaints?.filter(complaint => {
    // Filter by search text
    const searchMatch = !searchText || 
      complaint.id.toLowerCase().includes(searchText.toLowerCase()) ||
      complaint.orderId?.toLowerCase().includes(searchText.toLowerCase()) ||
      complaint.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
      complaint.reason?.toLowerCase().includes(searchText.toLowerCase());
    
    // Filter by status
    const statusMatch = !filterStatus || complaint.status === filterStatus;
    
    // Filter by complaint type
    const typeMatch = !filterType || complaint.complaintType === filterType;
    
    // Filter by date range
    let dateMatch = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const complaintDate = new Date(complaint.creationDate);
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      dateMatch = complaintDate >= startDate && complaintDate <= endDate;
    }
    
    return searchMatch && statusMatch && typeMatch && dateMatch;
  }) || [];

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Đang chờ xử lý' },
      approved: { color: 'success', text: 'Đã chấp nhận' },
      rejected: { color: 'error', text: 'Đã từ chối' },
      completed: { color: 'success', text: 'Đã hoàn thành' },
    };
    return statusConfig[status] || { color: 'default', text: 'Không xác định' };
  };

  const getComplaintTypeTag = (type) => {
    const typeConfig = {
      refund: { color: 'red', text: 'Hoàn tiền' },
      ProductReturn: { color: 'orange', text: 'Đổi trả' },
    };
    return typeConfig[type] || { color: 'default', text: 'Không xác định' };
  };

  const columns = [
    {
      title: "Mã khiếu nại",
      dataIndex: "id",
      key: "id",
      width: 110,
      render: (id) => <Text strong>#{id.slice(0, 8)}...</Text>,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      width: 120,
      render: (id) => <Text strong>#{id.slice(0, 8)}...</Text>,
    },
    {
      title: "Khách hàng",
      dataIndex: "userName",
      key: "userName",
      width: 150,
      render: (userName, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{userName}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.cusPhone}
          </Text>
        </Space>
      ),
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
      width: 200,
      ellipsis: true,
      render: (reason) => (
        <Tooltip title={reason} placement="top" color="green" arrow>
          <Text ellipsis>{reason.length > 30 ? `${reason.slice(0, 30)}...` : reason}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const { color, text } = getStatusTag(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "creationDate",
      key: "creationDate",
      width: 120,
      render: (date) => format(new Date(date), "dd/MM/yyyy HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedComplaint(record);
                setIsDetailModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const resetFilters = () => {
    setSearchText("");
    setFilterStatus(null);
    setFilterType(null);
    setDateRange(null);
  };

  // Render detail modal content
  const renderComplaintDetail = () => {
    if (!selectedComplaint) return null;

    return (
      <>
        <Descriptions
          title="Thông tin khiếu nại"
          bordered
          column={{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
          style={{ marginBottom: 20 }}
        >
          <Descriptions.Item label="Mã khiếu nại" span={2}>
            <Text copyable>{selectedComplaint.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {format(new Date(selectedComplaint.creationDate), "dd/MM/yyyy HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Mã đơn hàng" span={2}>
            <Text copyable>{selectedComplaint.orderId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Loại khiếu nại">
            {getComplaintTypeTag(selectedComplaint.complaintType).text}
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng" span={2}>
            {selectedComplaint.userName}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {selectedComplaint.cusPhone}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={3}>
            {selectedComplaint.address?.replace(/\|/g, ', ')}
          </Descriptions.Item>
          <Descriptions.Item label="Lý do khiếu nại" span={3}>
            {selectedComplaint.reason}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={3}>
            <Space>
              <Badge status={getStatusTag(selectedComplaint.status).color} />
              <Text strong>{getStatusTag(selectedComplaint.status).text}</Text>
            </Space>
          </Descriptions.Item>
        </Descriptions>

        {selectedComplaint.image?.imageUrl && (
          <Card title="Hình ảnh khiếu nại" style={{ marginBottom: 20 }}>
            <Space size="large">
              {selectedComplaint.image.imageUrl && (
                <Image
                  width={200}
                  src={selectedComplaint.image.imageUrl}
                  alt="Hình ảnh khiếu nại 1"
                />
              )}
              {selectedComplaint.image.image2 && (
                <Image
                  width={200}
                  src={selectedComplaint.image.image2}
                  alt="Hình ảnh khiếu nại 2"
                />
              )}
              {selectedComplaint.image.image3 && (
                <Image
                  width={200}
                  src={selectedComplaint.image.image3}
                  alt="Hình ảnh khiếu nại 3"
                />
              )}
            </Space>
          </Card>
        )}

        <Card title="Sản phẩm khiếu nại">
          <Table
            dataSource={selectedComplaint.complaintDetails}
            rowKey="productId"
            pagination={false}
            columns={[
              {
                title: "Sản phẩm",
                dataIndex: "productId",
                key: "product",
                render: (productId) => {
                  const product = productDetails[productId];
                  
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
                render: (totalPrice) => (
                  <Text type="success" strong>{totalPrice.toLocaleString()}đ</Text>
                ),
              },
            ]}
          />
        </Card>

        {selectedComplaint.status === 'pending' && (
          <Card title="Cập nhật trạng thái" style={{ marginTop: 20 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Chọn trạng thái mới"
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                <Option value="approved">Chấp nhận khiếu nại</Option>
                <Option value="rejected">Từ chối khiếu nại</Option>
                <Option value="completed">Đánh dấu hoàn thành</Option>
              </Select>
              <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="primary"
                  disabled={!selectedStatus}
                  onClick={handleStatusChange}
                >
                  Cập nhật trạng thái
                </Button>
              </Space>
            </Space>
          </Card>
        )}
      </>
    );
  };

  return (
    <div className="complaints-list-container">
      <Card>
        <Title level={4}>Quản lý khiếu nại</Title>
        <Row gutter={[16, 16]} className="filter-row">
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Input
              placeholder="Tìm kiếm theo mã, khách hàng, lý do..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              className="search-input"
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5} lg={5} xl={5}>
            <Select
              placeholder="Trạng thái"
              style={{ width: "100%" }}
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
            >
              <Option value="pending">Đang chờ xử lý</Option>
              <Option value="approved">Đã chấp nhận</Option>
              <Option value="rejected">Đã từ chối</Option>
              <Option value="completed">Đã hoàn thành</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5} lg={5} xl={5}>
            <Select
              placeholder="Loại khiếu nại"
              style={{ width: "100%" }}
              value={filterType}
              onChange={setFilterType}
              allowClear
            >
              <Option value="refund">Hoàn tiền</Option>
              <Option value="ProductReturn">Đổi trả</Option>
            </Select>
          </Col>
          <Col xs={24} sm={16} md={6} lg={6} xl={6}>
            <RangePicker
              style={{ width: "100%" }}
              value={dateRange}
              onChange={setDateRange}
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Col>
          <Col xs={24} sm={8} md={2} lg={2} xl={2}>
            <Button onClick={resetFilters} style={{ width: "100%" }}>
              Đặt lại
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="complaints-table-card">
        <Table
          dataSource={filteredComplaints}
          columns={columns}
          rowKey="id"
          loading={loading}
          // pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          onChange={(pagination, filters, sorter) => {
            console.log('Various parameters', pagination, filters, sorter);
          }}
        />
      </Card>

      {/* Chi tiết khiếu nại */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ExclamationCircleOutlined style={{ marginRight: 8, color: '#faad14' }} />
            Chi tiết khiếu nại
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedComplaint(null);
          setSelectedStatus(null);
        }}
        footer={null}
        width={900}
        centered={true}
        className="complaint-detail-modal"
        style={{ top: 5 }}
        bodyStyle={{ 
          maxHeight: 'calc(85vh - 40px)',
          overflowY: 'auto',
          paddingRight: '16px',
          marginTop: 20
        }}
      >
        {renderComplaintDetail()}
      </Modal>
    </div>
  );
};

export default ComplaintsList; 