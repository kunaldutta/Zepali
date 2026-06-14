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

    

    const data = await get(url);


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
  

  try {
    const response = await post(API.ADD_ADRESS, data);

    return response;
  } catch (error) {
    console.log("addAddressAPI ERROR:", error);
    throw error;
  }
};

export const deleteAddressAPI = async ({ user_id, address_id }) => {

  try {
    const response = await post(API.DELETE_ADDRESS, {
      user_id,
      address_id,
    });


    return response;
  } catch (error) {
    console.log("deleteAddressAPI ERROR:", error);
    throw error;
  }
};

export const updateAddressAPI = async (data) => {
  

  try {
    const response = await post(API.UPDATE_ADDRESS, data);


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


  try {

    const response = await get(url);


    return response;

  } catch (error) {

    console.log("getProductDetail ERROR:", error);

    throw error;

  }

};

export const addToCartAPI = async (data) => {


  try {

    const response = await post(API.ADD_TO_CART, data);


    return response;

  } catch (error) {

    console.log("addToCartAPI ERROR:", error);

    throw error;

  }

};

export const updateCartAPI = async (data) => {


  try {

    const response = await post(API.UPDATE_CART, data);


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
  // ✅ LOGGING
  const url = `${API.HOME}?lang=${lang}&country_code=${countryCode}`;


  try {

    const response = await get(url);

    

    return response;

  } catch (error) {

    console.log("getHomeData ERROR:", error);

    throw error;

  }

};

export const getCategoryProducts = async (categoryId, lang, country_code) => {

  const url = `${API.CATEGORY_PRODUCTS}?category_id=${categoryId}&lang=${lang}&country_code=${country_code}`;
  
  try {

    const response = await get(url);


    return response;

  } catch (error) {

    console.log("getHomeData ERROR:", error);

    throw error;

  }
};