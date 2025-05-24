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
  Checkbox,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  ShoppingOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import useComplaintStore from "../../../stores/useComplaintStore";
import useProductStore from "../../../stores/useProductStore";
import signalRService from "../../../services/signalRService";
import "./ComplaintsList.scss";
import axios from "../../../api/api";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";

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
    createShippingOrder,
    updateComplaintDetail
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
  const [rejectReason, setRejectReason] = useState("");
  const [checkedProducts, setCheckedProducts] = useState({});
  const [processingProductId, setProcessingProductId] = useState(null);
  const [productRejectReasons, setProductRejectReasons] = useState({});
  const [rejectProductModalVisible, setRejectProductModalVisible] = useState(false);
  const [currentRejectingProduct, setCurrentRejectingProduct] = useState(null);
  const [productRejectReason, setProductRejectReason] = useState('');
  const [hasRejectedProducts, setHasRejectedProducts] = useState(false);
  const [productDescriptions, setProductDescriptions] = useState({});
  const [explicitlyRejected, setExplicitlyRejected] = useState({});
  const [videoFile, setVideoFile] = useState(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadError, setVideoUploadError] = useState(null);
  const { uploadImages: uploadVideo, progress, error: uploadError } = useCloudinaryStorage();

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

  // Modify the effect to set checkedProducts to true by default when opening details
  useEffect(() => {
    if (selectedComplaint) {
      // Initialize all products as checked (approved) by default for new complaints
      const initialChecked = {};

      // For complaints that have pending status (new complaints)
      if (selectedComplaint.status === 'pending' || selectedComplaint.status === '0' || selectedComplaint.status === 0) {
        // Set all products to approved by default
        selectedComplaint.complaintDetails?.forEach(detail => {
          initialChecked[detail.productId] = true;
        });
        setCheckedProducts(initialChecked);
      } else {
        // For already processed complaints, use the existing isCheck values
        selectedComplaint.complaintDetails?.forEach(detail => {
          initialChecked[detail.productId] = detail.isCheck;
        });
        setCheckedProducts(initialChecked);
      }
    } else {
      setCheckedProducts({});
    }
  }, [selectedComplaint]);

  // Update handleProductApproval to be more robust
  const handleProductApproval = (productId, isApproved) => {
    if (!selectedComplaint) return;

    console.log(`Setting product ${productId} to ${isApproved ? 'approved' : 'rejected'}`);

    // Update checked status
    setCheckedProducts(prev => {
      const updated = {
        ...prev,
        [productId]: isApproved
      };
      console.log('Updated checkedProducts:', updated);
      return updated;
    });

    // Track if this was an explicit rejection by the user
    if (!isApproved) {
      setExplicitlyRejected(prev => {
        const updated = {
          ...prev,
          [productId]: true
        };
        console.log('Updated explicitlyRejected:', updated);
        return updated;
      });
    } else {
      // If approving, remove from explicitly rejected
      setExplicitlyRejected(prev => {
        const newState = { ...prev };
        delete newState[productId];
        console.log('Updated explicitlyRejected (removed):', newState);
        return newState;
      });

      // Also clear any rejection description
      setProductDescriptions(prev => {
        const newDescriptions = { ...prev };
        delete newDescriptions[productId];
        return newDescriptions;
      });
    }
  };

  // Add a function to handle description changes
  const handleDescriptionChange = (productId, description) => {
    setProductDescriptions(prev => ({
      ...prev,
      [productId]: description
    }));
  };

  // Add a function to generate template rejection reason with product names
  const generateRejectionTemplate = (complaintDetails, checkedProducts, productDetails) => {
    // Get the rejected product IDs
    const rejectedProductIds = complaintDetails
      .filter(detail => checkedProducts[detail.productId] === false)
      .map(detail => detail.productId);

    if (rejectedProductIds.length === 0) return '';

    // Get product names
    const rejectedProductNames = rejectedProductIds.map(productId => {
      const product = productDetails[productId];
      return product ? product.name : `Sản phẩm #${productId.slice(0, 8)}...`;
    });

    // Generate template
    let template = `Xin lỗi, chúng tôi không thể chấp nhận khiếu nại đối với `;

    if (rejectedProductNames.length === 1) {
      template += `sản phẩm "${rejectedProductNames[0]}"`;
    } else {
      const lastProduct = rejectedProductNames.pop();
      template += `các sản phẩm ${rejectedProductNames.map(name => `"${name}"`).join(', ')} và "${lastProduct}"`;
    }

    template += ` vì không đáp ứng đủ điều kiện khiếu nại.`;

    return template;
  };

  // Update saveProductReviews function to provide better error handling and debugging
  const saveProductReviews = async () => {
    if (!selectedComplaint) {
      message.error('Không tìm thấy thông tin khiếu nại!');
      return;
    }

    console.log('Current state before saving:');
    console.log('checkedProducts:', checkedProducts);
    console.log('explicitlyRejected:', explicitlyRejected);
    console.log('productDescriptions:', productDescriptions);

    // Check 1: Make sure all products have been evaluated (either approved or explicitly rejected)
    const unevaluatedProducts = selectedComplaint.complaintDetails.filter(detail =>
      !explicitlyRejected[detail.productId] && checkedProducts[detail.productId] !== true
    );

    if (unevaluatedProducts.length > 0) {
      console.log('Unevaluated products:', unevaluatedProducts);
      message.warning('Vui lòng đánh giá tất cả sản phẩm (chấp nhận hoặc từ chối) trước khi lưu!');
      return;
    }

    // Check 2: Make sure all rejected products have a reason
    const rejectedProductsWithoutDescription = selectedComplaint.complaintDetails
      .filter(detail =>
        explicitlyRejected[detail.productId] &&
        checkedProducts[detail.productId] === false &&
        (!productDescriptions[detail.productId] || !productDescriptions[detail.productId].trim())
      );

    if (rejectedProductsWithoutDescription.length > 0) {
      console.log('Rejected products without descriptions:', rejectedProductsWithoutDescription);
      message.error('Vui lòng nhập lý do từ chối cho tất cả sản phẩm bị từ chối!');
      return;
    }

    try {
      setProcessingAction(true);

      // Prepare the data for the API
      const productDetails = selectedComplaint.complaintDetails.map(detail => {
        const isApproved = checkedProducts[detail.productId] === true;
        const description = isApproved ? null : productDescriptions[detail.productId] || '';

        return {
          productId: detail.productId,
          isCheck: isApproved,
          description: description
        };
      });

      console.log('Sending data to API:', productDetails);

      // Call the API with all product updates at once
      const updateResult = await updateComplaintDetail(selectedComplaint.id, productDetails);
      console.log('API update result:', updateResult);

      // Get the updated complaint directly from the API
      try {
        const response = await axios.get(`/api/complaint/${selectedComplaint.id}`);
        console.log('Fresh complaint data:', response.data);

        if (response.data) {
          // Update the selected complaint with fresh data
          const freshComplaint = response.data;
          setSelectedComplaint(freshComplaint);

          // Check if any products were rejected
          const hasRejected = freshComplaint.complaintDetails.some(detail => detail.isCheck === false);

          setHasRejectedProducts(hasRejected);

          // Update checkedProducts from the fresh data
          const updatedChecked = {};
          freshComplaint.complaintDetails.forEach(detail => {
            updatedChecked[detail.productId] = detail.isCheck;
          });
          console.log('New checkedProducts from API:', updatedChecked);
          setCheckedProducts(updatedChecked);

          // Update descriptions from the fresh data
          const updatedDescriptions = {};
          freshComplaint.complaintDetails.forEach(detail => {
            if (detail.description) {
              updatedDescriptions[detail.productId] = detail.description;
            }
          });
          console.log('New descriptions from API:', updatedDescriptions);
          setProductDescriptions(updatedDescriptions);

          // Clear explicitlyRejected state after successful save,
          // but restore it based on response data so products remain rejected in UI
          const newExplicitlyRejected = {};
          freshComplaint.complaintDetails.forEach(detail => {
            if (detail.isCheck === false) {
              newExplicitlyRejected[detail.productId] = true;
            }
          });
          console.log('New explicitlyRejected from API:', newExplicitlyRejected);
          setExplicitlyRejected(newExplicitlyRejected);

          // Generate rejection reason template if there are rejected products
          if (hasRejected) {
            const template = generateRejectionTemplate(
              freshComplaint.complaintDetails,
              updatedChecked,
              productDetails
            );

            // Only update the rejection reason if it's empty or if we haven't customized it yet
            if (!rejectReason.trim()) {
              setRejectReason(template);
            }
          }

          message.success('Đã lưu đánh giá sản phẩm thành công!');

          // Also update complaints list to keep it consistent
          fetchComplaints();
        }
      } catch (fetchError) {
        console.error("Error fetching updated complaint:", fetchError);
        // Fallback to refreshing all complaints
        await fetchComplaints();
        message.success('Đã lưu đánh giá sản phẩm thành công (nhưng không lấy được dữ liệu mới)!');
      }
    } catch (error) {
      console.error('Error saving product reviews:', error);
      message.error(`Lỗi khi lưu đánh giá sản phẩm: ${error.message || 'Không xác định'}`);
    } finally {
      setProcessingAction(false);
    }
  };

  // Update allProductsReviewed function to check if all products have been evaluated
  const allProductsReviewed = () => {
    if (!selectedComplaint?.complaintDetails || selectedComplaint.complaintDetails.length === 0) {
      return false;
    }

    // Check that all products have been evaluated (either approved or explicitly rejected)
    const allEvaluated = selectedComplaint.complaintDetails.every(detail =>
      checkedProducts[detail.productId] === true || explicitlyRejected[detail.productId] === true
    );

    // And all rejected products have descriptions
    const allRejectedHaveDescriptions = selectedComplaint.complaintDetails
      .filter(detail => explicitlyRejected[detail.productId] && checkedProducts[detail.productId] === false)
      .every(detail => productDescriptions[detail.productId] && productDescriptions[detail.productId].trim());

    return allEvaluated && allRejectedHaveDescriptions;
  };

  // Modify the hasApprovedProducts function to use checkedProducts correctly
  const hasApprovedProducts = () => {
    // First check if product reviews have been saved to the API
    const hasApprovedInAPI = selectedComplaint?.complaintDetails?.some(detail => detail.isCheck === true);

    // If already approved in API, return true
    if (hasApprovedInAPI) {
      return true;
    }

    // Otherwise check local state
    return Object.values(checkedProducts).some(isChecked => isChecked === true);
  };

  // Reset checked products when complaint changes
  useEffect(() => {
    if (selectedComplaint) {
      // Initialize with empty object (all products unchecked by default)
      setCheckedProducts({});

      // If products have already been reviewed (at least one has isCheck: true)
      // This means the complaint has been processed before
      const hasBeenReviewed = selectedComplaint.complaintDetails?.some(detail => detail.isCheck === true);

      if (hasBeenReviewed) {
        // Initialize checked products based on existing isCheck values
        const initialChecked = {};
        selectedComplaint.complaintDetails?.forEach(detail => {
          initialChecked[detail.productId] = detail.isCheck;
        });
        setCheckedProducts(initialChecked);
      }
    } else {
      setCheckedProducts({});
    }
  }, [selectedComplaint]);

  // Update the status change handler to consider rejected products
  const handleStatusChange = async (status) => {
    if (!selectedComplaint) return;

    setSelectedStatus(status);
    // Check if any products have been reviewed (API data)
    const hasBeenReviewed = selectedComplaint.complaintDetails?.some(detail => detail.isCheck === true);

    // If not reviewed and trying to approve, show error
    if (!hasBeenReviewed && status === 'approved') {
      message.error('Vui lòng lưu đánh giá sản phẩm trước khi duyệt khiếu nại!');
      return;
    }

    try {
      // Numeric status mapping
      const numericStatusMap = {
        "arrived": 1,      // ItemArrivedAtWarehouse
        "approved": 2,     // Approved
        "processing": 3,   // Processing
        "refund": 4,       // Hoàn tiền (chỉ dùng cho Refund)
        "complete": 5,     // Hoàn thành
        "reject": 6,       // reject
        "delivery": 7,     // Delivery (chỉ dùng cho ProductReturn)
        "delivered": 8,    // delivered (chỉ dùng cho ProductReturn)
      };

      const numericStatus = numericStatusMap[status];
      const isProductReturn = selectedComplaint.complaintType === "ProductReturn";

      // Check if any products were rejected in the saved data
      const hasRejectedProducts = selectedComplaint.complaintDetails.some(detail => detail.isCheck === false);

      // If approving a complaint with rejected products and no reason provided, require a reason
      if (status === 'approved' && hasRejectedProducts && !rejectReason.trim()) {
        message.error('Vui lòng nhập lý do từ chối cho những sản phẩm không được chấp nhận!');
        return;
      }

      // Nếu trạng thái là ItemArrivedAtWarehouse (1) cho ProductReturn, hiển thị modal tạo đơn
      if (isProductReturn && status === "arrived") {
        setIsShippingModalVisible(true);
        return;
      }

      // Nếu đang ở trạng thái Đã về kho (1) và chọn Processing (3) cho ProductReturn, hiển thị modal tạo đơn
      if (isProductReturn && status === "processing" &&
        (selectedComplaint.status === "1" || selectedComplaint.status === 1 || selectedComplaint.status === "ItemArrivedAtWarehouse")) {
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

      // Nếu chọn từ chối mà chưa nhập lý do thì không cho submit
      if (status === 'reject' && !rejectReason.trim()) {
        message.error('Vui lòng nhập lý do từ chối khiếu nại!');
        return;
      }

      setProcessingAction(true);

      // Sử dụng deliveryCode hiện tại nếu có
      const deliveryCode = selectedComplaint.deliveryCode || '';
      const reasonToUse = status === 'reject' || (status === 'approved' && hasRejectedProducts)
        ? rejectReason.trim()
        : selectedComplaint.reason || '';

      // Upload video if available and status is arrived or reject or processing
      let videoURL = '';
      if ((status === 'arrived' || status === 'reject' || status === 'processing') && videoFile) {
        try {
          const uploadedURLs = await uploadVideo([videoFile]);
          if (uploadedURLs && uploadedURLs.length > 0) {
            videoURL = uploadedURLs[0];
            message.success('Video đã được tải lên thành công!');
          } else {
            message.error('Không nhận được URL video từ Cloudinary.');
          }
        } catch (error) {
          message.error(`Lỗi khi tải lên video: ${error.message}`);
        }
      }

      // Pass the rejection reason for both rejected complaints and approved complaints with rejected products
      if (status === 'reject' || (status === 'approved' && hasRejectedProducts)) {
        await updateComplaintStatus(
          selectedComplaint.id,
          numericStatus,
          isProductReturn ? 0 : 1, // complaintType: 0 for ProductReturn, 1 for Refund
          deliveryCode,
          reasonToUse,
          videoURL
        );
      } else {
        await updateComplaintStatus(
          selectedComplaint.id,
          numericStatus,
          isProductReturn ? 0 : 1, // complaintType: 0 for ProductReturn, 1 for Refund
          deliveryCode,
          reasonToUse,
          videoURL
        );
      }

      message.success(`Cập nhật trạng thái khiếu nại thành công!`);
      await fetchComplaints(); // Refresh data
      setIsDetailModalVisible(false);
      setSelectedComplaint(null);
      setSelectedStatus(null);
      setRejectReason("");
      setVideoFile(null);
      setVideoUploadProgress(0);
      setVideoUploadError(null);
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

      // Check if video is uploaded for ItemArrivedAtWarehouse status
      let videoURL = '';
      if ((selectedComplaint.status === '1' || selectedComplaint.status === 'ItemArrivedAtWarehouse' || selectedStatus === 'arrived') && !videoFile) {
        message.error('Vui lòng tải lên video kiểm tra hàng tại kho trước khi tạo đơn vận chuyển!');
        setProcessingAction(false);
        return;
      }

      // Upload video if available
      if (videoFile) {
        try {
          const uploadedURLs = await uploadVideo([videoFile]);
          if (uploadedURLs && uploadedURLs.length > 0) {
            videoURL = uploadedURLs[0];
            message.success('Video đã được tải lên thành công!');
          } else {
            message.error('Không nhận được URL video từ Cloudinary.');
            setProcessingAction(false);
            return;
          }
        } catch (error) {
          message.error(`Lỗi khi tải lên video: ${error.message}`);
          setProcessingAction(false);
          return;
        }
      }

      // Extract address components
      const addressParts = selectedComplaint.address.split('|');
      const toAddress = addressParts[0] || '';
      const toWard = addressParts[1] || '';
      const toDistrict = addressParts[2] || '';
      const toProvince = addressParts[3] || '';

      // Filter for only approved products (isCheck=true)
      const approvedProducts = selectedComplaint.complaintDetails.filter(detail => detail.isCheck === true);

      // Check if there are any approved products
      if (approvedProducts.length === 0) {
        message.error("Không có sản phẩm nào được chấp nhận để tạo đơn vận chuyển!");
        setProcessingAction(false);
        return;
      }

      // Prepare items for shipping - only approved products
      const items = approvedProducts.map(detail => {
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
      const reasonToUse = selectedComplaint.reason || '';

      console.log("Extracted delivery code:", deliveryCode);

      if (!deliveryCode) {
        throw new Error("Không nhận được mã vận đơn từ hệ thống");
      }

      // Khi đã có mã vận đơn, cập nhật trạng thái Processing (3) kèm mã vận đơn và video URL nếu có
      await updateComplaintStatus(
        selectedComplaint.id,
        3, // Processing status
        0, // complaintType for ProductReturn
        deliveryCode,
        reasonToUse,
        videoURL
      );

      message.success(`Đã tạo đơn vận chuyển và chuyển sang xử lý thành công! Mã vận đơn: ${deliveryCode}`);
      await fetchComplaints(); // Refresh data
      setIsShippingModalVisible(false);
      setIsDetailModalVisible(false);
      setSelectedComplaint(null);
      setSelectedStatus(null);
      setVideoFile(null);
      setVideoUploadProgress(0);
      setVideoUploadError(null);
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

  // Thêm hiển thị nút để đánh giá tất cả sản phẩm
  const handleApproveAll = () => {
    if (!selectedComplaint || !selectedComplaint.complaintDetails) return;

    const newChecked = {};
    selectedComplaint.complaintDetails.forEach(detail => {
      newChecked[detail.productId] = true;
    });

    // Xóa toàn bộ trạng thái từ chối trước đó
    setExplicitlyRejected({});

    // Xóa các mô tả từ chối
    setProductDescriptions({});

    // Cập nhật trạng thái chấp nhận cho tất cả
    setCheckedProducts(newChecked);

    message.success('Đã chấp nhận tất cả sản phẩm!');
  };

  // Thêm hàm kiểm tra xem đơn khiếu nại có phải là mới không
  const isNewComplaint = () => {
    return (
      selectedComplaint &&
      (selectedComplaint.status === 'pending' ||
        selectedComplaint.status === '0' ||
        selectedComplaint.status === 0)
    );
  };

  // Update the productColumns to show description input only after reject button clicked
  const productColumns = [
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
        <Text type="secondary">{price?.toLocaleString()}đ</Text>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (totalPrice) => (
        <Text type="success" strong>{totalPrice?.toLocaleString()}đ</Text>
      ),
    },
    {
      title: "Trạng thái & Lý do",
      key: "action",
      width: 260,
      render: (_, record) => {
        const isPending = selectedComplaint?.status === 'pending' || selectedComplaint?.status === '0' || selectedComplaint?.status === 0;
        const isApproved = checkedProducts[record.productId] === true;
        const wasExplicitlyRejected = explicitlyRejected[record.productId] === true;

        if (!isPending) {
          return (
            <div>
              <Tag color={record.isCheck ? "green" : "red"}>
                {record.isCheck ? "Đã duyệt" : "Đã từ chối"}
              </Tag>
              {!record.isCheck && record.description && (
                <div style={{ marginTop: 5 }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Lý do: {record.description}
                  </Text>
                </div>
              )}
            </div>
          );
        }

        return (
          <div>
            <Space>
              <Tooltip title="Chấp nhận sản phẩm này">
                <Button
                  type={isApproved ? "primary" : "default"}
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleProductApproval(record.productId, true)}
                  disabled={processingAction}
                >
                  Chấp nhận
                </Button>
              </Tooltip>
              <Tooltip title="Từ chối và yêu cầu nhập lý do">
                <Button
                  danger
                  type={!isApproved ? "primary" : "default"}
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleProductApproval(record.productId, false)}
                  disabled={processingAction}
                >
                  Từ chối
                </Button>
              </Tooltip>
            </Space>

            {/* Only show description field when product was explicitly rejected by user action */}
            {wasExplicitlyRejected && !isApproved && (
              <div style={{ marginTop: 8 }}>
                <Input.TextArea
                  placeholder="Lý do từ chối sản phẩm..."
                  value={productDescriptions[record.productId] || ''}
                  onChange={(e) => handleDescriptionChange(record.productId, e.target.value)}
                  status={!productDescriptions[record.productId] ? "error" : ""}
                  rows={2}
                  style={{
                    fontSize: '12px',
                    border: !productDescriptions[record.productId] ? '1px solid #ff4d4f' : ''
                  }}
                  disabled={processingAction}
                />
                {!productDescriptions[record.productId] && (
                  <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
                    Vui lòng nhập lý do từ chối
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },
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

  // Render complaint status options as buttons
  const renderStatusButtons = () => {
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
    } else if (currentStatus === 'Approved') {
      numericStatus = 2;
    }

    console.log('Current complaint status:', currentStatus, 'Numeric status:', numericStatus);

    // Xác định loại khiếu nại
    const isProductReturn = selectedComplaint?.complaintType === "ProductReturn";

    // --- QUY TRÌNH XỬ LÝ KHIẾU NẠI ĐỔI TRẢ (PRODUCTRETURN) ---
    if (isProductReturn) {
      // Bước 1: Đang chờ xử lý (0) -> Đã duyệt (2)
      if (currentStatus === 'pending' || numericStatus === 0 || currentStatus === '0') {
        return [
          <Button key="approved" type={selectedStatus === 'approved' ? 'primary' : 'default'} onClick={() => setSelectedStatus('approved')}>Duyệt khiếu nại</Button>,
          <Button key="reject" type={selectedStatus === 'reject' ? 'primary' : 'default'} danger onClick={() => setSelectedStatus('reject')}>Từ chối khiếu nại</Button>
        ];
      }

      // Bước 2: Đã duyệt (2) -> Đã về kho kiểm tra (1)
      if (numericStatus === 2 || currentStatus === '2' || currentStatus === 'Approved') {
        return [
          <Button key="arrived" type={selectedStatus === 'arrived' ? 'primary' : 'default'} onClick={() => setSelectedStatus('arrived')}>Đã về kho kiểm tra</Button>
        ];
      }

      // Bước 3: Đã về kho (1) -> Xử lý (3) - tự động thông qua tạo đơn vận chuyển
      if (numericStatus === 1 || currentStatus === '1' || currentStatus === 'ItemArrivedAtWarehouse') {
        return [
          <Button key="processing" type={selectedStatus === 'processing' ? 'primary' : 'default'} onClick={() => setSelectedStatus('processing')}>Đang xử lý (tạo đơn giao hàng)</Button>,
          <Button key="reject" type={selectedStatus === 'reject' ? 'primary' : 'default'} danger onClick={() => setSelectedStatus('reject')}>Từ chối khiếu nại</Button>
        ];
      }

      // Bước 4: Đang xử lý (3) -> Giao hàng (7)
      if (numericStatus === 3 || currentStatus === '3' || currentStatus === 'Processing') {
        return [
          <Button key="delivery" type={selectedStatus === 'delivery' ? 'primary' : 'default'} onClick={() => setSelectedStatus('delivery')}>Giao hàng</Button>
        ];
      }

      // Bước 5: Giao hàng (7) -> Đã giao hàng (8)
      if (numericStatus === 7 || currentStatus === '7' || currentStatus === 'Delivery') {
        return [
          <Button key="delivered" type={selectedStatus === 'delivered' ? 'primary' : 'default'} onClick={() => setSelectedStatus('delivered')}>Đã giao hàng</Button>
        ];
      }

      // Bước 6: Đã giao hàng (8) -> Hoàn thành (5)
      if (numericStatus === 8 || currentStatus === '8' || currentStatus === 'delivered') {
        return [
          <Button key="complete" type={selectedStatus === 'complete' ? 'primary' : 'default'} onClick={() => setSelectedStatus('complete')}>Hoàn thành đổi trả</Button>
        ];
      }
    } else {
      // --- QUY TRÌNH XỬ LÝ KHIẾU NẠI HOÀN TIỀN (REFUND) ---

      // Bước 1: Đang chờ xử lý (0) -> Đã duyệt (2)
      if (currentStatus === 'pending' || numericStatus === 0 || currentStatus === '0') {
        return [
          <Button key="approved" type={selectedStatus === 'approved' ? 'primary' : 'default'} onClick={() => setSelectedStatus('approved')}>Duyệt khiếu nại</Button>,
          <Button key="reject" type={selectedStatus === 'reject' ? 'primary' : 'default'} danger onClick={() => setSelectedStatus('reject')}>Từ chối khiếu nại</Button>
        ];
      }

      // Bước 2: Đã duyệt (2) -> Đã về kho kiểm tra (1)
      if (numericStatus === 2 || currentStatus === '2' || currentStatus === 'Approved') {
        return [
          <Button key="arrived" type={selectedStatus === 'arrived' ? 'primary' : 'default'} onClick={() => setSelectedStatus('arrived')}>Đã về kho kiểm tra</Button>
        ];
      }

      // Bước 3: Đã về kho (1) -> Xử lý hoàn tiền (3)
      if (numericStatus === 1 || currentStatus === '1' || currentStatus === 'ItemArrivedAtWarehouse') {
        return [
          <Button key="processing" type={selectedStatus === 'processing' ? 'primary' : 'default'} onClick={() => setSelectedStatus('processing')}>Đang xử lý hoàn tiền</Button>
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
    if (selectedComplaint?.complaintType === "ProductReturn" && selectedStatus === "arrived") {
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
              {selectedComplaint.complaintReason
                ?.split(";")
                .map((item, idx) => (
                  <div key={idx}>• {item.trim()}</div>
                )) || "Không có lý do"}
            </div>
          </Descriptions.Item>
          {selectedComplaint.reason ? (
            <Descriptions.Item label="Lý do từ chối khiếu nại" span={3}>
              {selectedComplaint.reason}
            </Descriptions.Item>
          ) : null}

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

        {(selectedComplaint.image?.imageUrl ||
          selectedComplaint.image?.image2 ||
          selectedComplaint.image?.image3) && (
            <Card title="Video/Hình ảnh khiếu nại" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {selectedComplaint.image?.imageUrl && (
                  <div
                    style={{
                      backgroundColor: '#fafafa',
                      padding: 16,
                      borderRadius: 8,
                      border: '1px solid #f0f0f0',
                      flex: '1 1 320px',
                      maxWidth: 360,
                    }}
                  >
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                      🎥 Video minh chứng:
                    </Text>
                    <video
                      src={selectedComplaint.image.imageUrl}
                      controls
                      width={320}
                      style={{ borderRadius: 6, maxHeight: 220 }}
                    />
                  </div>
                )}

                {(selectedComplaint.image?.image2 ||
                  selectedComplaint.image?.image3) && (
                    <div
                      style={{
                        backgroundColor: '#fafafa',
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid #f0f0f0',
                        flex: '1 1 320px',
                        maxWidth: 360,
                      }}
                    >
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        🖼️ Hình ảnh bổ sung:
                      </Text>
                      <Space size="middle" wrap>
                        {selectedComplaint.image.image2 && (
                          <Image
                            src={selectedComplaint.image.image2}
                            alt="Hình ảnh khiếu nại 2"
                            width={100}
                            height={100}
                            style={{
                              objectFit: 'cover',
                              borderRadius: 6,
                              border: '1px solid #f0f0f0',
                            }}
                          />
                        )}
                        {selectedComplaint.image.image3 && (
                          <Image
                            src={selectedComplaint.image.image3}
                            alt="Hình ảnh khiếu nại 3"
                            width={100}
                            height={100}
                            style={{
                              objectFit: 'cover',
                              borderRadius: 6,
                              border: '1px solid #f0f0f0',
                            }}
                          />
                        )}
                      </Space>
                    </div>
                  )}
              </div>
            </Card>
          )}

        {(selectedComplaint.videoURL) && (
            <Card title="Video minh chứng tại kho" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {selectedComplaint.videoURL && (
                  <div
                    style={{
                      backgroundColor: '#fafafa',
                      padding: 16,
                      borderRadius: 8,
                      border: '1px solid #f0f0f0',
                      flex: '1 1 320px',
                      maxWidth: 360,
                    }}
                  >
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                      🎥 Video minh chứng:
                    </Text>
                    <video
                      src={selectedComplaint.videoURL}
                      controls
                      width={320}
                      style={{ borderRadius: 6, maxHeight: 220 }}
                    />
                  </div>
                )}
              </div>
            </Card>
          )}

        <Card title="Sản phẩm khiếu nại">
          {currentStatus === 'pending' || currentStatus === '0' ? (
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="default"
                icon={<CheckCircleOutlined />}
                onClick={handleApproveAll}
                disabled={processingAction}
              >
                Chấp nhận tất cả
              </Button>
            </div>
          ) : null}

          <Table
            dataSource={selectedComplaint.complaintDetails}
            rowKey="productId"
            pagination={false}
            columns={productColumns}
          />

          {currentStatus === 'pending' || currentStatus === '0' ? (
            <div style={{ marginTop: 16 }}>
              <Alert
                message="Hướng dẫn xử lý sản phẩm"
                description={
                  <div>
                    <p>Vui lòng xem xét và đánh giá từng sản phẩm trong khiếu nại:</p>
                    <ol>
                      <li>Nhấn <strong>Chấp nhận</strong> hoặc <strong>Từ chối</strong> cho từng sản phẩm</li>
                      <li>Nếu chọn từ chối, vui lòng nhập lý do từ chối rõ ràng</li>
                      <li>Sau khi đánh giá tất cả sản phẩm, nhấn <strong>Lưu đánh giá sản phẩm</strong></li>
                      <li>Tiếp tục quy trình xử lý bằng cách chọn trạng thái mới cho khiếu nại</li>
                    </ol>
                    <div style={{ display: 'flex', lineHeight: '1.6' }}>
                      <strong style={{ flexShrink: 0, marginRight: 4 }}>Lưu ý:</strong>
                      <div>
                        Tất cả sản phẩm đều phải được đánh giá và tất cả sản phẩm bị từ chối phải có lý do.<br />
                        Không thể hoàn tác lại lựa chọn chấp nhận sản phẩm sau khi đã lưu.
                      </div>
                    </div>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type={allProductsReviewed() ? 'success' : 'warning'}>
                  {allProductsReviewed()
                    ? <><CheckCircleOutlined /> Đã đánh giá tất cả sản phẩm</>
                    : <><ExclamationCircleOutlined /> Chưa đánh giá hết sản phẩm hoặc thiếu lý do từ chối</>
                  }
                </Text>
                <Tooltip title={allProductsReviewed() ?
                  "Lưu đánh giá tất cả sản phẩm" :
                  "Vui lòng đánh giá tất cả sản phẩm và nhập lý do từ chối để lưu"}>
                  <Button
                    type="primary"
                    onClick={saveProductReviews}
                    loading={processingAction}
                    disabled={!allProductsReviewed()}
                    icon={<CheckCircleOutlined />}
                  >
                    Lưu đánh giá sản phẩm
                  </Button>
                </Tooltip>
              </div>
            </div>
          ) : null}
        </Card>

        {(
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
                        <p><strong>Quy trình xử lý khiếu nại đổi trả MỚI:</strong></p>
                        <ol>
                          <li>Đang chờ xử lý → Xem xét từng sản phẩm → Duyệt khiếu nại</li>
                          <li>Duyệt khiếu nại → Đã về kho kiểm tra</li>
                          <li>Đã về kho kiểm tra → Đang xử lý + Tạo đơn vận chuyển</li>
                          <li>Đang xử lý → Giao hàng</li>
                          <li>Giao hàng → Đã giao hàng</li>
                          <li>Đã giao hàng → Hoàn thành</li>
                        </ol>
                        <p><strong>Lưu ý:</strong> Đối với đơn đổi trả không sử dụng trạng thái Hoàn tiền.</p>
                      </div>
                    ) : (
                      <div>
                        <p><strong>Quy trình xử lý khiếu nại hoàn tiền MỚI:</strong></p>
                        <ol>
                          <li>Đang chờ xử lý → Xem xét từng sản phẩm → Duyệt khiếu nại</li>
                          <li>Duyệt khiếu nại → Đã về kho kiểm tra</li>
                          <li>Đã về kho kiểm tra → Đang xử lý hoàn tiền</li>
                          <li>Đang xử lý hoàn tiền → Hoàn tiền (tự động xử lý bởi hệ thống)</li>
                          <li>Hoàn tiền → Hoàn thành (tự động xử lý bởi hệ thống)</li>
                        </ol>
                        <p><strong>Lưu ý:</strong>
                          Staff cần xem xét từng sản phẩm trong khiếu nại trước khi duyệt. Hệ thống sẽ tự động xử lý các bước sau.
                        </p>
                      </div>
                    )
                  }
                  type={isProductReturn ? "info" : "warning"}
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                {/* Render buttons instead of dropdown */}
                <Space wrap style={{ marginBottom: 16 }}>
                  {renderStatusButtons()}
                </Space>

                {/* Video upload field for ItemArrivedAtWarehouse */}
                {(currentStatus === 'ItemArrivedAtWarehouse' || currentStatus === '1') && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong style={{ marginBottom: 8, display: 'block' }}>Tải lên video kiểm tra hàng tại kho <Text type="danger">*</Text></Text>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setVideoFile(e.target.files[0]);
                        } else {
                          setVideoFile(null);
                        }
                      }}
                      style={{ marginBottom: 8 }}
                      status={!videoFile ? 'error' : ''}
                    />
                    {!videoFile && (
                      <Text type="danger" style={{ fontSize: 12 }}>Video kiểm tra hàng tại kho là bắt buộc</Text>
                    )}
                    {videoUploadProgress > 0 && videoUploadProgress < 100 && (
                      <div style={{ marginTop: 8 }}>
                        <Text>Đang tải lên: {videoUploadProgress}%</Text>
                      </div>
                    )}
                    {videoUploadError && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="danger">Lỗi tải lên video: {videoUploadError.message}</Text>
                      </div>
                    )}
                  </div>
                )}

                {/* Show rejection reason field when: complete rejection OR approving with rejected products */}
                {(selectedStatus === 'reject' || (selectedStatus === 'approved' && hasRejectedProducts)) && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {selectedStatus === 'reject'
                          ? 'Lý do từ chối khiếu nại'
                          : 'Lý do từ chối sản phẩm không được chấp nhận'} <Text type="danger">*</Text>
                      </Text>
                    </div>

                    <Form.Item
                      required
                      validateStatus={rejectReason.trim() ? undefined : 'error'}
                      help={!rejectReason.trim() ? 'Vui lòng nhập lý do từ chối' : ''}
                      style={{ marginBottom: 0 }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {selectedStatus === 'approved' ?
                            'Nội dung mẫu đã được tạo với tên các sản phẩm bị từ chối. Bạn có thể chỉnh sửa thêm nếu cần.' :
                            'Vui lòng nhập đầy đủ lý do từ chối khiếu nại.'
                          }
                        </Text>
                      </div>
                      <Input.TextArea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                        maxLength={500}
                        showCount
                        placeholder={
                          selectedStatus === 'reject'
                            ? "Nhập lý do từ chối khiếu nại..."
                            : "Lý do từ chối cho những sản phẩm không được chấp nhận..."
                        }
                        style={{
                          borderRadius: 8,
                          padding: '10px 12px',
                          resize: 'vertical',
                          fontSize: 14,
                        }}
                      />
                    </Form.Item>
                  </div>
                )}

                <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="primary"
                    disabled={
                      !selectedStatus ||
                      processingAction ||
                      (selectedStatus === 'reject' && !rejectReason.trim()) ||
                      (selectedStatus === 'approved' && hasRejectedProducts && !rejectReason.trim()) ||
                      // Simplify the condition to directly check for approved products
                      (selectedStatus === 'approved' &&
                        !(selectedComplaint?.complaintDetails?.some(detail => detail.isCheck === true)))
                    }
                    onClick={() => handleStatusChange(selectedStatus)}
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

  // After handleStatusChange, add back the columns definition for the main complaints table
  const columns = [
    {
      title: "Mã khiếu nại",
      dataIndex: "id",
      key: "id",
      width: 110,
      render: (id) => <Text copyable={{ text: id, icon: <CopyOutlined /> }} strong>#{id.slice(0, 8)}...</Text>,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      width: 120,
      render: (id) => <Text copyable={{ text: id, icon: <CopyOutlined /> }} strong>#{id.slice(0, 8)}...</Text>,
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
      dataIndex: "complaintReason",
      key: "complaintReason",
      width: 150,
      ellipsis: true,
      render: (_, record) => {
        // Prefer complaintReason, fallback to reason (legacy)
        const displayReason = record.complaintReason || '';
        return (
          <Tooltip
            title={
              displayReason.split(";").map((item, index) => (
                <div key={index} style={{ marginBottom: 4 }}>
                  {item.trim()}
                </div>
              ))
            }
            color="#ffffff"
            styles={{
              body: {
                backgroundColor: "#f9f9f9",
                color: "#000",
                fontSize: 14,
                padding: 12,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              },
            }}
          >
            <Text ellipsis style={{ cursor: "pointer" }}>
              {displayReason}
            </Text>
          </Tooltip>
        );
      },
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
            >
              Xem chi tiết
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Add an effect to handle status change and resetting rejection reason
  useEffect(() => {
    // Reset rejection reason when modal closes or status changes to non-reject
    if (!isDetailModalVisible || (selectedStatus !== 'reject' && selectedStatus !== 'approved')) {
      setRejectReason("");
    }

    // If status changes to 'approved', check if we have rejected products
    if (selectedStatus === 'approved' && selectedComplaint) {
      const hasRejected = selectedComplaint.complaintDetails.some(
        detail => checkedProducts[detail.productId] === false
      );
      setHasRejectedProducts(hasRejected);
    }
  }, [isDetailModalVisible, selectedStatus, selectedComplaint, checkedProducts]);

  // Add an effect to update the rejection reason when product selections change
  useEffect(() => {
    if (selectedComplaint && hasRejectedProducts && selectedStatus === 'approved') {
      // Get the current rejected products
      const hasBeenEdited = rejectReason.trim().length > 0;

      // Generate new template
      const template = generateRejectionTemplate(
        selectedComplaint.complaintDetails,
        checkedProducts,
        productDetails
      );

      // Only update if we have a template and either:
      // 1. There was no previous reason (empty)
      // 2. The reason hasn't been manually edited
      if (template && (!hasBeenEdited || rejectReason.startsWith('Xin lỗi, chúng tôi không thể chấp nhận khiếu nại đối với'))) {
        setRejectReason(template);
      }
    }
  }, [selectedComplaint, checkedProducts, hasRejectedProducts, selectedStatus]);

  // Update loadProductDescriptions when opening modal
  useEffect(() => {
    if (selectedComplaint) {
      // Load any existing descriptions for rejected products
      const initialDescriptions = {};
      selectedComplaint.complaintDetails?.forEach(detail => {
        if (detail.description) {
          initialDescriptions[detail.productId] = detail.description;
        }
      });
      setProductDescriptions(initialDescriptions);
    } else {
      setProductDescriptions({});
    }
  }, [selectedComplaint]);

  // Reset explicitlyRejected when opening a new complaint
  useEffect(() => {
    if (selectedComplaint) {
      setExplicitlyRejected({});
    }
  }, [selectedComplaint]);

  // Reset video state when modal closes
  useEffect(() => {
    if (!isDetailModalVisible) {
      setVideoFile(null);
      setVideoUploadProgress(0);
      setVideoUploadError(null);
    }
  }, [isDetailModalVisible]);

  // Update video upload progress and error
  useEffect(() => {
    setVideoUploadProgress(progress);
    setVideoUploadError(uploadError);
  }, [progress, uploadError]);

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
              dataSource={selectedComplaint?.complaintDetails?.filter(detail => detail.isCheck === true)}
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