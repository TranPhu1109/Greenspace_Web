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
  ShoppingOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { format } from "date-fns";
import useComplaintStore from "../../../stores/useComplaintStore";
import useProductStore from "../../../stores/useProductStore";
import signalRService from "../../../services/signalRService";
import "./ComplaintsRefundList.scss"; // You'll need to create this file

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const ComplaintsRefundList = () => {
  const {
    refundComplaints,
    loading,
    error,
    fetchRefundComplaints,
    updateComplaintStatus,
    processRefund
  } = useComplaintStore();
  const { getProductById } = useProductStore();

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [productDetails, setProductDetails] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);

  // Initialize SignalR connection
  useEffect(() => {
    const initializeSignalR = async () => {
      try {
        // Start the SignalR connection
        await signalRService.startConnection();

        // Register for the messageReceived event - automatically fetch data on any message
        signalRService.on("messageReceived", (data) => {
          console.log("SignalR message received:", data);
          fetchRefundComplaints();
        });
      } catch (error) {
        console.error("Failed to initialize SignalR connection:", error);
      }
    };

    initializeSignalR();

    // Clean up SignalR connection when component unmounts
    return () => {
      signalRService.off("messageReceived");
    };
  }, [fetchRefundComplaints]);

  useEffect(() => {
    fetchRefundComplaints();
  }, [fetchRefundComplaints]);

  useEffect(() => {
    if (!refundComplaints?.length) return;

    const fetchProductDetails = async () => {
      const newDetails = { ...productDetails };
      let hasNewData = false;

      // Collect all unique product IDs across all complaints
      const productIds = new Set();
      refundComplaints.forEach(complaint => {
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
  }, [refundComplaints, getProductById]);

  // Handle processing refund
  const handleProcessRefund = async (complaintId) => {
    try {
      setProcessingAction(true);

      await processRefund(complaintId);

      message.success("Đã hoàn tiền thành công!");
      await fetchRefundComplaints(); // Refresh data
      setIsDetailModalVisible(false);
      setSelectedComplaint(null);
      setSelectedStatus(null);
    } catch (error) {
      message.error(`Lỗi khi hoàn tiền: ${error.message}`);
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle complaint status change
  const handleStatusChange = async () => {
    if (!selectedComplaint || !selectedStatus) return;

    try {
      // If status is 'refund', show confirmation modal
      if (selectedStatus === 'refund') {
        confirm({
          title: 'Xác nhận hoàn tiền',
          icon: <ExclamationCircleFilled />,
          content: `Bạn có chắc chắn muốn hoàn tiền cho đơn khiếu nại #${selectedComplaint.id.slice(0, 8)}... không? Hành động này không thể hoàn tác.`,
          okText: 'Xác nhận hoàn tiền',
          okType: 'primary',
          cancelText: 'Hủy',
          onOk() {
            return handleProcessRefund(selectedComplaint.id);
          },
        });
        return;
      }

      // For other statuses, proceed normally
      const numericStatusMap = {
        "complete": 5,   // Hoàn thành
      };

      const numericStatus = numericStatusMap[selectedStatus];

      setProcessingAction(true);

      // Use existing deliveryCode if any
      const deliveryCode = selectedComplaint.deliveryCode || '';

      await updateComplaintStatus(
        selectedComplaint.id,
        numericStatus,
        1, // complaintType: 1 for Refund
        deliveryCode
      );

      message.success(`Cập nhật trạng thái khiếu nại thành công!`);
      await fetchRefundComplaints(); // Refresh data
      setIsDetailModalVisible(false);
      setSelectedComplaint(null);
      setSelectedStatus(null);
    } catch (error) {
      message.error(`Lỗi khi cập nhật trạng thái: ${error.message}`);
    } finally {
      setProcessingAction(false);
    }
  };

  // Filter complaints based on search text, status, and date range
  const filteredComplaints = refundComplaints?.filter(complaint => {
    // Filter by search text
    const searchMatch = !searchText ||
      complaint.id.toLowerCase().includes(searchText.toLowerCase()) ||
      complaint.orderId?.toLowerCase().includes(searchText.toLowerCase()) ||
      complaint.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
      complaint.reason?.toLowerCase().includes(searchText.toLowerCase());

    // Filter by status
    const statusMatch = !filterStatus || complaint.status === filterStatus;

    // Filter by date range
    let dateMatch = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const complaintDate = new Date(complaint.creationDate);
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      dateMatch = complaintDate >= startDate && complaintDate <= endDate;
    }

    return searchMatch && statusMatch && dateMatch;
  }) || [];

  const getStatusTag = (status) => {
    const statusConfig = {
      Processing: { color: 'processing', text: 'Đang xử lý' },
      refund: { color: 'success', text: 'Đã hoàn tiền' },
      Complete: { color: 'success', text: 'Đã hoàn thành' },

      // Numeric status mapping
      "3": { color: 'processing', text: 'Đang xử lý' },
      "4": { color: 'success', text: 'Đã hoàn tiền' },
      "5": { color: 'success', text: 'Hoàn thành' },
    };
    return statusConfig[status] || { color: 'default', text: 'Không xác định' };
  };

  // Render status options based on current status
  const renderStatusOptions = () => {
    // Get current status as a number if possible
    const currentStatus = selectedComplaint?.status;
    let numericStatus = currentStatus;

    if (typeof currentStatus === 'string' && !isNaN(parseInt(currentStatus))) {
      numericStatus = parseInt(currentStatus);
    }

    // Processing (3) -> Refund (4)
    if (currentStatus === 'Processing' || numericStatus === 3 || currentStatus === '3') {
      return [
        <Option key="refund" value="refund">Hoàn tiền</Option>
      ];
    }

    // Refund (4) -> Complete (5)
    // if (currentStatus === 'refund' || numericStatus === 4 || currentStatus === '4') {
    //   return [
    //     <Option key="complete" value="complete">Hoàn thành</Option>
    //   ];
    // }

    return [];
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
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      width: 200,
      ellipsis: true,
      render: (reason) => (
        <Tooltip
          title={
            reason?.split(";").map((item, idx) => (
              <div key={idx} style={{ marginBottom: 4 }}>
                • {item.trim()}
              </div>
            )) || "Không có lý do"
          }
          placement="top"
          color="#ffffff"
          arrow
          styles={{
            body: {
              backgroundColor: "#f9f9f9",
              color: "#000",
              fontSize: 14,
              padding: 12,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              maxWidth: 300,
              whiteSpace: "pre-wrap",
            },
          }}
        >
          <Text ellipsis style={{ cursor: "pointer" }}>
            {reason?.length > 30 ? `${reason.slice(0, 30)}...` : reason || "Không có lý do"}
          </Text>
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
    setDateRange(null);
  };

  // Render complaint detail
  const renderComplaintDetail = () => {
    if (!selectedComplaint) return null;

    const currentStatus = selectedComplaint?.status;

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
            <Tag color="red">Hoàn tiền</Tag>
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
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {selectedComplaint.reason
                ? selectedComplaint.reason.split(";").map((item, idx) => (
                  <div key={idx}>• {item.trim()}</div>
                ))
                : "Không có lý do"}
            </div>
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

                  // Handle different image formats
                  const imageUrl = product?.image?.imageUrl ||
                    product?.image?.imageUrl1 ||
                    product?.imageUrl ||
                    null;

                  return (
                    <Space align="center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product?.name}
                          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                        />
                      ) : (
                        <div style={{ width: 40, height: 40, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                          <ShoppingOutlined style={{ fontSize: 16, color: '#999' }} />
                        </div>
                      )}
                      <Text>{product ? product.name : `Sản phẩm #${productId.slice(0, 8)}...`}</Text>
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

        {/* Manager can update status from Processing to Refund */}
        {(currentStatus === 'Processing' || currentStatus === '3') && (
          <Card title="Cập nhật trạng thái" style={{ marginTop: 20 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Chọn trạng thái mới"
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                {renderStatusOptions()}
              </Select>
              <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="primary"
                  disabled={!selectedStatus || processingAction}
                  onClick={handleStatusChange}
                  loading={processingAction}
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
    <div className="complaints-refund-list-container">
      <Card>
        <Title level={4}>Quản lý hoàn tiền</Title>
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
              <Option value="Processing">Đang xử lý</Option>
              <Option value="refund">Đã hoàn tiền</Option>
              <Option value="Complete">Hoàn thành</Option>
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
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Modal chi tiết khiếu nại */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            Chi tiết khiếu nại hoàn tiền
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
        styles={{
          body: {
            maxHeight: 'calc(85vh - 40px)',
            overflowY: 'auto',
            paddingRight: '16px',
            marginTop: 20
          }
        }}
      >
        {renderComplaintDetail()}
      </Modal>
    </div>
  );
};

export default ComplaintsRefundList;
