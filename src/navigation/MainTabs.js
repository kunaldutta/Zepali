import React from 'react';
import {View, Platform} from 'react-native'; // ✅ add Platform
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screen/Tabs/HomeScreen';
import Recharge from '../screen/Tabs/Recharge';
import Transactions from '../screen/Tabs/Transactions';
import Profile from '../screen/Tabs/Profile';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../styles/globalStyles';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,

        // ✅ FIX for iOS + Android
        tabBarStyle: {
          backgroundColor: colors.BottomTabBarBackground,
          height: Platform.OS === 'ios' ? 90 : 110, // 👈 fix
          paddingBottom: Platform.OS === 'ios' ? 20 : 0, // 👈 fix
          
        },

        tabBarActiveTintColor: colors.activeTabBackground,
        tabBarInactiveTintColor: colors.inactiveTabBackground,

        tabBarLabelStyle: {
          fontSize: 10,
          top: 11, // 👈 move label up
          marginBottom: Platform.OS === 'ios' ? 5 : 10, // 👈 fix
        },

        tabBarHideOnKeyboard: true,

        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Recharge') iconName = 'phone-portrait-outline';
          else if (route.name === 'Transactions') iconName = 'list-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';

          return (
            <View
              style={{
                backgroundColor: focused
                  ? colors.primary
                  : 'transparent',
                borderRadius: 6,
                height: 55,
                width: 65,
                top: Platform.OS === 'ios' ? -12 : 10,
                // ❌ remove top:12 → causes iOS issues
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Recharge" component={Recharge} />
      <Tab.Screen name="Transactions" component={Transactions} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}