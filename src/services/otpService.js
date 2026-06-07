import axios from 'axios';
import {BASE_URL} from '../network/apiClient';
import API from '../network/apiEndpoints';

export const sendOtpApi = async data => {
  try {
    const response = await axios.post(
      `${BASE_URL}${API.SEND_OTP}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;

  } catch (error) {
    console.log('SEND OTP ERROR:', error);

    return {
      status: false,
      message: error.message,
    };
  }
};

export const verifyOtpApi = async data => {
  try {
    const response = await axios.post(
      `${BASE_URL}${API.VERIFY_OTP}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;

  } catch (error) {
    console.log('VERIFY OTP ERROR:', error);

    return {
      status: false,
      message: error.message,
    };
  }
};