import React from "react";
import { List, Avatar, Button, Rate, Empty, Spin, Popconfirm, message } from "antd";
import { CommentOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import FeedbackComment from "./FeedbackComment";
import useProductStore from "@/stores/useProductStore";

const FeedbackList = ({ 
  selectedItem, 
  feedbacks, 
  feedbackLoading, 
  onReply,
  onEdit 
}) => {
  const { deleteFeedback } = useProductStore();

  const handleDelete = async (feedbackId) => {
    try {
      await deleteFeedback(feedbackId);
      message.success("Đã xóa đánh giá thành công");
    } catch (error) {
      message.error("Không thể xóa đánh giá. Vui lòng thử lại sau.");
    }
  };

  if (!selectedItem) {
    return (
      <Empty
        className="mt-8"
        description="Chọn một sản phẩm để xem đánh giá"
      />
    );
  }

  if (feedbackLoading) {
    return (
      <div className="text-center py-8">
        <Spin size="large" />
        <p className="mt-4 text-gray-500">Đang tải đánh giá...</p>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <Empty
        className="mt-8"
        description="Sản phẩm này chưa có đánh giá nào"
      />
    );
  }

  return (
    <List
      className="feedback-list"
      itemLayout="vertical"
      dataSource={feedbacks}
      renderItem={(feedback) => (
        <List.Item key={feedback.id}>
          <FeedbackComment
            author={feedback.userName || "Người dùng"}
            avatar={
              <Avatar>
                {feedback.userName ? feedback.userName[0].toUpperCase() : "U"}
              </Avatar>
            }
            content={
              <div>
                <Rate disabled defaultValue={feedback.rating} />
                <p>{feedback.description}</p>
              </div>
            }
            datetime={dayjs(feedback.createdAt).format("DD/MM/YYYY HH:mm")}
            actions={[
              <Button
                key="reply"
                type="link"
                onClick={() => onReply(feedback)}
                icon={<CommentOutlined />}
                disabled={!!feedback.reply}
              >
                Trả lời
              </Button>,
              <div key="spacer" style={{ flex: 1 }}></div>,
              <Popconfirm
                key="delete"
                title="Xóa đánh giá"
                description="Bạn có chắc chắn muốn xóa đánh giá này không?"
                onConfirm={() => handleDelete(feedback.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                >
                  Xóa
                </Button>
              </Popconfirm>
            ]}
          >
            {feedback.reply && (
              <FeedbackComment
                author="Nhân viên"
                avatar={
                  <Avatar style={{ backgroundColor: "#87d068" }}>S</Avatar>
                }
                content={<p>{feedback.reply}</p>}
                datetime={dayjs(feedback.createdAt).format("DD/MM/YYYY HH:mm")}
                actions={[
                  <Button
                    key="edit"
                    type="link"
                    onClick={() => onEdit(feedback)}
                    icon={<EditOutlined />}
                  >
                    Sửa
                  </Button>
                ]}
              />
            )}
          </FeedbackComment>
        </List.Item>
      )}
    />
  );
};

export default FeedbackList; 