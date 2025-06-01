import React, { useState, useEffect } from 'react';
import { Drawer, Typography, Space, Button, Descriptions, Tag, Badge, Divider, Timeline, Modal, message, Spin, Select, Form, Input } from 'antd';
import { UserOutlined, FileTextOutlined, ClockCircleOutlined, EditOutlined, ExclamationCircleOutlined, CheckOutlined, ShoppingOutlined, HomeOutlined, MailOutlined, PhoneOutlined, DollarOutlined } from '@ant-design/icons';
import moment from 'moment';
import useScheduleStore from '@/stores/useScheduleStore';
import useServiceOrderStore from '@/stores/useServiceOrderStore';
import useDesignOrderStore from '@/stores/useDesignOrderStore';
import useProductStore from '@/stores/useProductStore';
import './styles/TaskDetailDrawer.scss';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TextArea } = Input;

const TaskDetailDrawer = ({ visible, task, onClose, designers }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [orderDetail, setOrderDetail] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Get functions from stores
  const { updateTask, deleteTask } = useScheduleStore();
  const { getServiceOrdersNoIdea } = useServiceOrderStore();
  const { getDesignOrderById, getServiceOrdersUsingIdea } = useDesignOrderStore();
  const { fetchProducts } = useProductStore();

  // Fetch product data
  useEffect(() => {
    const loadProducts = async () => {
      if (visible) {
        try {
          setProductsLoading(true);
          const productData = await fetchProducts();
          setProducts(productData);
        } catch (error) {
          console.error("Error fetching products:", error);
        } finally {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();
  }, [visible, fetchProducts]);

  // Fetch order details when drawer is opened
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (visible && task && task.serviceOrderId) {
        try {
          setOrderLoading(true);

          // First, try to fetch as NoIdea order
          const noIdeaOrders = await getServiceOrdersNoIdea();
          let foundOrder = noIdeaOrders.find(order => order.id === task.serviceOrderId);

          // If not found, try to fetch as UsingIdea order
          if (!foundOrder) {
            const usingIdeaOrders = await getServiceOrdersUsingIdea();
            foundOrder = usingIdeaOrders.find(order => order.id === task.serviceOrderId);
          }

          // If still not found, try to fetch by ID directly
          if (!foundOrder) {
            try {
              foundOrder = await getDesignOrderById(task.serviceOrderId);
            } catch (error) {
              console.error("Error fetching by ID:", error);
            }
          }

          if (foundOrder) {
            setOrderDetail(foundOrder);
          }
        } catch (error) {
          console.error("Error fetching order details:", error);
        } finally {
          setOrderLoading(false);
        }
      }
    };

    fetchOrderDetails();
  }, [visible, task, getServiceOrdersNoIdea, getServiceOrdersUsingIdea, getDesignOrderById]);

  // Status options for the task
  const statusOptions = [
    { value: 0, label: 'Tư vấn & phác thảo', color: 'blue' },
    { value: 1, label: 'Đã phác thảo', color: 'cyan' },
    { value: 2, label: 'Thiết kế', color: 'purple' },
    { value: 3, label: 'Đã thiết kế', color: 'green' },
    { value: 'ConsultingAndSket', label: 'Tư vấn & phác thảo', color: 'blue' },
    { value: 'DoneConsulting', label: 'Đã phác thảo', color: 'cyan' },
    { value: 'Design', label: 'Thiết kế', color: 'purple' },
    { value: 'DoneDesign', label: 'Đã thiết kế', color: 'green' },
  ];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'Chưa cập nhật';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  // Get status display info
  const getStatusInfo = (status) => {
    const statusMap = {
      0: { text: 'Tư vấn & phác thảo', color: 'blue', status: 'processing' },
      1: { text: 'Đã phác thảo', color: 'cyan', status: 'success' },
      2: { text: 'Thiết kế', color: 'purple', status: 'processing' },
      3: { text: 'Đã thiết kế', color: 'green', status: 'success' },
      'ConsultingAndSket': { text: 'Tư vấn & phác thảo', color: 'blue', status: 'processing' },
      'DoneConsulting': { text: 'Đã phác thảo', color: 'cyan', status: 'success' },
      'Design': { text: 'Thiết kế', color: 'purple', status: 'processing' },
      'DoneDesign': { text: 'Đã thiết kế', color: 'green', status: 'success' },
    };
    return statusMap[status] || { text: `Trạng thái #${status}`, color: 'default', status: 'default' };
  };

  // Get service order status display
  const getOrderStatusDisplay = (status) => {
    const statusMap = {
      'Pending': { text: 'Chờ xử lý', color: 'gold' },
      'ConsultingAndSketching': { text: 'Tư vấn & phác thảo', color: 'blue' },
      'ReConsultingAndSketching': { text: 'Phác thảo lại', color: 'blue' },
      'DeterminingDesignPrice': { text: 'Xác định giá thiết kế', color: 'purple' },
      'DoneDeterminingDesignPrice': { text: 'Đã xác định giá thiết kế', color: 'purple' },
      'ReDeterminingDesignPrice': { text: 'Xác định lại giá thiết kế', color: 'purple' },
      'DesignPriceConfirm': { text: 'Quản lý xác nhận giá thiết kế', color: 'purple' },
      'WaitDeposit': { text: 'Chờ đặt cọc', color: 'warning' },
      'DepositSuccessful': { text: 'Đặt cọc thành công', color: 'green' },
      'AssignToDesigner': { text: 'Giao cho Designer', color: 'geekblue' },
      'ReDesign': { text: 'Thiết kế lại', color: 'volcano' },
      'DoneDesign': { text: 'Hoàn thành thiết kế', color: 'cyan' },
      'DeterminingMaterialPrice': { text: 'Xác định giá vật liệu', color: 'magenta' },
      'DoneDeterminingMaterialPrice': { text: 'Đã xác định giá vật liệu', color: 'magenta' },
      'ReDetermineMaterialPrice': { text: 'Xác định lại giá vật liệu', color: 'magenta' },
      'MaterialPriceConfirmed': { text: 'Đã xác nhận giá vật liệu', color: 'purple' },
      'PaymentSuccess': { text: 'Thanh toán thành công', color: 'green' },
      'Processing': { text: 'Đang xử lý', color: 'blue' },
      'PickedPackageAndDelivery': { text: 'Đang giao hàng', color: 'cyan' },
      'DeliveryFail': { text: 'Giao hàng thất bại', color: 'red' },
      'ReDelivery': { text: 'Giao lại', color: 'orange' },
      'DeliveredSuccessfully': { text: 'Đã giao hàng', color: 'green' },
      'Installing': { text: 'Đang lắp đặt', color: 'geekblue' },
      'DoneInstalling': { text: 'Đã lắp đặt xong', color: 'cyan' },
      'ReInstall': { text: 'Lắp đặt lại', color: 'orange' },
      'CustomerConfirm': { text: 'Khách hàng xác nhận', color: 'green' },
      'Successfully': { text: 'Thành công', color: 'green' },
      'CompleteOrder': { text: 'Hoàn thành đơn hàng', color: 'success' },
      'ExchangeProdcut': { text: 'Đổi sản phẩm', color: 'volcano' },
      'WaitForScheduling': { text: 'Chờ lên lịch lắp đặt', color: 'gold' },
      'Refund': { text: 'Đang hoàn tiền', color: 'red' },
      'DoneRefund': { text: 'Hoàn tiền xong', color: 'green' },
      'StopService': { text: 'Ngưng dịch vụ', color: 'error' },
      'OrderCancelled': { text: 'Đã hủy', color: 'error' },
    };

    return statusMap[status] || { text: status, color: 'default' };
  };


  // Handle edit task button click
  const handleEdit = () => {
    form.setFieldsValue({
      userId: task.userId,
      status: task.status,
      note: task.note
    });
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    form.resetFields();
  };

  // Save task updates
  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      setIsLoading(true);

      // Create update data
      const updateData = {
        userId: values.userId,
        status: values.status,
        note: values.note
      };

      await updateTask(task.id, updateData);

      message.success('Cập nhật thành công!');
      setIsEditing(false);
      onClose(true); // close with refresh
    } catch (error) {
      if (error.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin nhập vào');
      } else {
        message.error('Không thể cập nhật: ' + (error.message || 'Lỗi không xác định'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task deletion
  const handleDelete = () => {
    confirm({
      title: 'Xác nhận xóa task',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa task này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setIsLoading(true);
          await deleteTask(task.id);
          message.success('Đã xóa task thành công!');
          onClose(true); // close with refresh
        } catch (error) {
          message.error('Không thể xóa task: ' + (error.message || 'Lỗi không xác định'));
          setIsLoading(false);
        }
      },
    });
  };

  // Get designer name from their ID
  const getDesignerName = (userId) => {
    const designer = designers.find(d => d.id === userId);
    return designer ? designer.name : task.userName || 'Chưa xác định';
  };

  // Format dimensions
  const formatDimensions = (length, width) => {
    if (!length || !width) return 'Không có thông tin kích thước';
    return `${length} x ${width} m² (${length * width} m²)`;
  };

  // Get product name by ID
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Sản phẩm #' + productId.substring(0, 8);
  };

  return (
    <Drawer
      title={
        <Space>
          <FileTextOutlined />
          <span>Chi tiết công việc</span>
        </Space>
      }
      width={600}
      open={visible}
      onClose={() => onClose(false)}
      className="task-detail-drawer"
      footer={
        <div className="drawer-footer">
          <Space>
            <Button onClick={() => onClose(false)}>Đóng</Button>
            {!isEditing && (
              <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                Chỉnh sửa
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <Spin spinning={isLoading || orderLoading || productsLoading}>
        {isEditing ? (
          <div className="edit-form">
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="userId"
                label="Designer"
                rules={[{ required: true, message: 'Vui lòng chọn designer' }]}
              >
                <Select placeholder="Chọn designer...">
                  {designers.map(designer => (
                    <Option key={designer.id} value={designer.id}>
                      <Space>
                        <UserOutlined />
                        {designer.name}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái...">
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      <Tag color={option.color}>{option.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="note"
                label="Ghi chú"
              >
                <TextArea rows={4} placeholder="Nhập ghi chú..." />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button onClick={handleCancelEdit}>Hủy</Button>
                  <Button type="primary" onClick={handleSaveEdit} icon={<CheckOutlined />}>
                    Lưu thay đổi
                  </Button>
                  <Button type="danger" onClick={handleDelete} style={{ marginLeft: 'auto' }}>
                    Xóa task
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <div className="task-details">
            <div className="task-header">
              <Title level={4}>{task?.id}</Title>
              <Space align="center">
                <Badge status={getStatusInfo(task?.status).status} />
                <Tag color={getStatusInfo(task?.status).color}>
                  {getStatusInfo(task?.status).text}
                </Tag>
              </Space>
            </div>

            <Descriptions bordered column={1} className="task-description">
              <Descriptions.Item label="Designer">
                <Space>
                  <UserOutlined />
                  {getDesignerName(task?.userId)}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Đơn hàng">
                {task?.serviceOrderId ? (
                  <Text copyable>
                    {task.serviceOrderId}
                  </Text>
                ) : (
                  <Text type="secondary">Không có đơn hàng</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo">
                <Space>
                  <ClockCircleOutlined />
                  {formatDate(task?.creationDate)}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Lần cập nhật cuối">
                <Space>
                  <ClockCircleOutlined />
                  {formatDate(task?.modificationDate)}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Ghi chú">
                {task?.note ? (
                  <Paragraph>{task.note}</Paragraph>
                ) : (
                  <Text type="secondary">Chưa có ghi chú</Text>
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* Order details section */}
            {orderDetail && (
              <>
                <Divider orientation="left">Thông tin đơn hàng</Divider>
                <Descriptions bordered column={1} className="order-description">
                  <Descriptions.Item label="Mã đơn hàng">
                    <Text copyable>{orderDetail.id}</Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Trạng thái đơn">
                    <Tag color={getOrderStatusDisplay(orderDetail.status).color}>
                      {getOrderStatusDisplay(orderDetail.status).text}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Loại đơn hàng">
                    <Tag color={orderDetail.isCustom ? 'cyan' : 'purple'}>
                      {orderDetail.serviceType === 'NoDesignIdea'
                        ? 'Thiết kế riêng'
                        : 'Sử dụng mẫu có sẵn'}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Ngày tạo đơn">
                    {formatDate(orderDetail.creationDate)}
                  </Descriptions.Item>

                  {(orderDetail.length > 0 || orderDetail.width > 0) && (
                    <Descriptions.Item label="Diện tích yêu cầu">
                      {formatDimensions(orderDetail.length, orderDetail.width)}
                    </Descriptions.Item>
                  )}

                  <Descriptions.Item label="Khách hàng">
                    <Space direction="vertical" size="small">
                      <Space>
                        <UserOutlined />
                        {orderDetail.userName || 'Chưa có thông tin'}
                      </Space>
                      <Space>
                        <PhoneOutlined />
                        {orderDetail.cusPhone || 'Chưa có số điện thoại'}
                      </Space>
                      <Space>
                        <MailOutlined />
                        {orderDetail.email || 'Chưa có email'}
                      </Space>
                      {orderDetail.address && (
                        <Space>
                          <HomeOutlined />
                          {orderDetail.address?.split('|').join(', ')}
                        </Space>
                      )}
                    </Space>
                  </Descriptions.Item>

                  <Descriptions.Item label="Thông tin giá">
                    <Space direction="vertical" size="small">
                      <Space>
                        <DollarOutlined />
                        <span>Giá thiết kế: </span>
                        <Text strong>{formatCurrency(orderDetail.designPrice)}</Text>
                      </Space>
                      <Space>
                        <ShoppingOutlined />
                        <span>Giá vật liệu: </span>
                        <Text strong>{formatCurrency(orderDetail.materialPrice)}</Text>
                      </Space>
                      <Divider style={{ margin: '8px 0' }} />
                      <Space>
                        <DollarOutlined />
                        <span>Tổng giá trị: </span>
                        <Text strong type="success">
                          {formatCurrency((orderDetail.designPrice || 0) + (orderDetail.materialPrice || 0))}
                        </Text>
                      </Space>
                    </Space>
                  </Descriptions.Item>

                  {orderDetail.serviceOrderDetails && orderDetail.serviceOrderDetails.length > 0 && (
                    <Descriptions.Item label="Vật liệu có sẵn">
                      <div
                        style={{
                          maxHeight: '400px',
                          overflow: 'auto',
                          padding: '12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          backgroundColor: '#f9f9f9',
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#888 #f1f1f1',
                        }}
                      >
                        {orderDetail.serviceOrderDetails.map((detail, index) => {
                          const product = products.find(product => product.id === detail.productId);
                          const productImage = product?.image?.imageUrl;
                          const productName = product?.name || `Sản phẩm ${index + 1}`;
                          const totalPrice = detail.quantity * detail.price;

                          return (
                            <div
                              key={index}
                              style={{
                                marginBottom: '24px',
                                padding: '16px',
                                border: '1px solid #dcdcdc',
                                borderRadius: '6px',
                                backgroundColor: '#ffffff',
                              }}
                            >
                              {/* Hình ảnh & thông tin */}
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {productImage && (
                                  <img
                                    src={productImage}
                                    alt={productName}
                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                                  />
                                )}
                                <div style={{ marginLeft: '16px', flex: 1 }}>
                                  <Text strong>{productName}</Text>
                                  <div>
                                    <Text>{detail.quantity} x {formatCurrency(detail.price)}</Text>
                                  </div>
                                  <div>
                                    <Text type="secondary">Tổng: {formatCurrency(totalPrice)}</Text>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Descriptions.Item>
                  )}


                  {orderDetail.externalProducts && orderDetail.externalProducts.length > 0 && (
                    <Descriptions.Item label="Vật liệu thêm mới">
                      <div
                        style={{
                          maxHeight: '400px',
                          overflow: 'auto',
                          padding: '12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          backgroundColor: '#f9f9f9',
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#888 #f1f1f1',
                        }}
                      >
                        {orderDetail.externalProducts.map((detail, index) => (
                          <div
                            key={index}
                            style={{
                              marginBottom: '24px',
                              padding: '16px',
                              border: '1px solid #dcdcdc',
                              borderRadius: '6px',
                              backgroundColor: '#ffffff',
                            }}
                          >
                            {/* Hình ảnh & thông tin chung */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {detail.imageURL && (
                                <img
                                  src={detail.imageURL}
                                  alt={detail.name}
                                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                                />
                              )}
                              <div style={{ marginLeft: '16px', flex: 1 }}>
                                <Text strong>{detail.name}</Text>
                                <div>
                                  <Text>{detail.quantity} x {formatCurrency(detail.price)}</Text>
                                </div>
                                <div>
                                  <Text type="secondary">Tổng: {formatCurrency(detail.totalPrice)}</Text>
                                </div>
                              </div>
                            </div>

                            {/* Mô tả HTML */}
                            {/* {detail.description && (
                              <div
                                style={{ marginTop: '12px', fontSize: '13px' }}
                                dangerouslySetInnerHTML={{ __html: detail.description }}
                                className="html-preview"
                              />
                            )} */}
                          </div>
                        ))}
                      </div>
                    </Descriptions.Item>
                  )}


                  {orderDetail.description && (
                    <Descriptions.Item label="Mô tả yêu cầu">
                      <div
                        className="html-preview"
                        style={{ maxHeight: '150px', overflow: 'auto', fontSize: '14px', scrollbarWidth: 'thin', scrollbarColor: '#888 #f1f1f1' }}
                        dangerouslySetInnerHTML={{ __html: orderDetail.description }}
                      />
                    </Descriptions.Item>
                  )}

                  {orderDetail.report && (
                    <Descriptions.Item label="Báo cáo tư vấn">
                      <div
                        className="html-preview"
                        style={{ maxHeight: '150px', overflow: 'auto', fontSize: '14px', scrollbarWidth: 'thin', scrollbarColor: '#888 #f1f1f1' }}
                        dangerouslySetInnerHTML={{ __html: orderDetail.report }}
                      />
                    </Descriptions.Item>
                  )}

                  {/* {orderDetail.deliveryCode && (
                    <Descriptions.Item label="Mã giao hàng">
                      <Text copyable>{orderDetail.deliveryCode}</Text>
                    </Descriptions.Item>
                  )} */}
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Spin>
    </Drawer>
  );
};

export default TaskDetailDrawer; 