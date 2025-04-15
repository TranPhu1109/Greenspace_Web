import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Typography,
  Spin,
  Alert,
  Card,
  Row,
  Col,
  Tag,
  Layout,
  Button,
  Breadcrumb,
  message,
  Modal,
  Input,
  Descriptions,
  Space,
  Image,
  Divider
} from "antd";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  HistoryOutlined,
  ShoppingOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";

// Import custom components
import CustomerInfo from "./components/OrderInfo/CustomerInfo";
import DesignDetails from "./components/DesignInfo/DesignDetails";
import RecordSketch from "./components/RecordSketch/RecordSketch";
import RecordDesign from "./components/RecordDesign/RecordDesign";
import ContractSection from "./components/ContractSection/ContractSection";
import OrderTimeline from "./components/Timeline/OrderTimeline";
import ProductsList from "./components/ProductsList/ProductsList";
import OriginalImages from "./components/OriginalImages/OriginalImages";

// Import stores
import useServiceOrderStore from "@/stores/useServiceOrderStore";
import useProductStore from "@/stores/useProductStore";
import useRecordStore from "@/stores/useRecordStore";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useContractStore from "@/stores/useContractStore";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import api from "@/api/api";

// Import utils
import { 
  getStatusText, 
  getStatusColor,
  showOnlyPhase0Statuses,
  showAllPhasesStatuses,
  showDesignRecordsStatuses,
  contractVisibleStatuses,
  contractVisibleStatusCodes,
  finalMaterialPriceStatuses,
  approvedDesignPriceStatuses
} from "./utils/StatusHelper";
import { formatPrice } from "./utils/PriceFormatter";

// Import components
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

const ServiceOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateStatus, selectedOrder, getDesignOrderById } = useDesignOrderStore();
  const {
    loading,
    error,
    getServiceOrderById,
    updateServiceForCus,
    cancelServiceOrder,
    updateServiceOrderStatus,
    updateTaskOrder
  } = useServiceOrderStore();
  const { getProductById, isLoading: productLoading } = useProductStore();
  const {
    sketchRecords,
    designRecords,
    getRecordSketch,
    getRecordDesign,
    confirmRecord,
    confirmDesignRecord,
    isLoading: recordLoading,
    error: recordError,
  } = useRecordStore();
  const {
    getContractByServiceOrder,
    contract,
    loading: contractLoading,
    signContract,
    generateContract,
  } = useContractStore();
  const { uploadImages, progress } = useCloudinaryStorage();
  
  // Order state and flags
  const [order, setOrder] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [showContractButton, setShowContractButton] = useState(false);
  const [showPaymentButton, setShowPaymentButton] = useState(false);
  
  // Loading and submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDesignRecords, setLoadingDesignRecords] = useState(false);
  
  
  // Form input states
  const [revisionNote, setRevisionNote] = useState("");
  const [redesignNote, setRedesignNote] = useState("");
  const [cancelDesignNote, setCancelDesignNote] = useState("");
  
  // Selection states
  const [selectedSketchId, setSelectedSketchId] = useState(null);
  const [selectedDesignId, setSelectedDesignId] = useState(null);

  const componentId = useRef("service-order");

  useEffect(() => {
    // Định nghĩa hàm refreshOrderData ở cấp cao nhất của window để các component con có thể gọi
    window.refreshOrderData = async (orderId) => {
      try {
        console.log("refreshOrderData called for order:", orderId);
        await refreshAllData(orderId);
      } catch (error) {
        console.error("Error in global refreshOrderData:", error);
        message.error("Không thể tải lại dữ liệu: " + error.message);
      }
    };
    
    // Định nghĩa hàm softUpdateOrderData để cập nhật dữ liệu mà không làm refresh toàn component
    window.softUpdateOrderData = (updatedOrder) => {
      try {
        console.log("softUpdateOrderData called with:", updatedOrder);
        
        // Chỉ cập nhật các state cần thiết mà không gọi API lại
        if (updatedOrder) {
          setOrder(updatedOrder);
          // Đồng thời cập nhật selectedOrder trong store để các component khác đồng bộ
          useServiceOrderStore.getState().selectedOrder = updatedOrder;
        }
      } catch (error) {
        console.error("Error in softUpdateOrderData:", error);
        message.error("Không thể cập nhật dữ liệu: " + error.message);
      }
    };

    // Cleanup function để xóa hàm khỏi window khi component unmount
    return () => {
      delete window.refreshOrderData;
      delete window.softUpdateOrderData;
    };
  }, []);  // Empty dependency array means this runs once on mount

  useEffect(() => {
    getServiceOrderById(id);
  }, []);

  // Calculate maxPhase safely
  const maxPhase = sketchRecords && sketchRecords.length > 0
    ? Math.max(...sketchRecords.map(r => r.phase), -1) // Use -1 if empty
    : -1;

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
        if (
          orderData.serviceOrderDetails &&
          orderData.serviceOrderDetails.length > 0
        ) {
          setFetchingProducts(true);
          const productPromises = orderData.serviceOrderDetails.map((detail) =>
            getProductById(detail.productId)
          );
          const productResults = await Promise.all(productPromises);
          const detailsMap = {};
          productResults.forEach((product, index) => {
            if (product) {
              detailsMap[orderData.serviceOrderDetails[index].productId] =
                product;
            }
          });
          setProductDetailsMap(detailsMap);
          setFetchingProducts(false);
        }

        // Always fetch sketch records to show at least phase 0 (original images)
          console.log(`Fetching sketches for order ${id} with status ${orderData.status}`);
          await getRecordSketch(id); // Fetch sketches
        
        // Always fetch design records - let the component decide whether to show them
        console.log(`Fetching design records for order ${id}`);
          setLoadingDesignRecords(true);
          try {
            await getRecordDesign(id);
            console.log("Design records fetched successfully");
          } catch (designError) {
            console.error("Error fetching design records:", designError);
          } finally {
            setLoadingDesignRecords(false);
        }

      } catch (err) {
        console.error(
          "Error fetching order details, products, or sketches:",
          err
        );
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
  }, [id, getServiceOrderById, getProductById, getRecordSketch, getRecordDesign]);

  // Update useEffect to fetch contract correctly
  useEffect(() => {
    const fetchContract = async () => {
      // Check if current status should show contract (either by name or code)
      const shouldShowContract =
        contractVisibleStatuses.includes(selectedOrder?.status) ||
        contractVisibleStatusCodes.includes(selectedOrder?.status);

      console.log(
        "Contract fetch check - Status:",
        selectedOrder?.status,
        "Should show:",
        shouldShowContract
      );

      if (shouldShowContract) {
        console.log(
          "Status requires contract visibility, checking for contract..."
        );
        try {
          // First try to get existing contract
          const contractData = await getContractByServiceOrder(
            selectedOrder.id
          );
          console.log("Contract found:", contractData?.id);
          setShowContractButton(true);
        } catch (error) {
          console.error("Error fetching contract:", error);
          // If no contract exists, generate a new one if in WaitDeposit status
          if (
            selectedOrder?.status === "WaitDeposit" ||
            selectedOrder?.status === 21
          ) {
            try {
              console.log(
                "Generating new contract for order:",
                selectedOrder.id
              );
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
            console.error(
              "Contract not found and not in WaitDeposit status to generate"
            );
            setShowContractButton(false);
          }
        }
      } else {
        console.log(
          "Status does not require contract visibility:",
          selectedOrder?.status
        );
        setShowContractButton(false);
      }
    };

    // Call fetchContract when selectedOrder status changes or selectedOrder.id changes
    if (selectedOrder?.id) {
      console.log(
        "Triggering contract fetch for status:",
        selectedOrder.status
      );
      fetchContract();
    }
  }, [
    selectedOrder?.status,
    selectedOrder?.id,
    getContractByServiceOrder,
    generateContract,
  ]);

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
  }, [contract, selectedOrder?.status, showContractButton]);

  // Update the handleConfirmSketch function to use the new confirmation modal approach
  const handleConfirmSketch = (recordId) => {
    setSelectedSketchId(recordId);
    setIsConfirmModalVisible(true);
  };

  // New function to confirm sketch selection
  const handleConfirmSelection = async () => {
    try {
      setLocalError(null);
      setIsSubmitting(true);
      
      // First step: Confirm the sketch selection
      await confirmRecord(selectedSketchId);
      message.success("Đã chọn bản phác thảo thành công!");
      setIsConfirmModalVisible(false);

      // Second step: Update status to WaitDeposit (status code 21)
      try {
        await updateStatus(id, 21);
        message.success('Đã cập nhật trạng thái đơn hàng');
        
        // Use refreshAllData instead of multiple separate fetch calls
        await refreshAllData(id);
        
        // Force UI update to reflect the new status and show contract button
        setTimeout(() => {
          setShowContractButton(true);
        }, 500);
      } catch (statusError) {
        console.error("Error updating status:", statusError);
        message.error(
          "Không thể cập nhật trạng thái đơn hàng: " + statusError.message
        );
      }
    } catch (err) {
      console.error("Error confirming sketch:", err);
      message.error('Không thể chọn bản phác thảo: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to cancel sketch selection
  const handleCancelSelection = () => {
    setSelectedSketchId(null);
    setIsConfirmModalVisible(false);
  };

  // Add this comprehensive refresh function
  const refreshAllData = async (orderId) => {
    try {
      console.log("Refreshing all data for order:", orderId);
      setLocalError(null);
      
      // 1. Refresh the service order data
      const refreshedOrder = await getServiceOrderById(orderId);
      setOrder(refreshedOrder);
      
      // 2. Also refresh the design order data
      await getDesignOrderById(orderId, componentId.current);
      
      // 3. Always refresh sketch records (at least phase 0)
      await getRecordSketch(orderId);
      
      // 4. Always refresh design records - let the component decide whether to display them
      setLoadingDesignRecords(true);
      try {
        await getRecordDesign(orderId);
      } catch (designError) {
        console.error("Error refreshing design records:", designError);
      } finally {
        setLoadingDesignRecords(false);
      }
      
      // 5. Check and refresh contract data if status indicates it should be visible
      const shouldShowContract = 
        contractVisibleStatuses.includes(refreshedOrder?.status) || 
        contractVisibleStatusCodes.includes(refreshedOrder?.status);
      
      if (shouldShowContract) {
        try {
          await getContractByServiceOrder(orderId);
          setShowContractButton(true);
        } catch (contractError) {
          console.error("Error refreshing contract:", contractError);
          // If in WaitDeposit status but no contract, try generating one
          if (refreshedOrder?.status === "WaitDeposit" || refreshedOrder?.status === 21) {
            try {
              await generateContract({
                userId: refreshedOrder.userId,
                serviceOrderId: refreshedOrder.id,
                userName: refreshedOrder.userName,
                email: refreshedOrder.email,
                phone: refreshedOrder.cusPhone,
                address: refreshedOrder.address,
                designPrice: refreshedOrder.designPrice,
              });
              
              await getContractByServiceOrder(orderId);
              setShowContractButton(true);
            } catch (genError) {
              console.error("Error generating contract during refresh:", genError);
            }
          }
        }
      }
      
      // 6. Refresh product details if needed
      if (refreshedOrder?.serviceOrderDetails && refreshedOrder.serviceOrderDetails.length > 0) {
        setFetchingProducts(true);
        try {
          const productPromises = refreshedOrder.serviceOrderDetails.map(detail =>
            getProductById(detail.productId)
          );
          const productResults = await Promise.all(productPromises);
          const detailsMap = {};
          productResults.forEach((product, index) => {
            if (product) {
              detailsMap[refreshedOrder.serviceOrderDetails[index].productId] = product;
            }
          });
          setProductDetailsMap(detailsMap);
        } catch (productsError) {
          console.error("Error refreshing products:", productsError);
        } finally {
          setFetchingProducts(false);
        }
      }
      
      console.log("Refresh completed for order:", orderId);
      return refreshedOrder;
      } catch (error) {
      console.error("Error in refreshAllData:", error);
      message.error("Không thể cập nhật dữ liệu: " + error.message);
      return null;
    }
  };

  // Update handleCompleteOrder to use refreshAllData
  const handleCompleteOrder = async () => {
    try {
      const response = await updateStatus(
        order.id,
        "CompleteOrder",
        order.deliveryCode
      );
      
      if (response === "Update Successfully!") {
        message.success("Đã xác nhận hoàn thành đơn hàng");
        
        // Use refreshAllData instead of multiple separate fetch calls
        await refreshAllData(order.id);
      } else {
        message.error("Cập nhật trạng thái không thành công");
      }
    } catch (error) {
      console.error("Error completing order:", error);
      message.error("Không thể xác nhận hoàn thành đơn hàng");
    }
  };

  // --- Revision Modal Handlers ---
  const handleOpenRevisionModal = () => {
    setRevisionNote(""); // Clear previous note
    setIsRevisionModalVisible(true);
  };

  const handleCloseRevisionModal = () => {
    setIsRevisionModalVisible(false);
  };

  // Update handleSubmitRevision to use refreshAllData
  const handleSubmitRevision = async () => {
    if (!revisionNote.trim()) {
      message.warning("Vui lòng nhập lý do yêu cầu phác thảo lại.");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      serviceType: 1,
      status: 19, // ReConsultingAndSketching
      report: revisionNote, // Add note to report field
    };
    try {
      // Use updateServiceForCus from useServiceOrderStore
      await updateServiceForCus(id, payload);
      message.success("Đã gửi yêu cầu phác thảo lại.");
      setIsRevisionModalVisible(false);
      
      // Use refreshAllData instead of just fetching order
      await refreshAllData(id);
    } catch (err) {
      message.error("Gửi yêu cầu thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- Redesign Modal Handlers ---
  const handleOpenRedesignModal = () => {
    setRedesignNote(""); // Clear previous note
    setIsRedesignModalVisible(true);
  };

  const handleCloseRedesignModal = () => {
    setIsRedesignModalVisible(false);
  };

  // Update handleSubmitRedesign to use refreshAllData
  const handleSubmitRedesign = async () => {
    if (!redesignNote.trim()) {
      message.warning("Vui lòng nhập lý do yêu cầu thiết kế lại.");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      serviceType: 1,
      status: 20, // ReDesign
      report: redesignNote // Add note to report field
    };
    try {
      // Use updateServiceForCus from useServiceOrderStore
      await updateServiceForCus(id, payload);
      message.success("Đã gửi yêu cầu thiết kế lại.");
      setIsRedesignModalVisible(false);
      
      // Use refreshAllData instead of multiple separate fetch calls
      await refreshAllData(id);
    } catch (err) {
      message.error("Gửi yêu cầu thiết kế lại thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Cancel Order Handler ---
  const handleCancelOrder = async () => {
    setIsSubmitting(true);
    // No need for payload, cancelServiceOrder handles the status update
    try {
      // Use cancelServiceOrder from useServiceOrderStore
      await cancelServiceOrder(id);
      message.success("Đã hủy đơn hàng thành công.");
      
      // Use refreshAllData
      await refreshAllData(id);
    } catch (err) {
      message.error(
        "Hủy đơn hàng thất bại: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // New function to handle design record confirmation
  const handleConfirmDesign = (recordId) => {
    setSelectedDesignId(recordId);
    setIsConfirmDesignModalVisible(true);
  };
  
  // Update handleDesignSelection to use refreshAllData
  const handleDesignSelection = async () => {
    try {
      setIsSubmitting(true);
      
      // First step: Confirm the design selection
      await confirmDesignRecord(selectedDesignId);
      message.success('Đã chọn bản thiết kế chi tiết thành công!');
      setIsConfirmDesignModalVisible(false);
      
      // Second step: Update status to DoneDesign (status code 6)
      try {
        await updateStatus(id, 6);
        message.success('Đã cập nhật trạng thái đơn hàng');
        
        // Use refreshAllData
        await refreshAllData(id);
      } catch (statusError) {
        console.error("Error updating status after design selection:", statusError);
        message.error('Không thể cập nhật trạng thái đơn hàng: ' + statusError.message);
      }
    } catch (err) {
      console.error("Error confirming design:", err);
      message.error('Không thể chọn bản thiết kế: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to cancel design selection
  const handleCancelDesignSelection = () => {
    setSelectedDesignId(null);
    setIsConfirmDesignModalVisible(false);
  };
  
  // Update handleOpenCancelWithFeeModal to use refreshAllData
  const handleOpenCancelWithFeeModal = () => {
    setCancelDesignNote("");
    setIsCancelWithFeeModalVisible(true);
  };
  
  // Update handleCancelWithFee to use refreshAllData
  const handleCancelWithFee = async () => {
    if (!cancelDesignNote.trim()) {
      message.warning("Vui lòng nhập lý do hủy đơn hàng.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Calculate 50% of the design price
      const cancelFee = order?.designPrice ? order.designPrice * 0.5 : 0;
      
      // Handle payment for cancellation fee
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

        // Make payment for cancellation fee
        const response = await api.post("/api/bill", {
          walletId: walletId,
          serviceOrderId: order.id,
          amount: cancelFee,
          description: `Thanh toán 50% phí thiết kế còn lại cho việc hủy đơn hàng #${order.id.slice(0, 8)}`,
        });

        if (response.data) {
          // Update order status to cancelled
          const payload = {
            serviceType: 1,
            status: 14, // OrderCancelled
            report: `Hủy sau khi xem 3 bản thiết kế: ${cancelDesignNote}`
          };
          
          await updateServiceForCus(id, payload);
          message.success("Đã hủy đơn hàng và thanh toán phí hủy thành công.");
          setIsCancelWithFeeModalVisible(false);
          
          // Use refreshAllData
          await refreshAllData(id);
        }
      } catch (paymentError) {
        console.error("Payment error:", paymentError);
        throw new Error("Thanh toán phí hủy thất bại: " + (paymentError.response?.data?.error || paymentError.message));
      }
    } catch (err) {
      message.error("Hủy đơn hàng thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for making final payment in DoneDesign status
  const handleOpenPaymentModal = () => {
    setIsPaymentModalVisible(true);
  };
  
  // Update handleFinalPayment to use refreshAllData
  const handleFinalPayment = async () => {
    if (!order) {
      message.error("Không tìm thấy thông tin đơn hàng. Vui lòng làm mới trang.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Calculate remaining payment amount (50% of design price + material price)
      const remainingDesignFee = order.designPrice * 0.5; // 50% of design price
      const materialPrice = order.materialPrice || 0;
      const totalPayment = remainingDesignFee + materialPrice;
      
      // Handle payment for final payment
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

        // Make payment
        const response = await api.post("/api/bill", {
          walletId: walletId,
          serviceOrderId: order.id,
          amount: totalPayment,
          description: `Thanh toán 50% phí thiết kế còn lại và giá vật liệu cho đơn hàng #${order.id.slice(0, 8)}`,
        });

        if (response.data) {
          // Update order status to PaymentSuccess (7)
          await updateStatus(id, 7);
          message.success("Thanh toán thành công! Đơn hàng của bạn đang được xử lý.");
          setIsPaymentModalVisible(false);
          
          // Use refreshAllData
          await refreshAllData(id);
        }
      } catch (paymentError) {
        console.error("Payment error:", paymentError);
        throw new Error("Thanh toán thất bại: " + (paymentError.response?.data?.error || paymentError.message));
      }
    } catch (err) {
      message.error("Thanh toán thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main content render
  return (
    <Layout>
      <Header />
      <Content>
        <div
          className="container mx-auto px-4 py-8"
          style={{ marginTop: "200px" }}
        >
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/Home">
                    <Space>
                      <HomeOutlined style={{ fontSize: "18px" }} />
                      <span style={{ fontSize: "16px" }}>Trang chủ</span>
                    </Space>
                  </Link>
                ),
              },
              {
                title: (
                  <Link to="/history-booking-services">
                    <Space>
                      <HistoryOutlined style={{ fontSize: "18px" }} />
                      <span style={{ fontSize: "16px" }}>
                        Lịch sử đơn đặt thiết kế
                      </span>
                    </Space>
                  </Link>
                ),
              },
              {
                title: (
                  <Space>
                    <ShoppingOutlined style={{ fontSize: "18px" }} />
                    <span style={{ fontSize: "16px" }}>
                      Chi tiết đơn hàng #{id}
                    </span>
                  </Space>
                ),
              },
            ]}
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          />
          
          <Card
            className="shadow-md mb-6"
            style={{
              marginBottom: "16px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
            }}
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <Button
                  type="primary"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/history-booking-services")}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  Quay lại
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                  Đơn hàng <span style={{ color: "#4caf50" }}>#{id}</span>
                </Title>
              </div>
            }
            extra={
              <Tag color={getStatusColor(order?.status)} size="large">
                {getStatusText(order?.status)}
              </Tag>
            }
          >
            {/* Customer and Design Information */}
            <Row gutter={[24, 24]} style={{ marginBottom: '15px' }}>
              <Col xs={24} md={12}>
                <CustomerInfo order={order} />
              </Col>

              <Col xs={24} md={12}>
                <DesignDetails 
                  order={order} 
                  formatPrice={formatPrice} 
                  handleCompleteOrder={handleCompleteOrder} 
                  approvedDesignPriceStatuses={approvedDesignPriceStatuses}
                  finalMaterialPriceStatuses={finalMaterialPriceStatuses}
                  updateStatus={updateStatus}
                  getServiceOrderById={getServiceOrderById}
                  api={api}
                />
              </Col>
            </Row>

            {/* Sketch Records Component - always show at least phase 0 */}
            {sketchRecords && sketchRecords.length > 0 && (
              <RecordSketch 
                order={order}
                sketchRecords={sketchRecords}
                recordLoading={recordLoading}
                maxPhase={maxPhase}
                isSubmitting={isSubmitting}
                updateServiceForCus={updateServiceForCus}
                updateStatus={updateStatus}
                getServiceOrderById={getServiceOrderById}
                confirmRecord={confirmRecord}
                getRecordSketch={getRecordSketch}
                updateServiceOrderStatus={updateServiceOrderStatus}
              />
            )}
            
            {/* Show original images from order only if no sketch records exist and in early stages */}
            {(!sketchRecords || sketchRecords.length === 0) && order?.image && 
             (order.status === 'Pending' || order.status === 'ConsultingAndSketching' || 
              order.status === 0 || order.status === 1) && (
              <OriginalImages order={order} recordLoading={recordLoading} />
            )}

            {/* Design Records Component - component tự quyết định khi nào nên hiển thị */}
              <RecordDesign 
                order={order}
                designRecords={designRecords}
                loadingDesignRecords={loadingDesignRecords}
                isSubmitting={isSubmitting}
                confirmDesignRecord={confirmDesignRecord}
                updateStatus={updateStatus}
                getServiceOrderById={getServiceOrderById}
                getRecordDesign={getRecordDesign}
                updateServiceForCus={updateServiceForCus}
                api={api}
                formatPrice={formatPrice}
              sketchRecords={sketchRecords}
              updateTaskOrder={updateTaskOrder}
              />

            {/* Description Section */}
            {order?.description && (
              <Card
                title={
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#4caf50",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FileTextOutlined />
                    Mô tả
                  </span>
                }
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  marginBottom: "24px",
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: order.description,
                  }}
                  style={{
                    fontSize: "15px",
                    maxWidth: "100%",
                    overflow: "hidden",
                  }}
                />
              </Card>
            )}

            {/* Products List Component */}
            {order?.serviceOrderDetails && order.serviceOrderDetails.length > 0 && (
              <ProductsList 
                order={order}
                productDetailsMap={productDetailsMap}
                fetchingProducts={fetchingProducts}
                productLoading={productLoading}
                formatPrice={formatPrice}
                finalMaterialPriceStatuses={finalMaterialPriceStatuses}
              />
            )}

            {/* Order Timeline Component */}
            <OrderTimeline 
              order={order}
              getStatusText={getStatusText}
              getStatusColor={getStatusColor}
            />

            {/* Contract Section */}
            {(showContractButton || contractVisibleStatuses.includes(order?.status) || 
              contractVisibleStatusCodes.includes(order?.status) || 
              contractVisibleStatusCodes.includes(selectedOrder?.status) || 
              contractVisibleStatuses.includes(selectedOrder?.status)) && (
              <ContractSection 
                contract={contract}
                selectedOrder={selectedOrder || order}
                contractLoading={contractLoading}
                getContractByServiceOrder={getContractByServiceOrder}
                contractVisibleStatuses={contractVisibleStatuses}
                contractVisibleStatusCodes={contractVisibleStatusCodes}
                showContractButton={showContractButton}
                showPaymentButton={showPaymentButton}
                uploadImages={uploadImages}
                signContract={signContract}
                updateStatus={updateStatus}
                formatPrice={formatPrice}
                api={api}
                generateContract={generateContract}
                refreshAllData={refreshAllData}
                updateTaskOrder={updateTaskOrder}
                getServiceOrderById={getServiceOrderById}
              />
            )}
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default ServiceOrderDetail;
