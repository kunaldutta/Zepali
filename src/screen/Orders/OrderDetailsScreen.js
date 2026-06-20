import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import { globalStyles, colors } from '../../styles/globalStyles';
import AppHeader from "../../components/AppHeader";
import {cancelOrderItemAPI} from '../../services/orderService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../components/CustomAlert';
import {usePoints} from  '../../components/PointsContext'

const BASE_URL = 'https://zepali.net/IndoNep';

const OrderDetailsScreen = ({route, navigation}) => {
  const {fetchUserPoints} = usePoints();
  const {orderId} = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  // =========================
  // FETCH ORDER DETAILS
  // =========================
  const fetchOrderDetails = async () => {

    try {

      const response = await fetch(
        `${BASE_URL}/get_order_details.php?order_id=${orderId}`,
      );

      const json = await response.json();


      // ✅ FIXED
      if (json.order) {
        setOrder(json.order);
      }

    } catch (error) {

      console.log('fetchOrderDetails ERROR:', error);

    } finally {

      setLoading(false);
    }
  };
  const handleCancelAlert = item => {

      if (item.item_status === 'DELIVERED') {

        navigation.navigate(
          'ReturnOrderScreen',
          {
            orderId: order.order_id,
            orderItemId: item.id,
            paymentMethod: order.payment_method,
          },
        );

        return;
      } else {

        setSelectedItem(item);

        setIsAlertVisible(true);

        setAlertTitle(
          'Cancel Order',
        );

        setAlertMessage(
          'Are you sure you want to cancel this item?'
        );
      }
    };

  const handleCancelItem = async item => {
    setIsAlertVisible(false);
  try {

    const user =
      await AsyncStorage.getItem(
        'USER_DATA',
      );

    const parsedUser =
      JSON.parse(user);

    const response =
      await cancelOrderItemAPI({

        order_item_id: item.id,

        customer_id: parsedUser.id,

        reason:
          'Customer changed mind',
      });

    if (response?.status) {

      Alert.alert(
        'Success',
        response.message,
      );

      await fetchOrderDetails();

      if (parsedUser?.id) {
        await fetchUserPoints(parsedUser.id);
      }

    } else {

      Alert.alert(
        'Error',
        response?.message ||
          'Unable to cancel item',
      );
    }

  } catch (error) {

    console.log(
      'CANCEL ERROR:',
      error,
    );

    Alert.alert(
      'Error',
      'Something went wrong',
    );
  }
};

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeArea
      }>
        <ActivityIndicator size="large" color="#8B4513" />
      </SafeAreaView>
    );
  }

  // =========================
  // NO ORDER
  // =========================
  if (!order) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <Text style={styles.noDataText}>
          No Order Found
        </Text>
      </SafeAreaView>
    );
  }

  // =========================
  // RENDER ITEM
  // =========================
  const renderItem = ({item}) => {

  return (

    <View style={styles.itemCard}>

      <Image
        source={{
          uri: item.image
            ? `${item.image}`
            : 'https://via.placeholder.com/150',
        }}
        style={styles.productImage}
        resizeMode="contain"
      />

      <View style={styles.itemInfo}>

        <Text style={styles.productName}>
          {item.product_name}
        </Text>

        <Text style={styles.measurement}>
          {item.measurement}
        </Text>

        <Text style={styles.quantity}>
          Qty: {item.quantity}
        </Text>

        <Text style={styles.price}>
          ₹ {item.total_price}
        </Text>

        {/* RETURN BUTTON */}

        <TouchableOpacity
          disabled={(!item.returnable && item.item_status === 'DELIVERED') || item.item_status === 'CANCELLED' ||
             item.item_status === 'RETURNED' ||
              item.item_status === 'RETURN_REQUESTED' ||
               item.item_status === 'RETURN_REJECTED' ||
                item.item_status === 'RETURN_APPROVED'}
          style={[
            styles.returnButton, {backgroundColor:  (!item.returnable && item.item_status === 'DELIVERED') || item.item_status === 'CANCELLED' ||
             item.item_status === 'RETURNED' ||
              item.item_status === 'RETURN_REQUESTED' ||
               item.item_status === 'RETURN_REJECTED' ||
                item.item_status === 'RETURN_APPROVED' ? colors.disabledButtonColor : colors.primary},
            (!item.returnable && item.item_status === 'DELIVERED') && styles.returnButtonDisabled,
          ]}
          onPress={() => {
            handleCancelAlert(item);
          }}>

          <Text
            style={[
              styles.returnButtonText,
              (!item.returnable && item.item_status === 'DELIVERED') &&
                styles.returnButtonTextDisabled,
            ]}>

            {(!item.returnable && item.item_status === 'DELIVERED') ? 'Not Returnable' : item.item_status === 'DELIVERED'
              ? 'Return' : item.returnable && (item.item_status === 'RETURNED' ||
              item.item_status === 'RETURN_REQUESTED' ||
                item.item_status === 'RETURN_APPROVED') ? 'Return Requested' : item.item_status === 'RETURN_REJECTED' ? 'Return Rejected'
              : item.item_status ==='CANCELLED' ? 'Cancelled' : 'Cancel'}

          </Text>

        </TouchableOpacity>
              {isAlertVisible && (
          <CustomAlert
            visible={isAlertVisible}
            title={alertTitle}
            message={alertMessage}
            onOk={() => {
              if (selectedItem) {
                handleCancelItem(selectedItem);
              }
            }}
            onCancel={() => setIsAlertVisible(false)}
          />
        )}
      </View>

    </View>
  );
};

  // =========================
  // UI
  // =========================
  return (

    <SafeAreaView style={globalStyles.safeArea}>
        {/* =========================
            HEADER
        ========================= */}
        <AppHeader title="Product Detail" onBackPress={() => navigation.goBack()} />
    <View style={[globalStyles.container, {padding: 0, height: '95%'}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}>        

        {/* =========================
            ORDER INFO
        ========================= */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Order Info
          </Text>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Order No</Text>
            <Text style={styles.value}>
              {order.order_no}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Order Status</Text>
            <Text style={styles.value}>
              {order.order_status}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Payment Status</Text>
            <Text style={styles.value}>
              {order.payment_status}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>
              {order.created_at}
            </Text>
          </View>

        </View>

        {/* =========================
            ADDRESS
        ========================= */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Delivery Address
          </Text>

          <Text style={styles.addressText}>
            {order.delivery_address?.user_name}
          </Text>

          <Text style={styles.addressText}>
            {order.delivery_address?.contact_no}
          </Text>

          <Text style={styles.addressText}>
            {order.delivery_address?.address_1}
          </Text>

          {!!order.delivery_address?.address_2 && (
            <Text style={styles.addressText}>
              {order.delivery_address?.address_2}
            </Text>
          )}

          <Text style={styles.addressText}>
            {order.delivery_address?.city},
            {' '}
            {order.delivery_address?.state}
            {' - '}
            {order.delivery_address?.zip_code}
          </Text>

        </View>

        {/* =========================
            ITEMS
        ========================= */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Items
          </Text>

          <FlatList
            data={order.items}
            keyExtractor={(item, index) =>
              index.toString()
            }
            renderItem={renderItem}
            scrollEnabled={false}
          />

        </View>

        {/* =========================
            BILL SUMMARY
        ========================= */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Bill Summary
          </Text>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>
              Original Price
            </Text>
            <Text style={styles.value}>
              ₹ {order.total_original_price}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>
              Discount
            </Text>
            <Text style={styles.discount}>
              - ₹ {order.total_discount}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>
              GST
            </Text>
            <Text style={styles.value}>
              ₹ {order.gst_amount}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>
              Delivery Charge
            </Text>
            <Text style={styles.value}>
              ₹ {order.delivery_charge}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.grandLabel}>
              Grand Total
            </Text>
            <Text style={styles.grandTotal}>
              ₹ {order.grand_total}
            </Text>
          </View>

        </View>

      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

export default OrderDetailsScreen;

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

  noDataText: {
    fontSize: 16,
    color: '#444',
    fontWeight: '600',
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

  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  label: {
    color: '#666',
    fontSize: 14,
  },

  value: {
    color: '#111',
    fontWeight: '600',
    fontSize: 14,
  },

  discount: {
    color: '#2E7D32',
    fontWeight: '700',
  },

  grandLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },

  grandTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B4513',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },

  addressText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },

  itemCard: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 14,
  },

  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#eee',
  },

  itemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },

  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },

  measurement: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },

  quantity: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },

  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B4513',
    marginTop: 6,
  },
  returnButton: {
  marginTop: 10,
  backgroundColor: colors.primary,
  paddingVertical: 8,
  borderRadius: 8,
  alignItems: 'center',
},

returnButtonDisabled: {
  backgroundColor: '#C7C7C7',
},

returnButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
},

returnButtonTextDisabled: {
  color: '#666666',
},
});