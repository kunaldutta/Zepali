import { get, post } from '../network/apiService';
import API from '../network/apiEndpoints';

export const getUserPointsAPI = async (data) => {
  console.log("API CALL - Get User Points:", data);
  return await post(API.GET_USER_POINTS, data);
};

export const getUserPointsDetailAPI = async (data) => {
  console.log("API CALL - Get User Points:", data);

  try {
    const response = await post(API.GET_USER_POINTS_DETAIL, data);
    return response;
  } catch (error) {
    console.log("getUserPointsAPI Error:", error);
    return {
      status: false,
      message: "Something went wrong",
    };
  }
};