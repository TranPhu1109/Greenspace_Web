import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Layout,
  Typography,
  Table,
  Tag,
  Space,
  Spin,
  Empty,
  Button,
  Breadcrumb,
  Modal,
  Input,
  Select,
  Row,
  Col,
  Card,
} from "antd";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useAuthStore from "@/stores/useAuthStore";
import signalRService from "@/services/signalRService";
import "./styles.scss";
import { AppstoreOutlined, CopyOutlined, HomeOutlined, MailOutlined, PhoneOutlined, SearchOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

const DesignOrderHistory = () => {
  const navigate = useNavigate();
  const { designOrders, isLoading, fetchDesignOrdersForCus, fetchDesignOrdersForCusSilent, cancelOrder } =
    useDesignOrderStore();
  const { user } = useAuthStore();
  //console.log(user);

  const componentId = React.useRef('design-order-history');

  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    if (user?.id) {
      //console.log('User changed, fetching orders for user:', user.id);
      fetchDesignOrdersForCus(user.id, componentId.current);
    } else {
      //console.log('No user found, clearing orders');
      const designOrderStore = useDesignOrderStore.getState();
      designOrderStore.reset();
    }
  }, [fetchDesignOrdersForCus, user?.id]);

  // SignalR connection for real-time updates
  useEffect(() => {
    if (!user?.id) return;

    // Kết nối SignalR
    const initSignalR = async () => {
      try {
        const connection = await signalRService.startConnection();

        // Đăng ký listener khi có order cập nhật
        signalRService.on("messageReceived", async () => {
          console.log("SignalR message received - refreshing design orders");
          // Sử dụng silent fetch để không làm re-render loading state
          await fetchDesignOrdersForCusSilent(user.id, componentId.current);
        });

      } catch (err) {
        console.error("Không thể kết nối SignalR", err);
      }
    };

    initSignalR();

    return () => {
      signalRService.off("messageReceived");
      signalRService.stopConnection();
    };
  }, [user?.id, fetchDesignOrdersForCusSilent]);

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      const designOrderStore = useDesignOrderStore.getState();
      designOrderStore.reset();
    };
  }, []);

  // Xử lý điều hướng dựa trên isCustom
  const handleViewOrderDetail = (record) => {
    if (record.isCustom === true) {
      // Nếu là đơn hàng custom thì dẫn đến trang OrderHistoryDetail
      navigate(`/serviceorderhistory/detail/${record.id}`);
    } else {
      // Nếu là đơn hàng không custom thì dẫn đến trang StandardOrderDetail
      navigate(`/serviceorderhistory/standard/${record.id}`);
    }
  };

  const handleCancelOrder = (record) => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn',
      content: 'Bạn có chắc chắn muốn hủy đơn này không?',
      onOk: async () => {
        // call api cancel order
        await cancelOrder(record.id);
        // refresh lại danh sách đơn hàng
        fetchDesignOrdersForCus(user.id, componentId.current);
      },
    });
  };

  // Helper function to get status text
  const getStatusText = (status) => {
    const statusConfig = {
      'Pending': 'Chờ xử lý',
      'ConsultingAndSketching': 'Đang tư vấn & phác thảo',
      'DeterminingDesignPrice': 'Đang xác định giá',
      'DepositSuccessful': 'Đặt cọc thành công',
      'AssignToDesigner': 'Đã giao cho nhà thiết kế',
      'DeterminingMaterialPrice': 'Xác định giá vật liệu',
      'DoneDesign': 'Hoàn thành thiết kế',
      'PaymentSuccess': 'Thanh toán thành công',
      'Processing': 'Đang xử lý',
      'PickedPackageAndDelivery': 'Đã lấy hàng & đang giao',
      'DeliveryFail': 'Giao hàng thất bại',
      'ReDelivery': 'Giao lại',
      'DeliveredSuccessfully': 'Đã giao hàng thành công',
      'CompleteOrder': 'Hoàn thành đơn hàng',
      'OrderCancelled': 'Đơn hàng đã bị hủy',
      'Warning': 'Cảnh báo vượt 30%',
      'Refund': 'Hoàn tiền',
      'DoneRefund': 'Đã hoàn tiền',
      'Completed': 'Hoàn thành',
      'Installing': 'Đang lắp đặt',
      'ReInstall': 'Lắp đặt lại',
      'DoneInstalling': 'Hoàn tất lắp đặt',
      'Successfully': 'Hoàn tất đơn hàng',
      'ReConsultingAndSketching': 'Phác thảo lại',
      'ReDesign': 'Thiết kế lại',
      'WaitDeposit': 'Chờ đặt cọc'
    };
    return statusConfig[status] || status;
  };

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    if (!designOrders || designOrders.length === 0) return [];

    let filtered = [...designOrders];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Search by order ID, phone, or customer name
    if (debouncedSearchText.trim()) {
      const searchLower = debouncedSearchText.toLowerCase().trim();
      filtered = filtered.filter(order => {
        const orderId = order.id?.toLowerCase() || '';
        const phone = order.cusPhone?.toLowerCase() || '';
        const customerName = order.userName?.toLowerCase() || '';

        return orderId.includes(searchLower) ||
               phone.includes(searchLower) ||
               customerName.includes(searchLower);
      });
    }

    return filtered;
  }, [designOrders, selectedStatus, debouncedSearchText]);

  // Get unique statuses for filter options
  const statusOptions = useMemo(() => {
    if (!designOrders || designOrders.length === 0) return [];

    const uniqueStatuses = [...new Set(designOrders.map(order => order.status))];
    return uniqueStatuses.map(status => ({
      value: status,
      label: getStatusText(status)
    }));
  }, [designOrders]);

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 130,
      render: (id) => <Text copyable={{ text: id, icon: <CopyOutlined /> }}>#{id?.slice(0, 8)}</Text>,
    },
    {
      title: "Thông tin khách hàng",
      key: "customerInfo",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.userName}</Text>
          <Text type="secondary"><PhoneOutlined /> {record.cusPhone}</Text>
        </Space>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (text) => <Text>{text ? text.replace(/\|/g, ', ') : 'Không có địa chỉ'}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const statusConfig = {
          'Pending': { color: 'gold', text: 'Chờ xử lý' },
          'ConsultingAndSketching': { color: 'blue', text: 'Đang tư vấn & phác thảo' },
          'DeterminingDesignPrice': { color: 'cyan', text: 'Đang xác định giá' },
          'DepositSuccessful': { color: 'green', text: 'Đặt cọc thành công' },
          'AssignToDesigner': { color: 'purple', text: 'Đã giao cho nhà thiết kế' },
          'DeterminingMaterialPrice': { color: 'orange', text: 'Xác định giá vật liệu' },
          'DoneDesign': { color: 'success', text: 'Hoàn thành thiết kế' },
          'PaymentSuccess': { color: 'green', text: 'Thanh toán thành công' },
          'Processing': { color: 'processing', text: 'Đang xử lý' },
          'PickedPackageAndDelivery': { color: 'processing', text: 'Đã lấy hàng & đang giao' },
          'DeliveryFail': { color: 'error', text: 'Giao hàng thất bại' },
          'ReDelivery': { color: 'warning', text: 'Giao lại' },
          'DeliveredSuccessfully': { color: 'success', text: 'Đã giao hàng thành công' },
          'CompleteOrder': { color: 'success', text: 'Hoàn thành đơn hàng' },
          'OrderCancelled': { color: 'error', text: 'Đơn hàng đã bị hủy' },
          'Warning': { color: 'warning', text: 'Cảnh báo vượt 30%' },
          'Refund': { color: 'orange', text: 'Hoàn tiền' },
          'DoneRefund': { color: 'success', text: 'Đã hoàn tiền' },
          'Completed': { color: 'success', text: 'Hoàn thành' },
          'Installing': { color: 'blue', text: 'Đang lắp đặt' },
          'ReInstall': { color: 'warning', text: 'Lắp đặt lại' },
          'DoneInstalling': { color: 'success', text: 'Hoàn tất lắp đặt' },
          'Successfully': { color: 'success', text: 'Hoàn tất đơn hàng' },
          'ReConsultingAndSketching': { color: 'blue', text: 'Phác thảo lại' },
          'ReDesign': { color: 'volcano', text: 'Thiết kế lại' },
          'WaitDeposit': { color: 'gold', text: 'Chờ đặt cọc' }
        };

        // Xóa bỏ logic kiểm tra excludedStatusForNonCustom vì nó gây hiển thị sai
        // Hiển thị trạng thái thực tế của đơn hàng
        const config = statusConfig[status] || {
          color: "default",
          text: "Không xác định",
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "creationDate",
      key: "creationDate",
      render: (date) => (
        <Text>
          {date
            ? new Date(date).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
            : "Invalid Date"}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Button
            type="primary"
            className="detail-button"
            onClick={(e) => {
              e.stopPropagation();
              handleViewOrderDetail(record);
            }}
          >
            Xem chi tiết
          </Button>
          {record.status === 'Pending' && (
            <Button
              // type="danger"
              danger
            className="detail-button"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelOrder(record);
            }}
          >
              Hủy đơn
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Layout className="order-history-layout">
        <Header />
        <Content>
          <div className="order-history-content">
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Content>
        <div
          className="order-history-content"
          style={{ padding: "180px 0", width: "1200px", margin: "0 auto" }}
        >
          {/* <Title level={2}>Lịch sử đơn hàng</Title> */}
          <Breadcrumb style={{
            marginTop: '16px',
            marginBottom: '20px',
            padding: '12px 16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            <Breadcrumb.Item onClick={() => navigate("/Home")} style={{ cursor: 'pointer' }}>
              <HomeOutlined /> Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              Lịch sử đặt thiết kế mẫu kèm sản phẩm đã đặt
            </Breadcrumb.Item>
          </Breadcrumb>

          {/* Search and Filter Section */}
          <Card
            style={{
              marginBottom: 16,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            title="Tìm kiếm và lọc đơn hàng"
            size="small"
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Input.Search
                  placeholder="Tìm kiếm theo mã đơn hàng, số điện thoại, tên khách hàng..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  style={{ width: '100%' }}
                  loading={searchText !== debouncedSearchText}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Lọc theo trạng thái"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  style={{ width: '100%' }}
                  allowClear
                  onClear={() => setSelectedStatus('all')}
                >
                  <Select.Option value="all">Tất cả trạng thái</Select.Option>
                  {statusOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <Space>
                  <Text type="secondary">
                    Hiển thị {filteredOrders.length} / {designOrders?.length || 0} đơn hàng
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {filteredOrders && filteredOrders.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredOrders}
              bordered
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} đơn hàng`,
                size: 'small'
              }}
              onRow={(record) => ({
                onClick: () => handleViewOrderDetail(record),
                style: { cursor: 'pointer' }
              })}
              components={{
                body: {
                  cell: ({ children, ...restProps }) => {
                    const { column } = restProps;
                    if (!column) return <td {...restProps}>{children}</td>;

                    return (
                      <td {...restProps} data-label={column.title || ""}>
                        {children}
                      </td>
                    );
                  },
                },
              }}
              scroll={{ x: 1200 }}
              size="small"
            />
          ) : (
            <Empty
              description={
                debouncedSearchText || selectedStatus !== 'all'
                  ? "Không tìm thấy đơn hàng nào phù hợp với bộ lọc"
                  : "Chưa có đơn hàng nào"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default DesignOrderHistory;
