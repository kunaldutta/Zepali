import apiClient from './apiClient';


apiClient.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.log("API ERROR:", error);
    return Promise.reject(error);
  }
);