import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppHeader from '../../components/AppHeader';
import { globalStyles, colors } from '../../styles/globalStyles';
import { BASE_URL } from '../../network/apiClient';

import { getProfileMenuAPI } from '../../services/serviceApi';
import DeviceInfo from 'react-native-device-info';
import * as Keychain from 'react-native-keychain';
import {forceLogout} from '../../utils/authUtils';

export default function Profile({ navigation }) {
  const termsUrl = `${BASE_URL}/delete-account.html`;
  const [userName, setUserName] = useState('User');
  const [user, setUser] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentVersion = DeviceInfo.getVersion();
  const flatListRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      loadUsser();
      loadMenus();
    }, [])
  );

  const loadUsser = async () => {
    try {
      const userData = await AsyncStorage.getItem('USER_DATA');
      const parsedUser = userData ? JSON.parse(userData) : null;

      setUser(parsedUser);
      setUserName(parsedUser?.name || 'User');
    } catch (error) {
      if (error?.message?.includes('Network Error')|| error?.message?.includes('timeout')) {
                    Alert.alert('Connection error', 'Please check your connection');
                    return;
            }
      Alert.alert('Error', 'Something went wrong while loading user data.');
      console.log('USER LOAD ERROR:', error);
    }
  };

  const loadMenus = async () => {
    try {
      setLoading(true);

      const response = await getProfileMenuAPI();

      //console('RESSS ==', response);
      if (response?.status) {
        setMenuData(response.data || []);
      } else {
        setMenuData([]);
      }
    } catch (error) {
      
      if (error?.message?.includes('Network Error')|| error?.message?.includes('timeout')) {
                    Alert.alert('Connection error', 'Please check your connection');
                    return;
            }
      Alert.alert('Error', 'Something went wrong.');
      console.log('MENU ERROR:', error);
      setMenuData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await forceLogout();
            } catch (error) {
              if (error?.message?.includes('Network Error')|| error?.message?.includes('timeout')) {
                    Alert.alert('Connection error', 'Please check your connection');
                    return;
            }
              Alert.alert('Error', 'Something went wrong.');
              console.log(error);
            }
          },
        },
      ]
    );
  };

  const renderItem = useCallback(
    ({ item }) => {
      const onPress = () => {
        if (item.action === 'logout') {
          handleLogout();
          return;
        }
        
        if(item.screen === 'DeleteAccountScreen'){
          navigation.navigate('WebViewScreen', {
                        url: termsUrl,
                      })
        } else {
          navigation.navigate(item.screen);
        }
      };

      return (
        <TouchableOpacity
          style={styles.item}
          onPress={onPress}
        >
          <View style={styles.row}>
            <Ionicons
              name={item.icon}
              size={22}
              color={item.color || '#333'}
              style={styles.icon}
            />

            <Text
              style={[
                styles.text,
                { color: item.color || '#333' },
              ]}
            >
              {item.text}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward-outline"
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  return (
    <SafeAreaView
      style={[
        globalStyles.safeArea,
      ]}
    >
      <AppHeader
        title={'  ' + userName}
        showBack={false}
        showCart={false}
        leftComponent={
          <View style={styles.avatarContainer}>
            <Image
              source={
                user?.user_image
                  ? {
                      uri:
                        BASE_URL +
                        user.user_image,
                    }
                  : require('../../../src/Assets/LoginLogo/user.jpg')
              }
              style={styles.image}
            />
          </View>
        }
      />
      <View
        style={{
          height: '100%',
          backgroundColor: colors.background,
          marginBottom: 20,
        }}
      >
        <View
        style={{
          flex: 1,
          backgroundColor:
            colors.background,
          height: '100%',
        }}
      >
        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator
              size="large"
            />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={menuData}
            keyExtractor={(item) =>
              item.id.toString()
            }
            renderItem={renderItem}
            contentContainerStyle={
              styles.container
            }
            ListHeaderComponent={
              <Text style={styles.title}>
                App Version: {currentVersion}
              </Text>
            }
            showsVerticalScrollIndicator={
              false
            }
            removeClippedSubviews={
              false
            }
          />
        )}
      </View>
      </View>

      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
  flexGrow: 1,
  paddingHorizontal: 16,
  paddingBottom: 80,
  backgroundColor: colors.background,
},

  title: {
    top: 10,
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 20,
    color: '#666',
  },

  item: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#adc78f',
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    marginRight: 12,
  },

  text: {
    fontSize: 16,
    fontWeight: '500',
  },

  avatarContainer: {
    height: 40,
    width: 40,
    backgroundColor:
      '#bd9f9ffe',
    borderRadius: 20,
    overflow: 'hidden',
  },

  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
});