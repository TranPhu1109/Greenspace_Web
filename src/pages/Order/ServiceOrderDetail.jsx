import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useServiceOrderStore from "@/stores/useServiceOrderStore";
import useProductStore from "@/stores/useProductStore";
import useRecordStore from "@/stores/useRecordStore";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useContractStore from "@/stores/useContractStore";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import api from "@/api/api";
import {
  Typography,
  Spin,
  Alert,
  Card,
  Row,
  Col,
  Tag,
  Image,
  Layout,
  Button,
  Divider,
  Descriptions,
  Space,
  Timeline,
  Breadcrumb,
  Table,
  message,
  Popconfirm,
  Empty,
  Modal,
  Upload
} from "antd";
import { format } from "date-fns";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  PictureOutlined,
  HistoryOutlined,
  ShoppingOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const ServiceOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {updateStatus} = useDesignOrderStore();
  const { selectedOrder, loading, error, getServiceOrderById } = useServiceOrderStore();
  const { getProductById, isLoading: productLoading } = useProductStore();
  const {
    sketchRecords,
    getRecordSketch,
    confirmRecord,
    isLoading: recordLoading,
    error: recordError
  } = useRecordStore();
  const {
    getContractByServiceOrder,
    contract,
    loading: contractLoading,
    signContract,
    generateContract,
  } = useContractStore();
  const { uploadImages, progress } = useCloudinaryStorage();
  const [order, setOrder] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [showContractButton, setShowContractButton] = useState(false);
  const [isContractModalVisible, setIsContractModalVisible] = useState(false);
  const [showPaymentButton, setShowPaymentButton] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isSignAndPayModalVisible, setIsSignAndPayModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [selectedSketchId, setSelectedSketchId] = useState(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  
  // Define statuses where ONLY phase 0 sketches are shown initially
  const showOnlyPhase0Statuses = [
    'ConsultingAndSketching' // 16
  ];

  // Define statuses where ALL sketch phases are shown
  const showAllPhasesStatuses = [
    'DoneDeterminingDesignPrice', // 22
    'WaitDeposit',                // 21
    'DepositSuccessful',          // 3
    'AssignToDesigner',           // 4
    'DeterminingMaterialPrice',   // 5
    'DoneDesign',                 // 6
    'DoneDeterminingMaterialPrice', // 23
    'PaymentSuccess',             // 7
    'Processing',                 // 8
    'PickedPackageAndDelivery', // 9
    'DeliveryFail',             // 10
    'ReDelivery',               // 11
    'DeliveredSuccessfully',    // 12
    'CompleteOrder',            // 13
    'Warning',                  // 15
    // Add other relevant statuses if needed
  ];
  
  // Define statuses where contract should be visible
  const contractVisibleStatuses = [
    'WaitDeposit',                // 21
    'DepositSuccessful',          // 3
    'AssignToDesigner',           // 4
    'DeterminingMaterialPrice',   // 5
    'DoneDesign',                 // 6
    'DoneDeterminingMaterialPrice', // 23
    'PaymentSuccess',             // 7
    'Processing',                 // 8
    'PickedPackageAndDelivery',   // 9
    'DeliveryFail',               // 10
    'ReDelivery',                 // 11
    'DeliveredSuccessfully',      // 12
    'CompleteOrder',              // 13
    'Warning',                    // 15
  ];

  // Define numeric status codes where contract should be visible
  const contractVisibleStatusCodes = [21, 3, 4, 5, 6, 23, 7, 8, 9, 10, 11, 12, 13, 15];

  useEffect(() => {
    const fetchOrderDetailAndSketches = async () => {
      try {
        setLocalError(null);
        setFetchingProducts(false); // Reset product fetching state
        const orderData = await getServiceOrderById(id);
        setOrder(orderData); // Set order state first

        if (!orderData) {
          setLocalError("Không tìm thấy thông tin đơn hàng.");
          return;
        }

        // Fetch products if details exist
        if (orderData.serviceOrderDetails && orderData.serviceOrderDetails.length > 0) {
          setFetchingProducts(true);
          const productPromises = orderData.serviceOrderDetails.map(detail =>
            getProductById(detail.productId)
          );
          const productResults = await Promise.all(productPromises);
          const detailsMap = {};
          productResults.forEach((product, index) => {
            if (product) {
              detailsMap[orderData.serviceOrderDetails[index].productId] = product;
            }
          });
          setProductDetailsMap(detailsMap);
          setFetchingProducts(false);
        }

        // Fetch sketch records if the status requires it
        if (showOnlyPhase0Statuses.includes(orderData.status) || showAllPhasesStatuses.includes(orderData.status)) {
           console.log(`Fetching sketches for order ${id} with status ${orderData.status}`);
           await getRecordSketch(id); // Fetch sketches
        } else {
           console.log(`Sketches not required for status: ${orderData.status}`);
        }

      } catch (err) {
        console.error("Error fetching order details, products, or sketches:", err);
        // Prioritize order fetch error
        const errorMessage = err.message.includes("order")
                             ? "Không thể tải thông tin đơn hàng."
                             : "Có lỗi xảy ra khi tải dữ liệu.";
        setLocalError(errorMessage);
        setFetchingProducts(false); // Ensure loading states are reset on error
      }
    };

    if (id) {
      fetchOrderDetailAndSketches();
    }
  // Dependencies: id, getServiceOrderById, getProductById, getRecordSketch
  }, [id, getServiceOrderById, getProductById, getRecordSketch]); // Ensure all store actions are dependencies

  // Update useEffect to fetch contract correctly
  useEffect(() => {
    const fetchContract = async () => {
      // Check if current status should show contract (either by name or code)
      const shouldShowContract = 
        contractVisibleStatuses.includes(selectedOrder?.status) || 
        contractVisibleStatusCodes.includes(selectedOrder?.status);
      
      if (shouldShowContract) {
        console.log("Status requires contract visibility, checking for contract...");
        try {
          // First try to get existing contract
          await getContractByServiceOrder(selectedOrder.id);
          setShowContractButton(true);
        } catch (error) {
          console.error("Error fetching contract:", error);
          // If no contract exists, generate a new one if in WaitDeposit status
          if (selectedOrder?.status === "WaitDeposit" || selectedOrder?.status === 21) {
            try {
              console.log("Generating new contract for order:", selectedOrder.id);
              await generateContract({
                userId: selectedOrder.userId,
                serviceOrderId: selectedOrder.id,
                userName: selectedOrder.userName,
                email: selectedOrder.email,
                phone: selectedOrder.cusPhone,
                address: selectedOrder.address,
                designPrice: selectedOrder.designPrice,
              });
              
              // Fetch the contract again after generating it
              await getContractByServiceOrder(selectedOrder.id);
              console.log("Contract generated successfully");
              setShowContractButton(true);
              message.success("Hợp đồng đã được tạo thành công!");
            } catch (genError) {
              console.error("Error generating contract:", genError);
              message.error("Không thể tạo hợp đồng: " + genError.message);
              setShowContractButton(false);
            }
          } else {
            console.error("Contract not found and not in WaitDeposit status to generate");
            setShowContractButton(false);
          }
        }
      } else {
        console.log("Status does not require contract visibility:", selectedOrder?.status);
        setShowContractButton(false);
      }
    };

    // Call fetchContract when selectedOrder status changes or selectedOrder.id changes
    if (selectedOrder?.id) {
      console.log("Triggering contract fetch for status:", selectedOrder.status);
      fetchContract();
    }
  }, [selectedOrder?.status, selectedOrder?.id, getContractByServiceOrder, generateContract]);

  // Add useEffect to check contract modification date and update UI
  useEffect(() => {
    if (contract?.modificationDate) {
      setShowPaymentButton(true);
    } else {
      setShowPaymentButton(false);
    }
    
    // Ensure contract button is visible if contract exists and status should show contract
    const shouldShowContract = 
      contractVisibleStatuses.includes(selectedOrder?.status) || 
      contractVisibleStatusCodes.includes(selectedOrder?.status);
      
    if (contract && !showContractButton && shouldShowContract) {
      setShowContractButton(true);
    }
  }, [contract, selectedOrder?.status, showContractButton, contractVisibleStatuses, contractVisibleStatusCodes]);

  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "orange",
      PaymentSuccess: "green",
      Processing: "blue",
      PickedPackageAndDelivery: "cyan",
      DeliveryFail: "red",
      ReDelivery: "purple",
      DeliveredSuccessfully: "green",
      CompleteOrder: "green",
      OrderCancelled: "red",
      ConsultingAndSketching: "blue",
      NoDesignIdea: "default",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      PaymentSuccess: "Đã thanh toán",
      Processing: "Đang xử lý",
      PickedPackageAndDelivery: "Đã nhận gói và giao hàng",
      DeliveryFail: "Giao hàng thất bại",
      ReDelivery: "Giao hàng lại",
      DeliveredSuccessfully: "Giao hàng thành công",
      CompleteOrder: "Hoàn thành đơn hàng",
      OrderCancelled: "Đã hủy đơn hàng",
      ConsultingAndSketching: "Đang tư vấn và phác thảo",
      NoDesignIdea: "Không có mẫu thiết kế",
    };
    return statusTexts[status] || status;
  };

  // Update handleViewContract function
  const handleViewContract = async () => {
    if (contract?.description) {
      setIsContractModalVisible(true);
    } else {
      // Try to fetch the contract if it's not already loaded
      try {
        if (selectedOrder?.id) {
          const contractData = await getContractByServiceOrder(selectedOrder.id);
          if (contractData?.description) {
            setIsContractModalVisible(true);
          } else {
            message.error("Không tìm thấy hợp đồng hoặc hợp đồng chưa được tạo");
          }
        } else {
          message.error("Không tìm thấy thông tin đơn hàng");
        }
      } catch (error) {
        console.error("Error loading contract:", error);
        message.error("Không thể tải hợp đồng: " + error.message);
      }
    }
  };

  const handleCloseContractModal = () => {
    setIsContractModalVisible(false);
  };

  // Update the handleConfirmSketch function to use the new confirmation modal approach
  const handleConfirmSketch = (recordId) => {
    setSelectedSketchId(recordId);
    setIsConfirmModalVisible(true);
  };

  // New function to confirm sketch selection
  const handleConfirmSelection = async () => {
    try {
      setLocalError(null);
      
      // First step: Confirm the sketch selection
      await confirmRecord(selectedSketchId);
      message.success('Đã chọn bản phác thảo thành công!');
      setIsConfirmModalVisible(false);
      
      // Second step: Update status to WaitDeposit (status code 21)
      try {
        await updateStatus(id, 21);
        message.success('Đã cập nhật trạng thái đơn hàng');
        
        // Third step: Refresh all relevant data
        const updatedOrder = await getServiceOrderById(id);
        console.log('Updated order status:', updatedOrder?.status);
        
        // Refresh sketch records
        await getRecordSketch(id);
        
        // The message will serve as a visual cue that something is happening
        message.info("Hợp đồng sẽ được tạo tự động, vui lòng chờ một lát...");
      } catch (statusError) {
        console.error("Error updating status:", statusError);
        message.error('Không thể cập nhật trạng thái đơn hàng: ' + statusError.message);
      }
    } catch (err) {
      console.error("Error confirming sketch:", err);
      message.error('Không thể chọn bản phác thảo: ' + err.message);
    }
  };

  // Function to cancel sketch selection
  const handleCancelSelection = () => {
    setSelectedSketchId(null);
    setIsConfirmModalVisible(false);
  };

  const openSignAndPayModal = () => {
    setIsSignAndPayModalVisible(true);
  };

  const closeSignAndPayModal = () => {
    setIsSignAndPayModalVisible(false);
    setPreviewImage(null);
  };

  // Update handleSignAndPay function for better error handling
  const handleSignAndPay = async () => {
    try {
      if (!previewImage) {
        message.error("Vui lòng tải lên chữ ký trước khi xác nhận");
        return;
      }

      setUploading(true);
      setPaymentLoading(true);
      
      // First upload the signature image
      const uploadedUrls = await uploadImages([previewImage]);
      console.log('Uploaded URLs:', uploadedUrls);
      
      if (!uploadedUrls || uploadedUrls.length === 0) {
        throw new Error('Không nhận được URL hình ảnh sau khi tải lên');
      }
      
      // Store the signature URL
      const signatureImageUrl = uploadedUrls[0];
      setSignatureUrl(signatureImageUrl);
      
      // Process payment FIRST
      try {
        const walletStorage = localStorage.getItem("wallet-storage");
        if (!walletStorage) {
          throw new Error("Không tìm thấy thông tin ví. Vui lòng đăng nhập lại.");
        }
        const walletData = JSON.parse(walletStorage);
        const walletId = walletData.state.walletId;
        if (!walletId) {
          throw new Error("Không tìm thấy ID ví. Vui lòng đăng nhập lại.");
        }

        const amount = selectedOrder.designPrice * 0.5;

        const response = await api.post("/api/bill", {
          walletId: walletId,
          serviceOrderId: selectedOrder.id,
          amount: amount,
          description: `Thanh toán 50% phí thiết kế cho đơn hàng #${selectedOrder.id.slice(0, 8)}`,
        });

        if (response.data) {
          // Payment successful, THEN sign the contract
          if (contract?.id) {
            await signContract(contract.id, signatureImageUrl);
            message.success("Thanh toán và ký hợp đồng thành công");
            
            // Update order status to DepositSuccessful (status code 3)
            await updateStatus(selectedOrder.id, 3); 
            message.success("Đã cập nhật trạng thái đơn hàng");
            
            // Refresh data
            await getContractByServiceOrder(selectedOrder.id);
            await getServiceOrderById(id); // Fetch latest order details
            
            // Close modal
            closeSignAndPayModal();
          } else {
            throw new Error("Không tìm thấy thông tin hợp đồng để ký");
          }
        }
      } catch (error) {
        console.error("Payment error:", error);
        throw new Error("Thanh toán thất bại: " + (error.response?.data?.error || error.message));
      }
    } catch (error) {
      message.error(error.message || "Xử lý thất bại");
      console.error("Process error:", error);
    } finally {
      setUploading(false);
      setPaymentLoading(false);
      // Only close the modal if there was no error
      // We can't access the error from the catch block here in finally,
      // so we won't try to automatically close the modal.
      // The modal is already closed on success in the try block
    }
  };

  // Định dạng giá tiền
  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return price.toLocaleString("vi-VN") + " VNĐ";
  };

  // Định nghĩa cột cho bảng sản phẩm
  const productColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => {
        const product = productDetailsMap[record.productId];
        return (
          <Space>
            <Image
              src={product?.image?.imageUrl || '/placeholder.png'}
              alt={product?.name || 'Sản phẩm'}
              width={50}
              height={50}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
              preview={false}
            />
            <Text strong>{product?.name || 'Không tìm thấy tên'}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Đơn giá',
      key: 'price',
      align: 'right',
      render: (_, record) => {
        const product = productDetailsMap[record.productId];
        return <Text>{formatPrice(product?.price)}</Text>;
      },
    },
    {
      title: 'Thành tiền',
      key: 'totalPrice',
      align: 'right',
      render: (_, record) => {
        const product = productDetailsMap[record.productId];
        const totalPrice = product && typeof product.price === 'number' && typeof record.quantity === 'number'
          ? product.price * record.quantity
          : 0;
        return <Text strong style={{ color: '#4caf50' }}>{formatPrice(totalPrice)}</Text>;
      },
    },
  ];

  // Define statuses where material price is considered final and relevant
  const finalMaterialPriceStatuses = [
    'DoneDeterminingMaterialPrice', // 23
    'PaymentSuccess',             // 7
    'Processing',                 // 8
    'PickedPackageAndDelivery', // 9
    'DeliveryFail',             // 10 (Price was likely final before this)
    'ReDelivery',               // 11
    'DeliveredSuccessfully',    // 12
    'CompleteOrder',            // 13
    'OrderCancelled',           // 14 (Price might be relevant for refunds/records)
    // 'ConsultingAndSketching',    // 16 - Material price usually not final here
    // 'NoDesignIdea',             // 17 - Material price usually not final here
    'Warning',                  // 15 (Assuming warning doesn't reset the price)
    // Add other relevant statuses if needed
  ];

  // Define statuses where design price is considered approved for customer view
  const approvedDesignPriceStatuses = [
    'DoneDeterminingDesignPrice', // 22
    'WaitDeposit',                // 21
    'DepositSuccessful',          // 3
    'AssignToDesigner',           // 4
    'DeterminingMaterialPrice',   // 5
    'DoneDesign',                 // 6
    'DoneDeterminingMaterialPrice', // 23
    'PaymentSuccess',             // 7
    'Processing',                 // 8
    'PickedPackageAndDelivery', // 9
    'DeliveredSuccessfully',    // 12
    'CompleteOrder',            // 13
    'Warning',                  // 15
    // Add other relevant statuses if needed
  ];

  // -------- Main Render --------
  return (
    <Layout>
      <Header />
      <Content>
        <div className="container mx-auto px-4 py-8" style={{ marginTop: "200px" }}>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/Home">
                    <Space>
                      <HomeOutlined style={{ fontSize: '18px' }} />
                      <span style={{ fontSize: '16px' }}>Trang chủ</span>
                    </Space>
                  </Link>
                ),
              },
              {
                title: (
                  <Link to="/history-booking-services">
                    <Space>
                      <HistoryOutlined style={{ fontSize: '18px' }} />
                      <span style={{ fontSize: '16px' }}>Lịch sử đơn đặt thiết kế</span>
                    </Space>
                  </Link>
                ),
              },
              {
                title: (
                  <Space>
                    <ShoppingOutlined style={{ fontSize: '18px' }} />
                    <span style={{ fontSize: '16px' }}>Chi tiết đơn hàng #{id}</span>
                  </Space>
                ),
              },
            ]}
            style={{
              marginBottom: '16px',
              padding: '12px 16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          />

          <Card
            className="shadow-md mb-6"
            style={{
              marginBottom: '16px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Button
                  type="primary"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/history-booking-services")}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  Quay lại
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                  Đơn hàng <span style={{ color: '#4caf50' }}>#{id}</span>
                </Title>
              </div>
            }
            extra={
              <Tag color={getStatusColor(order?.status)} size="large">
                {getStatusText(order?.status)}
              </Tag>
            }
          >
            <Row gutter={[24, 24]} style={{ marginBottom: '15px' }}>
              <Col xs={24} md={12}>
                <Card
                  title={
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#4caf50',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <UserOutlined />
                      Thông tin khách hàng
                    </span>
                  }
                  style={{
                    height: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Descriptions
                    column={1}
                    labelStyle={{ fontWeight: 'bold', fontSize: '15px' }}
                    contentStyle={{ fontSize: '15px' }}
                    size="middle"
                  >
                    <Descriptions.Item label="Tên khách hàng">
                      {order?.userName || 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {order?.email || 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      {order?.cusPhone || 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">
                      {order?.address?.replace(/\|/g, ', ') || 'Đang tải...'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card
                  title={
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#4caf50',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <HomeOutlined />
                      Thông tin thiết kế
                    </span>
                  }
                  style={{
                    height: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Descriptions
                    column={1}
                    labelStyle={{ fontWeight: 'bold', fontSize: '15px' }}
                    contentStyle={{ fontSize: '15px' }}
                    size="middle"
                  >
                    <Descriptions.Item label="Kích thước">
                      {order?.length !== undefined && order?.width !== undefined
                       ? `${order.length}m x ${order.width}m`
                       : 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại dịch vụ">
                      <Tag color={order?.serviceType === "NoDesignIdea" ? "blue" : "green"}>
                        {order?.serviceType === "NoDesignIdea"
                          ? "Dịch vụ tư vấn & thiết kế"
                          : order?.serviceType || 'Đang tải...'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá thiết kế">
                      {order?.designPrice === 0 || !approvedDesignPriceStatuses.includes(order?.status) ? (
                        <Tag color="gold">Chưa xác định giá thiết kế</Tag>
                      ) : (
                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                          {order?.designPrice !== undefined ? formatPrice(order.designPrice) : '...'}
                        </span>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        finalMaterialPriceStatuses.includes(order?.status)
                        ? "Giá vật liệu"
                        : "Giá vật liệu (dự kiến)"
                      }
                    >
                      {(typeof order?.materialPrice !== 'number' || order.materialPrice <= 0) ? (
                         <Tag color="default">Chưa có</Tag>
                      ) : (
                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                          {formatPrice(order.materialPrice)}
                        </span>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng chi phí">
                      {order?.totalCost === undefined ? 'Đang tải...' :
                        order.totalCost === 0 ? (
                          <Tag color="gold">Chưa xác định tổng</Tag>
                        ) : (
                          <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{formatPrice(order.totalCost)}</span>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      {order?.creationDate ? format(new Date(order.creationDate), "dd/MM/yyyy HH:mm") : 'Đang tải...'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {/* ------------- Conditional Image Display Section ------------- */}
            {(() => {
              // --- Case 1: Show ONLY Phase 0 Sketches ---
              if (showOnlyPhase0Statuses.includes(order?.status)) {
                if (recordLoading) {
                   return <Card title="Hình ảnh khách hàng cung cấp (Ban đầu)" loading={true} style={{ marginBottom: '24px' }} />;
                }
                if (recordError) {
                  return <Card title="Hình ảnh khách hàng cung cấp (Ban đầu)" style={{ marginBottom: '24px' }}><Alert message="Lỗi tải bản phác thảo" description={recordError.toString()} type="error" showIcon /></Card>;
                }
                const phase0Records = sketchRecords?.filter(record => record.phase === 0) || [];
                if (phase0Records.length > 0) {
                  return (
                    <Card
                       title={
                          <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <PictureOutlined /> Hình ảnh khách hàng cung cấp (Ban đầu)
                          </span>
                       }
                       style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}
                    >
                       {/* Display records for Phase 0 */}
                        {phase0Records.map(record => (
                          <div key={record.id} style={{ marginBottom: '16px' }}>
                             <Card 
                                hoverable 
                                bodyStyle={{ padding: '12px' }} 
                                style={{ border: '1px solid #f0f0f0', borderRadius: '8px' }} 
                             > 
                                <Image.PreviewGroup>
                                  <Row gutter={[12, 12]}> { /* Inner grid for images */}
                                    {record.image?.imageUrl && (
                                      <Col xs={24} sm={12} md={8}> { /* Responsive column */}
                                        <Image
                                          src={record.image.imageUrl}
                                          alt={`Ảnh gốc 1`}
                                          style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                                        />
                                      </Col>
                                    )}
                                    {record.image?.image2 && (
                                      <Col xs={24} sm={12} md={8}>
                                        <Image
                                          src={record.image.image2}
                                          alt={`Ảnh gốc 2`}
                                          style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                                        />
                                      </Col>
                                    )}
                                    {record.image?.image3 && (
                                      <Col xs={24} sm={12} md={8}>
                                        <Image
                                          src={record.image.image3}
                                          alt={`Ảnh gốc 3`}
                                          style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                                        />
                                      </Col>
                                    )}
                                    {!record.image?.imageUrl && !record.image?.image2 && !record.image?.image3 && (
                                      <Col span={24}>
                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có ảnh trong bản ghi này" />
                                      </Col>
                                    )}
                                  </Row>
                                </Image.PreviewGroup>
                             </Card>
                          </div>
                        ))}
                    </Card>
                  );
                } else {
                   return (
                     <Card title="Hình ảnh khách hàng cung cấp (Ban đầu)" style={{ marginBottom: '24px' }}>
                       <Empty description="Không tìm thấy hình ảnh ban đầu trong bản ghi phác thảo." />
                     </Card>
                   );
                }
              }
              // --- Case 2: Show ALL Sketch Phases ---
              else if (showAllPhasesStatuses.includes(order?.status)) {
                 if (recordLoading) {
                   return <Card title="Bản vẽ phác thảo & Hình ảnh gốc" loading={true} style={{ marginBottom: '24px' }} />;
                 }
                  if (recordError) {
                    return <Card title="Bản vẽ phác thảo & Hình ảnh gốc" style={{ marginBottom: '24px' }}><Alert message="Lỗi tải bản phác thảo" description={recordError.toString()} type="error" showIcon /></Card>;
                  }
                 if (sketchRecords && sketchRecords.length > 0) {
                    const maxPhase = Math.max(...sketchRecords.map(r => r.phase), 0);
                    const phasesToShow = Array.from({ length: maxPhase + 1 }, (_, i) => i);

                    return (
                       <Card
                          title={
                             <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PictureOutlined /> Bản vẽ phác thảo & Hình ảnh gốc
                             </span>
                          }
                          style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}
                          loading={recordLoading}
                       >
                          {phasesToShow.map(phase => {
                              const phaseRecords = sketchRecords.filter(record => record.phase === phase);
                              if (phaseRecords.length === 0) return null;

                              const phaseTitle = phase === 0
                                ? "Hình ảnh khách hàng cung cấp (Ban đầu)"
                                : `Bản phác thảo lần ${phase}`;

                              const isAnySelectedInPhase = phaseRecords.some(record => record.isSelected);
                              const canSelect = phase > 0 && !sketchRecords.some(r => r.isSelected);

                              return (
                                <div key={phase} style={{ marginBottom: '24px' }}> { /* Margin between phases */}
                                  <Title level={5} style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                                    {phaseTitle}
                                    {isAnySelectedInPhase && <Tag color="green" style={{ marginLeft: 8 }}>Đã chọn</Tag>}
                                  </Title>
                                  {/* Loop through records within the phase */}
                                  {phaseRecords.map(record => (
                                     <div key={record.id} style={{ marginBottom: '16px' }}> { /* Margin between records in same phase */}
                                        <Card 
                                           hoverable 
                                           bodyStyle={{ padding: '12px' }} 
                                           style={{ border: record.isSelected ? '2px solid #52c41a' : '1px solid #f0f0f0', borderRadius: '8px' }}
                                        >
                                           <Image.PreviewGroup>
                                              <Row gutter={[12, 12]}> { /* Inner grid for images */}
                                                 {record.image?.imageUrl && (
                                                   <Col xs={24} sm={12} md={8}>
                                                     <Image
                                                       src={record.image.imageUrl}
                                                       alt={`${phase === 0 ? 'Ảnh gốc' : `Phác thảo ${phase}`} 1`}
                                                       style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                                                     />
                                                   </Col>
                                                 )}
                                                 {record.image?.image2 && (
                                                   <Col xs={24} sm={12} md={8}>
                                                     <Image
                                                       src={record.image.image2}
                                                       alt={`${phase === 0 ? 'Ảnh gốc' : `Phác thảo ${phase}`} 2`}
                                                       style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                                                     />
                                                   </Col>
                                                 )}
                                                 {record.image?.image3 && (
                                                   <Col xs={24} sm={12} md={8}>
                                                     <Image
                                                       src={record.image.image3}
                                                       alt={`${phase === 0 ? 'Ảnh gốc' : `Phác thảo ${phase}`} 3`}
                                                       style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                                                     />
                                                   </Col>
                                                 )}
                                                  {!record.image?.imageUrl && !record.image?.image2 && !record.image?.image3 && (
                                                     <Col span={24}>
                                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có ảnh trong bản ghi này" />
                                                     </Col>
                                                  )}
                                              </Row>
                                           </Image.PreviewGroup>
                                        </Card>
                                         {/* Selection button - Place AFTER the image card */} 
                                         {canSelect && (
                                           <Button
                                             type="primary"
                                             icon={<CheckCircleOutlined />}
                                             style={{ marginTop: '10px', width: '100%' }} 
                                             loading={recordLoading}
                                             onClick={() => handleConfirmSketch(record.id)}
                                           >
                                             Chọn bản này
                                           </Button>
                                         )}
                                     </div>
                                  ))}
                                </div>
                              );
                          })}
                          {phasesToShow.every(p => sketchRecords.filter(r => r.phase === p).length === 0) && (
                             <Empty description="Không tìm thấy bản phác thảo phù hợp." />
                          )}
                       </Card>
                    );
                 } else {
                    return (
                       <Card title="Bản vẽ phác thảo & Hình ảnh gốc" style={{ marginBottom: '24px' }}>
                          <Empty description="Chưa có bản phác thảo nào được tải lên." />
                       </Card>
                    );
                 }
              }
              // --- Case 3: Fallback to order.image (Layout seems OK here already) ---
              else if (order?.image && (order.image.imageUrl || order.image.image2 || order.image.image3)) {
                 return (
                    <Card
                       title={
                          <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <PictureOutlined /> Hình ảnh khách hàng cung cấp
                          </span>
                       }
                       style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}
                    >
                       <Image.PreviewGroup>
                          <Row gutter={[16, 16]}> { /* Existing good layout */}
                              {order.image.imageUrl && (
                                <Col xs={24} sm={12} md={8}>
                                  <Image src={order.image.imageUrl} alt="Hình ảnh 1" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                                </Col>
                              )}
                              {order.image.image2 && (
                                <Col xs={24} sm={12} md={8}>
                                  <Image src={order.image.image2} alt="Hình ảnh 2" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                                </Col>
                              )}
                              {order.image.image3 && (
                                <Col xs={24} sm={12} md={8}>
                                  <Image src={order.image.image3} alt="Hình ảnh 3" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}/>
                                </Col>
                              )}
                           </Row>
                        </Image.PreviewGroup>
                    </Card>
                 );
              }
              // --- Final Fallback: No Images Available ---
              else {
                 return (
                    <Card title="Hình ảnh" style={{ marginBottom: '24px' }}>
                       <Empty description="Không có hình ảnh nào được cung cấp cho đơn hàng này." />
                    </Card>
                 );
              }
            })()}
            {/* ------------- End Conditional Image Display Section ------------- */}

            {order?.description && (
              <Card
                title={
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FileTextOutlined />
                    Mô tả
                  </span>
                }
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  marginBottom: '24px'
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: order.description,
                  }}
                  style={{
                    fontSize: '15px',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }}
                />
              </Card>
            )}

            {/* Products Table Card ... */}
            {order?.serviceOrderDetails && order.serviceOrderDetails.length > 0 && (
               <Card
                title={
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <TagsOutlined />
                    Danh sách vật liệu đã chọn
                  </span>
                }
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  marginBottom: '24px'
                }}
                loading={fetchingProducts || productLoading} // Use combined loading
              >
                <Table
                  columns={productColumns}
                  dataSource={order?.serviceOrderDetails || []}
                  pagination={false}
                  rowKey={(record, index) => `${record.productId}-${index}`}
                  summary={() => {
                    let totalMaterialCost = 0;
                    (order?.serviceOrderDetails || []).forEach(detail => {
                      const product = productDetailsMap[detail.productId];
                      if (product && typeof product.price === 'number' && typeof detail.quantity === 'number') {
                        totalMaterialCost += product.price * detail.quantity;
                      }
                    });
                    const displayMaterialPrice = finalMaterialPriceStatuses.includes(order?.status) && typeof order?.materialPrice === 'number'
                                                  ? order.materialPrice
                                                  : totalMaterialCost;

                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3} align="right">
                           <Text strong>
                             {finalMaterialPriceStatuses.includes(order?.status)
                               ? "Tổng tiền vật liệu (chính thức):"
                               : "Tổng tiền vật liệu (dự kiến):"}
                           </Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                           <Text strong style={{ color: '#cf1322' }}>
                             {formatPrice(displayMaterialPrice)}
                           </Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            )}

            <Card
              title={
                <span style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#4caf50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <HistoryOutlined />
                  Lịch sử trạng thái
                </span>
              }
              style={{
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Timeline>
                <Timeline.Item color="green">
                  <p style={{ fontSize: '15px', marginBottom: '4px' }}>Đơn hàng được tạo</p>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {order?.creationDate ? format(new Date(order.creationDate), "dd/MM/yyyy HH:mm") : '...'}
                  </Text>
                </Timeline.Item>
                {order?.status && (
                  <Timeline.Item color={getStatusColor(order.status)}>
                    <p style={{ fontSize: '15px', marginBottom: '4px', color: '#4caf50', fontWeight: '600' }}>
                      {getStatusText(order.status)}
                    </p>
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>

            {/* Add this after the timeline Card, before the closing Card tag */} 
            {(showContractButton || contractVisibleStatuses.includes(order?.status) || contractVisibleStatusCodes.includes(order?.status)) && (
              <Card
                title={
                  <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileTextOutlined /> Hợp đồng
                  </span>
                }
                style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginTop: '24px' }}
                loading={contractLoading}
              >
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    onClick={handleViewContract}
                    disabled={!contract} // Disable if contract is not loaded yet
                    loading={contractLoading}
                    style={{ width: '100%' }}
                  >
                    Xem hợp đồng
                  </Button>
                  <div style={{ padding: '8px 16px', backgroundColor: '#f5f5f5', borderRadius: '4px', margin: '8px 0' }}>
                    <Text type="secondary">
                      Bạn đã đọc và đồng ý với hợp đồng 50% cho giai đoạn thiết kế chi tiết, để kí hợp đồng, vui lòng cung cấp ảnh chữ kí của bạn tại đây
                    </Text>
                  </div>
                  {!contract?.modificationDate && (selectedOrder?.status === "WaitDeposit" || selectedOrder?.status === 21) && (
                    <Button
                      type="primary"
                      icon={<FileTextOutlined />}
                      onClick={openSignAndPayModal}
                      disabled={!contract} // Disable if contract is not loaded yet
                      style={{ width: '100%' }}
                    >
                      Ký hợp đồng & Thanh toán cọc
                    </Button>
                  )}
                  {contract?.modificationDate && (
                     <Tag icon={<CheckCircleOutlined />} color="success">
                        Hợp đồng đã được ký vào {format(new Date(contract.modificationDate), "dd/MM/yyyy HH:mm")}
                     </Tag>
                  )}
                </Space>
              </Card>
            )}

          </Card>
        </div>

        {/* Contract Modal */} 
        <Modal
          title="Hợp đồng"
          open={isContractModalVisible}
          onCancel={handleCloseContractModal}
          width="80%"
          footer={null}
          style={{ top: 20 }}
          styles={{
            body: {
              height: "80vh",
              padding: "0",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {contract?.description ? (
            <iframe
              src={contract.description}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                flex: 1,
              }}
              title="Contract PDF"
            />
          ) : (
            <Spin tip="Đang tải hợp đồng..." />
          )}
        </Modal>

        {/* Sign and Pay Modal */} 
        <Modal
          title="Ký hợp đồng và thanh toán cọc"
          open={isSignAndPayModalVisible}
          onCancel={closeSignAndPayModal}
          footer={[
            <Button key="cancel" onClick={closeSignAndPayModal}>
              Hủy
            </Button>,
            <Button
              key="confirm"
              type="primary"
              loading={uploading || paymentLoading}
              onClick={handleSignAndPay}
              disabled={!previewImage} // Disable confirm if no signature is uploaded
            >
              Xác nhận ký và thanh toán
            </Button>,
          ]}
          width={600}
        >
          <div style={{ marginBottom: "20px" }}>
            <Text>Bạn cần ký hợp đồng và thanh toán 50% phí thiết kế ({formatPrice(selectedOrder?.designPrice * 0.5)}) để tiếp tục.</Text>
          </div>

          <Divider />

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <Text strong>Chữ ký của bạn</Text>
            <div style={{ marginTop: "10px", minHeight: '150px', border: '1px dashed #d9d9d9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
              {previewImage ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Image
                    src={previewImage}
                    alt="Chữ ký xem trước"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "150px",
                      objectFit: "contain",
                    }}
                    preview={false}
                  />
                  <Button 
                    type="link" 
                    danger 
                    icon={<CloseCircleOutlined />} 
                    onClick={() => setPreviewImage(null)}
                    style={{ position: 'absolute', top: -5, right: -5, background: 'rgba(255,255,255,0.7)', borderRadius: '50%' }}
                  />
                </div>
              ) : (
                <Button
                  type="dashed"
                  icon={<UploadOutlined />}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) { // Check file size (e.g., 5MB)
                           message.error('Kích thước ảnh chữ ký quá lớn (tối đa 5MB).');
                           return;
                        }
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setPreviewImage(e.target.result);
                        };
                        reader.onerror = (error) => {
                          console.error('Error reading file:', error);
                          message.error('Không thể đọc tệp hình ảnh. Vui lòng thử lại.');
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  Tải lên chữ ký
                </Button>
              )}
            </div>
          </div>

          <Divider />

          <div style={{ marginBottom: "10px" }}>
            <Text strong>Thông tin thanh toán:</Text>
            <Descriptions bordered column={1} size="small" style={{ marginTop: '10px' }}>
              <Descriptions.Item label="Phí thiết kế">{formatPrice(selectedOrder?.designPrice)}</Descriptions.Item>
              <Descriptions.Item label="Thanh toán đợt này (50%)"><Text strong style={{ color: '#cf1322' }}>{formatPrice(selectedOrder?.designPrice * 0.5)}</Text></Descriptions.Item>
            </Descriptions>
          </div>

          <div style={{ backgroundColor: "#fffbe6", border: '1px solid #ffe58f', padding: "10px", borderRadius: "4px" }}>
            <Text type="warning">
              Bằng việc nhấn nút "Xác nhận", bạn đồng ý với các điều khoản trong hợp đồng và đồng ý thanh toán 50% phí thiết kế.
            </Text>
          </div>
        </Modal>

        {/* Add Confirmation Modal */}
        <Modal
          title="Xác nhận chọn bản phác thảo"
          open={isConfirmModalVisible}
          onOk={handleConfirmSelection}
          onCancel={handleCancelSelection}
          okText="Xác nhận"
          cancelText="Hủy"
          confirmLoading={recordLoading}
        >
          <p>Bạn có chắc chắn muốn chọn bản phác thảo này không?</p>
          <p>Sau khi chọn, hệ thống sẽ tự động tạo hợp đồng và bạn sẽ cần thanh toán 50% phí thiết kế để tiếp tục.</p>
        </Modal>

      </Content>
      <Footer />
    </Layout>
  );
};

export default ServiceOrderDetail; 