import React, { useEffect, useState } from "react";
import useServiceOrderStore from "@/stores/useServiceOrderStore";
import {
  Typography,
  Spin,
  Alert,
  Table,
  Tag,
  Layout,
  Button,
  Space,
  Tooltip,
  Dropdown,
  Modal,
  message,
  Breadcrumb,
} from "antd";
import { format } from "date-fns";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import useAuthStore from "@/stores/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { 
  EyeOutlined, 
  MoreOutlined, 
  ExclamationCircleOutlined,
  HomeOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Content } = Layout;
const { confirm } = Modal;

const ServiceOrderHistory = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { 
    serviceOrders, 
    loading, 
    error, 
    getServiceOrdersNoUsingIdea,
    cancelServiceOrder 
  } = useServiceOrderStore();
  const [localError, setLocalError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.id) {
        try {
          setLocalError(null);
          await getServiceOrdersNoUsingIdea(user.id);
          setDataLoaded(true);
        } catch (err) {
          console.error("Error fetching service orders:", err);
          setLocalError(err.message || "Không thể tải danh sách đơn hàng");
        }
      }
    };

    fetchOrders();
  }, [user?.id, getServiceOrdersNoUsingIdea]);

  const handleCancelOrder = (orderId) => {
    confirm({
      title: 'Xác nhận hủy đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.',
      okText: 'Hủy đơn hàng',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setCancellingOrderId(orderId);
          await cancelServiceOrder(orderId);
          message.success('Đã hủy đơn hàng thành công');
        } catch (err) {
          message.error(err.message || 'Không thể hủy đơn hàng');
        } finally {
          setCancellingOrderId(null);
        }
      },
    });
  };

  console.log(serviceOrders);

  if (loading) {
    return (
      <Spin
        size="large"
        className="flex justify-center items-center min-h-[400px]"
      />
    );
  }

  // Use local error state if available, otherwise use store error
  const displayError = localError || error;

  if (!serviceOrders) {
    return (
      <Layout>
        <Header />
        <Content>
          <div className="container mx-auto px-4 py-8" style={{ marginTop: "200px" }}>
            <Alert 
              type="error" 
              message="Lỗi" 
              description={displayError} 
              className="mb-4" 
            />
            <Button type="primary" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "orange",
      ConsultingAndSketching: "blue",
      DeterminingDesignPrice: "purple",
      DepositSuccessful: "cyan",
      AssignToDesigner: "geekblue",
      DeterminingMaterialPrice: "magenta",
      DoneDesign: "volcano",
      PaymentSuccess: "green",
      Processing: "blue",
      PickedPackageAndDelivery: "cyan",
      DeliveryFail: "red",
      ReDelivery: "purple",
      DeliveredSuccessfully: "green",
      CompleteOrder: "green",
      OrderCancelled: "red",
      Warning: "orange",
      Refund: "gold",
      DoneRefund: "green",
      Completed: "green",
      NoDesignIdea: "default",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      DeterminingDesignPrice: "Đang xác định giá",
      DepositSuccessful: "Đặt cọc thành công",
      AssignToDesigner: "Đã giao cho nhà thiết kế",
      DeterminingMaterialPrice: "Xác định giá vật liệu",
      DoneDesign: "Hoàn thành thiết kế",
      PaymentSuccess: "Thanh toán thành công",
      Processing: "Đang xử lý",
      PickedPackageAndDelivery: "Đã lấy hàng & đang giao",
      DeliveryFail: "Giao hàng thất bại",
      ReDelivery: "Giao lại",
      DeliveredSuccessfully: "Đã giao hàng thành công",
      CompleteOrder: "Hoàn thành đơn hàng",
      OrderCancelled: "Đơn hàng đã bị hủy",
      Warning: "Cảnh báo vượt 30%",
      Refund: "Hoàn tiền",
      DoneRefund: "Đã hoàn tiền",
      Completed: "Hoàn thành",
      NoDesignIdea: "Không có mẫu thiết kế",
    };
    return statusTexts[status] || status;
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id.slice(0, 8)}`,
    },
    {
      title: "Ngày tạo",
      dataIndex: "creationDate",
      key: "creationDate",
      render: (date) => format(new Date(date), "dd/MM/yyyy HH:mm"),
      sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
    },
    {
      title: "Khách hàng",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Số điện thoại",
      dataIndex: "cusPhone",
      key: "cusPhone",
    },
    {
      title: "Kích thước",
      key: "dimensions",
      render: (_, record) => `${record.length}m x ${record.width}m`,
    },
    {
      title: "Loại dịch vụ",
      dataIndex: "serviceType",
      key: "serviceType",
      render: (type) => {
        const serviceTypeMap = {
          NoDesignIdea: "Không có mẫu thiết kế",
        };
        return serviceTypeMap[type] || type;
      },
    },
    {
      title: "Tổng chi phí",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (cost) => `${cost.toLocaleString("vi-VN")} VNĐ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: "Chờ xử lý", value: "Pending" },
        { text: "Đang tư vấn & phác thảo", value: "ConsultingAndSketching" },
        { text: "Đang xác định giá", value: "DeterminingDesignPrice" },
        { text: "Đặt cọc thành công", value: "DepositSuccessful" },
        { text: "Đã giao cho nhà thiết kế", value: "AssignToDesigner" },
        { text: "Xác định giá vật liệu", value: "DeterminingMaterialPrice" },
        { text: "Hoàn thành thiết kế", value: "DoneDesign" },
        { text: "Thanh toán thành công", value: "PaymentSuccess" },
        { text: "Đang xử lý", value: "Processing" },
        { text: "Đã lấy hàng & đang giao", value: "PickedPackageAndDelivery" },
        { text: "Giao hàng thất bại", value: "DeliveryFail" },
        { text: "Giao lại", value: "ReDelivery" },
        { text: "Đã giao hàng thành công", value: "DeliveredSuccessfully" },
        { text: "Hoàn thành đơn hàng", value: "CompleteOrder" },
        { text: "Đơn hàng đã bị hủy", value: "OrderCancelled" },
        { text: "Cảnh báo vượt 30%", value: "Warning" },
        { text: "Hoàn tiền", value: "Refund" },
        { text: "Đã hoàn tiền", value: "DoneRefund" },
        { text: "Hoàn thành", value: "Completed" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        const canCancel = !['OrderCancelled', 'CompleteOrder', 'Completed', 'DoneRefund'].includes(record.status);
        
        const items = [
          {
            key: 'view',
            label: (
              <Link to={`/service-order/${record.id}`}>
                <Space>
                  <EyeOutlined />
                  <span>Xem chi tiết</span>
                </Space>
              </Link>
            ),
          },
        ];
        
        if (canCancel) {
          items.push({
            key: 'cancel',
            label: (
              <Space onClick={() => handleCancelOrder(record.id)}>
                <ExclamationCircleOutlined />
                <span>Hủy đơn hàng</span>
              </Space>
            ),
            danger: true,
          });
        }
        
        return (
          <Dropdown 
            menu={{ items }} 
            trigger={['click']}
            placement="bottomRight"
            disabled={cancellingOrderId === record.id}
          >
            <Button 
              type="text" 
              icon={<MoreOutlined />} 
              loading={cancellingOrderId === record.id}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Layout>
      <Header />
      <Content>
        <div className="container mx-auto px-4 py-8" style={{ marginTop: "200px" }}>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/Home">
                    <Space>
                      <HomeOutlined style={{ fontSize: '18px' }} />
                      <span style={{ fontSize: '16px' }}>Trang chủ</span>
                    </Space>
                  </Link>
                ),
              },
              {
                title: (
                  <Space>
                    <HistoryOutlined style={{ fontSize: '18px' }} />
                    <span style={{ fontSize: '16px' }}>Lịch sử đơn đặt thiết kế</span>
                  </Space>
                ),
              },
            ]}
            style={{ 
              marginBottom: '16px',
              padding: '12px 16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          />
          
          {/* <Title level={2} className="mb-6">
            Lịch sử đơn đặt thiết kế
          </Title> */}

          {!dataLoaded ? (
            <Alert
              message="Đang tải dữ liệu"
              description="Vui lòng đợi trong giây lát..."
              type="info"
              showIcon
            />
          ) : serviceOrders.length === 0 ? (
            <Alert
              message="Không có đơn đặt thiết kế"
              description="Bạn chưa có đơn đặt thiết kế nào."
              type="info"
              showIcon
            />
          ) : (
            <Table
              dataSource={serviceOrders}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              className="shadow-md"
              onRow={(record) => ({
                onClick: () => navigate(`/service-order/${record.id}`),
                style: { cursor: 'pointer' }
              })}
              style={{ 
                marginBottom: '16px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
              }}
            />
          )}
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default ServiceOrderHistory;
