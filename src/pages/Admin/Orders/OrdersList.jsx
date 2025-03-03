import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Badge, 
  Dropdown, 
  Menu,
  Checkbox,
  Row,
  Col,
  Card,
  Typography,
  Tooltip,
  Modal,
  message
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  MoreOutlined, 
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './OrdersList.scss';

const { Title, Text } = Typography;
const { confirm } = Modal;

const OrdersList = () => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [ordersData, setOrdersData] = useState([
    {
      key: '1',
      name: 'Justin Septimus',
      email: 'example@email.com',
      status: 'pending', // Thêm trạng thái đơn hàng: pending, accepted, cancelled
      payment: 'paid',
      paymentDate: '28/2/2025',
      price: '200.000',
      phone: '0963202427',
      address: '528/21 Lê Văn Việt, Q9, TP.Hồ Chí Minh',
      orderDate: '28/2/2025',
      details: [
        { product: 'Gỗ', quantity: 1, price: '200.000VND' },
        { product: 'Cây xanh', quantity: 2, price: '500.000VND' },
      ]
    },
    {
      key: '2',
      name: 'Justin Septimus',
      email: 'example@email.com',
      status: 'accepted',
      payment: 'paid',
      paymentDate: '28/2/2025',
      price: '200.000',
      phone: '0963202427',
      address: '528/21 Lê Văn Việt, Q9, TP.Hồ Chí Minh',
      orderDate: '28/2/2025',
      details: [
        { product: 'Gỗ', quantity: 1, price: '200.000VND' },
        { product: 'Cây xanh', quantity: 2, price: '500.000VND' },
      ]
    },
    {
      key: '3',
      name: 'Justin Septimus',
      email: 'example@email.com',
      status: 'pending',
      payment: 'unpaid',
      paymentDate: '28/2/2025',
      price: '200.000',
      phone: '0963202427',
      address: '528/21 Lê Văn Việt, Q9, TP.Hồ Chí Minh',
      orderDate: '28/2/2025',
      details: [
        { product: 'Gỗ', quantity: 1, price: '200.000VND' },
        { product: 'Cây xanh', quantity: 2, price: '500.000VND' },
      ]
    },
    {
      key: '4',
      name: 'Justin Septimus',
      email: 'example@email.com',
      status: 'cancelled',
      payment: 'overdue',
      paymentDate: '28/2/2025',
      price: '200.000',
      phone: '0963202427',
      address: '528/21 Lê Văn Việt, Q9, TP.Hồ Chí Minh',
      orderDate: '28/2/2025',
      details: [
        { product: 'Gỗ', quantity: 1, price: '200.000VND' },
        { product: 'Cây xanh', quantity: 2, price: '500.000VND' },
      ]
    },
  ]);

  // Xử lý nhận đơn hàng
  const handleAcceptOrder = (record) => {
    confirm({
      title: 'Bạn có chắc chắn muốn nhận đơn hàng này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Khi nhận đơn, hệ thống sẽ thông báo cho khách hàng và bắt đầu quy trình xử lý đơn hàng.',
      okText: 'Nhận đơn',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk() {
        // Cập nhật trạng thái đơn hàng
        const newOrdersData = ordersData.map(item => {
          if (item.key === record.key) {
            return { ...item, status: 'accepted' };
          }
          return item;
        });
        setOrdersData(newOrdersData);
        message.success('Đã nhận đơn hàng thành công!');
      },
    });
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = (record) => {
    confirm({
      title: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Khi hủy đơn, hệ thống sẽ thông báo cho khách hàng và đơn hàng sẽ không được xử lý.',
      okText: 'Hủy đơn',
      okType: 'danger',
      cancelText: 'Không',
      onOk() {
        // Cập nhật trạng thái đơn hàng
        const newOrdersData = ordersData.map(item => {
          if (item.key === record.key) {
            return { ...item, status: 'cancelled' };
          }
          return item;
        });
        setOrdersData(newOrdersData);
        message.success('Đã hủy đơn hàng thành công!');
      },
    });
  };

  // Xử lý xem chi tiết đơn hàng
  const handleViewOrderDetail = (record) => {
    navigate(`/admin/orders/${record.key}`);
  };

  // Render trạng thái đơn hàng
  const renderOrderStatus = (status) => {
    let color, text;
    
    switch(status) {
      case 'pending':
        color = 'blue';
        text = 'Chờ xử lý';
        break;
      case 'accepted':
        color = 'green';
        text = 'Đã nhận';
        break;
      case 'cancelled':
        color = 'red';
        text = 'Đã hủy';
        break;
      default:
        color = 'default';
        text = status;
    }
    
    return (
      <Tag color={color} className="status-tag">
        <Badge status={color === 'blue' ? 'processing' : color === 'green' ? 'success' : 'error'} text={text} />
      </Tag>
    );
  };

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: () => <Checkbox 
        indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < ordersData.length}
        checked={selectedRowKeys.length === ordersData.length}
        onChange={e => {
          setSelectedRowKeys(e.target.checked ? ordersData.map(item => item.key) : []);
        }}
      />,
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 50,
      render: (_, record) => (
        <Checkbox 
          checked={selectedRowKeys.includes(record.key)}
          onChange={e => {
            const newSelectedRowKeys = e.target.checked 
              ? [...selectedRowKeys, record.key] 
              : selectedRowKeys.filter(key => key !== record.key);
            setSelectedRowKeys(newSelectedRowKeys);
          }}
        />
      ),
    },
    {
      title: 'TÊN',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: status => renderOrderStatus(status),
    },
    {
      title: 'THANH TOÁN',
      dataIndex: 'payment',
      key: 'payment',
      render: (payment, record) => {
        let color, icon, text;
        
        switch(payment) {
          case 'paid':
            color = 'green';
            icon = <CheckCircleOutlined />;
            text = 'Paid';
            break;
          case 'unpaid':
            color = 'gold';
            icon = <ClockCircleOutlined />;
            text = 'Unpaid';
            break;
          case 'overdue':
            color = 'red';
            icon = <CloseCircleOutlined />;
            text = 'Overdue';
            break;
          default:
            color = 'default';
            text = payment;
        }
        
        return (
          <div>
            <Tag color={color} icon={icon} className="payment-tag">
              {text}
            </Tag>
            <div className="text-gray-500">Paid on {record.paymentDate}</div>
          </div>
        );
      },
    },
    {
      title: 'GIÁ',
      dataIndex: 'price',
      key: 'price',
      render: price => (
        <div className="font-medium">
          {price} VND
        </div>
      ),
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => {
        // Chỉ hiển thị các nút hành động phù hợp với trạng thái đơn hàng
        const isPending = record.status === 'pending';
        
        return (
          <Space size="middle">
            <Button 
              type="text" 
              onClick={() => handleViewOrderDetail(record)}
              icon={<EyeOutlined />}
            >
              Xem chi tiết
            </Button>
            
            {isPending && (
              <>
                <Button 
                  type="primary" 
                  size="small"
                  icon={<CheckOutlined />} 
                  onClick={() => handleAcceptOrder(record)}
                >
                  Nhận đơn
                </Button>
                <Button 
                  danger 
                  size="small"
                  icon={<CloseOutlined />} 
                  onClick={() => handleCancelOrder(record)}
                >
                  Hủy đơn
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  // Cấu hình hàng mở rộng
  const expandedRowRender = (record) => {
    const detailColumns = [
      { title: 'NGÀY', dataIndex: 'orderDate', key: 'orderDate' },
      { title: 'ĐỊA CHỈ', dataIndex: 'address', key: 'address' },
      { 
        title: 'CHI TIẾT', 
        dataIndex: 'details', 
        key: 'details',
        render: (details) => (
          <div>
            {details.map((item, index) => (
              <div key={index}>
                {item.product} - {item.quantity} - {item.price}
              </div>
            ))}
          </div>
        )
      },
    ];

    return (
      <Table 
        columns={detailColumns} 
        dataSource={[record]} 
        pagination={false} 
        showHeader={true}
      />
    );
  };

  const handleViewMore = (record) => {
    const newExpandedRowKeys = expandedRowKeys.includes(record.key)
      ? expandedRowKeys.filter(key => key !== record.key)
      : [...expandedRowKeys, record.key];
    
    setExpandedRowKeys(newExpandedRowKeys);
  };

  // Xử lý hành động hàng loạt
  const handleBatchAction = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đơn hàng!');
      return;
    }

    if (action === 'accept') {
      confirm({
        title: `Bạn có chắc chắn muốn nhận ${selectedRowKeys.length} đơn hàng đã chọn?`,
        icon: <ExclamationCircleOutlined />,
        okText: 'Nhận đơn',
        okType: 'primary',
        cancelText: 'Hủy',
        onOk() {
          // Cập nhật trạng thái đơn hàng
          const newOrdersData = ordersData.map(item => {
            if (selectedRowKeys.includes(item.key) && item.status === 'pending') {
              return { ...item, status: 'accepted' };
            }
            return item;
          });
          setOrdersData(newOrdersData);
          message.success(`Đã nhận ${selectedRowKeys.length} đơn hàng thành công!`);
          setSelectedRowKeys([]);
        },
      });
    } else if (action === 'cancel') {
      confirm({
        title: `Bạn có chắc chắn muốn hủy ${selectedRowKeys.length} đơn hàng đã chọn?`,
        icon: <ExclamationCircleOutlined />,
        okText: 'Hủy đơn',
        okType: 'danger',
        cancelText: 'Không',
        onOk() {
          // Cập nhật trạng thái đơn hàng
          const newOrdersData = ordersData.map(item => {
            if (selectedRowKeys.includes(item.key) && item.status === 'pending') {
              return { ...item, status: 'cancelled' };
            }
            return item;
          });
          setOrdersData(newOrdersData);
          message.success(`Đã hủy ${selectedRowKeys.length} đơn hàng thành công!`);
          setSelectedRowKeys([]);
        },
      });
    }
  };

  return (
    <div className="orders-list-container">
      <Card>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Title level={4}>Danh sách đơn hàng</Title>
          </Col>
          <Col>
            <Space>
              <Input 
                placeholder="Tìm kiếm..." 
                prefix={<SearchOutlined />} 
                className="search-input"
              />
              <Tooltip title="Lọc">
                <Button icon={<FilterOutlined />}>
                  Filter
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
        
        {selectedRowKeys.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Space>
                <Text>Đã chọn {selectedRowKeys.length} đơn hàng</Text>
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />}
                  onClick={() => handleBatchAction('accept')}
                >
                  Nhận đơn
                </Button>
                <Button 
                  danger 
                  icon={<CloseOutlined />}
                  onClick={() => handleBatchAction('cancel')}
                >
                  Hủy đơn
                </Button>
                <Button 
                  onClick={() => setSelectedRowKeys([])}
                >
                  Bỏ chọn
                </Button>
              </Space>
            </Col>
          </Row>
        )}
        
        <Table
          columns={columns}
          dataSource={ordersData}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: (expanded, record) => {
              const newExpandedRowKeys = expanded
                ? [...expandedRowKeys, record.key]
                : expandedRowKeys.filter(key => key !== record.key);
              
              setExpandedRowKeys(newExpandedRowKeys);
            }
          }}
          pagination={{
            total: 276,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 10,
          }}
          className="orders-table"
        />
      </Card>
    </div>
  );
};

export default OrdersList; 