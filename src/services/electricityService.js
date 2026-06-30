import apiClient from '../network/apiClient';
import API from '../network/apiEndpoints';

/* =========================
   GET COUNTERS
========================= */

export const getCountersAPI = async () => {
  try {

    const response = await apiClient.get(
      API.GET_COUNTERS,
    );

    return response.data;

  } catch (error) {

    return {
      status: false,
      message: error.message,
    };
  }
};

/* =========================
   GET BILL DETAILS
========================= */

export const getBillDetailsAPI = async data => {
  try {

    const response = await apiClient.post(
      API.GET_BILL_DETAILS,
      data,
    );

    return response.data;

  } catch (error) {

    return {
      status: false,
      message: error.message,
    };
  }
};

/* =========================
   GET SERVICE CHARGE
========================= */

export const getServiceChargeAPI = async data => {
  try {

    const response = await apiClient.post(
      API.GET_SERVICE_CHARGE,
      data,
    );

    return response.data;

  } catch (error) {

    console.log(
      'SERVICE CHARGE ERROR:',
      error,
    );

    return {
      status: false,
      message: error.message,
    };
  }
};

/* =========================
   CREATE RAZORPAY ORDER
========================= */

export const createElectricityOrderAPI = async data => {
  try {

    const response = await apiClient.post(
      API.CREATE_ELECTRICITY_ORDER,
      data,
    );

    return response.data;

  } catch (error) {

    console.log(
      'CREATE ORDER ERROR:',
      error,
    );

    return {
      status: false,
      message: error.message,
    };
  }
};

/* =========================
   MAKE PAYMENT
========================= */

export const makePaymentAPI = async data => {
  try {

    console.log('DATA ==', data);

    const response = await apiClient.post(
      API.MAKE_PAYMENT,
      data,
    );

    return response.data;

  } catch (error) {

    console.log(
      'MAKE PAYMENT ERROR:',
      error,
    );

    return {
      status: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Payment failed',
    };
  }
};

/* =========================
   GET NEW CONSUMER ID
========================= */

export const getNewConsumerIdAPI = async data => {
  try {

    const response = await apiClient.post(
      API.GET_NEW_CONSUMER_ID,
      data,
    );

    return response.data;

  } catch (error) {

    console.log(
      'GET NEW CONSUMER ID ERROR:',
      error,
    );

    return {
      status: false,
      message: error.message,
    };
  }
};

/* =========================
   MAKE PAYMENT V2
========================= */

export const makePaymentV2API = async data => {
  try {

    const response = await apiClient.post(
      API.MAKE_PAYMENT_V2,
      data,
    );

    return response.data;

  } catch (error) {

    console.log(
      'MAKE PAYMENT V2 ERROR:',
      error,
    );

    return {
      status: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Payment failed',
    };
  }
};