import { get, post } from '../network/apiService';
import API from '../network/apiEndpoints';
import i18n from '../localization/i18n';

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

export const fetchCartAPI = async (customerId, pointsAmount = 0) => {
  try {

    const url = `${API.GET_CART}?customer_id=${customerId}&points_amount=${pointsAmount}&lang=${i18n.locale}`;

    console.log("CART API URL:", url); // 🔥 IMPORTANT DEBUG

    const data = await get(url);

    console.log("fetchCartAPI response:", data);

    return data;

  } catch (error) {

    console.log("fetchCart ERROR:", error);
    throw error;

  }
};

export const fetchAddressesAPI = async (userId) => {
  try {
    return await get(`${API.GET_ADRESS}?usr_id=${userId}`);
  } catch (error) {
    console.log("fetchAddressesAPI ERROR:", error);
    throw error;
  }
};

export const addAddressAPI = async (data) => {
  console.log("addAddressAPI payload:", data);

  try {
    const response = await post(API.ADD_ADRESS, data);

    console.log("addAddressAPI response:", response);

    return response;
  } catch (error) {
    console.log("addAddressAPI ERROR:", error);
    throw error;
  }
};

export const deleteAddressAPI = async ({ user_id, address_id }) => {
  console.log("deleteAddressAPI payload:", { user_id, address_id });

  try {
    const response = await post(API.DELETE_ADDRESS, {
      user_id,
      address_id,
    });

    console.log("deleteAddressAPI response:", response);

    return response;
  } catch (error) {
    console.log("deleteAddressAPI ERROR:", error);
    throw error;
  }
};

export const updateAddressAPI = async (data) => {
  console.log("updateAddressAPI payload:", data);

  try {
    const response = await post(API.UPDATE_ADDRESS, data);

    console.log("updateAddressAPI response:", response);

    return response;
  } catch (error) {
    console.log("updateAddressAPI ERROR:", error);
    throw error;
  }
};
/* ADD TO CART */
export const getProductDetail = async (productId, color = '') => {

  let url = `${API.GET_PRODUCT_DETAIL}?product_id=${productId}&lang=${i18n.locale}`;

  // ✅ USE COLOR (NAME) INSTEAD OF color_code
  if (color) {
    url += `&color=${encodeURIComponent(color)}`;
  }

  console.log("Calling Product Detail API:", url);

  try {

    const response = await get(url);

    console.log("Product Detail response:", response);

    return response;

  } catch (error) {

    console.log("getProductDetail ERROR:", error);

    throw error;

  }

};

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

export const updateCartAPI = async (data) => {

  console.log("updateCartAPI payload:", data);

  try {

    const response = await post(API.UPDATE_CART, data);

    console.log("updateCartAPI response:", response);

    return response;

  } catch (error) {

    console.log("updateCartAPI ERROR:", error);
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

export const getCategoryProducts = async (categoryId, lang, country_code) => {

  const url = `${API.CATEGORY_PRODUCTS}?category_id=${categoryId}&lang=${lang}&country_code=${country_code}`;
  console.log("Calling API:", url);
  // const res = await fetch(url);
  // return await res.json();
  try {

    const response = await get(url);

    console.log("Calling API - Home API response:", response);

    return response;

  } catch (error) {

    console.log("getHomeData ERROR:", error);

    throw error;

  }
};