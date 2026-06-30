import {post} from '../network/apiService';
import API from '../network/apiEndpoints';

export const refreshTokenAPI = async refreshToken => {

  return await post(API.REFRESH_TOKEN, {
    refresh_token: refreshToken,
  });

};