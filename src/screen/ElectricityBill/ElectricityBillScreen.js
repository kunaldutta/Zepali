import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  InteractionManager,
} from 'react-native';

import {
  getCountersAPI,
  getBillDetailsAPI,
  getServiceChargeAPI,
  createElectricityOrderAPI,
  makePaymentAPI,
  makePaymentV2API,
  getNewConsumerIdAPI,
} from '../../services/electricityService';
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles, colors } from "../../styles/globalStyles";
import AppHeader from "../../components/AppHeader";
import i18n from "../../localization/i18n";
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from '../../network/apiClient';
import { getPaymentConfig } from '../../services/paymentService';
import DeviceInfo from 'react-native-device-info';
import { compareVersions } from '../../utils/versionUtils';

const ElectricityBillScreen = ({navigation}) => {

  const currentVersion = DeviceInfo.getVersion();
  
  const [loading, setLoading] =
    useState(false);

  const [counters, setCounters] =
    useState([]);

  const [selectedCounter, setSelectedCounter] =
    useState(null);

  const isV2 =
  selectedCounter?.migrated_to_v2;

  const [modalVisible, setModalVisible] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [scNo, setScNo] =
    useState('');

  const [consumerId, setConsumerId] =
    useState('');

  const [consumerNo, setConsumerNo] =
  useState('');

  const [billData, setBillData] =
    useState(null);

  const [serviceChargeData, setServiceChargeData] = useState(null);

  /* =========================
     LOAD COUNTERS
  ========================= */

  useEffect(() => {
    loadCounters();
  }, []);

  const loadCounters = async () => {

    try {

      setLoading(true);

      const response =
        await getCountersAPI();

      console.log(
        'COUNTERS:',
        response,
      );

      if (response?.status) {

        setCounters(
          response?.counters || [],
        );

      } else {

        Alert.alert(
          'Error',
          response?.message ||
            'Unable to load counters',
        );
      }

    } catch (error) {

      console.log(error);
      setLoading(false);

    } finally {

      setLoading(false);
    }
  };

  /* =========================
     FETCH BILL
  ========================= */

  const fetchBill = async () => {

    try {

      if (!selectedCounter) {

        Alert.alert(
          'Validation',
          'Please select counter',
        );

        return;
      }

      if (!scNo) {

        Alert.alert(
          'Validation',
          'Please enter SC Number',
        );

        return;
      }

      if (!consumerId) {

        Alert.alert(
          'Validation',
          'Please enter Consumer ID',
        );

        return;
      }

      setLoading(true);

      let payload = {};

      if (isV2) {

        const consumerResponse =
          await getNewConsumerIdAPI({

            sc_no: scNo,

            old_consumer_id:
              consumerId,

            org_name:
              selectedCounter?.value
                ?.split(':')[1],
          });

        console.log(
          'NEW CONSUMER RESPONSE:',
          consumerResponse,
        );

        if (!consumerResponse?.status) {

          Alert.alert(
            'Error',
            consumerResponse?.message ||
            'Unable to fetch consumer number',
          );

          setLoading(false);

          return;
        }

        const newConsumerNo =
          consumerResponse?.consumer_no;

        setConsumerNo(
          newConsumerNo,
        );

        payload = {

          request_no:
            newConsumerNo,

          is_v2: true,
        };

      } else {

        payload = {

          sc_no: scNo,

          office_code:
            selectedCounter?.value,

          consumer_id:
            consumerId,

          is_v2: false,
        };
      }

      console.log(
        'BILL PAYLOAD:',
        payload,
      );

      const response =
        await getBillDetailsAPI(
          payload,
        );

      console.log(
        'BILL RESPONSE:',
        response,
      );

     

        if (response?.status) {

        const bill =
            response?.data || null;

        setBillData(bill);

        await getServiceCharge(
            bill,
        );

        

      } else {

        Alert.alert(
          'Failed',
          response?.message ||
            'Unable to fetch bill',
        );
      }

    } catch (error) {

      console.log(error);
      setLoading(false);

    } finally {

      setLoading(false);
    }
  };

  /* =========================
     FETCH SERVICE CHARGE
  ========================= */
  const getServiceCharge =
  async bill => {

        try {

            

            setLoading(true);

            const payload = {

              amount:
                bill.total_due_amount,

              session_id:
                bill.session_id,

              is_v2:
                isV2,
            };

            console.log(
            'SERVICE CHARGE PAYLOAD:',
            payload,
            );

            const response =
            await getServiceChargeAPI(
                payload,
            );

            console.log(
            'SERVICE CHARGE RESPONSE:',
            response,
            );

            if (
            response?.status
            ) {

            setServiceChargeData(
                response,
            );

            } else {

            Alert.alert(
                'Error',
                'Unable to fetch service charge',
            );
            }

        } catch (error) {

            console.log(error);
            setLoading(false);

        } finally {

            setLoading(false);
        }
    };

  /* =========================
     FILTER COUNTERS
  ========================= */

  const filteredCounters =
  counters.filter(item =>
    (item?.name || '')
      .toLowerCase()
      .includes(
        search.toLowerCase(),
      ),
  );

  /* =========================
     RENDER COUNTER ITEM
  ========================= */

  const renderCounterItem = ({
    item,
  }) => {

    return (
      <TouchableOpacity
        style={styles.counterItem}
        onPress={() => {

          setSelectedCounter(item);

          setModalVisible(false);
        }}>

        <Text style={styles.counterText}>
          {item.name}

          {item?.migrated_to_v2
          ? ' (V2)'
          : ' (V1)'}
        </Text>

      </TouchableOpacity>
    );
  };

  const payNow = async () => {

  console.log('PAY NOW PRESSED');
  
  try {
    const config = await getPaymentConfig();
  if (!config.status) {
    Alert.alert('Unable to load payment configuration');
    return;
  }
  if (
              compareVersions(
                currentVersion,
                config?.version?.minimum_version
              ) < 0
            ) {
        
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'ForceUpdateScreen',
                      params: {
                        versionData: {
                        latestVersion: config?.version?.latest_version,
                        updateMessage: config?.version?.update_message,
                        storeUrl: config?.version?.store_url,
                        currentVersion: currentVersion,
                      },
                      },
                    },
                  ],
                });
        
                return;
      }
  
    /* =========================
       VALIDATION
    ========================= */

    if (!billData) {

      Alert.alert(
        'Error',
        'Bill data missing',
      );

      return;
    }

    if (!serviceChargeData) {

      Alert.alert(
        'Error',
        'Service charge missing',
      );

      return;
    }

    setLoading(true);

    /* =========================
       CREATE ORDER PAYLOAD
    ========================= */

    const payload = {

      bill_amount:
        billData?.total_due_amount,

      service_charge:
        serviceChargeData?.service_charge,

      platform_charge:
        serviceChargeData?.platform_charge,
    };

    console.log(
      'CREATE ORDER PAYLOAD:',
      payload,
    );

    /* =========================
       CREATE RAZORPAY ORDER
    ========================= */

    const response =
      await createElectricityOrderAPI(
        payload,
      );

    console.log(
      'ORDER RESPONSE:',
      response,
    );

    if (!response?.status) {

      Alert.alert(
        'Error',
        response?.message ||
        'Unable to create order',
      );

      return;
    }

    /* =========================
       RAZORPAY OPTIONS
    ========================= */

    const options = {

      description:
        'Electricity Bill Payment',

      image: BASE_URL + "/logo/zepali_foreground.png" || '',

      currency:
        response?.currency,

      key:
        config.razorpay_key_id,

      amount: response?.amount,

      name:
        'IndoNep',

      order_id:
        response?.order_id,

      prefill: {

        email: '',

        contact: '',

        name:
          billData?.consumer_name,
      },

      theme: {

        color:
          colors.primary,
      },
    };

    console.log(
      'RAZORPAY OPTIONS:',
      options,
    );

    /* =========================
       OPEN RAZORPAY
    ========================= */

    RazorpayCheckout.open(
      options,
    )

    /* =========================
       PAYMENT SUCCESS
    ========================= */

    .then(async razorpayData => {
      const user = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = user ? JSON.parse(user) : null;
      console.log(
        'RAZORPAY SUCCESS:',
        razorpayData,
      );

      try {

        /* =========================
           FINAL PAYMENT API
        ========================= */

        const paymentPayload = {

          user_id:
            parsedUser?.id,

          consumer_name:
            billData?.consumer_name,

          consumer_id:
            consumerId,
          
          consumer_no:
              consumerNo,

            bill_ids:
              billData?.due_bills?.map(
                item => item?.rcvblID,
              ) || [],

            nea_version:
              isV2 ? 'v2' : 'v1',

          sc_no:
            scNo,

          office_code:
            selectedCounter?.value,

          session_id:
            billData?.session_id,

          /* IMPORTANT
             ONLY BILL AMOUNT
          */

          amount:
            billData?.total_due_amount,

          service_charge:
            serviceChargeData?.service_charge,

          platform_charge:
            serviceChargeData?.platform_charge,
          
          total_paid_amount:

            Number(
              billData?.total_due_amount || 0,
            ) +

            Number(
              serviceChargeData?.service_charge || 0,
            ) +

            Number(
              serviceChargeData?.platform_charge || 0,
            ),

          razorpay_order_id:
            razorpayData
              ?.razorpay_order_id,

          razorpay_payment_id:
            razorpayData
              ?.razorpay_payment_id,

          razorpay_signature:
            razorpayData
              ?.razorpay_signature,
        };

        console.log(
          'MAKE PAYMENT PAYLOAD:',
          paymentPayload,
        );

        

        const paymentResponse = isV2

        ? await makePaymentV2API(
            paymentPayload,
          )

        : await makePaymentAPI(
            paymentPayload,
          );

        console.log(
          'PAYMENT RESPONSE:',
          paymentResponse,
        );

        /* =========================
           SUCCESS
        ========================= */

        if (
          paymentResponse?.status
        ) {

          Alert.alert(
            'Success',
            'Electricity bill paid successfully',
          );

        } else {

          Alert.alert(
            'Failed',
            paymentResponse?.message ||
            'Payment failed',
          );
        }

      } catch (error) {

        console.log(
          'MAKE PAYMENT ERROR:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to process payment',
        );
      }
    })

    /* =========================
       PAYMENT FAILED
    ========================= */

    .catch(error => {

      console.log(
        'RAZORPAY ERROR:',
        error,
      );

      Alert.alert(
        'Payment Failed',
        error?.description ||
        'User cancelled payment',
      );
    });

  } catch (error) {

    console.log(
      'PAY NOW ERROR:',
      error,
    );
    setLoading(false);
    Alert.alert(
      'Error',
      'Something went wrong',
    );

  } finally {

    setLoading(false);
  }
};

  return (
    <SafeAreaView
      style={globalStyles.safeArea}>
    <AppHeader
          title={i18n.t("ELECTRICITY_BILL") || "Electricity Bill"}
          onBackPress={() => navigation.goBack()}
          showCart={false}
        />
    <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
        paddingBottom: 40,
        backgroundColor: colors.background,
    }}>
    <View style={globalStyles.centerContainer}>

      {/* SELECT COUNTER */}

      <TouchableOpacity
        style={[
                      globalStyles.pickerBox,
                      {
                        height: '100%',
                        justifyContent: 'center',
                        borderWidth: 0,
                        flexDirection: 'row',          // 👈 IMPORTANT
                        alignItems: 'center',
                        justifyContent: 'space-between', // 👈 space between text & arrow
                        paddingHorizontal: 10,
                        height: 45,
                        elevation: 2,
                      },
                    ]}
        onPress={() =>
          setModalVisible(true)
        }>

        <Text
          style={styles.selectBtnText}>

          {selectedCounter
            ? selectedCounter.name
            : 'Select Counter Office'}

        </Text>
            <Text style={{ fontSize: 16, color: '#555' }}>▼</Text>
      </TouchableOpacity>

      {/* SC NUMBER */}

      <TextInput
        placeholder="SC Number"
        placeholderTextColor={colors.placeholderTextColor}
        value={scNo}
        onChangeText={setScNo}
        style={[globalStyles.input,{top: 15}]}
      />

      {/* CONSUMER ID */}

      <TextInput
        placeholder={
          isV2
            ? 'Old Consumer ID'
            : 'Consumer ID'
        }
        placeholderTextColor={colors.placeholderTextColor}
        value={consumerId}
        onChangeText={
          setConsumerId
        }
        keyboardType="numeric"
        style={[globalStyles.input,{top: 15}]}
      />

      {/* FETCH BUTTON */}

      <TouchableOpacity
        style={[globalStyles.button, styles.fetchBtn]}
        onPress={fetchBill}>

        <Text
          style={styles.fetchBtnText}>

          Fetch Bill

        </Text>

      </TouchableOpacity>

      {/* LOADER */}

      {loading && (
        <ActivityIndicator
          size="large"
          style={{
            marginTop: 20,
          }}
        />
      )}

      {/* BILL DETAILS */}



        {billData && (

        <View style={styles.billCard}>

        <Text style={styles.billTitle}>
            Bill Details
        </Text>

        <View style={styles.row}>

            <Text style={styles.label}>
            Consumer Name
            </Text>

            <Text style={styles.value}>
            {billData.consumer_name}
            </Text>

        </View>

        <View style={styles.row}>

            <Text style={styles.label}>
            Total Due
            </Text>
            
            <Text style={styles.value}>
            Rs. {billData.total_due_amount}
            </Text>

        </View>
        <View style={styles.row}>

        <Text style={styles.label}>
            Service Charge
        </Text>

        <Text style={styles.value}>

            Rs.
            {' '}

            {serviceChargeData
            ?.service_charge || 0}

        </Text>

        </View>
        <View style={styles.row}>

        <Text style={styles.label}>
            Platform Charge
        </Text>

        <Text style={styles.value}>

            Rs.
            {' '}

            {serviceChargeData
            ?.platform_charge || 0}

        </Text>

        </View>
        <View style={styles.row}>

        <Text style={styles.label}>
            Final Amount
        </Text>

        <Text style={styles.value}>

            Rs.
            {' '}

            {(
            
            Number(
                serviceChargeData
                ?.final_amount || 0,
            )
            ).toFixed(2)}

        </Text>

        </View>

        <View style={styles.row}>

            <Text style={styles.label}>
            Session ID
            </Text>

            <Text style={styles.value}>
            {billData.session_id}
            </Text>

        </View>

        {/* DUE BILLS */}

        <Text style={styles.subTitle}>
            Due Bills
        </Text>

        {billData?.due_bills?.map(
            (item, index) => (

            <View
            key={index}
            style={styles.dueCard}>

            <Text style={styles.billInfo}>
                Bill Of:
                {' '}
                {item.due_bill_of}
            </Text>

            <Text style={styles.billInfo}>
                Bill Date:
                {' '}
                {item.bill_date}
            </Text>

            <Text style={styles.billInfo}>
                Payable:
                {' '}
                Rs. {item.payable_amount}
            </Text>

            <Text style={styles.billInfo}>
                Status:
                {' '}
                {item.status}
            </Text>

            </View>

        ))}

        <TouchableOpacity
            style={styles.payBtn}
            onPress={payNow}>

            <Text style={styles.payBtnText}>
                Pay Now
            </Text>

        </TouchableOpacity>

        </View>

        )}

      {/* MODAL */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide">

        <View
          style={styles.modalContainer}>

          <View
            style={styles.modalContent}>

            {/* SEARCH */}

            <TextInput
              placeholder="Search Counter"
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />

            {/* LIST */}

            <FlatList
              data={filteredCounters}
              keyExtractor={(
                item,
                index,
              ) =>
                index.toString()
              }
              renderItem={
                renderCounterItem
              }
            />

            {/* CLOSE */}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() =>
                setModalVisible(
                  false,
                )
              }>

              <Text
                style={
                  styles.closeBtnText
                }>

                Close

              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>
    </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default ElectricityBillScreen;

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    height: '100%',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 25,
  },

  selectBtn: {
    height: 55,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },

  selectBtnText: {
    
    fontSize: 15,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 15,
    color: '#000',
  },

  fetchBtn: {
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  fetchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  billCard: {
    marginTop: 30,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 20,
  },

  billTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#000',
  },

  billText: {
    color: '#000',
    fontSize: 15,
    marginBottom: 10,
  },

  modalContainer: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    height: '80%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },

  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#000',
  },

  counterItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  counterText: {
    color: '#000',
    fontSize: 15,
  },

  closeBtn: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  closeBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 12,
},

label: {
  color: '#666',
  fontSize: 14,
},

value: {
  color: '#000',
  fontSize: 15,
  fontWeight: '600',
},

subTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#000',
  marginTop: 20,
  marginBottom: 10,
},

dueCard: {
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 15,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '#eee',
},

billInfo: {
  color: '#333',
  fontSize: 14,
  marginBottom: 6,
},

payBtn: {
  height: 50,
  backgroundColor: colors.primary,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 15,
},

payBtnText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 16,
},
});