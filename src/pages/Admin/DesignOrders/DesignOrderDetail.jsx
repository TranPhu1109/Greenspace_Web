import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Descriptions, 
  Button, 
  Space, 
  Tabs, 
  Image, 
  Timeline, 
  Form, 
  Input, 
  Select, 
  InputNumber,
  Upload,
  message,
  Divider,
  Modal
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  EditOutlined, 
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import './DesignOrderDetail.scss';
import { designOrdersData } from './data/designOrdersData';
import StatusTag from './components/StatusTag';
import CustomerInfo from './components/CustomerInfo';
import DesignRequirements from './components/DesignRequirements';
import PriceAdjustment from './components/PriceAdjustment';
import DesignImages from './components/DesignImages';
import DesignHistory from './components/DesignHistory';
import PaymentStatusTag from './components/PaymentStatusTag';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

const DesignOrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [priceAdjustments, setPriceAdjustments] = useState([]);
  const [designHistory, setDesignHistory] = useState([]);
  
  // Lấy dữ liệu đơn hàng
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Giả lập API call
        const order = designOrdersData.find(order => order.id === id);
        
        if (!order) {
          message.error('Không tìm thấy đơn hàng');
          navigate('/admin/design-orders');
          return;
        }
        
        setOrderData(order);
        
        // Giả lập dữ liệu điều chỉnh giá
        setPriceAdjustments([
          {
            id: '1',
            date: '18/01/2023',
            amount: 500000,
            reason: 'Thêm yêu cầu về vật liệu cao cấp',
            createdBy: 'Trần Thị B'
          },
          {
            id: '2',
            date: '19/01/2023',
            amount: -200000,
            reason: 'Giảm diện tích thiết kế',
            createdBy: 'Nguyễn Văn A'
          }
        ]);
        
        // Giả lập lịch sử thiết kế
        setDesignHistory([
          {
            id: '1',
            date: '16/01/2023',
            action: 'Tạo đơn hàng',
            user: 'Nguyễn Văn A',
            notes: 'Đơn hàng mới được tạo'
          },
          {
            id: '2',
            date: '17/01/2023',
            action: 'Phân công designer',
            user: 'Admin',
            notes: 'Phân công cho Trần Thị B'
          },
          {
            id: '3',
            date: '18/01/2023',
            action: 'Cập nhật yêu cầu',
            user: 'Nguyễn Văn A',
            notes: 'Thêm yêu cầu về vật liệu cao cấp'
          },
          {
            id: '4',
            date: '19/01/2023',
            action: 'Điều chỉnh giá',
            user: 'Trần Thị B',
            notes: 'Điều chỉnh giá do thay đổi yêu cầu'
          },
          {
            id: '5',
            date: '20/01/2023',
            action: 'Hoàn thành thiết kế',
            user: 'Trần Thị B',
            notes: 'Thiết kế đã hoàn thành và gửi cho khách hàng'
          }
        ]);
        
        // Cập nhật form
        form.setFieldsValue({
          status: order.status,
          designer: order.designer,
          description: order.description,
          requirements: order.requirements,
          area: order.area,
          totalPrice: order.totalPrice
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order data:', error);
        message.error('Không thể tải dữ liệu đơn hàng');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, form, navigate]);
  
  // Xử lý khi chuyển tab
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // Xử lý khi bật/tắt chế độ chỉnh sửa
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  // Xử lý khi lưu thông tin
  const handleSave = () => {
    form.validateFields().then(values => {
      // Trong thực tế, đây sẽ là một API call để cập nhật dữ liệu
      setOrderData({
        ...orderData,
        status: values.status,
        designer: values.designer,
        description: values.description,
        requirements: values.requirements,
        area: values.area,
        totalPrice: values.totalPrice
      });
      
      message.success('Cập nhật thông tin thành công');
      setIsEditing(false);
    });
  };
  
  // Xử lý khi thêm điều chỉnh giá
  const handleAddPriceAdjustment = (adjustment) => {
    // Trong thực tế, đây sẽ là một API call để thêm điều chỉnh giá
    const newAdjustment = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('vi-VN'),
      ...adjustment
    };
    
    setPriceAdjustments([...priceAdjustments, newAdjustment]);
    
    // Cập nhật tổng giá
    const newTotalPrice = orderData.totalPrice + adjustment.amount;
    setOrderData({
      ...orderData,
      totalPrice: newTotalPrice
    });
    form.setFieldsValue({ totalPrice: newTotalPrice });
    
    message.success('Thêm điều chỉnh giá thành công');
  };
  
  // Xử lý khi xóa điều chỉnh giá
  const handleDeletePriceAdjustment = (adjustmentId) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa điều chỉnh giá này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác',
      onOk() {
        const adjustment = priceAdjustments.find(adj => adj.id === adjustmentId);
        const newAdjustments = priceAdjustments.filter(adj => adj.id !== adjustmentId);
        
        setPriceAdjustments(newAdjustments);
        
        // Cập nhật tổng giá
        const newTotalPrice = orderData.totalPrice - adjustment.amount;
        setOrderData({
          ...orderData,
          totalPrice: newTotalPrice
        });
        form.setFieldsValue({ totalPrice: newTotalPrice });
        
        message.success('Xóa điều chỉnh giá thành công');
      }
    });
  };
  
  // Xử lý khi thêm lịch sử
  const handleAddHistory = (historyItem) => {
    // Trong thực tế, đây sẽ là một API call để thêm lịch sử
    const newHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('vi-VN'),
      ...historyItem
    };
    
    setDesignHistory([...designHistory, newHistoryItem]);
    message.success('Thêm lịch sử thành công');
  };
  
  if (loading) {
    return <div>Đang tải...</div>;
  }
  
  if (!orderData) {
    return <div>Không tìm thấy đơn hàng</div>;
  }
  
  return (
    <div className="design-order-detail-container">
      <Card className="mb-4">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/design-orders')}
              >
                Quay lại
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                Chi tiết đơn đặt thiết kế #{orderData.orderNumber}
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              {isEditing ? (
                <>
                  <Button onClick={toggleEdit}>Hủy</Button>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    onClick={handleSave}
                  >
                    Lưu
                  </Button>
                </>
              ) : (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={toggleEdit}
                >
                  Chỉnh sửa
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
      
      <Form
        form={form}
        layout="vertical"
        disabled={!isEditing}
      >
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Card className="mb-4">
              <Tabs activeKey={activeTab} onChange={handleTabChange}>
                <TabPane tab="Thông tin đơn hàng" key="1">
                  <Row gutter={16}>
                    <Col span={24}>
                      <Descriptions 
                        title="Thông tin cơ bản" 
                        bordered 
                        column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                      >
                        <Descriptions.Item label="Mã đơn hàng">
                          {orderData.orderNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày đặt">
                          {orderData.orderDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <Form.Item name="status" noStyle>
                            {isEditing ? (
                              <Select style={{ width: '100%' }}>
                                <Option value="pending">Chờ xử lý</Option>
                                <Option value="processing">Đang xử lý</Option>
                                <Option value="designing">Đang thiết kế</Option>
                                <Option value="reviewing">Đang xem xét</Option>
                                <Option value="completed">Hoàn thành</Option>
                                <Option value="cancelled">Đã hủy</Option>
                              </Select>
                            ) : (
                              <StatusTag status={orderData.status} />
                            )}
                          </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Người thiết kế">
                          <Form.Item name="designer" noStyle>
                            {isEditing ? (
                              <Select style={{ width: '100%' }} allowClear>
                                <Option value="Nguyễn Văn A">Nguyễn Văn A</Option>
                                <Option value="Trần Thị B">Trần Thị B</Option>
                                <Option value="Lê Văn C">Lê Văn C</Option>
                              </Select>
                            ) : (
                              orderData.designer || 'Chưa phân công'
                            )}
                          </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Diện tích">
                          <Form.Item name="area" noStyle>
                            {isEditing ? (
                              <InputNumber 
                                addonAfter="m²" 
                                style={{ width: '100%' }} 
                                min={1}
                              />
                            ) : (
                              `${orderData.area} m²`
                            )}
                          </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng giá trị">
                          <Form.Item name="totalPrice" noStyle>
                            {isEditing ? (
                              <InputNumber 
                                addonAfter="VND" 
                                style={{ width: '100%' }} 
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                min={0}
                              />
                            ) : (
                              <Text strong style={{ color: '#4caf50' }}>
                                {orderData.totalPrice.toLocaleString('vi-VN')} VND
                              </Text>
                            )}
                          </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số lần chỉnh sửa" span={2}>
                          {orderData.revisions}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cập nhật lần cuối" span={2}>
                          {orderData.lastUpdated}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái đặt cọc">
                          <PaymentStatusTag 
                            type="deposit"
                            status={orderData.depositStatus}
                            amount={orderData.depositAmount}
                            total={orderData.totalPrice}
                          />
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái thanh toán">
                          <PaymentStatusTag 
                            type="payment"
                            status={orderData.paymentStatus}
                            amount={orderData.paymentHistory?.reduce((sum, payment) => sum + payment.amount, 0)}
                            total={orderData.totalPrice}
                          />
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                  </Row>
                  
                  <Divider />
                  
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item 
                        label="Mô tả" 
                        name="description"
                      >
                        {isEditing ? (
                          <TextArea rows={4} />
                        ) : (
                          <div className="description-text">{orderData.description}</div>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item 
                        label="Yêu cầu thiết kế" 
                        name="requirements"
                      >
                        {isEditing ? (
                          <TextArea rows={6} />
                        ) : (
                          <div className="requirements-text">{orderData.requirements}</div>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </TabPane>
                
                <TabPane tab="Thông tin khách hàng" key="2">
                  <CustomerInfo customer={orderData} />
                </TabPane>
                
                <TabPane tab="Điều chỉnh giá" key="3">
                  <PriceAdjustment 
                    adjustments={priceAdjustments} 
                    onAdd={handleAddPriceAdjustment}
                    onDelete={handleDeletePriceAdjustment}
                    totalPrice={orderData.totalPrice}
                  />
                </TabPane>
                
                <TabPane tab="Hình ảnh" key="4">
                  <DesignImages images={orderData.images} />
                </TabPane>
                
                <TabPane tab="Lịch sử" key="5">
                  <DesignHistory 
                    history={designHistory} 
                    onAdd={handleAddHistory}
                  />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card title="Tóm tắt đơn hàng" className="order-summary-card">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Mã đơn hàng">
                  {orderData.orderNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Khách hàng">
                  {orderData.customerName}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <StatusTag status={orderData.status} />
                </Descriptions.Item>
                <Descriptions.Item label="Diện tích">
                  {orderData.area} m²
                </Descriptions.Item>
                <Descriptions.Item label="Tổng giá trị">
                  <Text strong style={{ color: '#4caf50' }}>
                    {orderData.totalPrice.toLocaleString('vi-VN')} VND
                  </Text>
                </Descriptions.Item>
              </Descriptions>
              
              <Divider />
              
              <div className="action-buttons">
                <Button type="primary" block className="mb-2">
                  Cập nhật trạng thái
                </Button>
                <Button block className="mb-2">
                  Liên hệ khách hàng
                </Button>
                <Button danger block>
                  Hủy đơn hàng
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default DesignOrderDetail; 