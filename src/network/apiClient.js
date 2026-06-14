import axios from 'axios';

export const BASE_URL = 'https://zepali.net/IndoNep';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* REQUEST INTERCEPTOR */

apiClient.interceptors.request.use(
  config => {
    return config;
  },
  error => Promise.reject(error)
);

/* RESPONSE INTERCEPTOR */

apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.log("API ERROR:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;