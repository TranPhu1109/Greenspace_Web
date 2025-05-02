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
  contractVisibleStatuses,
  contractVisibleStatusCodes,
  finalMaterialPriceStatuses,
  approvedDesignPriceStatuses
} from "./utils/StatusHelper";
import { formatPrice } from "./utils/PriceFormatter";

// Import components
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import usePercentageStore from "@/stores/usePercentageStore";

const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

const ServiceOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateStatus, selectedOrder, getDesignOrderById } = useDesignOrderStore();
  const {
    getServiceOrderById,
    updateServiceForCus,
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
  } = useRecordStore();
  const {
    getContractByServiceOrder,
    contract,
    loading: contractLoading,
    signContract,
    generateContract,
  } = useContractStore();
  const { data, fetchPercentage } = usePercentageStore();
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

  const componentId = useRef("service-order");

  useEffect(() => {
    // Define refreshOrderData at the highest level of window so child components can call it
    window.refreshOrderData = async (orderId) => {
      try {
        console.log("refreshOrderData called for order:", orderId || id);
        // Use the passed orderId or fall back to the component's id
        const orderIdToRefresh = orderId || id;

        // Call the comprehensive refresh function
        await refreshAllData(orderIdToRefresh);

      } catch (error) {
        message.error({
          content: "Không thể tải lại dữ liệu: " + error.message,
          key: "refreshData"
        });
      }
    };

    // Define softUpdateOrderData to update data without refreshing the whole component
    window.softUpdateOrderData = (updatedOrder) => {
      try {
        console.log("softUpdateOrderData called with:", updatedOrder);

        // Only update necessary states without calling API again
        if (updatedOrder) {
          setOrder(updatedOrder);
          // Also update selectedOrder in the store to keep other components in sync
          useServiceOrderStore.getState().selectedOrder = updatedOrder;
        }
      } catch (error) {
        console.error("Error in softUpdateOrderData:", error);
        message.error("Không thể cập nhật dữ liệu: " + error.message);
      }
    };

    // Make store instances available to components for direct updates
    window.useRecordStore = useRecordStore;
    window.useServiceOrderStore = useServiceOrderStore;

    // Add a new silent refresh function for smoother updates
    window.silentRefreshData = async (orderId, options = {}) => {
      try {
        const orderIdToRefresh = orderId || id;
        console.log("silentRefreshData called for order:", orderIdToRefresh);

        // Default options
        const defaultOptions = {
          refreshOrder: true,
          refreshSketch: true,
          refreshDesign: true,
          refreshContract: true,
          refreshProducts: true,
          batchUpdates: true, // Wait until all data is fetched before updating state
          showLoading: false,
          showSuccess: false,
          quietMode: true, // Don't update state if data hasn't changed
        };

        // Merge default options with provided options
        const settings = { ...defaultOptions, ...options };

        // Set up promises array for all data we need to fetch
        const promises = [];
        const results = {};

        // Add order data promise if needed
        if (settings.refreshOrder) {
          const orderPromise = getServiceOrderById(orderIdToRefresh)
            .catch(err => {
              console.warn("Error fetching order data:", err);
              return null;
            });
          promises.push(orderPromise);

          // Also get design order data if refreshing order
          const designOrderPromise = getDesignOrderById(orderIdToRefresh, componentId.current)
            .catch(err => {
              console.warn("Error fetching design order data:", err);
              return null;
            });
          promises.push(designOrderPromise);
        }

        // Add sketch records promise if needed
        if (settings.refreshSketch) {
          const sketchPromise = getRecordSketch(orderIdToRefresh)
            .catch(err => {
              if (err.response?.status !== 404) {
                console.warn("Error fetching sketch records:", err);
              }
              return null;
            });
          promises.push(sketchPromise);
        }

        // Add design records promise if needed
        if (settings.refreshDesign) {
          const designPromise = getRecordDesign(orderIdToRefresh)
            .catch(err => {
              if (err.response?.status !== 404) {
                console.warn("Error fetching design records:", err);
              }
              return null;
            });
          promises.push(designPromise);
        }

        // Fetch contract if needed
        if (settings.refreshContract) {
          // First check if we need to refresh contract based on order status
          const currentOrder = order || useServiceOrderStore.getState().selectedOrder;
          const shouldShowContract =
            contractVisibleStatuses.includes(currentOrder?.status) ||
            contractVisibleStatusCodes.includes(currentOrder?.status);

          if (shouldShowContract) {
            const contractPromise = getContractByServiceOrder(orderIdToRefresh)
              .then(() => {
                results.contractFound = true;
              })
              .catch(async (err) => {
                // Try to generate contract if in WaitDeposit status
                if (currentOrder?.status === "WaitDeposit" || currentOrder?.status === 21) {
                  try {
                    await generateContract({
                      userId: currentOrder.userId,
                      serviceOrderId: currentOrder.id,
                      userName: currentOrder.userName,
                      email: currentOrder.email,
                      phone: currentOrder.cusPhone,
                      address: currentOrder.address,
                      designPrice: currentOrder.designPrice,
                    });
                    await getContractByServiceOrder(orderIdToRefresh);
                    results.contractGenerated = true;
                  } catch (genError) {
                    console.warn("Error generating contract:", genError);
                  }
                }
                return null;
              });
            promises.push(contractPromise);
          }
        }

        // Execute all promises in parallel
        const fetchResults = await Promise.allSettled(promises);

        // Process results and update state in a controlled way
        let updatedOrder = null;
        let shouldUpdateUI = false;

        // Find the order result if it exists
        if (settings.refreshOrder && fetchResults[0]?.status === 'fulfilled' && fetchResults[0]?.value) {
          updatedOrder = fetchResults[0].value;

          // Check if order has actually changed
          const currentOrder = order || useServiceOrderStore.getState().selectedOrder;
          if (!settings.quietMode || (
            currentOrder && (
              currentOrder.status !== updatedOrder.status ||
              currentOrder.designPrice !== updatedOrder.designPrice ||
              currentOrder.updatedAt !== updatedOrder.updatedAt
            )
          )) {
            shouldUpdateUI = true;
          }

          // Update product details if requested and order has details
          if (settings.refreshProducts && updatedOrder.serviceOrderDetails?.length > 0) {
            const productPromises = updatedOrder.serviceOrderDetails.map(detail =>
              getProductById(detail.productId).catch(() => null)
            );

            const productResults = await Promise.allSettled(productPromises);
            const detailsMap = {};

            productResults.forEach((result, index) => {
              if (result.status === 'fulfilled' && result.value) {
                detailsMap[updatedOrder.serviceOrderDetails[index].productId] = result.value;
              }
            });

            results.productDetails = detailsMap;
          }
        }

        // Only update UI if there are actual changes or quietMode is disabled
        if (shouldUpdateUI || !settings.quietMode) {
          // Now apply all updates at once using a synchronized approach
          if (settings.batchUpdates) {
            // Use React 18's batched updates or manually batch them

            // Start batch update operations
            if (updatedOrder) {
              // Update in order: soft updates first, then redux store
              setOrder(updatedOrder);
              useServiceOrderStore.getState().selectedOrder = updatedOrder;
            }

            // Update product details map if we have them
            if (results.productDetails) {
              setProductDetailsMap(results.productDetails);
            }

            // Update contract visibility if needed
            if (results.contractFound || results.contractGenerated) {
              setShowContractButton(true);
            }

            // Reset any loading states
            setLoadingDesignRecords(false);
            setFetchingProducts(false);
          }
        }

        return {
          success: true,
          updatedOrder,
          results,
          changes: shouldUpdateUI
        };
      } catch (error) {
        console.error("Error in silentRefreshData:", error);
        return {
          success: false,
          error
        };
      }
    };

    // Cleanup function to remove the function from window when component unmounts
    return () => {
      delete window.refreshOrderData;
      delete window.softUpdateOrderData;
      delete window.silentRefreshData;
      delete window.useRecordStore;
      delete window.useServiceOrderStore;
    };
    // We can't include refreshAllData in dependencies because it's defined after this hook
    // This is okay because refreshAllData doesn't depend on any state that changes during component lifecycle
  }, [id, order, getServiceOrderById, getDesignOrderById, getRecordSketch, getRecordDesign,
    getContractByServiceOrder, getProductById, generateContract, contractVisibleStatuses,
    contractVisibleStatusCodes]);  // Include all dependencies

  useEffect(() => {
    getServiceOrderById(id);
    fetchPercentage();
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

      console.log("Contract fetch check - Status:", selectedOrder?.status, "Should show:", shouldShowContract);

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

  // Update refreshAllData to use the new silentRefreshData when appropriate
  const refreshAllData = async (orderId) => {
    try {
      setLocalError(null);

      // Use a loading state to prevent flickering
      message.loading({ content: "Đang cập nhật dữ liệu...", key: "refreshData", duration: 0 });

      // Use the silentRefreshData function with loading indicator
      const result = await window.silentRefreshData(orderId, {
        refreshOrder: true,
        refreshSketch: true,
        refreshDesign: true,
        refreshContract: true,
        refreshProducts: true,
        batchUpdates: true,
        showLoading: false, // We're already showing a loading message
        showSuccess: false
      });

      // Clear loading indicator
      message.destroy("refreshData");

      return result.updatedOrder;
    } catch (error) {
      // Only show error messages for non-404 errors
      if (error.response?.status !== 404) {
        message.error({
          content: "Không thể cập nhật đầy đủ dữ liệu",
          key: "refreshData"
        });
      } else {
        // Clear the loading message without showing a success message
        message.destroy("refreshData");
      }
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
            {/* Description Section */}
            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
              <Col xs={24} md={12} style={{ display: 'flex' }}>
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
                        Mô tả của bạn
                      </span>
                    }
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <div
                      className="html-preview"
                      dangerouslySetInnerHTML={{ __html: order.description }}
                      style={{
                        fontSize: '15px',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        flex: 1
                      }}
                    />
                  </Card>
                )}
              </Col>
              <Col xs={24} md={12} style={{ display: 'flex' }}>
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
                      Nội dung tư vấn
                    </span>
                  }
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  {order?.skecthReport ? (
                    <div
                      className="html-preview"
                      dangerouslySetInnerHTML={{ __html: order.skecthReport }}
                      style={{ flex: 1 }}
                    />
                  ) : (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px'
                    }}>
                      <Typography.Text type="secondary" style={{ textAlign: 'center' }}>
                        Designer của chúng tôi sẽ liên hệ với bạn để tư vấn và cung cấp nội dung tư vấn trong thời gian sớm nhất.
                      </Typography.Text>
                    </div>
                  )}
                </Card>
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
                data={data}
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
                  data={data}
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
