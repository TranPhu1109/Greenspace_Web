import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Layout,
  Typography,
  Card,
  Descriptions,
  Tag,
  Table,
  Space,
  Spin,
  Empty,
  Button,
  Divider,
  message,
  Image,
  Modal,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BulbOutlined,
  ShoppingOutlined,
  ReloadOutlined,
  FileTextOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  CloseOutlined,
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import "./styles.scss";
import StatusTracking from "@/components/StatusTracking/StatusTracking";
import useShippingStore from "@/stores/useShippingStore";
import useContractStore from "@/stores/useContractStore";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import api from "@/api/api";
import useRecordStore from "@/stores/useRecordStore";
import useWalletStore from "@/stores/useWalletStore";

const { Content } = Layout;
const { Title, Text } = Typography;

const OrderHistoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedOrder,
    isLoading,
    getDesignOrderById,
    updateStatus,
    getServiceOrderById,
  } = useDesignOrderStore();
  //console.log("selectedOrder", selectedOrder);
  const {
    sketchRecords,
    getRecordSketch,
    confirmRecord,
    designRecords,
    getRecordDesign,
    confirmDesignRecord,
  } = useRecordStore();
  console.log("designRecords", designRecords);

  const { fetchDesignIdeaById } = useDesignIdeaStore();
  const { getProductById } = useProductStore();
  const { trackOrder } = useShippingStore();
  const {
    getContractByServiceOrder,
    contract,
    loading: contractLoading,
    signContract,
    generateContract,
  } = useContractStore();
  //console.log("contract", contract);

  const trackingInterval = useRef(null);
  const { uploadImages, progress } = useCloudinaryStorage();
  const [uploading, setUploading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [isSignAndPayModalVisible, setIsSignAndPayModalVisible] = useState(false);

  const [designIdea, setDesignIdea] = useState(null);
  //console.log("designIdea",designIdea);
  const [products, setProducts] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showContractButton, setShowContractButton] = useState(false);
  const [isContractModalVisible, setIsContractModalVisible] = useState(false);
  const [showPaymentButton, setShowPaymentButton] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [loadingSketch, setLoadingSketch] = useState(false);
  const [selectedSketchId, setSelectedSketchId] = useState(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [loadingDesign, setLoadingDesign] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState(null);
  const [isConfirmDesignModalVisible, setIsConfirmDesignModalVisible] =
    useState(false);
  const [isConfirmMaterialModalVisible, setIsConfirmMaterialModalVisible] =
    useState(false);
  const [isPaymentRemainModalVisible, setIsPaymentRemainModalVisible] =
    useState(false);
  const [isCancelOrderModalVisible, setIsCancelOrderModalVisible] =
    useState(false);
  const [isStopOrderModalVisible, setIsStopOrderModalVisible] = useState(false);

  const componentId = React.useRef("order-detail");

  // Add shipping status mapping
  const shippingStatusMap = {
    ready_to_pick: "Processing",
    delivering: "PickedPackageAndDelivery",
    delivery_fail: "DeliveryFail",
    return: "ReDelivery",
    delivered: "DeliveredSuccessfully",
    cancel: "OrderCancelled",
  };

  const { createBill } = useWalletStore();

  const fetchDetails = useCallback(async () => {
    if (!selectedOrder) return;

    try {
      setLoadingDetails(true);

      const designData = await fetchDesignIdeaById(selectedOrder.designIdeaId);
      setDesignIdea(designData);

      // Fetch products
      if (selectedOrder.serviceOrderDetails?.length > 0) {
        const productPromises = selectedOrder.serviceOrderDetails.map(
          (detail) => getProductById(detail.productId)
        );
        const productsData = await Promise.all(productPromises);
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoadingDetails(false);
    }
  }, [selectedOrder, fetchDesignIdeaById, getProductById]);

  useEffect(() => {
    if (id) {
      getDesignOrderById(id, componentId.current);
    }
  }, [id, getDesignOrderById]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Add tracking functionality
  useEffect(() => {
    if (selectedOrder?.deliveryCode) {
      const startTracking = () => {
        // Clear any existing interval
        if (trackingInterval.current) {
          clearInterval(trackingInterval.current);
        }

        // Initial check
        checkShippingStatus();

        // Set up interval for checking every 20 seconds
        trackingInterval.current = setInterval(checkShippingStatus, 20000);
      };

      const checkShippingStatus = async () => {
        try {
          // Stop tracking if status is DeliveredSuccessfully or CompleteOrder
          if (
            selectedOrder.status === "DeliveredSuccessfully" ||
            selectedOrder.status === "CompleteOrder"
          ) {
            if (trackingInterval.current) {
              clearInterval(trackingInterval.current);
              trackingInterval.current = null;
            }
            return;
          }

          const shippingStatus = await trackOrder(selectedOrder.deliveryCode);
          const mappedStatus = shippingStatusMap[shippingStatus];

          console.log("Current shipping status:", {
            shippingStatus,
            mappedStatus,
            currentStatus: selectedOrder.status,
          });

          // Only update if we have a valid mapped status and it's different from current status
          if (mappedStatus && mappedStatus !== selectedOrder.status) {
            console.log("Updating status:", {
              from: selectedOrder.status,
              to: mappedStatus,
              shippingStatus: shippingStatus,
            });

            await updateStatus(
              selectedOrder.id,
              mappedStatus,
              selectedOrder.deliveryCode
            );
            //message.success(`Trạng thái đơn hàng đã được cập nhật: ${mappedStatus}`);

            // Refresh order details
            await getDesignOrderById(id, componentId.current);
          }
        } catch (error) {
          console.error("Error checking shipping status:", error);
        }
      };

      startTracking();

      // Cleanup interval on unmount
      return () => {
        if (trackingInterval.current) {
          clearInterval(trackingInterval.current);
        }
      };
    }
  }, [selectedOrder?.deliveryCode, selectedOrder?.status]);

  // Add useEffect to fetch contract when status is WaitDeposit
  useEffect(() => {
    const fetchContract = async () => {
      if (selectedOrder?.status === "WaitDeposit") {
        try {
          // First try to get existing contract
          await getContractByServiceOrder(selectedOrder.id);
          setShowContractButton(true);
        } catch (error) {
          console.error("Error fetching contract:", error);
          // If no contract exists, generate a new one
          try {
            await generateContract({
              userId: selectedOrder.userId,
              serviceOrderId: selectedOrder.id,
              userName: selectedOrder.userName,
              email: selectedOrder.email,
              phone: selectedOrder.cusPhone,
              address: selectedOrder.address,
              designPrice: selectedOrder.designPrice,
            });
            // Fetch updated service order data after generating contract
            await getServiceOrderById(selectedOrder.id);
            // Fetch the contract again to make sure we have it
            await getContractByServiceOrder(selectedOrder.id);
            setShowContractButton(true);
          } catch (genError) {
            console.error("Error generating contract:", genError);
            setShowContractButton(false);
          }
        }
      } else {
        setShowContractButton(false);
      }
    };

    // Call fetchContract immediately after the component mounts if selectedOrder exists
    if (selectedOrder) {
      fetchContract();
    }
  }, [
    selectedOrder?.status,
    selectedOrder?.id,
    selectedOrder, // Add selectedOrder as a dependency to react to its initial load
    getContractByServiceOrder,
    generateContract,
    getServiceOrderById,
  ]);

  // Add useEffect to check contract modification date
  useEffect(() => {
    if (contract?.modificationDate) {
      setShowPaymentButton(true);
    } else {
      setShowPaymentButton(false);
    }

    // If contract exists but showContractButton is false, set it to true
    // This ensures the button appears as soon as contract data is available
    if (contract && !showContractButton && selectedOrder?.status === "WaitDeposit") {
      setShowContractButton(true);
    }
  }, [contract, selectedOrder?.status, showContractButton]);

  // Add useEffect to fetch sketch records
  useEffect(() => {
    const fetchSketchRecords = async () => {
      if (selectedOrder?.isCustom && selectedOrder?.status !== "Pending") {
        try {
          setLoadingSketch(true);
          await getRecordSketch(selectedOrder.id);
        } catch (error) {
          console.error("Error fetching sketch records:", error);
        } finally {
          setLoadingSketch(false);
        }
      }
    };

    const fetchDesignRecords = async () => {
      if (
        selectedOrder?.isCustom &&
        selectedOrder?.status !== "DeterminingMaterialPrice"
      ) {
        try {
          setLoadingDesign(true);
          await getRecordDesign(selectedOrder.id);
        } catch (error) {
          console.error("Error fetching design records:", error);
        } finally {
          setLoadingDesign(false);
        }
      }
    };

    fetchSketchRecords();
    fetchDesignRecords();
  }, [
    selectedOrder?.id,
    selectedOrder?.isCustom,
    selectedOrder?.status,
    getRecordSketch,
    getRecordDesign,
  ]);

  // Add useEffect for design records
  useEffect(() => {
    const fetchDesignRecords = async () => {
      if (
        selectedOrder?.isCustom &&
        selectedOrder.status !== "Pending" &&
        selectedOrder.status !== "ConsultingAndSketching" &&
        selectedOrder.status !== "DeterminingDesignPrice" &&
        selectedOrder.status !== "DepositSuccessful"
      ) {
        try {
          setLoadingDesign(true);
          await getRecordDesign(selectedOrder.id);
        } catch (error) {
          console.error("Error fetching design records:", error);
        } finally {
          setLoadingDesign(false);
        }
      }
    };

    fetchDesignRecords();
  }, [
    selectedOrder?.id,
    selectedOrder?.isCustom,
    selectedOrder?.status,
    getRecordDesign,
  ]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await getDesignOrderById(id, componentId.current);
      await fetchDetails();
      message.success("Đã cập nhật thông tin đơn hàng");
    } catch (error) {
      //message.error('Không thể cập nhật thông tin đơn hàng');
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCompleteOrder = async () => {
    try {
      await updateStatus(
        selectedOrder.id,
        "CompleteOrder",
        selectedOrder.deliveryCode
      );
      message.success("Đã xác nhận hoàn thành đơn hàng");
      await getDesignOrderById(id, componentId.current);
    } catch (error) {
      message.error("Không thể xác nhận hoàn thành đơn hàng");
    }
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

  // Add handleCloseContractModal function
  const handleCloseContractModal = () => {
    setIsContractModalVisible(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Add function to calculate material price
  const calculateMaterialPrice = (order) => {
    if (order.materialPrice === 0 && order.serviceOrderDetails?.length > 0) {
      return order.serviceOrderDetails.reduce(
        (total, detail) => total + detail.totalPrice,
        0
      );
    }
    return order.materialPrice;
  };

  const productColumns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record, index) => {
        const product = products[index];
        return (
          <Space>
            {product?.image?.imageUrl && (
              <img
                src={product.image.imageUrl}
                alt={product?.name}
                style={{ width: 50, height: 50, objectFit: "cover" }}
              />
            )}
            <Space direction="vertical" size={0}>
              <Text strong>{product?.name || "N/A"}</Text>
              <Text type="secondary">{product?.categoryName || "N/A"}</Text>
            </Space>
          </Space>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => <Text strong>{quantity}</Text>,
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (price) => <Text type="secondary">{formatPrice(price)}</Text>,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (total) => (
        <Text type="success" strong>
          {formatPrice(total)}
        </Text>
      ),
    },
  ];


  const openSignAndPayModal = () => {
    setIsSignAndPayModalVisible(true);
  };

  const closeSignAndPayModal = () => {
    setIsSignAndPayModalVisible(false);
    setPreviewImage(null);
  };

  const handleSignAndPay = async () => {
    try {
      if (!previewImage) {
        message.error("Vui lòng tải lên chữ ký trước khi xác nhận");
        return;
      }

      setUploading(true);
      setPaymentLoading(true);

      // First upload the signature image but don't sign the contract yet
      const uploadedUrls = await uploadImages([previewImage]);
      console.log('Uploaded URLs:', uploadedUrls);

      if (!uploadedUrls || uploadedUrls.length === 0) {
        throw new Error('Không nhận được URL hình ảnh sau khi tải lên');
      }

      // Store the signature URL temporarily
      const signatureImageUrl = uploadedUrls[0];
      setSignatureUrl(signatureImageUrl);

      // Process payment first
      try {
        // Get walletId from localStorage and parse it correctly
        const walletStorage = localStorage.getItem("wallet-storage");
        if (!walletStorage) {
          throw new Error("Không tìm thấy thông tin ví. Vui lòng đăng nhập lại.");
        }

        // Parse the JSON string to get the walletId
        const walletData = JSON.parse(walletStorage);
        const walletId = walletData.state.walletId;

        if (!walletId) {
          throw new Error("Không tìm thấy ID ví. Vui lòng đăng nhập lại.");
        }

        // Calculate 50% of design price
        const amount = selectedOrder.designPrice * 0.5;

        // Call bill API to process payment
        const response = await api.post("/api/bill", {
          walletId: walletId,
          serviceOrderId: selectedOrder.id,
          amount: amount,
          description: `Thanh toán 50% phí thiết kế cho đơn hàng #${selectedOrder.id.slice(
            0,
            8
          )}`,
        });

        if (response.data) {
          // Payment successful, now sign the contract
          if (contract?.id) {
            await signContract(contract.id, signatureImageUrl);
            message.success("Thanh toán và ký hợp đồng thành công");

            // Update order status and refresh data
            await updateStatus(selectedOrder.id, "DepositSuccessful");
            await getContractByServiceOrder(selectedOrder.id);
            await getDesignOrderById(id, componentId.current);
          } else {
            throw new Error("Không tìm thấy thông tin hợp đồng");
          }
        }
      } catch (error) {
        console.error("Payment error:", error);
        // If payment fails, don't sign the contract
        throw new Error("Thanh toán thất bại: " + (error.response?.data?.error || error.message));
      }
    } catch (error) {
      message.error(error.message || "Xử lý thất bại");
      console.error("Process error:", error);
    } finally {
      setUploading(false);
      setIsSignAndPayModalVisible(false);
      setPreviewImage(null);
      setPaymentLoading(false);
    }
  };

  const handleConfirmUpload = async () => {
    // Existing code...
  };

  const handleCancelUpload = () => {
    setIsPreviewModalVisible(false);
    setPreviewImage(null);
  };

  const handlePayment = async () => {
    // Existing code...
  };

  const handleCancelPayment = () => {
    setIsPaymentModalVisible(false);
  };

  const showPaymentModal = () => {
    setIsPaymentModalVisible(true);
  };

  const handleSelectSketch = (recordId) => {
    setSelectedSketchId(recordId);
    setIsConfirmModalVisible(true);
  };

  const handleConfirmSelection = async () => {
    try {
      await confirmRecord(selectedSketchId);
      message.success("Đã chốt bản vẽ phác thảo thành công");
      setIsConfirmModalVisible(false);

      // Refresh sketch records after successful selection
      if (selectedOrder?.id) {
        setLoadingSketch(true);
        await getRecordSketch(selectedOrder.id);
        setLoadingSketch(false);

        // Update order status to DeterminingDesignPrice
        try {
          await updateStatus(selectedOrder.id, "DeterminingDesignPrice");
          message.success("Đã cập nhật trạng thái đơn hàng");
        } catch (error) {
          message.error("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng");
        }
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi chọn bản vẽ phác thảo");
    }
  };

  const handleCancelSelection = () => {
    setSelectedSketchId(null);
    setIsConfirmModalVisible(false);
  };

  const handleSelectDesign = (recordId) => {
    setSelectedDesignId(recordId);
    setIsConfirmDesignModalVisible(true);
  };

  const handleConfirmDesignSelection = async () => {
    try {
      await confirmDesignRecord(selectedDesignId);
      message.success("Đã chốt bản vẽ chi tiết thành công");
      setIsConfirmDesignModalVisible(false);

      // Refresh design records after successful selection
      if (selectedOrder?.id) {
        setLoadingDesign(true);
        await getRecordDesign(selectedOrder.id);
        setLoadingDesign(false);

        // Update order status to DoneConsulting
        // try {
        //   await updateStatus(selectedOrder.id, "DeterminingMaterialPrice");
        //   message.success("Đã cập nhật trạng thái đơn hàng");
        // } catch (error) {
        //   message.error("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng");
        // }
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi chọn bản vẽ chi tiết");
    }
  };

  const handleReDesign = async () => {
    try {
      await updateStatus(selectedOrder.id, "ReDesign");
      message.success("Đã xác nhận yêu cầu thiết kế lại");
      await getDesignOrderById(id, componentId.current);
    } catch (error) {
      message.error("Có lỗi xảy ra khi yêu cầu thiết kế lại");
    }
  };

  const handleCancelDesignSelection = () => {
    setSelectedDesignId(null);
    setIsConfirmDesignModalVisible(false);
  };

  const handleConfirmMaterialPrice = async () => {
    try {
      await updateStatus(selectedOrder.id, "DoneDesign");
      message.success("Đã xác nhận giá vật liệu thành công");
      await getDesignOrderById(id, componentId.current);
      setIsConfirmMaterialModalVisible(false);
    } catch (error) {
      message.error("Có lỗi xảy ra khi xác nhận giá vật liệu");
    }
  };

  const showConfirmMaterialModal = () => {
    setIsConfirmMaterialModalVisible(true);
  };

  const handleCancelMaterialConfirm = () => {
    setIsConfirmMaterialModalVisible(false);
  };

  const handlePaymentRemain = async () => {
    try {
      setPaymentLoading(true);
      const remainingDesignPrice = selectedOrder.designPrice * 0.5; // 50% remaining design price
      const totalMaterialPrice = calculateMaterialPrice(selectedOrder); // 100% material price
      const totalAmount = remainingDesignPrice + totalMaterialPrice;

      await createBill(selectedOrder.id, totalAmount);
      await updateStatus(selectedOrder.id, "PaymentSuccess");
      message.success("Đã tạo hóa đơn thanh toán thành công");
      await getDesignOrderById(id, componentId.current);
      setIsPaymentRemainModalVisible(false);
    } catch (error) {
      message.error(error.response.data.error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const showPaymentRemainModal = () => {
    setIsPaymentRemainModalVisible(true);
  };

  const handleCancelPaymentRemain = () => {
    setIsPaymentRemainModalVisible(false);
  };

  const handleCancelOrder = async () => {
    try {
      await updateStatus(selectedOrder.id, "OrderCancelled");
      message.success("Đã hủy đơn hàng thành công");
      await getDesignOrderById(id, componentId.current);
      setIsCancelOrderModalVisible(false);
    } catch (error) {
      message.error("Không thể hủy đơn hàng");
    }
  };

  const showCancelOrderModal = () => {
    setIsCancelOrderModalVisible(true);
  };

  const handleCancelOrderConfirm = () => {
    setIsCancelOrderModalVisible(false);
  };

  const handleStopOrder = async () => {
    try {
      setPaymentLoading(true);
      const remainingDesignPrice = selectedOrder.designPrice * 0.5; // 50% remaining design price

      await createBill(selectedOrder.id, remainingDesignPrice);
      await updateStatus(selectedOrder.id, "StopService");
      message.success(
        "Đã dừng đơn hàng và thanh toán 50% phí thiết kế còn lại thành công"
      );
      await getDesignOrderById(id, componentId.current);
      setIsStopOrderModalVisible(false);
    } catch (error) {
      message.error("Có lỗi xảy ra khi dừng đơn hàng");
    } finally {
      setPaymentLoading(false);
    }
  };

  const showStopOrderModal = () => {
    setIsStopOrderModalVisible(true);
  };

  const handleCancelStopOrder = () => {
    setIsStopOrderModalVisible(false);
  };

  if (isLoading || loadingDetails) {
    return (
      <Layout className="order-detail-layout">
        <Header />
        <Content>
          <div className="order-detail-content">
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  if (!selectedOrder) {
    return (
      <Layout className="order-detail-layout">
        <Header />
        <Content>
          <div className="order-detail-content">
            <Empty
              description="Không tìm thấy thông tin đơn hàng"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                onClick={() => navigate("/serviceorderhistory")}
              >
                Quay lại danh sách
              </Button>
            </Empty>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  console.log(designRecords);
  return (
    <Layout className="order-detail-layout">
      <Header />
      <Content>
        <div className="order-detail-content">
          <Card className="order-detail-card">
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              {/* Header */}

              <Space
                direction="horizontal"
                align="center"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Button
                  type="default"
                  onClick={() => navigate("/serviceorderhistory")}
                >
                  Quay lại danh sách
                </Button>
                <Space>
                  <Title level={2}>Chi tiết đơn hàng #{id.slice(0, 8)}</Title>
                </Space>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={refreshing}
                  >
                    Làm mới
                  </Button>
                </Space>
              </Space>

              {/* Customer Information */}
              <Card title="Thông tin khách hàng" type="inner">
                <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                  <Descriptions.Item
                    label={
                      <>
                        <UserOutlined /> Tên khách hàng
                      </>
                    }
                  >
                    {selectedOrder.userName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <MailOutlined /> Email
                      </>
                    }
                  >
                    {selectedOrder.email}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <PhoneOutlined /> Số điện thoại
                      </>
                    }
                  >
                    {selectedOrder.cusPhone}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <EnvironmentOutlined /> Địa chỉ
                      </>
                    }
                  >
                    {selectedOrder.address}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <ClockCircleOutlined /> Ngày đặt
                      </>
                    }
                  >
                    {new Date(selectedOrder.creationDate).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <PhoneOutlined /> Custom
                      </>
                    }
                  >
                    {selectedOrder.isCustom ? "Có" : "Không"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Design Idea Information */}
              {selectedOrder.isCustom ? (
                <Card
                  title={
                    <Space>
                      <BulbOutlined />
                      <span>Thông tin thiết kế</span>
                    </Space>
                  }
                  type="inner"
                >
                  <Descriptions
                    column={{ xs: 1, sm: 2 }}
                    bordered
                    styles={{
                      label: { fontWeight: "bold", fontSize: "15px" },
                      content: { fontSize: "15px" },
                    }}
                  >
                    <Descriptions.Item label="Tên thiết kế">
                      {designIdea?.name || "Chưa có tên thiết kế"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Chiều dài">
                      {selectedOrder.length}m
                    </Descriptions.Item>
                    <Descriptions.Item label="Chiều rộng">
                      {selectedOrder.width}m
                    </Descriptions.Item>

                    <Descriptions.Item label="Mô tả">
                      <div
                        className="html-preview"
                        dangerouslySetInnerHTML={{
                          __html:
                            selectedOrder?.description || "Không có mô tả",
                        }}
                        style={{
                          maxWidth: "100%",
                          overflow: "hidden",
                          fontSize: "15px",
                          lineHeight: "1.6",
                        }}
                      />
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ) : (
                <>
                  {designIdea && (
                    <Card
                      title={
                        <Space>
                          <BulbOutlined />
                          <span>Thông tin thiết kế</span>
                        </Space>
                      }
                      type="inner"
                    >
                      <Descriptions
                        column={{ xs: 1, sm: 2 }}
                        bordered
                        styles={{
                          label: { fontWeight: "bold", fontSize: "15px" },
                          content: { fontSize: "15px" },
                        }}
                      >
                        <Descriptions.Item label="Tên thiết kế" span={3}>
                          {designIdea?.name || "Chưa có tên thiết kế"}
                        </Descriptions.Item>

                        {selectedOrder?.length > 0 &&
                          selectedOrder?.width > 0 && (
                            <>
                              <Descriptions.Item label="Chiều dài" span={1}>
                                {selectedOrder.length}m
                              </Descriptions.Item>
                              <Descriptions.Item label="Chiều rộng" span={1}>
                                {selectedOrder.width}m
                              </Descriptions.Item>
                            </>
                          )}
                        <Descriptions.Item label="Mô tả" span={3}>
                          <div
                            className="html-preview"
                            dangerouslySetInnerHTML={{
                              __html:
                                designIdea?.description || "Không có mô tả",
                            }}
                            style={{
                              maxWidth: "100%",
                              overflow: "hidden",
                              fontSize: "15px",
                              lineHeight: "1.6",
                            }}
                          />
                        </Descriptions.Item>
                      </Descriptions>
                      <div
                        style={{ display: "flex", gap: "16px", marginTop: 16 }}
                      >
                        {designIdea?.image?.imageUrl && (
                          <img
                            src={designIdea.image.imageUrl}
                            alt={designIdea?.name || "Thiết kế"}
                            style={{
                              maxWidth: "100%",
                              maxHeight: 300,
                              objectFit: "contain",
                            }}
                          />
                        )}
                        {designIdea?.image?.image2 && (
                          <img
                            src={designIdea.image.image2}
                            alt={designIdea?.name || "Thiết kế"}
                            style={{
                              maxWidth: "100%",
                              maxHeight: 300,
                              objectFit: "contain",
                            }}
                          />
                        )}
                        {designIdea?.image?.image3 && (
                          <img
                            src={designIdea.image.image3}
                            alt={designIdea?.name || "Thiết kế"}
                            style={{
                              maxWidth: "100%",
                              maxHeight: 300,
                              objectFit: "contain",
                            }}
                          />
                        )}
                      </div>
                    </Card>
                  )}
                </>
              )}

              {/* Design Images Section */}
              {!selectedOrder.isCustom &&
                selectedOrder.status !== "Pending" && (
                  <Card
                    title={
                      <Space>
                        <BulbOutlined />
                        <span>
                          Danh sách bản vẽ thiết kế và hướng dẫn lắp đặt
                        </span>
                      </Space>
                    }
                    type="inner"
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "16px",
                        padding: "16px",
                      }}
                    >
                      {designIdea.designImage1URL && (
                        <div>
                          <Image
                            src={designIdea.designImage1URL}
                            alt="Bản vẽ thiết kế 1"
                            style={{ width: "100%", height: "auto" }}
                            preview={{
                              mask: "Phóng to",
                              maskClassName: "custom-mask",
                            }}
                          />
                          <div
                            style={{ textAlign: "center", marginTop: "8px" }}
                          >
                            <Text type="secondary">Bản vẽ thiết kế 1</Text>
                          </div>
                        </div>
                      )}
                      {designIdea.designImage2URL && (
                        <div>
                          <Image
                            src={designIdea.designImage2URL}
                            alt="Bản vẽ thiết kế 2"
                            style={{ width: "100%", height: "auto" }}
                            preview={{
                              mask: "Phóng to",
                              maskClassName: "custom-mask",
                            }}
                          />
                          <div
                            style={{ textAlign: "center", marginTop: "8px" }}
                          >
                            <Text type="secondary">Bản vẽ thiết kế 2</Text>
                          </div>
                        </div>
                      )}
                      {designIdea.designImage3URL && (
                        <div>
                          <Image
                            src={designIdea.designImage3URL}
                            alt="Bản vẽ thiết kế 3"
                            style={{ width: "100%", height: "auto" }}
                            preview={{
                              mask: "Phóng to",
                              maskClassName: "custom-mask",
                            }}
                          />
                          <div
                            style={{ textAlign: "center", marginTop: "8px" }}
                          >
                            <Text type="secondary">Bản vẽ thiết kế 3</Text>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

              {selectedOrder.isCustom && selectedOrder.status !== "Pending" && (
                <Card
                  title={
                    <Space>
                      <BulbOutlined />
                      <span>Bản vẽ phác thảo</span>
                    </Space>
                  }
                  type="inner"
                >
                  {loadingSketch ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spin tip="Đang tải bản vẽ phác thảo..." />
                    </div>
                  ) : sketchRecords &&
                    (selectedOrder.status === "ConsultingAndSketching"
                      ? sketchRecords
                      : sketchRecords.filter((record) => record.isSelected)
                    ).length > 0 ? (
                    <div>
                      {sketchRecords &&
                        (selectedOrder.status === "ConsultingAndSketching"
                          ? sketchRecords
                          : sketchRecords.filter((record) => record.isSelected)
                        ).map((record, index) => (
                          <div key={record.id} style={{ marginBottom: "24px" }}>
                            <div
                              style={{
                                marginBottom: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div>
                                <Text strong>
                                  {/* Bản vẽ phác thảo {record.phase + 1} */}
                                  {record.phase === 0
                                    ? "Ảnh mẫu của khách hàng"
                                    : `Bản vẽ phác thảo ${record.phase}`}
                                </Text>
                                <Text strong></Text>
                                <Text
                                  type="secondary"
                                  style={{ marginLeft: "8px" }}
                                >
                                  (
                                  {new Date(record.creationDate).toLocaleString(
                                    "vi-VN"
                                  )}
                                  )
                                </Text>
                              </div>

                              {record.phase !== 0 && (
                                <Button
                                  type={
                                    record.isSelected ? "primary" : "default"
                                  }
                                  onClick={() => handleSelectSketch(record.id)}
                                  disabled={record.isSelected}
                                >
                                  {record.isSelected
                                    ? "Đã chọn"
                                    : "Chọn bản vẽ này"}
                                </Button>
                              )}
                            </div>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(300px, 1fr))",
                                gap: "16px",
                                padding: "16px",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "8px",
                              }}
                            >
                              {record.image?.imageUrl && (
                                <div>
                                  <Image
                                    src={record.image.imageUrl}
                                    alt={`Bản vẽ phác thảo ${index + 1} - 1`}
                                    style={{ width: "100%", height: "auto" }}
                                    preview={{
                                      mask: "Phóng to",
                                      maskClassName: "custom-mask",
                                    }}
                                  />
                                  <div
                                    style={{
                                      textAlign: "center",
                                      marginTop: "8px",
                                    }}
                                  >
                                    <Text type="secondary">Hình ảnh 1</Text>
                                  </div>
                                </div>
                              )}
                              {record.image?.image2 && (
                                <div>
                                  <Image
                                    src={record.image.image2}
                                    alt={`Bản vẽ phác thảo ${index + 1} - 2`}
                                    style={{ width: "100%", height: "auto" }}
                                    preview={{
                                      mask: "Phóng to",
                                      maskClassName: "custom-mask",
                                    }}
                                  />
                                  <div
                                    style={{
                                      textAlign: "center",
                                      marginTop: "8px",
                                    }}
                                  >
                                    <Text type="secondary">Hình ảnh 2</Text>
                                  </div>
                                </div>
                              )}
                              {record.image?.image3 && (
                                <div>
                                  <Image
                                    src={record.image.image3}
                                    alt={`Bản vẽ phác thảo ${index + 1} - 3`}
                                    style={{ width: "100%", height: "auto" }}
                                    preview={{
                                      mask: "Phóng to",
                                      maskClassName: "custom-mask",
                                    }}
                                  />
                                  <div
                                    style={{
                                      textAlign: "center",
                                      marginTop: "8px",
                                    }}
                                  >
                                    <Text type="secondary">Hình ảnh 3</Text>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <Empty
                      description="Chưa có bản vẽ phác thảo nào"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Card>
              )}

              {selectedOrder.isCustom &&
                selectedOrder.status !== "Pending" &&
                selectedOrder.status !== "ConsultingAndSketching" &&
                selectedOrder.status !== "DeterminingDesignPrice" &&
                selectedOrder.status !== "DepositSuccessful" &&
                selectedOrder.status !== "AssignToDesigner" &&
                selectedOrder.status !== "DeterminingMaterialPrice" && (
                  <Card
                    title={
                      <Space>
                        <BulbOutlined />
                        <span>Bản vẽ chi tiết</span>
                      </Space>
                    }
                    type="inner"
                  >
                    {loadingDesign ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spin tip="Đang tải bản vẽ chi tiết..." />
                      </div>
                    ) : !designRecords ? (
                      <Empty description="Chưa có bản vẽ chi tiết nào" />
                    ) : (selectedOrder.status === "DoneDesign" ||
                      selectedOrder.status === "DeterminingMaterialPrice"
                      ? designRecords
                      : designRecords.filter((record) => record.isSelected)
                    ).length > 0 ? (
                      <div>
                        {(selectedOrder.status === "DoneDesign" ||
                          selectedOrder.status === "DeterminingMaterialPrice"
                          ? designRecords
                          : designRecords.filter((record) => record.isSelected)
                        ).map((record, index) => (
                          <div key={record.id} style={{ marginBottom: "24px" }}>
                            <div
                              style={{
                                marginBottom: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div>
                                <Text strong>
                                  Bản vẽ chi tiết {record.phase}
                                </Text>
                                <Text
                                  type="secondary"
                                  style={{ marginLeft: "8px" }}
                                >
                                  (
                                  {new Date(record.creationDate).toLocaleString(
                                    "vi-VN"
                                  )}
                                  )
                                </Text>
                              </div>
                              <Button
                                type={record.isSelected ? "primary" : "default"}
                                onClick={() => handleSelectDesign(record.id)}
                                disabled={record.isSelected}
                              >
                                {record.isSelected
                                  ? "Đã chọn"
                                  : "Chọn bản vẽ này"}
                              </Button>
                            </div>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(300px, 1fr))",
                                gap: "16px",
                                padding: "16px",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "8px",
                              }}
                            >
                              {record.image?.imageUrl && (
                                <div>
                                  <Image
                                    src={record.image.imageUrl}
                                    alt={`Bản vẽ chi tiết ${index + 1} - 1`}
                                    style={{ width: "100%", height: "auto" }}
                                    preview={{
                                      mask: "Phóng to",
                                      maskClassName: "custom-mask",
                                    }}
                                  />
                                  <div
                                    style={{
                                      textAlign: "center",
                                      marginTop: "8px",
                                    }}
                                  >
                                    <Text type="secondary">Hình ảnh 1</Text>
                                  </div>
                                </div>
                              )}
                              {record.image?.image2 && (
                                <div>
                                  <Image
                                    src={record.image.image2}
                                    alt={`Bản vẽ chi tiết ${index + 1} - 2`}
                                    style={{ width: "100%", height: "auto" }}
                                    preview={{
                                      mask: "Phóng to",
                                      maskClassName: "custom-mask",
                                    }}
                                  />
                                  <div
                                    style={{
                                      textAlign: "center",
                                      marginTop: "8px",
                                    }}
                                  >
                                    <Text type="secondary">Hình ảnh 2</Text>
                                  </div>
                                </div>
                              )}
                              {record.image?.image3 && (
                                <div>
                                  <Image
                                    src={record.image.image3}
                                    alt={`Bản vẽ chi tiết ${index + 1} - 3`}
                                    style={{ width: "100%", height: "auto" }}
                                    preview={{
                                      mask: "Phóng to",
                                      maskClassName: "custom-mask",
                                    }}
                                  />
                                  <div
                                    style={{
                                      textAlign: "center",
                                      marginTop: "8px",
                                    }}
                                  >
                                    <Text type="secondary">Hình ảnh 3</Text>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty
                        description="Chưa có bản vẽ chi tiết nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </Card>
                )}

              {/* Material Details */}
              <Card
                title={
                  <Space>
                    <ShoppingOutlined />
                    <span>Danh sách vật liệu</span>
                  </Space>
                }
                type="inner"
              >
                {selectedOrder.isCustom ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "18px",
                        fontWeight: 500,
                        display: "block",
                        padding: "24px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        textAlign: "center",
                        border: "1px dashed #d9d9d9",
                      }}
                    >
                      Danh sách hiện tại là của thiết kế mẫu, danh sách mới sẽ
                      được cập nhập sau khi Designer hoàn thành bản vẽ.
                    </Text>
                    <Table
                      columns={productColumns}
                      dataSource={selectedOrder.serviceOrderDetails}
                      pagination={false}
                      rowKey="productId"
                      summary={() => (
                        <Table.Summary fixed>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={2} />
                            <Table.Summary.Cell index={2}>
                              <Text strong>Phí vật liệu:</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3}>
                              <Text type="success" strong>
                                {formatPrice(
                                  calculateMaterialPrice(selectedOrder)
                                )}
                              </Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      )}
                    />
                    {selectedOrder.status === "DeterminingMaterialPrice" && (
                      <div style={{ marginTop: "24px" }}>
                        <Button
                          type="primary"
                          onClick={showConfirmMaterialModal}
                          style={{ width: "100%" }}
                        >
                          Xác nhận giá vật liệu và tiếp tục
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Table
                    columns={productColumns}
                    dataSource={selectedOrder.serviceOrderDetails}
                    pagination={false}
                    rowKey="productId"
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={2} />
                          <Table.Summary.Cell index={2}>
                            <Text strong>Phí vật liệu:</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3}>
                            <Text type="success" strong>
                              {formatPrice(
                                calculateMaterialPrice(selectedOrder)
                              )}
                            </Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                )}
              </Card>

              {/* Order Details */}
              <Card
                title={
                  <Space>
                    <ShoppingOutlined />
                    <span>Chi tiết đơn hàng</span>
                  </Space>
                }
                type="inner"
              >
                {selectedOrder.isCustom ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "18px",
                        fontWeight: 500,
                        display: "block",
                        padding: "24px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        textAlign: "center",
                        border: "1px dashed #d9d9d9",
                      }}
                    >
                      Giá thiết kế, danh sách vật liệu và tổng giá sẽ được chúng
                      tôi cập nhập sau khi Designer hoàn tất bản vẽ hoàn chỉnh
                    </Text>
                    <div style={{ marginTop: "24px" }}>
                      <Descriptions bordered column={1}>
                        <Descriptions.Item label="Phí thiết kế">
                          <Text type="success" strong>
                            {formatPrice(selectedOrder.designPrice)}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phí vật liệu dự kiến">
                          <Text type="success" strong>
                            {formatPrice(calculateMaterialPrice(selectedOrder))}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng thanh toán dự kiến">
                          <Text
                            type="danger"
                            strong
                            style={{ fontSize: "16px" }}
                          >
                            {formatPrice(
                              selectedOrder.designPrice +
                              calculateMaterialPrice(selectedOrder)
                            )}
                          </Text>
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Phí thiết kế">
                        <Text type="success" strong>
                          {formatPrice(selectedOrder.designPrice)}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Phí vật liệu">
                        <Text type="success" strong>
                          {formatPrice(calculateMaterialPrice(selectedOrder))}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tổng thanh toán">
                        <Text type="danger" strong style={{ fontSize: "16px" }}>
                          {formatPrice(
                            selectedOrder.designPrice +
                            calculateMaterialPrice(selectedOrder)
                          )}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Đã thanh toán">
                        <Text type="danger" strong style={{ fontSize: "16px" }}>
                          {formatPrice(
                            selectedOrder.designPrice +
                            calculateMaterialPrice(selectedOrder)
                          )}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                )}
              </Card>

              {/* Status Tracking */}
              <Card title="Trạng thái đơn hàng" type="inner">
                <StatusTracking currentStatus={selectedOrder.status} />
              </Card>

              {/* Actions */}
              <div style={{ textAlign: "right" }}>
                <Space>
                  {(showContractButton || selectedOrder?.status === "WaitDeposit") && (
                    <Space
                      direction="vertical"
                      size={8}
                      style={{ width: "100%" }}
                    >
                      <Button
                        type="primary"
                        icon={<FileTextOutlined />}
                        onClick={handleViewContract}
                        loading={contractLoading}
                        style={{ width: "100%" }}
                      >
                        Xem hợp đồng
                      </Button>
                      <div
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#f5f5f5",
                          borderRadius: "4px",
                          margin: "8px 0",
                        }}
                      >
                        <Text type="secondary">
                          {selectedOrder?.status === "WaitDeposit"
                            ? "Bạn đã đọc và đồng ý với hợp đồng 50% cho giai đoạn thiết kế chi tiết, để kí hợp đồng, vui lòng cung cấp ảnh chữ kí của bạn tại đây"
                            : "Bạn đã đọc và đồng ý với hợp đồng, để kí hợp đồng, vui lòng cung cấp ảnh chữ kí của bạn tại đây"}
                        </Text>
                      </div>

                      {!contract?.modificationDate && selectedOrder?.status === "WaitDeposit" && (
                        <>
                          <Button
                            type="primary"
                            icon={<FileTextOutlined />}
                            onClick={openSignAndPayModal}
                            style={{ width: "100%" }}
                          >
                            Ký hợp đồng
                          </Button>
                        </>
                      )}
                    </Space>
                  )}
                  {selectedOrder.status === "DeliveredSuccessfully" && (
                    <Button
                      type="primary"
                      onClick={() => {
                        Modal.confirm({
                          title: "Xác nhận hoàn thành",
                          content:
                            "Bạn có chắc chắn muốn xác nhận hoàn thành đơn hàng này?",
                          okText: "Xác nhận",
                          cancelText: "Hủy",
                          onOk: handleCompleteOrder,
                        });
                      }}
                    >
                      Xác nhận hoàn thành
                    </Button>
                  )}
                  {showPaymentButton &&
                    selectedOrder.status === "WaitDeposit" && (
                      <Button
                        danger
                        icon={<CloseOutlined />}
                        onClick={showCancelOrderModal}
                        style={{ width: "100%", marginTop: "16px" }}
                      >
                        Hủy đơn hàng
                      </Button>
                    )}
                </Space>
              </div>

              {/* Payment Section */}
              {selectedOrder.status === "DoneDesign" && (
                <Card
                  title={
                    <Space>
                      <DollarOutlined />
                      <span>Thanh toán</span>
                    </Space>
                  }
                  type="inner"
                >
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "18px",
                        fontWeight: 500,
                        display: "block",
                        padding: "24px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        textAlign: "center",
                        border: "1px dashed #d9d9d9",
                      }}
                    >
                      Thiết kế đã hoàn thành, bạn hãy thanh toán 50% phí thiết
                      kế còn lại và 100% phí vật liệu
                    </Text>
                    <div style={{ marginTop: "24px" }}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Button
                          type="primary"
                          onClick={showPaymentRemainModal}
                          loading={paymentLoading}
                          style={{ width: "100%" }}
                        >
                          Thanh toán phần còn lại
                        </Button>
                        <Button
                          danger
                          onClick={showStopOrderModal}
                          style={{ width: "100%" }}
                        >
                          Dừng đơn hàng và thanh toán 50% phí thiết kế còn lại
                        </Button>
                      </Space>
                    </div>
                  </div>
                </Card>
              )}
            </Space>

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
              <iframe
                src={contract?.description}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  flex: 1,
                }}
                title="Contract PDF"
              />
            </Modal>

            {/* Sign and Pay Modal */}
            <Modal
              title="Ký hợp đồng và thanh toán"
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
                >
                  Xác nhận ký hợp đồng và thanh toán
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
                <div style={{ marginTop: "10px" }}>
                  {previewImage ? (
                    <div>
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
                      <div style={{ marginTop: "10px" }}>
                        <Button
                          type="link"
                          onClick={() => setPreviewImage(null)}
                          style={{ padding: 0 }}
                        >
                          Xóa và tải lên lại
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = e.target.files[0];
                          if (file) {
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
                <ul style={{ marginTop: "10px" }}>
                  <li>Phí thiết kế: {formatPrice(selectedOrder?.designPrice)}</li>
                  <li>Thanh toán đợt này (50%): {formatPrice(selectedOrder?.designPrice * 0.5)}</li>
                </ul>
              </div>

              <div style={{ backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "4px" }}>
                <Text type="secondary">
                  Bằng việc nhấn nút "Xác nhận", bạn đồng ý với các điều khoản trong hợp đồng và đồng ý thanh toán 50% phí thiết kế.
                </Text>
              </div>
            </Modal>

            {/* Material Confirmation Modal */}
            <Modal
              title="Xác nhận giá vật liệu"
              open={isConfirmMaterialModalVisible}
              onOk={handleConfirmMaterialPrice}
              onCancel={handleCancelMaterialConfirm}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <p>Bạn có chắc chắn muốn xác nhận giá vật liệu và tiếp tục?</p>
              <p>
                Tổng giá vật liệu:{" "}
                {formatPrice(calculateMaterialPrice(selectedOrder))}
              </p>
            </Modal>

            {/* Payment Remain Confirmation Modal */}
            <Modal
              title="Xác nhận thanh toán"
              open={isPaymentRemainModalVisible}
              onOk={handlePaymentRemain}
              onCancel={handleCancelPaymentRemain}
              okText="Xác nhận"
              cancelText="Hủy"
              confirmLoading={paymentLoading}
            >
              <p>Bạn có chắc chắn muốn thanh toán phần còn lại?</p>
              <p>
                Phí thiết kế còn lại (50%):{" "}
                {formatPrice(selectedOrder.designPrice * 0.5)}
              </p>
              <p>
                Phí vật liệu (100%):{" "}
                {formatPrice(calculateMaterialPrice(selectedOrder))}
              </p>
              <p>
                <Text strong>
                  Tổng thanh toán:{" "}
                  {formatPrice(
                    selectedOrder.designPrice * 0.5 +
                    calculateMaterialPrice(selectedOrder)
                  )}
                </Text>
              </p>
            </Modal>

            {/* Cancel Order Confirmation Modal */}
            <Modal
              title="Xác nhận hủy đơn hàng"
              open={isCancelOrderModalVisible}
              onOk={handleCancelOrder}
              onCancel={handleCancelOrderConfirm}
              okText="Xác nhận"
              cancelText="Đóng"
            >
              <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
              <p>Lưu ý: Hành động này không thể hoàn tác.</p>
            </Modal>

            {/* Stop Order Confirmation Modal */}
            <Modal
              title="Xác nhận dừng đơn hàng"
              open={isStopOrderModalVisible}
              onOk={handleStopOrder}
              onCancel={handleCancelStopOrder}
              okText="Xác nhận"
              cancelText="Hủy"
              confirmLoading={paymentLoading}
            >
              <p>Bạn có chắc chắn muốn dừng đơn hàng này?</p>
              <p>
                Phí thiết kế còn lại (50%):{" "}
                {formatPrice(selectedOrder.designPrice * 0.5)}
              </p>
              <p>
                <Text type="warning">
                  Lưu ý: Khi dừng đơn hàng, bạn sẽ phải thanh toán 50% phí thiết
                  kế còn lại và không thể tiếp tục đơn hàng này.
                </Text>
              </p>
            </Modal>

            {/* Payment Confirmation Modal as fallback */}
            <Modal
              title="Xác nhận thanh toán"
              open={isPaymentModalVisible}
              onOk={handlePayment}
              onCancel={handleCancelPayment}
              okText="Xác nhận"
              cancelText="Hủy"
              confirmLoading={paymentLoading}
            >
              <p>Bạn có chắc chắn muốn thanh toán 50% phí thiết kế?</p>
              <p>
                Số tiền thanh toán:{" "}
                {formatPrice(selectedOrder?.designPrice * 0.5)}
              </p>
            </Modal>

            {/* Confirm sketch selection Modal */}
            <Modal
              title="Xác nhận chọn bản vẽ"
              open={isConfirmModalVisible}
              onOk={handleConfirmSelection}
              onCancel={handleCancelSelection}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <p>Bạn có chắc chắn muốn chọn bản vẽ này không?</p>
              <p>
                Lưu ý: Khi chọn bản vẽ mới, bản vẽ đã chọn trước đó sẽ bị hủy.
              </p>
            </Modal>

            {/* Design Confirmation Modal */}
            <Modal
              title="Xác nhận chọn bản vẽ chi tiết"
              open={isConfirmDesignModalVisible}
              onOk={handleConfirmDesignSelection}
              onCancel={handleCancelDesignSelection}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <p>Bạn có chắc chắn muốn chọn bản vẽ chi tiết này không?</p>
              <p>
                Lưu ý: Khi chọn bản vẽ mới, bản vẽ đã chọn trước đó sẽ bị hủy.
              </p>
            </Modal>
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default OrderHistoryDetail;
