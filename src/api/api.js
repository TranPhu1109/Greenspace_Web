// src/config/api.js

import axios from 'axios';

// Định nghĩa base URL từ biến môi trường hoặc dùng giá trị mặc định
const API_BASE_URL = import.meta.env.GREENSPACE_API_BASE_URL || 'http://localhost:3000';

// Tạo một instance của axios với cấu hình chung
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // thời gian chờ request (ms)
});

// Interceptor cho request: bạn có thể thêm token xác thực, header chung,...
api.interceptors.request.use(
  (config) => {
    // Ví dụ: thêm token nếu có
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response: xử lý lỗi chung, logging,...
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
