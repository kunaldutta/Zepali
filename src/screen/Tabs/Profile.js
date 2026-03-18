import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import i18n from '../../localization/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile({navigation}) {

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {text: "Cancel", style: "cancel"},
      {text: "Logout", onPress: async () => {
        await AsyncStorage.removeItem('USER_DATA');
        if (globalThis.refreshApp) {
          globalThis.refreshApp();
        }

        console.log("Logout pressed")}}
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('Members')}>
        <Text style={styles.text}>{i18n.t('ORDER_HISTORY')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('Language')}>
        <Text style={styles.text}>{i18n.t('LANGUAGE')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={handleLogout}>
        <Text style={[styles.text, {color: 'red'}]}>{i18n.t('LOGOUT')}</Text>
      </TouchableOpacity>

    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:{
  flex:1,
  backgroundColor:"#fff"
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20
  },
  item: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12
  },
  text: {
    fontSize: 16,
    fontWeight: '500'
  }
});