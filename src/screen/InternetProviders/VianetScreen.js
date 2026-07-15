import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';

import RazorpayCheckout from 'react-native-razorpay';

import {SafeAreaView} from 'react-native-safe-area-context';

import AppHeader from '../../components/AppHeader';

import {colors, globalStyles} from '../../styles/globalStyles';

import {
  getVianetDetails,
  createInternetBillOrder,
  createInternetBillRazorpayOrder,
  verifyVianetPayment,
  cancelInternetBillPayment,
} from '../../services/internetBillPaymentService';

const VianetScreen = ({navigation}) => {

  const [customerId, setCustomerId] = useState('');

  const [loading, setLoading] = useState(false);

  const [customer, setCustomer] = useState(null);

  const [bills, setBills] = useState([]);

  const [selectedBill, setSelectedBill] = useState(null);

  const fetchDetails = async () => {

    if (customerId.trim() === '') {

      Alert.alert(
        'Please enter Customer ID'
      );

      return;

    }

    try {

      setLoading(true);

      const response =
        await getVianetDetails({

          customer_id:
            customerId.trim(),

        });

      console.log(response);

      if (response.status) {

        setCustomer(response);

        setBills(response.bills || []);

        if (
          response.bills &&
          response.bills.length > 0
        ) {

          setSelectedBill(
            response.bills[0]
          );

        }

      } else {

        Alert.alert(
          'Error',
          response.details ||
            response.message
        );

      }

    } catch (e) {

      console.log(e);

      Alert.alert(
        'Error',
        'Unable to fetch details.'
      );

    } finally {

      setLoading(false);

    }

  };

  const payNow = async () => {

    if (!selectedBill) {

      Alert.alert(
        'Please select bill.'
      );

      return;

    }

    try {

      setLoading(true);

      /*
      STEP-1
      Create Pending Transaction
      */

      const createResponse =
        await createInternetBillOrder({

          provider_name:
            'Vianet',

          username:
            customer.customer_id,

          customer_name:
            customer.customer_name,

          session_id:
            customer.session_id,

          payment_id:
            selectedBill.payment_id,

          package_name:
            selectedBill.service_details,

          amount:
            parseFloat(
              selectedBill.grand_total
            ),

        });

      console.log(
        'CREATE ORDER:',
        createResponse
      );

      if (!createResponse.status) {

        Alert.alert(
          'Error',
          createResponse.message
        );

        return;

      }

      /*
      STEP-2
      Razorpay Order
      */

      const razorResponse =
        await createInternetBillRazorpayOrder({

          amount_inr:
            createResponse.amount,

          transaction_id:
            createResponse.transaction_id,

        });

      console.log(
        razorResponse
      );

      if (!razorResponse.status) {

        Alert.alert(
          'Error',
          razorResponse.message
        );

        return;

      }

      /*
      STEP-3
      Razorpay Payment
      */

      const options = {

        description:
          'Internet Bill Payment',

        image:
          'https://zepali.net/logo.png',

        currency:
          razorResponse.currency,

        key:
          createResponse
            .razorpay_key_id,

        amount:
          razorResponse.amount,

        order_id:
          razorResponse.order_id,

        name: 'Zepali',

        prefill: {

          name:
            customer.customer_name,

        },

        theme: {

          color:
            colors.primary,

        },

      };

      try {

        const payment =
          await RazorpayCheckout.open(
            options
          );

        console.log(payment);

        /*
        STEP-4
        Verify Payment
        */

        const verifyResponse =
          await verifyVianetPayment({

            transaction_id:
              createResponse.transaction_id,

            razorpay_payment_id:
              payment.razorpay_payment_id,

            razorpay_order_id:
              payment.razorpay_order_id,

            razorpay_signature:
              payment.razorpay_signature,

          });

        console.log(
          verifyResponse
        );

        if (
          verifyResponse.status
        ) {

          Alert.alert(
            'Success',
            verifyResponse.message,
            [
              {
                text: 'OK',
                onPress: () =>
                  navigation.goBack(),
              },
            ]
          );

        } else {

          Alert.alert(
            'Failed',
            verifyResponse.message
          );

        }

      } catch (error) {

        console.log(error);

        await cancelInternetBillPayment({

          transaction_id:
            createResponse.transaction_id,

          reason_to_fail:
            error.description ||
            'Payment cancelled by user',

        });

        Alert.alert(
          'Cancelled',
          error.description ||
            'Payment cancelled.'
        );

      }

    } catch (e) {

      console.log(e);

      Alert.alert(
        'Error',
        'Something went wrong.'
      );

    } finally {

      setLoading(false);

    }

  };

  const renderBill = ({item}) => {

    const selected =
      selectedBill?.payment_id ===
      item.payment_id;

    return (

      <TouchableOpacity
        style={[
          styles.billCard,
          selected &&
            styles.selectedCard,
        ]}
        onPress={() =>
          setSelectedBill(item)
        }>

        <View
          style={styles.radioOuter}>

          {selected && (
            <View
              style={
                styles.radioInner
              }
            />
          )}

        </View>

        <View style={{flex: 1}}>

          <Text
            style={styles.billTitle}>

            {item.service_details}

          </Text>

          <Text
            style={styles.billAmount}>

            Rs. {item.grand_total}

          </Text>

        </View>

      </TouchableOpacity>

    );

  };
  return (
  <SafeAreaView style={globalStyles.safeArea}>
    <AppHeader
      title="Vianet Internet"
      navigation={navigation}
      showCart={false}
    />

    <View style={globalStyles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 15,
          paddingBottom: 60,
        }}>

        <Text style={styles.label}>
          Customer ID
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Customer ID"
          value={customerId}
          keyboardType="number-pad"
          onChangeText={setCustomerId}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={fetchDetails}>

          <Text style={styles.buttonText}>
            Fetch Details
          </Text>

        </TouchableOpacity>

        {loading && (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{marginTop:20}}
          />
        )}

        {customer && (
          <>

            <View style={styles.card}>

              <Text style={styles.heading}>
                Customer Details
              </Text>

              <Row
                title="Customer Name"
                value={customer.customer_name}
              />

              <Row
                title="Customer ID"
                value={customer.customer_id}
              />

            </View>

            {bills.length > 0 && (
              <>

                <Text style={styles.heading}>
                  Pending Bills
                </Text>

                <FlatList
                  data={bills}
                  scrollEnabled={false}
                  keyExtractor={item =>
                    item.payment_id
                  }
                  renderItem={renderBill}
                />

              </>
            )}

            {selectedBill && (

              <View style={styles.amountCard}>

                <Text style={styles.amountTitle}>
                  Selected Bill
                </Text>

                <Text style={styles.amount}>
                  Rs. {selectedBill.grand_total}
                </Text>

                <Text
                  style={{
                    marginTop:10,
                    textAlign:'center',
                    color:'#666',
                  }}>

                  {selectedBill.service_details}

                </Text>

              </View>

            )}

            {selectedBill && (

              <TouchableOpacity
                style={styles.button}
                onPress={payNow}>

                <Text style={styles.buttonText}>
                  Pay Now
                </Text>

              </TouchableOpacity>

            )}

          </>
        )}

      </ScrollView>
    </View>
  </SafeAreaView>
);

const Row = ({title, value}) => (
  <View style={styles.row}>
    <Text style={styles.rowTitle}>
      {title}
    </Text>

    <Text style={styles.rowValue}>
      {value}
    </Text>
  </View>
);
};
const styles = StyleSheet.create({

  label: {
    fontSize: 15,
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#FFF',
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    elevation: 2,
  },

  heading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    marginTop: 15,
  },

  row: {
    marginBottom: 12,
  },

  rowTitle: {
    fontSize: 13,
    color: '#888',
  },

  rowValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
    marginTop: 3,
  },

  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },

  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  billTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },

  billAmount: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 6,
  },

  amountCard: {
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
    alignItems: 'center',
  },

  amountTitle: {
    fontSize: 15,
    color: '#666',
  },

  amount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
  },

  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

});

export default VianetScreen;