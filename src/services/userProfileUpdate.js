import axios from 'axios';
import { BASE_URL } from '../network/apiClient';
import API from '../network/apiEndpoints';

export const updateUserProfile = async (data) => {
  try {
    const response = await axios.post(
      `${BASE_URL}${API.UPDATE_USER_PROFILE}`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;

  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    return {
      status: 'error',
      message: error.message,
    };
  }
};