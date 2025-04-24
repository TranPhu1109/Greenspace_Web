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
  Form,
  Alert,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  ShoppingOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import useComplaintStore from "../../../stores/useComplaintStore";
import useProductStore from "../../../stores/useProductStore";
import signalRService from "../../../services/signalRService";
import "./ComplaintsList.scss";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ComplaintsList = () => {
  const {
    complaints,
    loading,
    error,
    fetchComplaints,
    updateComplaint,
    updateComplaintStatus,
    createShippingOrder
  } = useComplaintStore();
  const { getProductById } = useProductStore();

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [productDetails, setProductDetails] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isShippingModalVisible, setIsShippingModalVisible] = useState(false);
  const [shippingForm] = Form.useForm();
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
          fetchComplaints();
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
  }, [fetchComplaints]);

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
      // Numeric status mapping
      const numericStatusMap = {
        "arrived": 1,      // ItemArrivedAtWarehouse
        "approved": 2,     // Approved
        "processing": 3,   // Processing
        "refund": 4,       // Hoàn tiền (chỉ dùng cho Refund)
        "complete": 5,     // Hoàn thành
        "rejected": 6,     // reject
        "delivery": 7,     // Delivery (chỉ dùng cho ProductReturn)
        "delivered": 8,    // delivered (chỉ dùng cho ProductReturn)
      };

      const numericStatus = numericStatusMap[selectedStatus];
      const isProductReturn = selectedComplaint.complaintType === "ProductReturn";

      // Nếu trạng thái là Approved (2) cho ProductReturn, hiển thị modal tạo đơn
      if (isProductReturn && selectedStatus === "approved") {
        setIsShippingModalVisible(true);
        return;
      }

      // Kiểm tra nếu là ProductReturn và đang cố gắng chuyển sang trạng thái refund (4)
      if (isProductReturn && numericStatus === 4) {
        message.error("Không thể chuyển khiếu nại đổi trả sang trạng thái hoàn tiền!");
        return;
      }

      // Kiểm tra nếu là Refund và đang cố gắng chuyển sang trạng thái delivery/delivered
      if (!isProductReturn && (numericStatus === 7 || numericStatus === 8)) {
        message.error("Không thể chuyển khiếu nại hoàn tiền sang trạng thái giao hàng!");
        return;
      }

      setProcessingAction(true);

      // Sử dụng deliveryCode hiện tại nếu có
      const deliveryCode = selectedComplaint.deliveryCode || '';

      await updateComplaintStatus(
        selectedComplaint.id,
        numericStatus,
        isProductReturn ? 0 : 1, // complaintType: 0 for ProductReturn, 1 for Refund
        deliveryCode
      );

      message.success(`Cập nhật trạng thái khiếu nại thành công!`);
      await fetchComplaints(); // Refresh data
      setIsDetailModalVisible(false);
      setSelectedComplaint(null);
      setSelectedStatus(null);
    } catch (error) {
      message.error(`Lỗi khi cập nhật trạng thái: ${error.message}`);
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle shipping order creation for ProductReturn
  const handleCreateShipping = async (values) => {
    try {
      if (!selectedComplaint) return;

      setProcessingAction(true);

      // Extract address components
      const addressParts = selectedComplaint.address.split('|');
      const toAddress = addressParts[0] || '';
      const toWard = addressParts[1] || '';
      const toDistrict = addressParts[2] || '';
      const toProvince = addressParts[3] || '';

      // Prepare items for shipping
      const items = selectedComplaint.complaintDetails.map(detail => {
        const product = productDetails[detail.productId];
        return {
          name: product ? product.name : `Sản phẩm #${detail.productId.slice(0, 8)}`,
          code: detail.productId,
          quantity: detail.quantity
        };
      });

      // Create shipping order
      const shippingData = {
        toName: selectedComplaint.userName,
        toPhone: selectedComplaint.cusPhone,
        toAddress: toAddress,
        toProvince: toProvince,
        toDistrict: toDistrict,
        toWard: toWard,
        items: items
      };

      // Call API to create shipping order
      const response = await createShippingOrder(shippingData);
      console.log("Shipping order response:", response);

      // Extract delivery code from response - lấy order_code từ JSON API mới
      const deliveryCode = response?.data?.data?.order_code || response?.order_code || response?.data?.order_code || '';

      console.log("Extracted delivery code:", deliveryCode);

      if (!deliveryCode) {
        throw new Error("Không nhận được mã vận đơn từ hệ thống");
      }

      // Khi đã có mã vận đơn, cập nhật trạng thái Processing (3) kèm mã vận đơn
      await updateComplaintStatus(
        selectedComplaint.id,
        3, // Processing status
        0, // complaintType for ProductReturn
        deliveryCode
      );

      message.success(`Đã tạo đơn vận chuyển và chuyển sang xử lý thành công! Mã vận đơn: ${deliveryCode}`);
      await fetchComplaints(); // Refresh data
      setIsShippingModalVisible(false);
      setIsDetailModalVisible(false);
      setSelectedComplaint(null);
      setSelectedStatus(null);
    } catch (error) {
      message.error(`Lỗi khi tạo đơn vận chuyển: ${error.message}`);
    } finally {
      setProcessingAction(false);
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
      ItemArrivedAtWarehouse: { color: 'processing', text: 'Đã về kho' },
      Processing: { color: 'processing', text: 'Đang xử lý' },
      Delivery: { color: 'processing', text: 'Đang giao hàng' },
      delivered: { color: 'success', text: 'Đã giao hàng' },
      Approved: { color: 'success', text: 'Đã chấp nhận' },
      reject: { color: 'error', text: 'Đã từ chối' },
      Complete: { color: 'success', text: 'Đã hoàn thành' },
      refund: { color: 'success', text: 'Đã hoàn tiền' },

      // Numeric status mapping
      "0": { color: 'warning', text: 'Đang chờ xử lý' },
      "1": { color: 'processing', text: 'Đã về kho' },
      "2": { color: 'success', text: 'Đã duyệt' },
      "3": { color: 'processing', text: 'Đang xử lý' },
      "4": { color: 'success', text: 'Đã hoàn tiền' },
      "5": { color: 'success', text: 'Hoàn thành' },
      "6": { color: 'error', text: 'Từ chối' },
      "7": { color: 'processing', text: 'Đang giao hàng' },
      "8": { color: 'success', text: 'Đã giao hàng' },
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
        <Tooltip
          title={
            reason.split(";").map((item, idx) => (
              <div key={idx} style={{ marginBottom: 4 }}>
                • {item.trim()}
              </div>
            ))
          }
          placement="top"
          color="#ffffff"
          arrow={true}
          styles={{
            body: {
              backgroundColor: "#f9f9f9",
              color: "#000",
              padding: 12,
              fontSize: 14,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              whiteSpace: "pre-wrap",
              maxWidth: 300,
            },
          }}
        >
          <Text ellipsis style={{ cursor: "pointer" }}>
            {reason.length > 30 ? `${reason.slice(0, 30)}...` : reason}
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
      title: "Mã vận đơn",
      dataIndex: "deliveryCode",
      key: "deliveryCode",
      width: 120,
      render: (deliveryCode) => (
        deliveryCode
          ? <Text copyable strong type="success">{deliveryCode}</Text>
          : '-----'
      ),
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

  // Render complaint status options based on type and current status
  const renderStatusOptions = () => {
    // Lấy trạng thái hiện tại dưới dạng số
    const currentStatus = selectedComplaint?.status;
    let numericStatus = currentStatus;

    // Nếu status là string, chuyển thành số
    if (typeof currentStatus === 'string' && !isNaN(parseInt(currentStatus))) {
      numericStatus = parseInt(currentStatus);
    } else if (currentStatus === 'pending') {
      numericStatus = 0;
    } else if (currentStatus === 'ItemArrivedAtWarehouse') {
      numericStatus = 1;
    }

    console.log('Current complaint status:', currentStatus, 'Numeric status:', numericStatus);

    // Xác định loại khiếu nại
    const isProductReturn = selectedComplaint?.complaintType === "ProductReturn";

    // --- QUY TRÌNH XỬ LÝ KHIẾU NẠI ĐỔI TRẢ (PRODUCTRETURN) ---
    if (isProductReturn) {
      // Bước 1: Đang chờ xử lý (0) -> Đã về kho kiểm tra (1)
      if (currentStatus === 'pending' || numericStatus === 0 || currentStatus === '0') {
        return [
          <Option key="arrived" value="arrived">Đã về kho kiểm tra</Option>
        ];
      }

      // Bước 2: Đã về kho (1) -> Chấp nhận (2) hoặc Từ chối (6)
      if (numericStatus === 1 || currentStatus === '1' || currentStatus === 'ItemArrivedAtWarehouse') {
        return [
          <Option key="approved" value="approved">Chấp nhận khiếu nại đổi trả</Option>,
          <Option key="rejected" value="rejected">Từ chối khiếu nại</Option>
        ];
      }

      // Bước 3: Đã chấp nhận (2) -> Xử lý (3) - tự động thông qua tạo đơn vận chuyển
      if (numericStatus === 2 || currentStatus === '2' || currentStatus === 'Approved') {
        return [
          <Option key="processing" value="processing">Đang xử lý (tạo đơn giao hàng)</Option>
        ];
      }

      // Bước 4: Đang xử lý (3) -> Giao hàng (7)
      if (numericStatus === 3 || currentStatus === '3' || currentStatus === 'Processing') {
        return [
          <Option key="delivery" value="delivery">Giao hàng</Option>
        ];
      }

      // Bước 5: Giao hàng (7) -> Đã giao hàng (8)
      if (numericStatus === 7 || currentStatus === '7' || currentStatus === 'Delivery') {
        return [
          <Option key="delivered" value="delivered">Đã giao hàng</Option>
        ];
      }

      // Bước 6: Đã giao hàng (8) -> Hoàn thành (5)
      if (numericStatus === 8 || currentStatus === '8' || currentStatus === 'delivered') {
        return [
          <Option key="complete" value="complete">Hoàn thành đổi trả</Option>
        ];
      }
    } else {
      // --- QUY TRÌNH XỬ LÝ KHIẾU NẠI HOÀN TIỀN (REFUND) ---

      // Bước 1: Đang chờ xử lý (0) -> Đã về kho kiểm tra (1)
      if (currentStatus === 'pending' || numericStatus === 0 || currentStatus === '0') {
        return [
          <Option key="arrived" value="arrived">Đã về kho kiểm tra</Option>
        ];
      }

      // Bước 2: Đã về kho (1) -> Chấp nhận (2) hoặc Từ chối (6)
      if (numericStatus === 1 || currentStatus === '1' || currentStatus === 'ItemArrivedAtWarehouse') {
        return [
          <Option key="approved" value="approved">Chấp nhận khiếu nại hoàn tiền</Option>,
          <Option key="rejected" value="rejected">Từ chối khiếu nại</Option>
        ];
      }

      // Bước 3: Đã chấp nhận (2) -> Xử lý hoàn tiền (3)
      if (numericStatus === 2 || currentStatus === '2' || currentStatus === 'Approved') {
        return [
          <Option key="processing" value="processing">Đang xử lý hoàn tiền</Option>
        ];
      }

      // Staff chỉ được thay đổi status của đơn hoàn tiền đến Processing thôi
      // Các bước tiếp theo sẽ do hệ thống xử lý
      // Đã loại bỏ các option cho bước 4 và 5
    }

    return [];
  };

  // Render modal content
  const renderModalTitle = () => {
    if (selectedComplaint?.complaintType === "ProductReturn" && selectedStatus === "approved") {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Tạo đơn vận chuyển để đổi hàng
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <CarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        Tạo đơn vận chuyển
      </div>
    );
  };

  // Render complaint detail
  const renderComplaintDetail = () => {
    if (!selectedComplaint) return null;

    const deliveryCode = selectedComplaint.deliveryCode;
    const currentStatus = selectedComplaint?.status;
    const isProductReturn = selectedComplaint.complaintType === "ProductReturn";

    // Debug status
    console.log('renderComplaintDetail - complaint status:', selectedComplaint.status,
      'complaintType:', selectedComplaint.complaintType);

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
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {selectedComplaint.reason
                ?.split(";")
                .map((item, idx) => (
                  <div key={idx}>• {item.trim()}</div>
                )) || "Không có lý do"}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái" span={3}>
            <Space>
              <Badge status={getStatusTag(selectedComplaint.status).color} />
              <Text strong>{getStatusTag(selectedComplaint.status).text}</Text>
            </Space>
          </Descriptions.Item>
          {deliveryCode && (
            <Descriptions.Item label="Mã vận đơn" span={3}>
              <Text copyable strong type="success">{deliveryCode}</Text>
            </Descriptions.Item>
          )}
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

                  // Xử lý nhiều định dạng image có thể có
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

        {(currentStatus === 'pending' || currentStatus === '0' ||
          currentStatus === 'ItemArrivedAtWarehouse' || currentStatus === '1' ||
          currentStatus === 'Approved' || currentStatus === '2' ||
          (currentStatus === 'Processing' || currentStatus === '3') && isProductReturn ||
          currentStatus === 'Delivery' || currentStatus === '7' ||
          currentStatus === 'delivered' || currentStatus === '8' ||
          currentStatus === 'refund' || currentStatus === '4') && (
            <Card title="Cập nhật trạng thái" style={{ marginTop: 20 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message={isProductReturn ? "Hướng dẫn xử lý đổi trả" : "Hướng dẫn xử lý hoàn tiền"}
                  description={
                    isProductReturn ? (
                      <div>
                        <p><strong>Quy trình xử lý khiếu nại đổi trả:</strong></p>
                        <ol>
                          <li>Đang chờ xử lý → Đã về kho kiểm tra </li>
                          <li>Đã về kho kiểm tra → Chấp nhận hoặc Từ chối </li>
                          <li>Chấp nhận → Đang xử lý + Tạo đơn vận chuyển</li>
                          <li>Đang xử lý → Giao hàng </li>
                          <li>Giao hàng → Đã giao hàng </li>
                          <li>Đã giao hàng → Hoàn thành </li>
                        </ol>
                        <p><strong>Lưu ý:</strong> Đối với đơn đổi trả không sử dụng trạng thái Hoàn tiền (4).</p>
                      </div>
                    ) : (
                      <div>
                        <p><strong>Quy trình xử lý khiếu nại hoàn tiền:</strong></p>
                        <ol>
                          <li>Đang chờ xử lý → Đã về kho kiểm tra </li>
                          <li>Đã về kho kiểm tra → Chấp nhận hoặc Từ chối </li>
                          <li>Chấp nhận → Đang xử lý hoàn tiền </li>
                          <li>Đang xử lý hoàn tiền → Hoàn tiền (tự động xử lý bởi hệ thống) </li>
                          <li>Hoàn tiền → Hoàn thành (tự động xử lý bởi hệ thống) </li>
                        </ol>
                        <p><strong>Lưu ý:</strong> Staff chỉ được thay đổi trạng thái đến "Đang xử lý hoàn tiền". Các bước tiếp theo sẽ do hệ thống xử lý.</p>
                      </div>
                    )
                  }
                  type={isProductReturn ? "info" : "warning"}
                  showIcon
                  style={{ marginBottom: 16 }}
                />
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
              <Option value="0">Đang chờ xử lý</Option>
              <Option value="1">Đã về kho</Option>
              <Option value="2">Đã duyệt</Option>
              <Option value="3">Đang xử lý</Option>
              <Option value="4">Đã hoàn tiền</Option>
              <Option value="5">Hoàn thành</Option>
              <Option value="6">Từ chối</Option>
              <Option value="7">Đang giao hàng</Option>
              <Option value="8">Đã giao hàng</Option>
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
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khiếu nại`,
          }}
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

      {/* Modal tạo đơn vận chuyển */}
      <Modal
        title={renderModalTitle()}
        open={isShippingModalVisible}
        onCancel={() => {
          setIsShippingModalVisible(false);
        }}
        footer={[
          <Button key="back" onClick={() => setIsShippingModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={processingAction}
            onClick={() => shippingForm.submit()}
          >
            Tạo đơn và chuyển sang xử lý
          </Button>,
        ]}
        width={700}
        destroyOnClose
      >
        <Alert
          message="Quy trình xử lý đổi trả"
          description={
            <div>
              <p>Bước 1: Đã xác nhận khiếu nại hợp lệ</p>
              <p>Bước 2: Tạo đơn vận chuyển để đổi hàng cho khách hàng</p>
              <p>Bước 3: Hệ thống sẽ tự động chuyển trạng thái sang "Đang xử lý" sau khi tạo đơn</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />

        <Form
          form={shippingForm}
          layout="vertical"
          onFinish={handleCreateShipping}
          initialValues={{
            confirmed: true
          }}
        >
          <Card title="Thông tin khách hàng" size="small" style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Khách hàng">{selectedComplaint?.userName}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedComplaint?.cusPhone}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {selectedComplaint?.address?.replace(/\|/g, ', ')}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Sản phẩm giao lại" size="small">
            <Table
              dataSource={selectedComplaint?.complaintDetails}
              rowKey="productId"
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Sản phẩm",
                  dataIndex: "productId",
                  key: "product",
                  render: (productId) => {
                    const product = productDetails[productId];
                    return (
                      <Space align="center">
                        {product?.image?.imageUrl ? (
                          <img
                            src={product.image.imageUrl}
                            alt={product.name}
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
                  width: 80,
                  align: "center"
                },
              ]}
            />
          </Card>

          <Form.Item
            name="confirmed"
            valuePropName="checked"
            style={{ marginTop: 16 }}
          >
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Xác nhận thông tin chính xác và đồng ý tạo đơn vận chuyển
              </Text>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComplaintsList; 