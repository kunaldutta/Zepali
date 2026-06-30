import {get, post} from '../network/apiService';
import API from '../network/apiEndpoints';
import i18n from '../localization/i18n';

/* =========================
   GET REFERRAL CODE
========================= */

export const getReferralCodeAPI = async () => {

  return await post(

    API.GET_REFERRAL_CODE,

    {
      lang: i18n.locale,
    }

  );

};

export const applyReferralCodeAPI = async data => {

  return await post(

    API.APPLY_REFERRAL_CODE,

    data,

  );
};