import apiClient from './apiClient';

export const get = async (url) => {
  try {
    const response = await apiClient.get(url);
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