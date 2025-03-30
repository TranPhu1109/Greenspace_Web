import React from "react";
import { List, Avatar, Tag } from "antd";

const ProductList = ({
  products,
  selectedItem,
  productFeedbacks,
  isLoading,
  onSelectItem,
}) => {
  return (
    <List
      className="feedback-item-list"
      itemLayout="horizontal"
      loading={isLoading}
      dataSource={products}
      renderItem={(item) => {
        const isSelected = selectedItem?.id === item.id;
        const productFeedbackList = productFeedbacks[item.id] || [];
        const unreadFeedbacks = productFeedbackList.filter(
          (f) => !f.reply
        ).length;

        return (
          <List.Item
            onClick={() => onSelectItem({ id: item.id, type: "product" })}
            style={{
              cursor: "pointer",
              backgroundColor: isSelected ? "#f6ffed" : "transparent",
              borderLeft: isSelected ? "4px solid #52c41a" : "4px solid transparent",
              transition: "all 0.3s ease",
              padding: "10px",
            }}
          >
            <List.Item.Meta
              avatar={
                <Avatar shape="square" size={64} src={item.image?.imageUrl} />
              }
              title={<div className="flex items-center gap-2">{item.name}</div>}
              description={
                <div className="flex items-center gap-2" style={{ marginTop: "10px"}}>
                  <Tag
                    color="blue"
                    className="rounded px-2 inline-flex"
                  >{`Tổng ${productFeedbackList.length} đánh giá`}</Tag>
                  {unreadFeedbacks > 0 && (
                    <Tag color="red" className="rounded px-2 inline-flex">
                      {unreadFeedbacks} đánh giá chưa trả lời
                    </Tag>
                  )}
                </div>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};

export default ProductList;
