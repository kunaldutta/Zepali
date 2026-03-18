import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://developersdumka.in/IndoNep',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* REQUEST INTERCEPTOR */

apiClient.interceptors.request.use(
  config => {
    console.log("API REQUEST:", config.url);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/* RESPONSE INTERCEPTOR */

apiClient.interceptors.response.use(
  response => {
    console.log("API RESPONSE:", response.data);
    return response;
  },
  error => {
    console.log("API ERROR:", error);
    return Promise.reject(error);
  }
);

export default apiClient;