import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import { globalStyles, colors } from '../../styles/globalStyles';
import i18n from '../../localization/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 👇 import your API function
import { getRechargeHistory } from '../../services/RechargeService';

export default function RechargeStatusScreen({navigation}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const userData = await AsyncStorage.getItem('USER_DATA');
      const parsedUser = userData ? JSON.parse(userData) : null;
      
      const response = await getRechargeHistory();

      // depending on your API structure
      if (response?.status) {
        setTransactions(response.data || []);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.log('API ERROR:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success':
        return {color: 'green'};
      case 'Failed':
        return {color: 'red'};
      case 'Refunded':
        return {color: 'orange'};
      case 'Processing':
      case 'Queued':
        return {color: 'blue'};
      default:
        return {color: 'gray'};
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Success':
        return '✔';
      case 'Failed':
        return '✖';
      case 'Refunded':
        return '↺';
      case 'Processing':
      case 'Queued':
        return '⏳';
      default:
        return '•';
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  const renderItem = ({item}) => {
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.number}>{item.number}</Text>
          <Text style={styles.amount}>रु {item.amount}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.status, getStatusColor(item.status)]}>
            {getStatusIcon(item.status)} {item.status}
          </Text>
          <Text style={styles.type}>
            {item.type?.toUpperCase()} | {item.provider}
          </Text>
        </View>

        <Text style={styles.detail}>{item.detail}</Text>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <AppHeader
        title={i18n.t("TICKET_BOOKING_STATUS") || "Ticket Booking Status"}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />

      <FlatList
        data={transactions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 20}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{backgroundColor: colors.background}} // 👈 fixed
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No transactions found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    marginTop: 50,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  number: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  type: {
    fontSize: 12,
    color: '#555',
  },
  detail: {
    marginTop: 5,
    fontSize: 13,
    color: '#444',
  },
  date: {
    marginTop: 8,
    fontSize: 11,
    color: '#999',
  },
});