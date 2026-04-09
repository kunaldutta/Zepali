import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  AppState,
  Image,
} from 'react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Provider, useDispatch } from 'react-redux';
import { store } from './src/redux/store';

import Login from './src/screen/Login';
import MainTabs from './src/navigation/MainTabs';
import LanguageScreen from './src/screen/LanguageScreen';
import ProductDetailScreen from './src/screen/Product/ProductDetailScreen';
import SearchScreen from './src/screen/Serch/SearchScreen';
import CartScreen from './src/screen/Cart/CartScreen';
import CategoryProductScreen from './src/screen/Categories/CategoryProductScreen';
import { AddressProvider } from './src/components/AddressContext';
import AddressListScreen from './src/screen/Address/AddressListScreen';
import EditAddressScreen from './src/screen/Address/EditAddressScreen';
import AddAddress from './src/screen/Address/AddAddress';
import PurchaseReviewScreen from './src/screen/Orders/PurchaseReviewScreen';
import MapPicker from './src/screen/Address/MapPicker';
import WishlistScreen from './src/screen/Wish-List/WishlistScreen';
import BookingScreen from './src/screen/BusTicketBooking/BookingScreen';
import BusListScreen from './src/screen/BusTicketBooking/BusListScreen';
import BusSearchScreen from './src/screen/BusTicketBooking/BusSearchScreen';
import TicketBookingStatus from './src/screen/BusTicketBooking/TicketBookingStatus';
import RechargeScreen from './src/screen/Recharges/RechargeScreen';
import RechargeConfirm from './src/screen/Recharges/RechargeConfirm';
import {
  requestUserPermission,
  getFCMToken,
  notificationListener,
  backgroundHandler,
} from './src/services/NotificationService';

import i18n from './src/localization/i18n';
import { fetchCart } from './src/redux/store/slices/cartSlice';


/* ✅ CONSTANT */
const STORAGE_KEYS = {
  USER: 'USER_DATA',
  LANGUAGE: 'appLanguage',
};

const Stack = createNativeStackNavigator();

/* ✅ INNER APP */
const RootApp = () => {
  const dispatch = useDispatch<any>();
  const isDarkMode = useColorScheme() === 'dark';

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appKey, setAppKey] = useState(0);

  /* ✅ INITIAL LOAD */
  useEffect(() => {
    loadApp();
    requestUserPermission();
    getFCMToken();
    notificationListener(); // can pass navigation later
    backgroundHandler();
  }, []);

  // useEffect(() => {
  //   requestUserPermission();
  //   getFCMToken();
  //   notificationListener(); // can pass navigation later
  //   backgroundHandler();
  // }, []);

  /* ✅ APP RESUME HANDLER */
  useEffect(() => {
    if (!AppState) return;

    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        console.log('App resumed → refreshing cart');

        try {
          const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);

          let parsed = null;
          try {
            parsed = user ? JSON.parse(user) : null;
          } catch (e) {
            console.log('Invalid USER_DATA on resume');
            return;
          }

          if (parsed?.id) {
            dispatch(fetchCart(parsed.id));
          }
        } catch (error) {
          console.log('AppState error:', error);
        }
      }
    });

    return () => subscription?.remove();
  }, []);

  /* ✅ LOAD APP */
  const loadApp = async () => {
    try {
      /* ✅ LOAD LANGUAGE */
      const lang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (lang) {
        i18n.locale = lang;
      }

      /* ✅ GET USER */
      const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      console.log('USER_DATA:', user);

      let parsedUser = null;

      try {
        parsedUser = user ? JSON.parse(user) : null;
      } catch (e) {
        console.log('Invalid USER_DATA, clearing...');
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      }

      if (parsedUser?.id) {
        setIsLoggedIn(true);

        /* ✅ LOAD CART */
        dispatch(fetchCart(parsedUser.id));
      } else {
        setIsLoggedIn(false);

        dispatch({
          type: 'cart/clearCart',
        });
      }
    } catch (error) {
      console.log('App load error:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ✅ GLOBAL REFRESH */
  globalThis.refreshApp = () => {
    loadApp();
    setAppKey(prev => prev + 1);
  };

  /* ✅ LOADING UI (NO WHITE SCREEN) */
  if (loading) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <NavigationContainer key={appKey}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="MainTabs" component={MainTabs} />
          ) : (
            <Stack.Screen name="Login" component={Login} />
          )}

          <Stack.Screen name="Language" component={LanguageScreen} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
          <Stack.Screen name="CategoryProductScreen" component={CategoryProductScreen} />
          <Stack.Screen name="CartScreen" component={CartScreen} />
          <Stack.Screen name="AddressListScreen" component={AddressListScreen} />
          <Stack.Screen name="EditAddressScreen" component={EditAddressScreen} />
          <Stack.Screen name="AddAddress" component={AddAddress} />
          <Stack.Screen name="PurchaseReviewScreen" component={PurchaseReviewScreen} />
          <Stack.Screen name="MapPicker" component={MapPicker} />
          <Stack.Screen name="WishlistScreen" component={WishlistScreen} />
          <Stack.Screen name="BookingScreen" component={BookingScreen} />
          <Stack.Screen name="BusListScreen" component={BusListScreen} />
          <Stack.Screen name="BusSearchScreen" component={BusSearchScreen} />
          <Stack.Screen name="TicketBookingStatus" component={TicketBookingStatus} />
          <Stack.Screen name="RechargeScreen" component={RechargeScreen} />
          <Stack.Screen name="RechargeConfirm" component={RechargeConfirm} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

/* ✅ MAIN APP */
function App() {
  return (
    <Provider store={store}>
      <AddressProvider>
        <RootApp />
      </AddressProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;