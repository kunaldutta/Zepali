import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';

export const setLanguage = async (lang) => {
  i18n.locale = lang;
  await AsyncStorage.setItem('appLanguage', lang);
};

export const loadLanguage = async () => {
  const lang = await AsyncStorage.getItem('appLanguage');
  if (lang) {
    i18n.locale = lang;
  }
};