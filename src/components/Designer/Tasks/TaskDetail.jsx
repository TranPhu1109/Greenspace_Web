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
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import useDesignerTask from "@/stores/useDesignerTask";
import useProductStore from "@/stores/useProductStore";
import useAuthStore from "@/stores/useAuthStore";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
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
  } = useDesignerTask();
  const { getProductById } = useProductStore();
  const { user } = useAuthStore();
  const { uploadImages, progress, error: uploadError } = useCloudinaryStorage();
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sketchImageUrls, setSketchImageUrls] = useState([]);
  const [uploadingSketch, setUploadingSketch] = useState(false);
  const { updateServiceOrder } = useDesignOrderStore();

  //console.log("task", task);

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const urls = await uploadImages([file]);
      if (urls && urls.length > 0) {
        setImageUrls((prev) => [...prev, ...urls]);
        message.success("Tải lên hình ảnh thành công");
      }
    } catch (error) {
      message.error("Tải lên hình ảnh thất bại");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
    return false; // Prevent default upload behavior
  };

  const handleImageRemove = (file) => {
    setImageUrls((prev) => prev.filter((url) => url !== file.url));
    return true;
  };

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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      // Step 1: Update service order
      const serviceOrderUpdateData = {
        serviceType: 0,
        designPrice: 0,
        description: task.serviceOrder.description,
        status: 1,
        report: "",
        image: {
          imageUrl: sketchImageUrls[0] || "",
          image2: sketchImageUrls[1] || "",
          image3: sketchImageUrls[2] || ""
        },
        serviceOrderDetails: task.serviceOrder.serviceOrderDetails
      };

      await updateServiceOrder(task.serviceOrder.id, serviceOrderUpdateData);

      // Step 2: Update task status
      await updateTaskStatus(task.id, {
        serviceOrderId: task.serviceOrder.id,
        userId: user.id,
        status: 1,
        note: "Đã cập nhật bản vẽ thiết kế"
      });

      message.success("Cập nhật bản vẽ thiết kế thành công");
      setIsModalVisible(false);
      // Reload the page after successful update
      window.location.reload();
    } catch (error) {
      message.error("Cập nhật bản vẽ thiết kế thất bại");
      console.error("Update error:", error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const loadTaskDetail = async () => {
      try {
        const taskData = await fetchTaskDetail(id);
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

  const loadProductDetails = async (orderDetails) => {
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

              {task.serviceOrder.description && (
                <Descriptions.Item label="Mô tả" span={3}>
                  <Paragraph
                    ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
                  >
                    {task.serviceOrder.description}
                  </Paragraph>
                </Descriptions.Item>
              )}
            </Descriptions>

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

      <Card
        title={
          <Space>
            <PictureOutlined />
            <span>Bản vẽ thiết kế</span>
          </Space>
        }
        className="mb-6 shadow-sm"
      >
        <Button 
          type="primary" 
          icon={<UploadOutlined />}
          onClick={showModal}
        >
          Tải lên bản vẽ
        </Button>

        <Modal
          title="Cập nhật bản vẽ phác thảo"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          width={800}
        >
          <div>
            <Upload
              listType="picture-card"
              beforeUpload={handleSketchImageUpload}
              onRemove={handleSketchImageRemove}
              maxCount={3}
              accept="image/*"
              fileList={sketchImageUrls.map((url, index) => ({
                uid: `-${index}`,
                name: `sketch-${index + 1}`,
                status: "done",
                url: url,
              }))}
            >
              {sketchImageUrls.length < 3 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>
                    Tải ảnh
                  </div>
                </div>
              )}
            </Upload>
            {uploadingSketch && (
              <div style={{ marginTop: 8 }}>
                <Progress percent={progress} size="small" />
              </div>
            )}
            {uploadError && (
              <div style={{ color: "red", marginTop: 8 }}>{uploadError}</div>
            )}
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default TaskDetail;
