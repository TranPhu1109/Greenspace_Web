// Update imports - remove Comment
import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Avatar,
  Input,
  Button,
  Tag,
  Space,
  Typography,
  Rate,
  Row,
  Col,
  message,
  Spin,
  Empty,
} from "antd";
import { UserOutlined, CommentOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import useProductStore from "@/stores/useProductStore";
import ProductList from "./components/ProductList";
import FeedbackList from "./components/FeedbackList";
import ReplyForm from "./components/ReplyForm";
import "./styles/Layout.scss";
import "./styles/index.scss";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { TextArea } = Input;
const { Text } = Typography;

// Custom Comment component
const FeedbackComment = ({
  author,
  avatar,
  content,
  datetime,
  actions,
  children,
}) => (
  <div className="feedback-comment">
    <div className="feedback-comment-inner">
      <div className="feedback-comment-avatar">{avatar}</div>
      <div className="feedback-comment-content">
        <div className="feedback-comment-header">
          <Text strong className="feedback-comment-author">
            {author}
          </Text>
          <span className="feedback-comment-time">{datetime}</span>
        </div>
        <div className="feedback-comment-body">{content}</div>
        {actions && actions.length > 0 && (
          <ul className="feedback-comment-actions">
            {actions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
    {children && <div className="feedback-comment-nested">{children}</div>}
  </div>
);

const FeedbackManagement = () => {
  const {
    products,
    fetchProducts,
    fetchAllProductFeedbacks,
    getProductFeedbacks,
    productFeedbacks,
    selectedProductFeedbacks,
    setSelectedProductFeedbacks,
    isLoading,
    feedbackLoading,
    replyToFeedback,
  } = useProductStore();

  const [replyText, setReplyText] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedReplyTo, setSelectedReplyTo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch products and all feedbacks when component mounts
  useEffect(() => {
    const initializeData = async () => {
      await fetchProducts();
      await fetchAllProductFeedbacks();
    };
    initializeData();
  }, []);

  // Update selected product feedbacks when selected item changes
  useEffect(() => {
    if (selectedItem?.id && selectedItem.type === "product") {
      const productFeedbackList = productFeedbacks[selectedItem.id] || [];
      setSelectedProductFeedbacks(productFeedbackList);
    }
  }, [selectedItem, productFeedbacks]);

  // Reset reply form when changing selected item
  useEffect(() => {
    setSelectedReplyTo(null);
    setReplyText("");
    setIsEditing(false);
  }, [selectedItem]);

  const handleReply = async () => {
    if (!replyText?.trim() || !selectedReplyTo) return;

    try {
      await replyToFeedback(selectedReplyTo.id, replyText.trim());
      message.success(isEditing ? "Đã cập nhật phản hồi thành công" : "Đã gửi phản hồi thành công");
      setReplyText("");
      setSelectedReplyTo(null);
      setIsEditing(false);
    } catch (error) {
      message.error(isEditing ? "Không thể cập nhật phản hồi. Vui lòng thử lại sau." : "Không thể gửi phản hồi. Vui lòng thử lại sau.");
    }
  };

  const handleStartReply = (feedback) => {
    // Nếu đang chọn feedback khác, reset form
    if (selectedReplyTo?.id !== feedback.id) {
      setReplyText("");
    }
    setSelectedReplyTo(feedback);
    setIsEditing(false);
  };

  const handleEdit = (feedback) => {
    setSelectedReplyTo(feedback);
    setReplyText(feedback.reply);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSelectedReplyTo(null);
    setReplyText("");
    setIsEditing(false);
  };

  return (
    <div className="feedback-management ">
      <Row gutter={24} className="h-full">
        <Col span={8} className="h-full">
          <Card
            title="Danh sách sản phẩm"
            className="h-full flex flex-col"
            bodyStyle={{
              flex: 1,
              padding: "16px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="flex-1 overflow-hidden">
              <ProductList
                products={products}
                selectedItem={selectedItem}
                productFeedbacks={productFeedbacks}
                isLoading={isLoading}
                onSelectItem={setSelectedItem}
              />
            </div>
          </Card>
        </Col>
        <Col span={16} className="h-full">
          <Card
            title={
              selectedItem
                ? `Đánh giá cho ${
                    products.find((p) => p.id === selectedItem.id)?.name
                  }`
                : "Đánh giá"
            }
            className="h-full flex flex-col"
            bodyStyle={{
              flex: 1,
              padding: "16px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="flex-1 overflow-auto">
              <FeedbackList
                selectedItem={selectedItem}
                feedbacks={selectedProductFeedbacks || []}
                feedbackLoading={feedbackLoading}
                onReply={handleStartReply}
                onEdit={handleEdit}
              />
            </div>
            <div className="mt-4 pt-4 border-t">
              {selectedReplyTo && (
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <span style={{ marginRight: "5px" }}>
                      {isEditing ? "Đang sửa phản hồi cho" : "Đang trả lời"}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: "bold", marginRight: "20px" }}>
                      {selectedReplyTo.userName || "Người dùng"}
                    </span>
                    <Button 
                      type="link" 
                      danger
                      size="small"
                      onClick={handleCancel}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
              <ReplyForm
                replyText={replyText}
                onReplyChange={setReplyText}
                onCancel={handleCancel}
                onSubmit={handleReply}
                isReplying={!!selectedReplyTo}
                isEditing={isEditing}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FeedbackManagement;
