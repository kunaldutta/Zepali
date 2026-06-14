import AsyncStorage from "@react-native-async-storage/async-storage";
import { get, post } from '../network/apiService'; // 👈 use wrapper
import  API  from '../network/apiEndpoints';


export const checkWishlistAPI = async ({
  product,
  selectedColor,
  selectedVariant,
}) => {
  

  try {
    const user = await AsyncStorage.getItem("USER_DATA");
    const parsed = JSON.parse(user);

    if (!parsed?.id) {
      return {
        status: false,
        is_wishlisted: false,
        message: "Login Required",
      };
    }

    if (!product || !selectedColor) {
      return {
        status: false,
        is_wishlisted: false,
        message: "Invalid product data",
      };
    }

    const validVariant =
      selectedColor?.variants?.find(
        v => v.measurement_value === selectedVariant?.measurement_value
      ) || selectedColor?.variants?.[0];

    const validImage =
      selectedColor?.images?.find(
        v => v.measurement_value === selectedVariant?.measurement_value
      ) || selectedColor?.images?.[0];

    if (!validVariant || !validImage) {
      return {
        status: false,
        is_wishlisted: false,
        message: "Variant/Image missing",
      };
    }

    const url = `${API.CHECK_WISHLIST}?customer_id=${parsed.id}
      &product_id=${product?.id}
      &measurement_id=${validVariant?.measurement_id}
      &image_id=${validImage?.image_id}`;


    const response = await get(url);


    if (!response) {
      return {
        status: false,
        is_wishlisted: false,
        message: "No response",
      };
    }

    return response;

  } catch (error) {
    console.log("checkWishlistAPI ERROR:", error);

    return {
      status: false,
      is_wishlisted: false,
      message: "Something went wrong",
    };
  }
};

export const addToWishlistAPI = async ({
  product,
  selectedColor,
  selectedVariant,
}) => {
  

  try {
    const user = await AsyncStorage.getItem("USER_DATA");
    const parsed = JSON.parse(user);

    if (!parsed?.id) {
      return {
        status: false,
        message: "Login Required",
      };
    }

    // ✅ SAFETY CHECKS
    if (!product || !selectedColor) {
      return {
        status: false,
        message: "Invalid product data",
      };
    }

    const validVariant =
      selectedColor?.variants?.find(
        v => v.measurement_value === selectedVariant?.measurement_value
      ) || selectedColor?.variants?.[0];

    const validImage =
      selectedColor?.images?.find(
        v => v.measurement_value === selectedVariant?.measurement_value
      ) || selectedColor?.images?.[0];

    if (!validVariant || !validImage) {
      return {
        status: false,
        message: "Variant/Image missing",
      };
    }

    const payload = {
      user_id: parsed.id,
      product_id: product?.id,
      measurement_id: validVariant?.measurement_id,
      image_id: validImage?.image_id,
    };



    // ✅ API CALL SAFE
    const response = await post(API.ADD_WISHLIST, payload);

    

    // ✅ HANDLE EMPTY RESPONSE
    if (!response) {
      return {
        status: false,
        message: "No response from server",
      };
    }

    return response;

  } catch (error) {
    console.log("addToWishlistAPI ERROR:", error);

    // ❌ DO NOT throw → this was crashing your app
    return {
      status: false,
      message: "Something went wrong",
    };
  }
};



export const removeFromWishlistAPI = async (wishlist_id) => {
  try {
    const user = await AsyncStorage.getItem("USER_DATA");
    const parsed = JSON.parse(user);

    if (!parsed?.id) {
      return {
        status: false,
        message: "Login Required",
      };
    }
    
    const payload = {
      user_id: parsed.id,
      wishlist_id,
    };


    const response = await post(API.REMOVE_WISHLIST, payload);

    if (!response) {
      return {
        status: false,
        message: "No response from server",
      };
    }

    return response;

  } catch (error) {
    console.log("removeFromWishlist ERROR:", error);

    return {
      status: false,
      message: "Something went wrong",
    };
  }
};
export const getWishlistAPI = async () => {
  try {
    const user = await AsyncStorage.getItem("USER_DATA");
    const parsed = JSON.parse(user);

    if (!parsed?.id) {
      return {
        status: false,
        wishlist: [],
        message: "Login Required",
      };
    }

    const url = `${API.GET_WISHLIST}?user_id=${parsed.id}&lang=en`;

    const response = await get(url);

    if (!response) {
      return {
        status: false,
        wishlist: [],
        message: "No response",
      };
    }

    return response;

  } catch (error) {
    console.log("getWishlistAPI ERROR:", error);

    return {
      status: false,
      wishlist: [],
      message: "Something went wrong",
    };
  }
};