import { get, post } from '../network/apiService';
import API from '../network/apiEndpoints';


export const createPayment = async (data) => {
  console.log("API CALL - Create Payment with data:", data);
  return await post(API.CREATE_PAYMENT, data);
};

export const createRazorpayOrder = async (data) => {
  return await post(API.CREATE_ORDER, data);
};
export const calculateAmount = async (data) => {
  return await post(API.CALCULATE_AMOUNT, data);
};

export const verifyRechargePayment = async (data) => {
  try {
    return await post(API.VERIFY_RECHARGE_PAYMENT, data);
  } catch (err) {
    console.log("VERIFY PAYMENT ERROR:", err);
    return { status: false };
  }
};

export const updatePaymentStatus = async (data) => {
  try {
    return await post(API.UPDATE_PAYMENT_STATUS, data);
  } catch (err) {
    console.log("UPDATE STATUS ERROR:", err);
    return { status: false };
  }
};

export const getPaymentConfig = async () => {
  try {
    return await get(API.GET_PAYMENT_CONFIG);
  } catch (err) {
    console.log("GET PAYMENT CONFIG ERROR:", err);
    return { status: false };
  }
};

export const cancelOrderPaymentAPI = async (data) => {
  console.log('API.CANCEL_ORDER', API.CANCEL_ORDER);
  try {
    return await post(
      API.CANCEL_ORDER,
      data
    );
  } catch (err) {
    return {
      status: false,
    };
  }
};