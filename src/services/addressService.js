import { post } from '../network/apiService';
import API from '../network/apiEndpoints';
import i18n from '../localization/i18n';

export const checkServiceableLocationAPI = async data => {
  try {
    console.log('CHECK data:', data);
    return await post(
      API.CHECK_SERVICEABLE_LOCATION,
      {
        ...data,
        lang: i18n.locale,
      }
    );
  } catch (err) {
    console.log('CHECK LOCATION ERROR:', err);
    return {
      status: false,
      message: 'Something went wrong',
    };
  }
};

export const getCityPincodesAPI = async data => {
  try {
    return await post(
      API.GET_CITY_PINCODES,
      data
    );
  } catch (err) {
    console.log(err);

    return {
      status: false,
      pincodes: [],
    };
  }
};

export const getCitiesAPI = async () => {
  try {
    return await post(
      API.GET_PRODUCT_CITY
    );
  } catch (err) {
    console.log(err);

    return {
      status: false,
      cities: [],
    };
  }
};