import React, { useEffect } from "react";
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
} from "antd";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useAuthStore from "@/stores/useAuthStore";
import "./styles.scss";
import { AppstoreOutlined, CopyOutlined, HomeOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

const DesignOrderHistory = () => {
  const navigate = useNavigate();
  const { designOrders, isLoading, fetchDesignOrdersForCus, cancelOrder } =
    useDesignOrderStore();
  const { user } = useAuthStore();
  //console.log(user);

  const componentId = React.useRef('design-order-history');

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
          {designOrders && designOrders.length > 0 ? (
            <Table
              columns={columns}
              dataSource={designOrders}
              rowKey="id"
              pagination={false}
              onRow={(record) => ({
                onClick: () => handleViewOrderDetail(record)
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
            />
          ) : (
            <Empty
              description="Chưa có đơn hàng nào"
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
