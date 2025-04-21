import React, { useState } from "react";
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
import ComplaintModal from '@/components/Order/ComplaintModal';
import useComplaintStore from '../../stores/useComplaintStore';
import OrderHistoryTab from "./components/OrderHistoryTab";
import ComplaintHistoryTab from "./components/ComplaintHistoryTab";

const { TextArea } = Input;

const { Title, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;

const OrderHistory = () => {
  const { orders, loading, error, fetchOrderHistory, cancelOrder } = useOrderHistoryStore();
  const { getProductById, createProductFeedback } = useProductStore();
  const { user } = useAuthStore();
  const { fetchUserComplaints } = useComplaintStore();
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

  React.useEffect(() => {
    fetchOrderHistory();
    if (user?.id) {
      fetchUserComplaints(user.id).then(data => setComplaints(data));
    }
  }, [fetchOrderHistory, user?.id, fetchUserComplaints]);

  React.useEffect(() => {
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
      children: <OrderHistoryTab />,
    },
    {
      key: "2",
      label: "Lịch sử khiếu nại",
      children: <ComplaintHistoryTab />,
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
