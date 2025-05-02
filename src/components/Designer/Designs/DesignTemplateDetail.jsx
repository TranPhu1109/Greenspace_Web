import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Image,
  Typography,
  Descriptions,
  Button,
  Table,
  Space,
  Tag,
  Spin,
  message,
  Divider,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  CalendarOutlined,
  FileOutlined,
} from "@ant-design/icons";
import useDesignIdeaStore from "../../../stores/useDesignIdeaStore";
import useProductStore from "../../../stores/useProductStore";
import dayjs from "dayjs";
import api from "../../../api/api";

const { Title, Text } = Typography;

const DesignTemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const componentId = useRef(`detail-${id}-${Date.now()}`).current;
  const { designIdeaById, isLoading, error, fetchDesignIdeaById } = useDesignIdeaStore();
  const { products, fetchProducts } = useProductStore();
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDesignIdeaById(id, componentId),
          fetchProducts(componentId)
        ]);
      } catch (error) {
        if (!error.message || error.message !== 'canceled') {
          console.error("Error loading data:", error);
          message.error("Không thể tải thông tin: " + error.message);
        }
      }
    };

    loadData();

    return () => {
      api.clearPendingRequests(componentId);
    };
  }, [id, componentId, fetchDesignIdeaById, fetchProducts]);



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!designIdeaById || Object.keys(designIdeaById).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Text type="secondary">Không tìm thấy mẫu thiết kế</Text>
        <Button type="primary" onClick={() => navigate(-1)} className="mt-4">
          Quay lại
        </Button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).format("DD/MM/YYYY HH:mm:ss");
  };

  const handleDownloadDesign = () => {
    if (designIdeaById?.designImage3URL) {
      window.open(designIdeaById.designImage3URL, "_blank");
    } else {
      message.warning("File thiết kế không khả dụng");
    }
  };

  const handleOpenPdfModal = () => {
    setPdfModalVisible(true);
  };

  const handleOpenVideoModal = () => {
    setVideoModalVisible(true);
  };

  return (
    <div className="p-6">
      <Card
        title={
          <Space className="w-full justify-between">
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                >Quay lại</Button>
              <Title level={4} style={{ margin: 0 }}>
                {designIdeaById?.name || 'Chi tiết thiết kế'}
              </Title>
            </Space>
          </Space>
        }
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card
              title="Hình ảnh tổng quan"
              bordered={true}
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                borderRadius: "12px",
                border: "none",
                marginBottom: "16px",
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
              <div className="space-y-4">
                {designIdeaById?.image?.imageUrl && (
                  <div className="mb-4">
                    <div className="mb-2">
                      <Text strong>Hình ảnh chính</Text>
                    </div>
                    <Image
                      src={designIdeaById.image.imageUrl}
                      alt={designIdeaById?.name}
                      className="w-full rounded-lg object-cover"
                      style={{ height: "300px", width: "100%" }}
                    />
                  </div>
                )}
                <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                  {designIdeaById?.image?.image2 && (
                    <Col span={12}>
                      <div>
                        <div className="mb-2">
                          <Text strong>Hình ảnh phụ 1</Text>
                        </div>
                        <Image
                          src={designIdeaById.image.image2}
                          alt={`${designIdeaById?.name || "Hình ảnh"} - 2`}
                          className="w-full rounded-lg object-cover"
                          style={{ height: "200px", width: "100%" }}
                        />
                      </div>
                    </Col>
                  )}
                  {designIdeaById?.image?.image3 && (
                    <Col span={12}>
                      <div>
                        <div className="mb-2">
                          <Text strong>Hình ảnh phụ 2</Text>
                        </div>
                        <Image
                          src={designIdeaById.image.image3}
                          alt={`${designIdeaById?.name || "Hình ảnh"} - 3`}
                          className="w-full rounded-lg object-cover"
                          style={{ height: "200px", width: "100%" }}
                        />
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </Card>

            <Card
              title="Bản vẽ thiết kế"
              bordered={true}
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                borderRadius: "12px",
                border: "none",
                marginBottom: "16px",
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
              <Row gutter={16}>
                {designIdeaById?.designImage1URL && (
                  <Col span={12}>
                    <div className="mb-2">
                      <Text strong>Bản vẽ 1</Text>
                    </div>
                    <Image
                      src={designIdeaById.designImage1URL}
                      alt="Thiết kế 1"
                      className="w-full rounded-lg object-cover"
                      style={{ height: "200px" }}
                    />
                  </Col>
                )}
                {designIdeaById?.designImage2URL && (
                  <Col span={12}>
                    <div className="mb-2">
                      <Text strong>Hướng dẫn lắp đặt (PDF)</Text>
                    </div>
                    <div 
                      className="w-full rounded-lg overflow-hidden cursor-pointer"
                      style={{ height: "200px", position: "relative" }}
                      onClick={handleOpenPdfModal}
                    >
                      <embed
                        src={designIdeaById.designImage2URL}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                        className="rounded-lg"
                      />
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity duration-300"
                      >
                        <Button type="primary" icon={<FileOutlined />}>
                          Phóng to
                        </Button>
                      </div>
                    </div>
                  </Col>
                )}
                
                {designIdeaById?.designImage3URL && (
                  <Col span={12}>
                    <div className="mb-2">
                      <Text strong>Video hướng dẫn lắp đặt</Text>
                    </div>
                    <div 
                      className="w-full rounded-lg overflow-hidden cursor-pointer"
                      style={{ height: "200px", position: "relative" }}
                      onClick={handleOpenVideoModal}
                    >
                      <video
                        src={designIdeaById.designImage3URL}
                        controls
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity duration-300"
                      >
                        <Button type="primary" icon={<FileOutlined />}>
                          Phóng to
                        </Button>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
            {designIdeaById?.productDetails && designIdeaById.productDetails.length > 0 && (
              <Card
                title="Danh sách vật liệu"
                bordered={true}
                style={{
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  border: "none",
                  marginBottom: "16px",
                }}
                headStyle={{
                  background:
                    "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                  color: "white",
                  borderRadius: "12px 12px 0 0",
                  padding: "16px 20px",
                  fontSize: "16px",
                  fontWeight: "600",
                  border: "none",
                }}
              >
                <Table
                  dataSource={(designIdeaById?.productDetails || []).map((detail, index) => {
                    const product = products?.find(
                      (p) => p.id === detail.productId
                    );
                    return {
                      key: index,
                      productName: product?.name || "Không có tên",
                      quantity: detail.quantity || 1,
                      price: detail.price || 0,
                      imageUrl: product?.image?.imageUrl,
                      total: (detail.quantity || 1) * (detail.price || 0),
                    };
                  })}
                  columns={[
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
                              width={40}
                              height={40}
                              className="object-cover rounded"
                              preview={false}
                            />
                          )}
                          <Text>{text}</Text>
                        </Space>
                      ),
                    },
                    {
                      title: "Số lượng",
                      dataIndex: "quantity",
                      key: "quantity",
                      align: "center",
                    },
                    {
                      title: "Đơn giá",
                      dataIndex: "price",
                      key: "price",
                      align: "right",
                      render: (price) => `${price.toLocaleString("vi-VN")}đ`,
                    },
                    {
                      title: "Thành tiền",
                      dataIndex: "total",
                      key: "total",
                      align: "right",
                      render: (total) => `${total.toLocaleString("vi-VN")}đ`,
                    },
                  ]}
                  pagination={false}
                  summary={(pageData) => {
                    const total = pageData.reduce(
                      (sum, row) => sum + row.total,
                      0
                    );
                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell colSpan={3}>
                          <Text strong>Tổng cộng</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="right">
                          <Text strong type="danger">
                            {total.toLocaleString("vi-VN")}đ
                          </Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            )}
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title="Thông tin chi tiết"
              bordered={true}
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                borderRadius: "12px",
                border: "none",
                marginBottom: "16px",
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
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Mã thiết kế">
                  <Text copyable>{designIdeaById?.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tên thiết kế">
                  <Text strong>{designIdeaById?.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Danh mục">
                  <Tag color="blue">{designIdeaById?.categoryName}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  <Space>
                    <CalendarOutlined />
                    {formatDate(designIdeaById?.creationDate)}
                  </Space>
                </Descriptions.Item>
                {designIdeaById?.modificationDate && (
                  <Descriptions.Item label="Cập nhật lần cuối">
                    <Space>
                      <CalendarOutlined />
                    {formatDate(designIdeaById?.modificationDate)}
                  </Space>
                </Descriptions.Item>
                )}
                {/* <Descriptions.Item label="Mô tả">
                  {designIdeaById?.description || 'Không có mô tả'}
                </Descriptions.Item> */}
                <Descriptions.Item label="File thiết kế">
                  <Button 
                    type="text" 
                    icon={<DownloadOutlined />} 
                    onClick={handleOpenPdfModal}
                  >
                    Xem file thiết kế
                  </Button>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title="Chi phí"
              bordered={true}
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                borderRadius: "12px",
                border: "none",
                marginBottom: "16px",
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
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Giá thiết kế">
                  <Text strong>
                    {(designIdeaById?.designPrice || 0).toLocaleString("vi-VN")}đ
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Giá vật liệu">
                  <Text strong>
                    {(designIdeaById?.materialPrice || 0).toLocaleString("vi-VN")}đ
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng chi phí">
                  <Text strong type="danger" className="text-xl">
                    {(designIdeaById?.totalPrice || 0).toLocaleString("vi-VN")}đ
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            {/* thêm phần mô tả */}
            <Card
              title="Mô tả"
              bordered={true}
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                borderRadius: "12px",
                border: "none",
                marginBottom: "16px",
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
              <div className="html-preview" dangerouslySetInnerHTML={{ __html: designIdeaById?.description }} />
            </Card>
            
          </Col>
        </Row>
      </Card>

      <Modal
        title="Xem hướng dẫn lắp đặt (PDF)"
        open={pdfModalVisible}
        onCancel={() => setPdfModalVisible(false)}
        width="80%"
        footer={null}
        style={{ top: 20 }}
        bodyStyle={{ height: '80vh', padding: 0 }}
      >
        <embed
          src={designIdeaById?.designImage2URL}
          type="application/pdf"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </Modal>
      
      <Modal
        title="Xem video hướng dẫn lắp đặt"
        open={videoModalVisible}
        onCancel={() => setVideoModalVisible(false)}
        width="80%"
        footer={null}
        style={{ top: 20 }}
        bodyStyle={{ height: '80vh', padding: 0 }}
      >
        <video
          src={designIdeaById?.designImage3URL}
          controls
          autoPlay
          style={{ width: '100%', height: '100%', maxHeight: '80vh' }}
        />
      </Modal>
    </div>
  );
};

export default DesignTemplateDetail;
