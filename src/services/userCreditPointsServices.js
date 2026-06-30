import { get, post } from '../network/apiService';
import API from '../network/apiEndpoints';
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';

export const getUserPointsAPI = async () => {

  return await post(API.GET_USER_POINTS, {
    app_version: DeviceInfo.getVersion(),
    platform: Platform.OS,
  });

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