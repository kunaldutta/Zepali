import { get, post } from '../network/apiService';
import API from '../network/apiEndpoints';

export const getUserPointsAPI = async (data) => {
  
  return await post(API.GET_USER_POINTS, data);
};

export const getUserPointsDetailAPI = async (data) => {
  

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