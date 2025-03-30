import axios from "axios";

const API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY;
const PROJECT_ID = import.meta.env.VITE_GOOGLE_PROJECT_ID;

// Kiểm tra API key có tồn tại không
if (!API_KEY) {
  console.error(
    "Google AI Studio API key is not configured in environment variables"
  );
}

// Cache để lưu kết quả kiểm tra
const contentCache = new Map();

export const checkToxicContent = async (text) => {
  // Kiểm tra cache trước
  if (contentCache.has(text)) {
    return contentCache.get(text);
  }

  // Nếu không có API key, trả về không độc hại
  if (!API_KEY) {
    console.warn("Content moderation is disabled due to missing API key");
    return {
      isToxic: false,
      reason: "",
    };
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Bạn là một hệ thống kiểm duyệt nội dung chuyên nghiệp. Hãy phân tích đoạn văn bản sau để kiểm tra các nội dung không phù hợp:
1. Ngôn từ độc hại, xúc phạm
2. Từ ngữ thô tục, chửi thề
3. Nội dung phân biệt đối xử (giới tính, chủng tộc, tôn giáo...)
4. Đe dọa hoặc quấy rối
5. Spam hoặc quảng cáo không phù hợp
6. Thông tin cá nhân nhạy cảm
7. Nội dung vi phạm pháp luật
8. Nội dung chống phá nhà nước
9. Nội dung chống phá chính phủ
10. Nội dung chống phá chính sách của nhà nước
11. Nội dung chống phá chính sách của chính phủ



Chỉ trả về một đối tượng JSON với định dạng:
{
  "isToxic": boolean,
  "reason": "Lý do chi tiết nếu có nội dung không phù hợp, để trống nếu nội dung phù hợp"
}

Văn bản cần kiểm tra: "${text}"`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Kiểm tra response có đúng format không
    if (!response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid response format from AI Studio:", response.data);
      return { isToxic: false, reason: "" };
    }

    // Lấy text từ response
    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    try {
      // Xử lý text dạng markdown để lấy JSON
      const jsonStr = generatedText.replace(/```json\n|\n```/g, '').trim();
      const result = JSON.parse(jsonStr);

      // Validate kết quả
      if (typeof result.isToxic !== 'boolean' || typeof result.reason !== 'string') {
        console.error("Invalid result format:", result);
        return { isToxic: false, reason: "" };
      }

      // Cache kết quả
      contentCache.set(text, result);
      return result;
    } catch (error) {
      console.error("Error parsing moderation result:", error, "Raw text:", generatedText);
      return { isToxic: false, reason: "" };
    }
  } catch (error) {
    console.error("Error checking content:", error?.response?.data || error);
    return { isToxic: false, reason: "" };
  }
};
