import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Card,
  Select,
  Space,
  Typography,
  Layout,
  Breadcrumb,
  Row,
  Col,
  Form,
  Rate,
  Input,
  Button,
  message,
  notification,
  Modal,
  Image,
  Descriptions,
  Alert,
  Tabs,
} from "antd";
import { format } from "date-fns";
import { HomeOutlined, ShoppingOutlined } from "@ant-design/icons";
import useOrderHistoryStore from "../../stores/useOrderHistoryStore";
import useProductStore from "../../stores/useProductStore";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { checkToxicContent } from "@/services/moderationService";
import useAuthStore from "@/stores/useAuthStore";
import ComplaintModal from '@/pages/Order/components/ComplaintModal';
import useComplaintStore from '../../stores/useComplaintStore';
import OrderHistoryTab from "./components/OrderHistoryTab";
import ComplaintHistoryTab from "./components/ComplaintHistoryTab";
import signalRService from "../../services/signalRService";

const { TextArea } = Input;

const { Title, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;

const OrderHistory = () => {
  const { orders, loading, error, fetchOrderHistory, cancelOrder, fetchOrderHistorySilent } = useOrderHistoryStore();
  const { getProductById, createProductFeedback } = useProductStore();
  const { user } = useAuthStore();
  const { fetchUserComplaints, fetchUserComplaintsSilent } = useComplaintStore();
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [productDetails, setProductDetails] = React.useState({});
  const [feedbackForm] = Form.useForm();
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [selectedProductForFeedback, setSelectedProductForFeedback] =
    useState(null);
  const [complaintModalVisible, setComplaintModalVisible] = useState(false);
  const [selectedComplaintType, setSelectedComplaintType] = useState(null);
  const [selectedProductForComplaint, setSelectedProductForComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("1");

  // SignalR message handler
  const handleSignalRMessage = async (...args) => {

    if (!user?.id) return;

    // Use a timeout to debounce multiple updates that might come in rapid succession
    if (window.orderHistoryUpdateTimer) {
      clearTimeout(window.orderHistoryUpdateTimer);
    }

    window.orderHistoryUpdateTimer = setTimeout(async () => {
      try {
        // Refresh order history data
        const newOrders = await fetchOrderHistorySilent();
        
        // Refresh complaints data if user is logged in
        if (user?.id) {
          const freshComplaintsData = await fetchUserComplaintsSilent(user.id);
          // Only update if we got actual data back
          if (freshComplaintsData && Array.isArray(freshComplaintsData)) {
            setComplaints(freshComplaintsData);
          }
        }
      } catch (err) {
        console.error("Error refreshing data after SignalR update:", err);
      }
    }, 1000); // Shorter debounce time to ensure responsiveness
  };

  // Set up SignalR connection
  useEffect(() => {
    const initializeSignalR = async () => {
      try {
        await signalRService.startConnection();

        // Only register for messageReceived - this will catch all events
        signalRService.on("messageReceived", handleSignalRMessage);
      } catch (err) {
        console.error("Error connecting to SignalR:", err);
      }
    };

    initializeSignalR();

    // Cleanup
    return () => {
      signalRService.off("messageReceived", handleSignalRMessage);
    };
  }, [user, fetchUserComplaintsSilent, fetchOrderHistorySilent]);

  useEffect(() => {
    fetchOrderHistory();
    if (user?.id) {
      fetchUserComplaints(user.id).then(data => setComplaints(data));
    }
  }, [fetchOrderHistory, user?.id, fetchUserComplaints]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!orders) return;

      const productIds = orders.flatMap(
        (order) => order.orderDetails?.map((detail) => detail.productId) || []
      );

      const uniqueProductIds = [...new Set(productIds)];
      const details = {};

      for (const productId of uniqueProductIds) {
        try {
          const product = await getProductById(productId);
          if (product) {
            details[productId] = product;
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }

      setProductDetails(details);
    };

    if (orders && orders.length > 0) {
      fetchProductDetails();
    }
  }, [orders, getProductById]);



  const items = [
    {
      key: "1",
      label: "Lịch sử đơn hàng",
      children: <OrderHistoryTab complaints={complaints} />,
    },
    {
      key: "2",
      label: "Lịch sử khiếu nại",
      children: <ComplaintHistoryTab complaints={complaints} />,
    },
  ];

  if (error) {
    return (
      <Layout>
        <Header />
        <Content style={{ marginTop: 200 }}>
          <div className="container mx-auto px-4">
            <Alert
              message="Lỗi"
              description={error}
              type="error"
              showIcon
            />
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Content style={{ marginTop: 200, marginBottom: 20 }}>
        <div className="container mx-auto px-4">
          <Breadcrumb style={{
            marginBottom: '16px',
            padding: '12px 16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            <Breadcrumb.Item href="/Home">
              <HomeOutlined /> Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <ShoppingOutlined /> Lịch sử đơn hàng
            </Breadcrumb.Item>
          </Breadcrumb>
          <Card className="order-history-card">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={items}
              size="large"
            />
          </Card>
        </div>
      </Content>
      <Footer />
      <ComplaintModal
        visible={complaintModalVisible}
        onCancel={() => {
          setComplaintModalVisible(false);
          setSelectedComplaintType(null);
          setSelectedProductForComplaint(null);
        }}
        type={selectedComplaintType}
        selectedProductForComplaint={selectedProductForComplaint}
      />
    </Layout>
  );
};

export default OrderHistory;
