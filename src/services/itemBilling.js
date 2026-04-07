
import { get, post } from '../network/apiService';
import API from '../network/apiEndpoints';
import i18n from '../localization/i18n';
import AsyncStorage from "@react-native-async-storage/async-storage";
export const getCartSummary = async (user_id) => {
    const user = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = JSON.parse(user);
  return await post(API.GET_CART_SUMMARY, { user_id: parsedUser.id, lang: i18n.locale });
};
export const applyGST = async (data) => {
  return await post(API.APPLY_GST, data);
};