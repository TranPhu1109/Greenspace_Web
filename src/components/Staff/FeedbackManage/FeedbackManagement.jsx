// Update imports - remove Comment
import React, { useState } from "react";
import {
  Card,
  Tabs,
  List,
  Avatar,
  Input,
  Button,
  Tag,
  Space,
  Typography,
  Rate,
  Tooltip,
  Image,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  LikeOutlined,
  MessageOutlined,
  SendOutlined,
  StarFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Empty } from "antd";
import "dayjs/locale/vi";
import { View } from "lucide-react";

dayjs.extend(relativeTime);

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Text, Link } = Typography;

// Add CustomComment component
const CustomComment = ({ author, avatar, content, datetime, style }) => (
  <div style={{ display: "flex", gap: "16px", marginBottom: "16px", ...style }}>
    <Avatar
      src={avatar}
      icon={<UserOutlined />}
      style={avatar === undefined ? { backgroundColor: "#87d068" } : {}}
    />
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>{author}</Text>
        {datetime}
      </div>
      <div style={{ marginTop: "8px" }}>{content}</div>
    </div>
  </div>
);

// Add these mock data at the top after existing mock data
const products = [
  {
    id: 1,
    name: "Bàn gỗ cao cấp",
    thumbnail: "https://hoaphathanoi.vn/media/product/2442850_bh24c.jpg",
    unreadFeedbacks: 2,
  },
  {
    id: 2,
    name: "Ghế sofa",
    thumbnail: "https://hoaphathanoi.vn/media/product/2442850_bh24c.jpg",
    unreadFeedbacks: 0,
  },
];

const templates = [
  {
    id: 1,
    name: "Thiết kế phòng khách hiện đại",
    thumbnail: "https://example.com/template1.jpg",
    unreadFeedbacks: 1,
  },
];

