import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator
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
import {getAppConfigAPI} from '../../services/serviceApi'

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
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(summary.
    grand_total > 0 ? 'COD' : 'ONLINE');
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const dispatch = useDispatch(); 
  
  useEffect(() => {
  loadAppConfig();
}, []);

const loadAppConfig = async () => {

  try {
    setConfigLoading(true);
    const response = await getAppConfigAPI();

    console.log('APP CONFIG:', response);

    if (response?.status) {

      const onlinePaymentStatus = Number(
        response?.data?.online_payment_status
      );
      const cod_priority = Number(
        response?.data?.cod_priority
      );
      const online_priority = Number(
        response?.data?.online_payment_status
      );

      setOnlinePaymentEnabled(
        onlinePaymentStatus === 1
      );
      setCodEnabled(
       Number(response?.data?.COD_status) === 1 ? true : false
      );
      if (
        onlinePaymentStatus === 0 &&
        paymentMethod === 'ONLINE'
      ) {
        setPaymentMethod('COD');
      } else if (cod_priority === 1 && online_priority ===1){
        setPaymentMethod('COD');
      }else if (cod_priority === 1 && online_priority === 0){
        setPaymentMethod('COD');
      }else if (cod_priority === 0 && online_priority === 1){
        setPaymentMethod('ONLINE');
      }
    }

  } catch (e) {

    console.log('APP CONFIG ERROR:', e);

  } finally{
    setConfigLoading(false);
  }

};

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
  const showUserAlert = (title, message) => {
            Alert.alert(
              title,
              message || 'Please login again',
              [
                {
                  text: 'OK',
                },
              ]
            );
    };
  const confirmOrder = async () => {
    if (
  paymentMethod === 'ONLINE' &&
  !onlinePaymentEnabled
) {
  Alert.alert(
    'Online Payment',
    'Online payment is currently unavailable.'
  );
  return;
}
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
    delivery_charge: Number(summary?.delivery_charge || 0),
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
      response?.status !== 'success' && response?.reason === 'Invalid User'
    ) {

      showInvalidUserAlert( response?.message || 'Something went wrong',)

      return;
    } 
    if (
      response?.status !== 'success' && response?.reason === 'Insufficient stock'
    ) {

      showUserAlert(response?.reason, response?.message || 'Error','Something went wrong',)

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

      fetchUserPoints(); // ✅ auto load
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

      fetchUserPoints(); // ✅ auto load
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

    if (error?.message?.includes('Network Error')|| error?.message?.includes('timeout')) {
                  Alert.alert('Connection error', 'Please check your connection');
                  return;
    }
    Alert.alert(
      'Error',
      'Something went wrong',
    );

  } finally {

    setLoading(false);
  }
};
//   if (configLoading) {
//   return (
//     <SafeAreaView
//       style={[
//         globalStyles.safeArea,
//         {
//           justifyContent: 'center',
//           alignItems: 'center',
//         },
//       ]}>
//       <ActivityIndicator
//         size="large"
//         color={colors.primary}
//       />
//     </SafeAreaView>
//   );
// } 
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
          opacity: configLoading ? 0.5 : 1
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* ================= ADDRESS ================= */}
       {configLoading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.5)', // Optional
              zIndex: 999,
            }}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          </View>
        )}
        <View style={[styles.card,]}>
        
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

        {/* ================= PAYMENT ================= */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Payment Method
          </Text>

          {/* COD */}

          <TouchableOpacity
            style={[styles.paymentOption, { opacity: codEnabled ? 1 : 0.5 }]}
            disabled={!codEnabled}
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
            style={[
              styles.paymentOption,
              {
                opacity:
                  (!onlinePaymentEnabled ||
                    Number(summary?.grand_total || 0) <= 0)
                    ? 0.5
                    : 1,
              },
            ]}
            disabled={
              !onlinePaymentEnabled ||
              Number(summary?.grand_total || 0) <= 0
            }
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

              <View>
                  <Text style={styles.paymentText}>
                    Pay Online
                  </Text>

                  {!onlinePaymentEnabled && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: 'red',
                        marginLeft: 10,
                      }}>
                      Currently unavailable
                    </Text>
                  )}
                </View>

            </View>

          </TouchableOpacity>

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
              Delivery Charges
            </Text>

            <Text style={styles.totalValue}>
              ₹ {Number(summary?.delivery_charge || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>
              Net Payable
            </Text>

            <Text style={styles.totalValue}>
              ₹ {Number(summary?.grand_total || 0).toFixed(2)}
            </Text>
          </View>

        </View>

        

      </ScrollView>

      {/* ================= FOOTER ================= */}

      {!configLoading && (<View style={styles.footer}>

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
            ? i18n.t('PAY_NOW') || 'Pay Now'
            : i18n.t('PLACE_ORDER') || 'Place Order'}

        </Text>

        </TouchableOpacity>

      </View>)}

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