import API from '../network/apiEndpoints';
import {post} from '../network/apiService';
import i18n from '../localization/i18n';

export const submitFeedback = async data => {
  return await post(API.SUBMIT_FEEDBACK, {
    ...data,
    lang: i18n.locale,
  });
};