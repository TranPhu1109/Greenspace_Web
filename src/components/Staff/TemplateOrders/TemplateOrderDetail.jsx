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
  message,
  Divider,
  Empty,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  StarTwoTone,
} from "@ant-design/icons";

import { useParams, useNavigate } from "react-router-dom";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useProductStore from "@/stores/useProductStore";

const { Step } = Steps;

const TemplateOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDesignOrderById, selectedOrder, isLoading } =
    useDesignOrderStore();
  const { products, fetchProducts, categories, fetchCategories } =
    useProductStore();
  const { getBasePath } = useRoleBasedPath();

  console.log("selectedOrder", selectedOrder);

  const handleBack = () => {
    navigate(`${getBasePath()}/design-orders/template-orders`);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        await getDesignOrderById(id);
      } catch (error) {
        message.error("Không thể tải thông tin đơn hàng");
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

  return (
    <div className="template-order-detail">
      <div className="header-actions" style={{ marginBottom: "16px" }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
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
                selectedOrder.status === "Pending" ? 0 :
                selectedOrder.status === "PaymentSuccess" ? 1 :
                selectedOrder.status === "Processing" ? 2 :
                selectedOrder.status === "PickedPackageAndDelivery" ? 3 :
                selectedOrder.status === "DeliveryFail" ? 3 :
                selectedOrder.status === "ReDelivery" ? 3 :
                selectedOrder.status === "DeliveredSuccessfully" ? 4 :
                selectedOrder.status === "CompleteOrder" ? 5 :
                selectedOrder.status === "OrderCancelled" ? -1 :
                selectedOrder.status === "Refund" ? -1 :
                selectedOrder.status === "DoneRefund" ? -1 : 0
              }
              status={
                selectedOrder.status === "OrderCancelled" || 
                selectedOrder.status === "Refund" || 
                selectedOrder.status === "DoneRefund" || 
                selectedOrder.status === "DeliveryFail" 
                ? "error" 
                : "process"
              }
            >
              <Step title="Chờ xử lý" description="Đơn hàng mới" />
              <Step title="Thanh toán" description="Đã thanh toán" />
              <Step title="Xử lý" description="Đang xử lý đơn hàng" />
              <Step title="Vận chuyển" description="Đang giao hàng" />
              <Step title="Đã giao" description="Giao hàng thành công" />
              <Step title="Hoàn thành" description="Đơn hàng hoàn thành" />
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
            <div>
              {/* Order Information Section */}
              <Descriptions column={2} bordered title="Thông tin đơn hàng">
                <Descriptions.Item label="Mã đơn hàng">
                  #{selectedOrder.id}
                </Descriptions.Item>

                <Descriptions.Item label="Mẫu thiết kế">
                  {selectedOrder.templateName}
                </Descriptions.Item>
                <Descriptions.Item label="Giá thiết kế">
                  <strong>
                    {selectedOrder.designPrice.toLocaleString("vi-VN")} đ
                  </strong>
                </Descriptions.Item>
              </Descriptions>

              {/* Customer Requirements Section */}
              <Descriptions
                column={3}
                bordered
                title="Yêu cầu khách hàng"
                style={{ marginTop: "16px" }}
              >
                <Descriptions.Item label="Chiều dài">
                  {selectedOrder.length} m
                </Descriptions.Item>
                <Descriptions.Item label="Chiều rộng">
                  {selectedOrder.width} m
                </Descriptions.Item>
                <Descriptions.Item label="Diện tích yêu cầu">
                  {selectedOrder.length * selectedOrder.width} m²
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  {selectedOrder.description}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider />

            {selectedOrder.serviceOrderDetails &&
              selectedOrder.serviceOrderDetails.length > 0 && (
                <div className="selected-materials">
                  <h4>Vật liệu đã chọn:</h4>
                  <div style={{ marginBottom: "10px" }}>
                    <Table
                      dataSource={selectedOrder.serviceOrderDetails.map(
                        (detail) => {
                          const product = products.find(
                            (p) => p.id === detail.productId
                          );
                          const category = categories.find(
                            (c) => c.id === product?.categoryId
                          );
                          return {
                            ...detail,
                            product,
                            category,
                          };
                        }
                      )}
                      pagination={false}
                      size="small"
                      bordered
                      summary={() => (
                        <Table.Summary>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3}>
                              <strong>Tổng tiền vật liệu</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                              <strong>
                                {selectedOrder.materialPrice.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                đ
                              </strong>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      )}
                    >
                      <Table.Column
                        title="Sản phẩm"
                        key="product"
                        render={(record) => (
                          <Space>
                            <img
                              src={record.product?.image.imageUrl}
                              alt={record.product?.name}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: "5px",
                                objectFit: "cover",
                              }}
                            />
                            <div>
                              <div>{record.product?.name}</div>
                              <Tag color="green">{record.category?.name}</Tag>
                            </div>
                          </Space>
                        )}
                      />
                      <Table.Column title="Số lượng" dataIndex="quantity" />
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
                <Tag
                  color={selectedOrder.status === "active" ? "green" : "gold"}
                >
                  {selectedOrder.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span style={{ color: "#666", fontSize: "15px" }}>
                    Tổng chi phí
                  </span>
                }
              >
                <strong>
                  {selectedOrder.totalCost.toLocaleString("vi-VN")} đ
                </strong>
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

      {/* Keep existing modals */}
    </div>
  );
};

export default TemplateOrderDetail;
