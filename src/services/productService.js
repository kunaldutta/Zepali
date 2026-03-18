import { get, post } from '../network/apiService';
import API from '../network/apiEndpoints';

/* FETCH PRODUCTS */

export const fetchProducts = async () => {
  try {
    const data = await get(API.PRODUCTS);
    return data;
  } catch (error) {
    console.log("fetchProducts ERROR:", error);
    throw error;
  }
};

/* ADD TO CART */

export const addToCartAPI = async (data) => {

  console.log("addToCartAPI payload:", data);

  try {

    const response = await post(API.ADD_TO_CART, data);

    console.log("addToCartAPI response:", response);

    return response;

  } catch (error) {

    console.log("addToCartAPI ERROR:", error);

    throw error;

  }

};

/* ADD PRODUCT */

export const addProduct = async (data) => {
  try {
    const response = await post(API.ADD_PRODUCT, data);
    return response;
  } catch (error) {
    console.log("addProduct ERROR:", error);
    throw error;
  }
};

/* HOME DATA */

export const getHomeData = async (lang, countryCode) => {
 console.log("getHomeData called with lang:", lang, "countryCode:", countryCode); // ✅ LOGGING
  const url = `${API.HOME}?lang=${lang}&country_code=${countryCode}`;

  console.log("Calling API:", url);

  try {

    const response = await get(url);

    console.log("Home API response:", response);

    return response;

  } catch (error) {

    console.log("getHomeData ERROR:", error);

    throw error;

  }

};