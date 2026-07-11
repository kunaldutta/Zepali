import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import i18n from '../../localization/i18n';
import {globalStyles, colors} from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';

const BillAndRechargeScreen = ({navigation}) => {
  const [options] = useState([
    {
      id: 1,
      title: 'Electricity Bill',
      icon: 'flash-outline',
    },
    {
      id: 2,
      title: 'Mobile Recharge',
      icon: 'phone-portrait-outline',
    },
    {
      id: 3,
      title: 'Internet Billing',
      icon: 'globe-outline',
    },
  ]);

  const handlePress = item => {

    // Navigation Example
    if (item.id === 1) {
      navigation.navigate('ElectricityBillScreen');
    } else if (item.id === 2) {
      navigation.navigate('RechargeScreen');
    } else if (item.id === 3) {
      navigation.navigate('InternetProviderList');
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => handlePress(item)}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={28} color={colors.primary} />
      </View>

      <Text style={styles.title}>{item.title}</Text>

      <Ionicons
        name="chevron-forward"
        size={22}
        color={colors.gray}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      
      <AppHeader
          title={i18n.t("BILLS_AND_RECHARGE") || "Bills & Recharge"}
          onBackPress={() => navigation.goBack()}
          showCart={false}
        />

      <FlatList
        data={options}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default BillAndRechargeScreen;

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
});