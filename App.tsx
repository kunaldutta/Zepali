import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  AppState,
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
import WebViewScreen from './src/screen/WebView/WebViewScreen';
import TestRechargeScreen from './src/screen/Recharges/TestRechargeScreen';
import RechargeStatusScreen from './src/screen/Recharges/RechargeStatusScreen';
import EditProfile from './src/screen/Profile/EditProfile';
import {PointsProvider} from './src/components/PointsContext';
import WalletDetails from './src/screen/Wallet/WalletDetails';
import MyOrdersScreen from './src/screen/Orders/MyOrdersScreen';
import OrderDetailScreen from './src/screen/Orders/OrderDetailsScreen';
import ElectricityBillScreen from './src/screen/ElectricityBill/ElectricityBillScreen';
import BillAndRechargeScreen from './src/screen/NepalBillingAndRecharge/BillAndRechargeScreen';
import PrawasiCardScreen from './src/screen/PrawasiCard/PrawasiCardScreen';
import PrawasiCardNavigator from './src/screen/PrawasiCard/PrawasiCardNavigator';
import MyApplicationsScreen from './src/screen/PrawasiCard/MyApplicationsScreen';
import ReturnOrderScreen from './src/screen/Orders/ReturnOrderScreen';
import ForceUpdateScreen from './src/screen/ForceUpdate/ForceUpdateScreen';
import ServicesScreen from './src/screen/Services/ServicesScreen';
import FeedbackScreen from './src/screen/Orders/FeedbackScreen';
import ReferFriendScreen from './src/screen/ReferalScreen/ReferFriendScreen';
import AddReferralCodeScreen from './src/screen/ReferalScreen/AddReferralCodeScreen';
import InternetProviderList from './src/screen/InternetProviders/InternetProviderList';
import WorldLinkScreen from './src/screen/InternetProviders/WorldLinkScreen';
import InternetBillHistoryScreen from './src/screen/InternetProviders/InternetBillHistoryScreen';
import VianetScreen from './src/screen/InternetProviders/VianetScreen';
import ADSLScreen from './src/screen/InternetProviders/ADSLScreen';
import NTFTTHScreen from './src/screen/InternetProviders/NTFTTHScreen';
import OrderItemHistoryScreen from './src/screen/Orders/OrderItemHistoryScreen';

import {
  requestUserPermission,
  getFCMToken,
  backgroundHandler,
} from './src/services/NotificationService';

import i18n from './src/localization/i18n';
import { fetchCart } from './src/redux/store/slices/cartSlice';

import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

/* CONSTANT */
const STORAGE_KEYS = {
  USER: 'USER_DATA',
  LANGUAGE: 'appLanguage',
};

const Stack = createNativeStackNavigator();

/* INNER APP */
const RootApp = () => {
  const dispatch = useDispatch<any>();
  const isDarkMode = useColorScheme() === 'dark';

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appKey, setAppKey] = useState(0);

  /* INITIAL LOAD */
  useEffect(() => {
  const init = async () => {
    await loadApp();

    await requestUserPermission();
    await getFCMToken();
  };

  init();

  backgroundHandler();
}, []);

  /* NOTIFICATION HANDLER (FOREGROUND) */
  useEffect(() => {

    async function setup() {
      await notifee.createChannel({
        id: 'default',
        name: 'Default',
        importance: AndroidImportance.HIGH,
      });
    }

    setup();

    const unsubscribe = messaging().onMessage(async remoteMessage => {

      console.log("FULL MSG:", remoteMessage);

      try {
        await notifee.displayNotification({
          title: String(remoteMessage?.data?.title || "Notification"),
          body: String(remoteMessage?.data?.body || "You have a new update"),

          android: {
            channelId: 'default',
            smallIcon: 'ic_notification', // ✅ MUST
            importance: AndroidImportance.HIGH,
            pressAction: { id: 'default' },
          },
        });

      } catch (error) {
        console.log("NOTIFEE ERROR:", error);
      }

    });

    return unsubscribe;

  }, []);

  

  /* LOAD APP */
  const loadApp = async () => {
    try {
      const lang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (lang) i18n.locale = lang;

      const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      let parsedUser = null;
      try {
        parsedUser = user ? JSON.parse(user) : null;
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      }

      if (parsedUser?.id) {
        setIsLoggedIn(true);
        dispatch(fetchCart());
      } else {
        setIsLoggedIn(false);
        dispatch({ type: 'cart/clearCart' });
      }

    } catch (error) {
      console.log('App load error:', error);
    } finally {
      setLoading(false);
    }
  };

  globalThis.refreshApp = () => {
    loadApp();
    setAppKey(prev => prev + 1);
  };

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
          <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
          <Stack.Screen name="TestRechargeScreen" component={TestRechargeScreen} />
          <Stack.Screen name="RechargeStatusScreen" component={RechargeStatusScreen} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="WalletDetails" component={WalletDetails} />
          <Stack.Screen name="MyOrdersScreen" component={MyOrdersScreen} />
          <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />
          <Stack.Screen name="ElectricityBillScreen" component={ElectricityBillScreen} />
          <Stack.Screen name="BillAndRechargeScreen" component={BillAndRechargeScreen} />
            <Stack.Screen name="PrawasiCardScreen" component={PrawasiCardScreen} />
            <Stack.Screen name="PrawasiCardNavigator" component={PrawasiCardNavigator} />
            <Stack.Screen name="MyApplicationsScreen" component={MyApplicationsScreen} />
            <Stack.Screen name="ReturnOrderScreen" component={ReturnOrderScreen} />
              <Stack.Screen name="ForceUpdateScreen" component={ForceUpdateScreen} />
              <Stack.Screen name="ServicesScreen" component={ServicesScreen} />
              <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
              <Stack.Screen name="ReferFriendScreen" component={ReferFriendScreen}/>
              <Stack.Screen name="AddReferralCodeScreen" component={AddReferralCodeScreen}/>
              <Stack.Screen name="InternetProviderList" component={InternetProviderList}/>
              <Stack.Screen name="WorldLinkScreen" component={WorldLinkScreen}/>
              <Stack.Screen name="InternetBillHistoryScreen" component={InternetBillHistoryScreen}/>
              <Stack.Screen name="VianetScreen" component={VianetScreen}/>
              <Stack.Screen name="ADSLScreen" component={ADSLScreen}/>
              <Stack.Screen name="NTFTTHScreen" component={NTFTTHScreen}/>
              <Stack.Screen name="OrderItemHistoryScreen" component={OrderItemHistoryScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

/* MAIN APP */
function App() {
  return (
    <Provider store={store}>
      <AddressProvider>
        <PointsProvider>
        <RootApp />
        </PointsProvider>
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