import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tooltip,
  Select,
  DatePicker,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './DesignOrdersList.scss';
import { designOrdersData } from './data/designOrdersData';
import StatusTag from './components/StatusTag';
import PaymentStatusTag from './components/PaymentStatusTag';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const DesignOrdersList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterDesigner, setFilterDesigner] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [data, setData] = useState(designOrdersData);

  // Xử lý khi click vào một đơn hàng
  const handleRowClick = (record) => {
    navigate(`/admin/design-orders/${record.id}`);
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
    filterData(value, filterStatus, filterDesigner, dateRange);
  };

  // Xử lý lọc theo trạng thái
  const handleFilterStatus = (value) => {
    setFilterStatus(value);
    filterData(searchText, value, filterDesigner, dateRange);
  };

  // Xử lý lọc theo designer
  const handleFilterDesigner = (value) => {
    setFilterDesigner(value);
    filterData(searchText, filterStatus, value, dateRange);
  };

  // Xử lý lọc theo ngày
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    filterData(searchText, filterStatus, filterDesigner, dates);
  };

  // Hàm lọc dữ liệu
  const filterData = (search, status, designer, dates) => {
    let filteredData = [...designOrdersData];

    if (search) {
      filteredData = filteredData.filter(
        item => 
          item.customerName.toLowerCase().includes(search.toLowerCase()) ||
          item.orderNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }

    if (designer) {
      filteredData = filteredData.filter(item => item.designer === designer);
    }

    if (dates && dates[0] && dates[1]) {
      // Giả sử chúng ta có hàm để chuyển đổi ngày từ string sang Date object
      // và so sánh với khoảng thời gian đã chọn
      // Đây chỉ là mẫu, cần điều chỉnh theo định dạng ngày thực tế
      filteredData = filteredData.filter(item => {
        const orderDate = new Date(item.orderDate);
        return orderDate >= dates[0].toDate() && orderDate <= dates[1].toDate();
      });
    }

    setData(filteredData);
  };

  // Định nghĩa các cột cho bảng
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div className="customer-info">
          <span className="customer-name">{text}</span>
          <span className="customer-email">{record.customerEmail}</span>
        </div>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (text) => (
        <span>
          <CalendarOutlined style={{ marginRight: 8 }} />
          {text}
        </span>
      ),
    },
    {
      title: 'Diện tích',
      dataIndex: 'area',
      key: 'area',
      render: (text) => `${text} m²`,
    },
    {
      title: 'Giá trị',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (text) => (
        <span className="price-value">
          <DollarOutlined style={{ marginRight: 8 }} />
          {text.toLocaleString('vi-VN')} VND
        </span>
      ),
    },
    {
      title: 'Người thiết kế',
      dataIndex: 'designer',
      key: 'designer',
      render: (text) => (
        <span>
          <UserOutlined style={{ marginRight: 8 }} />
          {text || 'Chưa phân công'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Đặt cọc',
      key: 'deposit',
      render: (_, record) => (
        <PaymentStatusTag 
          type="deposit"
          status={record.depositStatus}
          amount={record.depositAmount}
          total={record.totalPrice}
        />
      ),
    },
    {
      title: 'Thanh toán',
      key: 'payment',
      render: (_, record) => (
        <PaymentStatusTag 
          type="payment"
          status={record.paymentStatus}
          amount={record.paymentHistory?.reduce((sum, payment) => sum + payment.amount, 0)}
          total={record.totalPrice}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/admin/design-orders/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="design-orders-list-container">
      <Card>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Title level={4}>Danh sách đơn đặt thiết kế</Title>
          </Col>
        </Row>
        
        <Row gutter={16} className="mb-4">
          <Col xs={24} sm={8} md={6} lg={6} xl={5}>
            <Input 
              placeholder="Tìm kiếm..." 
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </Col>
          <Col xs={24} sm={8} md={6} lg={5} xl={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              onChange={handleFilterStatus}
              allowClear
            >
              <Option value="pending">Chờ xử lý</Option>
              <Option value="processing">Đang xử lý</Option>
              <Option value="designing">Đang thiết kế</Option>
              <Option value="reviewing">Đang xem xét</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6} lg={5} xl={4}>
            <Select
              placeholder="Người thiết kế"
              style={{ width: '100%' }}
              onChange={handleFilterDesigner}
              allowClear
            >
              <Option value="Nguyễn Văn A">Nguyễn Văn A</Option>
              <Option value="Trần Thị B">Trần Thị B</Option>
              <Option value="Lê Văn C">Lê Văn C</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={8} xl={6}>
            <RangePicker 
              style={{ width: '100%' }} 
              onChange={handleDateRangeChange}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
          <Col xs={24} sm={12} md={24} lg={24} xl={5} className="text-right">
            <Button icon={<FilterOutlined />}>Bộ lọc nâng cao</Button>
          </Col>
        </Row>
        
        <Table 
          columns={columns} 
          dataSource={data}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`,
          }}
          className="design-orders-table"
        />
      </Card>
    </div>
  );
};

export default DesignOrdersList; 