import axios from 'axios';

//https://zepali.net/IndoNep
//https://developersdumka.in/IndoNep
export const BASE_URL = 'https://zepali.net/IndoNep';
const apiClient = axios.create({
  //developersdumka.in
  baseURL: BASE_URL,
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