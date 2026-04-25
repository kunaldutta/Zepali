import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import i18n from '../../localization/i18n';
import { BASE_URL } from '../../network/apiClient';
import { applyGST } from '../../services/itemBilling';

export default function PurchaseReviewScreen({ route, navigation }) {

  const { cartItems: initialCartItems, address } = route.params;

  const [cartItems, setCartItems] = useState(initialCartItems || []);
  const [totalPrice, setTotalPrice] = useState(0);

  console.log('Cart ITEMS ==', initialCartItems);

  // ✅ CALL API ON LOAD
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await applyGST({
        cart_items: initialCartItems   // ✅ correct data
      });

      console.log("API RESPONSE:", res);

      if (res.status) {
        setCartItems(res.cart_items || []);
        setTotalPrice(res.summary.grand_total || 0);
      }
    } catch (error) {
      console.log("Cart Error:", error);
    }
  };

  const confirmOrder = () => {
    Alert.alert("Order Placed", "Your order has been placed successfully!");
    navigation.popToTop();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: BASE_URL + item.image }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.product_name}</Text>
        <Text>Qty: {item.quantity}</Text>
        <Text style={styles.price}>₹ {item.total_price}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>

      <AppHeader
        title={i18n.t('REVIEW_ORDER') || 'REVIEW ORDER'}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />

      {/* ADDRESS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text>{address?.user_name}</Text>
        <Text>{address?.address_1}</Text>
        <Text>{address?.city} - {address?.zip_code}</Text>
      </View>

      {/* ITEMS */}
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.cart_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
        />
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.total}>
          {i18n.t('TOTAL') || 'Total'}: ₹ {totalPrice}
        </Text>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={confirmOrder}
        >
          <Text style={styles.confirmText}>
            {i18n.t('CONFIRM_ORDER') || 'Confirm Order'}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.safeAreaColor
  },

  section: {
    padding: 15,
    backgroundColor: colors.background
  },

  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5
  },

  card: {
    flexDirection: 'row',
    marginBottom: 15
  },

  image: {
    width: 70,
    height: 70,
    marginRight: 10
  },

  name: {
    fontWeight: 'bold'
  },

  price: {
    fontWeight: 'bold'
  },

  footer: {
    padding: 15,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  total: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1
  },

  confirmBtn: {
    backgroundColor: colors.primary,
    padding: '3%',
    borderRadius: 10,
    alignItems: 'center',
    width: '40%',
  },

  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  }
});