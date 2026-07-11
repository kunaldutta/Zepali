import API from '../network/apiEndpoints';
import { post } from '../network/apiService';
import i18n from '../localization/i18n';
import { Platform, Alert } from 'react-native';

export const getServices = async () => {
  return await post(API.GET_SERVICES, {
    lang: i18n.locale,
  });
};

export const getProfileMenuAPI = async () => {
  try {
    return await post(API.GET_SETTING_MENU, {
      lang: i18n.locale,
    });
  } catch (err) {
    console.log('PROFILE MENU ERROR:', err);
    if (err?.message?.includes('Network Error')|| err?.message?.includes('timeout')) {
                    Alert.alert('Connection error', 'Please check your connection');
                    return;
            }
    return {
      error: err,
      status: false,
      data: [],
    };
  }
};

export const getAppConfigAPI = async () => {
  try {
    const platform = Platform.OS;
    return await post(API.GET_APP_CONFIG, {platform});

  } catch (err) {

    console.log('APP CONFIG ERROR:', err);

    return {
      status: false,
      data: null,
      message: 'Failed to load app configuration',
    };
  }
};