import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Provider } from 'react-redux';
import { store } from './src/redux/store';

import Login from './src/screen/Login';
import MainTabs from './src/navigation/MainTabs';
import LanguageScreen from './src/screen/LanguageScreen';
import ProductDetailScreen from './src/screen/Product/ProductDetailScreen';
import SearchScreen from './src/screen/Serch/SearchScreen';
import CartScreen from './src/screen/Cart/CartScreen';

import i18n from './src/localization/i18n';

/* ✅ CONSTANT (avoid key mismatch bugs) */
const STORAGE_KEYS = {
  USER: 'USER_DATA',
  LANGUAGE: 'appLanguage',
};

const Stack = createNativeStackNavigator();

function App() {

  const isDarkMode = useColorScheme() === 'dark';

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appKey, setAppKey] = useState(0);

  useEffect(() => {
    loadApp();
  }, []);

  const loadApp = async () => {

    try {

      /* ✅ LOAD LANGUAGE */
      const lang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);

      if (lang) {
        i18n.locale = lang;
      }

      /* ✅ CHECK LOGIN */
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      console.log("App USER_DATA:", userData);

      if (userData) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }

    } catch (error) {
      console.log("App load error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ✅ GLOBAL REFRESH */
  globalThis.refreshApp = () => {
    loadApp();
    setAppKey(prev => prev + 1);
  };

  if (loading) {
    return null;
  }

  return (
    <Provider store={store}>

      <SafeAreaProvider>

        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        <NavigationContainer key={appKey}>

          <Stack.Navigator screenOptions={{ headerShown: false }}>

            {isLoggedIn ? (
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
              />
            ) : (
              <Stack.Screen
                name="Login"
                component={Login}
              />
            )}

            <Stack.Screen name="Language" component={LanguageScreen} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
            <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
            <Stack.Screen name="CartScreen" component={CartScreen} />

          </Stack.Navigator>

        </NavigationContainer>

      </SafeAreaProvider>

    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;