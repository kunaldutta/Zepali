import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screen/Tabs/HomeScreen';
import RechargeScreen from '../screen/Recharges/RechargeScreen';
import TestRechargeScreen from '../screen/Recharges/TestRechargeScreen';
import Transactions from '../screen/Tabs/Transactions';
import Profile from '../screen/Tabs/Profile';
import BillAndRechargeScreen from '../screen/NepalBillingAndRecharge/BillAndRechargeScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles/globalStyles';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const insets = useSafeAreaInsets(); // ✅ handles all Android devices

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // ✅ FIXED TAB BAR STYLE (NO HARD HEIGHT ISSUE)
        tabBarStyle: {
          backgroundColor: colors.BottomTabBarBackground,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
        },

        tabBarActiveTintColor: colors.activeTabBackground,
        tabBarInactiveTintColor: colors.inactiveTabBackground,

        // ✅ CLEAN LABEL STYLE (NO top)
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 6,
        },

        tabBarAllowFontScaling: false, // ✅ prevent device font scaling issue

        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },

        tabBarHideOnKeyboard: true,

        tabBarButton: (props) => (
          <TouchableOpacity {...props} activeOpacity={1} />
        ),

        // ✅ ICON FIX (NO top, NO SHIFTING)
        tabBarIcon: ({ focused, color }) => {
  let iconName;

  if (route.name === 'Home') iconName = 'home-outline';
  else if (route.name === 'NepalBilling') iconName = 'phone-portrait-outline';
  else if (route.name === 'Transactions') iconName = 'list-outline';
  else if (route.name === 'Profile') iconName = 'person-outline';

  return (
    <View
      style={{
        backgroundColor: focused ? colors.primary : 'transparent',
        borderRadius: 8,
        height: 55,
        width: 75,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15, // ✅ balanced (instead of 20)
      }}
    >
      <Ionicons name={iconName} size={22} color={color} />
    </View>
  );
},
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="NepalBilling" component={BillAndRechargeScreen} />
      <Tab.Screen name="Transactions" component={Transactions} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}