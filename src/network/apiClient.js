import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import {refreshAccessToken, forceLogout} from '../utils/authUtils';
import {Alert} from 'react-native';
//DEV = IndoNepDev
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
  async config => {

    try {

      const credentials = await Keychain.getGenericPassword();

      if (credentials) {

        const tokens = JSON.parse(credentials.password);

        if (tokens?.access_token) {

          config.headers.Authorization =
            `Bearer ${tokens.access_token}`;

        }
      }

    } catch (e) {

      console.log("TOKEN ERROR", e);

    }
console.log("config.headers =",config.headers);
    return config;

  },
  error => Promise.reject(error)
);

/* RESPONSE INTERCEPTOR */

apiClient.interceptors.response.use(
  response => {
    return response;
  },

  async error => {
    console.log(
      'API ERROR:',
      error?.response?.data || error.message,
    );

    const originalRequest = error.config;

    const message = error?.response?.data?.message;

    if (message === 'Expired token' && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await refreshAccessToken();

      if (refreshed) {
        return apiClient(originalRequest);
      } else {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await forceLogout();
              },
            },
          ],
          {cancelable: false},
        );

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;