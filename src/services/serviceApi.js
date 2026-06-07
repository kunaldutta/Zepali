import API from '../network/apiEndpoints';
import { post } from '../network/apiService';
import i18n from '../localization/i18n';

export const getServices = async () => {
  return await post(API.GET_SERVICES, {
    lang: i18n.locale,
  });
};