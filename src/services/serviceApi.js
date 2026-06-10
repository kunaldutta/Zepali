import API from '../network/apiEndpoints';
import { post } from '../network/apiService';
import i18n from '../localization/i18n';

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

    return {
      status: false,
      data: [],
    };
  }
};

export const getAppConfigAPI = async () => {
  try {

    return await post(API.GET_APP_CONFIG, {});

  } catch (err) {

    console.log('APP CONFIG ERROR:', err);

    return {
      status: false,
      data: null,
      message: 'Failed to load app configuration',
    };
  }
};