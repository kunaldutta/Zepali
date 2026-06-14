import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';

import AsyncStorage
from '@react-native-async-storage/async-storage';

import RazorpayCheckout
from 'react-native-razorpay';

import { SafeAreaView }
from 'react-native-safe-area-context';

import Ionicons
from 'react-native-vector-icons/Ionicons';

import { colors, globalStyles }
from '../../styles/globalStyles';

import AppHeader
from '../../components/AppHeader';
import DeviceInfo from 'react-native-device-info';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../redux/store/slices/cartSlice';
import {forceLogout} from '../../utils/authUtils'
import {usePoints} from  '../../components/PointsContext'

import {

  placeOrderAPI,

  createOrderRazorpayAPI,

  verifyOrderPaymentAPI,

} from '../../services/orderService';
import { cancelOrderPaymentAPI } from '../../services/paymentService';
import i18n from '../../localization/i18n';

export default function PurchaseReviewScreen({
  route,
  navigation,
}) {
   const {fetchUserPoints} = usePoints();
  const {
    address,
    summary,
  } = route.params;

  const [paymentMethod, setPaymentMethod] = useState(summary.
    grand_total > 0 ? 'ONLINE' : 'COD');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
 

  /* ================= PLACE ORDER ================= */

  const showInvalidUserAlert = (message) => {
            Alert.alert(
              'Account Issue',
              message || 'Please login again',
              [
                {
                  text: 'OK',
                  onPress: forceLogout,
                },
              ]
            );
    };
  const confirmOrder = async () => {

  try {

    if (loading) return;

    setLoading(true);

    /* =========================
       USER
    ========================= */

    const user =
      await AsyncStorage.getItem(
        'USER_DATA',
      );

    const parsedUser =
      user ? JSON.parse(user) : null;

    if (!parsedUser?.id) {

      Alert.alert(
        'Login Required',
        'Please login again',
      );

      return;
    }

    /* =========================
       PLACE ORDER
    ========================= */

    const response =
  await placeOrderAPI({

    customer_id:
      parsedUser.id,

    address_id:
      address?.id,

    payment_method:
      paymentMethod,

    /* =========================
       BILLING DATA
    ========================= */

        points_used:
      Number(
        summary?.points_discount || 0,
      ),

    points_discount:
      Number(
        summary?.points_discount || 0,
      ),

    product_discount:
      Number(
        (summary?.total_discount - summary?.points_discount) || 0,
      ),

    total_discount:
      Number(
        summary?.total_discount || 0,
      ),

    total_original_price:
      Number(
        summary?.total_original_price || 0,
      ),

    gst_amount:
      Number(
        summary?.total_gst_amount || 0,
      ),

    grand_total:
      Number(
        summary?.grand_total || 0,
      ),
    platform: Platform.OS === 'ios' ? 'iOS' : 'Android',
    app_version: DeviceInfo.getVersion(),
  });


    /* =========================
       API ERROR
    ========================= */
    if (response.status === 'force_update') {

        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'ForceUpdateScreen',
              params: {
                versionData: {
                latestVersion: response?.version?.latest_version,
                updateMessage: response?.version?.update_message,
                storeUrl: response?.version?.store_url,
                currentVersion: DeviceInfo.getVersion(),
              },
              },
            },
          ],
        });

        return;
    }
    if (
      response?.status !== 'success'
    ) {

      showInvalidUserAlert(response?.message || 'Something went wrong',)

      return;
    } 

    /* =========================
       COD SUCCESS
    ========================= */

    if (paymentMethod === 'COD') {
      const userData = await AsyncStorage.getItem('USER_DATA');
      const parsedUser = userData ? JSON.parse(userData) : null;
      dispatch(clearCart());
      if (userData && Number(summary.points_discount) > 0) {

      fetchUserPoints(parsedUser?.id); // ✅ auto load
    }
      Alert.alert(

        'Order Placed',

        `Your order ${response?.order_no} has been placed successfully!`,

        [
          {
            text: 'OK',

            onPress: () => {

              navigation.reset({

                index: 0,

                routes: [
                  {
                    name: 'MainTabs',
                  },
                ],
              });
            },
          },
        ],
      );

      return;
    }

    /* =========================
       CREATE RAZORPAY ORDER
    ========================= */

    const razorpayResponse =

      await createOrderRazorpayAPI({

        order_id:
          response?.order_id,
      });


    if (
      !razorpayResponse?.status
    ) {

      Alert.alert(

        'Payment Error',

        razorpayResponse?.message ||

          'Unable to initiate payment',
      );

      return;
    }

    /* =========================
       OPEN RAZORPAY
    ========================= */

    const options = {

      description:
        'Zepali Order Payment',

      currency: 'INR',

      key:
        razorpayResponse?.key,

      amount:
        razorpayResponse?.amount,

      order_id:
        razorpayResponse?.razorpay_order_id,

      name: 'Zepali',

      prefill: {

        contact:
          address?.contact_no || '',

        name:
          address?.user_name || '',
      },

      theme: {
        color: colors.primary,
      },
    };

    RazorpayCheckout.open(options)

      .then(async data => {

        try {

          /* =========================
             VERIFY PAYMENT
          ========================= */

          const verifyResponse =

            await verifyOrderPaymentAPI({

              order_id:
                response?.order_id,

              razorpay_payment_id:
                data?.razorpay_payment_id,

              razorpay_order_id:
                data?.razorpay_order_id,

              razorpay_signature:
                data?.razorpay_signature,
            });


          if (
            !verifyResponse?.status
          ) {

            Alert.alert(

              'Verification Failed',

              verifyResponse?.message ||

                'Payment verification failed',
            );

            return;
          }

          /* =========================
             SUCCESS
          ========================= */
          dispatch(clearCart());
          const userData = await AsyncStorage.getItem('USER_DATA');
      const parsedUser = userData ? JSON.parse(userData) : null;
      if (userData && Number(summary.points_discount) > 0) {

      fetchUserPoints(parsedUser?.id); // ✅ auto load
    }
          Alert.alert(

            'Payment Successful',

            'Your order has been confirmed.',

            [
              {
                text: 'OK',

                onPress: () => {

                  navigation.reset({

                    index: 0,

                    routes: [
                      {
                        name: 'MainTabs',
                      },
                    ],
                  });
                },
              },
            ],
          );

        } catch (error) {


          Alert.alert(

            'Error',

            'Payment done but verification failed',
          );
        }
      })

      .catch(async error => {

      console.log('RAZORPAY ERROR:', error);

      try {

        console.log(
          'cancelOrderPaymentAPI:',
          cancelOrderPaymentAPI
        );
        const paymentStatus =
        error?.code === 0
          ? 'CANCELLED'
          : 'FAILED';
        const res =
          await cancelOrderPaymentAPI({
            order_id: response?.order_id,
            payment_status: paymentStatus,
          });


      } catch (e) {

        console.log(
          'CANCEL ORDER ERROR:',
          e
        );
      }

      Alert.alert(
        error?.code === 0
          ? 'Payment Cancelled'
          : 'Payment Failed'
      );

    });

  } catch (error) {

    console.log(
      'PLACE ORDER ERROR:',
      error,
    );

    Alert.alert(
      'Error',
      'Something went wrong',
    );

  } finally {

    setLoading(false);
  }
};

  return (
    <SafeAreaView style={globalStyles.safeArea}>

      {/* HEADER */}

      <AppHeader
        title={'Checkout'}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* ================= ADDRESS ================= */}

        <View style={styles.card}>

          <View style={styles.rowBetween}>

            <Text style={styles.sectionTitle}>
              Delivery Address
            </Text>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.changeText}>
                Change
              </Text>
            </TouchableOpacity>

          </View>

          <Text style={styles.name}>
            {address?.user_name}
          </Text>

          <Text style={styles.addressText}>
            {address?.address_1}
          </Text>

          {!!address?.address_2 && (
            <Text style={styles.addressText}>
              {address?.address_2}
            </Text>
          )}

          <Text style={styles.addressText}>
            {address?.city}, {address?.state} - {address?.zip_code}
          </Text>

          <Text style={styles.phone}>
            +91 {address?.contact_no}
          </Text>

        </View>

        {/* ================= BILLING SUMMARY ================= */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Billing Summary
          </Text>

          {/* TOTAL ORIGINAL PRICE */}

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>
              Total Original Price
            </Text>

            <Text style={styles.billValue}>
              ₹ {Number(summary?.total_original_price || 0).toFixed(2)}
            </Text>
          </View>

          {/* POINTS USED */}

          {!!Number(summary?.points_used || 0) && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                Points Used {summary?.points_discount}
              </Text>

              <Text style={styles.discountText}>
                {summary?.points_discount}
                - ₹ {Number(summary?.points_discount || 0).toFixed(2)}
              </Text>
            </View>
          )}

          {/* TOTAL DISCOUNT */}

          {/* PRODUCT DISCOUNT */}

          {!!(
            Number(summary?.total_discount || 0) -
            Number(summary?.points_used || 0)
          ) && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                Point Used
              </Text>
              
              <Text style={styles.discountText}>
                - ₹ {(
                  Number(summary?.points_discount || 0) -
                  Number(summary?.points_used || 0)
                ).toFixed(2)}
              </Text>
            </View>
          )}
          {!!(
            Number(summary?.total_discount || 0) -
            Number(summary?.points_used || 0)
          ) && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                Product Discount
              </Text>
              
              <Text style={styles.discountText}>
                - ₹ {(
                  Number(summary?.total_discount || 0) -
                  Number(summary?.points_discount || 0)
                ).toFixed(2)}
              </Text>
            </View>
          )}
          {!!(
            Number(summary?.total_discount || 0) -
            Number(summary?.points_used || 0)
          ) && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                Total Discount
              </Text>
              
              <Text style={styles.discountText}>
                - ₹ {(
                  Number(summary?.total_discount || 0) 
                ).toFixed(2)}
              </Text>
            </View>
          )}

          {/* GST */}

          {!!Number(summary?.total_gst_amount || 0) && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                GST Amount
              </Text>

              <Text style={styles.billValue}>
                ₹ {Number(summary?.total_gst_amount || 0).toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* NET PAYABLE */}

          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>
              Net Payable
            </Text>

            <Text style={styles.totalValue}>
              ₹ {Number(summary?.grand_total || 0).toFixed(2)}
            </Text>
          </View>

        </View>

        {/* ================= PAYMENT ================= */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Payment Method
          </Text>

          {/* COD */}

          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => setPaymentMethod('COD')}
          >

            <View style={styles.paymentLeft}>

              <Ionicons
                name={
                  paymentMethod === 'COD'
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={22}
                color={colors.primary}
              />

              <Text style={styles.paymentText}>
                Cash on Delivery
              </Text>

            </View>

          </TouchableOpacity>

          {/* ONLINE */}

          <TouchableOpacity
            style={[styles.paymentOption, { opacity: Number(summary?.grand_total || 0) <= 0 ? 0.5 : 1 }]}
            disabled={Number(summary?.grand_total || 0) <= 0}
            onPress={() => setPaymentMethod('ONLINE')}
          >

            <View style={styles.paymentLeft}>

              <Ionicons
                name={
                  paymentMethod === 'ONLINE'
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={22}
                color={colors.primary}
              />

              <Text style={styles.paymentText}>
                Pay Online
              </Text>

            </View>

          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* ================= FOOTER ================= */}

      <View style={styles.footer}>

        <View>

          <Text style={styles.footerLabel}>
            Total Payable
          </Text>

          <Text style={styles.footerAmount}>
            ₹ {Number(summary?.grand_total || 0).toFixed(2)}
          </Text>

        </View>

        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={confirmOrder}
          disabled={loading}
        >

          <Text style={styles.placeOrderText}>

          {loading
            ? 'Please Wait...'
            : paymentMethod === 'ONLINE'
            ? 'Proceed To Pay'
            : 'Place Order'}

        </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },

  changeText: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },

  addressText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },

  phone: {
    marginTop: 5,
    fontWeight: '600',
    color: colors.text,
  },

  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 7,
  },

  billLabel: {
    fontSize: 15,
    color: '#555',
  },

  billValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },

  discountText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'green',
  },

  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },

  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },

  paymentOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
  },

  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },

  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  footerLabel: {
    fontSize: 12,
    color: '#777',
  },

  footerAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },

  placeOrderBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 10,
  },

  placeOrderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

});