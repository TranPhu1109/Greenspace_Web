import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Space,
  Button,
  message,
  Input,
  Timeline,
  Row,
  Col,
  Divider,
  Typography,
  Badge,
  Spin,
  Image,
  Tooltip,
  Table,
  Empty,
  Collapse,
  Upload,
  Progress,
  Modal,
  Select,
  Popconfirm,
  InputNumber,
  Form,
  Switch,
  Radio,
  Alert,
  Transfer,
  Tree,
  List,
  notification,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  RightCircleOutlined,
  ArrowLeftOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  EditOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined as ClockIconForPrice,
  CheckCircleOutlined as CheckIconForPrice,
  CloseCircleOutlined as CloseIconForPrice,
  SaveOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import useDesignerTask from "@/stores/useDesignerTask";
import useProductStore from "@/stores/useProductStore";
import useAuthStore from "@/stores/useAuthStore";
import useTimeAdjustmentStore from "@/stores/useTimeAdjustmentStore";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useRecordStore from "@/stores/useRecordStore";
import useExternalProductStore from "@/stores/useExternalProductStore";
import api from "@/api/api";
import EditorComponent from "@/components/Common/EditorComponent";
import {
  getRealCurrentTime,
  getCurrentTime
} from '@/utils/timeConfig';
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// --- Helper Function for Rendering Design Price ---
const renderDesignPrice = (order) => {
  const { designPrice, status } = order;

  if (typeof designPrice !== "number" || designPrice <= 0) {
    // Show 'Chưa có' only in very early stages
    if (status === "Pending" || status === "ConsultingAndSketching") {
      return <Text type="secondary">Chưa có</Text>;
    }
    // Otherwise, if price is missing later, it might be an issue or intentional
    return <Text type="secondary">N/A</Text>;
  }

  const formattedPrice = designPrice.toLocaleString("vi-VN") + " đ";

  // Statuses indicating the price determination is done and approved (or past that point)
  const approvedOrPastApprovalStatuses = [
    "DoneDeterminingDesignPrice", // 22
    "WaitDeposit", // 21 (Implies approval)
    "DepositSuccessful", // 3
    "AssignToDesigner", // 4
    "DeterminingMaterialPrice", // 5
    "DoneDesign", // 6
    "PaymentSuccess", // 7
    "Processing", // 8
    "PickedPackageAndDelivery", // 9
    "DeliveryFail", // 10 (Price was approved before this)
    "ReDelivery", // 11
    "DeliveredSuccessfully", // 12
    "CompleteOrder", // 13
    // Note: Excludes states like ReDeterminingDesignPrice, OrderCancelled, Refund etc.
  ];

  if (approvedOrPastApprovalStatuses.includes(status)) {
    return (
      <Space>
        <Text>{formattedPrice}</Text>
        <Tag color="success" icon={<CheckIconForPrice />}>
          Đã duyệt
        </Tag>
      </Space>
    );
  }

  if (status === "DeterminingDesignPrice") {
    // 2
    return (
      <Space>
        <Text>{formattedPrice}</Text>
        <Tag color="processing" icon={<ClockIconForPrice />}>
          Chờ duyệt
        </Tag>
      </Space>
    );
  }

  if (status === "ReDeterminingDesignPrice") {
    // 24
    return (
      <Space>
        {/* Show the rejected price, maybe visually distinct */}
        <Text delete>{formattedPrice}</Text>
        <Tag color="error" icon={<CloseIconForPrice />}>
          Cần sửa lại
        </Tag>
      </Space>
    );
  }

  // Fallback for any other status where price might exist but context is unclear
  return <Text>{formattedPrice}</Text>;
};

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [report, setReport] = useState("");
  const [productDetails, setProductDetails] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const {
    currentTask: task,
    isLoading: loading,
    fetchTaskDetail,
    updateTaskStatus,
    setCurrentTask: setTask,
  } = useDesignerTask();
  const {
    getProductById,
    fetchProducts,
    products,
    fetchCategories,
    categories,
  } = useProductStore();
  const { user } = useAuthStore();
  const { isEnabled: isTestModeEnabled } = useTimeAdjustmentStore();
  const {
    sketchRecords,
    designRecords,
    getRecordSketch,
    getRecordDesign,
    resetState,
  } = useRecordStore();
  const { uploadImages, progress, error: uploadError } = useCloudinaryStorage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleDesign, setIsModalVisibleDesign] = useState(false);
  const [sketchImageUrls, setSketchImageUrls] = useState([]);
  const [sketchFiles, setSketchFiles] = useState([]);
  const [uploadingSketch, setUploadingSketch] = useState(false);
  const [sketchForm] = Form.useForm();
  const { updateServiceOrder, updateProductOrder, updateStatus } =
    useDesignOrderStore();
  const [uploadingDesign, setUploadingDesign] = useState(false);
  const [designImageUrls, setDesignImageUrls] = useState([]);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isExternalProductModalVisible, setIsExternalProductModalVisible] =
    useState(false);
  const [externalProductsList, setExternalProductsList] = useState([]);
  const [tempExternalProducts, setTempExternalProducts] = useState([]);
  const {
    addMultipleExternalProducts,
    updateExternalProduct,
    deleteExternalProduct,
  } = useExternalProductStore();
  // Generate temporary id for new external products
  const [tempIdCounter, setTempIdCounter] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [tempServiceOrderDetails, setTempServiceOrderDetails] = useState([]);
  const [maxPhaseInDesignRecords, setMaxPhaseInDesignRecords] = useState(0);
  const [isRedeterminingModal, setIsRedeterminingModal] = useState(false);
  const [currentSketchImages, setCurrentSketchImages] = useState([]);
  const [adjustPriceOnly, setAdjustPriceOnly] = useState(false);
  const [adjustImagesOnly, setAdjustImagesOnly] = useState(false);
  const [adjustmentOption, setAdjustmentOption] = useState("both"); // 'both', 'priceOnly', 'imagesOnly'
  const [showReportEditor, setShowReportEditor] = useState(false);
  const [showSketchReportEditor, setShowSketchReportEditor] = useState(false);
  const [sketchReport, setSketchReport] = useState("");
  const [materialRequirements, setMaterialRequirements] = useState("");
  const [isSavingExternalProducts, setIsSavingExternalProducts] =
    useState(false);
  const [selectedExternalProductIds, setSelectedExternalProductIds] = useState(
    []
  );
  const [justUploadedDesign, setJustUploadedDesign] = useState(false);

  // State to preserve scroll position during silent updates
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);

  // Helper functions for scroll position management
  const saveScrollPosition = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    setSavedScrollPosition(scrollY);
    console.log('💾 Saved scroll position:', scrollY);
    return scrollY;
  };

  const restoreScrollPosition = (position = savedScrollPosition) => {
    setTimeout(() => {
      window.scrollTo({
        top: position,
        behavior: 'auto' // Use 'auto' for instant scroll, 'smooth' for animated
      });
      console.log('📍 Restored scroll position:', position);
    }, 100); // Small delay to ensure DOM is updated
  };

  // Silent fetch function that doesn't trigger loading state
  const silentFetchTaskDetail = async (taskId) => {
    try {
      console.log('🔄 Silent fetch task detail for ID:', taskId);

      // Call the store function directly without triggering loading state
      // We'll use the store's fetch function but handle loading state manually
      const currentLoadingState = loading;

      // Temporarily prevent loading state changes during silent fetch
      await fetchTaskDetail(taskId);

      console.log('✅ Silent fetch completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Silent fetch failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadTaskDetail = async () => {
      if (!id) return;

      try {
        await fetchTaskDetail(id);
      } catch (error) {
        message.error("Không thể tải thông tin chi tiết công việc");
      }
    };

    loadTaskDetail();
  }, [id, fetchTaskDetail]);

  useEffect(() => {
    // Load task detail và records khi component mount với ID mới
    const loadTaskDetail = async () => {
      if (!id) return;

      try {
        await fetchTaskDetail(id);

        // Chỉ tải sketch records khi task được load thành công
        if (task?.serviceOrder?.id) {
          await getRecordSketch(task.serviceOrder.id);
          await getRecordDesign(task.serviceOrder.id);
        }
      } catch (error) {
        console.error("Error loading task detail:", error);
      }
    };

    loadTaskDetail();

    // Cleanup function - reset store khi unmount
    return () => {
      resetState(); // Reset toàn bộ records trong store
      setSketchReport(""); // Reset local state cho sketchReport
      setReport(""); // Reset local state cho report
      setShowReportEditor(false); // Reset state cho editor visibility
      setShowSketchReportEditor(false);
    };
  }, [id]);

  useEffect(() => {
    if (task && task.serviceOrder && task.serviceOrder.id) {
      getRecordSketch(task.serviceOrder.id);
      getRecordDesign(task.serviceOrder.id);
    }
  }, [task, getRecordSketch, getRecordDesign]);

  // Thêm useEffect để theo dõi phase cao nhất trong designRecords
  useEffect(() => {
    if (designRecords && designRecords.length > 0) {
      const maxPhase = Math.max(
        ...designRecords.map((record) => record.phase || 0)
      );
      setMaxPhaseInDesignRecords(maxPhase);
    } else {
      setMaxPhaseInDesignRecords(0);
    }
  }, [designRecords]);

  // Add useEffect to initialize report from task data
  useEffect(() => {
    if (task?.serviceOrder?.report) {
      setReport(task.serviceOrder.report);
    }
  }, [task]);

  // Add useEffect to initialize showSketchReportEditor based on existing report
  useEffect(() => {
    // If there's no report yet, show the editor by default
    if (task?.serviceOrder?.skecthReport) {
      setShowSketchReportEditor(false);
    } else {
      setShowSketchReportEditor(true);
    }
  }, [task?.serviceOrder?.skecthReport]);

  // Initialize materialRequirements from task data when task changes
  useEffect(() => {
    if (task?.serviceOrder?.reportAccoutant) {
      setMaterialRequirements(task.serviceOrder.reportAccoutant);
    }
  }, [task]);

  // Initialize external products from task data if available
  useEffect(() => {
    if (task?.serviceOrder?.id) {
      // Filter external products to only show ones belonging to this service order
      if (task.externalProducts && task.externalProducts.length > 0) {
        const filteredProducts = task.externalProducts.filter(
          (product) => product.serviceOrderId === task.serviceOrder.id
        );
        setExternalProductsList(filteredProducts);
      } else {
        // If not in task data, try to fetch external products
        const fetchExternalProducts = async () => {
          try {
            const { fetchExternalProducts } =
              useExternalProductStore.getState();
            const products = await fetchExternalProducts();
            if (products && products.length > 0) {
              // Filter to only show products for this service order
              const filteredProducts = products.filter(
                (product) => product.serviceOrderId === task.serviceOrder.id
              );
              setExternalProductsList(filteredProducts);
            }
          } catch (error) {
            // It's fine if there are no products yet (404)
            if (error.response && error.response.status === 404) {
              console.log(
                "No external products found, this is normal for new tasks"
              );
            } else {
              console.error("Error fetching external products:", error);
            }
          }
        };

        fetchExternalProducts();
      }
    }
  }, [task]);

  const handleDesignImageUpload = async (file) => {
    try {
      setUploadingDesign(true);
      const urls = await uploadImages([file]);
      if (urls && urls.length > 0) {
        setDesignImageUrls((prev) => [...prev, ...urls]);
        notification.success({
          message: "Thành công",
          description: "Tải lên bản vẽ thiết kế thành công",
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        });
      }
    } catch (error) {
      notification.error({
        message: "Thất bại",
        description: "Tải lên bản vẽ thiết kế thất bại",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
      });
    } finally {
      setUploadingDesign(false);
    }
    return false;
  };

  const handleDesignImageRemove = (file) => {
    setDesignImageUrls((prev) => prev.filter((url) => url !== file.url));
    return true;
  };

  const showModal = () => {
    setIsModalVisible(true);
    // Set initial form values
    sketchForm.setFieldsValue({
      designPrice: task?.serviceOrder?.designPrice,
    });

    // In case of ReDeterminingDesignPrice, also set a default message based on manager's report
    if (
      task?.serviceOrder?.status === "ReDeterminingDesignPrice" &&
      task?.serviceOrder?.reportManger
    ) {
      // If user hasn't already written a response, initialize with a template response
      if (!report) {
        const managerReport = task.serviceOrder.reportManger || "";
        setReport(`<p>Phản hồi về yêu cầu sửa giá của Manager:</p>
          <blockquote style="border-left: 3px solid #d9d9d9; padding-left: 10px; color: #666;">
            ${managerReport}
          </blockquote>
          <p>Tôi đã cập nhật lại giá thiết kế và bản phác thảo theo yêu cầu.</p>`);
      }
    }
  };

  const showModalDesign = () => {
    setIsModalVisibleDesign(true);
  };

  const handleOkSketch = async () => {
    if (!task || !task.serviceOrder) {
      notification.error({
        message: "Lỗi dữ liệu",
        description: "Dữ liệu công việc chưa sẵn sàng. Vui lòng thử lại.",
        icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    const currentOrderStatus = task.serviceOrder.status;
    const isConsulting = currentOrderStatus === "ConsultingAndSketching";
    const isReConsulting = currentOrderStatus === "ReConsultingAndSketching";
    const isReDetermining = currentOrderStatus === "ReDeterminingDesignPrice";

    const isPriceOnly = adjustmentOption === "priceOnly";
    const isImagesOnly = adjustmentOption === "imagesOnly";

    try {
      const values = await sketchForm.validateFields(); // Validate giá thiết kế
      setUploadingSketch(true);

      let uploadedUrls = [];

      // --- Step 1: Validate hình ảnh ---
      if (!isPriceOnly) {
        if (sketchFiles.length === 0) {
          if (isConsulting || isReConsulting || isReDetermining) {
            throw new Error("Bạn cần tải lên ít nhất một ảnh phác thảo.");
          }
          // Các trạng thái khác có thể không cần ảnh mới
        }

        if (sketchFiles.length > 0) {
          uploadedUrls = await uploadImages(sketchFiles);

          if (!uploadedUrls || uploadedUrls.length !== sketchFiles.length) {
            throw new Error("Tải ảnh thất bại. Vui lòng thử lại.");
          }
        } else {
          uploadedUrls = [
            task.serviceOrder.image?.imageUrl,
            task.serviceOrder.image?.image2,
            task.serviceOrder.image?.image3,
          ].filter(Boolean);
        }
      } else {
        uploadedUrls = [
          task.serviceOrder.image?.imageUrl,
          task.serviceOrder.image?.image2,
          task.serviceOrder.image?.image3,
        ].filter(Boolean);
      }

      // --- Step 2: Chuẩn bị payload ---
      const updatePayload = {
        serviceType: 1,
        designPrice: isImagesOnly
          ? task.serviceOrder.designPrice
          : values.designPrice,
        description: task.serviceOrder.description,
        status: isConsulting || isReConsulting ? 1 : isReDetermining ? 24 : 1, // tùy vào trạng thái
        report: report || task.serviceOrder.report || "", // Use the new report from the modal, or existing report, or empty string
        skecthReport: task.serviceOrder.skecthReport || "",
        reportManger: task.serviceOrder.reportManger || "",
        reportAccoutant: task.serviceOrder.reportAccoutant || "",
        image: {
          imageUrl: uploadedUrls[0] || "",
          image2: uploadedUrls[1] || "",
          image3: uploadedUrls[2] || "",
        },
      };

      // --- Step 3: Update ServiceOrder ---
      await updateServiceOrder(task.serviceOrder.id, updatePayload);

      // --- Step 4: Update ServiceOrder Status ---
      await updateStatus(task.serviceOrder.id, 2); // Chuyển sang DeterminingDesignPrice

      // --- Step 5: Update Task Status ---
      await updateTaskStatus(task.id, {
        serviceOrderId: task.serviceOrder.id,
        userId: user.id,
        dateAppointment: task.dateAppointment,
        timeAppointment: task.timeAppointment,
        status: 1, // DoneConsulting
        note: "Hoàn thành phác thảo và báo giá dự kiến.",
      });

      // --- Step 6: Refetch data ---
      await fetchTaskDetail(id);
      await getRecordSketch(task.serviceOrder.id);

      notification.success({
        message: "Thành công",
        description: "Cập nhật bản phác thảo và giá thiết kế thành công.",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        placement: "topRight",
        duration: 3,
      });
      setIsModalVisible(false);
      setSketchFiles([]);
      sketchForm.resetFields();
    } catch (error) {
      message.destroy();
      if (error.name === "ValidationError") {
        notification.error({
          message: "Thiếu thông tin",
          description: "Vui lòng nhập đầy đủ các trường thông tin bắt buộc.",
          placement: "topRight",
          duration: 3,
        });
      } else {
        notification.error({
          message: "Lỗi",
          description: error.message || "Có lỗi xảy ra. Vui lòng thử lại.",
          placement: "topRight",
          duration: 3,
        });
      }
    } finally {
      setUploadingSketch(false);
    }
  };

  const handleOkDesign = async () => {
    try {
      // Check if task and task.serviceOrder exist
      if (!task || !task.serviceOrder) {
        message.error(
          "Dữ liệu công việc chưa được tải xong. Vui lòng thử lại."
        );
        return;
      }

      // Check if we have images to upload or existing images
      if (
        designImageUrls.length === 0 &&
        !task.serviceOrder.image?.imageUrl &&
        !task.serviceOrder.image?.image2 &&
        !task.serviceOrder.image?.image3
      ) {
        notification.error({
          message: "Thiếu ảnh thiết kế",
          description: "Vui lòng tải lên ít nhất một ảnh thiết kế chi tiết.",
          icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
          placement: "topRight",
          duration: 3,
        });
        return;
      }

      setUploadingDesign(true);

      // Use existing images if no new ones are uploaded
      const uploadedUrls =
        designImageUrls.length > 0
          ? designImageUrls
          : [
              task.serviceOrder.image?.imageUrl,
              task.serviceOrder.image?.image2,
              task.serviceOrder.image?.image3,
            ].filter(Boolean);

      // Xác định phase mới dựa trên maxPhaseInDesignRecords
      const newPhase = maxPhaseInDesignRecords + 1;

      // Xác định trạng thái của service order
      const currentOrderStatus = task?.serviceOrder?.status;

      // Determine the status to use based on current order status
      let statusForRecordCreation;

      if (
        currentOrderStatus === "DepositSuccessful" ||
        currentOrderStatus === 3
      ) {
        statusForRecordCreation = 4; // AssignToDesigner
      } else if (
        currentOrderStatus === "ReDesign" ||
        currentOrderStatus === 20
      ) {
        statusForRecordCreation = 20; // Giữ nguyên trạng thái ReDesign
      } else {
        statusForRecordCreation = 4; // Default to AssignToDesigner
      }

      // Step 1: Update service order with initial status (for record creation)
      const serviceOrderUpdateData = {
        serviceType: 1,
        designPrice: task.serviceOrder.designPrice,
        description: task.serviceOrder.description,
        status: statusForRecordCreation, // Use the determined status
        report: task.serviceOrder.report || "", // Giữ lại report để biết lý do redesign
        reportManger: task.serviceOrder.reportManger || "",
        reportAccoutant: task.serviceOrder.reportAccoutant || "",
        skecthReport: task.serviceOrder.skecthReport || "",
        image: {
          imageUrl: uploadedUrls[0] || "",
          image2: uploadedUrls[1] || "",
          image3: uploadedUrls[2] || "",
        },
        // serviceOrderDetails: task.serviceOrder.serviceOrderDetails
      };

      await updateServiceOrder(task.serviceOrder.id, serviceOrderUpdateData);

      // Refresh design records after successful update
      await getRecordDesign(task.serviceOrder.id);

      // Cập nhật maxPhaseInDesignRecords với phase mới
      setMaxPhaseInDesignRecords(newPhase);

      // Set flag that design was just uploaded - hide the upload button
      setJustUploadedDesign(true);

      // Kiểm tra nếu đã đến phase 4 (lần thiết kế cuối)
      if (newPhase >= 4) {
        notification.info({
          message: "Thông báo",
          description:
            "Đây là lần cập nhật thiết kế cuối cùng. Sau lần này, khách hàng sẽ chọn một trong các thiết kế hoặc hủy đơn hàng.",
          icon: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
          placement: "topRight",
          duration: 5,
        });
      }

      notification.success({
        message: "Thành công",
        description: `Cập nhật bản vẽ thiết kế chi tiết lần ${newPhase} thành công`,
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        placement: "topRight",
        duration: 3,
      });
      setIsModalVisibleDesign(false);
      setDesignImageUrls([]);

      // Refetch task detail
      await fetchTaskDetail(id);
    } catch (error) {
      // Xử lý các trường hợp lỗi cụ thể
      if (error.response?.data?.error?.includes("maximum number of edits")) {
        notification.error({
          message: "Giới hạn chỉnh sửa",
          description:
            "Bạn đã đạt giới hạn số lần chỉnh sửa cho phép. Không thể cập nhật thêm.",
          icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
          placement: "topRight",
          duration: 4,
        });
      } else {
        notification.error({
          message: "Cập nhật thất bại",
          description: "Cập nhật bản vẽ thiết kế chi tiết thất bại",
          icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
          placement: "topRight",
          duration: 5,
        });
      }
    } finally {
      setUploadingDesign(false);
    }
  };

  const handleCancel = () => {
    // Đóng cả hai loại modal
    setIsModalVisible(false);
    setIsModalVisibleDesign(false);
    setIsRedeterminingModal(false);

    // Reset form và state
    sketchForm.resetFields();
    setSketchFiles([]);
  };

  // Hàm mở modal tùy chỉnh sản phẩm
  const showProductModal = async () => {
    try {
      // Lấy danh sách tất cả sản phẩm từ shop
      const products = await fetchProducts();
      setAllProducts(products);

      // Lấy danh sách tất cả danh mục sản phẩm
      const categories = await fetchCategories();
      setAllCategories(categories);

      // Khởi tạo danh sách sản phẩm đã chọn từ serviceOrderDetails
      const initialSelectedProducts = (task.serviceOrder.serviceOrderDetails || []).map(
        (detail) => ({
          productId: detail.productId,
          quantity: detail.quantity || 1,
        })
      );

      // Set danh sách tạm thời từ serviceOrderDetails
      setTempServiceOrderDetails(initialSelectedProducts);
      setSelectedProducts([]); // Reset selected products

      // Initialize material requirements from task data
      setMaterialRequirements(task.serviceOrder.reportAccoutant || "");

      setIsProductModalVisible(true);
    } catch (error) {
      notification.error({
        message: "Tải thất bại",
        description: "Không thể tải danh sách sản phẩm",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
        duration: 4,
      });
    }
  };

  // Hàm thêm sản phẩm mới vào danh sách tạm
  const handleAddProduct = () => {
    if (selectedProducts.length === 0) {
      message.warning("Vui lòng chọn sản phẩm");
      return;
    }

    const selectedProductId = selectedProducts[0];
    const selectedProduct = allProducts.find((p) => p.id === selectedProductId);

    if (!selectedProduct) {
      message.error("Không tìm thấy thông tin sản phẩm");
      return;
    }

    // Kiểm tra xem sản phẩm đã tồn tại trong danh sách tạm chưa
    const existingProduct = tempServiceOrderDetails.find(
      (item) => item.productId === selectedProductId
    );

    if (existingProduct) {
      message.warning("Sản phẩm này đã có trong danh sách");
      return;
    }

    // Thêm sản phẩm mới vào danh sách tạm
    const newProduct = {
      productId: selectedProductId,
      quantity: 1,
      price: selectedProduct.price || 0,
      totalPrice: selectedProduct.price || 0,
    };

    // Cập nhật danh sách tạm thời
    setTempServiceOrderDetails((prev) => [...prev, newProduct]);
    setSelectedProducts([]); // Reset selected products

    message.success(`Đã thêm sản phẩm "${selectedProduct.name}" vào danh sách`);
  };

  // Hàm xóa sản phẩm khỏi danh sách tạm
  const handleRemoveProduct = (productId) => {
    const productToRemove = allProducts.find((p) => p.id === productId);

    // Cập nhật danh sách tạm thời bằng cách lọc bỏ sản phẩm
    setTempServiceOrderDetails((prev) =>
      prev.filter((item) => item.productId !== productId)
    );

    if (productToRemove) {
      message.success(
        `Đã xóa sản phẩm "${productToRemove.name}" khỏi danh sách`
      );
    }
  };

  // Hàm cập nhật số lượng sản phẩm trong danh sách tạm
  const handleUpdateQuantity = (productId, quantity) => {
    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity < 1) {
      notification.warning({
        message: "Cảnh báo",
        description: "Số lượng phải là số nguyên dương",
        icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
        placement: "topRight",
        duration: 4,
      });
      return;
    }

    const product = allProducts.find((p) => p.id === productId);
    const price = product?.price || 0;

    // Cập nhật số lượng và tổng giá trong danh sách tạm thời
    setTempServiceOrderDetails((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
              price: price,
              totalPrice: price * newQuantity,
            }
          : item
      )
    );
  };
  // Hàm lưu danh sách sản phẩm đã tùy chỉnh
  const handleSaveProducts = async () => {
    try {
      // Kiểm tra xem có sản phẩm nào trong danh sách tạm không
      if (tempServiceOrderDetails.length === 0) {
        notification.warning({
          message: "Cảnh báo",
          description: "Vui lòng thêm ít nhất một sản phẩm",
          icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
          placement: "topRight",
          duration: 4,
        });
        return;
      }

      // Kiểm tra số lượng của từng sản phẩm trong danh sách tạm
      const invalidProducts = tempServiceOrderDetails.filter(
        (item) => !item.quantity || item.quantity <= 0
      );
      if (invalidProducts.length > 0) {
        notification.warning({
          message: "Cảnh báo",
          description: "Vui lòng kiểm tra lại số lượng sản phẩm",
          icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
          placement: "topRight",
          duration: 4,
        });
        return;
      }

      // Đảm bảo mỗi sản phẩm có đầy đủ thông tin
      const updatedServiceOrderDetails = tempServiceOrderDetails.map((item) => {
        const product = allProducts.find((p) => p.id === item.productId);
        const price = product?.price || 0;
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: price,
          totalPrice: price * item.quantity
        };
      });

      // Cập nhật service order với danh sách sản phẩm từ mảng tạm
      const serviceOrderUpdateData = {
        serviceType: 1,
        designPrice: task.serviceOrder.designPrice,
        description: task.serviceOrder.description,
        skecthReport: task.serviceOrder.skecthReport || "",
        status: 4, // AssignToDesigner
        report: task.serviceOrder.report || "",
        reportManger: task.serviceOrder.reportManger || "",
        reportAccoutant: materialRequirements, // Include material requirements
        serviceOrderDetails: updatedServiceOrderDetails, // Sử dụng danh sách đã được cập nhật
      };

      try {
        console.log('🔄 Updating product order with data:', serviceOrderUpdateData);

        // Retry mechanism for optimistic concurrency issues
        let retryCount = 0;
        const maxRetries = 3;
        let response;

        while (retryCount < maxRetries) {
          try {
            response = await updateProductOrder(
              task.serviceOrder.id,
              serviceOrderUpdateData
            );
            console.log('✅ Update product order response:', response);
            break; // Success, exit retry loop
          } catch (retryError) {
            retryCount++;
            console.warn(`⚠️ Retry attempt ${retryCount}/${maxRetries} failed:`, retryError.message);

            if (retryCount >= maxRetries) {
              throw retryError; // Re-throw if max retries reached
            }

            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));

            // Refetch latest task data before retry
            console.log('🔄 Refetching latest task data before retry...');
            const latestTask = await fetchTaskDetail(id);
            if (latestTask?.serviceOrder) {
              // Update serviceOrderUpdateData with latest data
              serviceOrderUpdateData.designPrice = latestTask.serviceOrder.designPrice;
              serviceOrderUpdateData.description = latestTask.serviceOrder.description;
              serviceOrderUpdateData.report = latestTask.serviceOrder.report || "";
              serviceOrderUpdateData.reportManger = latestTask.serviceOrder.reportManger || "";
              serviceOrderUpdateData.reportAccoutant = materialRequirements; // Keep user input
              serviceOrderUpdateData.skecthReport = latestTask.serviceOrder.skecthReport || "";
            }
          }
        }

        // Làm mới dữ liệu sau khi cập nhật
        console.log('🔄 Loading product details for updated products:', updatedServiceOrderDetails);
        await loadProductDetails(updatedServiceOrderDetails);

        notification.success({
          message: "Thành công",
          description: "Cập nhật danh sách sản phẩm và yêu cầu vật liệu thành công",
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
          placement: "topRight",
          duration: 4,
        });
        setIsProductModalVisible(false); // Tự động tắt modal sau khi cập nhật thành công

        // Update local task state instead of refetching to avoid page reload and scroll position loss
        if (task && task.serviceOrder) {
          // Create updated service order details with complete price information
          const updatedServiceOrderDetailsWithPrices = updatedServiceOrderDetails.map((item) => {
            const product = allProducts.find((p) => p.id === item.productId);
            const price = product?.price || item.price || 0;
            return {
              ...item,
              price: price,
              totalPrice: price * item.quantity
            };
          });

          // Update the task's serviceOrder with new data
          const updatedTask = {
            ...task,
            serviceOrder: {
              ...task.serviceOrder,
              serviceOrderDetails: updatedServiceOrderDetailsWithPrices,
              reportAccoutant: materialRequirements,
            }
          };

          console.log('🔄 Updating local task state with:', updatedTask.serviceOrder.serviceOrderDetails);
          // Update the current task in store to reflect changes without refetching
          setTask(updatedTask);
        }
      } catch (apiError) {
        console.error('❌ Update product order failed:', apiError);
        console.error('❌ Error response:', apiError.response?.data);
        console.error('❌ Error status:', apiError.response?.status);

        // Xử lý các trường hợp lỗi cụ thể
        if (
          apiError.response?.data?.error?.includes("maximum number of edits")
        ) {
          notification.error({
            message: "Giới hạn chỉnh sửa",
            description: "Bạn đã đạt giới hạn số lần chỉnh sửa cho phép. Không thể cập nhật thêm.",
            icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
            placement: "topRight",
            duration: 4,
          });
        } else if (
          apiError.response?.data?.message?.includes("database operation was expected to affect") ||
          apiError.response?.data?.message?.includes("optimistic concurrency") ||
          apiError.message?.includes("database operation was expected to affect")
        ) {
          notification.error({
            message: "Xung đột dữ liệu",
            description: "Dữ liệu đã được cập nhật bởi người khác. Vui lòng tải lại trang và thử lại.",
            icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
            placement: "topRight",
            duration: 6,
            btn: (
              <Button
                type="primary"
                size="small"
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </Button>
            ),
          });
        } else {
          const errorMessage = apiError.response?.data?.message ||
                              apiError.response?.data?.error ||
                              apiError.message ||
                              'Cập nhật danh sách sản phẩm thất bại';

          notification.error({
            message: "Cập nhật thất bại",
            description: errorMessage,
            icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
            placement: "topRight",
            duration: 5,
          });
        }
      }
    } catch (error) {
      notification.error({
        message: "Lỗi xử lý",
        description: "Có lỗi xảy ra khi xử lý yêu cầu",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
        duration: 4,
      });
    }
  };

  // Hàm hoàn tất quá trình cập nhật bản vẽ và tùy chỉnh sản phẩm
  const handleCompleteDesign = async () => {
    try {
      // Step 1: Update service order status to DoneDesign (6)
      const response = await api.put(
        `/api/serviceorder/status/${task.serviceOrder.id}`,
        {
          status: 5, // DoneDesign
          deliveryCode: "",
          reportAccoutant: task.serviceOrder.reportAccoutant || "",
          report: task.serviceOrder.report || "",
          reportManger: task.serviceOrder.reportManger || "",
        }
      );

      // Check if the response has data property or is directly the success message
      const responseStatus = response?.data || response;

      // Check various possible response formats
      const isSuccess =
        responseStatus === "Update Successfully!" ||
        responseStatus === "Update Successfully" ||
        responseStatus?.includes?.("Success") ||
        response?.status === 200;

      if (isSuccess) {
        // Step 2: Update task status to 3
        try {
          const taskUpdateResponse = await updateTaskStatus(task.id, {
            serviceOrderId: task.serviceOrder.id,
            userId: user.id,
            dateAppointment: task.dateAppointment,
            timeAppointment: task.timeAppointment,
            status: 3, // Update to status 3 as requested
            note: "Hoàn tất thiết kế chi tiết và sản phẩm đã được chọn",
          });

          // Reset justUploadedDesign state so new designs can be uploaded if needed
          setJustUploadedDesign(false);

          // Refresh task data
          fetchTaskDetail(id);

          notification.success({
            message: "Thành công",
            description: "Hoàn tất quá trình cập nhật bản vẽ và tùy chỉnh sản phẩm",
            icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
            placement: "topRight",
            duration: 4,
          });
        } catch (taskUpdateError) {
          notification.error({
            message: "Cập nhật công việc thất bại",
            description: `Đã cập nhật trạng thái đơn hàng nhưng không thể cập nhật trạng thái công việc`,
            icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
            placement: "topRight",
            duration: 5,
          });
        }
      } else {
        notification.error({
          message: "Cập nhật thất bại",
          description: "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.",
          icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
          placement: "topRight",
          duration: 4,
        });
      }
    } catch (error) {
      notification.error({
        message: "Hoàn tất thiết kế thất bại",
        description: `Lỗi khi hoàn tất thiết kế`,
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
        duration: 5,
      });
    }
  };

  useEffect(() => {
    const loadTaskDetail = async () => {
      if (!id) {
        return; // Exit if no ID
      }

      try {
        const taskData = await fetchTaskDetail(id);
        if (taskData?.serviceOrder?.serviceOrderDetails?.length > 0) {
          loadProductDetails(taskData.serviceOrder.serviceOrderDetails);
        }

        // --- Check for sketch records ---
        const status = taskData?.serviceOrder?.status;

        if (
          status &&
          status !== "Pending" &&
          status !== "ConsultingAndSketching"
        ) {
          await getRecordSketch(taskData.serviceOrder.id);
        }

        // --- Check for design records (load only when status is AssignToDesigner or later) ---
        const statusValue =
          typeof taskData?.serviceOrder?.status === "string"
            ? taskData?.serviceOrder?.status
            : "";
        const isAfterAssignToDesigner =
          statusValue === "AssignToDesigner" ||
          statusValue === "DeterminingMaterialPrice" ||
          statusValue === "DoneDesign" ||
          statusValue === "PaymentSuccess" ||
          statusValue === "Processing" ||
          statusValue === "PickedPackageAndDelivery" ||
          statusValue === "DeliveryFail" ||
          statusValue === "ReDelivery" ||
          statusValue === "DeliveredSuccessfully" ||
          statusValue === "CompleteOrder";

        if (status && isAfterAssignToDesigner) {
          await getRecordDesign(taskData.serviceOrder.id);
        }
        // --- End check for records ---
      } catch (error) {
        // !!! IMPORTANT: MUST HAVE ERROR LOGGING !!!
        //message.error(`Lỗi khi tải chi tiết công việc: ${error.message}`);
      }
    };
    loadTaskDetail();
  }, [id, fetchTaskDetail, getRecordSketch, getRecordDesign]);

  useEffect(() => {
    if (products.length > 0 && task?.serviceOrder?.serviceOrderDetails) {
      loadProductDetails(task.serviceOrder.serviceOrderDetails);
    }
  }, [products, task]);

  const loadProductDetails = async (orderDetails) => {
    console.log('🔄 loadProductDetails called with:', orderDetails);
    if (!orderDetails || orderDetails.length === 0) {
      console.log('⚠️ No order details to load');
      return;
    }

    setLoadingProducts(true);
    try {
      const productPromises = orderDetails.map((detail) =>
        getProductById(detail.productId)
          .then((product) => ({
            productId: detail.productId,
            product,
            quantity: detail.quantity,
            price: detail.price,
            totalPrice: detail.totalPrice,
          }))
          .catch(() => ({
            productId: detail.productId,
            product: null,
            quantity: detail.quantity,
            price: detail.price,
            totalPrice: detail.totalPrice,
          }))
      );

      const results = await Promise.all(productPromises);
      const productMap = {};
      results.forEach((result) => {
        productMap[result.productId] = result;
      });

      console.log('✅ Product details loaded:', productMap);
      setProductDetails(productMap);
    } catch (error) {
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải thông tin sản phẩm",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      ConsultingAndSket: "blue",
      ConsultingAndSketching: "blue",
      Design: "processing",
      Completed: "success",
      Cancelled: "error",
      DeterminingDesignPrice: "blue",
      DepositSuccessful: "blue",
      AssignToDesigner: "blue",
      DeterminingMaterialPrice: "blue",
      DoneDesign: "success",
      PaymentSuccess: "success",
      Processing: "processing",
      PickedPackageAndDelivery: "blue",
      DeliveryFail: "error",
      ReDelivery: "warning",
      DeliveredSuccessfully: "success",
      CompleteOrder: "success",
      OrderCancelled: "error",
      Warning: "warning",
      Refund: "error",
      DoneRefund: "success",
      StopService: "error",
      ReConsultingAndSketching: "warning",
      ReDesign: "warning",
      WaitDeposit: "blue",
      DoneDeterminingDesignPrice: "blue",
      ReDeterminingDesignPrice: "warning",
      ExchangeProdcut: "blue",
      WaitForScheduling: "blue",
      Installing: "blue",
      DoneInstalling: "success",
      ReInstall: "blue",
      CustomerConfirm: "blue",
      Successfully: "success",
      ReDetermineMaterialPrice: "warning",
      MaterialPriceConfirmed: "success",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      ConsultingAndSket: "Tư vấn & Phác thảo",
      ConsultingAndSketching: "Tư vấn & Phác thảo",
      Design: "Đang thiết kế",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
      DeterminingDesignPrice: "Xác định giá thiết kế",
      DepositSuccessful: "Đặt cọc thành công",
      AssignToDesigner: "Giao cho designer",
      DeterminingMaterialPrice: "Xác định giá vật liệu",
      DoneDesign: "Hoàn tất thiết kế",
      PaymentSuccess: "Thanh toán thành công",
      Processing: "Đang xử lý",
      PickedPackageAndDelivery: "Đã lấy hàng & Giao hàng",
      DeliveryFail: "Giao hàng thất bại",
      ReDelivery: "Giao hàng lại",
      DeliveredSuccessfully: "Giao hàng thành công",
      CompleteOrder: "Hoàn tất đơn hàng",
      OrderCancelled: "Đơn hàng đã hủy",
      Warning: "Cảnh báo",
      Refund: "Hoàn tiền",
      DoneRefund: "Hoàn tiền thành công",
      StopService: "Dừng dịch vụ",
      ReConsultingAndSketching: "Tư vấn & Phác thảo lại",
      ReDesign: "Thiết kế lại",
      WaitDeposit: "Chờ đặt cọc",
      DoneDeterminingDesignPrice: "Hoàn tất xác định giá thiết kế",
      ReDeterminingDesignPrice: "Xác định giá thiết kế lại",
      ExchangeProdcut: "Đổi sản phẩm",
      WaitForScheduling: "Chờ lịch hẹn",
      Installing: "Đang lắp đặt",
      DoneInstalling: "Hoàn tất lắp đặt",
      ReInstall: "Lắp đặt lại",
      CustomerConfirm: "Khách hàng xác nhận",
      Successfully: "Thành công",
      ReDetermineMaterialPrice: "Xác định giá vật liệu lại",
      MaterialPriceConfirmed: "Giá vật liệu đã xác định",
    };
    return statusTexts[status] || status;
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateTaskStatus(id, newStatus);
      notification.success({
        message: "Cập nhật thành công",
        description: "Đã cập nhật trạng thái công việc",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        placement: "topRight",
        duration: 4,
      });
    } catch (error) {
      notification.error({
        message: "Cập nhật thất bại",
        description: "Không thể cập nhật trạng thái",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
        duration: 4,
      });
    }
  };

  // Add function to toggle report editor visibility
  const toggleSketchReportEditor = () => {
    // Khi đóng editor, reset giá trị report về giá trị ban đầu
    if (!showSketchReportEditor) {
      // Nếu đang mở và đóng xuống, reset về giá trị trong serviceOrder nếu có
      setSketchReport(task?.serviceOrder?.skecthReport || "");
    }
    setShowSketchReportEditor((prev) => !prev);
  };

  // Modified handleUpdateReport to hide the editor after successful update
  const handleUpdateSketchReport = async () => {
    if (!task || !task.serviceOrder) {
      notification.error({
        message: "Lỗi dữ liệu",
        description: "Dữ liệu công việc chưa được tải xong. Vui lòng thử lại.",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
        duration: 4,
      });
      return;
    }

    const currentOrderStatus = task?.serviceOrder?.status;

    // Use Test Mode time if enabled, otherwise use real time
    const now = isTestModeEnabled ? getCurrentTime().toDate() : getRealCurrentTime().toDate();
    const appointmentDate = new Date(task.serviceOrder.dateAppointment);

    if (now < appointmentDate) {
      notification.warning({
        message: "Chưa đến ngày hẹn",
        description: "Bạn không thể lưu ghi chú vào thời điểm này.",
        icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
        placement: "topRight",
        duration: 4,
      });
      return;
    }

    if (!sketchReport || sketchReport.trim() === "") {
      notification.warning({
        message: "Thiếu nội dung ghi chú",
        description: "Vui lòng nhập nội dung ghi chú trước khi lưu.",
        placement: "topRight",
        duration: 3,
        icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
      });
      return;
    }

    // Map status names to their numeric values
    const statusMap = {
      Pending: 0,
      ConsultingAndSketching: 1,
      DeterminingDesignPrice: 2,
      DepositSuccessful: 3,
      AssignToDesigner: 4,
      DeterminingMaterialPrice: 5,
      DoneDesign: 6,
      PaymentSuccess: 7,
      Processing: 8,
      PickedPackageAndDelivery: 9,
      DeliveryFail: 10,
      ReDelivery: 11,
      DeliveredSuccessfully: 12,
      CompleteOrder: 13,
      OrderCancelled: 14,
      Warning: 15,
      Refund: 16,
      DoneRefund: 17,
      StopService: 18,
      ReConsultingAndSketching: 19,
      ReDesign: 20,
      WaitDeposit: 21,
      DoneDeterminingDesignPrice: 22,
      DoneDeterminingMaterialPrice: 23,
      ReDeterminingDesignPrice: 24,
      ExchangeProdcut: 25,
      WaitForScheduling: 26,
      Installing: 27,
      DoneInstalling: 28,
      ReInstall: 29,
      CustomerConfirm: 30,
      Successfully: 31,
    };

    // If currentOrderStatus is a number, use it directly, otherwise look up the numeric value
    const statusForUpdateReport =
      typeof currentOrderStatus === "number"
        ? currentOrderStatus
        : statusMap[currentOrderStatus] || 0;

    try {
      // Prepare service order data
      const serviceOrderUpdateData = {
        serviceType: 1,
        designPrice: task.serviceOrder.designPrice,
        description: task.serviceOrder.description,
        status: statusForUpdateReport,
        report: task.serviceOrder.report || "",
        reportManger: task.serviceOrder.reportManger || "",
        reportAccoutant: task.serviceOrder.reportAccoutant || "",
        skecthReport: sketchReport,
        // Do NOT include image
      };

      await updateServiceOrder(task.serviceOrder.id, serviceOrderUpdateData);
      notification.success({
        message: "Thành công",
        description: "Cập nhật ghi chú / báo cáo thành công",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        placement: "topRight",
        duration: 4,
      });

      // Hide the editor after successful update
      setShowReportEditor(false);

      // Refresh task detail
      await fetchTaskDetail(id);
    } catch (error) {
      notification.error({
        message: "Cập nhật ghi chú thất bại",
        description: `Lỗi khi cập nhật ghi chú / báo cáo`,
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
        duration: 5,
      });
    }
  };

  // Lấy bản phác thảo của phase lớn nhất
  const highestPhaseSketch = useMemo(() => {
    if (!sketchRecords || sketchRecords.length === 0) return null;

    // Tìm phase lớn nhất
    const maxPhase = Math.max(
      ...sketchRecords.map((record) => record.phase || 0)
    );

    // Lọc các bản ghi có phase lớn nhất
    return sketchRecords.filter((record) => record.phase === maxPhase);
  }, [sketchRecords]);

  // Hàm mở modal điều chỉnh phác thảo khi ở trạng thái ReDeterminingDesignPrice
  const showRedeterminingModal = () => {
    // Lấy hình ảnh từ bản phác thảo phase cao nhất
    if (highestPhaseSketch && highestPhaseSketch.length > 0) {
      const record = highestPhaseSketch[0];
      const images = [];

      if (record.image?.imageUrl) images.push(record.image.imageUrl);
      if (record.image?.image2) images.push(record.image.image2);
      if (record.image?.image3) images.push(record.image.image3);

      setCurrentSketchImages(images);
    }

    // Đặt lại các state
    setAdjustmentOption("both");

    // Thiết lập form giá ban đầu
    sketchForm.setFieldsValue({
      designPrice: task?.serviceOrder?.designPrice || 0,
    });

    // Thiết lập report ban đầu nếu chưa có
    if (!report) {
      const managerReport = task.serviceOrder.reportManger || "";
      setReport(`<p><strong>Phản hồi về yêu cầu điều chỉnh của Manager:</strong></p>
        <blockquote style="border-left: 3px solid #f5222d; padding-left: 10px; color: #666; background-color: #fff1f0; padding: 10px;">
          ${managerReport}
        </blockquote>
        <p>Tôi đã điều chỉnh theo yêu cầu với các thay đổi sau:</p>
        <ul>
          <li>...</li>
        </ul>`);
    }

    // Hiển thị modal
    setIsRedeterminingModal(true);
  };

  // Hàm xử lý khi designer thay đổi tùy chọn điều chỉnh
  const handleAdjustmentOptionChange = (e) => {
    setAdjustmentOption(e.target.value);
  };

  // Hàm xử lý khi người dùng nhấn OK trên modal điều chỉnh
  const handleRedeterminingOk = async () => {
    // Gọi hàm hiện tại để xử lý form
    await handleOkSketch();

    // Đóng modal
    setIsRedeterminingModal(false);
  };

  // Add an empty external product to the temporary list
  const addEmptyExternalProduct = () => {
    const tempId = `temp-${tempIdCounter}`;
    setTempIdCounter((prevCounter) => prevCounter + 1);

    setTempExternalProducts((prev) => [
      ...prev,
      {
        tempId,
        name: "",
        quantity: 1,
        description: "",
        imageURL: "",
        // For UI tracking
        isNew: true,
        tempFile: null,
        tempImageUrl: "",
      },
    ]);
  };

  // Handle external product name change
  const handleExternalProductNameChange = (tempId, value) => {
    setTempExternalProducts((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, name: value } : item
      )
    );
  };

  // Handle external product quantity change
  const handleExternalProductQuantityChange = (tempId, value) => {
    setTempExternalProducts((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, quantity: value } : item
      )
    );
  };

  // Update the description change handler to handle the HTML content from EditorComponent
  const handleExternalProductDescriptionChange = (tempId, value) => {
    setTempExternalProducts((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, description: value } : item
      )
    );
  };

  // Handle external product image upload
  const handleExternalProductImageUpload = async (tempId, file) => {
    // Save the file and create a temporary URL for preview
    setTempExternalProducts((prev) =>
      prev.map((item) =>
        item.tempId === tempId
          ? {
              ...item,
              tempFile: file,
              tempImageUrl: URL.createObjectURL(file),
            }
          : item
      )
    );
    return false; // Prevent default upload behavior
  };

  // Remove an external product from the temporary list
  const removeExternalProduct = (tempId) => {
    setTempExternalProducts((prev) =>
      prev.filter((item) => item.tempId !== tempId)
    );
  };

  // Update validateExternalProducts function to check for images
  const validateExternalProducts = () => {
    let isValid = true;
    let errorMessage = "";

    for (const product of tempExternalProducts) {
      if (!product.name || product.name.trim() === "") {
        isValid = false;
        errorMessage = "Tên sản phẩm không được để trống";
        break;
      }

      if (!product.quantity || product.quantity <= 0) {
        isValid = false;
        errorMessage = "Số lượng sản phẩm phải lớn hơn 0";
        break;
      }

      // Add validation for image
      if (!product.tempImageUrl && !product.imageURL) {
        isValid = false;
        errorMessage = "Vui lòng tải lên hình ảnh cho sản phẩm";
        break;
      }

      // Add validation for description/requirements
      if (!product.description || product.description.trim() === "") {
        isValid = false;
        errorMessage = "Vui lòng nhập yêu cầu về sản phẩm";
        break;
      }
    }

    return { isValid, errorMessage };
  };

  // Upload images for external products and return data with imageURL
  const uploadExternalProductImages = async () => {
    const productsWithImages = [];

    for (const product of tempExternalProducts) {
      try {
        let imageURL = product.imageURL || "";

        // If there's a temporary file, upload it
        if (product.tempFile) {
          const urls = await uploadImages([product.tempFile]);
          if (urls && urls.length > 0) {
            imageURL = urls[0];
          }
        }

        productsWithImages.push({
          ...product,
          imageURL,
        });
      } catch (error) {
        throw new Error(
          `Không thể tải lên hình ảnh cho sản phẩm ${product.name}`
        );
      }
    }

    return productsWithImages;
  };

  // Handle external products save
  const handleSaveExternalProducts = async () => {
    try {
      // Save current scroll position before starting save process
      const currentScrollPosition = saveScrollPosition();

      // Set loading state
      setIsSavingExternalProducts(true);

      // Ensure we have a valid service order ID
      if (!task?.serviceOrder?.id) {
        notification.error({
          message: "Không tìm thấy đơn hàng",
          description: "Không tìm thấy thông tin đơn hàng",
          icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
          placement: "topRight",
          duration: 4,
        });
        setIsSavingExternalProducts(false);
        return;
      }

      // Validate products
      const { isValid, errorMessage } = validateExternalProducts();
      if (!isValid) {
        message.error(errorMessage);
        setIsSavingExternalProducts(false);
        return;
      }

      // If valid, upload images
      const productsWithImages = await uploadExternalProductImages();

      // Format products for API - ensure each product has the correct serviceOrderId
      const productsForApi = productsWithImages.map(
        ({ tempId, isNew, tempFile, tempImageUrl, ...rest }) => ({
          ...rest,
          serviceOrderId: task.serviceOrder.id,
        })
      );

      // Add products via API
      await addMultipleExternalProducts(productsForApi, task.serviceOrder.id);

      notification.success({
        message: "Thành công",
        description: "Thêm sản phẩm mới thành công",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        placement: "topRight",
        duration: 4,
      });

      // Update the list with only products for this service order
      setExternalProductsList((prev) => [
        ...prev.filter((item) => item.serviceOrderId === task.serviceOrder.id),
        ...productsForApi,
      ]);

      setTempExternalProducts([]);
      setIsExternalProductModalVisible(false);

      // Silent fetch to update data without loading state and restore scroll position
      console.log('🔄 Starting silent data refresh after saving external products...');

      // Fetch updated task data silently (without loading state)
      try {
        // Use the silent fetch function that doesn't trigger loading state
        await silentFetchTaskDetail(id);

        // Restore scroll position after data is updated
        restoreScrollPosition(currentScrollPosition);

        console.log('✅ Silent data refresh completed, scroll position restored');
      } catch (silentFetchError) {
        console.warn('⚠️ Silent fetch failed, but save was successful:', silentFetchError);
        // Still restore scroll position even if silent fetch fails
        restoreScrollPosition(currentScrollPosition);
      }
    } catch (error) {
      message.error(
        "Có lỗi xảy ra khi lưu sản phẩm: " +
          (error.message || "Lỗi không xác định")
      );
    } finally {
      // Reset loading state
      setIsSavingExternalProducts(false);
    }
  };

  // External product delete handler
  const handleDeleteExternalProduct = async (productId) => {
    try {
      await deleteExternalProduct(productId);
      notification.success({
        message: "Thành công",
        description: "Xóa sản phẩm thành công",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        placement: "topRight",
        duration: 4,
      });

      // Update local state
      setExternalProductsList((prev) =>
        prev.filter((item) => item.id !== productId)
      );

      // Refresh task to get updated data
      fetchTaskDetail(id);
    } catch (error) {
      notification.error({
        message: "Xóa thất bại",
        description: "Không thể xóa sản phẩm",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
        duration: 4,
      });
    }
  };

  // Handle bulk delete of external products
  const handleBulkDeleteExternalProducts = async () => {
    if (selectedExternalProductIds.length === 0) {
      notification.warning({
        message: "Thiếu lựa chọn",
        description: "Vui lòng chọn ít nhất một sản phẩm để xóa",
        icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
        placement: "topRight",
        duration: 4,
      });
      return;
    }

    try {
      // Show loading message
      const loadingMessage = message.loading(
        `Đang xóa ${selectedExternalProductIds.length} sản phẩm...`,
        0
      );

      // Delete each product sequentially
      for (const productId of selectedExternalProductIds) {
        await deleteExternalProduct(productId);
      }

      // Close loading message
      loadingMessage();

      notification.success({
        message: "Xóa thành công",
        description: `Đã xóa ${selectedExternalProductIds.length} sản phẩm thành công`,
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        placement: "topRight",
        duration: 4,
      });

      // Update local state
      setExternalProductsList((prev) =>
        prev.filter((item) => !selectedExternalProductIds.includes(item.id))
      );
      setSelectedExternalProductIds([]); // Clear selection

      // Refresh task to get updated data
      fetchTaskDetail(id);
    } catch (error) {
      notification.error({
        message: "Xóa thất bại",
        description: "Có lỗi xảy ra khi xóa sản phẩm",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        placement: "topRight",
        duration: 4,
      });
    }
  };

  // Row selection for external products table
  const rowSelection = {
    selectedRowKeys: selectedExternalProductIds,
    onChange: (selectedRowKeys) => {
      setSelectedExternalProductIds(selectedRowKeys);
    },
  };

  // Open external product modal
  const showExternalProductModal = () => {
    setTempExternalProducts([]);
    setIsExternalProductModalVisible(true);
    addEmptyExternalProduct(); // Start with one empty product
  };

  // Add state for edit modal
  const [
    isEditExternalProductModalVisible,
    setIsEditExternalProductModalVisible,
  ] = useState(false);
  const [editingExternalProduct, setEditingExternalProduct] = useState(null);
  const [editExternalProductForm] = Form.useForm();
  const [isEditingExternalProduct, setIsEditingExternalProduct] =
    useState(false);

  // Add function to handle edit product
  const handleEditExternalProduct = (productId) => {
    const product = externalProductsList.find((p) => p.id === productId);
    if (!product) return;

    setEditingExternalProduct(product);
    editExternalProductForm.setFieldsValue({
      name: product.name,
      quantity: product.quantity,
      description: product.description || "",
    });

    // Force render after setting form values to ensure EditorComponent gets the value
    setTimeout(() => {
      editExternalProductForm.validateFields(["description"]);
    }, 100);

    setIsEditExternalProductModalVisible(true);
  };

  // Add function to save edited product
  const handleSaveEditedExternalProduct = async () => {
    try {
      const values = await editExternalProductForm.validateFields();
      setIsEditingExternalProduct(true);

      // Prepare data to update
      const updatedData = {
        name: values.name,
        quantity: parseInt(values.quantity),
        description: values.description,
        imageURL: editingExternalProduct.imageURL || "",
      };

      // If there's a new image to upload
      if (values.tempFile) {
        const uploadedUrls = await uploadImages([values.tempFile]);
        if (uploadedUrls && uploadedUrls.length > 0) {
          updatedData.imageURL = uploadedUrls[0];
        }
      }

      // Update external product
      await updateExternalProduct(editingExternalProduct.id, updatedData);

      // Update local state
      setExternalProductsList((prevList) =>
        prevList.map((item) =>
          item.id === editingExternalProduct.id
            ? {
                ...item,
                ...updatedData,
              }
            : item
        )
      );

      notification.success({
        message: "Cập nhật thành công",
        description: "Đã cập nhật sản phẩm thành công",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        placement: "topRight",
        duration: 4,
      });
      setIsEditExternalProductModalVisible(false);

      // Refresh task to update data
      fetchTaskDetail(id);
    } catch (error) {
      message.error(
        "Không thể cập nhật sản phẩm: " +
          (error.message || "Lỗi không xác định")
      );
    } finally {
      setIsEditingExternalProduct(false);
    }
  };

  // Handle external product image upload for editing
  const handleEditExternalProductImageUpload = async (file) => {
    // Tạo URL tạm thời từ file để hiển thị preview
    const tempImageUrl = URL.createObjectURL(file);

    // Cập nhật form với dữ liệu mới
    editExternalProductForm.setFieldsValue({
      tempFile: file,
      tempImageUrl: tempImageUrl,
    });

    // Buộc re-render UI để hiển thị hình mới
    setEditingExternalProduct((prev) => ({
      ...prev,
      tempImageUrl: tempImageUrl,
    }));

    return false; // Prevent default upload behavior
  };

  // Add function to remove new uploaded image and restore original
  const handleRemoveNewImage = (e) => {
    e.stopPropagation(); // Prevent triggering the Upload click event

    // Xóa file tạm và URL tạm khỏi form
    editExternalProductForm.setFieldsValue({
      tempFile: null,
      tempImageUrl: null,
    });

    // Cập nhật lại state để hiển thị hình gốc
    setEditingExternalProduct((prev) => {
      const updated = { ...prev };
      delete updated.tempImageUrl;
      return updated;
    });

    // message.success('Đã hủy hình mới và khôi phục hình cũ');
  };

  // Create external products columns dynamically based on task status
  const createExternalProductColumns = () => {
    // Check if actions column should be visible
    const showActionsColumn =
      (task.status === "Design" || task.status === "DoneDesign") &&
      (task.serviceOrder.status === "DepositSuccessful" ||
        task.serviceOrder.status === "ReDesign" ||
        task.serviceOrder.status === "AssignToDesigner");

    // Base columns always displayed
    const baseColumns = [
      {
        title: "Sản phẩm",
        dataIndex: "name",
        key: "name",
        width: 180,
        render: (text, record) => (
          <div className="flex items-center">
            {record.imageURL ? (
              <Image
                src={record.imageURL}
                alt={text}
                width={50}
                height={50}
                className="object-cover rounded mr-3"
                style={{ marginRight: "10px", borderRadius: "8px" }}
              />
            ) : (
              <div className="w-[50px] h-[50px] bg-gray-200 rounded mr-3 flex items-center justify-center">
                <ShoppingOutlined className="text-gray-400 text-xl" />
              </div>
            )}
            <div style={{ marginLeft: "10px" }}>
              <div className="font-medium">{text}</div>
              <div className="text-xs text-gray-500">
                ID: {record.id?.substring(0, 8) || "Mới"}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Yêu cầu về sản phẩm",
        dataIndex: "description",
        key: "description",
        render: (text) => {
          if (!text) return <Text type="secondary">Không có mô tả</Text>;

          return (
            <Tooltip
              overlay={
                <div
                  className="html-preview"
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              }
              color="white"
              styles={{
                body: {
                  width: 900,
                  maxHeight: 500,
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d9d9d9 #f0f0f0",
                },
              }}
            >
              <div
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
                className="html-preview"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            </Tooltip>
          );
        },
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        width: 100,
        align: "center",
      },
      {
        title: "Giá",
        dataIndex: "price",
        key: "price",
        width: 150,
        align: "right",
        render: (price) => {
          if (price === undefined || price === null) {
            return <Tag color="warning">Chờ xác định giá</Tag>;
          }

          return price === 0 ? (
            <Tag color="warning">Chờ xác định giá</Tag>
          ) : (
            <span>{price.toLocaleString("vi-VN")}đ</span>
          );
        },
      },
    ];

    // Only add the actions column if conditions are met
    if (showActionsColumn) {
      baseColumns.push({
        title: "Thao tác",
        key: "action",
        width: 150,
        align: "center",
        render: (_, record) => (
          <Space>
            <Popconfirm
              title="Bạn có chắc muốn xóa sản phẩm này?"
              onConfirm={() => handleDeleteExternalProduct(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<DeleteOutlined />}></Button>
            </Popconfirm>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditExternalProduct(record.id)}
            ></Button>
          </Space>
        ),
      });
    }

    return baseColumns;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải thông tin công việc..." />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Empty
          description="Không tìm thấy thông tin công việc hoặc đang tải dữ liệu..."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button
          type="primary"
          onClick={() => navigate(-1)}
          icon={<ArrowLeftOutlined />}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  // Product table columns
  const productColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productId",
      key: "product",
      render: (productId) => {
        const productDetail = productDetails[productId];
        if (!productDetail?.product) {
          return <Text type="secondary">Sản phẩm không khả dụng</Text>;
        }

        return (
          <div className="flex items-center">
            {productDetail.product.image?.imageUrl ? (
              <Image
                src={productDetail.product.image.imageUrl}
                alt={productDetail.product.name}
                width={50}
                height={50}
                className="object-cover rounded mr-3"
                style={{ marginRight: "10px", borderRadius: "8px" }}
              />
            ) : (
              <div className="w-[50px] h-[50px] bg-gray-200 rounded mr-3 flex items-center justify-center">
                <ShoppingOutlined className="text-gray-400 text-xl" />
              </div>
            )}
            <div style={{ marginLeft: "10px" }}>
              <div className="font-medium">{productDetail.product.name}</div>
              <div className="text-xs text-gray-500">ID: {productId}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 150,
      align: "right",
      render: (price) => price?.toLocaleString("vi-VN") + " đ",
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 150,
      align: "right",
      render: (totalPrice) => (
        <Text strong>{totalPrice?.toLocaleString("vi-VN")} đ</Text>
      ),
    },
  ];

  // Prepare product data for table
  const productData =
    (task?.serviceOrder?.serviceOrderDetails || []).map((detail, index) => ({
      key: index,
      productId: detail.productId,
      quantity: detail.quantity,
      price: detail.price,
      totalPrice: detail.totalPrice,
    }));

  console.log('📊 Current productData for table:', productData);
  console.log('📊 Current task.serviceOrder.serviceOrderDetails:', task?.serviceOrder?.serviceOrderDetails);

  // Check if there are images to display
  const hasImages =
    task.serviceOrder.image &&
    (task.serviceOrder.image.imageUrl ||
      task.serviceOrder.image.image2 ||
      task.serviceOrder.image.image3);

  const showSketchRecords = sketchRecords && sketchRecords.length > 0;
  const showDesignRecords = designRecords && designRecords.length > 0;

  // Check if service order status is AssignToDesigner or later to show design records
  const shouldShowDesignRecords = () => {
    if (!task || !task.serviceOrder) return false;

    const status = task.serviceOrder.status;
    const statusesAfterAssignToDesigner = [
      // 'DepositSuccessfull',
      "AssignToDesigner",
      "DeterminingMaterialPrice",
      "DoneDesign",
      "PaymentSuccess",
      "Processing",
      "PickedPackageAndDelivery",
      "DeliveryFail",
      "ReDelivery",
      "DeliveredSuccessfully",
      "CompleteOrder",
      "ReDesign",
      "DeterminingMaterialPrice",
    ];

    return statusesAfterAssignToDesigner.includes(status);
  };

  // Sửa lại nút hiển thị modal
  const renderReDeterminingButton = () => {
    if (task?.serviceOrder?.status === "ReDeterminingDesignPrice") {
      return (
        <Button
          type="primary"
          danger
          icon={<UploadOutlined />}
          onClick={showRedeterminingModal}
          style={{ marginLeft: "8px" }}
        >
          Cập nhật lại bản phác thảo và giá
        </Button>
      );
    }
    return null;
  };

  // Guard clause to prevent errors when task or serviceOrder is null/undefined
  if (loading) {
    return (
      <div className="p-6 max-w-10xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!task || !task.serviceOrder) {
    return (
      <div className="p-6 max-w-10xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            type="primary"
            onClick={() => navigate(-1)}
            icon={<ArrowLeftOutlined />}
            className="flex items-center mr-4"
          >
            Quay lại
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết task
          </Title>
        </div>
        <Card>
          <Empty description="Không tìm thấy thông tin task hoặc đơn hàng" />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-10xl mx-auto">
      <div
        className="mb-6 flex items-center justify-between"
        style={{ marginBottom: "10px" }}
      >
        <div className="flex items-center">
          <Button
            type="primary"
            onClick={() => navigate(-1)}
            icon={<ArrowLeftOutlined />}
            className="flex items-center mr-4"
            style={{ marginRight: "10px" }}
          >
            Quay lại
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết task{" "}
            <span style={{ color: "#1890ff", fontWeight: "bold" }}>
              #{task.id}
            </span>
          </Title>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            style={{ marginBottom: "10px" }}
            title={
              <Space>
                <FileTextOutlined />
                <span>Thông tin chi tiết</span>
              </Space>
            }
            className="mb-6 shadow-sm"
            extra={
              task.status !== "Completed" &&
              task.status !== "Cancelled" && (
                <Space>
                  {task.status === "ConsultingAndSketching" && (
                    <Button
                      type="primary"
                      icon={<RightCircleOutlined />}
                      onClick={() => handleStatusUpdate("Designing")}
                    >
                      Chuyển sang thiết kế
                    </Button>
                  )}
                </Space>
              )
            }
          >
            <Descriptions
              bordered
              column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
            >
              <Descriptions.Item label="ID đơn hàng" span={1}>
                <Text
                  copyable={{ text: task.serviceOrder.id }}
                  className="font-mono"
                >
                  {task.serviceOrder.id}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái task" span={1}>
                <Tag color={getStatusColor(task.status)}>
                  {getStatusText(task.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đơn hàng" span={1}>
                <Tag color={getStatusColor(task.serviceOrder.status)}>
                  {getStatusText(task.serviceOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Loại dịch vụ" span={1}>
                <Tag
                  color={
                    task.serviceOrder.serviceType === "UsingDesignIdea"
                      ? "green"
                      : "blue"
                  }
                >
                  {task.serviceOrder.serviceType === "UsingDesignIdea"
                    ? "Sử dụng mẫu thiết kế"
                    : "Thiết kế tùy chỉnh"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <UserOutlined /> Khách hàng
                  </>
                }
                span={1}
              >
                <Space>{task.serviceOrder.userName}</Space>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <PhoneOutlined /> Số điện thoại
                  </>
                }
                span={1}
              >
                <Space>{task.serviceOrder.cusPhone}</Space>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <MailOutlined /> Email
                  </>
                }
                span={1}
              >
                <Space>{task.serviceOrder.email}</Space>
              </Descriptions.Item>

              {task.serviceOrder.status === "ConsultingAndSketching" && task.dateAppointment ? (
                <Descriptions.Item
                  label={
                    <div>
                      <CalendarOutlined /> Lịch hẹn gặp khách hàng
                    </div>
                  }
                  span={3}
                >
                  <Alert
                    // message={
                    //   <Text style={{ fontWeight: 600, fontSize: "16px" }}>
                    //     Lịch hẹn gặp khách hàng
                    //   </Text>
                    // }
                    description={
                      <Text
                        style={{
                          color: "#faad14",
                          fontWeight: 600,
                          fontSize: "16px",
                        }}
                      >
                        Ngày:{" "}
                        {new Date(task.dateAppointment).toLocaleDateString(
                          "vi-VN"
                        )}{" "}
                        - Giờ:{" "}
                        {dayjs(task.timeAppointment, "HH:mm:ss").format("HH:mm")}
                      </Text>
                    }
                    type="warning"
                    // showIcon
                    icon={<CalendarOutlined />}
                  />
                </Descriptions.Item>
              ) : (
                <Descriptions.Item
                  label={
                    <>
                      <CalendarOutlined /> Lịch hẹn gặp khách hàng
                    </>
                  }
                  span={2}
                >
                  <Space>
                    Ngày: {task.dateAppointment} - Giờ: {task.timeAppointment}
                  </Space>
                </Descriptions.Item>
              )}

              <Descriptions.Item
                label={
                  <>
                    <EnvironmentOutlined /> Địa chỉ
                  </>
                }
                span={3}
              >
                <Space>{task.serviceOrder.address.replace(/\|/g, ", ")}</Space>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined /> Ngày tạo
                  </>
                }
                span={1}
              >
                <Space>
                  {dayjs(task.creationDate).format("DD/MM/YYYY HH:mm")}
                </Space>
              </Descriptions.Item>

              {task.modificationDate && (
                <Descriptions.Item
                  label={
                    <>
                      <CalendarOutlined /> Ngày cập nhật
                    </>
                  }
                  span={2}
                >
                  <Space>
                    {dayjs(task.modificationDate).format("DD/MM/YYYY HH:mm")}
                  </Space>
                </Descriptions.Item>
              )}

              {task.serviceOrder.width && task.serviceOrder.length && (
                <Descriptions.Item label="Kích thước" span={1}>
                  {task.serviceOrder.width} x {task.serviceOrder.length} m
                </Descriptions.Item>
              )}

              {/* Use the helper function to render design price */}
              <Descriptions.Item label="Giá thiết kế" span={1}>
                {renderDesignPrice(task.serviceOrder)}
              </Descriptions.Item>

              {/* {task.serviceOrder.materialPrice && ( */}
              <Descriptions.Item label="Giá vật liệu" span={1}>
                {task.serviceOrder.materialPrice === 0
                  ? "Chưa có"
                  : `${task.serviceOrder.materialPrice.toLocaleString(
                      "vi-VN"
                    )} đ`}
              </Descriptions.Item>
              {/* )} */}

              <Descriptions.Item label="Tổng tiền" span={1}>
                <Text strong type="danger" className="text-lg">
                  {(
                    (task.serviceOrder.designPrice || 0) +
                    (task.serviceOrder.materialPrice || 0)
                  ).toLocaleString("vi-VN")}{" "}
                  đ
                </Text>
              </Descriptions.Item>

              {task.serviceOrder.deliveryCode && (
                <Descriptions.Item label="Mã giao hàng" span={1}>
                  {task.serviceOrder.deliveryCode}
                </Descriptions.Item>
              )}

              {task.serviceOrder.designIdeaId && (
                <Descriptions.Item label="ID mẫu thiết kế" span={1}>
                  <span className="font-mono">
                    {task.serviceOrder.designIdeaId}
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Manager Report - Positioned prominently just after order details */}
            {task.serviceOrder.reportManger &&
              task.serviceOrder.status === "ReDeterminingDesignPrice" && (
                <Card
                  title={
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#f5222d",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <EditOutlined />
                      Yêu cầu điều chỉnh từ Manager
                    </span>
                  }
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    marginTop: "16px",
                    marginBottom: "16px",
                    borderLeft: "4px solid #f5222d",
                  }}
                >
                  <div
                    className="html-preview"
                    dangerouslySetInnerHTML={{
                      __html: task.serviceOrder.reportManger,
                    }}
                  />
                </Card>
              )}

            {/* ----- Original Customer Images (Phase 0) ----- */}
            {task.serviceOrder.status === "Pending" ||
            task.serviceOrder.status === "ConsultingAndSketching" ? (
              // --- Status: Pending or Consulting -> Show Original Images from serviceOrder.image ---
              task.serviceOrder.image &&
              (task.serviceOrder.image.imageUrl ||
                task.serviceOrder.image.image2 ||
                task.serviceOrder.image.image3) && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <Title level={5}>
                    <PictureOutlined /> Hình ảnh khách hàng cung cấp (Ban đầu)
                  </Title>

                  <Row gutter={[16, 16]}>
                    {[
                      task.serviceOrder.image.imageUrl,
                      task.serviceOrder.image.image2,
                      task.serviceOrder.image.image3,
                    ]
                      .filter(Boolean)
                      .map((imgUrl, index) => (
                        <Col key={index} xs={24} sm={12} md={8}>
                          <div
                            style={{
                              borderRadius: 8,
                              overflow: "hidden",
                            }}
                          >
                            <Image
                              src={imgUrl}
                              alt={`Hình ảnh ${index + 1}`}
                              style={{
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                overflow: "hidden",
                                height: 300,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              }}
                            />
                          </div>
                        </Col>
                      ))}
                  </Row>
                </div>
              )
            ) : // --- Status: Other than Pending/Consulting -> Show ONLY Phase 0 Sketch Records ---
            showSketchRecords ? (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Title level={5}>
                  <PictureOutlined /> Hình ảnh khách hàng cung cấp
                </Title>
                {(() => {
                  const phase = 0;
                  const recordsInPhase = sketchRecords.filter(
                    (record) => record.phase === phase
                  );

                  if (recordsInPhase.length === 0)
                    return (
                      <Empty description="Không có hình ảnh ban đầu của khách hàng." />
                    );

                  const phaseTitle = "Ảnh khách hàng cung cấp";

                  return (
                    <div key={phase} style={{ marginBottom: "20px" }}>
                      {/* Wrap images in PreviewGroup for gallery view */}
                      <Image.PreviewGroup
                        items={recordsInPhase.flatMap((r) =>
                          [
                            r.image?.imageUrl,
                            r.image?.image2,
                            r.image?.image3,
                          ].filter(Boolean)
                        )}
                      >
                        <Row gutter={[16, 16]}>
                          {/* Iterate through records (usually one per phase), then display its images horizontally */}
                          {recordsInPhase.map((record, recordIndex) => (
                            <React.Fragment key={`${record.id}-${recordIndex}`}>
                              {record.image?.imageUrl && (
                                <Col xs={24} sm={12} md={8}>
                                  {" "}
                                  {/* Adjust column spans as needed */}
                                  <Image
                                    src={record.image.imageUrl}
                                    alt={`Ảnh ${phaseTitle} - ${
                                      recordIndex + 1
                                    }.1`}
                                    style={{
                                      width: "100%",
                                      height: "200px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                </Col>
                              )}
                              {record.image?.image2 && (
                                <Col xs={24} sm={12} md={8}>
                                  <Image
                                    src={record.image.image2}
                                    alt={`Ảnh ${phaseTitle} - ${
                                      recordIndex + 1
                                    }.2`}
                                    style={{
                                      width: "100%",
                                      height: "200px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                </Col>
                              )}
                              {record.image?.image3 && (
                                <Col xs={24} sm={12} md={8}>
                                  <Image
                                    src={record.image.image3}
                                    alt={`Ảnh ${phaseTitle} - ${
                                      recordIndex + 1
                                    }.3`}
                                    style={{
                                      width: "100%",
                                      height: "200px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                </Col>
                              )}
                              {/* If a record has no images, optionally show a placeholder */}
                              {!record.image?.imageUrl &&
                                !record.image?.image2 &&
                                !record.image?.image3 && (
                                  <Col span={24}>
                                    <Text type="secondary">
                                      Không có ảnh cho bản ghi này.
                                    </Text>
                                  </Col>
                                )}
                            </React.Fragment>
                          ))}
                        </Row>
                      </Image.PreviewGroup>
                    </div>
                  );
                })()}
              </div>
            ) : (
              // If status is past sketching but sketchRecords are empty (e.g., fetch error)
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Title level={5}>
                  <PictureOutlined /> Hình ảnh khách hàng cung cấp
                </Title>
                <Empty description="Không có dữ liệu hình ảnh khách hàng." />
              </div>
            )}

            {/* Description - show after customer images */}
            {task.serviceOrder.description && (
              <Collapse
                defaultActiveKey={
                  task.serviceOrder?.status === "ConsultingAndSketching"
                    ? ["description"]
                    : []
                }
                bordered={false}
                className="mt-4 pt-2 border-l border-green-500"
                size="small"
                style={{ maxHeight: "none", overflow: "visible" }}
              >
                <Collapse.Panel
                  key="description"
                  header={
                    <Title level={5}>
                      <FileTextOutlined /> Mô tả yêu cầu của khách hàng
                    </Title>
                  }
                >
                  <div className="p-4 bg-gray-50 rounded border">
                    <div
                      className="html-preview"
                      dangerouslySetInnerHTML={{
                        __html: task.serviceOrder.description,
                      }}
                    />
                  </div>
                </Collapse.Panel>
              </Collapse>
            )}
            {task.note && (
              <Collapse
                // defaultActiveKey={
                //   task.serviceOrder.status === 'ReConsultingAndSketching' ||
                //     task.serviceOrder.status === 'ReDesign' ? ['note'] : []}
                defaultActiveKey={["note"]}
                bordered={false}
                className="mt-4 pt-2 border-l border-green-500"
                size="small"
              >
                <Collapse.Panel
                  key="note"
                  header={
                    <Title
                      level={5}
                      style={{
                        color:
                          task.serviceOrder.status === "ConsultingAndSketching"
                            ? "#1890ff"
                            : task.serviceOrder.status ===
                                "ReConsultingAndSketching" ||
                              task.serviceOrder.status === "ReDesign"
                            ? "#faad14"
                            : "default",
                      }}
                    >
                      <FileTextOutlined />{" "}
                      {task.serviceOrder.status ===
                        "ReConsultingAndSketching" ||
                      task.serviceOrder.status === "ReDesign"
                        ? "Yêu cầu chỉnh sửa từ khách hàng"
                        : "Ghi chú về đơn thiết kế"}
                    </Title>
                  }
                  forceRender
                >
                  <div className="p-4 bg-gray-50 rounded border">
                    <div
                      className="html-preview"
                      style={{ maxHeight: "none", overflow: "visible" }}
                      dangerouslySetInnerHTML={{ __html: task.note }}
                    />
                  </div>
                </Collapse.Panel>
              </Collapse>
            )}

            {/* Report Section - Modified */}
            <Collapse
              defaultActiveKey={
                task.serviceOrder?.status === "ConsultingAndSketching"
                  ? ["sketchReport"]
                  : []
              }
              bordered={false}
              className="mt-4 pt-2 border-l border-green-500"
              size="small"
            >
              <Collapse.Panel
                key="sketchReport"
                header={
                  <Title level={5}>
                    <FileTextOutlined /> Ghi chú quá trình làm việc & giá thiết
                    kế đề xuất với khách hàng
                  </Title>
                }
              >
                {/* Display existing report if available */}
                {task.serviceOrder?.skecthReport && (
                  <div className={showReportEditor ? "mb-4" : ""}>
                    <div className="p-4 bg-gray-50 rounded border">
                      <div
                        className="html-preview"
                        dangerouslySetInnerHTML={{
                          __html: task.serviceOrder.skecthReport,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Editor for creating/updating report */}
                {showSketchReportEditor && (
                  <div className="mt-4 mb-4">
                    <Card
                      title="Chỉnh sửa ghi chú / báo cáo"
                      extra={
                        task.serviceOrder?.skecthReport && (
                          <Button
                            type="primary"
                            danger
                            onClick={toggleSketchReportEditor}
                            icon={<CloseCircleOutlined />}
                          >
                            Hủy
                          </Button>
                        )
                      }
                    >
                      <EditorComponent
                        value={sketchReport}
                        onChange={(value) => setSketchReport(value)}
                        height={400}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginTop: "16px",
                        }}
                      >
                        {/* <Button
                          type="primary"
                          onClick={handleUpdateSketchReport}
                          icon={<SaveOutlined />}
                          disable={dayjs().isBefore(dayjs(task?.dateAppointment))}
                        >
                          Lưu ghi chú
                        </Button> */}
                        <Tooltip
                          title={
                            // Use Test Mode time if enabled, otherwise use real time
                            (isTestModeEnabled ? getCurrentTime().toDate() : getRealCurrentTime().toDate()) < new Date(task?.dateAppointment)
                              ? "Chưa đến ngày hẹn, không thể lưu ghi chú"
                              : ""
                          }
                        >
                          <Button
                            type="primary"
                            onClick={handleUpdateSketchReport}
                            icon={<SaveOutlined />}
                            disabled={
                              // Use Test Mode time if enabled, otherwise use real time
                              (isTestModeEnabled ? getCurrentTime().toDate() : getRealCurrentTime().toDate()) < new Date(task?.dateAppointment)
                            }
                          >
                            Lưu ghi chú
                          </Button>
                        </Tooltip>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Show button to open editor if report exists and editor is hidden */}
                {!showSketchReportEditor && task.serviceOrder?.skecthReport && (
                  <div className="mt-3 text-center">
                    <Button
                      type="dashed"
                      onClick={toggleSketchReportEditor}
                      icon={<EditOutlined />}
                      style={{
                        width: "100%",
                        color: "green",
                        marginBottom: "14px",
                      }}
                    >
                      Cập nhật ghi chú / báo cáo
                    </Button>
                  </div>
                )}
              </Collapse.Panel>
            </Collapse>

            {/* ----- Sketch Records (Phases 1, 2, 3) ----- */}
            {showSketchRecords &&
              sketchRecords.some(
                (record) => record.serviceOrderId === task?.serviceOrder?.id
              ) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Title level={5}>
                    <PictureOutlined /> Bản phác thảo / Thiết kế
                  </Title>
                  {[1, 2, 3].map((phase) => {
                    const recordsInPhase = sketchRecords.filter(
                      (record) => record.phase === phase
                    );

                    if (recordsInPhase.length === 0) return null;

                    const phaseTitle = `Bản phác thảo lần ${phase}`;
                    // Check if *any* record in this phase is selected (usually only one can be)
                    const isPhaseSelected = recordsInPhase.some(
                      (record) => record.isSelected
                    );

                    return (
                      <div key={phase} style={{ marginBottom: "20px" }}>
                        <Title
                          level={5}
                          style={{
                            marginBottom: "10px",
                            borderBottom: "1px solid #eee",
                            paddingBottom: "5px",
                          }}
                        >
                          {phaseTitle}
                          {isPhaseSelected && (
                            <Tag
                              color="success"
                              icon={<CheckSquareOutlined />}
                              style={{ marginLeft: 8 }}
                            >
                              Khách hàng đã chọn
                            </Tag>
                          )}
                        </Title>
                        {/* Wrap images in PreviewGroup for gallery view */}
                        <Image.PreviewGroup
                          items={recordsInPhase.flatMap((r) =>
                            [
                              r.image?.imageUrl,
                              r.image?.image2,
                              r.image?.image3,
                            ].filter(Boolean)
                          )}
                        >
                          <Row gutter={[16, 16]}>
                            {/* Iterate through records (usually one per phase), then display its images horizontally */}
                            {recordsInPhase.map((record, recordIndex) => (
                              <React.Fragment
                                key={`${record.id}-${recordIndex}`}
                              >
                                {record.image?.imageUrl && (
                                  <Col xs={24} sm={12} md={8}>
                                    {" "}
                                    {/* Adjust column spans as needed */}
                                    <Image
                                      src={record.image.imageUrl}
                                      alt={`Ảnh ${phaseTitle} - ${
                                        recordIndex + 1
                                      }.1`}
                                      style={{
                                        width: "100%",
                                        height: "200px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                      }}
                                    />
                                  </Col>
                                )}
                                {record.image?.image2 && (
                                  <Col xs={24} sm={12} md={8}>
                                    <Image
                                      src={record.image.image2}
                                      alt={`Ảnh ${phaseTitle} - ${
                                        recordIndex + 1
                                      }.2`}
                                      style={{
                                        width: "100%",
                                        height: "200px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                      }}
                                    />
                                  </Col>
                                )}
                                {record.image?.image3 && (
                                  <Col xs={24} sm={12} md={8}>
                                    <Image
                                      src={record.image.image3}
                                      alt={`Ảnh ${phaseTitle} - ${
                                        recordIndex + 1
                                      }.3`}
                                      style={{
                                        width: "100%",
                                        height: "200px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                      }}
                                    />
                                  </Col>
                                )}
                                {/* If a record has no images, optionally show a placeholder */}
                                {!record.image?.imageUrl &&
                                  !record.image?.image2 &&
                                  !record.image?.image3 && (
                                    <Col span={24}>
                                      <Text type="secondary">
                                        Không có ảnh cho bản ghi này.
                                      </Text>
                                    </Col>
                                  )}
                              </React.Fragment>
                            ))}
                          </Row>
                        </Image.PreviewGroup>
                      </div>
                    );
                  })}
                </div>
              )}

            {/* Design Records Display */}
            {shouldShowDesignRecords() && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Title level={5}>
                  <PictureOutlined /> Bản vẽ thiết kế chi tiết
                </Title>
                {showDesignRecords ? (
                  <div>
                    {[1, 2, 3, 4].map((phase) => {
                      const recordsInPhase = designRecords.filter(
                        (record) => record.phase === phase
                      );

                      // Skip if no records in this phase
                      if (recordsInPhase.length === 0) return null;

                      const phaseTitle = `Bản thiết kế chi tiết lần ${phase}`;
                      // Check if any record in this phase is selected
                      const isPhaseSelected = recordsInPhase.some(
                        (record) => record.isSelected
                      );

                      return (
                        <div key={phase} style={{ marginBottom: "20px" }}>
                          <Title
                            level={5}
                            style={{
                              marginBottom: "10px",
                              borderBottom: "1px solid #eee",
                              paddingBottom: "5px",
                            }}
                          >
                            {phaseTitle}
                            {isPhaseSelected && (
                              <Tag
                                color="success"
                                icon={<CheckSquareOutlined />}
                                style={{ marginLeft: 8 }}
                              >
                                Khách hàng đã chọn
                              </Tag>
                            )}
                          </Title>
                          {/* Wrap images in PreviewGroup for gallery view */}
                          <Image.PreviewGroup
                            items={recordsInPhase.flatMap((r) =>
                              [
                                r.image?.imageUrl,
                                r.image?.image2,
                                r.image?.image3,
                              ].filter(Boolean)
                            )}
                          >
                            <Row gutter={[16, 16]}>
                              {/* Iterate through records in this phase, then display its images horizontally */}
                              {recordsInPhase.map((record, recordIndex) => (
                                <React.Fragment
                                  key={`${record.id}-${recordIndex}`}
                                >
                                  {record.image?.imageUrl && (
                                    <Col xs={24} sm={12} md={8}>
                                      <Image
                                        src={record.image.imageUrl}
                                        alt={`Ảnh ${phaseTitle} - ${
                                          recordIndex + 1
                                        }.1`}
                                        style={{
                                          width: "100%",
                                          height: "200px",
                                          objectFit: "cover",
                                          borderRadius: "8px",
                                        }}
                                      />
                                    </Col>
                                  )}
                                  {record.image?.image2 && (
                                    <Col xs={24} sm={12} md={8}>
                                      <Image
                                        src={record.image.image2}
                                        alt={`Ảnh ${phaseTitle} - ${
                                          recordIndex + 1
                                        }.2`}
                                        style={{
                                          width: "100%",
                                          height: "200px",
                                          objectFit: "cover",
                                          borderRadius: "8px",
                                        }}
                                      />
                                    </Col>
                                  )}
                                  {record.image?.image3 && (
                                    <Col xs={24} sm={12} md={8}>
                                      <Image
                                        src={record.image.image3}
                                        alt={`Ảnh ${phaseTitle} - ${
                                          recordIndex + 1
                                        }.3`}
                                        style={{
                                          width: "100%",
                                          height: "200px",
                                          objectFit: "cover",
                                          borderRadius: "8px",
                                        }}
                                      />
                                    </Col>
                                  )}
                                  {/* If a record has no images, optionally show a placeholder */}
                                  {!record.image?.imageUrl &&
                                    !record.image?.image2 &&
                                    !record.image?.image3 && (
                                      <Col span={24}>
                                        <Text type="secondary">
                                          Không có ảnh cho bản ghi này.
                                        </Text>
                                      </Col>
                                    )}
                                </React.Fragment>
                              ))}
                            </Row>
                          </Image.PreviewGroup>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty description="Không có dữ liệu bản thiết kế chi tiết." />
                )}
              </div>
            )}

            {/* Original button for ConsultingAndSket */}
            {task.status === "ConsultingAndSket" &&
              (task.serviceOrder.status === "ConsultingAndSketching" ||
                task.serviceOrder.status === "ReConsultingAndSketching") && (
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={showModal}
                  disabled={task.serviceOrder.skecthReport === ""}
                  style={{ marginTop: "16px" }}
                >
                  Tải lên bản vẽ phác thảo
                </Button>
              )}

            {/* Additional button specifically for ReDeterminingDesignPrice regardless of task status */}
            {renderReDeterminingButton()}

            {/* Design upload button */}
            {task.status === "Design" &&
              (task.serviceOrder.status === "DepositSuccessful" ||
                task.serviceOrder.status === "ReDesign" ||
                task.serviceOrder.status === "AssignToDesigner") &&
              // Only show when:
              // 1. No designs exist yet (maxPhaseInDesignRecords === 0)
              // 2. OR we're in ReDesign mode and haven't reached phase 4 yet
              // 3. AND not directly after an upload (justUploadedDesign === false)
              !justUploadedDesign &&
              (maxPhaseInDesignRecords === 0 ||
                (task.serviceOrder.status === "ReDesign" &&
                  maxPhaseInDesignRecords < 4)) && (
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={showModalDesign}
                >
                  Cập nhật bản vẽ thiết kế chi tiết{" "}
                  {maxPhaseInDesignRecords < 4
                    ? `(Lần ${maxPhaseInDesignRecords + 1})`
                    : ""}
                </Button>
              )}
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <DollarOutlined />
            <span>Danh sách sản phẩm</span>
          </Space>
        }
        className="mb-6 shadow-sm"
      >
        {loadingProducts ? (
          <div className="py-8 text-center">
            <Spin tip="Đang tải thông tin sản phẩm..." />
          </div>
        ) : (
          <Table
            columns={productColumns}
            dataSource={productData}
            pagination={false}
            rowKey="key"
            locale={{
              emptyText: <Empty description="Không có sản phẩm nào" />,
            }}
          />
        )}
      </Card>

      {/* External Products Card */}
      {externalProductsList && externalProductsList.length > 0 && (
        <Card
          title={
            <Space>
              <ShoppingOutlined />
              <span>Danh sách sản phẩm thêm mới</span>
            </Space>
          }
          className="mb-6 shadow-sm"
          extra={
            (task.status === "Design" || task.status === "DoneDesign") &&
            (task.serviceOrder.status === "DepositSuccessful" ||
              task.serviceOrder.status === "ReDesign" ||
              task.serviceOrder.status === "AssignToDesigner") &&
            selectedExternalProductIds.length > 0 && (
              <Popconfirm
                title={`Bạn có chắc muốn xóa ${selectedExternalProductIds.length} sản phẩm đã chọn?`}
                onConfirm={handleBulkDeleteExternalProducts}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="primary" danger icon={<DeleteOutlined />}>
                  Xóa {selectedExternalProductIds.length} sản phẩm đã chọn
                </Button>
              </Popconfirm>
            )
          }
        >
          <Table
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
            }}
            columns={createExternalProductColumns()}
            dataSource={externalProductsList.map((product) => ({
              ...product,
              key: product.id,
            }))}
            pagination={false}
            locale={{
              emptyText: <Empty description="Không có sản phẩm nào" />,
            }}
          />
        </Card>
      )}
      {(task.status === "Design" || task.status === "DoneDesign") &&
        ["DepositSuccessful", "ReDesign", "AssignToDesigner"].includes(
          task.serviceOrder.status
        ) && (
          <Card
            title="📌 Hướng dẫn cập nhật sản phẩm cho thiết kế"
            style={{
              marginBottom: 16,
              backgroundColor: "#f0f5ff",
              borderColor: "#adc6ff",
            }}
            styles={{
              header: {
                backgroundColor: "#f0f5ff",
                borderBottom: "1px solid #adc6ff",
                padding: "8px 16px",
              },
              body: {
                padding: "12px 16px",
              },
            }}
          >
            <p>
              Thiết kế này đã được khách hàng đặt cọc thành công và đang trong
              giai đoạn cho phép bạn:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>
                <strong>Cập nhật danh sách sản phẩm</strong> để đảm bảo phù hợp với bản thiết kế hiện tại.
              </li>
              <li>
                <strong>Thêm sản phẩm mới</strong> nếu muốn đưa vào các sản phẩm mới theo thiết kế không nằm trong hệ thống có sẵn.
              </li>
            </ul>
            <div style={{ marginTop: 12 }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={showProductModal}
                style={{ marginRight: 8 }}
              >
                Tùy chỉnh danh sách sản phẩm
              </Button>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={showExternalProductModal}
              >
                Thêm sản phẩm mới
              </Button>
            </div>
          </Card>
        )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div></div>
        <div>
          {(task.serviceOrder.status === "DepositSuccessful" ||
            task.serviceOrder.status === "ReDesign" ||
            task.serviceOrder.status === "AssignToDesigner") && (
            <Tooltip
              title={
                maxPhaseInDesignRecords === 0
                  ? "Bạn cần tải lên ít nhất một bản vẽ thiết kế chi tiết trước khi hoàn tất"
                  : task.serviceOrder.status === "ReDesign"
                  ? maxPhaseInDesignRecords <= 1
                    ? "Đây là yêu cầu thiết kế lại. Bạn cần tải lên ít nhất một bản vẽ thiết kế chi tiết mới (lần 2) trước khi hoàn tất"
                    : ""
                  : maxPhaseInDesignRecords < 4
                  ? `Bạn mới hoàn thành ${maxPhaseInDesignRecords}/4 lần thiết kế chi tiết. Vui lòng tải đủ các lần thiết kế.`
                  : ""
              }
            >
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  console.log(
                    "Is button supposed to be disabled:",
                    maxPhaseInDesignRecords === 0 ||
                      (task.serviceOrder.status === "ReDesign" &&
                        maxPhaseInDesignRecords <= 1) ||
                      (task.serviceOrder.status !== "ReDesign" &&
                        maxPhaseInDesignRecords < 4)
                  );
                  handleCompleteDesign();
                }}
                // disabled={
                //   maxPhaseInDesignRecords === 0 ||
                //   (task.serviceOrder.status === "ReDesign" && maxPhaseInDesignRecords <= 1) ||
                //   (task.serviceOrder.status !== "ReDesign" && maxPhaseInDesignRecords < 4)
                // }
              >
                Hoàn tất cập nhật thiết kế chi tiết
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
      {/* {task.status === "Design" && (
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => handleStatusUpdate("Completed")}
          style={{ textAlign: 'center' }}
        >
          Đánh dấu hoàn thành
        </Button>
      )} */}
      {/* Modal cập nhật bản vẽ phác thảo */}
      <Modal
        title="Cập nhật bản vẽ phác thảo"
        open={isModalVisible}
        onOk={handleOkSketch}
        onCancel={handleCancel}
        width={800}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={sketchForm} layout="vertical">
          <Form.Item label="Bản vẽ phác thảo (Tối đa 3 ảnh)" required>
            <Upload
              listType="picture-card"
              beforeUpload={(file) => {
                setSketchFiles((prev) => [...prev, file]);
                return false;
              }}
              onRemove={(file) => {
                setSketchFiles((prev) =>
                  prev.filter((f) => f.uid !== file.uid)
                );
                return true;
              }}
              maxCount={3}
              accept="image/*"
              fileList={sketchFiles.map((file, index) => ({
                uid: file.uid || `-${index}`,
                name: file.name,
                status: "done",
                thumbUrl: URL.createObjectURL(file),
                url: URL.createObjectURL(file),
              }))}
            >
              {sketchFiles.length < 3 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
            {uploadError && (
              <div style={{ color: "red", marginTop: 8 }}>{uploadError}</div>
            )}
            {/* Hiển thị progress bar khi đang upload trong handleOkSketch */}
            {uploadingSketch && (
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <Spin
                  tip={`Đang tải lên ${sketchFiles.length} ảnh... ${progress}%`}
                />
                <Progress percent={progress} size="small" showInfo={false} />
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="designPrice"
            label="Giá thiết kế chi tiết"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập giá thiết kế chi tiết dự kiến",
              },
              { type: "number", min: 0, message: "Giá phải là số không âm" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              placeholder="Nhập giá thiết kế chi tiết dự kiến (VNĐ)"
            />
          </Form.Item>
          <Form.Item
            name="report"
            label="Ghi chú/báo cáo về bản phác thảo"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập ghi chú/báo cáo về bản phác thảo",
              },
            ]}
          >
            <EditorComponent
              value={report}
              onChange={(value) => setReport(value)}
              height={400} // Chiều cao nhỏ hơn để vừa với modal
            />
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal cập nhật bản vẽ thiết kế */}
      <Modal
        title="Cập nhật bản vẽ thiết kế"
        open={isModalVisibleDesign}
        onOk={handleOkDesign}
        onCancel={handleCancel}
        width={800}
      >
        <div>
          <Upload
            listType="picture-card"
            beforeUpload={handleDesignImageUpload}
            onRemove={handleDesignImageRemove}
            maxCount={3}
            accept="image/*"
            fileList={designImageUrls.map((url, index) => ({
              uid: `-${index}`,
              name: `design-${index + 1}`,
              status: "done",
              url: url,
            }))}
          >
            {designImageUrls.length < 3 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
              </div>
            )}
          </Upload>
          {uploadingDesign && (
            <div style={{ marginTop: 8 }}>
              <Progress percent={progress} size="small" />
            </div>
          )}
          {uploadError && (
            <div style={{ color: "red", marginTop: 8 }}>{uploadError}</div>
          )}
        </div>
      </Modal>

      {/* Modal tùy chỉnh sản phẩm */}
      <Modal
        title="Tùy chỉnh danh sách sản phẩm"
        open={isProductModalVisible}
        onOk={handleSaveProducts}
        onCancel={() => setIsProductModalVisible(false)}
        width={1200}
      >
        <div className="flex flex-col">
          <div className="flex mb-4">
            <div className="w-1/2 pr-4">
              <Typography.Title level={5}>Sản phẩm có sẵn</Typography.Title>
              <div
                className="border rounded p-2"
                style={{
                  height: 400,
                  overflow: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#aaa transparent",
                }}
              >
                <Tree
                  treeData={(categories || []).map((category) => ({
                    key: category.id,
                    title: category.name,
                    selectable: false,
                    children: allProducts
                      .filter((product) => product.categoryId === category.id)
                      .map((product) => ({
                        key: product.id,
                        title: (
                          <div className="flex items-center py-1">
                            {product.image?.imageUrl ? (
                              <Image
                                src={product.image.imageUrl}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-cover rounded mr-2"
                                style={{
                                  borderRadius: "4px",
                                  marginRight: "8px",
                                }}
                              />
                            ) : (
                              <div className="w-[40px] h-[40px] bg-gray-200 rounded mr-2 flex items-center justify-center">
                                <ShoppingOutlined className="text-gray-400 text-lg" />
                              </div>
                            )}
                            <div style={{ marginLeft: "8px" }}>
                              <div className="font-medium text-sm">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.price?.toLocaleString("vi-VN")} đ
                              </div>
                            </div>
                          </div>
                        ),
                        isLeaf: true,
                      })),
                  }))}
                  checkable
                  checkedKeys={tempServiceOrderDetails.map(
                    (item) => item.productId
                  )}
                  onCheck={(checkedKeys) => {
                    // Convert checked keys to service order details
                    const newDetails = checkedKeys
                      .map((key) => {
                        // Skip if key is a category
                        if (categories.some((cat) => cat.id === key))
                          return null;

                        // Find if item already exists to preserve quantity
                        const existingItem = tempServiceOrderDetails.find(
                          (item) => item.productId === key
                        );
                        return {
                          productId: key,
                          quantity: existingItem?.quantity || 1,
                        };
                      })
                      .filter(Boolean); // Remove null entries

                    setTempServiceOrderDetails(newDetails);
                  }}
                  showLine
                  defaultExpandAll
                />
              </div>
            </div>

            <div className="w-1/2 pl-4">
              <Typography.Title level={5}>Sản phẩm đã chọn</Typography.Title>
              <div
                className="border rounded p-2"
                style={{
                  height: 400,
                  overflow: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#aaa transparent",
                }}
              >
                {tempServiceOrderDetails.length > 0 ? (
                  <Table
                    dataSource={tempServiceOrderDetails.map((item) => {
                      const product = allProducts.find(
                        (p) => p.id === item.productId
                      );
                      return {
                        key: item.productId,
                        productId: item.productId,
                        productName: product
                          ? product.name
                          : "Sản phẩm không tồn tại",
                        productImage: product?.image?.imageUrl || "",
                        productPrice: product?.price || 0,
                        quantity: item.quantity,
                      };
                    })}
                    columns={[
                      {
                        title: "Sản phẩm",
                        dataIndex: "productName",
                        key: "productName",
                        render: (_, record) => {
                          const product = allProducts.find(
                            (p) => p.id === record.productId
                          );
                          return (
                            <div className="flex items-center">
                              {product?.image?.imageUrl ? (
                                <Image
                                  src={product.image.imageUrl}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  style={{
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    marginRight: "8px",
                                  }}
                                  // width={40}
                                  // height={40}
                                  // className="object-cover rounded mr-2"
                                  // style={{ borderRadius: "4px", marginRight: "8px" }}
                                />
                              ) : (
                                <div className="w-[40px] h-[40px] bg-gray-200 rounded mr-2 flex items-center justify-center">
                                  <ShoppingOutlined className="text-gray-400 text-lg" />
                                </div>
                              )}
                              <div
                                className="font-medium"
                                style={{ marginLeft: "8px" }}
                              >
                                {product
                                  ? product.name
                                  : "Sản phẩm không tồn tại"}
                              </div>
                            </div>
                          );
                        },
                      },
                      {
                        title: "Đơn giá",
                        dataIndex: "productPrice",
                        key: "productPrice",
                        render: (_, record) => {
                          const product = allProducts.find(
                            (p) => p.id === record.productId
                          );
                          return product
                            ? product.price?.toLocaleString("vi-VN") + " đ"
                            : "0 đ";
                        },
                      },
                      {
                        title: "Số lượng",
                        dataIndex: "quantity",
                        key: "quantity",
                        render: (_, record) => (
                          <InputNumber
                            min={1}
                            value={record.quantity}
                            onChange={(value) =>
                              handleUpdateQuantity(record.productId, value)
                            }
                            style={{ width: 80 }}
                          />
                        ),
                      },
                      {
                        title: "Thành tiền",
                        key: "totalPrice",
                        render: (_, record) => {
                          const product = allProducts.find(
                            (p) => p.id === record.productId
                          );
                          const price = product?.price || 0;
                          return (
                            <Text strong>
                              {(price * record.quantity).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              đ
                            </Text>
                          );
                        },
                      },
                      {
                        title: "Thao tác",
                        key: "action",
                        render: (_, record) => (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              setTempServiceOrderDetails((prev) =>
                                prev.filter(
                                  (item) => item.productId !== record.productId
                                )
                              );
                            }}
                          >
                            Xóa
                          </Button>
                        ),
                      },
                    ]}
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <ShoppingOutlined style={{ fontSize: 32 }} />
                      <p>Chưa có sản phẩm nào được chọn</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Material Requirements Section */}
          {/* <div className="mt-4">
            <Card title={
              <div className="flex items-center">
                <FileTextOutlined style={{ marginRight: '8px' }} />
                <span>Yêu cầu vật liệu theo thiết kế</span>
              </div>
            }>
              <Alert
                message="Thông tin về vật liệu"
                description="Mô tả chi tiết các yêu cầu về loại vật liệu, số lượng, kích thước và các thông số kỹ thuật cần thiết cho thiết kế."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
              <EditorComponent
                value={materialRequirements}
                onChange={(value) => setMaterialRequirements(value)}
                height={300}
              />
            </Card>
          </div> */}
        </div>
      </Modal>

      {/* Modal mới cho việc điều chỉnh phác thảo/giá */}
      <Modal
        title="Điều chỉnh bản phác thảo và giá thiết kế"
        open={isRedeterminingModal}
        onOk={handleRedeterminingOk}
        onCancel={handleCancel}
        width={800}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <div
          style={{
            backgroundColor: "#f9f0ff",
            border: "1px solid #d3adf7",
            padding: "16px",
            borderRadius: "4px",
            marginBottom: "24px",
          }}
        >
          <Typography.Title
            level={5}
            style={{ color: "#722ed1", marginTop: 0 }}
          >
            Hướng dẫn điều chỉnh
          </Typography.Title>

          <Typography.Paragraph>
            Manager đã yêu cầu điều chỉnh bản phác thảo hoặc giá thiết kế. Vui
            lòng xem chi tiết yêu cầu ở phần báo cáo từ Manager và thực hiện các
            điều chỉnh phù hợp.
          </Typography.Paragraph>

          <Typography.Paragraph strong>Bạn có thể:</Typography.Paragraph>

          <ul style={{ paddingLeft: "20px", marginBottom: "16px" }}>
            <li>
              Điều chỉnh <strong>cả giá và bản phác thảo</strong>
            </li>
            <li>
              Chỉ điều chỉnh <strong>giá thiết kế</strong>
            </li>
            <li>
              Chỉ cập nhật <strong>hình ảnh phác thảo mới</strong>
            </li>
          </ul>

          <Typography.Paragraph type="warning">
            <strong>Lưu ý:</strong> Khi cập nhật, bản phác thảo hiện tại sẽ được
            thay thế bằng phiên bản mới.
          </Typography.Paragraph>
        </div>

        {/* Hiển thị bản phác thảo hiện tại */}
        <div style={{ marginBottom: "24px" }}>
          <Typography.Title level={5}>
            Bản phác thảo hiện tại cần điều chỉnh:
          </Typography.Title>

          <div style={{ marginBottom: "16px" }}>
            <Row gutter={[16, 16]}>
              {currentSketchImages.length > 0 ? (
                currentSketchImages.map((url, index) => (
                  <Col span={8} key={index}>
                    <Image
                      src={url}
                      style={{
                        width: "100%",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Empty description="Không tìm thấy hình ảnh phác thảo" />
                </Col>
              )}
            </Row>
          </div>
        </div>

        {/* Options for adjustment - Simplified UI */}
        <div
          style={{
            marginBottom: "16px",
            backgroundColor: "#fafafa",
            padding: "16px",
            borderRadius: "4px",
            border: "1px solid #e8e8e8",
          }}
        >
          <Typography.Text strong>Chọn nội dung điều chỉnh:</Typography.Text>

          <Radio.Group
            value={adjustmentOption}
            onChange={handleAdjustmentOptionChange}
            style={{ width: "100%", marginTop: "8px" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Radio value="both">
                <strong>Điều chỉnh cả giá và bản phác thảo</strong>
              </Radio>

              <Radio value="priceOnly">
                <strong>Chỉ điều chỉnh giá</strong> (giữ nguyên bản phác thảo
                hiện tại)
              </Radio>

              <Radio value="imagesOnly">
                <strong>Chỉ cập nhật bản phác thảo</strong> (giữ nguyên giá
                thiết kế hiện tại)
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        <Divider />

        {/* Form for price adjustment - Simplified */}
        {adjustmentOption !== "imagesOnly" && (
          <Form form={sketchForm} layout="vertical">
            <Form.Item
              name="designPrice"
              label={<Typography.Text strong>Giá thiết kế:</Typography.Text>}
              rules={[
                { required: true, message: "Vui lòng nhập giá thiết kế" },
                { type: "number", min: 0, message: "Giá phải là số không âm" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                placeholder="Nhập giá thiết kế (VNĐ)"
                size="large"
              />
            </Form.Item>
          </Form>
        )}

        {/* Upload images - Simplified */}
        {adjustmentOption !== "priceOnly" && (
          <div
            style={{
              marginTop: adjustmentOption === "imagesOnly" ? 0 : "16px",
            }}
          >
            <Form.Item
              label={
                <Typography.Text strong>
                  Tải lên bản phác thảo mới:
                </Typography.Text>
              }
              required={adjustmentOption !== "both"}
            >
              <Upload
                listType="picture-card"
                beforeUpload={(file) => {
                  setSketchFiles((prev) => [...prev, file]);
                  return false;
                }}
                onRemove={(file) => {
                  setSketchFiles((prev) =>
                    prev.filter((f) => f.uid !== file.uid)
                  );
                  return true;
                }}
                maxCount={3}
                accept="image/*"
                fileList={sketchFiles.map((file, index) => ({
                  uid: file.uid || `-${index}`,
                  name: file.name,
                  status: "done",
                  thumbUrl: URL.createObjectURL(file),
                  url: URL.createObjectURL(file),
                }))}
              >
                {sketchFiles.length < 3 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            {uploadingSketch && (
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <Spin tip={`Đang tải lên ${sketchFiles.length} ảnh...`} />
                <Progress percent={progress} size="small" showInfo={false} />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* External Product Modal */}
      <Modal
        title="Thêm sản phẩm mới"
        open={isExternalProductModalVisible}
        onOk={handleSaveExternalProducts}
        onCancel={() => setIsExternalProductModalVisible(false)}
        width={800}
        okText={isSavingExternalProducts ? "Đang lưu..." : "Lưu sản phẩm"}
        cancelText="Hủy"
        confirmLoading={isSavingExternalProducts}
        okButtonProps={{ disabled: isSavingExternalProducts }}
        cancelButtonProps={{ disabled: isSavingExternalProducts }}
        styles={{
          body: {
            height: "auto", // Fixed height for modal body
            overflow: "hidden", // Prevent scrolling on modal body
          },
        }}
      >
        <Card
          style={{
            marginBottom: "16px",
            backgroundColor: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: "8px",
          }}
          styles={{ body: { padding: "12px 16px" } }}
        >
          <Space align="start">
            <InfoCircleOutlined
              style={{ fontSize: "20px", color: "#52c41a", marginTop: 4 }}
            />
            <div>
              <div
                style={{
                  fontWeight: "bold",
                  color: "#389e0d",
                  fontSize: "15px",
                }}
              >
                Thêm sản phẩm mới vào đơn hàng
              </div>
              <div style={{ marginTop: 2 }}>
                Đây là các sản phẩm <strong>ngoài hệ thống</strong>, không có
                trong kho. Bạn có thể thêm nhiều sản phẩm cùng lúc bằng cách
                nhấn "Thêm sản phẩm khác".
              </div>
            </div>
          </Space>
        </Card>

        <div
          style={{
            maxHeight: 450,
            overflowY: "auto",
            paddingRight: 4,
            scrollbarWidth: "thin", // Firefox
            scrollbarColor: "#aaa transparent",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <List
            itemLayout="vertical"
            dataSource={tempExternalProducts}
            renderItem={(product) => (
              <List.Item
                key={product.tempId}
                extra={
                  <Space>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeExternalProduct(product.tempId)}
                    />
                  </Space>
                }
                style={{
                  border: "1px solid #f0f0f0",
                  marginBottom: "16px",
                  paddingLeft: "16px",
                  borderRadius: "8px",
                  backgroundColor: "#fafafa",
                }}
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label="Hình ảnh sản phẩm"
                      required
                      style={{ marginBottom: "12px" }}
                    >
                      <Upload
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={(file) =>
                          handleExternalProductImageUpload(product.tempId, file)
                        }
                      >
                        {product.tempImageUrl ? (
                          <img
                            src={product.tempImageUrl}
                            alt="product"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Tải ảnh</div>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={18}>
                    <Form layout="vertical" style={{ marginBottom: 0 }}>
                      <Form.Item
                        label="Tên sản phẩm"
                        required
                        style={{ marginBottom: "12px" }}
                      >
                        <Input
                          placeholder="Nhập tên sản phẩm"
                          value={product.name}
                          onChange={(e) =>
                            handleExternalProductNameChange(
                              product.tempId,
                              e.target.value
                            )
                          }
                        />
                      </Form.Item>

                      <Form.Item
                        label="Số lượng"
                        required
                        style={{ marginBottom: "12px" }}
                      >
                        <InputNumber
                          min={1}
                          value={product.quantity}
                          onChange={(value) =>
                            handleExternalProductQuantityChange(
                              product.tempId,
                              value
                            )
                          }
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Form>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <div style={{ marginTop: 16, paddingLeft: 16 }}>
                    <Form.Item
                      label="Yêu cầu về sản phẩm"
                      required
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập yêu cầu về sản phẩm",
                        },
                      ]}
                      style={{ marginBottom: "0px" }}
                    >
                      <EditorComponent
                        value={product.description || ""}
                        onChange={(value) =>
                          handleExternalProductDescriptionChange(
                            product.tempId,
                            value
                          )
                        }
                        height={300}
                      />
                    </Form.Item>
                  </div>
                </Row>
              </List.Item>
            )}
          />
        </div>
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addEmptyExternalProduct}
            style={{ width: "100%" }}
          >
            Thêm sản phẩm khác
          </Button>
        </div>
      </Modal>

      {/* Add Edit External Product Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <EditOutlined style={{ color: "#52c41a" }} />
            <span style={{ fontSize: "16px", fontWeight: 600 }}>
              Chỉnh sửa sản phẩm
            </span>
          </div>
        }
        open={isEditExternalProductModalVisible}
        onOk={handleSaveEditedExternalProduct}
        onCancel={() => {
          setIsEditExternalProductModalVisible(false);
          setEditingExternalProduct(null);
          editExternalProductForm.resetFields();
        }}
        confirmLoading={isEditingExternalProduct}
        okText={isEditingExternalProduct ? "Đang lưu..." : "Lưu thay đổi"}
        cancelText="Hủy"
        width={800}
        okButtonProps={{
          icon: <SaveOutlined />,
          style: { background: "#52c41a", borderColor: "#52c41a" },
        }}
        cancelButtonProps={{ icon: <CloseCircleOutlined /> }}
        destroyOnClose
        maskClosable={false}
        // styles={{ body: { padding: 24 } }}
      >
        {editingExternalProduct && (
          <Form
            form={editExternalProductForm}
            layout="vertical"
            initialValues={{
              name: editingExternalProduct.name,
              quantity: editingExternalProduct.quantity,
              description: editingExternalProduct.description || "",
            }}
          >
            <Row gutter={24}>
              {/* Left: Hình ảnh */}
              <Col span={10}>
                <div
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    padding: 16,
                    background: "#f6ffed",
                    height: "100%",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography.Title
                    level={5}
                    style={{ margin: 0, marginBottom: 16, color: "#389e0d" }}
                  >
                    <PictureOutlined /> Hình ảnh sản phẩm
                  </Typography.Title>

                  <Form.Item name="tempImageUrl" hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item name="tempFile" hidden>
                    <Input />
                  </Form.Item>

                  <div
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      margin: "0 auto",
                      minHeight: "150px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Upload
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={handleEditExternalProductImageUpload}
                      style={{ width: "100%" }}
                    >
                      {editingExternalProduct.tempImageUrl ? (
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            aspectRatio: "1/1",
                          }}
                        >
                          <img
                            src={editingExternalProduct.tempImageUrl}
                            alt="product"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              borderRadius: "4px",
                              backgroundColor: "#f0f0f0",
                            }}
                          />
                          <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={handleRemoveNewImage}
                            style={{
                              position: "absolute",
                              top: "5px",
                              right: "5px",
                              opacity: 0.8,
                              zIndex: 10,
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: "0",
                              left: "0",
                              width: "100%",
                              background: "rgba(0,0,0,0.5)",
                              color: "white",
                              padding: "5px 8px",
                              fontSize: "12px",
                              textAlign: "center",
                            }}
                          >
                            Hình mới (chưa lưu)
                          </div>
                        </div>
                      ) : editExternalProductForm.getFieldValue(
                          "tempImageUrl"
                        ) ? (
                        <div style={{ width: "100%", aspectRatio: "1/1" }}>
                          <img
                            src={editExternalProductForm.getFieldValue(
                              "tempImageUrl"
                            )}
                            alt="product"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              borderRadius: "4px",
                              backgroundColor: "#f0f0f0",
                            }}
                          />
                        </div>
                      ) : editingExternalProduct.imageURL ? (
                        <div style={{ width: "100%", aspectRatio: "1/1" }}>
                          <img
                            src={editingExternalProduct.imageURL}
                            alt="product"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              borderRadius: "4px",
                              backgroundColor: "#f0f0f0",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: "1/1",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            background: "#ffffff",
                            border: "1px dashed #d9d9d9",
                            borderRadius: "4px",
                          }}
                        >
                          <PlusOutlined
                            style={{
                              fontSize: "24px",
                              marginBottom: "8px",
                              color: "#1890ff",
                            }}
                          />
                          <div>Tải ảnh</div>
                        </div>
                      )}
                    </Upload>
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "#888",
                      textAlign: "center",
                      marginTop: 16,
                      fontStyle: "italic",
                    }}
                  >
                    Bấm vào hình để thay đổi. Định dạng hỗ trợ: JPG, PNG
                  </div>
                </div>
              </Col>

              <Col span={14}>
                <div
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    padding: 16,
                    background: "#ffffff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography.Title
                    level={5}
                    style={{ margin: 0, marginBottom: 16 }}
                  >
                    <ShoppingOutlined /> Thông tin chi tiết
                  </Typography.Title>

                  <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên sản phẩm" },
                    ]}
                  >
                    <Input
                      placeholder="Nhập tên sản phẩm"
                      prefix={
                        <ShoppingOutlined
                          style={{ color: "rgba(0,0,0,.25)" }}
                        />
                      }
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="quantity"
                    label="Số lượng"
                    rules={[
                      { required: true, message: "Vui lòng nhập số lượng" },
                      {
                        type: "number",
                        min: 1,
                        message: "Số lượng phải lớn hơn 0",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Nhập số lượng"
                      min={1}
                      size="large"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|,(?=\d)/g, "")}
                    />
                  </Form.Item>

                  <div
                    style={{
                      background: "#fafafa",
                      padding: "10px 12px",
                      borderRadius: 4,
                      fontSize: 13,
                      color: "#666",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    <InfoCircleOutlined style={{ color: "#1890ff" }} />
                    Nếu không đổi hình ảnh, hệ thống sẽ giữ nguyên hình ảnh hiện
                    tại.
                  </div>
                </div>
              </Col>
            </Row>
            <Row gutter={24}>
              <div style={{ marginTop: 16, paddingLeft: 16 }}>
                <Form.Item
                  name="description"
                  label="Yêu cầu về sản phẩm"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập yêu cầu về sản phẩm",
                    },
                  ]}
                >
                  <EditorComponent
                    value={
                      editExternalProductForm.getFieldValue("description") || ""
                    }
                    onChange={(value) =>
                      editExternalProductForm.setFieldsValue({
                        description: value,
                      })
                    }
                    height={300}
                  />
                </Form.Item>
              </div>
            </Row>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default TaskDetail;
