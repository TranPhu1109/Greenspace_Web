import React, { useEffect, useState } from "react";
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
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import useDesignerTask from "@/stores/useDesignerTask";
import useProductStore from "@/stores/useProductStore";
import useAuthStore from "@/stores/useAuthStore";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import api from "@/api/api";
import EditorComponent from "@/components/Common/EditorComponent";
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
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
  const { uploadImages, progress, error: uploadError } = useCloudinaryStorage();
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleDesign, setIsModalVisibleDesign] = useState(false);
  const [sketchImageUrls, setSketchImageUrls] = useState([]);
  const [sketchFiles, setSketchFiles] = useState([]);
  const [uploadingSketch, setUploadingSketch] = useState(false);
  const [sketchForm] = Form.useForm();
  const { updateServiceOrder, updateProductOrder } = useDesignOrderStore();
  const [uploadingDesign, setUploadingDesign] = useState(false);
  const [designImageUrls, setDesignImageUrls] = useState([]);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [tempServiceOrderDetails, setTempServiceOrderDetails] = useState([]);

  // Debug log để kiểm tra các hàm
  useEffect(() => {
    console.log("Task state:", { task });
    console.log("Set task function:", typeof setTask === 'function' ? 'Available' : 'Not a function');
  }, [task, setTask]);

  //console.log("task", task);

  const handleSketchImageUpload = async (file) => {
    try {
      setUploadingSketch(true);
      const urls = await uploadImages([file]);
      if (urls && urls.length > 0) {
        setSketchImageUrls((prev) => [...prev, ...urls]);
        message.success("Tải lên bản vẽ phác thảo thành công");
      }
    } catch (error) {
      message.error("Tải lên bản vẽ phác thảo thất bại");
      console.error("Upload error:", error);
    } finally {
      setUploadingSketch(false);
    }
    return false;
  };

  const handleSketchImageRemove = (file) => {
    setSketchImageUrls((prev) => prev.filter((url) => url !== file.url));
    return true;
  };

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
  };

  const showModalDesign = () => {
    setIsModalVisibleDesign(true);
  };

  const handleOkSketch = async () => {
    let uploadedUrls = [];
    try {
      // Validate form fields first
      const values = await sketchForm.validateFields();

      setUploadingSketch(true); // Bắt đầu hiển thị loading/progress

      // Step 1: Upload images if new files were selected
      if (sketchFiles.length > 0) {
        message.info(`Đang tải lên ${sketchFiles.length} ảnh phác thảo...`, 0); // Thông báo bắt đầu upload
        uploadedUrls = await uploadImages(sketchFiles);
        message.destroy(); // Xóa thông báo loading
        if (!uploadedUrls || uploadedUrls.length !== sketchFiles.length) {
          throw new Error("Lỗi trong quá trình tải ảnh lên.");
        }
        message.success("Tải ảnh lên thành công!");
      } else {
        // Nếu không có file mới, kiểm tra xem có cần giữ ảnh cũ không (tùy logic)
        // Ví dụ: giữ lại ảnh cũ nếu có
        const existingImages = [
          task.serviceOrder.image?.imageUrl,
          task.serviceOrder.image?.image2,
          task.serviceOrder.image?.image3
        ].filter(Boolean); // Lọc bỏ các giá trị null/undefined
        uploadedUrls = existingImages;
        // Hoặc nếu logic là xóa hết ảnh cũ khi không chọn ảnh mới:
        // uploadedUrls = [];
      }
      
      // Step 2: Update service order with new data (including uploaded URLs)
      const serviceOrderUpdateData = {
        serviceType: 1, 
        designPrice: values.designPrice, 
        description: task.serviceOrder.description,
        status: 1, 
        report: values.report || "",
        image: {
          imageUrl: uploadedUrls[0] || "", // Sử dụng URL đã upload
          image2: uploadedUrls[1] || "",
          image3: uploadedUrls[2] || ""
        },
        serviceOrderDetails: task.serviceOrder.serviceOrderDetails
      };

      await updateServiceOrder(task.serviceOrder.id, serviceOrderUpdateData);

      // Step 3: Update task status
      await updateTaskStatus(task.id, {
        serviceOrderId: task.serviceOrder.id,
        userId: user.id,
        status: 1, // Chuyển task sang DoneConsulting
        note: "Hoàn thành phác thảo và báo giá dự kiến." 
      });

      message.success("Cập nhật phác thảo và giá thành công");
      setIsModalVisible(false);
      sketchForm.resetFields(); 
      setSketchFiles([]); // Reset state File khi đóng modal Cancel
      setSketchImageUrls(uploadedUrls); // Cập nhật lại URL để hiển thị (nếu cần)
      
      // Consider refetching data instead of reload
      await fetchTaskDetail(id); // Fetch lại data sau khi thành công
      // window.location.reload(); 

    } catch (error) {
      message.destroy(); // Đảm bảo xóa thông báo loading nếu có lỗi
      if (error.name === 'ValidationError') {
        message.error("Vui lòng điền đầy đủ thông tin được yêu cầu.");
      } else if (error.message.includes("Lỗi trong quá trình tải ảnh lên")) {
         message.error(error.message);
      } else if (error.response?.data?.error?.includes("maximum number of edits")) {
        message.error("Bạn đã đạt giới hạn số lần chỉnh sửa cho phép. Không thể cập nhật thêm.");
      } else {
        message.error("Cập nhật thất bại: " + (error.message || "Lỗi không xác định"));
        console.error("Update error:", error);
      }
    } finally {
      setUploadingSketch(false); // Kết thúc hiển thị loading/progress
    }
  };

  const handleOkDesign = async () => {
    try {
      // Step 1: Update service order
      const serviceOrderUpdateData = {
        serviceType: 1,
        designPrice: task.serviceOrder.designPrice,
        description: task.serviceOrder.description,
        status: 4,
        report: "",
        image: {
          imageUrl: designImageUrls[0] || "",
          image2: designImageUrls[1] || "",
          image3: designImageUrls[2] || ""
        },
        serviceOrderDetails: task.serviceOrder.serviceOrderDetails
      };

      await updateServiceOrder(task.serviceOrder.id, serviceOrderUpdateData);

      // Step 2: Update task status
      await updateTaskStatus(task.id, {
        serviceOrderId: task.serviceOrder.id,
        userId: user.id,
        status: 2,
        note: "Đã cập nhật bản vẽ thiết kế"
      });

      message.success("Cập nhật bản vẽ thiết kế thành công");
      setIsModalVisibleDesign(false);
      // Reload the page after successful update
      window.location.reload();
    } catch (error) {
      console.error("Update error:", error);
      // Xử lý các trường hợp lỗi cụ thể
      if (error.response?.data?.error?.includes("maximum number of edits")) {
        message.error("Bạn đã đạt giới hạn số lần chỉnh sửa cho phép. Không thể cập nhật thêm.");
      } else {
        message.error("Cập nhật bản vẽ thiết kế thất bại");
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsModalVisibleDesign(false);
    sketchForm.resetFields(); // Reset form phác thảo khi đóng
    setSketchFiles([]); // Reset state File khi đóng modal Cancel
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
          price: product?.price || 0,
          totalPrice: (product?.price || 0) * item.quantity
        };
      });

      // Cập nhật service order với danh sách sản phẩm từ mảng tạm
      const serviceOrderUpdateData = {
        serviceType: 1,
        designPrice: task.serviceOrder.designPrice,
        description: task.serviceOrder.description,
        status: 4, // AssignToDesigner
        report: "",
        image: task.serviceOrder.image,
        serviceOrderDetails: updatedServiceOrderDetails // Sử dụng danh sách đã được cập nhật
      };

      try {
        const response = await updateProductOrder(task.serviceOrder.id, serviceOrderUpdateData);
        
        // Bỏ phần cập nhật task state vì có thể gây lỗi
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
      // Cập nhật trạng thái service order thành DeterminingMaterialPrice (5)
      const responseStatus = await api.put(`/api/serviceorder/status/${task.serviceOrder.id}`, {
        status: 5,
        deliveryCode: ""
      });

      console.log("responseStatus", responseStatus);

      if (responseStatus === 'Update Successfully!') {
        // Không sử dụng setTask trực tiếp
        // Làm mới dữ liệu task sau khi cập nhật
        await fetchTaskDetail(id);
        message.success("Hoàn tất quá trình cập nhật bản vẽ và tùy chỉnh sản phẩm");
      } else {
        message.error("Không thể cập nhật trạng thái service order");
      }
    
  };

  useEffect(() => {
    const loadTaskDetail = async () => {
      try {
        const taskData = await fetchTaskDetail(id);
        setTask(taskData);
        setNote(taskData.note || "");

        // Load product details if there are products in the order
        if (taskData?.serviceOrder?.serviceOrderDetails?.length > 0) {
          loadProductDetails(taskData.serviceOrder.serviceOrderDetails);
        }
      } catch (error) {
        // Không hiển thị thông báo lỗi nếu dữ liệu vẫn được tải
      }
    };
    loadTaskDetail();
  }, [id]);

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
          description="Không tìm thấy thông tin công việc"
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

  console.log(productDetails);

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
        {task.serviceOrder.status === "AssignToDesigner" && (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleCompleteDesign}
          >
            Hoàn tất cập nhật thiết kế chi tiết
          </Button>
        )}
        {/* <Tag color={getStatusColor(task.status)} strong>
          {getStatusText(task.status)}
        </Tag> */}
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
                        {task.status === "Designing" && (
                          <Button
                            type="primary"
                      icon={<CheckCircleOutlined />}
                            onClick={() => handleStatusUpdate("Completed")}
                          >
                            Đánh dấu hoàn thành
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

              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag color={getStatusColor(task.status)}>
                  {getStatusText(task.status)}
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

              <Descriptions.Item label="Ngày tạo" span={1}>
                <Space>
                  <CalendarOutlined />
                {dayjs(task.creationDate).format("DD/MM/YYYY HH:mm")}
                </Space>
              </Descriptions.Item>

              {task.modificationDate && (
                <Descriptions.Item label="Ngày cập nhật" span={1}>
              <Space>
                    <CalendarOutlined />
                    {dayjs(task.modificationDate).format("DD/MM/YYYY HH:mm")}
              </Space>
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Khách hàng" span={1}>
                <Space>
                  <UserOutlined />
                  {task.serviceOrder.userName}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Số điện thoại" span={1}>
                <Space>
                  <PhoneOutlined />
                  {task.serviceOrder.cusPhone}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Email" span={1}>
                <Space>
                  <MailOutlined />
                  {task.serviceOrder.email}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Địa chỉ" span={3}>
                <Space>
                  <EnvironmentOutlined />
                  {task.serviceOrder.address.replace(/\|/g, ", ")}
                </Space>
              </Descriptions.Item>

              {task.serviceOrder.width && task.serviceOrder.length && (
                <Descriptions.Item label="Kích thước" span={1}>
                  {task.serviceOrder.width} x {task.serviceOrder.length} m
                </Descriptions.Item>
              )}

              {task.serviceOrder.designPrice && (
                <Descriptions.Item label="Giá thiết kế" span={1}>
                  {task.serviceOrder.designPrice.toLocaleString("vi-VN")} đ
                </Descriptions.Item>
              )}

              {task.serviceOrder.materialPrice && (
                <Descriptions.Item label="Giá vật liệu" span={1}>
                  {task.serviceOrder.materialPrice.toLocaleString("vi-VN")} đ
                </Descriptions.Item>
              )}

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

            {/* Hiển thị Mô tả riêng biệt bên dưới */}
            {task.serviceOrder.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Title level={5}>
                  <FileTextOutlined /> Mô tả yêu cầu của khách hàng
                </Title>
                <div dangerouslySetInnerHTML={{ __html: task.serviceOrder.description }} />
              </div>
            )}

            {hasImages && (
              <div className="mt-4">
                <Title level={5}>
                  <PictureOutlined /> Hình ảnh
                </Title>
                <Row gutter={[8, 8]}>
                  {task.serviceOrder.image.imageUrl && (
                    <Col span={8}>
                      <Image
                        src={task.serviceOrder.image.imageUrl}
                        alt="Hình ảnh 1"
                        className="rounded"
                      />
                    </Col>
                  )}
                  {task.serviceOrder.image.image2 && (
                    <Col span={8}>
                      <Image
                        src={task.serviceOrder.image.image2}
                        alt="Hình ảnh 2"
                        className="rounded"
                      />
                    </Col>
                  )}
                  {task.serviceOrder.image.image3 && (
                    <Col span={8}>
                      <Image
                        src={task.serviceOrder.image.image3}
                        alt="Hình ảnh 3"
                        className="rounded"
                      />
                    </Col>
                  )}
                </Row>
              </div>
            )}
            {task.status === "ConsultingAndSket" &&
              (task.serviceOrder.status === "ConsultingAndSketching") && (
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={showModal}
                >
                  Tải lên bản vẽ phác thảo
                </Button>
              )}
            {task.status === "Design" &&
              (task.serviceOrder.status === "AssignToDesigner" ||
                task.serviceOrder.status === "ReDesign") && (
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={showModalDesign}
                >
                  Cập nhật bản vẽ thiết kế chi tiết
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
            {task.status === "Design" && task.serviceOrder.status === "AssignToDesigner" && (
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

      <Card 
        title={
          <Space>
            <FileTextOutlined />
            <span>Ghi chú</span>
          </Space>
        } 
        className="mb-6 shadow-sm"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập ghi chú về công việc"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Space>
      </Card>



      <Card 
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Lịch sử cập nhật</span>
          </Space>
        }
        className="shadow-sm"
        style={{ marginTop: 16 }}
      >
        <Timeline>
          {task.statusHistory?.map((history, index) => (
            <Timeline.Item key={index} color={getStatusColor(history.status)}>
              <div className="mb-2">
                <Text strong>
                  {dayjs(history.updateDate).format("DD/MM/YYYY HH:mm")}
                </Text>
                <Tag color={getStatusColor(history.status)} className="ml-2">
                  {getStatusText(history.status)}
                </Tag>
              </div>
              {history.note && (
                <Paragraph className="text-gray-600">{history.note}</Paragraph>
              )}
            </Timeline.Item>
          ))}
          {(!task.statusHistory || task.statusHistory.length === 0) && (
            <Empty description="Chưa có lịch sử cập nhật" />
          )}
        </Timeline>
      </Card>

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
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập giá dự kiến (VNĐ)"
            />
          </Form.Item>

          <Form.Item
            name="report"
            label="Báo cáo / Ghi chú phác thảo"
            rules={[{ required: true, message: "Vui lòng nhập báo cáo/ghi chú" }]} 
          >
            <EditorComponent 
              height={300}
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
    </div>
  );
};

export default TaskDetail;
