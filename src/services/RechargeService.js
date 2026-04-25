import { get, post } from '../network/apiService';
import API from '../network/apiEndpoints';

export const rechargeMobile = async (data) => {
  return await post(API.RECHARGE, data);
};

export const getDataPacks = async (provider) => {
  return await post(API.GET_DATA_PACKS + "?provider=" + provider);
};

export const buyDataPack = async (data) => {
  console.log("API CALL - Buy Data Pack with data:", data);
  return await post(API.BUY_DATA_PACK, data);
};

export const getRechargeHistory = async (data) => {
  console.log("API CALL - Recharge History:", data);
  return await post(API.GET_RECHARGE_HISTORY, data);
};