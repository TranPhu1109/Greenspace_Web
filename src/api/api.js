import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:8080',
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export isCancel function từ axios
export const isCancel = axios.isCancel;

// Track pending requests with a more robust approach
const pendingRequests = new Map();

// Create a function to generate unique request identifiers
const getRequestKey = (config) => {
  // Add a custom param to differentiate between different component instances
  // if it exists in the config
  const componentId = config.componentId ? `:${config.componentId}` : '';
  return `${config.method}:${config.url}${componentId}`;
};


// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.backendToken) {
        config.headers.Authorization = `Bearer ${user.backendToken}`;
      }

    }
    
    // Only deduplicate GET requests
    if (config.method === 'get' && !config.allowDuplicate) {
      const requestKey = getRequestKey(config);
      
      // If there's a pending request and it's the same request (not from cleanup)
      if (pendingRequests.has(requestKey) && !config.isCleanupRequest) {
        const controller = pendingRequests.get(requestKey);
        // Abort the previous request
        controller.abort();
        // Remove the aborted request
        pendingRequests.delete(requestKey);
      }
      
      // Create a new controller for this request
      const controller = new AbortController();
      config.signal = controller.signal;
      pendingRequests.set(requestKey, controller);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Clean up the pending request map on success
    const requestKey = getRequestKey(response.config);
    pendingRequests.delete(requestKey);
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized) - token hết hạn hoặc không hợp lệ
    if (error.response && error.response.status === 401) {
      // Xóa token không hợp lệ
      localStorage.removeItem('token');
      // Có thể chuyển hướng người dùng về trang đăng nhập
      // window.location.href = '/login';
    }
    
    // Don't reject if it's just a cancellation - this is expected behavior
    if (isCancel(error)) {
      console.log('Request canceled:', error.message);
      return Promise.resolve({ data: null, status: 'canceled' });
    }
    
    // Clean up the pending request map on error
    if (error.config) {
      const requestKey = getRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }
    
    return Promise.reject(error);
  }
);

// Add a method to clear all pending requests when a component unmounts
api.clearPendingRequests = (componentId) => {
  // If componentId is provided, only clear requests from that component
  if (componentId) {
    pendingRequests.forEach((controller, key) => {
      if (key.includes(`:${componentId}`)) {
        controller.abort();
        pendingRequests.delete(key);
      }
    });
  } else {
    // Otherwise clear all
    pendingRequests.forEach((controller) => {
      controller.abort();
    });
    pendingRequests.clear();
  }
};

// Thêm helper function để cập nhật token
api.setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Thêm helper function để lấy token hiện tại
api.getAuthToken = () => {
  return localStorage.getItem('token');
};

// Thêm helper function để kiểm tra nếu đã đăng nhập
api.isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export default api;
