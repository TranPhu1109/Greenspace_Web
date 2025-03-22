import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Descriptions,
  Steps,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Divider,
  Timeline,
  Badge,
  Statistic,
  Empty,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  StarTwoTone,
  LayoutOutlined,
} from "@ant-design/icons";
import { customTemplateOrders } from "../mockData/customTemplateOrders";
import {
  orderStatuses,
  customizableMaterials,
} from "../mockData/templateOrders";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import ConsultingSection from "./sections/ConsultingSection";
import DesignSection from "./sections/DesignSection";
import MaterialSection from "./sections/MaterialSection";
import DepositSection from "./sections/DepositSection";
import DeliverySection from "./sections/DeliverySection";
import "./CustomTemplateOrderDetail.scss";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";

const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const CustomTemplateOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] =
    useState(false);
  const [isUpdateMaterialModalVisible, setIsUpdateMaterialModalVisible] =
    useState(false);
  const [isUpdatePaymentModalVisible, setIsUpdatePaymentModalVisible] =
    useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  const { getBasePath } = useRoleBasedPath();

  const handleBack = () => {
    navigate(`${getBasePath()}/design-orders/custom-template-orders`);
  };


  const orderSteps = [
    {
      title: "Tiếp nhận",
      description: "Xem xét và tiếp nhận đơn",
      status: ["pending"],
    },
    {
      title: "Tư vấn",
      description: "Designer tư vấn cho khách hàng",
      status: ["processing", "consulting"],
    },
    {
      title: "Thiết kế",
      description: "Thực hiện thiết kế và chỉnh sửa",
      status: ["designing", "design_review"],
    },
    {
      title: "Đặt cọc & Vật liệu",
      description: "Xác nhận đặt cọc và chọn vật liệu",
      status: ["waiting_deposit", "material_selecting", "material_ordered"],
    },
    {
      title: "Hoàn thành",
      description: "Giao vật liệu và thanh toán",
      status: ["delivering", "completed"],
    },
  ];

  useEffect(() => {
    // Fetch order data
    const orderData = customTemplateOrders.find((o) => o.id === id);
    if (orderData) {
      setOrder(orderData);
    }
  }, [id]);

  useEffect(() => {
    const currentStatus = order?.status;
    const stepIndex = orderSteps.findIndex((step) =>
      step.status.includes(currentStatus)
    );
    setCurrentStep(stepIndex !== -1 ? stepIndex : 0);
  }, [order?.status]);

  const handleUpdateStatus = async (updatedOrder) => {
    setLoading(true);
    try {
      // TODO: Call API to update order
      setOrder(updatedOrder);
      return true;
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật đơn hàng");
      return false;
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <Card>
        <Empty description="Không tìm thấy thông tin đơn hàng" />
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </Card>
    );
  }

  // Tính toán chi phí vật liệu
  const calculateMaterialCosts = () => {
    if (!order.selectedMaterials || order.selectedMaterials.length === 0) {
      return {
        originalTotal: 0,
        selectedTotal: 0,
        difference: 0,
      };
    }

    const originalTotal = order.selectedMaterials.reduce((total, material) => {
      return total + (material.originalPrice || 0) * (material.quantity || 0);
    }, 0);

    const selectedTotal = order.selectedMaterials.reduce((total, material) => {
      return total + (material.selectedPrice || 0) * (material.quantity || 0);
    }, 0);

    return {
      originalTotal,
      selectedTotal,
      difference: selectedTotal - originalTotal,
    };
  };

  const renderSection = () => {
    switch (order.status) {
      case "pending":
        return null; // Show default order info
      case "processing":
      case "consulting":
        return (
          <ConsultingSection
            order={order}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      case "designing":
      case "design_review":
        return (
          <DesignSection order={order} onUpdateStatus={handleUpdateStatus} />
        );
      // case 'waiting_deposit':
      //   return <DepositSection order={order} onUpdateStatus={handleUpdateStatus} />;
      case "material_selecting":
      case "material_ordered":
        return (
          <MaterialSection order={order} onUpdateStatus={handleUpdateStatus} />
        );
      case "delivering":
      // case 'completed':
      //   return <DeliverySection order={order} onUpdateStatus={handleUpdateStatus} />;
      default:
        return null;
    }
  };

  return (
    <div className="custom-template-order-detail">
      {/* <Card> */}
      <div className="header-actions">
        <Space>
          <Button icon={<ArrowLeftOutlined />} 
          // onClick={() => navigate(-1)}
          onClick={handleBack}
          >
            Quay lại
          </Button>
          <span style={{ fontWeight: "bold" }}>
            Chi tiết đơn đặt thiết kế #{order.id}
          </span>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title="Tiến độ đơn hàng"
            bordered={true}
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              borderRadius: "12px",
              border: "none",
            }}
            headStyle={{
              background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
              // backgroundColor: "#f0f7f0",
              color: "white",
              // color: "#4caf50",
              borderRadius: "12px 12px 0 0",
              padding: "16px 20px",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
            }}
          >
            <Steps current={currentStep}>
              {orderSteps.map((step, index) => (
                <Step
                  key={index}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </Steps>
          </Card>
        </Col>
        <Col span={16}>
          <Card
            title="Thông tin đơn hàng"
            bordered={true}
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              borderRadius: "12px",
              border: "none",
            }}
            headStyle={{
              background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
              color: "white",
              borderRadius: "12px 12px 0 0",
              padding: "16px 20px",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
            }}
          >
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Mã đơn hàng">
                #{order.id}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt hàng">
                {dayjs(order.orderDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Designer">
                {order.designer}
              </Descriptions.Item>
              <Descriptions.Item label="Mẫu thiết kế">
                {order.templateName}
              </Descriptions.Item>
              <Descriptions.Item label="Diện tích mẫu">
                {order.area} m²
              </Descriptions.Item>
              <Descriptions.Item label="Diện tích yêu cầu">
                {order.areaCustom} m²
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <div>
              <h4>Yêu cầu thiết kế:</h4>
              <p>{order.requirements || "Không có yêu cầu cụ thể"}</p>
            </div>
            {order.attachments && order.attachments.length > 0 && (
              <div className="attachments">
                <h4>Tài liệu đính kèm:</h4>
                <ul>
                  {order.attachments.map((file, index) => (
                    <li key={index}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {order.customerImages && order.customerImages.length > 0 && (
              <div className="customer-images">
                <h4>Hình ảnh từ khách hàng:</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {order.customerImages.map((image, index) => (
                    <div
                      key={index}
                      style={{
                        width: "150px",
                        height: "150px",
                        position: "relative",
                        border: "1px solid #e8e8e8",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={image.url}
                        alt={`Customer image ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onClick={() => window.open(image.url, "_blank")}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "4px",
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          fontSize: "12px",
                          textAlign: "center",
                        }}
                      >
                        {image.name || `Hình ${index + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Divider />
            {order.selectedMaterials && order.selectedMaterials.length > 0 && (
              <div className="selected-materials">
                <h4>Vật liệu đã chọn:</h4>
                {order.selectedMaterials.map((category, categoryIndex) => (
                  <div key={categoryIndex} style={{ marginBottom: "10px" }}>
                    <Table
                      dataSource={category.items}
                      pagination={false}
                      size="small"
                      bordered
                    >
                      <Table.Column title="Tên vật liệu" dataIndex="name" />
                      <Table.Column title="Số lượng" dataIndex="quantity" />
                      <Table.Column title="Đơn vị" dataIndex="unit" />
                      <Table.Column
                        title="Đơn giá"
                        dataIndex="price"
                        render={(price) => (
                          <span>{price.toLocaleString("vi-VN")} đ</span>
                        )}
                      />
                      <Table.Column
                        title="Thành tiền"
                        render={(_, record) => (
                          <span>
                            {(record.price * record.quantity).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            đ
                          </span>
                        )}
                      />
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="Thông tin khách hàng"
            className="customer-info-card"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              borderRadius: "12px",
              border: "none",
            }}
            headStyle={{
              background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
              color: "white",
              borderRadius: "12px 12px 0 0",
              padding: "16px 20px",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
            }}
          >
            <Descriptions column={1} size="small" layout="horizontal" bordered>
              <Descriptions.Item
                label={
                  <Space>
                    <UserOutlined
                      style={{
                        color: "#4caf50",
                        fontSize: "18px",
                        backgroundColor: "#f0f7f0",
                        padding: "10px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                    <span style={{ color: "#666", fontSize: "15px" }}>
                      Khách hàng
                    </span>
                  </Space>
                }
              >
                {order.customerInfo?.name}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <PhoneOutlined
                      style={{
                        color: "#4caf50",
                        fontSize: "18px",
                        backgroundColor: "#f0f7f0",
                        padding: "10px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />

                    <span style={{ color: "#666", fontSize: "15px" }}>
                      Số điện thoại
                    </span>
                  </Space>
                }
              >
                {order.customerInfo?.phone}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <MailOutlined
                      style={{
                        color: "#4caf50",
                        fontSize: "18px",
                        backgroundColor: "#f0f7f0",
                        padding: "10px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />

                    <span style={{ color: "#666", fontSize: "15px" }}>
                      Email
                    </span>
                  </Space>
                }
              >
                {order.customerInfo?.email}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <HomeOutlined
                      style={{
                        color: "#4caf50",
                        fontSize: "18px",
                        backgroundColor: "#f0f7f0",
                        padding: "10px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />

                    <span style={{ color: "#666", fontSize: "15px" }}>
                      Địa chỉ
                    </span>
                  </Space>
                }
              >
                {order.customerInfo?.address}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <StarTwoTone
                      style={{
                        color: "#4caf50",
                        fontSize: "18px",
                        backgroundColor: "#f0f7f0",
                        padding: "10px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />

                    <span style={{ color: "#666", fontSize: "15px" }}>
                      Trạng thái
                    </span>
                  </Space>
                }
              >
                <Tag color={order.status === "active" ? "green" : "gold"}>
                  {order.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                // label="Diện tích yêu cầu"
                label={
                  <Space>
                    <LayoutOutlined
                      style={{
                        color: "#4caf50",
                        fontSize: "18px",
                        backgroundColor: "#f0f7f0",
                        padding: "10px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />

                    <span style={{ color: "#666", fontSize: "15px" }}>
                      Diện tích yêu cầu
                    </span>
                  </Space>
                }
              >
                {order.areaCustom} m²
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ color: "#666", fontSize: "15px" }}>
                    Tổng chi phí
                  </span>
                }
              >
                {order.prices.totalCost.toLocaleString("vi-VN")} đ
              </Descriptions.Item>
            </Descriptions>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Button
                type="primary"
                style={{
                  backgroundColor: "#4CAF50",
                  borderColor: "#4CAF50",
                  width: "100%",
                }}
                onClick={() => {
                  Modal.confirm({
                    title: "Xác nhận đơn hàng",
                    content: "Bạn có chắc chắn muốn xác nhận đơn hàng này?",
                    okText: "Xác nhận",
                    cancelText: "Hủy",
                    onOk: () => {
                      message.success("Đã xác nhận đơn hàng thành công");
                    },
                  });
                }}
              >
                Xác nhận đơn hàng
              </Button>
              <Button
                danger
                style={{
                  width: "100%",
                }}
                onClick={() => {
                  Modal.confirm({
                    title: "Hủy đơn hàng",
                    content: "Bạn có chắc chắn muốn hủy đơn hàng này?",
                    okText: "Hủy đơn",
                    cancelText: "Đóng",
                    okButtonProps: { danger: true },
                    onOk: () => {
                      message.success("Đã hủy đơn hàng thành công");
                    },
                  });
                }}
              >
                Hủy đơn hàng
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Order basic info */}
      <Row gutter={[16, 16]}>
        {/* Customer Info */}
        {/* <Col span={24}>
          <Card
            title="Thông tin khách hàng"
            headStyle={{
              backgroundColor: "#e3f0e1",
              borderBottom: "2px solid #4caf50",
            }}
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} layout="horizontal">
              <Descriptions.Item
                label={
                  <div style={{ fontWeight: "bold" }}>
                    <UserOutlined
                      style={{ color: "#4caf50", marginRight: "5px" }}
                    />{" "}
                    Họ tên
                  </div>
                }
              >
                {order.customerInfo?.name}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div style={{ fontWeight: "bold" }}>
                    <PhoneOutlined
                      style={{ color: "#4caf50", marginRight: "5px" }}
                    />{" "}
                    Số điện thoại
                  </div>
                }
              >
                {order.customerInfo?.phone}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div style={{ fontWeight: "bold" }}>
                    <MailOutlined
                      style={{ color: "#4caf50", marginRight: "5px" }}
                    />{" "}
                    Email
                  </div>
                }
              >
                {order.customerInfo?.email}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <div style={{ fontWeight: "bold" }}>
                    <HomeOutlined
                      style={{ color: "#4caf50", marginRight: "5px" }}
                    />{" "}
                    Địa chỉ
                  </div>
                }
              >
                {order.customerInfo?.address}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col> */}

        {/* Order Progress */}
        {/* <Col span={24}>
          <Card title="Tiến độ đơn hàng" bordered={false}>
            <Steps current={currentStep}>
              {orderSteps.map((step, index) => (
                <Step
                  key={index}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </Steps>
          </Card>
        </Col> */}

        {/* Yêu cầu thiết kế */}
        <Col span={24}>
          {/* <Card title="Yêu cầu thiết kế" bordered={false}>
            <p>{order.requirements || "Không có yêu cầu cụ thể"}</p>
            {order.attachments && order.attachments.length > 0 && (
              <div className="attachments">
                <h4>Tài liệu đính kèm:</h4>
                <ul>
                  {order.attachments.map((file, index) => (
                    <li key={index}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card> */}
        </Col>

        {/* Chi phí và thanh toán */}
        <Col span={24}>
          <Card title="Chi phí và thanh toán" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Statistic
                  title="Phí thiết kế"
                  value={order.prices?.designFee || 0}
                  suffix="đ"
                  groupSeparator=","
                />
              </Col>
              <Col xs={24} md={12}>
                <Statistic
                  title="Tổng chi phí vật liệu"
                  value={order.prices?.totalMaterialCost || 0}
                  suffix="đ"
                  groupSeparator=","
                />
              </Col>
              <Col xs={24}>
                <Statistic
                  title="Tổng chi phí"
                  value={order.prices?.totalCost || 0}
                  suffix="đ"
                  groupSeparator=","
                  valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Timeline */}
        {/* <Col span={24}>
            <Card title="Lịch sử đơn hàng">
              {order.timeline && order.timeline.length > 0 ? (
                <Timeline
                  items={order.timeline.map(item => ({
                    children: (
                      <>
                        <div>{dayjs(item.date).format('DD/MM/YYYY HH:mm')}</div>
                        <div>{item.description}</div>
                      </>
                    )
                  }))}
                />
              ) : (
                <Empty description="Chưa có lịch sử" />
              )}
            </Card>
          </Col> */}
      </Row>

      {/* Dynamic section based on order status */}
      {renderSection()}
      {/* </Card> */}
    </div>
  );
};

export default CustomTemplateOrderDetail;
