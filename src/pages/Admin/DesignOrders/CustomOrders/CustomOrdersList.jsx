import React, { useState } from 'react';
import { 
  Table,
  Card,
  Button,
  Input,
  Space,
  Row,
  Col,
  Select,
  DatePicker,
  Tooltip,
  Tag,
  Image,
  Modal
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined,
  PictureOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import StatusTag from '../components/StatusTag';
import PaymentStatusTag from '../components/PaymentStatusTag';
import { customOrders } from '../../../../components/Staff/mockData/customOrders';

const { Option } = Select;
const { RangePicker } = DatePicker;

const CustomOrdersList = () => {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Loại dự án',
      dataIndex: 'projectType',
      key: 'projectType',
    },
    {
      title: 'Yêu cầu thiết kế',
      dataIndex: 'requirements',
      key: 'requirements',
      render: (requirements) => (
        <Tooltip title={
          <div>
            <p><strong>Phong cách:</strong> {requirements.style}</p>
            <p><strong>Màu sắc chính:</strong> {requirements.mainColors.join(', ')}</p>
            <p><strong>Yêu cầu đặc biệt:</strong> {requirements.specialRequirements}</p>
          </div>
        }>
          <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {requirements.style} - {requirements.specialRequirements.substring(0, 30)}...
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <Tooltip title={
          <div>
            <p><UserOutlined /> {record.customerName}</p>
            <p><PhoneOutlined /> {record.customerPhone}</p>
            <p><MailOutlined /> {record.customerEmail}</p>
          </div>
        }>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Diện tích',
      dataIndex: 'area',
      key: 'area',
      render: (area) => `${area}m²`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />
    },
    {
      title: 'Thanh toán',
      dataIndex: 'payment',
      key: 'payment',
      render: (payment) => (
        <PaymentStatusTag 
          status={payment.status}
          amount={payment.amount}
          total={payment.total}
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.referenceImages?.length > 0 && (
            <Button 
              type="text" 
              // icon={<PictureOutlined />}
              onClick={() => handlePreviewImages(record.referenceImages)}
            >
              <Tooltip title="Xem ảnh tham khảo">
                <PictureOutlined />
              </Tooltip>
            </Button>
          )}
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            <Tooltip title="Chi tiết">
              <EyeOutlined />
            </Tooltip>
          </Button>
        </Space>
      )
    }
  ];

  const handleViewDetail = (id) => {
    // Xử lý xem chi tiết
  };

  const handlePreviewImages = (images) => {
    setPreviewImages(images);
    setPreviewVisible(true);
  };

  return (
    <Card title="Danh sách đơn thiết kế mới">
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Tìm kiếm đơn hàng"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Lọc theo trạng thái"
            allowClear
            onChange={(value) => setFilterStatus(value)}
          >
            <Option value="consulting">Đang tư vấn</Option>
            <Option value="pending">Chờ xử lý</Option>
            <Option value="processing">Đang xử lý</Option>
            <Option value="completed">Hoàn thành</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <RangePicker 
            style={{ width: '100%' }}
            onChange={(dates) => setDateRange(dates)}
            placeholder={['Từ ngày', 'Đến ngày']}
          />
        </Col>
      </Row>

      <Table 
        columns={columns}
        dataSource={customOrders}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đơn hàng`
        }}
      />

      {/* Modal xem ảnh tham khảo */}
      <Modal
        visible={previewVisible}
        title="Ảnh tham khảo"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {previewImages.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={`Reference ${index + 1}`}
              style={{ width: 200, height: 200, objectFit: 'cover' }}
            />
          ))}
        </div>
      </Modal>
    </Card>
  );
};

export default CustomOrdersList; 