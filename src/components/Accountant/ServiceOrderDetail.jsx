import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Space,
  Button,
  Table,
  Image,
  Empty,
  Spin,
  message,
  Modal,
  InputNumber,
  Form,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import useAccountantStore from "../../stores/useAccountantStore";
import useProductStore from "../../stores/useProductStore";
import dayjs from "dayjs";

const ServiceOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, isLoading, getServiceOrderById, updateDesignPrice, updateOrderStatus } = useAccountantStore();
  const { products, fetchProducts } = useProductStore();
  const [orderDetails, setOrderDetails] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getServiceOrderById(id),
          fetchProducts(),
        ]);
      } catch (error) {
        // message.error("Không thể tải thông tin đơn hàng");
        // navigate(-1);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (selectedOrder?.serviceOrderDetails && products.length > 0) {
      const details = selectedOrder.serviceOrderDetails.map(detail => {
        const product = products.find(p => p.id === detail.productId);
        return {
          ...detail,
          productName: product?.name || "Không xác định",
          categoryName: product?.categoryName || "Không xác định",
          imageUrl: product?.image?.imageUrl,
        };
      });
      setOrderDetails(details);
    }
  }, [selectedOrder, products]);

  const handleUpdateDesignPrice = async (values) => {
    try {
      await updateDesignPrice(id, values.designPrice);
      await updateOrderStatus(id, 21);
      message.success("Cập nhật giá thiết kế thành công");
      setIsModalVisible(false);
      form.resetFields();
      getServiceOrderById(id);
    } catch (error) {
      message.error("Không thể cập nhật giá thiết kế");
    }
  };

  const handleConfirmMaterialPrice = async () => {
    try {
      await updateOrderStatus(id, 6); // 5 = DeterminingMaterialPrice
      message.success("Xác nhận giá vật liệu thành công");
      getServiceOrderById(id);
    } catch (error) {
      message.error("Không thể xác nhận giá vật liệu");
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "gold",
      ConsultingAndSketching: "blue",
      DeterminingDesignPrice: "purple",
      DepositSuccessful: "green",
      DeterminingMaterialPrice: "cyan",
      AssignToDesigner: "orange",
      DoneDesign: "volcano",
      PaymentSuccess: "green",
      Processing: "processing",
      PickedPackageAndDelivery: "processing",
      DeliveryFail: "error",
      ReDelivery: "warning",
      DeliveredSuccessfully: "success",
      CompleteOrder: "success",
      OrderCancelled: "error",
      Warning: "orange",
      Refund: "purple",
      DoneRefund: "green",
      Completed: "success",
      ReConsultingAndSketching: "blue",
      ReDesign: "volcano",
      WaitDeposit: "gold",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      DeterminingDesignPrice: "Đang xác định giá thiết kế",
      DepositSuccessful: "Đặt cọc thành công",
      DeterminingMaterialPrice: "Xác định giá vật liệu",
      AssignToDesigner: "Đã giao cho nhà thiết kế",
      DoneDesign: "Hoàn thành thiết kế",
      PaymentSuccess: "Thanh toán thành công",
      Processing: "Đang xử lý",
      PickedPackageAndDelivery: "Đã lấy hàng & đang giao",
      DeliveryFail: "Giao hàng thất bại",
      ReDelivery: "Giao lại",
      DeliveredSuccessfully: "Đã giao hàng thành công",
      CompleteOrder: "Hoàn thành đơn hàng",
      OrderCancelled: "Đơn hàng đã bị hủy",
      Warning: "Cảnh báo vượt 30%",
      Refund: "Hoàn tiền",
      DoneRefund: "Đã hoàn tiền",
      Completed: "Hoàn thành",
      ReConsultingAndSketching: "Phác thảo lại",
      ReDesign: "Thiết kế lại",
      WaitDeposit: "Chờ đặt cọc",
    };
    return statusTexts[status] || status;
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text, record) => (
        <Space>
          {record.imageUrl && (
            <Image
              src={record.imageUrl}
              alt={text}
              width={50}
              height={50}
              style={{ objectFit: "cover" }}
            />
          )}
          <div>
            <div>{text}</div>
            <Tag color="blue">{record.categoryName}</Tag>
          </div>
        </Space>
      ),
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
      render: (text) => <span>{text?.toLocaleString("vi-VN")} đ</span>,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text) => <span>{text?.toLocaleString("vi-VN")} đ</span>,
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!selectedOrder) {
    return <Empty description="Không tìm thấy thông tin đơn hàng" />;
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card
            title="Thông tin đơn hàng"
            extra={
              selectedOrder?.status === "DeterminingDesignPrice" && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={showModal}
                >
                  Nhập giá thiết kế
                </Button>
              )
            }
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã đơn hàng">
                #{selectedOrder.id.substring(0, 8)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(selectedOrder.creationDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Loại dịch vụ">
                {selectedOrder.serviceType === "UsingDesignIdea"
                  ? "Sử dụng mẫu thiết kế"
                  : "Không có mẫu thiết kế"}
              </Descriptions.Item>
              <Descriptions.Item label="Diện tích">
                {selectedOrder.length * selectedOrder.width} m²
              </Descriptions.Item>
              <Descriptions.Item label="Giá thiết kế">
                {selectedOrder.designPrice?.toLocaleString("vi-VN")} đ
              </Descriptions.Item>
              <Descriptions.Item label="Giá vật liệu">
                {selectedOrder.materialPrice?.toLocaleString("vi-VN")} đ
              </Descriptions.Item>
              <Descriptions.Item label="Tổng chi phí">
                <strong style={{ color: "#4caf50" }}>{selectedOrder.totalCost?.toLocaleString("vi-VN")} đ</strong>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Thông tin khách hàng">
            <Descriptions bordered column={2}>
              <Descriptions.Item
                label={
                  <Space>
                    <UserOutlined />
                    Họ tên
                  </Space>
                }
              >
                {selectedOrder.userName}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <PhoneOutlined />
                    Số điện thoại
                  </Space>
                }
              >
                {selectedOrder.cusPhone}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <MailOutlined />
                    Email
                  </Space>
                }
              >
                {selectedOrder.email}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <HomeOutlined />
                    Địa chỉ
                  </Space>
                }
              >
                {selectedOrder.address}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>


        <Col span={24}>
          <Card title="Hình ảnh">
            <Space size="large">
              {selectedOrder.image?.imageUrl && (
                <Image
                  src={selectedOrder.image.imageUrl}
                  alt="Hình ảnh 1"
                  width={200}
                  height={200}
                  style={{ objectFit: "cover" }}
                />
              )}
              {selectedOrder.image?.image2 && (
                <Image
                  src={selectedOrder.image.image2}
                  alt="Hình ảnh 2"
                  width={200}
                  height={200}
                  style={{ objectFit: "cover" }}
                />
              )}
              {selectedOrder.image?.image3 && (
                <Image
                  src={selectedOrder.image.image3}
                  alt="Hình ảnh 3"
                  width={200}
                  height={200}
                  style={{ objectFit: "cover" }}
                />
              )}
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Chi tiết vật liệu">
            <Table
              columns={columns}
              dataSource={orderDetails}
              rowKey="productId"
              pagination={false}
              summary={(pageData) => {
                const totalMaterialPrice = selectedOrder.materialPrice || 0;
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>Tổng giá vật liệu:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong>{totalMaterialPrice.toLocaleString("vi-VN")} đ</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
            {selectedOrder?.status === "DeterminingMaterialPrice" && (
              <div style={{ marginTop: 16, textAlign: "right" }}>
                <Button type="primary" onClick={handleConfirmMaterialPrice}>
                  Xác nhận giá vật liệu
                </Button>
              </div>
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Report">
            <div
              dangerouslySetInnerHTML={{ __html: selectedOrder.report }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Nhập giá thiết kế"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleUpdateDesignPrice}
          layout="vertical"
        >
          <Form.Item
            name="designPrice"
            label="Giá thiết kế (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập giá thiết kế" },
              { type: "number", min: 0, message: "Giá thiết kế phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              placeholder="Nhập giá thiết kế"
            />
          </Form.Item>
          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Xác nhận
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceOrderDetail; 