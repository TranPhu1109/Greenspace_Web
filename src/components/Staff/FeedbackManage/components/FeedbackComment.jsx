import React from "react";
import { Avatar, Typography } from "antd";

const { Text } = Typography;

const FeedbackComment = ({ author, avatar, content, datetime, actions, children }) => (
  <div className="feedback-comment">
    <div className="feedback-comment-inner">
      <div className="feedback-comment-avatar">
        {avatar}
      </div>
      <div className="feedback-comment-content">
        <div className="feedback-comment-header">
          <Text strong className="feedback-comment-author">{author}</Text>
          <span className="feedback-comment-time">{datetime}</span>
        </div>
        <div className="feedback-comment-body">
          {content}
        </div>
        {actions && actions.length > 0 && (
          <div className="feedback-comment-actions" style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%"
          }}>
            {actions.map((action, index) => (
              <div key={index}>{action}</div>
            ))}
          </div>
        )}
      </div>
    </div>
    {children && (
      <div className="feedback-comment-nested">
        {children}
      </div>
    )}
  </div>
);

export default FeedbackComment; 