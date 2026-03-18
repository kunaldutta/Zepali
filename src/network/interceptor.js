import apiClient from './apiClient';


apiClient.interceptors.request.use(
  config => {
    console.log("API REQUEST:", config.url);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

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