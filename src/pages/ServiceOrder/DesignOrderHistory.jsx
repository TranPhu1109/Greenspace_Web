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
} from "antd";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useAuthStore from "@/stores/useAuthStore";
import "./styles.scss";

const { Content } = Layout;
const { Title, Text } = Typography;

const DesignOrderHistory = () => {
  const navigate = useNavigate();
  const { designOrders, isLoading, fetchDesignOrdersForCus } =
    useDesignOrderStore();
  const { user } = useAuthStore();
  console.log(user);

  const componentId = React.useRef("design-order-history");

  useEffect(() => {
    if (user?.id) {
      console.log("User changed, fetching orders for user:", user.id);
      fetchDesignOrdersForCus(user.id, componentId.current);
    } else {
      console.log("No user found, clearing orders");
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

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: (id) => <span>#{id?.slice(0, 8)}</span>,
    },
    {
      title: "Thông tin khách hàng",
      key: "customerInfo",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.userName}</Text>
          <Text type="secondary">{record.email}</Text>
        </Space>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "cusPhone",
      key: "cusPhone",
      render: (phone) => <Text>{phone}</Text>,
    },
    {
      title: "Loại đơn hàng",
      dataIndex: "isCustom",
      key: "isCustom",
      render: (isCustom) => {
        const customConfig = {
          false: { color: "blue", text: "Không tùy chỉnh" },
          true: { color: "green", text: "Tùy chỉnh" },
          full: { color: "purple", text: "Tùy chỉnh hoàn toàn" },
        };
        const config = customConfig[isCustom] || customConfig.false;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          Pending: { color: "gold", text: "Chờ xử lý" },
          PaymentSuccess: { color: "cyan", text: "Đã thanh toán" },
          Processing: { color: "blue", text: "Đang xử lý" },
          PickedPackageAndDelivery: { color: "purple", text: "Đang giao hàng" },
          DeliveryFail: { color: "red", text: "Giao hàng thất bại" },
          ReDelivery: { color: "orange", text: "Giao hàng lại" },
          DeliveredSuccessfully: { color: "green", text: "Đã giao hàng" },
          CompleteOrder: { color: "green", text: "Hoàn thành" },
          OrderCancelled: { color: "red", text: "Đã hủy" },
          Refund: { color: "red", text: "Hoàn tiền" },
          DoneRefund: { color: "red", text: "Đã hoàn tiền" },
        };
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
        <Button
          type="primary"
          className="detail-button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/serviceorderhistory/detail/${record.id}`);
          }}
        >
          Xem chi tiết
        </Button>
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
          <Title level={2}>Lịch sử đơn hàng</Title>
          {designOrders && designOrders.length > 0 ? (
            <Table
              columns={columns}
              dataSource={designOrders}
              rowKey="id"
              pagination={false}
              onRow={(record) => ({
                onClick: () =>
                  navigate(`/serviceorderhistory/detail/${record.id}`),
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
