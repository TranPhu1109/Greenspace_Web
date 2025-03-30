import axios from '../api/api';

const GOOGLE_AI_API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY;
const GOOGLE_PROJECT_ID = import.meta.env.VITE_GOOGLE_PROJECT_ID;

// Cache để lưu kết quả phân tích từ AI
const searchCache = new Map();

// Hàm phân tích query bằng AI
const analyzeSearchQuery = async (query) => {
  try {
    // Kiểm tra cache
    if (searchCache.has(query)) {
      return searchCache.get(query);
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Analyze this search query and extract search parameters: "${query}"
            Return a JSON object with these fields:
            - category: string (if mentioned)
            - name: string (product/design name if mentioned)
            - minPrice: number (if mentioned, convert to number)
            - maxPrice: number (if mentioned, convert to number)
            - pageSize: number (default 10)
            - pageNumber: number (default 1)
            Only include fields that are relevant to the query.
            Make sure all number fields are actual numbers, not strings.
            Example: For "sản phẩm dưới 500k", return {"maxPrice": 500000, "pageSize": 10, "pageNumber": 1}`
          }]
        }]
      }
    );

    let result;
    try {
      // Xử lý response từ AI
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      // Tìm và trích xuất JSON object từ response
      const jsonMatch = aiResponse.match(/\{[^]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid AI response format');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      result = {
        name: query,
        pageSize: 10,
        pageNumber: 1
      };
    }

    // Đảm bảo các trường số là number
    if (result.minPrice) result.minPrice = Number(result.minPrice);
    if (result.maxPrice) result.maxPrice = Number(result.maxPrice);
    result.pageSize = Number(result.pageSize || 10);
    result.pageNumber = Number(result.pageNumber || 1);
    
    // Lưu vào cache
    searchCache.set(query, result);
    return result;
  } catch (error) {
    console.error('Error analyzing search query:', error);
    // Trả về object mặc định nếu có lỗi
    return {
      name: query,
      pageSize: 10,
      pageNumber: 1
    };
  }
};

// Hàm tìm kiếm sản phẩm
const searchProducts = async (query) => {
  try {
    const params = await analyzeSearchQuery(query);
    console.log('Search params:', params); // Log để debug
    const response = await axios.get('/api/product/search', { 
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        category: params.category || undefined,
        name: params.name || undefined,
        minPrice: params.minPrice || undefined,
        maxPrice: params.maxPrice || undefined
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Hàm tìm kiếm ý tưởng thiết kế
const searchDesigns = async (query) => {
  try {
    const params = await analyzeSearchQuery(query);
    console.log('Search params:', params); // Log để debug
    const response = await axios.get('/api/designidea/search', { 
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        category: params.category || undefined,
        name: params.name || undefined,
        minPrice: params.minPrice || undefined,
        maxPrice: params.maxPrice || undefined
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching designs:', error);
    throw error;
  }
};

export { searchProducts, searchDesigns }; 