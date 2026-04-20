import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../localization/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {globalStyles,colors} from '../styles/globalStyles';
import AppHeader from '../components/AppHeader';

export default function LanguageScreen({navigation}) {

  const [selectedLang, setSelectedLang] = useState('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    const lang = await AsyncStorage.getItem('appLanguage');

    if (lang) {
      i18n.locale = lang;
      setSelectedLang(lang);
    }
  };

  const changeLanguage = async (lang) => {
    setSelectedLang(lang);
    i18n.locale = lang;

    await AsyncStorage.setItem('appLanguage', lang);

    // Refresh app if global function exists
    if (globalThis.refreshApp) {
      globalThis.refreshApp();
    }
  };

  const RadioButton = ({value, label}) => {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => changeLanguage(value)}
      >
        <View style={styles.radioOuter}>
          {selectedLang === value && <View style={styles.radioInner} />}
        </View>

        <Text style={styles.text}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView  style={globalStyles.safeArea}>
      <AppHeader
        title={i18n.t("LANGUAGE") || "Select Language"}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />
    <View style={styles.container}>

      {/* 🔹 Header with Back Button */}
      

      {/* 🔹 Language Options */}
      <RadioButton value="en" label="English" />
      <RadioButton value="hi" label="हिन्दी" />
      <RadioButton value="ne" label="नेपाली" />

    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background
  },

  header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 30
},

headerTitle: {
  position: 'absolute',
  left: 0,
  right: 0,
  textAlign: 'center',
  fontSize: 20,
  fontWeight: 'bold'
},

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },

  radioOuter: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },

  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary
  },

  text: {
    fontSize: 18
  }

});