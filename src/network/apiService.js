import apiClient from './apiClient';

export const get = async (url, params = {}) => {
  try {
    const response = await apiClient.get(url, {
      params: params, // 🔥 THIS IS THE FIX
    });

    console.log("GET API:", url, params); // debug

    return response.data;
  } catch (error) {
    console.log("API ERROR:", error);
    throw error;
  }
};

export const post = async (url, data = {}) => {
  try {
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};