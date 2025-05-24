import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useServiceOrderStore from "@/stores/useServiceOrderStore";
import useProductStore from "@/stores/useProductStore";
import useRecordStore from "@/stores/useRecordStore";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import EditorComponent from "@/components/Common/EditorComponent";
import signalRService from '@/services/signalRService';
import {
  Typography,
  Spin,
  Alert,
  Card,
  Row,
  Col,
  Tag,
  Image,
  Button,
  Descriptions,
  Space,
  Breadcrumb,
  Empty,
  Table,
  Timeline,
  message,
  Popconfirm,
  Modal,
  Input,
  Form,
  InputNumber,
  Tooltip,
  Slider,
  Tabs,
  Collapse,
} from "antd";
import { format } from "date-fns";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  PictureOutlined,
  ShoppingOutlined,
  ProjectOutlined,
  TagsOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  FilePdfOutlined,
  PlayCircleOutlined,
  EditOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
  CaretRightOutlined,
  FileSearchOutlined,
  FileProtectOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import usePercentageStore from "@/stores/usePercentageStore";
import useContractStore from "@/stores/useContractStore";

const { Title, Text, TextArea } = Typography;

const NewDesignOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedOrder,
    loading: orderLoading,
    error: orderError,
    getServiceOrderById,
  } = useServiceOrderStore();
  const { getProductById } = useProductStore();
  const { sketchRecords, designRecords, getRecordSketch, getRecordDesign, isLoading: recordLoading } = useRecordStore();
  const { data, fetchPercentage } = usePercentageStore();
  const { updateStatus, updateDepositSettings } = useDesignOrderStore();
  const [localError, setLocalError] = useState(null);
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [reportManagerModalVisible, setReportManagerModalVisible] = useState(false);
  const [reportManagerText, setReportManagerText] = useState('');
  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(0);
  const [refundPercentage, setRefundPercentage] = useState(0);
  const [depositForm] = Form.useForm();
  const [activeKeys, setActiveKeys] = useState([]);
  const { getContractByServiceOrder, getContractUrl, loading: contractLoading } = useContractStore();
  const [contract, setContract] = useState(null);
  const [contractError, setContractError] = useState(null);
  const [isContractModalVisible, setIsContractModalVisible] = useState(false);
  const [reportMaterialModalVisible, setReportMaterialModalVisible] = useState(false);
  const [reportMaterialText, setReportMaterialText] = useState('');
  const [viewingExternalProduct, setViewingExternalProduct] = useState(null);
  const [isViewExternalProductModalVisible, setIsViewExternalProductModalVisible] = useState(false);

  useEffect(() => {
    fetchPercentage();
  }, [fetchPercentage]);

  // Set up SignalR connection
  useEffect(() => {
    const setupSignalR = async () => {
      try {
        await signalRService.startConnection();
        signalRService.on("messageReceived", () => {
          if (id) {
            getServiceOrderById(id, true);
            // getRecordSketch(id, true);
            // getRecordDesign(id, true);
          }
        });
      } catch (error) {
        console.error("Failed to connect to SignalR hub:", error);
      }
    };

    setupSignalR();

    return () => {
      signalRService.off("messageReceived");
    };
  }, [id, getServiceOrderById]); // ❌ không thêm selectedOrder vào đây


  useEffect(() => {
    const fetchOrderDetailAndRelatedData = async () => {
      if (!id) return;

      // Reset local states on new ID
      setLocalError(null);
      setFetchingProducts(false);
      setProductDetailsMap({});

      try {
        console.log(`[Effect] Fetching order details for ID: ${id}`);
        // Trigger the main order fetch (updates store's selectedOrder, loading, error)
        await getServiceOrderById(id);

        // Get the result directly from the store *after* the fetch
        const freshlyFetchedOrder = useServiceOrderStore.getState().selectedOrder;
        console.log('[Effect] Fetched order details result:', freshlyFetchedOrder);

        // Fetch related data only if the main fetch was successful and matches the current ID
        if (freshlyFetchedOrder && freshlyFetchedOrder.id === id) {
          const currentStatus = freshlyFetchedOrder.status;
          console.log(`[Effect] Current order status: ${currentStatus}`);

          // Fetch sketch records for most statuses (EXCEPT Pending/Consulting)
          if (currentStatus !== 'Pending' && currentStatus !== 0 && currentStatus !== 'ConsultingAndSketching' && currentStatus !== 1) {
            getRecordSketch(id);
          }

          // Fetch design records specifically when design is done
          if (currentStatus !== 'Pending' && currentStatus !== 0 && currentStatus !== 'ConsultingAndSketching' && currentStatus !== 1) { // Check for both string and potential number
            getRecordDesign(id);
          }

          // Fetch product details
          if (freshlyFetchedOrder.serviceOrderDetails && freshlyFetchedOrder.serviceOrderDetails.length > 0) {
            console.log('[Effect] Triggering product details fetch...');
            fetchProductDetails(freshlyFetchedOrder.serviceOrderDetails);
          } else {
            console.log('[Effect] No product details to fetch.');
          }
        } else if (!freshlyFetchedOrder) {
          console.warn('[Effect] Order not found after fetch.');
        } else if (freshlyFetchedOrder.id !== id) {
          console.warn('[Effect] Fetched order ID mismatch. URL ID:', id, 'Fetched ID:', freshlyFetchedOrder.id);
        }
      } catch (error) {
        // Errors from getServiceOrderById are set in the store (orderError)
        console.error("[Effect] Error during getServiceOrderById call:", error);
      }
    };

    fetchOrderDetailAndRelatedData();

    // Cleanup function
    return () => {
      console.log('[Effect Cleanup] Cleaning up for ID:', id);
      // Reset local component states
      setProductDetailsMap({});
      setFetchingProducts(false);
      setLocalError(null);
      // Optionally clear store state if needed on unmount
      // useServiceOrderStore.setState({ selectedOrder: null, error: null });
    };
  }, [id, getServiceOrderById, getRecordSketch, getRecordDesign]);

  useEffect(() => {
    if (selectedOrder) {
      // API format uses 1.0 = 1%, no conversion needed
      setDepositPercentage(selectedOrder.depositPercentage || 0);
      setRefundPercentage(selectedOrder.refundPercentage || 0);
    }
  }, [selectedOrder]);

  const handleViewProductExternal = (productId) => {
    const product = currentOrder.externalProducts.find(p => p.id === productId);
    if (product) {
      setViewingExternalProduct(product);
      setIsViewExternalProductModalVisible(true);
    }
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return price.toLocaleString("vi-VN") + " VNĐ";
  };

  const fetchProductDetails = async (details) => {
    if (fetchingProducts) {
      console.log('[fetchProductDetails] Already fetching, skipping.');
      return;
    }
    setFetchingProducts(true);
    console.log('[fetchProductDetails] Starting fetch...');
    try {
      const productPromises = details.map(detail => getProductById(detail.productId));
      const productResults = await Promise.all(productPromises);
      const detailsMap = {};
      productResults.forEach((product, index) => {
        if (product) {
          detailsMap[details[index].productId] = product;
        }
      });
      console.log('[fetchProductDetails] Fetched details map:', detailsMap);
      setProductDetailsMap(detailsMap);
    } catch (error) {
      console.error("[fetchProductDetails] Error fetching product details:", error);
      setLocalError("Lỗi khi tải chi tiết sản phẩm.");
    } finally {
      console.log('[fetchProductDetails] Setting fetchingProducts to false.');
      setFetchingProducts(false);
    }
  };

  const handleStatusUpdate = async (orderId, status, successMessage, errorMessagePrefix) => {
    if (!orderId) return;
    try {
      await updateStatus(orderId, status);
      message.success(successMessage);
      await getServiceOrderById(orderId);
    } catch (err) {
      message.error(`${errorMessagePrefix}: ${err.message}`);
    }
  };

  const handleApprovePrice = () => {
    handleStatusUpdate(
      selectedOrder?.id,
      22,
      'Đã duyệt giá thiết kế thành công.',
      // 'Lỗi duyệt giá'
    );
  };

  const handleRejectPrice = () => {
    // Tạo một mẫu báo cáo làm điểm khởi đầu
    const initialTemplate = `<h3>Yêu cầu điều chỉnh</h3>
<p>Sau khi xem xét bản phác thảo và giá thiết kế, chúng tôi yêu cầu điều chỉnh các nội dung sau:</p>
<h4>Về phác thảo:</h4>
<ul>
    <li>...</li>
    <li>...</li>
</ul>
<h4>Về giá thiết kế:</h4>
<ul>
    <li>...</li>
    <li>...</li>
</ul>
<p>Vui lòng cập nhật và gửi lại để chúng tôi xem xét.</p>`;

    setReportManagerText(initialTemplate);
    setReportManagerModalVisible(true);
  };

  const handleRejectPriceSubmit = async () => {
    // Kiểm tra nội dung rich text có trống không 
    // (loại bỏ các thẻ HTML trống và khoảng trắng)
    const isEmptyContent = !reportManagerText ||
      reportManagerText.replace(/<[^>]*>/g, '').trim() === '';

    if (isEmptyContent) {
      message.error('Vui lòng nhập lý do yêu cầu điều chỉnh');
      return;
    }

    // Call the store's updateReport method to update status and report
    try {
      await useDesignOrderStore.getState().updateReport(
        selectedOrder?.id,
        24,
        reportManagerText,
        ""
      );
      message.success('Đã gửi yêu cầu điều chỉnh thành công.');
      // Refresh order data
      await getServiceOrderById(selectedOrder?.id);
    } catch (err) {
      message.error(`Lỗi yêu cầu điều chỉnh: ${err.message}`);
    }

    setReportManagerModalVisible(false);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      // Trạng thái chờ xử lý ban đầu
      Pending: "orange",
      WaitDeposit: "orange",
      WaitForScheduling: "orange",

      // Trạng thái đang xử lý
      ConsultingAndSketching: "processing",
      ReConsultingAndSketching: "processing",
      DeterminingDesignPrice: "processing",
      ReDeterminingDesignPrice: "processing",
      AssignToDesigner: "processing",
      ReDesign: "processing",
      DeterminingMaterialPrice: "processing",
      Processing: "processing",
      Installing: "processing",
      ReInstall: "processing",
      // Trạng thái hoàn thành từng bước
      DoneDeterminingDesignPrice: "cyan",
      DoneDesign: "cyan",
      DoneDeterminingMaterialPrice: "cyan",
      DoneInstalling: "cyan",
      MaterialPriceConfirmed: "cyan",

      // Trạng thái thanh toán
      DepositSuccessful: "cyan",
      PaymentSuccess: "cyan",

      // Trạng thái giao hàng
      PickedPackageAndDelivery: "blue",
      ReDelivery: "orange",
      ReDetermineMaterialPrice: "orange",
      DeliveredSuccessfully: "green",

      // Trạng thái hoàn thành
      CustomerConfirm: "cyan",
      Successfully: "green",
      CompleteOrder: "green",

      // Trạng thái lỗi/cảnh báo
      DeliveryFail: "red",
      Warning: "volcano",
      OrderCancelled: "red",
      StopService: "red",

      // Trạng thái hoàn tiền
      Refund: "purple",
      DoneRefund: "purple",

      // Trạng thái đổi sản phẩm
      ExchangeProduct: "geekblue",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      // Trạng thái chờ xử lý ban đầu
      Pending: "Chờ xử lý",
      WaitDeposit: "Chờ đặt cọc",
      WaitForScheduling: "Chờ lên lịch",

      // Trạng thái đang xử lý
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      ReConsultingAndSketching: "Đang tư vấn & phác thảo lại",
      DeterminingDesignPrice: "Xác định giá thiết kế",
      ReDeterminingDesignPrice: "Xác định lại giá thiết kế",
      AssignToDesigner: "Đã giao cho nhà thiết kế",
      ReDesign: "Đang thiết kế lại",
      DeterminingMaterialPrice: "Xác định giá vật liệu",
      Processing: "Đang xử lý",
      Installing: "Đang lắp đặt",
      ReInstall: "Đang lắp đặt lại",
      ReDetermineMaterialPrice: "Xác định lại giá vật liệu",

      // Trạng thái hoàn thành từng bước
      DoneDeterminingDesignPrice: "Đã xác định giá thiết kế",
      DoneDesign: "Đã hoàn thành thiết kế",
      DoneDeterminingMaterialPrice: "Đã xác định giá vật liệu",
      DoneInstalling: "Đã hoàn thành lắp đặt",

      // Trạng thái thanh toán
      DepositSuccessful: "Đã đặt cọc thành công",
      PaymentSuccess: "Đã thanh toán thành công",

      // Trạng thái giao hàng
      PickedPackageAndDelivery: "Đã lấy hàng & đang giao",
      ReDelivery: "Đang giao hàng lại",
      DeliveredSuccessfully: "Đã giao hàng thành công",

      // Trạng thái hoàn thành
      CustomerConfirm: "Khách hàng đã xác nhận",
      Successfully: "Đơn hàng thành công",
      CompleteOrder: "Đã hoàn thành đơn hàng",
      MaterialPriceConfirmed: "Đã điều chỉnh giá vật liệu từ kế toán",
      // Trạng thái lỗi/cảnh báo
      DeliveryFail: "Giao hàng thất bại",
      Warning: "Cảnh báo vượt 30%",
      OrderCancelled: "Đơn hàng đã bị hủy",
      StopService: "Đã dừng dịch vụ",

      // Trạng thái hoàn tiền
      Refund: "Đang hoàn tiền",
      DoneRefund: "Đã hoàn tiền xong",

      // Trạng thái đổi sản phẩm
      ExchangeProduct: "Đổi sản phẩm",
    };
    return statusTexts[status] || status;
  };

  const showDepositModal = () => {
    // Get values directly from currentOrder to ensure consistency with what's displayed in the UI
    const currentDepositPercentage = currentOrder?.depositPercentage || 0;
    const currentRefundPercentage = currentOrder?.refundPercentage || 0;

    // Set reasonable values for initial setup (when they're 1.0/1%)
    const finalDepositPercentage = currentDepositPercentage <= 1.0 ? 50.0 : currentDepositPercentage;
    const finalRefundPercentage = currentRefundPercentage <= 1.0 ? 30.0 : currentRefundPercentage;

    // Update local state
    setDepositPercentage(finalDepositPercentage);
    setRefundPercentage(finalRefundPercentage);

    // Update form values
    depositForm.setFieldsValue({
      depositPercentage: finalDepositPercentage,
      refundPercentage: finalRefundPercentage
    });

    // Show modal
    setIsDepositModalVisible(true);
  };

  // Update the isDepositSettingsValid function - 1.0 means 1%, not 100%
  const isDepositSettingsValid = () => {
    // Check if deposit percentage has been set to a reasonable value (not 1%)
    const isDepositReasonable = (selectedOrder?.depositPercentage || 0) >= 10.0;

    // Check if refund percentage doesn't exceed deposit percentage
    const isRefundValid = (selectedOrder?.refundPercentage || 0) <= (selectedOrder?.depositPercentage || 0);

    return isDepositReasonable && isRefundValid;
  };

  // Update the warning message function
  const getDepositSettingsWarning = () => {
    if ((selectedOrder?.depositPercentage || 0) < 10.0) {
      return 'Vui lòng điều chỉnh tỷ lệ tiền cọc (tối thiểu 10%)';
    }

    if ((selectedOrder?.refundPercentage || 0) > (selectedOrder?.depositPercentage || 0)) {
      return 'Tỷ lệ hoàn tiền không được lớn hơn tỷ lệ tiền đặt cọc';
    }

    return '';
  };

  // Now modify the handleDepositSettingsSubmit function to add validation
  const handleDepositSettingsSubmit = async () => {
    try {
      const values = await depositForm.validateFields();

      // Add additional validation for refund percentage
      if (values.refundPercentage > values.depositPercentage) {
        message.error('Tỷ lệ hoàn tiền không được lớn hơn tỷ lệ tiền đặt cọc');
        return;
      }

      // Convert percentages back to the format the API expects (1.0 = 1%)
      const depositPercentForAPI = values.depositPercentage;
      const refundPercentForAPI = values.refundPercentage;

      await updateDepositSettings(
        selectedOrder?.id,
        depositPercentForAPI,
        refundPercentForAPI
      );

      // Update local state with displayed percentage values
      setDepositPercentage(values.depositPercentage);
      setRefundPercentage(values.refundPercentage);

      message.success('Cập nhật tỷ lệ tiền cọc và hoàn trả thành công');
      setIsDepositModalVisible(false);

      // Refresh order data
      getServiceOrderById(selectedOrder?.id);
    } catch (error) {
      if (error.errorFields) {
        // Form validation error
        message.error('Vui lòng kiểm tra lại thông tin nhập vào');
      } else {
        // API error
        // message.error(`Lỗi khi cập nhật: ${error.message}`);
      }
    }
  };

  const fetchContract = async () => {
    console.log('Fetching contract for order ID:', id);
    try {
      setContractError(null);
      const contractData = await getContractByServiceOrder(id);
      console.log('Contract data received:', contractData);

      // Handle array response format
      const contractDoc = Array.isArray(contractData) ? contractData[0] : contractData;

      setContract(contractDoc);
      if (contractDoc) {
        setIsContractModalVisible(true);
      } else {
        message.info('Không tìm thấy hợp đồng cho đơn hàng này');
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      setContractError(error.message || 'Không thể tải hợp đồng');
      // message.error('Không thể tải thông tin hợp đồng');
    }
  };

  // Add a new function for approving material prices after handleApprovePrice
  const handleApproveMaterialPrice = () => {
    handleStatusUpdate(
      selectedOrder?.id,
      23, // DoneDeterminingMaterialPrice
      'Đã duyệt giá vật liệu thành công.',
      // 'Lỗi duyệt giá vật liệu'
    );
  };

  // Update the function for rejecting material price / requesting redetermination
  const handleRejectMaterialPrice = () => {
    // Generate formatted list of external products
    const externalProductsTable = (currentOrder.externalProducts || []).length > 0
      ? `<h4>Danh sách vật liệu thêm mới cần điều chỉnh:</h4>
<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f0f0f0;">
      <th style="text-align: left;">Tên sản phẩm</th>
      <th style="text-align: center;">Số lượng</th>
      <th style="text-align: right;">Đơn giá (VNĐ)</th>
      <th style="text-align: right;">Thành tiền (VNĐ)</th>
      <th style="text-align: left;">Yêu cầu điều chỉnh</th>
    </tr>
  </thead>
  <tbody>
    ${currentOrder.externalProducts.map(product => `
    <tr>
      <td style="text-align: left;">${product.name}</td>
      <td style="text-align: center;">${product.quantity}</td>
      <td style="text-align: right;">${product.price ? product.price.toLocaleString('vi-VN') : 0}</td>
      <td style="text-align: right;">${product.totalPrice ? product.totalPrice.toLocaleString('vi-VN') : 0}</td>
      <td style="text-align: left;"></td>
    </tr>
    `).join('')}
  </tbody>
</table>`
      : '<p>Không có vật liệu thêm mới nào cần điều chỉnh.</p>';

    // Format the list of regular products
    const regularProductsTable = (currentOrder.serviceOrderDetails || []).length > 0
      ? `<h4>Danh sách vật liệu từ cửa hàng cần điều chỉnh:</h4>
<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f0f0f0;">
      <th style="text-align: left;">ID sản phẩm</th>
      <th style="text-align: center;">Số lượng</th>
      <th style="text-align: right;">Đơn giá (VNĐ)</th>
      <th style="text-align: right;">Thành tiền (VNĐ)</th>
      <th style="text-align: left;">Yêu cầu điều chỉnh</th>
    </tr>
  </thead>
  <tbody>
    ${currentOrder.serviceOrderDetails.map(product => `
    <tr>
      <td style="text-align: left;">${product.productId}</td>
      <td style="text-align: center;">${product.quantity}</td>
      <td style="text-align: right;">${product.price ? product.price.toLocaleString('vi-VN') : 0}</td>
      <td style="text-align: right;">${product.totalPrice ? product.totalPrice.toLocaleString('vi-VN') : 0}</td>
      <td style="text-align: left;"></td>
    </tr>
    `).join('')}
  </tbody>
</table>`
      : '<p>Không có vật liệu từ cửa hàng nào cần điều chỉnh.</p>';

    // Create a template with current products
    const initialTemplate = `<h3>Yêu cầu điều chỉnh giá vật liệu</h3>
<p>Sau khi xem xét danh sách vật liệu và giá, chúng tôi yêu cầu điều chỉnh các nội dung sau:</p>

${externalProductsTable}


<h4>Yêu cầu chung về giá vật liệu:</h4>
<ul>
    <li>...</li>
    <li>...</li>
</ul>

<p>Vui lòng cập nhật và gửi lại để chúng tôi xem xét.</p>`;

    setReportMaterialText(initialTemplate);
    setReportMaterialModalVisible(true);
  };

  // Add a function to submit material price redetermination request
  const handleRejectMaterialPriceSubmit = async () => {
    // Kiểm tra nội dung rich text có trống không 
    // (loại bỏ các thẻ HTML trống và khoảng trắng)
    const isEmptyContent = !reportMaterialText ||
      reportMaterialText.replace(/<[^>]*>/g, '').trim() === '';

    if (isEmptyContent) {
      message.error('Vui lòng nhập lý do yêu cầu điều chỉnh giá vật liệu');
      return;
    }

    // Call the store's updateReport method to update status and report
    try {
      await useDesignOrderStore.getState().updateReport(
        selectedOrder?.id,
        32, // Back to DeterminingMaterialPrice status
        "",  // Don't change design report
        reportMaterialText // Set material report
      );
      message.success('Đã gửi yêu cầu điều chỉnh giá vật liệu thành công.');
      // Refresh order data
      await getServiceOrderById(selectedOrder?.id);
    } catch (err) {
      message.error(`Lỗi yêu cầu điều chỉnh giá vật liệu: ${err.message}`);
    }

    setReportMaterialModalVisible(false);
  };

  if (orderLoading) {
    console.log("Render: Loading state (orderLoading is true)");
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <Spin size="large" tip="Đang tải thông tin đơn hàng..." />
      </div>
    );
  }

  // const displayError = orderError || localError;
  // if (displayError) {
  //   console.error("Render: Error state", { displayError, orderError, localError });
  //   return (
  //     <div className="container mx-auto px-4 py-8" style={{ paddingTop: "20px" }}>
  //       <Alert
  //         type="error"
  //         message="Lỗi"
  //         description={displayError || "Không thể tải thông tin đơn hàng. Vui lòng thử lại."}
  //         className="mb-4"
  //       />
  //       <Button
  //         icon={<ArrowLeftOutlined />}
  //         onClick={() => navigate("/manager/new-design-orders")}
  //       >
  //         Quay lại danh sách
  //       </Button>
  //     </div>
  //   );
  // }

  if (!selectedOrder || selectedOrder.id !== id) {
    console.warn(`Render: Data not ready or mismatch. URL ID: ${id}, selectedOrder ID: ${selectedOrder?.id}. Showing loading/wait state.`);
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <Spin size="large" tip={`Đang tải dữ liệu cho đơn hàng ${id ? id.substring(0, 8) : ''}...`} />
      </div>
    );
  }

  const currentOrder = selectedOrder;
  const hasImages = currentOrder.image && (currentOrder.image.imageUrl || currentOrder.image.image2 || currentOrder.image.image3);

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
        const displayPrice = typeof record.price === 'number' && record.price > 0
          ? record.price
          : product?.price;
        return <Text>{formatPrice(displayPrice)}</Text>;
      },
    },
    {
      title: 'Thành tiền',
      key: 'totalPrice',
      align: 'right',
      render: (_, record) => {
        if (typeof record.totalPrice === 'number' && record.totalPrice > 0) {
          return <Text strong style={{ color: '#4caf50' }}>{formatPrice(record.totalPrice)}</Text>;
        }
        const product = productDetailsMap[record.productId];
        const price = typeof record.price === 'number' && record.price > 0
          ? record.price
          : product?.price;
        const quantity = record.quantity;
        const calculatedTotalPrice = (typeof price === 'number' && typeof quantity === 'number')
          ? price * quantity
          : 0;
        return <Text strong style={{ color: '#4caf50' }}>{formatPrice(calculatedTotalPrice)}</Text>;
      },
    },
    {
      title: 'Hướng dẫn',
      key: 'guide',
      align: 'center',
      render: (_, record) => {
        const product = productDetailsMap[record.productId];
        const guideUrl = product?.designImage1URL;
        if (guideUrl) {
          const isPdf = guideUrl.toLowerCase().endsWith('.pdf');
          const buttonText = isPdf ? 'Xem PDF' : 'Xem Video';
          return (
            <Button
              type="link"
              href={guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              icon={isPdf ? <FilePdfOutlined /> : <PlayCircleOutlined />}
            >
              {buttonText}
            </Button>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
  ];

  const renderCostCard = () => {
    if (!currentOrder?.designPrice && !currentOrder?.materialPrice) return null;
    if (!data) return null;

    // Calculate actual material price from all products
    const calculatedMaterialPrice =
      // Calculate total of regular products
      (currentOrder.serviceOrderDetails || []).reduce(
        (sum, item) => sum + (item.totalPrice || item.price * item.quantity || 0),
        0
      ) +
      // Add total of external products
      (currentOrder.externalProducts || []).reduce(
        (sum, item) => sum + (item.totalPrice || item.price * item.quantity || 0),
        0
      );

    // Calculate total cost as design price + calculated material price
    const calculatedTotalCost = (currentOrder.designPrice || 0) + calculatedMaterialPrice;

    return (
      <Card
        title={
          <Space>
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#4caf50',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <DollarOutlined />
              Chi tiết chi phí đơn hàng
            </span>
            {currentOrder.status === 'DeterminingDesignPrice' && (
              <Tag color="orange" style={{ fontSize: 14 }}>
                Chờ xác định giá
              </Tag>
            )}
          </Space>
        }
        style={{
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px'
        }}
      >
        <Descriptions column={1} size="middle">
          {typeof currentOrder.designPrice === 'number' && (
            <Descriptions.Item label="Giá thiết kế">{formatPrice(currentOrder.designPrice)}</Descriptions.Item>
          )}
          <Descriptions.Item label="Tỷ lệ đặt cọc cho giá thiết kế">
            <Text strong style={{ color: '#1890ff' }}>
              {data.depositPercentage.toFixed(1)}%
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tỷ lệ hoàn lại tiền từ tiền đặt cọc">
            <Text strong style={{ color: '#1890ff' }}>
              {data.refundPercentage.toFixed(1)}%
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền đặt cọc cần thanh toán">
            <Text strong style={{ fontSize: '1.1em', color: '#1890ff' }}>
              {formatPrice(currentOrder.designPrice * data.depositPercentage / 100)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Giá vật liệu">{formatPrice(calculatedMaterialPrice)}</Descriptions.Item>
          <Descriptions.Item label="Tổng chi phí">
            <Text strong style={{ fontSize: '1.1em', color: '#cf1322' }}>
              {formatPrice(calculatedTotalCost)}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  // After renderCostCard() function, add a new function to render products
  const renderProductsCollapse = () => {
    // Auto-expand when status is DeterminingMaterialPrice
    const isAutoExpand = currentOrder.status === 'DeterminingMaterialPrice' || currentOrder.status === 'MaterialPriceConfirmed';

    return (
      <Card
        bordered={false}
        style={{
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px',
          background: '#ffffff',
        }}
        styles={{
          body: {
            padding: 0
          }
        }}
      >
        <Collapse
          bordered={false}
          style={{
            borderRadius: '8px',
            backgroundColor: 'transparent',
          }}
          expandIconPosition="end"
          defaultActiveKey={isAutoExpand ? ['products'] : []}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined
              rotate={isActive ? 90 : 0}
              style={{ fontSize: '16px', color: '#4caf50' }}
            />
          )}
        >
          <Collapse.Panel
            key="products"
            header={
              <span style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#4caf50',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShoppingOutlined />
                Danh sách sản phẩm ({(currentOrder.serviceOrderDetails?.length || 0) + (currentOrder.externalProducts?.length || 0)} sản phẩm)
              </span>
            }
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
            }}
          >
            {/* Regular products section */}
            {currentOrder.serviceOrderDetails && currentOrder.serviceOrderDetails.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                  <TagsOutlined /> Sản phẩm từ cửa hàng ({currentOrder.serviceOrderDetails.length})
                </Title>
                <Table
                  columns={productColumns}
                  dataSource={currentOrder.serviceOrderDetails.map((detail, index) => ({
                    ...detail,
                    key: detail.productId || `regular-${index}`
                  }))}
                  pagination={false}
                  size="middle"
                />
              </div>
            )}

            {/* External products section */}
            {currentOrder.externalProducts && currentOrder.externalProducts.length > 0 && (
              <div>
                <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                  <ShoppingOutlined /> Sản phẩm thêm mới ({currentOrder.externalProducts.length})
                  {/* {isAutoExpand && (
                    <Tag color="orange" style={{ marginLeft: '8px' }}>Đang xác định giá vật liệu</Tag>
                  )} */}
                  {currentOrder.status === 'MaterialPriceConfirmed' && (
                    <Tag color="green" style={{ marginLeft: '8px' }}>Vui lòng kiểm tra và xác nhận giá sản phẩm</Tag>
                  )}
                  {currentOrder.status === 'ReDetermineMaterialPrice' && (
                    <Tag color="orange" style={{ marginLeft: '8px' }}>Đang xác định lại giá vật liệu</Tag>
                  )}
                </Title>
                <Table
                  columns={[
                    {
                      title: 'Sản phẩm',
                      key: 'product',
                      width: 200,
                      render: (_, record) => (
                        <Space>
                          <Image
                            src={record.imageURL || '/placeholder.png'}
                            alt={record.name}
                            width={50}
                            height={50}
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                            preview={true}
                          />
                          <div>
                            <Text strong>{record.name}</Text>
                            <div style={{ fontSize: 12, color: '#888' }}>ID: {record.id}</div>
                          </div>
                        </Space>
                      ),
                    },
                    {
                      title: 'Yêu cầu về sản phẩm',
                      dataIndex: 'description',
                      key: 'description',
                      width: 300,
                      render: (description) => (
                        <Tooltip
                          title={<div
                            className="html-preview"
                            dangerouslySetInnerHTML={{ __html: description }}
                          />}
                          placement="top"
                          color="white"
                          styles={{
                            body: {
                              width: 900,
                              maxHeight: 500,
                              overflowY: 'auto',
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#d9d9d9 #f0f0f0',
                            },
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              marginTop: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: '1.4em',
                              maxHeight: '2.8em'
                            }}
                            dangerouslySetInnerHTML={{ __html: description }}
                          >
                          </div>
                        </Tooltip>
                      ),
                    },
                    {
                      title: 'Số lượng',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      align: 'center',
                      width: 100,
                    },
                    {
                      title: 'Đơn giá',
                      dataIndex: 'price',
                      key: 'price',
                      align: 'right',
                      width: 120,
                      render: (price) => price === 0 ? (
                        <Tag color="orange" style={{ whiteSpace: 'normal', height: 'auto', lineHeight: '1.5' }}>
                          Chờ kế toán nhập giá
                        </Tag>
                      ) : formatPrice(price),
                    },
                    {
                      title: 'Thành tiền',
                      dataIndex: 'totalPrice',
                      key: 'totalPrice',
                      align: 'right',
                      width: 150,
                      render: (totalPrice) => (
                        <Text strong style={{ color: '#4caf50' }}>
                          {formatPrice(totalPrice)}
                        </Text>
                      ),
                    },
                    {
                      title: 'Thao tác',
                      key: 'action',
                      align: 'center',
                      width: 150,
                      render: (_, record) => (
                        <Space>
                          <Button type="primary" onClick={() => handleViewProductExternal(record.id)}>
                            <EyeOutlined />
                          </Button>
                        </Space>
                      ),
                    }
                  ]}
                  dataSource={currentOrder.externalProducts.map((product) => ({
                    ...product,
                    key: product.id,
                  }))}
                  pagination={false}
                  size="middle"
                />
              </div>
            )}

            {/* Total price for all products */}
            {(currentOrder.serviceOrderDetails?.length > 0 || currentOrder.externalProducts?.length > 0) && (
              <div style={{
                marginTop: '24px',
                textAlign: 'right',
                borderTop: '1px dashed #d9d9d9',
                paddingTop: '16px'
              }}>
                <Text strong style={{ fontSize: '16px' }}>
                  Tổng chi phí vật liệu:
                  <Text strong style={{ fontSize: '18px', color: '#f5222d', marginLeft: '8px' }}>
                    {formatPrice(
                      // Calculate total of regular products
                      (currentOrder.serviceOrderDetails || []).reduce(
                        (sum, item) => sum + (item.totalPrice || item.price * item.quantity || 0),
                        0
                      ) +
                      // Add total of external products
                      (currentOrder.externalProducts || []).reduce(
                        (sum, item) => sum + (item.totalPrice || item.price * item.quantity || 0),
                        0
                      )
                    )}
                  </Text>
                </Text>
              </div>
            )}
          </Collapse.Panel>
        </Collapse>
      </Card>
    );
  };

  const renderContractSection = () => {
    console.log('Rendering contract section');
    return (
      <Card
        style={{
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '16px',
          // marginTop: '16px',
          borderLeft: '5px solid #52c41a',
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <FileProtectOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <div>
                <Title level={5} style={{ margin: 0 }}>Hợp đồng dịch vụ</Title>
                <Text type="secondary">Xem hợp đồng thiết kế</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<FileSearchOutlined />}
              onClick={fetchContract}
              loading={contractLoading}
            >
              Xem hợp đồng
            </Button>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div>
      <Breadcrumb
        items={[
          {
            title: (
              <Link to="/manager/dashboard">
                <Space>
                  <HomeOutlined style={{ fontSize: '18px' }} />
                  <span style={{ fontSize: '16px' }}>Dashboard</span>
                </Space>
              </Link>
            ),
          },
          {
            title: (
              <Link to="/manager/new-design-orders">
                <Space>
                  <ProjectOutlined style={{ fontSize: '18px' }} />
                  <span style={{ fontSize: '16px' }}>Đơn đặt thiết kế mới</span>
                </Space>
              </Link>
            ),
          },
          {
            title: (
              <Space>
                <ShoppingOutlined style={{ fontSize: '18px' }} />
                <span style={{ fontSize: '16px' }}>Chi tiết đơn #{id.substring(0, 8)}</span>
              </Space>
            ),
          },
        ]}
        style={{
          marginBottom: '16px',
          padding: '12px 16px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      />

      <Card
        className="shadow-md mb-6"
        style={{ marginBottom: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/manager/new-design-orders")}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              Quay lại
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              Chi tiết đơn <span style={{ color: '#4caf50' }}>#{id}</span>
            </Title>
          </div>
        }
        extra={
          <Space>
            <Tag color={getStatusColor(currentOrder.status)} size="large">
              {getStatusText(currentOrder.status)}
            </Tag>
            {/* <Button
              type="primary"
              icon={<FileSearchOutlined />}
              onClick={fetchContract}
            >
              Xem hợp đồng
            </Button> */}
          </Space>
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
              style={{ height: '100%', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)' }}
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Tên">{currentOrder.userName}</Descriptions.Item>
                <Descriptions.Item label="Email">{currentOrder.email}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{currentOrder.cusPhone}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{currentOrder.address?.replace(/\|/g, ', ') ?? 'N/A'}</Descriptions.Item>
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
                  Thông tin yêu cầu
                </span>
              }
              style={{ height: '100%', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)' }}
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Kích thước">{currentOrder.length}m x {currentOrder.width}m</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">{format(new Date(currentOrder.creationDate), "dd/MM/yyyy HH:mm")}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
        {renderContractSection()}

        {currentOrder.description && (
          <Card
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px',
              background: '#ffffff', // Cho trắng rõ như Card
            }}
            styles={{
              body: {
                padding: 0
              }
            }}
          >
            <Collapse
              bordered={false}
              style={{
                borderRadius: '8px',
                backgroundColor: 'transparent', // Collapse bên trong không cần màu nền
              }}
              expandIconPosition="end"
              activeKey={activeKeys}
              onChange={(keys) => {
                if (Array.isArray(keys)) {
                  setActiveKeys(keys);
                } else {
                  setActiveKeys([keys]);
                }
              }}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined
                  rotate={isActive ? 90 : 0}
                  style={{ fontSize: '16px', color: '#4caf50' }} // 👉 Gọn hơn, màu xanh lá đồng bộ
                />
              )}
            >
              <Collapse.Panel
                key="description"
                header={
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: activeKeys.includes('description') ? '#4caf50' : '#000000', // 🌟 Kiểm tra activeKeys
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FileTextOutlined />
                    Mô tả yêu cầu từ khách hàng
                  </span>
                }
                style={{
                  backgroundColor: '#ffffff', // Panel nền trắng để đồng bộ Card
                  borderRadius: '8px',
                }}
              >
                <div className="html-preview" dangerouslySetInnerHTML={{ __html: currentOrder.description }} />
              </Collapse.Panel>
            </Collapse>
          </Card>
        )}

        {currentOrder.skecthReport && (
          <Card
            bordered={false}
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px',
              background: '#ffffff', // Cho trắng rõ như Card
            }}
            styles={{
              body: {
                padding: 0
              }
            }}
          >
            <Collapse
              bordered={false}
              style={{
                borderRadius: '8px',
                backgroundColor: 'transparent', // Collapse bên trong không cần màu nền
              }}
              expandIconPosition="end"
              activeKey={activeKeys}
              onChange={(keys) => {
                if (Array.isArray(keys)) {
                  setActiveKeys(keys);
                } else {
                  setActiveKeys([keys]);
                }
              }}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined
                  rotate={isActive ? 90 : 0}
                  style={{ fontSize: '16px', color: '#4caf50' }} // 👉 Gọn hơn, màu xanh lá đồng bộ
                />
              )}
            >
              <Collapse.Panel
                key="skecthReport"
                header={
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: activeKeys.includes('skecthReport') ? '#4caf50' : '#000000', // 🌟 Kiểm tra activeKeys
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FileTextOutlined />
                    Ghi chú quá trình làm việc & giá thiết kế đề xuất với khách hàng
                  </span>
                }
                style={{
                  backgroundColor: '#ffffff', // Panel nền trắng để đồng bộ Card
                  borderRadius: '8px',
                }}
              >
                <div className="html-preview" dangerouslySetInnerHTML={{ __html: currentOrder.skecthReport }} />
              </Collapse.Panel>
            </Collapse>
          </Card>
        )}

        {(currentOrder.status !== 'Pending' && sketchRecords.length > 0) && (
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
                <PictureOutlined />
                Bản vẽ phác thảo
              </span>
            }
            style={{
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              marginBottom: '24px'
            }}
            loading={recordLoading}
          >
            {(() => {
              // Check if any phase has selected records
              const hasSelectedRecords = sketchRecords.some(record => record.isSelected);
              // Generate default active keys based on selection status
              const defaultActiveKeys = hasSelectedRecords
                ? [0, 1, 2, 3]
                  .filter(phase => sketchRecords.some(record => record.phase === phase && record.isSelected))
                  .map(phase => `sketch-phase-${phase}`)
                : [0, 1, 2, 3]
                  .filter(phase => sketchRecords.some(record => record.phase === phase))
                  .map(phase => `sketch-phase-${phase}`);

              return [0, 1, 2, 3].map(phase => {
                const recordsInPhase = sketchRecords.filter(record => record.phase === phase);
                if (recordsInPhase.length === 0) return null;

                const phaseTitle = phase === 0
                  ? "Ảnh khách hàng cung cấp"
                  : `Bản phác thảo lần ${phase}`;
                const isSelectedPhase = recordsInPhase.some(record => record.isSelected);

                return (
                  <Collapse
                    key={`sketch-${phase}`}
                    bordered={false}
                    defaultActiveKey={defaultActiveKeys}
                    style={{ background: 'transparent', marginBottom: '16px' }}
                  >
                    <Collapse.Panel
                      key={`sketch-phase-${phase}`}
                      header={
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                          {phaseTitle}
                          {isSelectedPhase && <Tag color="green" style={{ marginLeft: 8 }}>Đã chọn</Tag>}
                        </span>
                      }
                    >
                      <Row gutter={[16, 16]}>
                        {recordsInPhase.map(record => (
                          <React.Fragment key={record.id}>
                            {record.image?.imageUrl && (
                              <Col xs={24} sm={12} md={8}>
                                <Card hoverable styles={{
                                  body: {
                                    padding: 0
                                  }
                                }}>
                                  <Image
                                    src={record.image.imageUrl}
                                    alt={`Ảnh ${phaseTitle} 1`}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                  />
                                </Card>
                              </Col>
                            )}
                            {record.image?.image2 && (
                              <Col xs={24} sm={12} md={8}>
                                <Card hoverable styles={{
                                  body: {
                                    padding: 0
                                  }
                                }}>
                                  <Image
                                    src={record.image.image2}
                                    alt={`Ảnh ${phaseTitle} 2`}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                  />
                                </Card>
                              </Col>
                            )}
                            {record.image?.image3 && (
                              <Col xs={24} sm={12} md={8}>
                                <Card hoverable styles={{
                                  body: {
                                    padding: 0
                                  }
                                }}>
                                  <Image
                                    src={record.image.image3}
                                    alt={`Ảnh ${phaseTitle} 3`}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                  />
                                </Card>
                              </Col>
                            )}
                          </React.Fragment>
                        ))}
                      </Row>
                    </Collapse.Panel>
                  </Collapse>
                );
              });
            })()}
          </Card>
        )}

        {/* Add a separate card for design records */}
        {(currentOrder.status !== 'Pending' && designRecords.length > 0) && (
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
                <PictureOutlined />
                Bản vẽ thiết kế
              </span>
            }
            style={{
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              marginBottom: '24px'
            }}
            loading={recordLoading}
          >
            {(() => {
              // Check if any phase has selected records
              const hasSelectedRecords = designRecords.some(record => record.isSelected);
              // Generate default active keys based on selection status
              const defaultActiveKeys = hasSelectedRecords
                ? [1, 2, 3, 4]
                  .filter(phase => designRecords.some(record => record.phase === phase && record.isSelected))
                  .map(phase => `design-phase-${phase}`)
                : [1, 2, 3, 4]
                  .filter(phase => designRecords.some(record => record.phase === phase))
                  .map(phase => `design-phase-${phase}`);

              return [1, 2, 3, 4].map(phase => {
                const recordsInPhase = designRecords.filter(record => record.phase === phase);
                if (recordsInPhase.length === 0) return null;

                const phaseTitle = `Bản thiết kế lần ${phase}`;
                const isSelectedPhase = recordsInPhase.some(record => record.isSelected);

                return (
                  <Collapse
                    key={`design-${phase}`}
                    bordered={false}
                    defaultActiveKey={defaultActiveKeys}
                    style={{ background: 'transparent', marginBottom: '16px' }}
                  >
                    <Collapse.Panel
                      key={`design-phase-${phase}`}
                      header={
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                          {phaseTitle}
                          {isSelectedPhase && <Tag color="green" style={{ marginLeft: 8 }}>Đã chọn</Tag>}
                        </span>
                      }
                    >
                      <Row gutter={[16, 16]}>
                        {recordsInPhase.map(record => (
                          <React.Fragment key={record.id}>
                            {record.image?.imageUrl && (
                              <Col xs={24} sm={12} md={8}>
                                <Card hoverable styles={{
                                  body: {
                                    padding: 0
                                  }
                                }}>
                                  <Image
                                    src={record.image.imageUrl}
                                    alt={`Ảnh ${phaseTitle} 1`}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                  />
                                </Card>
                              </Col>
                            )}
                            {record.image?.image2 && (
                              <Col xs={24} sm={12} md={8}>
                                <Card hoverable styles={{
                                  body: {
                                    padding: 0
                                  }
                                }}>
                                  <Image
                                    src={record.image.image2}
                                    alt={`Ảnh ${phaseTitle} 2`}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                  />
                                </Card>
                              </Col>
                            )}
                            {record.image?.image3 && (
                              <Col xs={24} sm={12} md={8}>
                                <Card hoverable styles={{
                                  body: {
                                    padding: 0
                                  }
                                }}>
                                  <Image
                                    src={record.image.image3}
                                    alt={`Ảnh ${phaseTitle} 3`}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                  />
                                </Card>
                              </Col>
                            )}
                          </React.Fragment>
                        ))}
                      </Row>
                    </Collapse.Panel>
                  </Collapse>
                );
              });
            })()}
          </Card>
        )}

        {hasImages && !sketchRecords.length && !designRecords.length && (
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
                <PictureOutlined />
                Ảnh khách hàng cung cấp
              </span>
            }
            style={{
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              marginBottom: '24px'
            }}
          >
            <Row gutter={[16, 16]}>
              {currentOrder.image.imageUrl && (
                <Col xs={24} sm={8}>
                  <Image src={currentOrder.image.imageUrl} alt="Hình ảnh 1" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                </Col>
              )}
              {currentOrder.image.image2 && (
                <Col xs={24} sm={8}>
                  <Image src={currentOrder.image.image2} alt="Hình ảnh 2" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                </Col>
              )}
              {currentOrder.image.image3 && (
                <Col xs={24} sm={8}>
                  <Image src={currentOrder.image.image3} alt="Hình ảnh 3" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                </Col>
              )}
              {!currentOrder.image.imageUrl && !currentOrder.image.image2 && !currentOrder.image.image3 && (
                <Col span={24}>
                  <Empty description="Khách hàng không cung cấp hình ảnh." />
                </Col>
              )}
            </Row>
          </Card>
        )}

        {currentOrder.report && (
          <Card
            bordered={false}
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px',
              background: '#ffffff', // Cho trắng rõ như Card
            }}
            styles={{
              body: {
                padding: 0
              }
            }}
          >
            <Collapse
              bordered={false}
              style={{
                borderRadius: '8px',
                backgroundColor: 'transparent', // Collapse bên trong không cần màu nền
              }}
              expandIconPosition="end"
              activeKey={activeKeys.length > 0 ? activeKeys : (currentOrder.status === 'DeterminingDesignPrice' ? ['report'] : [])}
              onChange={(keys) => {
                if (Array.isArray(keys)) {
                  setActiveKeys(keys);
                } else {
                  setActiveKeys([keys]);
                }
              }}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined
                  rotate={isActive ? 90 : 0}
                  style={{ fontSize: '16px', color: '#4caf50' }} // 👉 Gọn hơn, màu xanh lá đồng bộ
                />
              )}
            >
              <Collapse.Panel
                key="report"
                header={
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: (activeKeys.includes('report') || (activeKeys.length === 0 && currentOrder.status === 'DeterminingDesignPrice')) ? '#4caf50' : '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FileTextOutlined />
                    Báo cáo của designer về phác thảo/thiết kế và giá thiết kế
                  </span>
                }
                style={{
                  backgroundColor: '#ffffff', // Panel nền trắng để đồng bộ Card
                  borderRadius: '8px',
                }}
              >
                <div className="html-preview" dangerouslySetInnerHTML={{ __html: currentOrder.report }} />
              </Collapse.Panel>
            </Collapse>
          </Card>
        )}

        {renderProductsCollapse()}

        {renderCostCard()}

        {(currentOrder?.status === 'DeterminingDesignPrice' || currentOrder?.status === 'ReDeterminingDesignPrice') && currentOrder?.designPrice > 0 && (
          <Card
            title="Xác nhận giá thiết kế"
            style={{
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
              marginTop: '24px'
            }}
            styles={{ body: { textAlign: 'right' } }}
          >
            {!isDepositSettingsValid() && (
              <Alert
                message={
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d46b08' }}>
                    ⚠️ Cảnh báo về cài đặt tiền cọc
                  </div>
                }
                description={
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#d48806' }}>{getDepositSettingsWarning()}</p>
                    <p>
                      Trước khi duyệt giá thiết kế, bạn cần đảm bảo các thông số <strong>tiền cọc</strong> và <strong>hoàn trả</strong> được thiết lập hợp lý.
                    </p>
                    <p>Số tiền cọc phải nằm trong khoảng 30% đến 80% giá thiết kế</p>
                    <p>Số tiền hoàn trả phải nằm trong khoảng 10% đến 50% giá thiết kế và không được lớn hơn số tiền cọc</p>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={showDepositModal}
                      style={{ marginTop: '8px' }}
                    >
                      Cài đặt tiền cọc
                    </Button>
                  </div>
                }
                type="warning"
                style={{ marginBottom: '16px', textAlign: 'left' }}
              />
            )}
            <Space size="middle">
              <Button danger icon={<CloseCircleOutlined />} onClick={handleRejectPrice}>
                Yêu cầu điều chỉnh phác thảo/giá thiết kế
              </Button>

              <Popconfirm
                title="Bạn chắc chắn muốn DUYỆT mức giá thiết kế này?"
                onConfirm={handleApprovePrice}
                okText="Duyệt"
                cancelText="Hủy"
                disabled={!isDepositSettingsValid()}
              >
                <Button type="primary" icon={<CheckCircleOutlined />} disabled={!isDepositSettingsValid()}>
                  Duyệt giá thiết kế
                </Button>
              </Popconfirm>
            </Space>
          </Card>
        )}

        {(currentOrder?.status === 'MaterialPriceConfirmed' ||
          (currentOrder?.status === 'DeterminingMaterialPrice' &&
            (!currentOrder.externalProducts || currentOrder.externalProducts.length === 0))
        ) && (
            <Card
              title="Xác nhận giá vật liệu"
              style={{
                borderRadius: '8px',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                marginTop: '24px',
                borderLeft: '5px solid #52c41a'
              }}
              styles={{ body: { textAlign: 'right' } }}
            >
              <Alert
                message="Xác nhận giá vật liệu"
                description={
                  <div>
                    <p>
                      Bạn sắp xác nhận giá vật liệu với tổng chi phí:
                      <Text strong style={{ fontSize: '18px', color: '#f5222d', marginLeft: '8px' }}>
                        {formatPrice(
                          // Calculate total of regular products
                          (currentOrder.serviceOrderDetails || []).reduce(
                            (sum, item) => sum + (item.totalPrice || item.price * item.quantity || 0),
                            0
                          ) +
                          // Add total of external products
                          (currentOrder.externalProducts || []).reduce(
                            (sum, item) => sum + (item.totalPrice || item.price * item.quantity || 0),
                            0
                          )
                        )}
                      </Text>
                    </p>
                    <p>
                      Sau khi xác nhận, hệ thống sẽ gửi báo giá cho khách hàng và chuyển trạng thái đơn hàng sang "Đã xác định giá vật liệu".
                    </p>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: '16px', textAlign: 'left' }}
              />
              <Space size="middle">
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={handleRejectMaterialPrice}
                  size="middle"
                >
                  Yêu cầu điều chỉnh giá vật liệu
                </Button>
                <Popconfirm
                  title={
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                        Bạn có chắc chắn muốn <span style={{ color: '#52c41a' }}>DUYỆT mức giá vật liệu</span>?
                      </div>
                      <div style={{ fontSize: 13, color: '#595959' }}>
                        Hành động này sẽ xác nhận giá vật liệu đã đúng và không thể hoàn tác.
                      </div>
                    </div>
                  }
                  onConfirm={handleApproveMaterialPrice}
                  okText="Xác nhận"
                  cancelText="Hủy"
                  placement="topRight"
                >
                  <Button type="primary" icon={<CheckCircleOutlined />} size="middle">
                    Duyệt giá vật liệu
                  </Button>
                </Popconfirm>
              </Space>
            </Card>
          )}
      </Card>

      <Modal
        title="Yêu cầu điều chỉnh phác thảo/giá thiết kế"
        open={reportManagerModalVisible}
        onOk={handleRejectPriceSubmit}
        onCancel={() => setReportManagerModalVisible(false)}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        width={800}
      >
        <div className="instruction-container" style={{ marginBottom: '16px' }}>
          <div style={{
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <Typography.Title level={5} style={{ color: '#52c41a', marginTop: 0 }}>
              Yêu cầu điều chỉnh
            </Typography.Title>
            <Typography.Paragraph>
              Vui lòng nhập chi tiết lý do yêu cầu điều chỉnh phác thảo hoặc giá thiết kế.
              Thông tin này sẽ được gửi trực tiếp đến designer để thực hiện chỉnh sửa.
            </Typography.Paragraph>
            <Typography.Paragraph strong>
              Hãy cung cấp các thông tin cụ thể:
            </Typography.Paragraph>
            <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>
              <li>Điều gì cần thay đổi trong bản phác thảo?</li>
              <li>Lý do giá thiết kế cần điều chỉnh?</li>
              <li>Các gợi ý về mức giá phù hợp (nếu có)</li>
            </ul>
          </div>
        </div>

        <EditorComponent
          value={reportManagerText}
          onChange={(content) => setReportManagerText(content)}
          height={500}
        />
      </Modal>

      <Modal
        title="Yêu cầu điều chỉnh giá vật liệu"
        open={reportMaterialModalVisible}
        onOk={handleRejectMaterialPriceSubmit}
        onCancel={() => setReportMaterialModalVisible(false)}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        width={800}
      >
        <div className="instruction-container" style={{ marginBottom: '16px' }}>
          <div style={{
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <Typography.Title level={5} style={{ color: '#52c41a', marginTop: 0 }}>
              Yêu cầu điều chỉnh giá vật liệu
            </Typography.Title>
            <Typography.Paragraph>
              Vui lòng nhập chi tiết lý do yêu cầu điều chỉnh danh sách hoặc giá vật liệu.
              Thông tin này sẽ được gửi trực tiếp đến designer để thực hiện chỉnh sửa.
            </Typography.Paragraph>
            <Typography.Paragraph strong>
              Hãy cung cấp các thông tin cụ thể:
            </Typography.Paragraph>
            <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>
              <li>Vật liệu nào cần điều chỉnh số lượng hoặc loại bỏ?</li>
              <li>Vật liệu nào cần điều chỉnh giá?</li>
              <li>Cần bổ sung vật liệu gì thêm?</li>
              <li>Các yêu cầu khác về vật liệu</li>
            </ul>
          </div>
        </div>

        <EditorComponent
          value={reportMaterialText}
          onChange={(content) => setReportMaterialText(content)}
          height={500}
        />
      </Modal>

      <Modal
        title={
          <Space>
            <FileProtectOutlined />
            <span>Hợp đồng dịch vụ</span>
          </Space>
        }
        open={isContractModalVisible}
        onCancel={() => setIsContractModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsContractModalVisible(false)}>
            Đóng
          </Button>,
          // contract?.description && (
          //   <Button 
          //     key="view" 
          //     type="primary" 
          //     href={contract.description} 
          //     target="_blank" 
          //     rel="noopener noreferrer"
          //     icon={<FilePdfOutlined />}
          //   >
          //     Mở hợp đồng
          //   </Button>
          // )
        ]}
        width={800}
      >
        {contractLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="Đang tải hợp đồng..." />
          </div>
        ) : contractError ? (
          <Alert type="error" message="Lỗi" description={contractError} />
        ) : contract ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã hợp đồng">{contract.id}</Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{contract.name}</Descriptions.Item>
            <Descriptions.Item label="Liên hệ">
              <div>{contract.phone}</div>
              <div>{contract.email}</div>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {contract.address?.replace(/\|/g, ', ') || contract.address}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {format(new Date(contract.creationDate || Date.now()), "dd/MM/yyyy HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={contract.modificationDate ? "success" : "processing"}>
                {contract.modificationDate ? "Đã ký" : "Chưa ký"}
              </Tag>
            </Descriptions.Item>
            {contract.modificationDate && (
              <Descriptions.Item label="Ngày ký">
                {format(new Date(contract.modificationDate), "dd/MM/yyyy HH:mm")}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Xem hợp đồng">
              {contract.description ? (
                <Button
                  type="primary"
                  href={contract.description}
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<FilePdfOutlined />}
                  size="large"
                >
                  Mở hợp đồng PDF
                </Button>
              ) : (
                <Text type="secondary">Không có tệp hợp đồng</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description="Không tìm thấy thông tin hợp đồng" />
        )}
      </Modal>

      <Modal
        open={isViewExternalProductModalVisible}
        onCancel={() => {
          setViewingExternalProduct(null);
          setIsViewExternalProductModalVisible(false);
        }}
        footer={null}
        title="Chi tiết sản phẩm thêm mới"
        width={900}
      >
        {viewingExternalProduct && (
          <>
            <Row gutter={16}>
              <Col span={8}>
                <Image
                  src={viewingExternalProduct.imageURL || '/placeholder.png'}
                  alt={viewingExternalProduct.name}
                  width="100%"
                  style={{ borderRadius: 8, objectFit: 'cover' }}
                />
              </Col>
              <Col span={16}>
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Tên sản phẩm">
                    <Text strong>{viewingExternalProduct.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng">
                    {viewingExternalProduct.quantity}
                  </Descriptions.Item>
                  <Descriptions.Item label="Đơn giá">
                    {(viewingExternalProduct.price === 0 && currentOrder.status === "DeterminingMaterialPrice") ? (
                      <Tag color="orange">Chờ kế toán nhập giá</Tag>
                    ) : (
                      formatPrice(viewingExternalProduct.price)
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thành tiền">
                    {(viewingExternalProduct.totalPrice === 0 && currentOrder.status === "DeterminingMaterialPrice") ? (
                      <Tag color="orange">Chưa xác định</Tag>
                    ) : (
                      <Text strong style={{ color: '#4caf50' }}>
                        {formatPrice(viewingExternalProduct.totalPrice)}
                      </Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>
                Yêu cầu về sản phẩm
              </Typography.Title>
              <div
                className="html-preview"
                style={{
                  border: '1px solid #f0f0f0',
                  padding: 12,
                  borderRadius: 4,
                  background: '#fafafa',
                  maxHeight: 300,
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d3d3d3 #f9f9f9'
                }}
                dangerouslySetInnerHTML={{ __html: viewingExternalProduct.description }}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default NewDesignOrderDetail; 