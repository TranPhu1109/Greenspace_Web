import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request deduplication
const pendingRequests = new Map();

api.interceptors.request.use(
  (config) => {
    const requestKey = `${config.method}:${config.url}`;
    if (pendingRequests.has(requestKey)) {
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort();
    }
    pendingRequests.set(requestKey, true);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const requestKey = `${response.config.method}:${response.config.url}`;
    pendingRequests.delete(requestKey);
    return response;
  },
  (error) => {
    const requestKey = `${error.config?.method}:${error.config?.url}`;
    pendingRequests.delete(requestKey);
    return Promise.reject(error);
  }
);

export default api;
