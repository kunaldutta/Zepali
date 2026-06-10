import AsyncStorage from '@react-native-async-storage/async-storage';

export const forceLogout = async () => {
  try {

    await AsyncStorage.multiRemove([
      'USER_DATA',
      'SELECTED_ADDRESS',
      'SELECTED_CITY',
      'TOKEN',
    ]);

    globalThis.refreshApp?.();

  } catch (error) {

    console.log(
      'forceLogout error:',
      error
    );
  }
};