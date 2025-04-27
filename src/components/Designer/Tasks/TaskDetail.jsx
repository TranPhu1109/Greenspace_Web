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
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import useDesignerTask from "@/stores/useDesignerTask";
import useProductStore from "@/stores/useProductStore";
import useAuthStore from "@/stores/useAuthStore";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useRecordStore from "@/stores/useRecordStore";
import api from "@/api/api";
import EditorComponent from "@/components/Common/EditorComponent";
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// --- Helper Function for Rendering Design Price --- 
const renderDesignPrice = (order) => {
  const { designPrice, status } = order;

  if (typeof designPrice !== 'number' || designPrice <= 0) {
    // Show 'Chưa có' only in very early stages
    if (status === 'Pending' || status === 'ConsultingAndSketching') {
      return <Text type="secondary">Chưa có</Text>;
    }
    // Otherwise, if price is missing later, it might be an issue or intentional
    return <Text type="secondary">N/A</Text>;
  }

  const formattedPrice = designPrice.toLocaleString("vi-VN") + " đ";

  // Statuses indicating the price determination is done and approved (or past that point)
  const approvedOrPastApprovalStatuses = [
    'DoneDeterminingDesignPrice', // 22
    'WaitDeposit',             // 21 (Implies approval)
    'DepositSuccessful',       // 3
    'AssignToDesigner',        // 4
    'DeterminingMaterialPrice',// 5
    'DoneDesign',              // 6
    'PaymentSuccess',          // 7
    'Processing',              // 8
    'PickedPackageAndDelivery',// 9
    'DeliveryFail',            // 10 (Price was approved before this)
    'ReDelivery',              // 11
    'DeliveredSuccessfully',   // 12
    'CompleteOrder',           // 13
    // Note: Excludes states like ReDeterminingDesignPrice, OrderCancelled, Refund etc.
  ];

  if (approvedOrPastApprovalStatuses.includes(status)) {
    return (
      <Space>
        <Text>{formattedPrice}</Text>
        <Tag color="success" icon={<CheckIconForPrice />}>Đã duyệt</Tag>
      </Space>
    );
  }

  if (status === 'DeterminingDesignPrice') { // 2
    return (
      <Space>
        <Text>{formattedPrice}</Text>
        <Tag color="processing" icon={<ClockIconForPrice />}>Chờ duyệt</Tag>
      </Space>
    );
  }

  if (status === 'ReDeterminingDesignPrice') { // 24
    return (
      <Space>
        {/* Show the rejected price, maybe visually distinct */}
        <Text delete>{formattedPrice}</Text>
        <Tag color="error" icon={<CloseIconForPrice />}>Cần sửa lại</Tag>
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
    setCurrentTask: setTask
  } = useDesignerTask();
  const { getProductById, fetchProducts, products } = useProductStore();
  const { user } = useAuthStore();
  const { sketchRecords, designRecords, getRecordSketch, getRecordDesign, resetState } = useRecordStore();
  const { uploadImages, progress, error: uploadError } = useCloudinaryStorage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleDesign, setIsModalVisibleDesign] = useState(false);
  const [sketchImageUrls, setSketchImageUrls] = useState([]);
  const [sketchFiles, setSketchFiles] = useState([]);
  const [uploadingSketch, setUploadingSketch] = useState(false);
  const [sketchForm] = Form.useForm();
  const { updateServiceOrder, updateProductOrder, updateStatus } = useDesignOrderStore();
  const [uploadingDesign, setUploadingDesign] = useState(false);
  const [designImageUrls, setDesignImageUrls] = useState([]);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [tempServiceOrderDetails, setTempServiceOrderDetails] = useState([]);
  const [maxPhaseInDesignRecords, setMaxPhaseInDesignRecords] = useState(0);
  const [isRedeterminingModal, setIsRedeterminingModal] = useState(false);
  const [currentSketchImages, setCurrentSketchImages] = useState([]);
  const [adjustPriceOnly, setAdjustPriceOnly] = useState(false);
  const [adjustImagesOnly, setAdjustImagesOnly] = useState(false);
  const [adjustmentOption, setAdjustmentOption] = useState('both'); // 'both', 'priceOnly', 'imagesOnly'
  const [showReportEditor, setShowReportEditor] = useState(false);
  const [showSketchReportEditor, setShowSketchReportEditor] = useState(false);
  const [sketchReport, setSketchReport] = useState("");
  // Debug log để kiểm tra các hàm
  useEffect(() => {
    console.log("Task state:", { task });
    console.log("Set task function:", typeof setTask === 'function' ? 'Available' : 'Not a function');
  }, [task, setTask]);

  useEffect(() => {
    const loadTaskDetail = async () => {
      if (!id) return;

      try {
        console.log("Fetching task detail for id:", id);
        await fetchTaskDetail(id);
        console.log("Task detail fetched successfully");
      } catch (error) {
        console.error("Error fetching task detail:", error);
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
      const maxPhase = Math.max(...designRecords.map(record => record.phase || 0));
      setMaxPhaseInDesignRecords(maxPhase);
      console.log("Max phase in design records:", maxPhase);
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

  // Add useEffect to initialize showReportEditor based on existing report
  useEffect(() => {
    // If there's no report yet, show the editor by default
    if (task?.serviceOrder?.report) {
      setShowReportEditor(false);
    } else {
      setShowReportEditor(true);
    }
  }, [task?.serviceOrder?.report]);

  const handleDesignImageUpload = async (file) => {
    try {
      setUploadingDesign(true);
      const urls = await uploadImages([file]);
      if (urls && urls.length > 0) {
        setDesignImageUrls((prev) => [...prev, ...urls]);
        message.success("Tải lên bản vẽ thiết kế thành công");
      }
    } catch (error) {
      message.error("Tải lên bản vẽ thiết kế thất bại");
      console.error("Upload error:", error);
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
      designPrice: task?.serviceOrder?.designPrice
    });

    // In case of ReDeterminingDesignPrice, also set a default message based on manager's report
    if (task?.serviceOrder?.status === "ReDeterminingDesignPrice" && task?.serviceOrder?.reportManger) {
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

  // const handleOkSketch = async () => {
  //   // Add check for task and task.serviceOrder
  //   if (!task || !task.serviceOrder) {
  //     message.error("Dữ liệu công việc chưa được tải xong. Vui lòng thử lại.");
  //     console.error("handleOkSketch called with null task or task.serviceOrder:", task);
  //     return;
  //   }

  //   let uploadedUrls = [];
  //   try {
  //     const values = await sketchForm.validateFields();
  //     const currentOrderStatus = task?.serviceOrder?.status; // Get current order status

  //     setUploadingSketch(true);

  //     // Xử lý tải lên ảnh nếu cần
  //     const isPriceOnly = adjustmentOption === 'priceOnly';
  //     const isImagesOnly = adjustmentOption === 'imagesOnly';

  //     if (!isPriceOnly) {
  //       // Step 1: Upload images
  //       if (sketchFiles.length > 0) {
  //         message.info(`Đang tải lên ${sketchFiles.length} ảnh phác thảo...`, 0);
  //         uploadedUrls = await uploadImages(sketchFiles);
  //         message.destroy();
  //         if (!uploadedUrls || uploadedUrls.length !== sketchFiles.length) {
  //           throw new Error("Lỗi trong quá trình tải ảnh lên.");
  //         }
  //         message.success("Tải ảnh lên thành công!");
  //       } else if (isRedeterminingModal && currentSketchImages.length > 0 && !isImagesOnly) {
  //         // Nếu đang trong modal Redetermining và không chọn cập nhật ảnh, giữ nguyên ảnh hiện tại
  //         uploadedUrls = currentSketchImages;
  //       } else {
  //         // If no new files, check if *any* existing images are present before assuming old ones
  //         const existingImages = [
  //           task.serviceOrder.image?.imageUrl,
  //           task.serviceOrder.image?.image2,
  //           task.serviceOrder.image?.image3
  //         ].filter(Boolean);

  //         if (existingImages.length === 0 && sketchFiles.length === 0 && !isPriceOnly) {
  //           // If no existing images AND no new files, require upload
  //           throw new Error("Vui lòng tải lên ít nhất một ảnh phác thảo.");
  //         }

  //         // Use existing images if no new files were uploaded BUT existing images are present
  //         uploadedUrls = existingImages;
  //       }
  //     } else {
  //       // Nếu chỉ điều chỉnh giá, sử dụng ảnh hiện tại
  //       uploadedUrls = [
  //         task.serviceOrder.image?.imageUrl,
  //         task.serviceOrder.image?.image2,
  //         task.serviceOrder.image?.image3
  //       ].filter(Boolean);
  //     }

  //     // Determine the status to send for record creation based on current order status
  //     let statusForRecordCreation;
  //     if (currentOrderStatus === 'ConsultingAndSketching' || currentOrderStatus === 1) {
  //       statusForRecordCreation = 1;
  //     } else if (currentOrderStatus === 'ReConsultingAndSketching' || currentOrderStatus === 19) {
  //       statusForRecordCreation = 19;
  //     } else if (currentOrderStatus === 'ReDeterminingDesignPrice' || currentOrderStatus === 24) {
  //       statusForRecordCreation = 24;
  //     } else {
  //       // Handle unexpected status - log a warning and default or throw error
  //       console.warn(`Unexpected initial status ${currentOrderStatus} for sketch submission. Defaulting status to 1.`);
  //       statusForRecordCreation = 1; // Defaulting to 1 might be safer than failing
  //     }

  //     // Step 2: Update service order with initial status (for record creation)
  //     const serviceOrderUpdateData = {
  //       serviceType: 1,
  //       designPrice: isImagesOnly ? task.serviceOrder.designPrice : values.designPrice,
  //       description: task.serviceOrder.description,
  //       status: statusForRecordCreation,
  //       report: report,
  //       skecthReport: task.serviceOrder.skecthReport || "",
  //       reportManger: task.serviceOrder.reportManger || "",
  //       reportAccoutant: task.serviceOrder.reportAccoutant || "",
  //       image: {
  //         imageUrl: uploadedUrls[0] || "",
  //         image2: uploadedUrls[1] || "",
  //         image3: uploadedUrls[2] || ""
  //       },
  //     };

  //     await updateServiceOrder(task.serviceOrder.id, serviceOrderUpdateData);

  //     // Step 3: Update Service Order Status to DeterminingDesignPrice (2)
  //     await updateStatus(task.serviceOrder.id, 2);

  //     // Step 4: Update task status to DoneConsulting (1)
  //     await updateTaskStatus(task.id, {
  //       serviceOrderId: task.serviceOrder.id,
  //       userId: user.id,
  //       dateAppointment: task.dateAppointment,
  //       timeAppointment: task.timeAppointment,
  //       status: 1, // Task status: DoneConsulting
  //       note: "Hoàn thành phác thảo và báo giá dự kiến."
  //     });

  //     // --- Success handling ---
  //     let successMessage = "";
  //     if (isPriceOnly) {
  //       successMessage = "Đã cập nhật giá thiết kế thành công.";
  //     } else if (isImagesOnly) {
  //       successMessage = "Đã cập nhật bản phác thảo thành công.";
  //     } else {
  //       successMessage = "Đã cập nhật bản phác thảo và giá thiết kế thành công.";
  //     }

  //     message.success(successMessage);
  //     setIsModalVisible(false);
  //     sketchForm.resetFields();
  //     setSketchFiles([]);

  //     // Refetch task detail first
  //     await fetchTaskDetail(id);

  //     // Explicitly refetch sketch records AFTER task detail is updated
  //     try {
  //       await getRecordSketch(task.serviceOrder.id);
  //     } catch (sketchError) {
  //       console.error("Failed to refetch sketches after update:", sketchError);
  //       message.warning("Không thể làm mới danh sách bản phác thảo ngay lập tức.");
  //     }

  //   } catch (error) {
  //     message.destroy();
  //     if (error.name === 'ValidationError') {
  //       message.error("Vui lòng điền đầy đủ thông tin được yêu cầu.");
  //     } else if (error.message.includes("Lỗi trong quá trình tải ảnh lên") || error.message.includes("Vui lòng tải lên ít nhất một ảnh phác thảo")) {
  //       message.error(error.message);
  //     } else if (error.response?.data?.error?.includes("maximum number of edits")) {
  //       message.error("Bạn đã đạt giới hạn số lần chỉnh sửa cho phép. Không thể cập nhật thêm.");
  //     } else {
  //       message.error("Cập nhật thất bại: " + (error.response?.data?.message || error.message || "Lỗi không xác định"));
  //       console.error("Update error in handleOkSketch:", error);
  //     }
  //   } finally {
  //     setUploadingSketch(false);
  //   }
  // };
  const handleOkSketch = async () => {
    if (!task || !task.serviceOrder) {
      message.error("Dữ liệu công việc chưa sẵn sàng. Vui lòng thử lại.");
      return;
    }

    const currentOrderStatus = task.serviceOrder.status;
    const isConsulting = (currentOrderStatus === 'ConsultingAndSketching');
    const isReConsulting = (currentOrderStatus === 'ReConsultingAndSketching');
    const isReDetermining = (currentOrderStatus === 'ReDeterminingDesignPrice');

    const isPriceOnly = (adjustmentOption === 'priceOnly');
    const isImagesOnly = (adjustmentOption === 'imagesOnly');

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
          // Upload ảnh
          message.loading({ content: `Đang tải lên ${sketchFiles.length} ảnh...`, key: 'upload', duration: 0 });
          uploadedUrls = await uploadImages(sketchFiles);
          message.destroy('upload');

          if (!uploadedUrls || uploadedUrls.length !== sketchFiles.length) {
            throw new Error("Tải ảnh thất bại. Vui lòng thử lại.");
          }
        } else {
          // Không upload mới => dùng ảnh cũ nếu có
          uploadedUrls = [
            task.serviceOrder.image?.imageUrl,
            task.serviceOrder.image?.image2,
            task.serviceOrder.image?.image3,
          ].filter(Boolean);
        }
      } else {
        // Nếu chỉ update giá, giữ nguyên ảnh cũ
        uploadedUrls = [
          task.serviceOrder.image?.imageUrl,
          task.serviceOrder.image?.image2,
          task.serviceOrder.image?.image3,
        ].filter(Boolean);
      }

      // --- Step 2: Chuẩn bị payload ---
      const updatePayload = {
        serviceType: 1,
        designPrice: isImagesOnly ? task.serviceOrder.designPrice : values.designPrice,
        description: task.serviceOrder.description,
        status: isConsulting || isReConsulting ? 1 : isReDetermining ? 24 : 1, // tùy vào trạng thái
        report: report || task.serviceOrder.report || "",
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
        note: "Hoàn thành phác thảo và báo giá dự kiến."
      });

      // --- Step 6: Refetch data ---
      await fetchTaskDetail(id);
      await getRecordSketch(task.serviceOrder.id);

      message.success("Cập nhật bản phác thảo và giá thiết kế thành công.");
      setIsModalVisible(false);
      setSketchFiles([]);
      sketchForm.resetFields();

    } catch (error) {
      message.destroy();
      if (error.name === 'ValidationError') {
        message.error("Vui lòng nhập đầy đủ các trường thông tin bắt buộc.");
      } else {
        message.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
      console.error("handleOkSketch error:", error);
    } finally {
      setUploadingSketch(false);
    }
  };


  const handleOkDesign = async () => {
    try {
      // Check if task and task.serviceOrder exist
      if (!task || !task.serviceOrder) {
        message.error("Dữ liệu công việc chưa được tải xong. Vui lòng thử lại.");
        console.error("handleOkDesign called with null task or task.serviceOrder:", task);
        return;
      }

      // Check if we have images to upload or existing images
      if (designImageUrls.length === 0 &&
        !task.serviceOrder.image?.imageUrl &&
        !task.serviceOrder.image?.image2 &&
        !task.serviceOrder.image?.image3) {
        message.error("Vui lòng tải lên ít nhất một ảnh thiết kế chi tiết.");
        return;
      }

      setUploadingDesign(true);

      // Use existing images if no new ones are uploaded
      const uploadedUrls = designImageUrls.length > 0 ? designImageUrls : [
        task.serviceOrder.image?.imageUrl,
        task.serviceOrder.image?.image2,
        task.serviceOrder.image?.image3
      ].filter(Boolean);

      // Xác định phase mới dựa trên maxPhaseInDesignRecords
      const newPhase = maxPhaseInDesignRecords + 1;

      // Xác định trạng thái của service order
      const currentOrderStatus = task?.serviceOrder?.status;

      // Determine the status to use based on current order status
      let statusForRecordCreation;

      if (currentOrderStatus === 'DepositSuccessful' || currentOrderStatus === 3) {
        statusForRecordCreation = 4; // AssignToDesigner
      } else if (currentOrderStatus === 'ReDesign' || currentOrderStatus === 20) {
        statusForRecordCreation = 20; // Giữ nguyên trạng thái ReDesign
      } else {
        console.warn(`Unexpected initial status ${currentOrderStatus} for design submission. Defaulting status to 4.`);
        statusForRecordCreation = 4; // Default to AssignToDesigner
      }
      console.log(`Using status ${statusForRecordCreation} for design record with phase ${newPhase}.`);

      // Step 1: Update service order with initial status (for record creation)
      const serviceOrderUpdateData = {
        serviceType: 1,
        designPrice: task.serviceOrder.designPrice,
        description: task.serviceOrder.description,
        status: statusForRecordCreation, // Use the determined status
        report: task.serviceOrder.report || "", // Giữ lại report để biết lý do redesign
        image: {
          imageUrl: uploadedUrls[0] || "",
          image2: uploadedUrls[1] || "",
          image3: uploadedUrls[2] || ""
        },
        // serviceOrderDetails: task.serviceOrder.serviceOrderDetails
      };

      console.log("Payload for updateServiceOrder:", serviceOrderUpdateData);
      await updateServiceOrder(task.serviceOrder.id, serviceOrderUpdateData);
      console.log(`ServiceOrder updated with status ${statusForRecordCreation}.`);

      // Refresh design records after successful update
      await getRecordDesign(task.serviceOrder.id);

      // Cập nhật maxPhaseInDesignRecords với phase mới
      setMaxPhaseInDesignRecords(newPhase);

      // Kiểm tra nếu đã đến phase 3 (lần thiết kế cuối)
      if (newPhase >= 3) {
        message.info("Đây là lần cập nhật thiết kế cuối cùng. Sau lần này, khách hàng sẽ chọn một trong các thiết kế hoặc hủy đơn hàng.");
      }

      message.success(`Cập nhật bản vẽ thiết kế chi tiết lần ${newPhase} thành công`);
      setIsModalVisibleDesign(false);
      setDesignImageUrls([]);

      // Refetch task detail
      await fetchTaskDetail(id);
      console.log("Task detail refetched after design submission.");
    } catch (error) {
      console.error("Update error:", error);
      // Xử lý các trường hợp lỗi cụ thể
      if (error.response?.data?.error?.includes("maximum number of edits")) {
        message.error("Bạn đã đạt giới hạn số lần chỉnh sửa cho phép. Không thể cập nhật thêm.");
      } else {
        message.error("Cập nhật bản vẽ thiết kế chi tiết thất bại: " + (error.response?.data?.message || error.message || "Lỗi không xác định"));
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

      // Khởi tạo danh sách sản phẩm đã chọn từ serviceOrderDetails
      const initialSelectedProducts = task.serviceOrder.serviceOrderDetails.map(detail => ({
        productId: detail.productId,
        quantity: detail.quantity || 1
      }));

      // Set danh sách tạm thời từ serviceOrderDetails
      setTempServiceOrderDetails(initialSelectedProducts);
      setSelectedProducts([]); // Reset selected products
      setIsProductModalVisible(true);
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm");
      console.error("Error loading products:", error);
    }
  };

  // Hàm thêm sản phẩm mới vào danh sách tạm
  const handleAddProduct = () => {
    if (selectedProducts.length === 0) {
      message.warning("Vui lòng chọn sản phẩm");
      return;
    }

    const selectedProductId = selectedProducts[0];
    const selectedProduct = allProducts.find(p => p.id === selectedProductId);

    if (!selectedProduct) {
      message.error("Không tìm thấy thông tin sản phẩm");
      return;
    }

    // Kiểm tra xem sản phẩm đã tồn tại trong danh sách tạm chưa
    const existingProduct = tempServiceOrderDetails.find(
      item => item.productId === selectedProductId
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
      totalPrice: selectedProduct.price || 0
    };

    // Cập nhật danh sách tạm thời
    setTempServiceOrderDetails(prev => [...prev, newProduct]);
    setSelectedProducts([]); // Reset selected products

    message.success(`Đã thêm sản phẩm "${selectedProduct.name}" vào danh sách`);
  };

  // Hàm xóa sản phẩm khỏi danh sách tạm
  const handleRemoveProduct = (productId) => {
    const productToRemove = allProducts.find(p => p.id === productId);

    // Cập nhật danh sách tạm thời bằng cách lọc bỏ sản phẩm
    setTempServiceOrderDetails(prev =>
      prev.filter(item => item.productId !== productId)
    );

    if (productToRemove) {
      message.success(`Đã xóa sản phẩm "${productToRemove.name}" khỏi danh sách`);
    }
  };

  // Hàm cập nhật số lượng sản phẩm trong danh sách tạm
  const handleUpdateQuantity = (productId, quantity) => {
    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity < 1) {
      message.warning("Số lượng phải là số nguyên dương");
      return;
    }

    const product = allProducts.find(p => p.id === productId);
    const price = product?.price || 0;

    // Cập nhật số lượng và tổng giá trong danh sách tạm thời
    setTempServiceOrderDetails(prev =>
      prev.map(item =>
        item.productId === productId ? {
          ...item,
          quantity: newQuantity,
          price: price,
          totalPrice: price * newQuantity
        } : item
      )
    );
  };

  // Hàm lưu danh sách sản phẩm đã tùy chỉnh
  const handleSaveProducts = async () => {
    try {
      // Kiểm tra xem có sản phẩm nào trong danh sách tạm không
      if (tempServiceOrderDetails.length === 0) {
        message.warning("Vui lòng thêm ít nhất một sản phẩm");
        return;
      }

      // Kiểm tra số lượng của từng sản phẩm trong danh sách tạm
      const invalidProducts = tempServiceOrderDetails.filter(item => !item.quantity || item.quantity <= 0);
      if (invalidProducts.length > 0) {
        message.warning("Vui lòng kiểm tra lại số lượng sản phẩm");
        return;
      }

      // Đảm bảo mỗi sản phẩm có đầy đủ thông tin
      const updatedServiceOrderDetails = tempServiceOrderDetails.map(item => {
        const product = allProducts.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          // price: product?.price || 0,
          // totalPrice: (product?.price || 0) * item.quantity
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
        reportAccoutant: task.serviceOrder.reportAccoutant || "",
        // image: task.serviceOrder.image,
        serviceOrderDetails: updatedServiceOrderDetails // Sử dụng danh sách đã được cập nhật
      };

      try {
        const response = await updateProductOrder(task.serviceOrder.id, serviceOrderUpdateData);

        // Thay vào đó, chỉ cập nhật chi tiết sản phẩm
        await loadProductDetails(updatedServiceOrderDetails);

        message.success("Cập nhật danh sách sản phẩm thành công");
        setIsProductModalVisible(false); // Tự động tắt modal sau khi cập nhật thành công

        // Làm mới dữ liệu task sau khi cập nhật
        fetchTaskDetail(id);
      } catch (apiError) {
        console.error("API Error:", apiError);
        // Xử lý các trường hợp lỗi cụ thể
        if (apiError.response?.data?.error?.includes("maximum number of edits")) {
          message.error("Bạn đã đạt giới hạn số lần chỉnh sửa cho phép. Không thể cập nhật thêm.");
        } else {
          message.error("Cập nhật danh sách sản phẩm thất bại: " + (apiError.message || "Lỗi không xác định"));
        }
      }
    } catch (error) {
      console.error("General Error:", error);
      message.error("Có lỗi xảy ra khi xử lý yêu cầu");
    }
  };

  // Hàm hoàn tất quá trình cập nhật bản vẽ và tùy chỉnh sản phẩm
  const handleCompleteDesign = async () => {
    try {
      console.log("Starting handleCompleteDesign function");

      // Step 1: Update service order status to DoneDesign (6)
      const response = await api.put(`/api/serviceorder/status/${task.serviceOrder.id}`, {
        status: 5, // DoneDesign
        deliveryCode: ""
      });

      // Check if the response has data property or is directly the success message
      const responseStatus = response?.data || response;

      // Check various possible response formats
      const isSuccess =
        responseStatus === 'Update Successfully!' ||
        responseStatus === 'Update Successfully' ||
        responseStatus?.includes?.('Success') ||
        response?.status === 200;


      if (isSuccess) {
        // Step 2: Update task status to 3
        try {
          const taskUpdateResponse = await updateTaskStatus(task.id, {
            serviceOrderId: task.serviceOrder.id,
            userId: user.id,
            status: 3, // Update to status 3 as requested
            note: "Hoàn tất thiết kế chi tiết và sản phẩm đã được chọn"
          });

          console.log("Task status update response:", taskUpdateResponse);

          // Refresh task data
          fetchTaskDetail(id);
          console.log("Task detail refresh initiated");

          message.success("Hoàn tất quá trình cập nhật bản vẽ và tùy chỉnh sản phẩm");
        } catch (taskUpdateError) {
          message.error("Đã cập nhật trạng thái đơn hàng nhưng không thể cập nhật trạng thái công việc: " +
            (taskUpdateError.response?.data?.message || taskUpdateError.message));
        }
      } else {
        message.error("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.");
      }
    } catch (error) {
      message.error("Lỗi khi hoàn tất thiết kế: " + (error.response?.data?.message || error.message || "Lỗi không xác định"));
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

        if (status && status !== 'Pending' && status !== 'ConsultingAndSketching') {
          await getRecordSketch(taskData.serviceOrder.id);
        }

        // --- Check for design records (load only when status is AssignToDesigner or later) ---
        const statusValue = typeof taskData?.serviceOrder?.status === 'string' ? taskData?.serviceOrder?.status : '';
        const isAfterAssignToDesigner = statusValue === 'AssignToDesigner' ||
          statusValue === 'DeterminingMaterialPrice' ||
          statusValue === 'DoneDesign' ||
          statusValue === 'PaymentSuccess' ||
          statusValue === 'Processing' ||
          statusValue === 'PickedPackageAndDelivery' ||
          statusValue === 'DeliveryFail' ||
          statusValue === 'ReDelivery' ||
          statusValue === 'DeliveredSuccessfully' ||
          statusValue === 'CompleteOrder';

        if (status && isAfterAssignToDesigner) {
          await getRecordDesign(taskData.serviceOrder.id);
        }
        // --- End check for records ---

      } catch (error) {
        // !!! IMPORTANT: MUST HAVE ERROR LOGGING !!!
        console.error("TaskDetail useEffect - ERROR caught:", error);
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
    if (!orderDetails || orderDetails.length === 0) {
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

      setProductDetails(productMap);
    } catch (error) {
      console.error("Error loading product details:", error);
      message.error("Không thể tải thông tin sản phẩm");
    } finally {
      setLoadingProducts(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      ConsultingAndSket: "blue",
      ConsultingAndSketching: "blue",
      Designing: "processing",
      Completed: "success",
      Cancelled: "error",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      ConsultingAndSket: "Tư vấn & Phác thảo",
      ConsultingAndSketching: "Tư vấn & Phác thảo",
      Designing: "Đang thiết kế",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
    };
    return statusTexts[status] || status;
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateTaskStatus(id, newStatus);
      message.success("Đã cập nhật trạng thái công việc");
    } catch (error) {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  // Add function to toggle report editor visibility
  const toggleSketchReportEditor = () => {
    // Khi đóng editor, reset giá trị report về giá trị ban đầu
    if (showSketchReportEditor) {
      // Nếu đang mở và đóng xuống, reset về giá trị trong serviceOrder nếu có
      setSketchReport(task?.serviceOrder?.skecthReport || "");
    }
    setShowSketchReportEditor(prev => !prev);
  };

  // Modified handleUpdateReport to hide the editor after successful update
  const handleUpdateSketchReport = async () => {
    if (!task || !task.serviceOrder) {
      message.error("Dữ liệu công việc chưa được tải xong. Vui lòng thử lại.");
      return;
    }

    const currentOrderStatus = task?.serviceOrder?.status;

    // Map status names to their numeric values
    const statusMap = {
      'Pending': 0,
      'ConsultingAndSketching': 1,
      'DeterminingDesignPrice': 2,
      'DepositSuccessful': 3,
      'AssignToDesigner': 4,
      'DeterminingMaterialPrice': 5,
      'DoneDesign': 6,
      'PaymentSuccess': 7,
      'Processing': 8,
      'PickedPackageAndDelivery': 9,
      'DeliveryFail': 10,
      'ReDelivery': 11,
      'DeliveredSuccessfully': 12,
      'CompleteOrder': 13,
      'OrderCancelled': 14,
      'Warning': 15,
      'Refund': 16,
      'DoneRefund': 17,
      'StopService': 18,
      'ReConsultingAndSketching': 19,
      'ReDesign': 20,
      'WaitDeposit': 21,
      'DoneDeterminingDesignPrice': 22,
      'DoneDeterminingMaterialPrice': 23,
      'ReDeterminingDesignPrice': 24,
      'ExchangeProdcut': 25,
      'WaitForScheduling': 26,
      'Installing': 27,
      'DoneInstalling': 28,
      'ReInstall': 29,
      'CustomerConfirm': 30,
      'Successfully': 31
    };

    // If currentOrderStatus is a number, use it directly, otherwise look up the numeric value
    const statusForUpdateReport = typeof currentOrderStatus === 'number'
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
      message.success("Cập nhật ghi chú / báo cáo thành công");

      // Hide the editor after successful update
      setShowReportEditor(false);

      // Refresh task detail
      await fetchTaskDetail(id);
    } catch (error) {
      message.error("Lỗi khi cập nhật ghi chú / báo cáo: " + (error.message || "Lỗi không xác định"));
    }
  };

  // Lấy bản phác thảo của phase lớn nhất
  const highestPhaseSketch = useMemo(() => {
    if (!sketchRecords || sketchRecords.length === 0) return null;

    // Tìm phase lớn nhất
    const maxPhase = Math.max(...sketchRecords.map(record => record.phase || 0));

    // Lọc các bản ghi có phase lớn nhất
    return sketchRecords.filter(record => record.phase === maxPhase);
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
    setAdjustmentOption('both');

    // Thiết lập form giá ban đầu
    sketchForm.setFieldsValue({
      designPrice: task?.serviceOrder?.designPrice || 0
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
    task.serviceOrder.serviceOrderDetails?.map((detail, index) => ({
      key: index,
      productId: detail.productId,
      quantity: detail.quantity,
      price: detail.price,
      totalPrice: detail.totalPrice,
    })) || [];

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
      'AssignToDesigner',
      'DeterminingMaterialPrice',
      'DoneDesign',
      'PaymentSuccess',
      'Processing',
      'PickedPackageAndDelivery',
      'DeliveryFail',
      'ReDelivery',
      'DeliveredSuccessfully',
      'CompleteOrder',
      'ReDesign'
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
          style={{ marginLeft: '8px' }}
        >
          Cập nhật lại bản phác thảo và giá
        </Button>
      );
    }
    return null;
  };

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
                <span className="font-mono">{task.serviceOrder.id}</span>
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

              <Descriptions.Item label={<><UserOutlined /> Khách hàng</>} span={1}>
                <Space>
                  {task.serviceOrder.userName}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>} span={1}>
                <Space>
                  {task.serviceOrder.cusPhone}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label={<><MailOutlined /> Email</>} span={1}>
                <Space>
                  {task.serviceOrder.email}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label={<><CalendarOutlined /> Lịch hẹn gặp khách hàng</>} span={2}>
                <Space>
                  Ngày: {task.dateAppointment} - Giờ: {task.timeAppointment}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>} span={3}>
                <Space>
                  {task.serviceOrder.address.replace(/\|/g, ", ")}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label={<><CalendarOutlined /> Ngày tạo</>} span={1}>
                <Space>
                  {dayjs(task.creationDate).format("DD/MM/YYYY HH:mm")}
                </Space>
              </Descriptions.Item>

              {task.modificationDate && (
                <Descriptions.Item label={<><CalendarOutlined /> Ngày cập nhật</>} span={2}>
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
                {task.serviceOrder.materialPrice === 0 ? "Chưa có" : `${task.serviceOrder.materialPrice.toLocaleString("vi-VN")} đ`}
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
            {task.serviceOrder.reportManger && task.serviceOrder.status === 'ReDeterminingDesignPrice' && (
              <Card
                title={
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#f5222d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <EditOutlined />
                    Yêu cầu điều chỉnh từ Manager
                  </span>
                }
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  marginTop: '16px',
                  marginBottom: '16px',
                  borderLeft: '4px solid #f5222d'
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: task.serviceOrder.reportManger }} />
              </Card>
            )}

            {/* ----- Original Customer Images (Phase 0) ----- */}
            {(task.serviceOrder.status === 'Pending' || task.serviceOrder.status === 'ConsultingAndSketching') ? (
              // --- Status: Pending or Consulting -> Show Original Images from serviceOrder.image --- 
              task.serviceOrder.image && (task.serviceOrder.image.imageUrl || task.serviceOrder.image.image2 || task.serviceOrder.image.image3) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Title level={5}><PictureOutlined /> Hình ảnh khách hàng cung cấp (Ban đầu)</Title>
                  <Row gutter={[8, 8]}>
                    {task.serviceOrder.image.imageUrl && <Col span={8}><Image src={task.serviceOrder.image.imageUrl} alt="Hình ảnh 1" className="rounded" /></Col>}
                    {task.serviceOrder.image.image2 && <Col span={8}><Image src={task.serviceOrder.image.image2} alt="Hình ảnh 2" className="rounded" /></Col>}
                    {task.serviceOrder.image.image3 && <Col span={8}><Image src={task.serviceOrder.image.image3} alt="Hình ảnh 3" className="rounded" /></Col>}
                  </Row>
                </div>
              )
            ) : (
              // --- Status: Other than Pending/Consulting -> Show ONLY Phase 0 Sketch Records --- 
              showSketchRecords ? (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Title level={5}><PictureOutlined /> Hình ảnh khách hàng cung cấp</Title>
                  {(() => {
                    const phase = 0;
                    const recordsInPhase = sketchRecords.filter(record => record.phase === phase);

                    if (recordsInPhase.length === 0) return <Empty description="Không có hình ảnh ban đầu của khách hàng." />;

                    const phaseTitle = "Ảnh khách hàng cung cấp";

                    return (
                      <div key={phase} style={{ marginBottom: '20px' }}>
                        {/* Wrap images in PreviewGroup for gallery view */}
                        <Image.PreviewGroup items={recordsInPhase.flatMap(r => [r.image?.imageUrl, r.image?.image2, r.image?.image3].filter(Boolean))}>
                          <Row gutter={[16, 16]}>
                            {/* Iterate through records (usually one per phase), then display its images horizontally */}
                            {recordsInPhase.map((record, recordIndex) => (
                              <React.Fragment key={`${record.id}-${recordIndex}`}>
                                {record.image?.imageUrl && (
                                  <Col xs={24} sm={12} md={8}> {/* Adjust column spans as needed */}
                                    <Image
                                      src={record.image.imageUrl}
                                      alt={`Ảnh ${phaseTitle} - ${recordIndex + 1}.1`}
                                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                  </Col>
                                )}
                                {record.image?.image2 && (
                                  <Col xs={24} sm={12} md={8}>
                                    <Image
                                      src={record.image.image2}
                                      alt={`Ảnh ${phaseTitle} - ${recordIndex + 1}.2`}
                                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                  </Col>
                                )}
                                {record.image?.image3 && (
                                  <Col xs={24} sm={12} md={8}>
                                    <Image
                                      src={record.image.image3}
                                      alt={`Ảnh ${phaseTitle} - ${recordIndex + 1}.3`}
                                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                  </Col>
                                )}
                                {/* If a record has no images, optionally show a placeholder */}
                                {!record.image?.imageUrl && !record.image?.image2 && !record.image?.image3 && (
                                  <Col span={24}><Text type="secondary">Không có ảnh cho bản ghi này.</Text></Col>
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
                  <Title level={5}><PictureOutlined /> Hình ảnh khách hàng cung cấp</Title>
                  <Empty description="Không có dữ liệu hình ảnh khách hàng." />
                </div>
              )
            )}

            {/* Description - show after customer images */}
            {task.serviceOrder.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Title level={5}><FileTextOutlined /> Mô tả yêu cầu của khách hàng</Title>
                <div className="p-4 bg-gray-50 rounded border">
                  <div dangerouslySetInnerHTML={{ __html: task.serviceOrder.description }} />
                </div>
              </div>
            )}
            {task.note && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Title
                  level={5}
                  style={{
                    color:
                      task.serviceOrder.status === 'ConsultingAndSketching'
                        ? '#1890ff'
                        : task.serviceOrder.status === 'ReConsultingAndSketching'
                          ? '#faad14'

                          : '#1890ff'
                  }}
                >
                  <FileTextOutlined />{' '}
                  {task.serviceOrder.status === 'ReConsultingAndSketching'
                    ? 'Yêu cầu chỉnh sửa từ khách hàng'
                    : 'Ghi chú về đơn thiết kế'}
                </Title>

                <div className="p-4 bg-gray-50 rounded border">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: task.note
                    }}
                  />
                </div>
              </div>
            )}

            {/* Report Section - Modified */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <Title level={5}><FileTextOutlined /> Ghi chú quá trình làm việc & giá thiết kế đề xuất với khách hàng</Title>
              </div>

              {/* Display existing report if available */}
              {task.serviceOrder?.skecthReport && (
                <div className={showReportEditor ? "mb-4" : ""}>
                  <div className="p-4 bg-gray-50 rounded border">
                    <div dangerouslySetInnerHTML={{ __html: task.serviceOrder.skecthReport }} />
                  </div>
                </div>
              )}

              {/* Editor for creating/updating report */}
              {showReportEditor && (
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <Button
                        type="primary"
                        onClick={handleUpdateSketchReport}
                        icon={<SaveOutlined />}
                      >
                        Lưu ghi chú
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Show button to open editor if report exists and editor is hidden */}
              {!showReportEditor && task.serviceOrder?.skecthReport && (
                <div className="mt-3 text-center">
                  <Button
                    type="dashed"
                    onClick={toggleSketchReportEditor}
                    icon={<EditOutlined />}
                    style={{ width: '100%', color: 'green', marginBottom: '14px' }}
                  >
                    Cập nhật ghi chú / báo cáo
                  </Button>
                </div>
              )}
            </div>

            {/* ----- Sketch Records (Phases 1, 2, 3) ----- */}
            {showSketchRecords && sketchRecords.some(record => record.serviceOrderId === task?.serviceOrder?.id) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Title level={5}><PictureOutlined /> Bản phác thảo / Thiết kế</Title>
                {[1, 2, 3].map(phase => {
                  const recordsInPhase = sketchRecords.filter(record => record.phase === phase);

                  if (recordsInPhase.length === 0) return null;

                  const phaseTitle = `Bản phác thảo lần ${phase}`;
                  // Check if *any* record in this phase is selected (usually only one can be)
                  const isPhaseSelected = recordsInPhase.some(record => record.isSelected);

                  return (
                    <div key={phase} style={{ marginBottom: '20px' }}>
                      <Title level={5} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                        {phaseTitle}
                        {isPhaseSelected && (
                          <Tag color="success" icon={<CheckSquareOutlined />} style={{ marginLeft: 8 }}>
                            Khách hàng đã chọn
                          </Tag>
                        )}
                      </Title>
                      {/* Wrap images in PreviewGroup for gallery view */}
                      <Image.PreviewGroup items={recordsInPhase.flatMap(r => [r.image?.imageUrl, r.image?.image2, r.image?.image3].filter(Boolean))}>
                        <Row gutter={[16, 16]}>
                          {/* Iterate through records (usually one per phase), then display its images horizontally */}
                          {recordsInPhase.map((record, recordIndex) => (
                            <React.Fragment key={`${record.id}-${recordIndex}`}>
                              {record.image?.imageUrl && (
                                <Col xs={24} sm={12} md={8}> {/* Adjust column spans as needed */}
                                  <Image
                                    src={record.image.imageUrl}
                                    alt={`Ảnh ${phaseTitle} - ${recordIndex + 1}.1`}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                  />
                                </Col>
                              )}
                              {record.image?.image2 && (
                                <Col xs={24} sm={12} md={8}>
                                  <Image
                                    src={record.image.image2}
                                    alt={`Ảnh ${phaseTitle} - ${recordIndex + 1}.2`}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                  />
                                </Col>
                              )}
                              {record.image?.image3 && (
                                <Col xs={24} sm={12} md={8}>
                                  <Image
                                    src={record.image.image3}
                                    alt={`Ảnh ${phaseTitle} - ${recordIndex + 1}.3`}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                  />
                                </Col>
                              )}
                              {/* If a record has no images, optionally show a placeholder */}
                              {!record.image?.imageUrl && !record.image?.image2 && !record.image?.image3 && (
                                <Col span={24}><Text type="secondary">Không có ảnh cho bản ghi này.</Text></Col>
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
                <Title level={5}><PictureOutlined /> Bản vẽ thiết kế chi tiết</Title>
                {showDesignRecords ? (
                  <div>
                    {[1, 2, 3].map(phase => {
                      const recordsInPhase = designRecords.filter(record => record.phase === phase);

                      // Skip if no records in this phase
                      if (recordsInPhase.length === 0) return null;

                      const phaseTitle = `Bản thiết kế chi tiết lần ${phase}`;
                      // Check if any record in this phase is selected
                      const isPhaseSelected = recordsInPhase.some(record => record.isSelected);

                      return (
                        <div key={phase} style={{ marginBottom: '20px' }}>
                          <Title level={5} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                            {phaseTitle}
                            {isPhaseSelected && (
                              <Tag color="success" icon={<CheckSquareOutlined />} style={{ marginLeft: 8 }}>
                                Khách hàng đã chọn
                              </Tag>
                            )}
                          </Title>
                          {/* Wrap images in PreviewGroup for gallery view */}
                          <Image.PreviewGroup items={recordsInPhase.flatMap(r => [r.image?.imageUrl, r.image?.image2, r.image?.image3].filter(Boolean))}>
                            <Row gutter={[16, 16]}>
                              {/* Iterate through records in this phase, then display its images horizontally */}
                              {recordsInPhase.map((record, recordIndex) => (
                                <React.Fragment key={`${record.id}-${recordIndex}`}>
                                  {record.image?.imageUrl && (
                                    <Col xs={24} sm={12} md={8}>
                                      <Image
                                        src={record.image.imageUrl}
                                        alt={`Ảnh ${phaseTitle} - ${recordIndex + 1}.1`}
                                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                      />
                                    </Col>
                                  )}
                                  {record.image?.image2 && (
                                    <Col xs={24} sm={12} md={8}>
                                      <Image
                                        src={record.image.image2}
                                        alt={`Ảnh ${phaseTitle} - ${recordIndex + 1}.2`}
                                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                      />
                                    </Col>
                                  )}
                                  {record.image?.image3 && (
                                    <Col xs={24} sm={12} md={8}>
                                      <Image
                                        src={record.image.image3}
                                        alt={`Ảnh ${phaseTitle} - ${recordIndex + 1}.3`}
                                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                      />
                                    </Col>
                                  )}
                                  {/* If a record has no images, optionally show a placeholder */}
                                  {!record.image?.imageUrl && !record.image?.image2 && !record.image?.image3 && (
                                    <Col span={24}><Text type="secondary">Không có ảnh cho bản ghi này.</Text></Col>
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
              // Cập nhật điều kiện hiển thị nút dựa trên maxPhaseInDesignRecords
              (
                // TH1: Chưa có bản thiết kế nào (maxPhase = 0)
                maxPhaseInDesignRecords === 0 ||
                // TH2: Với DepositSuccessful, chỉ hiển thị khi chưa có bản thiết kế
                (task.serviceOrder.status === "DepositSuccessful" && maxPhaseInDesignRecords === 0) ||
                // TH3: Với ReDesign, hiển thị khi:
                // - Chưa có bản thiết kế nào (tạo phase 1)
                // - Có phase 1 nhưng chưa có phase 2 (tạo phase 2)
                // - Đã có phase 2 nhưng chưa có phase 3 (tạo phase 3)
                (task.serviceOrder.status === "ReDesign" && maxPhaseInDesignRecords < 3)
              ) && (
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={showModalDesign}
                >
                  Cập nhật bản vẽ thiết kế chi tiết {maxPhaseInDesignRecords < 3 ? `(Lần ${maxPhaseInDesignRecords + 1})` : ""}
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
        extra={
          <Space>
            {task.status === "Design" && (task.serviceOrder.status === "DepositSuccessful" || task.serviceOrder.status === "ReDesign" || task.serviceOrder.status === "AssignToDesigner") && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={showProductModal}
              >
                Tùy chỉnh sản phẩm
              </Button>
            )}

          </Space>
        }
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
      {(task.serviceOrder.status === "DepositSuccessful" || task.serviceOrder.status === "ReDesign" || task.serviceOrder.status === "AssignToDesigner") && (
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleCompleteDesign}
        >
          Hoàn tất cập nhật thiết kế chi tiết
        </Button>
      )}
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
          <Form.Item
            label="Bản vẽ phác thảo (Tối đa 3 ảnh)"
            required
          >
            <Upload
              listType="picture-card"
              beforeUpload={(file) => {
                setSketchFiles(prev => [...prev, file]);
                return false;
              }}
              onRemove={(file) => {
                setSketchFiles(prev => prev.filter(f => f.uid !== file.uid));
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
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <Spin tip={`Đang tải lên ${sketchFiles.length} ảnh... ${progress}%`} />
                <Progress percent={progress} size="small" showInfo={false} />
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="designPrice"
            label="Giá thiết kế dự kiến"
            rules={[
              { required: true, message: "Vui lòng nhập giá thiết kế dự kiến" },
              { type: 'number', min: 0, message: 'Giá phải là số không âm' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập giá dự kiến (VNĐ)"
            />
          </Form.Item>
          <Form.Item
            name="report"
            label="Ghi chú/báo cáo về bản phác thảo"
            rules={[{ required: true, message: "Vui lòng nhập ghi chú/báo cáo về bản phác thảo" }]}
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
                <div style={{ marginTop: 8 }}>
                  Tải ảnh
                </div>
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
        width={800}
      >
        <div className="mb-4">
          <Space>
            <Select
              style={{ width: 300 }}
              placeholder="Chọn sản phẩm"
              value={selectedProducts}
              onChange={(value) => {
                setSelectedProducts(value ? [value] : []);
              }}
              mode="single"
              optionFilterProp="children"
            >
              {allProducts.map((product) => (
                <Select.Option key={product.id} value={product.id}>
                  {product.name}
                </Select.Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProduct}
            >
              Thêm
            </Button>
          </Space>
        </div>

        <Table
          dataSource={tempServiceOrderDetails.map((item, index) => {
            const product = allProducts.find(p => p.id === item.productId);
            return {
              key: index,
              productId: item.productId,
              productName: product ? product.name : "Sản phẩm không tồn tại",
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
                const product = allProducts.find(p => p.id === record.productId);
                return (
                  <div className="flex items-center">
                    {product?.image?.imageUrl ? (
                      <Image
                        src={product.image.imageUrl}
                        alt={product.name}
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
                    <div>
                      <div className="font-medium">{product ? product.name : "Sản phẩm không tồn tại"}</div>
                      <div className="text-xs text-gray-500">ID: {record.productId}</div>
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
                const product = allProducts.find(p => p.id === record.productId);
                return product ? product.price?.toLocaleString("vi-VN") + " đ" : "0 đ";
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
                  onChange={(value) => handleUpdateQuantity(record.productId, value)}
                  style={{ width: 100 }}
                />
              ),
            },
            {
              title: "Thành tiền",
              key: "totalPrice",
              render: (_, record) => {
                const product = allProducts.find(p => p.id === record.productId);
                const price = product?.price || 0;
                return (
                  <Text strong>
                    {(price * record.quantity).toLocaleString("vi-VN")} đ
                  </Text>
                );
              },
            },
            {
              title: "Thao tác",
              key: "action",
              render: (_, record) => (
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa sản phẩm này?"
                  onConfirm={() => handleRemoveProduct(record.productId)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                  >
                    Xóa
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
          pagination={false}
        />
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
        <div style={{
          backgroundColor: '#f9f0ff',
          border: '1px solid #d3adf7',
          padding: '16px',
          borderRadius: '4px',
          marginBottom: '24px'
        }}>
          <Typography.Title level={5} style={{ color: '#722ed1', marginTop: 0 }}>
            Hướng dẫn điều chỉnh
          </Typography.Title>

          <Typography.Paragraph>
            Manager đã yêu cầu điều chỉnh bản phác thảo hoặc giá thiết kế. Vui lòng xem chi tiết yêu cầu ở phần báo cáo từ Manager và thực hiện các điều chỉnh phù hợp.
          </Typography.Paragraph>

          <Typography.Paragraph strong>
            Bạn có thể:
          </Typography.Paragraph>

          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Điều chỉnh <strong>cả giá và bản phác thảo</strong></li>
            <li>Chỉ điều chỉnh <strong>giá thiết kế</strong></li>
            <li>Chỉ cập nhật <strong>hình ảnh phác thảo mới</strong></li>
          </ul>

          <Typography.Paragraph type="warning">
            <strong>Lưu ý:</strong> Khi cập nhật, bản phác thảo hiện tại sẽ được thay thế bằng phiên bản mới.
          </Typography.Paragraph>
        </div>

        {/* Hiển thị bản phác thảo hiện tại */}
        <div style={{ marginBottom: '24px' }}>
          <Typography.Title level={5}>Bản phác thảo hiện tại cần điều chỉnh:</Typography.Title>

          <div style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              {currentSketchImages.length > 0 ? (
                currentSketchImages.map((url, index) => (
                  <Col span={8} key={index}>
                    <Image src={url} style={{ width: '100%', objectFit: 'cover', borderRadius: '4px' }} />
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
        <div style={{
          marginBottom: '16px',
          backgroundColor: '#fafafa',
          padding: '16px',
          borderRadius: '4px',
          border: '1px solid #e8e8e8'
        }}>
          <Typography.Text strong>Chọn nội dung điều chỉnh:</Typography.Text>

          <Radio.Group
            value={adjustmentOption}
            onChange={handleAdjustmentOptionChange}
            style={{ width: '100%', marginTop: '8px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value="both">
                <strong>Điều chỉnh cả giá và bản phác thảo</strong>
              </Radio>

              <Radio value="priceOnly">
                <strong>Chỉ điều chỉnh giá</strong> (giữ nguyên bản phác thảo hiện tại)
              </Radio>

              <Radio value="imagesOnly">
                <strong>Chỉ cập nhật bản phác thảo</strong> (giữ nguyên giá thiết kế hiện tại)
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        <Divider />

        {/* Form for price adjustment - Simplified */}
        {adjustmentOption !== 'imagesOnly' && (
          <Form form={sketchForm} layout="vertical">
            <Form.Item
              name="designPrice"
              label={<Typography.Text strong>Giá thiết kế:</Typography.Text>}
              rules={[
                { required: true, message: "Vui lòng nhập giá thiết kế" },
                { type: 'number', min: 0, message: 'Giá phải là số không âm' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="Nhập giá thiết kế (VNĐ)"
                size="large"
              />
            </Form.Item>
          </Form>
        )}

        {/* Upload images - Simplified */}
        {adjustmentOption !== 'priceOnly' && (
          <div style={{ marginTop: adjustmentOption === 'imagesOnly' ? 0 : '16px' }}>
            <Form.Item
              label={<Typography.Text strong>Tải lên bản phác thảo mới:</Typography.Text>}
              required={adjustmentOption !== 'both'}
            >
              <Upload
                listType="picture-card"
                beforeUpload={(file) => {
                  setSketchFiles(prev => [...prev, file]);
                  return false;
                }}
                onRemove={(file) => {
                  setSketchFiles(prev => prev.filter(f => f.uid !== file.uid));
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
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <Spin tip={`Đang tải lên ${sketchFiles.length} ảnh...`} />
                <Progress percent={progress} size="small" showInfo={false} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskDetail;
