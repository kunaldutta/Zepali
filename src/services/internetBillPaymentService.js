import API from '../network/apiEndpoints';
import {post, get} from '../network/apiService';
import i18n from '../localization/i18n';
import {Alert} from 'react-native';

export const getInternetServiceProvidersAPI = async () => {
  try {
    return await post(API.GET_INTERNET_SERVICE_PROVIDERS, {
      lang: i18n.locale,
    });
  } catch (err) {
    console.log('GET INTERNET PROVIDERS ERROR:', err);

    if (
      err?.message?.includes('Network Error') ||
      err?.message?.includes('timeout')
    ) {
      Alert.alert('Connection Error', 'Please check your internet connection.');
      return;
    }

    return {
      status: false,
      data: [],
      message: 'Unable to fetch internet providers.',
    };
  }
};

export const getWorldLinkDetails = async data => {
  return await post(API.GET_WORLDLINK_DETAILS, data);
};

export const createInternetBillOrder = async data => {
  return await post(API.CREATE_INTERNET_BILL_ORDER, data);
};

export const createInternetNtftthBillOrder = async data => {
  return await post(API.CREATE_NTFTTH_INTERNET_BILL_ORDER, data);
};

export const payInternetNtftthBillOrder = async data => {
  return await post(API.PAY_INTRNET_BILL_NTFTTH, data);
};

export const createInternetBillRazorpayOrder = async data => {
  return await post(API.CREATE_INTERNET_BILL_RAZORPAY_ORDER, data);
};

export const verifyWorldLinkPayment = async data => {
  return await post(
    API.VERIFY_WORLDLINK_PAYMENT,
    data,
  );
};

export const getInternetBillHistory = async () => {
  return await post(API.GET_INTERNET_BILL_HISTORY);
};

export const cancelInternetBillPayment = async data => {
  return await post(
    API.CANCEL_INTERNET_BILL_PAYMENT,
    data,
  );
};

export const getVianetDetails = async data => {
  return await post(
    API.GET_VIANET_DETAILS,
    data,
  );
};

export const createADSLOrder = async data => {
  return await post(
    API.CREATE_ADSL_ORDER,
    data
  );
};
export const createADSLInternetBillRazorpayOrder = async data => {
  return await post(
    API.CREATE_ADSL_INTERNET_BILL_RAZORPAY_ORDER,
    data,
  );
};
export const verifyADSLPayment = async data => {
  return await post(
    API.VERIFY_ADSL_PAYMENT,
    data,
  );
};