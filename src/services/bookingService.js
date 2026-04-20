import { get, post } from '../network/apiService';
import API from '../network/apiEndpoints';
import i18n from '../localization/i18n';
import AsyncStorage from "@react-native-async-storage/async-storage";

// ==========================
// ✅ CREATE ORDER
// ==========================
export const createBookingOrder = async (data) => {
  return await post(API.CREATE_BOOKING_ORDER, {
    ...data,
    lang: i18n.locale,
  });
};

// ==========================
// ✅ TEMP BOOKING (NEW)
// ==========================
export const createTempBooking = async (data) => {
  return await post(API.CREATE_TEMP_BOOKING, {
    ...data,
    lang: i18n.locale,
  });
};

// ==========================
// ✅ INIT BOOKING
// ==========================
export const bookingInit = async (data) => {
  return await post(API.BOOKING_INIT, {
    ...data,
    lang: i18n.locale,
  });
};

// ==========================
// ✅ UPDATE PAYMENT
// ==========================
export const updateBookingPayment = async (data) => {
  return await post(API.UPDATE_BOOKING_PAYMENT, {
    ...data,
    lang: i18n.locale,
  });
};

// ==========================
// ✅ CONFIRM BOOKING
// ==========================
export const confirmBooking = async (data) => {
  return await post(API.CONFIRM_BOOKING, {
    ...data,
    lang: i18n.locale,
  });
};

// ==========================
// 🔥 REFUND USING BOOKING_ID
// ==========================
export const refundBooking = async (data) => {
  return await post(API.REFUND_BOOKING, {
    ...data,
    lang: i18n.locale,
  });
};

export const verifyBusPayment = async (data) => {
  return await post(API.VERIFY_BUS_PAYMENT, {
    ...data,
    lang: i18n.locale,
  });
};

// ==========================
// 🔥 DIRECT REFUND (FALLBACK)
// ==========================
export const refundDirect = async (data) => {
  return await post(API.REFUND_DIRECT, {
    ...data,
    lang: i18n.locale,
  });
};


export const termsAndConditions = async (data) => {
  return await post(API.BUS_TICKET_TERMS_AND_CONDITIONS, {
    ...data,
    language: i18n.locale,   // ✅ ADD THIS
  });
};