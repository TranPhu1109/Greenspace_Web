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
  ArrowLeftOutlined,
  StarTwoTone,
  LayoutOutlined,
} from "@ant-design/icons";
import { customTemplateOrders } from "../mockData/customTemplateOrders";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import ConsultingSection from "./sections/ConsultingSection";
import DesignSection from "./sections/DesignSection";
import MaterialSection from "./sections/MaterialSection";
import "./CustomTemplateOrderDetail.scss";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";
import useDesignOrderStore from "@/stores/useDesignOrderStore";

const { Step } = Steps;

const CustomTemplateOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const [loading, setLoading] = useState(false);
  const { getDesignOrderById, selectedOrder, isLoading } = useDesignOrderStore();
  console.log(selectedOrder);
  // const [order, setOrder] = useState(null);
  // // const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] =
  // //   useState(false);
  // // const [isUpdateMaterialModalVisible, setIsUpdateMaterialModalVisible] =
  // //   useState(false);
  // // const [isUpdatePaymentModalVisible, setIsUpdatePaymentModalVisible] =
  // //   useState(false);
  // // const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  // // const [selectedMaterial, setSelectedMaterial] = useState(null);
  // // const [form] = Form.useForm();
  // // const [currentStep, setCurrentStep] = useState(0);

  const { getBasePath } = useRoleBasedPath();

  const handleBack = () => {
    navigate(`${getBasePath()}/design-orders/custom-template-orders`);
  };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        await getDesignOrderById(id);
      } catch (error) {
        message.error('Không thể tải thông tin đơn hàng');
        navigate(-1);
      }
    };
    fetchOrderDetail();
  }, [id]);

  if (isLoading || !selectedOrder) {
    return (
      <Card>
        <Empty description="Đang tải thông tin đơn hàng..." />
      </Card>
    );
  }

  const renderSection = () => {
    switch (selectedOrder.status) {
      case "pending":
        return null; // Show default order info
      case "processing":
      case "consulting":
        return (
          <ConsultingSection
            order={selectedOrder}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      case "designing":
      case "design_review":
        return (
          <DesignSection order={selectedOrder} onUpdateStatus={handleUpdateStatus} />
        );
      // case 'waiting_deposit':
      //   return <DepositSection order={order} onUpdateStatus={handleUpdateStatus} />;
      case "material_selecting":
      case "material_ordered":
        return (
          <MaterialSection order={selectedOrder} onUpdateStatus={handleUpdateStatus} />
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
          onClick={handleBack}
          >
            Quay lại
          </Button>
          <span style={{ fontWeight: "bold" }}>
            Chi tiết đơn đặt thiết kế #{selectedOrder.id}
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
              color: "white",
              borderRadius: "12px 12px 0 0",
              padding: "16px 20px",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
            }}
          >
            <Steps 
              current={
                selectedOrder.status === 'pending' ? 0 :
                selectedOrder.status === 'consulting' ? 1 :
                selectedOrder.status === 'designing' ? 2 :
                selectedOrder.status === 'design_review' ? 2 :
                selectedOrder.status === 'material_selecting' ? 3 :
                selectedOrder.status === 'material_ordered' ? 4 :
                selectedOrder.status === 'delivering' ? 5 : 0
              }
            >
              <Step title="Chờ xác nhận" description="Đơn hàng mới" />
              <Step title="Tư vấn" description="Trao đổi yêu cầu" />
              <Step title="Thiết kế" description="Đang thiết kế" />
              <Step title="Chọn vật liệu" description="Lựa chọn vật liệu" />
              <Step title="Đặt vật liệu" description="Đã đặt vật liệu" />
              <Step title="Vận chuyển" description="Đang giao hàng" />
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
                #{selectedOrder.id}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Ngày đặt hàng">
                {dayjs(order.orderDate).format("DD/MM/YYYY")}
              </Descriptions.Item> */}
              <Descriptions.Item label="Designer">
                {selectedOrder.designer}
              </Descriptions.Item>
              <Descriptions.Item label="Mẫu thiết kế">
                {selectedOrder.templateName}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Diện tích mẫu">
                {selectedOrder.area} m²
              </Descriptions.Item> */}
              <Descriptions.Item label="Diện tích yêu cầu">
                {selectedOrder.length * selectedOrder.width} m²
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <div>
              <h4>Yêu cầu thiết kế:</h4>
              <p>{selectedOrder.description || "Không có yêu cầu cụ thể"}</p>
            </div>
            {selectedOrder.attachments && selectedOrder.attachments.length > 0 && (
              <div className="attachments">
                <h4>Tài liệu đính kèm:</h4>
                <ul>
                  {selectedOrder.attachments.map((file, index) => (
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
            {selectedOrder.image && (
              <div className="customer-images">
                <h4>Hình ảnh từ khách hàng:</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[selectedOrder.image.imageUrl, selectedOrder.image.image2, selectedOrder.image.image3]
                    .filter(img => img) // Filter out undefined/null images
                    .map((imageUrl, index) => (
                      <div
                        key={index}
                        style={{
                          width: "150px",
                          height: "150px",
                          position: "relative",
                          border: "1px solid #e8e8e8",
                          borderRadius: "8px", 
                          overflow: "hidden",
                          cursor: "pointer"
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={`Customer image ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onClick={() => {
                            const modal = Modal.info({
                              icon: null,
                              content: (
                                <img
                                  src={imageUrl}
                                  alt={`Enlarged customer image ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    maxHeight: '80vh',
                                    objectFit: 'contain'
                                  }}
                                />
                              ),
                              okText: "Đóng",
                              maskClosable: true,
                              width: '80%',
                            });
                          }}
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
                          Hình ảnh thiết kế {index + 1}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            <Divider />
            {selectedOrder.serviceOrderDetails && selectedOrder.serviceOrderDetails.length > 0 && (
              <div className="selected-materials">
                <h4>Vật liệu đã chọn:</h4>
                <div style={{ marginBottom: "10px" }}>
                  <Table
                    dataSource={selectedOrder.serviceOrderDetails}
                    pagination={false}
                    size="small"
                    bordered
                  >
                    <Table.Column 
                      title="Mã sản phẩm" 
                      dataIndex="productId"
                    />
                    <Table.Column 
                      title="Số lượng" 
                      dataIndex="quantity" 
                    />
                    <Table.Column
                      title="Đơn giá"
                      dataIndex="price"
                      render={(price) => (
                        <span>{price.toLocaleString("vi-VN")} đ</span>
                      )}
                    />
                    <Table.Column
                      title="Thành tiền"
                      dataIndex="totalPrice" 
                      render={(totalPrice) => (
                        <span>{totalPrice.toLocaleString("vi-VN")} đ</span>
                      )}
                    />
                  </Table>
                </div>
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
                {selectedOrder.userName}
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
                {selectedOrder.cusPhone}
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
                {selectedOrder.email}
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
                {selectedOrder.address}
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
                <Tag color={selectedOrder.status === "active" ? "green" : "gold"}>
                  {selectedOrder.status}
                </Tag>
              </Descriptions.Item>
              {/* <Descriptions.Item
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
                {selectedOrder.length * selectedOrder.width} m²
              </Descriptions.Item> */}
              <Descriptions.Item
                label={
                  <span style={{ color: "#666", fontSize: "15px" }}>
                    Tổng chi phí
                  </span>
                }
              >
                {selectedOrder.totalCost.toLocaleString("vi-VN")} đ
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
        {/* <Col span={24}>
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
        </Col> */}

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
