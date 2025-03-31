import axios from '../api/api';
import { message } from 'antd';

const GOOGLE_AI_API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY;
const GOOGLE_PROJECT_ID = import.meta.env.VITE_GOOGLE_PROJECT_ID;

// Cache for search results
const searchCache = new Map();

// Rate limiter configuration
const rateLimiter = {
  tokens: 15, // Maximum tokens per minute
  lastRefill: Date.now(),
  interval: 60000, // 1 minute in milliseconds
  
  async getToken() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    
    // Refill tokens if interval has passed
    if (timePassed >= this.interval) {
      this.tokens = 15;
      this.lastRefill = now;
    }
    
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    
    // Calculate wait time
    const waitTime = this.interval - timePassed;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return this.getToken();
  }
};

// Retry configuration
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Retry with exponential backoff
const retryWithBackoff = async (fn, retryCount = 0) => {
  try {
    return await fn();
  } catch (error) {
    if (retryCount >= retryConfig.maxRetries || 
        !error.response || 
        error.response.status !== 429) {
      throw error;
    }

    const delay = Math.min(
      retryConfig.baseDelay * Math.pow(2, retryCount),
      retryConfig.maxDelay
    );

    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retryCount + 1);
  }
};

// Analyze search query using AI
const analyzeSearchQuery = async (query) => {
  try {
    // Check cache first
    if (searchCache.has(query)) {
      return searchCache.get(query);
    }

    // Get rate limiter token
    const canProceed = await rateLimiter.getToken();
    if (!canProceed) {
      throw new Error('Rate limit exceeded');
    }

    const result = await retryWithBackoff(async () => {
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
              - pageNumber: number (default 0)
              - type: string ("product", "design", or "both" based on context)
              Only include fields that are relevant to the query.
              Make sure all number fields are actual numbers, not strings.`
            }]
          }]
        }
      );

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      const jsonMatch = aiResponse.match(/\{[^]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      return JSON.parse(jsonMatch[0]);
    });

    // Ensure numeric fields
    if (result.minPrice) result.minPrice = Number(result.minPrice);
    if (result.maxPrice) result.maxPrice = Number(result.maxPrice);
    result.pageSize = Number(result.pageSize || 10);
    result.pageNumber = Number(result.pageNumber || 0);
    result.type = result.type || 'both';

    // Cache the result
    searchCache.set(query, result);
    return result;
  } catch (error) {
    console.warn('AI analysis failed:', error);
    return {
      name: query,
      pageSize: 10,
      pageNumber: 0,
      type: 'both'
    };
  }
};

// Search products
const searchProducts = async (query, searchParams) => {
  try {
    // Only search products if type is 'both' or 'product'
    if (searchParams.type && searchParams.type !== 'both' && searchParams.type !== 'product') {
      return [];
    }

    const response = await axios.get('/api/product/search', { 
      params: {
        pageNumber: searchParams.pageNumber,
        pageSize: searchParams.pageSize,
        category: searchParams.category,
        name: searchParams.name,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Search designs
const searchDesigns = async (query, searchParams) => {
  try {
    // Only search designs if type is 'both' or 'design'
    if (searchParams.type && searchParams.type !== 'both' && searchParams.type !== 'design') {
      return [];
    }

    const response = await axios.get('/api/designidea/search', { 
      params: {
        pageNumber: searchParams.pageNumber,
        pageSize: searchParams.pageSize,
        category: searchParams.category,
        name: searchParams.name,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching designs:', error);
    return [];
  }
};

export { searchProducts, searchDesigns, analyzeSearchQuery }; 