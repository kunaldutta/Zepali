
import { get, post } from '../network/apiService';
import API from '../network/apiEndpoints';
import i18n from '../localization/i18n';
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';
export const getCartSummary = async (user_id) => {
    const user = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = JSON.parse(user);
  return await post(API.GET_CART_SUMMARY, { user_id: parsedUser.id, lang: i18n.locale });
};
export const applyGST = async (data) => {
  return await post(API.APPLY_GST, data);
};

export const fetchUserPointsAPI = async (cartTotal) => {
  try {
    return await get(
      `${API.GET_USER_POINTS_FOR_USE}?cart_total=${cartTotal}&app_version=${DeviceInfo.getVersion()}&platform=${Platform.OS}`
    );
  } catch (error) {
    console.log('fetchUserPointsAPI ERROR:', error);
    throw error;
  }
};