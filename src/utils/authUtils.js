import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

import {refreshTokenAPI} from '../services/authService'; // Update path if needed

/* ==========================================
   FORCE LOGOUT
========================================== */

export const forceLogout = async () => {
  try {

    await AsyncStorage.multiRemove([
      'USER_DATA',
      'SELECTED_ADDRESS',
      'SELECTED_CITY',
      'TOKEN',
    ]);

    // Remove JWT tokens
    await Keychain.resetGenericPassword();

    globalThis.refreshApp?.();

  } catch (error) {

    console.log(
      'forceLogout error:',
      error,
    );
  }
};

/* ==========================================
   REFRESH ACCESS TOKEN
========================================== */

export const refreshAccessToken = async () => {

  try {

    const credentials =
      await Keychain.getGenericPassword();

    if (!credentials) {

      return false;
    }

    const tokens =
    JSON.parse(credentials.password);

    console.log(
      "KEYCHAIN TOKENS =",
      tokens,
    );

    console.log(
      "REFRESH TOKEN =",
      tokens.refresh_token,
    );

    const response =
      await refreshTokenAPI(
        tokens.refresh_token,
      );

    console.log(
      "REFRESH RESPONSE =",
      response,
    );

    if (!response?.status) {

      return false;
    }

    await Keychain.setGenericPassword(
      'zepali',
      JSON.stringify({

        access_token:
          response.access_token,

        refresh_token:
          tokens.refresh_token,

        expires_in:
          response.expires_in,

      }),
    );

    return true;

  } catch (error) {

    console.log(
      'refreshAccessToken Error:',
      error,
    );

    return false;
  }
};