const FeedbackManagement = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [replyText, setReplyText] = useState(""); // Changed from object to string
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedReplyTo, setSelectedReplyTo] = useState(null); // Add this line
  const [productFeedbacks, setProductFeedbacks] = useState([
    {
      id: 1,
      productId: 1,
      productName: "Bàn gỗ cao cấp",
      productImage: "https://hoaphathanoi.vn/media/product/2442850_bh24c.jpg",
      userId: 1,
      userName: "Nguyễn Văn A",
      userAvatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      rating: 4.5,
      content:
        "Sản phẩm rất đẹp và chất lượng tốt, gỗ chắc chắn, màu sắc tự nhiên",
      createdAt: "2024-03-20T10:00:00Z",
      replies: [
        {
          id: 1,
          staffId: 1,
          staffName: "Nhân viên Hoa",
          content: "Cảm ơn anh đã tin tưởng và ủng hộ sản phẩm của chúng tôi!",
          createdAt: "2024-03-20T11:00:00Z",
        },
      ],
    },
    {
      id: 2,
      productId: 1,
      productName: "Bàn gỗ cao cấp",
      productImage: "https://hoaphathanoi.vn/media/product/2442850_bh24c.jpg",
      userId: 2,
      userName: "Trần Thị B",
      userAvatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      rating: 3,
      content: "Sản phẩm tạm ổn, nhưng thời gian giao hàng hơi lâu",
      createdAt: "2024-03-19T15:30:00Z",
      replies: [],
    },
    {
      id: 4,
      productId: 1,
      productName: "Bàn gỗ cao cấp",
      productImage: "https://hoaphathanoi.vn/media/product/2442850_bh24c.jpg",
      userId: 2,
      userName: "Trần Thị B",
      userAvatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      rating: 3,
      content: "Sản phẩm tạm ổn, nhưng thời gian giao hàng hơi lâu",
      createdAt: "2024-03-19T15:30:00Z",
      replies: [],
    },
    {
      id: 5,
      productId: 1,
      productName: "Bàn gỗ cao cấp",
      productImage: "https://hoaphathanoi.vn/media/product/2442850_bh24c.jpg",
      userId: 2,
      userName: "Trần Thị B",
      userAvatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      rating: 3,
      content: "Sản phẩm tạm ổn, nhưng thời gian giao hàng hơi lâu",
      createdAt: "2024-03-19T15:30:00Z",
      replies: [],
    },
    {
      id: 3,
      productId: 2,
      productName: "Ghế sofa",
      productImage: "https://hoaphathanoi.vn/media/product/2442850_bh24c.jpg",
      userId: 3,
      userName: "Lê Văn C",
      userAvatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      rating: 5,
      content: "Ghế sofa rất êm và đẹp, phù hợp với phòng khách nhà mình",
      createdAt: "2024-03-18T09:15:00Z",
      replies: [
        {
          id: 2,
          staffId: 2,
          staffName: "Nhân viên Lan",
          content: "Cảm ơn anh đã đánh giá tốt về sản phẩm ạ!",
          createdAt: "2024-03-18T10:20:00Z",
        },
      ],
    },
  ]);

  const [designFeedbacks, setDesignFeedbacks] = useState([
    {
      id: 1,
      templateId: 1,
      templateName: "Thiết kế phòng khách hiện đại",
      templateImage:
        "https://noithattrevietnam.com/uploaded/2019/11/1-thiet-ke-noi-that-phong-khach-hien-dai-2019.jpg",
      userId: 4,
      userName: "Phạm Thị D",
      userAvatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      rating: 5,
      content: "Thiết kế rất đẹp và hiện đại, phù hợp với căn hộ của tôi",
      createdAt: "2024-03-17T14:20:00Z",
      replies: [
        {
          id: 3,
          staffId: 3,
          staffName: "Nhân viên Cúc",
          content:
            "Cảm ơn chị đã tin tưởng lựa chọn mẫu thiết kế của chúng tôi!",
          createdAt: "2024-03-17T15:00:00Z",
        },
      ],
    },
    {
      id: 2,
      templateId: 1,
      templateName: "Thiết kế phòng khách hiện đại",
      templateImage:
        "https://noithattrevietnam.com/uploaded/2019/11/1-thiet-ke-noi-that-phong-khach-hien-dai-2019.jpg",
      userId: 5,
      userName: "Hoàng Văn E",
      userAvatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      rating: 4,
      content: "Thiết kế đẹp nhưng giá hơi cao",
      createdAt: "2024-03-16T11:45:00Z",
      replies: [],
    },
  ]);

  const handleReply = (type) => {
    if (!replyText?.trim() || !selectedReplyTo) return;

    const newReply = {
      id: Date.now(),
      staffId: 1,
      staffName: "Manhddse161260",
      content: replyText,
      createdAt: new Date().toISOString(),
    };

    if (type === "product") {
      setProductFeedbacks((prevFeedbacks) =>
        prevFeedbacks.map((feedback) =>
          feedback.id === selectedReplyTo.feedbackId
            ? { ...feedback, replies: [...feedback.replies, newReply] }
            : feedback
        )
      );
    } else {
      setDesignFeedbacks((prevFeedbacks) =>
        prevFeedbacks.map((feedback) =>
          feedback.id === selectedReplyTo.feedbackId
            ? { ...feedback, replies: [...feedback.replies, newReply] }
            : feedback
        )
      );
    }

    setReplyText("");
    setSelectedReplyTo(null);
  };

  const renderItemList = (items, type) => (
    <List
      className="feedback-item-list"
      itemLayout="horizontal"
      dataSource={items}
      renderItem={(item) => {
        const isSelected = selectedItem?.id === item.id;
        return (
          <List.Item
            onClick={() => setSelectedItem({ id: item.id, type })}
            style={{
              cursor: "pointer",
              backgroundColor: isSelected ? "#f0f0f0" : "transparent",
              // padding: "16px",
            }}
          >
            <List.Item.Meta
              avatar={<Avatar shape="square" size={64} src={item.thumbnail} />}
              title={
                <div className="flex items-center gap-2">
                  {item.name}
                  {item.unreadFeedbacks > 0 && (
                    <Tag color="red" className="rounded-full px-2">
                      {item.unreadFeedbacks}
                    </Tag>
                  )}
                </div>
              }
            />
          </List.Item>
        );
      }}
    />
    // <List
    //   className="feedback-item-list"
    //   itemLayout="horizontal"
    //   dataSource={items}
    //   renderItem={(item) => (
    //     <List.Item
    //       onClick={() => setSelectedItem({ id: item.id, type })}
    //       className={selectedItem?.id === item.id ? "selected" : ""}
    //       style={{ cursor: "pointer" }}
    //     >
    //       <List.Item.Meta
    //         avatar={<Avatar shape="square" size={64} src={item.thumbnail} />}
    //         title={
    //           <div
    //             style={{ display: "flex", alignItems: "center", gap: "8px" }}
    //           >
    //             {item.name}
    //             {item.unreadFeedbacks > 0 && (
    //               <Tag
    //                 color="red"
    //                 style={{ borderRadius: "50%", padding: "0 8px" }}
    //               >
    //                 {item.unreadFeedbacks}
    //               </Tag>
    //             )}
    //           </div>
    //         }
    //       />
    //     </List.Item>
    //   )}
    // />
  );

  const renderFeedbackDetail = () => {
    if (!selectedItem) {
      return <Empty description="Chọn một sản phẩm để xem phản hồi" />;
    }

    const feedbacks =
      selectedItem.type === "product"
        ? productFeedbacks.filter((f) => f.productId === selectedItem.id)
        : designFeedbacks.filter((f) => f.templateId === selectedItem.id);

    if (feedbacks.length === 0) {
      return <Empty description="Chưa có phản hồi nào" />;
    }

    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "#f0f0f0",
          borderRadius: "10px",
          // padding: "10px",
        }}
      >
        <div>
          <List
            itemLayout="vertical"
            dataSource={feedbacks}
            renderItem={(item) => (
              <div
                style={{
                  marginBottom: "15px",
                  borderBottom: "1px solid #f0f0f0",
                  paddingBottom: "5px",
                  padding:"10px"
                }}
              >
                <CustomComment
                  author={<Text strong>{item.userName}</Text>}
                  avatar={item.userAvatar}
                  content={
                    <div className="flex flex-col gap-1">
                      <div>
                        <Rate
                          disabled
                          defaultValue={item.rating}
                          style={{ marginBottom: "8px" }}
                        />
                      </div>
                      <div>
                        <Space>
                          <p>{item.content}</p>
                          <Button
                            type="link"
                            onClick={() =>
                              setSelectedReplyTo({
                                feedbackId: item.id,
                                userName: item.userName,
                              })
                            }
                            icon={<MessageOutlined />}
                          >
                            Phản hồi
                          </Button>
                        </Space>
                      </div>
                    </div>
                  }
                  datetime={
                    <div>
                      <span>
                        {dayjs(item.createdAt).format("HH:mm DD/MM/YYYY ")}
                      </span>
                    </div>
                  }
                />

                {item.replies.map((reply) => (
                  <CustomComment
                    key={reply.id}
                    style={{ marginLeft: 44 }}
                    author={<Text strong>{reply.staffName}</Text>}
                    content={<p>{reply.content}</p>}
                    datetime={
                      <div>
                        <span>
                          {dayjs(reply.createdAt).format("HH:mm DD/MM/YYYY ")}
                        </span>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          />
        </div>
        <div
          style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "white",
            padding: "16px",
            borderTop: "1px solid #f0f0f0",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {selectedReplyTo && (
            <div style={{ marginBottom: 8 }}>
              Đang trả lời <Text strong>{selectedReplyTo.userName}</Text>
              <Button
                type="link"
                size="small"
                onClick={() => setSelectedReplyTo(null)}
              >
                Hủy
              </Button>
            </div>
          )}
          <TextArea
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              selectedReplyTo
                ? `Phản hồi cho ${selectedReplyTo.userName}...`
                : "Nhập phản hồi của bạn..."
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReply(selectedItem.type);
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            style={{ marginTop: 8 }}
            onClick={() => handleReply(selectedItem.type)}
            disabled={!selectedReplyTo}
          >
            Gửi phản hồi
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="feedback-management">
      {/* <Card title="Quản lý phản hồi"> */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Phản hồi sản phẩm" key="products">
          <Row gutter={16}>
            <Col span={8}>
              <Card
                className="product-list-card"
                bordered={false}
                style={{
                  height: "calc(100vh - 205px)", // Đồng bộ height
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d4d4d4 transparent",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#d4d4d4",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#a8a8a8",
                  },
                }}
              >
                {renderItemList(products, "product")}
              </Card>
            </Col>
            <Col span={16}>
              <Card
                className="feedback-detail-card"
                bordered={false}
                style={{
                  height: "calc(100vh - 205px)", // Đồng bộ height
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d4d4d4 transparent",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#d4d4d4",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#a8a8a8",
                  },
                }}
              >
                {renderFeedbackDetail()}
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Phản hồi mẫu thiết kế" key="designs">
          <Row gutter={16}>
            <Col span={8}>
              <Card
                className="design-list-card"
                bordered={false}
                style={{
                  height: "calc(100vh - 205px)", // Đồng bộ height
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d4d4d4 transparent",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#d4d4d4",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#a8a8a8",
                  },
                }}
              >
                {renderItemList(templates, "design")}
              </Card>
            </Col>
            <Col span={16}>
              <Card
                className="feedback-detail-card"
                bordered={false}
                style={{
                  height: "calc(100vh - 205px)",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d4d4d4 transparent",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#d4d4d4",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#a8a8a8",
                  },
                }}
              >
                {renderFeedbackDetail()}
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
      {/* </Card> */}

      {/* Add these styles to your stylesheet */}
      <style jsx>{`
        .feedback-management {
          .product-list-card,
          .design-list-card,
          .feedback-detail-card {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          }

          .ant-list-item {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 8px;
            border: 1px solid #f0f0f0;

            &:hover {
              background-color: #f5f5f5;
            }

            &.selected {
              background-color: #e6f7ff;
              border-color: #91d5ff;
            }
          }

          .feedback-detail-card {
            .ant-comment {
              background: #fafafa;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 16px;
            }
          }
        }
      `}</style>
    </div>
  );
};

export default FeedbackManagement;
