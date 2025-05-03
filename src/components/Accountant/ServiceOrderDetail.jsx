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
  Splitter,
  Tree,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  EditOutlined,
  PlusOutlined,
  ShoppingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import useAccountantStore from "../../stores/useAccountantStore";
import useProductStore from "../../stores/useProductStore";
import dayjs from "dayjs";
import CreateProductModal from "@/components/Staff/Products/components/CreateProductModal";

const { Title } = Typography;

const ServiceOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, isLoading, getServiceOrderById, updateDesignPrice, updateOrderStatus, updateServiceOrderDetails } = useAccountantStore();
  const { products, fetchProducts, categories, fetchCategories, createProduct, isLoading: isProductLoading } = useProductStore();
  const [orderDetails, setOrderDetails] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isCreateProductModalVisible, setIsCreateProductModalVisible] = useState(false);
  const [createProductForm] = Form.useForm();

  const [isProductCustomizeModalVisible, setIsProductCustomizeModalVisible] = useState(false);
  const [tempServiceOrderDetails, setTempServiceOrderDetails] = useState([]);
  const [customizeModalLoading, setCustomizeModalLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getServiceOrderById(id),
          fetchProducts(),
          fetchCategories(),
        ]);
      } catch (error) {
        // message.error("Không thể tải thông tin đơn hàng");
        // navigate(-1);
      }
    };
    fetchData();
  }, [id, getServiceOrderById, fetchProducts, fetchCategories]);

  useEffect(() => {
    if (selectedOrder?.serviceOrderDetails && products.length > 0) {
      const details = selectedOrder.serviceOrderDetails.map(detail => {
        const product = products.find(p => p.id === detail.productId);
        return {
          ...detail,
          productName: product?.name || "Không xác định",
          categoryName: product?.categoryName || "Không xác định",
          imageUrl: product?.image?.imageUrl,
          price: product?.price
        };
      });
      setOrderDetails(details);

      setTempServiceOrderDetails(
        selectedOrder.serviceOrderDetails.map(detail => ({
          productId: detail.productId,
          quantity: detail.quantity || 1,
        }))
      );

    } else {
      setOrderDetails([]);
      setTempServiceOrderDetails([]);
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
      message.error("Không thể cập nhật giá thiết kế: " + (error.message || "Lỗi không xác định"));
    }
  };

  const handleConfirmMaterialPrice = async () => {
    try {
      const reportAccoutant = selectedOrder.reportAccoutant || "";
      const reportManger = selectedOrder.reportManger || "";
      await updateOrderStatus(id, 23, "", reportAccoutant, reportManger);
      message.success("Xác nhận giá vật liệu thành công");
      getServiceOrderById(id);
    } catch (error) {
      message.error("Không thể xác nhận giá vật liệu: " + (error.message || "Lỗi không xác định"));
    }
  };

  const showModal = () => {
    form.setFieldsValue({ designPrice: selectedOrder?.designPrice || null });
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
      AssignToDesigner: "orange",
      DeterminingMaterialPrice: "cyan",
      DoneDesign: "volcano",
      PaymentSuccess: "success",
      Processing: "processing",
      PickedPackageAndDelivery: "geekblue",
      DeliveryFail: "error",
      ReDelivery: "warning",
      DeliveredSuccessfully: "success",
      CompleteOrder: "success",
      OrderCancelled: "error",
      Warning: "orange",
      Refund: "purple",
      DoneRefund: "success",
      StopService: "default",
      ReConsultingAndSketching: "blue",
      ReDesign: "volcano",
      WaitDeposit: "gold",
      DoneDeterminingDesignPrice: "success",
      DoneDeterminingMaterialPrice: "success",
      ReDeterminingDesignPrice: "purple",
      ExchangeProduct: "magenta",
      WaitForScheduling: "lime",
      Installing: "cyan",
      DoneInstalling: "success",
      ReInstall: "warning",
      CustomerConfirm: "blue",
      Successfully: "success"
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      DeterminingDesignPrice: "Đang xác định giá TK",
      DepositSuccessful: "Đã đặt cọc",
      AssignToDesigner: "Đã giao cho NTK",
      DeterminingMaterialPrice: "Đang xác định giá VL",
      DoneDesign: "Đã hoàn thành TK",
      PaymentSuccess: "Đã thanh toán đủ",
      Processing: "Đang xử lý",
      PickedPackageAndDelivery: "Đã lấy hàng & đang giao",
      DeliveryFail: "Giao hàng thất bại",
      ReDelivery: "Giao lại",
      DeliveredSuccessfully: "Đã giao thành công",
      CompleteOrder: "Hoàn thành đơn hàng",
      OrderCancelled: "Đơn hàng đã hủy",
      Warning: "Cảnh báo vượt 30%",
      Refund: "Hoàn tiền",
      DoneRefund: "Đã hoàn tiền",
      StopService: "Ngưng dịch vụ",
      ReConsultingAndSketching: "Tư vấn & phác thảo lại",
      ReDesign: "Thiết kế lại",
      WaitDeposit: "Chờ đặt cọc",
      DoneDeterminingDesignPrice: "Đã xác định giá TK",
      DoneDeterminingMaterialPrice: "Đã xác định giá VL",
      ReDeterminingDesignPrice: "Xác định lại giá TK",
      ExchangeProduct: "Đổi sản phẩm",
      WaitForScheduling: "Chờ lên lịch thi công",
      Installing: "Đang thi công",
      DoneInstalling: "Đã thi công xong",
      ReInstall: "Thi công lại",
      CustomerConfirm: "Chờ khách hàng xác nhận",
      Successfully: "Hoàn thành"
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
              style={{ objectFit: "cover", borderRadius: '4px' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            {record.categoryName && <Tag color="blue">{record.categoryName}</Tag>}
          </div>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: 'center',
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: 'right',
      render: (text) => <span>{text?.toLocaleString("vi-VN")} đ</span>,
    },
    {
      title: "Thành tiền",
      key: "totalPrice",
      align: 'right',
      render: (_, record) => {
        const totalPrice = (record.price || 0) * (record.quantity || 0);
        return <span style={{ fontWeight: 'bold' }}>{totalPrice.toLocaleString("vi-VN")} đ</span>;
      },
    },
  ];

  const handleCreateProduct = async (productData) => {
    try {
      const newProduct = await createProduct(productData);
      message.success("Thêm vật liệu mới thành công");
      setIsCreateProductModalVisible(false);
      createProductForm.resetFields();

      if (newProduct && newProduct.id && newProduct.price) {
        setTempServiceOrderDetails(prev => [...prev, { productId: newProduct.id, quantity: 1 }]);
      }

      fetchProducts();
    } catch (error) {
      message.error("Không thể thêm vật liệu mới: " + (error.message || "Lỗi không xác định"));
    }
  };

  const showCreateProductModal = () => {
    setIsCreateProductModalVisible(true);
  };

  const handleCancelCreateProductModal = () => {
    setIsCreateProductModalVisible(false);
    createProductForm.resetFields();
  };

  const showProductCustomizeModal = () => {
    setTempServiceOrderDetails(
      selectedOrder?.serviceOrderDetails?.map(detail => ({
        productId: detail.productId,
        quantity: detail.quantity || 1,
      })) || []
    );
    setIsProductCustomizeModalVisible(true);
  };

  const handleCancelProductCustomizeModal = () => {
    setIsProductCustomizeModalVisible(false);
  };

  const handleUpdateQuantity = (productId, value) => {
    const newQuantity = parseInt(value);
    if (isNaN(newQuantity) || newQuantity < 1) {
      return;
    }
    setTempServiceOrderDetails(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleProductCheck = (checkedKeysValue, info) => {
    // Filter checkedKeysValue to only include actual product IDs
    // by checking if the key exists in the global products list
    const checkedProductIds = checkedKeysValue.filter(key =>
      products.some(product => product.id === key)
    );

    // Create new details based on filtered product IDs
    const newDetails = checkedProductIds.map(productId => {
      // Find existing item to preserve quantity if it was already selected
      const existingItem = tempServiceOrderDetails.find(item => item.productId === productId);
      return {
        productId: productId,
        quantity: existingItem?.quantity || 1, // Default to 1 if newly checked
      };
    });
    setTempServiceOrderDetails(newDetails);
  };

  const handleRemoveProduct = (productId) => {
    setTempServiceOrderDetails(prev =>
      prev.filter(item => item.productId !== productId)
    );
  };

  const handleSaveCustomizedProducts = async () => {
    setCustomizeModalLoading(true);
    try {
      const detailsToSave = tempServiceOrderDetails.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      await updateServiceOrderDetails(id, detailsToSave);

      message.success("Cập nhật danh sách vật liệu thành công");
      setIsProductCustomizeModalVisible(false);

      await getServiceOrderById(id);

    } catch (error) {
      message.error("Lỗi khi cập nhật danh sách vật liệu: " + (error.message || "Lỗi không xác định"));
    } finally {
      setCustomizeModalLoading(false);
    }
  };

  if (isLoading && !selectedOrder) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!selectedOrder) {
    return <Empty description="Không tìm thấy thông tin đơn hàng" />;
  }

  const totalMaterialPrice = orderDetails.reduce((total, detail) => {
    const price = detail.price || 0;
    const quantity = detail.quantity || 0;
    return total + (price * quantity);
  }, 0);

  return (
    <Spin spinning={isLoading && !!selectedOrder} tip="Đang cập nhật...">
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Splitter style={{ height: 'auto', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: 10, border: '1px solid #f0f0f0' }}>
              <Splitter.Panel defaultSize="65%" min="50%" max="70%" >
                <Card
                  title="Thông tin đơn hàng"
                  bordered={false}
                  style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                  styles={{ body: { flexGrow: 1 } }}
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
                  <Descriptions bordered layout="vertical" size="middle">
                    <Descriptions.Item label="Mã đơn hàng" span={1}>
                      #{selectedOrder.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo" span={1}>
                      {dayjs(selectedOrder.creationDate).format("DD/MM/YYYY HH:mm")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái" span={1}>
                      <Tag color={getStatusColor(selectedOrder.status)} style={{ fontWeight: 'bold' }}>
                        {getStatusText(selectedOrder.status)}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại dịch vụ" span={1}>
                      {selectedOrder.serviceType === "UsingDesignIdea"
                        ? "Sử dụng mẫu thiết kế"
                        : "Thiết kế theo yêu cầu"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Diện tích (ước tính)" span={1}>
                      {selectedOrder.length && selectedOrder.width ? `${selectedOrder.length * selectedOrder.width} m²` : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá thiết kế" span={1}>
                      {selectedOrder.designPrice != null ? `${selectedOrder.designPrice.toLocaleString("vi-VN")} đ` : 'Chưa xác định'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá vật liệu (ước tính)" span={1}>
                      {selectedOrder.materialPrice != null ? `${selectedOrder.materialPrice.toLocaleString("vi-VN")} đ` : 'Chưa xác định'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng chi phí (ước tính)" span={1}>
                      <strong style={{ color: "#1890ff", fontSize: '1.1em' }}>
                        {selectedOrder.totalCost != null ? `${selectedOrder.totalCost.toLocaleString("vi-VN")} đ` : 'Chưa xác định'}
                      </strong>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Splitter.Panel>

              <Splitter.Panel>
                <Card title="Thông tin khách hàng" bordered={false} style={{ width: '100%', display: 'flex', flexDirection: 'column' }} styles={{ body: { flexGrow: 1 } }}>
                  <Descriptions bordered layout="horizontal" column={1}>
                    <Descriptions.Item
                      label={
                        <Space>
                          <UserOutlined />
                          Họ tên
                        </Space>
                      }
                    >
                      {selectedOrder.userName || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Space>
                          <PhoneOutlined />
                          Số điện thoại
                        </Space>
                      }
                    >
                      {selectedOrder.cusPhone || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Space>
                          <MailOutlined />
                          Email
                        </Space>
                      }
                    >
                      {selectedOrder.email || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Space>
                          <HomeOutlined />
                          Địa chỉ
                        </Space>
                      }
                    >
                      {selectedOrder.address ? selectedOrder.address.replace(/\|/g, ', ') : 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Splitter.Panel>
            </Splitter>
          </Col>

          <Col span={24}>
            <Card title="Hình ảnh phác thảo/thiết kế">
              {selectedOrder.image && (selectedOrder.image.imageUrl || selectedOrder.image.image2 || selectedOrder.image.image3) ? (
                <Space size="large" wrap>
                  {selectedOrder.image?.imageUrl && (
                    <Image
                      src={selectedOrder.image.imageUrl}
                      alt="Hình ảnh 1"
                      width={200}
                      height={200}
                      style={{ objectFit: "cover", borderRadius: '8px' }}
                    />
                  )}
                  {selectedOrder.image?.image2 && (
                    <Image
                      src={selectedOrder.image.image2}
                      alt="Hình ảnh 2"
                      width={200}
                      height={200}
                      style={{ objectFit: "cover", borderRadius: '8px' }}
                    />
                  )}
                  {selectedOrder.image?.image3 && (
                    <Image
                      src={selectedOrder.image.image3}
                      alt="Hình ảnh 3"
                      width={200}
                      height={200}
                      style={{ objectFit: "cover", borderRadius: '8px' }}
                    />
                  )}
                </Space>
              ) : (
                <Empty description="Không có hình ảnh" />
              )}
            </Card>
          </Col>

          {selectedOrder.reportAccoutant && (
            <Col span={24}>
              <Card
                title={
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span>Yêu cầu vật liệu từ NTK</span>
                    {selectedOrder?.status === "DeterminingMaterialPrice" && (
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={showCreateProductModal}
                        size="small"
                      >
                        Thêm vật liệu mới vào hệ thống
                      </Button>
                    )}
                  </Space>
                }
              >
                <div
                  dangerouslySetInnerHTML={{ __html: selectedOrder.reportAccoutant }}
                  style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px', border: '1px solid #e8e8e8' }}
                />
              </Card>
            </Col>
          )}

          <Col span={24}>
            <Card
              title={
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>Chi tiết vật liệu</span>
                  {(selectedOrder?.status === "DeterminingMaterialPrice" || selectedOrder?.status === "AssignToDesigner") && (
                    <Button
                      type="default"
                      icon={<EditOutlined />}
                      onClick={showProductCustomizeModal}
                      size="small"
                    >
                      Tùy chỉnh danh sách vật liệu
                    </Button>
                  )}
                </Space>
              }
            >
              <Table
                columns={columns}
                dataSource={orderDetails}
                rowKey="productId"
                pagination={false}
                summary={() => (
                  <Table.Summary.Row style={{ background: '#fafafa' }}>
                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                      <strong>Tổng giá vật liệu:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong style={{ color: '#f5222d' }}>{totalMaterialPrice.toLocaleString("vi-VN")} đ</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                locale={{ emptyText: <Empty description="Chưa có vật liệu nào được chọn cho đơn hàng này." /> }}
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
            initialValues={{ designPrice: selectedOrder?.designPrice }}
          >
            <Form.Item
              name="designPrice"
              label="Giá thiết kế (VNĐ)"
              rules={[
                { required: true, message: "Vui lòng nhập giá thiết kế" },
                { type: "number", min: 0, message: "Giá thiết kế phải là số không âm" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                placeholder="Nhập giá thiết kế"
              />
            </Form.Item>
            <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
              <Space>
                <Button onClick={handleCancel}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Xác nhận giá & Chờ đặt cọc
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <CreateProductModal
          visible={isCreateProductModalVisible}
          onCancel={handleCancelCreateProductModal}
          onSubmit={handleCreateProduct}
          form={createProductForm}
          categories={categories}
          isLoading={isProductLoading}
        />

        <Modal
          title="Tùy chỉnh danh sách sản phẩm"
          open={isProductCustomizeModalVisible}
          onOk={handleSaveCustomizedProducts}
          onCancel={handleCancelProductCustomizeModal}
          confirmLoading={customizeModalLoading}
          width={1200}
          okText="Lưu thay đổi"
          cancelText="Hủy"
        >
          <Spin spinning={!products.length || !categories.length} tip="Đang tải dữ liệu sản phẩm...">
            <div style={{ display: 'flex', maxHeight: '60vh', overflow: 'hidden' }}>
              <div style={{ width: '50%', paddingRight: '8px', display: 'flex', flexDirection: 'column' }}>
                <Title level={5}>Sản phẩm có sẵn</Title>
                <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px', padding: '8px', overflowY: 'auto', flexGrow: 1, scrollbarWidth: 'thin', scrollbarColor: '#aaa transparent' }}>
                  <Tree
                    checkable
                    checkedKeys={tempServiceOrderDetails.map(item => item.productId)}
                    onCheck={handleProductCheck}
                    treeData={(categories || []).map(category => ({
                      key: category.id,
                      title: <span style={{ fontWeight: 'bold' }}>{category.name}</span>,
                      selectable: false,
                      children: products
                        .filter(product => product.categoryId === category.id)
                        .map(product => {
                          // Tính xem có phải hàng mới (24h)
                          const isNew = dayjs().diff(dayjs(product.creationDate), 'hour') < 24;
                          return {
                            key: product.id,
                            title: (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '6px 0px',
                                  borderRadius: 4,
                                  transition: 'background 0.2s',
                                }}
                                // hiệu ứng hover nhẹ
                                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                {/* 1. Ảnh */}
                                <Image
                                  src={product.image?.imageUrl || '/placeholder.png'}
                                  width={36}
                                  height={36}
                                  style={{
                                    objectFit: "cover",
                                    borderRadius: 4,
                                    marginRight: 12
                                  }}
                                  preview={false}
                                />
                        
                                {/* 2. Tên & Giá */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 12 }}>
                                  <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2 }}>
                                    {product.name}
                                  </span>
                                  <span style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                                    {product.price?.toLocaleString("vi-VN")} đ
                                  </span>
                                </div>
                        
                                {/* 3. Tag “Mới” */}
                                {isNew && (
                                  <Tag
                                    color="green"
                                    style={{
                                      marginLeft: 8,
                                      fontSize: 10,
                                      padding: '0 4px',
                                      lineHeight: '16px',
                                    }}
                                  >
                                    Mới
                                  </Tag>
                                )}
                              </div>
                            ),
                            isLeaf: true,
                          };
                        }),
                      // .map(product => ({
                      //   key: product.id,
                      //   title: (
                      //     <div style={{ display: 'flex', alignItems: 'center', padding: '2px 0' }}>
                      //       <Image
                      //         src={product.image?.imageUrl || '/placeholder.png'}
                      //         alt={product.name}
                      //         width={32}
                      //         height={32}
                      //         style={{ objectFit: "cover", borderRadius: "4px", marginRight: "8px" }}
                      //         preview={false}
                      //       />
                      //       <div>
                      //         <div style={{ fontSize: '13px' }}>{product.name}</div>
                      //         <div style={{ fontSize: '11px', color: '#888' }}>{product.price?.toLocaleString("vi-VN")} đ</div>
                      //       </div>
                      //     </div>
                      //   ),
                      //   isLeaf: true,
                      // })),
                    }))}
                    showLine={{ showLeafIcon: false }}
                    defaultExpandAll
                  />
                </div>
              </div>

              <div style={{ width: '50%', paddingLeft: '8px', display: 'flex', flexDirection: 'column' }}>
                <Title level={5}>Sản phẩm đã chọn cho đơn hàng</Title>
                <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px', overflowY: 'auto', flexGrow: 1, scrollbarWidth: 'thin', scrollbarColor: '#aaa transparent' }}>
                  {tempServiceOrderDetails.length > 0 ? (
                    <Table
                      dataSource={tempServiceOrderDetails.map((item) => {
                        const product = products.find(p => p.id === item.productId);
                        return {
                          key: item.productId,
                          productId: item.productId,
                          productName: product ? product.name : "Sản phẩm không tồn tại",
                          productImage: product?.image?.imageUrl,
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
                            return (
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Image
                                  src={record.productImage || '/placeholder.png'}
                                  alt={record.productName}
                                  width={40}
                                  height={40}
                                  style={{ objectFit: "cover", borderRadius: "4px", marginRight: "8px" }}
                                />
                                <span style={{ fontSize: '13px', marginLeft: 12 }}>{record.productName}</span>
                              </div>
                            );
                          },
                        },
                        {
                          title: "Đơn giá",
                          dataIndex: "productPrice",
                          key: "productPrice",
                          align: 'right',
                          render: (price) => price ? price.toLocaleString("vi-VN") + " đ" : "0 đ",
                        },
                        {
                          title: "SL",
                          dataIndex: "quantity",
                          key: "quantity",
                          width: 90,
                          align: 'center',
                          render: (_, record) => (
                            <InputNumber
                              min={1}
                              value={record.quantity}
                              onChange={(value) => handleUpdateQuantity(record.productId, value)}
                              style={{ width: 60 }}
                              size="small"
                            />
                          ),
                        },
                        {
                          title: "Thành tiền",
                          key: "totalPrice",
                          align: 'right',
                          render: (_, record) => {
                            const price = record.productPrice || 0;
                            return (
                              <span style={{ fontWeight: 'bold', fontSize: '13px' }}>
                                {(price * record.quantity).toLocaleString("vi-VN")} đ
                              </span>
                            );
                          },
                        },
                        {
                          title: "Xóa",
                          key: "action",
                          width: 60,
                          align: 'center',
                          render: (_, record) => (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveProduct(record.productId)}
                              size="small"
                            />
                          ),
                        },
                      ]}
                      pagination={false}
                      size="small"
                      showHeader
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', flexDirection: 'column', padding: '20px' }}>
                      <ShoppingOutlined style={{ fontSize: 32, marginBottom: '10px' }} />
                      <p>Chọn sản phẩm từ danh sách bên trái.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Spin>
        </Modal>

      </div>
    </Spin>
  );
};

export default ServiceOrderDetail; 