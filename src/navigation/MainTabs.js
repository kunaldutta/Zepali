import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screen/Tabs/HomeScreen';
import Recharge from '../screen/Tabs/Recharge';
import Transactions from '../screen/Tabs/Transactions';
import Profile from '../screen/Tabs/Profile';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#1e90ff',
          tabBarInactiveTintColor: 'gray',
          tabBarIcon: ({color, size}) => {
          let iconName;

            if (route.name === 'Home') {
              iconName = 'home-outline';
            } else if (route.name === 'Recharge') {
              iconName = 'phone-portrait-outline';
            } else if (route.name === 'Transactions') {
              iconName = 'list-outline';
            } else if (route.name === 'Profile') {
              iconName = 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Recharge" component={Recharge} />
        <Tab.Screen name="Transactions" component={Transactions} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    );
}
