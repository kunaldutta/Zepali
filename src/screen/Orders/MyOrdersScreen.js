import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import { globalStyles, colors } from '../../styles/globalStyles';
import AppHeader from "../../components/AppHeader";
import i18n from '../../localization/i18n';
import {getOrdersAPI} from '../../services/orderService';


const BASE_URL = 'https://zepali.net/IndoNep';

const MyOrdersScreen = () => {
  const navigation = useNavigation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('Call')
      const json = await getOrdersAPI();

      if (json?.status === 'success') {

        setOrders(json.orders || []);

      }

    } catch (error) {
      if (error?.message?.includes('Network Error')|| error?.message?.includes('timeout')) {
                    Alert.alert('Connection error', 'Please check your connection');
                    return;
            }
      console.log(
        'fetchOrders ERROR:',
        error,
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const getStatusColor = status => {
    switch (status) {
      case 'DELIVERED':
        return '#2E7D32';

      case 'CANCELLED':
        return '#D32F2F';

      case 'CONFIRMED':
        return '#1976D2';

      case 'PLACED':
        return '#F57C00';

      default:
        return '#444';
    }
  };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() =>
          navigation.navigate('OrderDetailScreen', {
            orderId: item.order_id,
          })
        }>
        <View style={styles.rowBetween}>
          <Text style={styles.orderNo}>{item.order_no}</Text>

          <Text
            style={[
              styles.status,
              {
                color: getStatusColor(item.order_status),
              },
            ]}>
            {item.order_status}
          </Text>
        </View>

        <Text style={styles.date}>{item.created_at}</Text>

        <View style={styles.divider} />

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Items</Text>
          <Text style={styles.value}>{item.total_items}</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Payment</Text>
          <Text style={styles.value}>{item.payment_status}</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.total}>₹ {item.grand_total}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.safeArea,]}>
        <ActivityIndicator size="large" color="#8B4513" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.safeArea,]}>
      <AppHeader title={i18n.t('MY_ORDERS')} onBackPress={() => navigation.goBack()} />

      <FlatList
        data={orders}
        keyExtractor={item => item.order_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{padding: 16}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Orders Found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default MyOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  header: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  orderNo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },

  status: {
    fontSize: 13,
    fontWeight: '700',
  },

  date: {
    fontSize: 13,
    color: '#666',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 14,
  },

  label: {
    fontSize: 14,
    color: '#666',
  },

  value: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },

  total: {
    fontSize: 17,
    fontWeight: '700',
    color: '#8B4513',
  },

  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#777',
  },
});