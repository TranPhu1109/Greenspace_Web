import React, { useEffect, useState } from 'react';
import { Table, Tag, Spin, Alert, Button, Typography, Space, Input, Select, DatePicker, Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';
import useServiceOrderStore from '@/stores/useServiceOrderStore';
import { format } from 'date-fns';
import { EyeOutlined, ReloadOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const NewDesignOrdersList = () => {
  const {
    serviceOrders,
    loading,
    error,
    getServiceOrdersNoIdea,
  } = useServiceOrderStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({
    columnKey: 'modificationDate',
    order: 'descend',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getServiceOrdersNoIdea();
      } catch (error) {
        console.error('Error fetching design orders:', error);
        // Error is already set in the store, so no need to set it here
      }
    };
    
    fetchData();
  }, [getServiceOrdersNoIdea]);

  // Apply filters and sorting whenever serviceOrders, searchText, statusFilter, or dateRange changes
  useEffect(() => {
    if (!serviceOrders) return;

    let filtered = [...serviceOrders];
    
    // Debug output to see what data we're working with
    console.log('Original service orders:', serviceOrders);
    
    // Check if modificationDate exists on the objects
    if (serviceOrders.length > 0) {
      console.log('Sample order modificationDate:', serviceOrders[0].modificationDate);
      console.log('Sample order creationDate:', serviceOrders[0].creationDate);
    }

    // Apply search filter (for ID or customer name)
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(order => 
        (order.id && order.id.toLowerCase().includes(searchLower)) || 
        (order.userName && order.userName.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').valueOf();
      const endDate = dateRange[1].endOf('day').valueOf();
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.creationDate).getTime();
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Sort by modificationDate (newest first)
    filtered.sort((a, b) => {
      // Use modificationDate if available, otherwise fallback to creationDate
      const dateA = a.modificationDate ? new Date(a.modificationDate) : new Date(a.creationDate);
      const dateB = b.modificationDate ? new Date(b.modificationDate) : new Date(b.creationDate);
      
      // Debug the date comparison
      if (filtered.length < 10) {
        console.log(`Comparing: ${dateA} with ${dateB}, result: ${dateB - dateA}`);
      }
      
      return dateB - dateA; // Newest first
    });
    
    // Debug the sorted results
    console.log('Filtered and sorted orders:', filtered.slice(0, 3).map(order => ({
      id: order.id,
      modificationDate: order.modificationDate,
      creationDate: order.creationDate
    })));

    setFilteredOrders(filtered);
  }, [serviceOrders, searchText, statusFilter, dateRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getServiceOrdersNoIdea();
    } catch (error) {
      console.error('Error refreshing design orders:', error);
      // Error is already set in the store, so no need to set it here
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter(null);
    setDateRange(null);
  };
  
  const handleTableChange = (pagination, filters, sorter) => {
    console.log('Table change:', sorter);
    setSortedInfo(sorter);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      // Đang chờ xử lý
      Pending: "orange",
      WaitDeposit: "orange",
      WaitForScheduling: "orange",
  
      // Quá trình tư vấn / thiết kế
      ConsultingAndSketching: "processing",
      ReConsultingAndSketching: "processing",
      DeterminingDesignPrice: "processing",
      ReDeterminingDesignPrice: "processing",
      DoneDeterminingDesignPrice: "cyan",
      AssignToDesigner: "processing",
      ReDesign: "processing",
      DoneDesign: "cyan",
  
      // Quá trình đặt cọc và thanh toán
      DepositSuccessful: "cyan",
      PaymentSuccess: "cyan",
  
      // Quá trình xác định vật liệu
      DeterminingMaterialPrice: "processing",
      DoneDeterminingMaterialPrice: "cyan",
  
      // Giao hàng, lắp đặt
      Processing: "processing",
      PickedPackageAndDelivery: "blue",
      DeliveryFail: "red",
      ReDelivery: "orange",
      DeliveredSuccessfully: "green",
  
      Installing: "blue",
      ReInstall: "orange",
      DoneInstalling: "green",
  
      // Xác nhận và hoàn thành
      CustomerConfirm: "cyan",
      Successfully: "green",
      CompleteOrder: "green",
  
      // Hủy và cảnh báo
      OrderCancelled: "red",
      Warning: "volcano",
      StopService: "red",
  
      // Hoàn tiền
      Refund: "purple",
      DoneRefund: "purple",
  
      // Đổi sản phẩm
      ExchangeProduct: "geekblue",
    };
  
    return statusColors[status] || "default";
  };
  

  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      DeterminingDesignPrice: "Xác định giá bản vẽ",
      DepositSuccessful: "Đã đặt cọc thành công",
      ReDesign: "Thiết kế lại",
      AssignToDesigner: "Đã giao cho designer",
      DeterminingMaterialPrice: "Xác định giá vật liệu",
      DoneDesign: "Đã hoàn thành thiết kế",
      PaymentSuccess: "Đã thanh toán thành công",
      Processing: "Đang xử lý",
      PickedPackageAndDelivery: "Đã lấy hàng & giao hàng",
      DeliveryFail: "Giao hàng thất bại",
      ReDelivery: "Đang giao hàng lại",
      DeliveredSuccessfully: "Đã giao hàng thành công",
      CompleteOrder: "Đã hoàn thành đơn hàng",
      OrderCancelled: "Đơn hàng đã bị hủy",
      Warning: "Cảnh báo",
      Refund: "Hoàn tiền",
      DoneRefund: "Đã hoàn tiền",
      StopService: "Đã dừng dịch vụ",
      ReConsultingAndSketching: "Đang tư vấn & phác thảo lại",
      WaitDeposit: "Chờ đặt cọc",
      DoneDeterminingDesignPrice: "Đã xác định giá bản vẽ",
      DoneDeterminingMaterialPrice: "Đã xác định giá vật liệu",
      ReDeterminingDesignPrice: "Đang xác định lại giá bản vẽ",
      ExchangeProduct: "Đang đổi sản phẩm",
      WaitForScheduling : "Chờ lên lịch",
      Installing : "Đang lắp đặt",
      DoneInstalling : "Đã lắp đặt",
      ReInstall : "Đang lắp đặt lại",
      CustomerConfirm : "Khách hàng xác nhận",
      Successfully : "Thành công",
      // Thêm các text khác nếu cần
    };
    return statusTexts[status] || status;
  };

  // Get all available statuses from the service orders
  const getAllStatuses = () => {
    if (!serviceOrders) return [];
    const statuses = new Set(serviceOrders.map(order => order.status));
    return Array.from(statuses);
  };

  const columns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id.substring(0, 8)}`,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'cusPhone',
      key: 'cusPhone',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'creationDate',
      key: 'creationDate',
      render: (date) => format(new Date(date), 'dd/MM/yyyy HH:mm'),
    },
    {
      title: 'Cập nhật gần nhất',
      dataIndex: 'modificationDate',
      key: 'modificationDate',
      defaultSortOrder: 'descend', // <- thêm dòng này để sắp xếp mặc định
      sorter: (a, b) => {
        const dateA = a.modificationDate ? new Date(a.modificationDate).getTime() : new Date(a.creationDate).getTime();
        const dateB = b.modificationDate ? new Date(b.modificationDate).getTime() : new Date(b.creationDate).getTime();
        return dateA - dateB;
      },
      sortOrder: sortedInfo.columnKey === 'modificationDate' ? sortedInfo.order : null,
      render: (date, record) =>
        date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : format(new Date(record.creationDate), 'dd/MM/yyyy HH:mm'),
    },    
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/manager/new-design-orders/${record.id}`}>
            <Button type="primary" icon={<EyeOutlined />} />
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={3}>Danh sách đơn đặt thiết kế mới</Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={refreshing}
        >
          Làm mới
        </Button>
      </div>

      {/* {error && (
        <Alert
          message="Lỗi"
          description={
            <div>
              <p>{error}</p>
              <Button 
                type="primary" 
                size="small" 
                onClick={handleRefresh} 
                loading={refreshing}
                style={{ marginTop: '8px' }}
              >
                Thử lại
              </Button>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )} */}

      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col flex="1">
            <Input 
              placeholder="Tìm theo mã đơn hoặc tên khách hàng" 
              allowClear 
              value={searchText}
              onChange={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col flex="1">
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              allowClear
              value={statusFilter}
              onChange={handleStatusChange}
            >
              {getAllStatuses().map(status => (
                <Option key={status} value={status}>
                  <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col flex="1">
            <RangePicker 
              style={{ width: '100%' }} 
              onChange={handleDateRangeChange}
              placeholder={['Từ ngày', 'Đến ngày']}
              value={dateRange}
            />
          </Col>
          <Col flex="none">
            <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
          </Col>
        </Row>
      </Card>

      <style>
        {`
        /* Custom scrollbar styling for table */
        .ant-table-body::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .ant-table-body::-webkit-scrollbar-thumb {
          background: #d9d9d9;
          border-radius: 4px;
        }
        .ant-table-body::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 4px;
        }
        `}
      </style>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        loading={loading && !refreshing}
        rowKey="id"
        pagination={{
          // pageSize: 100,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
        onChange={handleTableChange}
        sortDirections={['descend', 'ascend']}
      />
    </div>
  );
};

export default NewDesignOrdersList; 