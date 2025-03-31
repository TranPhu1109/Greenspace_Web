import React from "react";
import { Input, Button } from "antd";
import { SendOutlined, EditOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const ReplyForm = ({ replyText, onReplyChange, onCancel, onSubmit, isReplying, isEditing }) => {
  const handleKeyDown = (e) => {
    // Nếu nhấn Enter mà không nhấn Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Ngăn không cho xuống dòng
      if (replyText.trim()) {
        onSubmit(); // Gửi phản hồi
      }
    }
    // Nếu nhấn Shift + Enter thì để mặc định xuống dòng
  };

  return (
    <div className="reply-form">
      <TextArea
        rows={2}
        value={replyText}
        onChange={(e) => onReplyChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isEditing 
            ? "Chỉnh sửa phản hồi của bạn... (Enter để gửi, Shift + Enter để xuống dòng)"
            : isReplying 
              ? "Nhập phản hồi của bạn... (Enter để gửi, Shift + Enter để xuống dòng)"
              : "Chọn một phản hồi để trả lời..."
        }
        disabled={!isReplying}
      />
      <div className="flex justify-end gap-2 mt-2" style={{ marginTop: '10px' }}>
          <>
            <Button onClick={onCancel} style={{ marginRight: '10px' }}>Hủy</Button>
            <Button 
              type="primary" 
              onClick={onSubmit} 
              icon={isEditing ? <EditOutlined /> : <SendOutlined />}
              disabled={isEditing ? !replyText.trim() : !isReplying}
            >
              {isEditing ? "Cập nhật" : "Gửi phản hồi"}
            </Button>
          </>
      </div>
    </div>
  );
};

export default ReplyForm; 