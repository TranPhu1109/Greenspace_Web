import React from 'react';
import { 
  Card, 
  Descriptions, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Divider, 
  Typography, 
  Row, 
  Col 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  PrinterOutlined, 
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import './OrderDetail.scss';

const { Title, Text } = Typography;

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Dữ liệu mẫu cho chi tiết đơn hàng
  const orderData = {
    id: id || '1',
    orderNumber: 'ORD-2023-1234',
    customer: {
      name: 'Justin Septimus',
      email: 'example@email.com',
      phone: '0963202427',
      address: '528/21 Lê Văn Việt, Q9, TP.Hồ Chí Minh',
    },
    status: 'active',
    payment: {
      status: 'paid',
      method: 'Chuyển khoản ngân hàng',
      date: '28/2/2025',
    },
    orderDate: '28/2/2025',
    deliveryDate: '05/3/2025',
    items: [
      {
        key: '1',
        product: 'Gỗ',
        quantity: 1,
        price: '200.000',
        total: '200.000',
      },
      {
        key: '2',
        product: 'Cây xanh',
        quantity: 2,
        price: '250.000',
        total: '500.000',
      },
    ],
    subtotal: '700.000',
    shipping: '30.000',
    tax: '70.000',
    total: '800.000',
    notes: 'Giao hàng trong giờ hành chính',
  };

  // Cấu hình cột cho bảng sản phẩm
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: price => `${price} VND`,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      render: total => `${total} VND`,
    },
  ];

  // Render trạng thái thanh toán
  const renderPaymentStatus = (status) => {
    let color, icon, text;
    
    switch(status) {
      case 'paid':
        color = 'green';
        icon = <CheckCircleOutlined />;
        text = 'Đã thanh toán';
        break;
      case 'unpaid':
        color = 'gold';
        icon = <ClockCircleOutlined />;
        text = 'Chưa thanh toán';
        break;
      case 'overdue':
        color = 'red';
        icon = <CloseCircleOutlined />;
        text = 'Quá hạn';
        break;
      default:
        color = 'default';
        text = status;
    }
    
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  return (
    <div className="order-detail-container">
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/orders')}
            >
              Quay lại
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              Chi tiết đơn hàng #{orderData.orderNumber}
            </Title>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button icon={<PrinterOutlined />}>In</Button>
            <Button icon={<DownloadOutlined />}>Tải xuống</Button>
          </Space>
        </Col>
      </Row>
      
      <Card className="order-info-card">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Descriptions title="Thông tin khách hàng" bordered column={1}>
              <Descriptions.Item label="Tên">{orderData.customer.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{orderData.customer.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{orderData.customer.phone}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{orderData.customer.address}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={12}>
            <Descriptions title="Thông tin đơn hàng" bordered column={1}>
              <Descriptions.Item label="Mã đơn hàng">{orderData.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt hàng">{orderData.orderDate}</Descriptions.Item>
              <Descriptions.Item label="Ngày giao hàng dự kiến">{orderData.deliveryDate}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">
                {renderPaymentStatus(orderData.payment.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">{orderData.payment.method}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
        
        <Divider />
        
        <Title level={5}>Danh sách sản phẩm</Title>
        <Table 
          columns={columns} 
          dataSource={orderData.items} 
          pagination={false}
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text strong>Tạm tính</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text strong>{orderData.subtotal} VND</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text>Phí vận chuyển</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text>{orderData.shipping} VND</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text>Thuế</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text>{orderData.tax} VND</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text strong>Tổng cộng</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Text strong style={{ fontSize: '16px', color: '#4caf50' }}>
                    {orderData.total} VND
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
        
        {orderData.notes && (
          <>
            <Divider />
            <div>
              <Text strong>Ghi chú:</Text>
              <p>{orderData.notes}</p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default OrderDetail; 