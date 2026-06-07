import { post } from '../network/apiService';

import API from '../network/apiEndpoints';

import i18n from '../localization/i18n';

/* =========================
   PLACE ORDER
========================= */

export const placeOrderAPI = async data => {
  return await post(

    API.PLACE_ORDER,

    {
      ...data,

      lang: i18n.locale,
    },
  );
};

/* =========================
   CREATE RAZORPAY ORDER
========================= */

export const createOrderRazorpayAPI =
  async data => {

    return await post(

      API.CREATE_RAZORPAY_ORDER,

      {
        ...data,

        lang: i18n.locale,
      },
    );
};

/* =========================
   VERIFY PAYMENT
========================= */

export const verifyOrderPaymentAPI =
  async data => {

    return await post(

      API.VERIFY_ORDER_PAYMENT,

      {
        ...data,

        lang: i18n.locale,
      },
    );
};

export const cancelOrderItemAPI = async data => {
  console.log('DATA ===',data);
  return await post(

    API.CANCEL_ORDER_ITEM,

    {
      ...data,

      lang: i18n.locale,
    },
  );
};

export const requestReturnAPI = async data => {
  return await post(
    API.REQUEST_RETURN,
    {
      ...data,
      lang: i18n.locale,
    },
  );
};