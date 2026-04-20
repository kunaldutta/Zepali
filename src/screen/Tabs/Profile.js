import React, {useState, useCallback} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  FlatList
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import i18n from '../../localization/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppHeader from "../../components/AppHeader";
import { globalStyles, colors } from '../../styles/globalStyles';
import { BASE_URL } from '../../network/apiClient';

export default function Profile({navigation}) {

  const [userName,setUserName] = useState('');
  const [user,setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadUsser();
    }, [])
  );

  const loadUsser = async () => {
    const userData = await AsyncStorage.getItem('USER_DATA');
    const parsedUser = userData ? JSON.parse(userData) : null;

    setUser(parsedUser);
    setUserName(parsedUser?.name || 'User');
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {text: "Cancel", style: "cancel"},
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem('USER_DATA');
          if (globalThis.refreshApp) {
            globalThis.refreshApp();
          }
        }
      }
    ]);
  };

  const menuData = [
    {
      id: '1',
      icon: 'person-outline',
      text: i18n.t('EDIT_PROFILE'),
      screen: 'EditProfile'
    },
    {
      id: '2',
      icon: 'location-outline',
      text: i18n.t('ADDRESS'),
      screen: 'AddressListScreen'
    },
    {
      id: '3',
      icon: 'receipt-outline',
      text: i18n.t('ORDER_HISTORY'),
      screen: 'Members'
    },
    {
      id: '4',
      icon: 'language-outline',
      text: i18n.t('LANGUAGE'),
      screen: 'Language'
    },
    {
      id: '5',
      icon: 'ticket-outline',
      text: i18n.t('TICKET_BOOKING_STATUS'),
      screen: 'TicketBookingStatus'
    },
    {
      id: '6',
      icon: 'phone-portrait-outline',
      text: i18n.t('RECHARGE_HISTORY'),
      screen: 'RechargeStatusScreen'
    },
    {
      id: '7',
      icon: 'heart-outline',
      text: i18n.t('WISHLIST'),
      screen: 'WishlistScreen'
    },
    {
      id: '8',
      icon: 'log-out-outline',
      text: i18n.t('LOGOUT'),
      action: 'logout',
      color: 'red'
    }
  ];

  const renderItem = ({item}) => {
    const onPress = () => {
      if (item.action === 'logout') {
        handleLogout();
      } else {
        navigation.navigate(item.screen);
      }
    };

    return (
      <TouchableOpacity style={styles.item} onPress={onPress}>
        <View style={styles.row}>
          <Ionicons
            name={item.icon}
            size={22}
            color={item.color || "#333"}
            style={styles.icon}
          />
          <Text style={[styles.text, {color: item.color || "#333"}]}>
            {item.text}
          </Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#999" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <AppHeader
        title={"  "+userName}
        showBack={false}
        leftComponent={
          <View style={styles.avatarContainer}>
            <Image
              source={
                user?.user_image
                  ? { uri: BASE_URL + user?.user_image }
                  : require('../../../src/Assets/LoginLogo/user.jpg')
              }
              style={styles.image}
            />
          </View>
        }
      />
      <View style={{ backgroundColor: colors.background, height: '100%' }}>
      <FlatList
        data={menuData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        ListHeaderComponent={<Text style={styles.title}>Profile</Text>}
        showsVerticalScrollIndicator={false}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20
  },
  item: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#adc78f',
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    elevation: 2
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    marginRight: 12
  },
  text: {
    fontSize: 16,
    fontWeight: '500'
  },
  avatarContainer: {
    height: 40,
    width: 40,
    backgroundColor: '#bd9f9ffe',
    borderRadius: 20,
    overflow: 'hidden'
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
});