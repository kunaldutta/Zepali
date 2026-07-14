import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import RazorpayCheckout from 'react-native-razorpay';

import AppHeader from '../../components/AppHeader';

import {BASE_URL} from '../../network/apiClient';
import {
  calculateAmount,
} from "../../services/paymentService";

import {
  colors,
  globalStyles,
} from '../../styles/globalStyles';

import {
  createInternetNtftthBillOrder,
  payInternetNtftthBillOrder,
  createInternetBillRazorpayOrder,
  verifyWorldLinkPayment,
  cancelInternetBillPayment,
} from '../../services/internetBillPaymentService';

const NTFTTHScreen = ({navigation}) => {

  const [subscriberNumber, setSubscriberNumber] = useState('');

  const [amount, setAmount] = useState('');

  const [paymentSummary, setPaymentSummary] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const validate = () => {

    if (!subscriberNumber.trim()) {

      Alert.alert(
        'Validation',
        'Please enter subscriber number.'
      );

      return false;

    }

    if (!/^10000[0-9]{9}$/.test(subscriberNumber)) {

      Alert.alert(
        'Validation',
        'Subscriber number must be 14 digits and start with 10000.'
      );

      return false;

    }

    if (!amount.trim()) {

      Alert.alert(
        'Validation',
        'Please enter amount.'
      );

      return false;

    }

    const rechargeAmount = Number(amount);

    if (
      isNaN(rechargeAmount) ||
      rechargeAmount < 10 ||
      rechargeAmount > 25000
    ) {

      Alert.alert(
        'Validation',
        'Amount should be between 10 and 25000.'
      );

      return false;

    }

    return true;

  };

  const rechargeNow = async () => {
    console.log("rechargeNow called");
    if (!validate()) {
         console.log("rechargeNow called11");
      return;
    }

    try {

      setLoading(true);

      const currencyResponse =
        await calculateAmount({
          amount_npr: Number(amount),
        });

      console.log(
        'CURRENCY RESPONSE:',
        currencyResponse
      );

      if (!currencyResponse.status) {

        Alert.alert(
          'Error',
          currencyResponse.message
        );

        setLoading(false);

        return;

      }

      const transactionResponse =
        await createInternetNtftthBillOrder({

          provider_name: 'NTFTTH',

          username: subscriberNumber,

          amount: Number(currencyResponse?.amount_inr),

        });

      console.log(
        'TRANSACTION:',
        transactionResponse
      );

      if (!transactionResponse.status) {

        Alert.alert(
          'Error',
          transactionResponse.message
        );

        setLoading(false);

        return;

      }

      setPaymentSummary({

        ...currencyResponse,

        transaction_id:
          transactionResponse?.transaction_id,

        razorpay_key:
          transactionResponse?.utility_razorpay_key_id,

      });

      setLoading(false);

    } catch (e) {

      console.log(e);

      Alert.alert(
        'Error',
        e?.message || 'Something went wrong.'
      );

      setLoading(false);

    }

  };
  
  const proceedToPayment = async () => {

  try {

    setLoading(true);

    const razorpayResponse =
      await payInternetNtftthBillOrder({

        transaction_id:
          paymentSummary.transaction_id,

      });

    console.log(
      'RAZORPAY ORDER:',
      razorpayResponse
    );

    if (!razorpayResponse.status) {

      Alert.alert(
        'Error',
        razorpayResponse.message
      );

      setLoading(false);

      return;

    }

    const options = {

      description: 'NT FTTH Recharge',

      image:
        BASE_URL + '/logo/logo.png',

      currency: 'INR',

      key: paymentSummary?.razorpay_key,

      amount: razorpayResponse.amount,

      name: 'Zepali',

      order_id: razorpayResponse.order_id,

      prefill: {},

      theme: {
        color: colors.primary,
      },

    };
    console.log("RAZORPAY OPTIONS", options);
    RazorpayCheckout.open(options)

      .then(async payment => {

        console.log(
          'PAYMENT SUCCESS:',
          payment
        );

        const verifyResponse =
          await verifyWorldLinkPayment({

            transaction_id:
              paymentSummary.transaction_id,

            razorpay_payment_id:
              payment.razorpay_payment_id,

            razorpay_order_id:
              payment.razorpay_order_id,

            razorpay_signature:
              payment.razorpay_signature,

          });

        console.log(
          'VERIFY RESPONSE:',
          verifyResponse
        );

        if (verifyResponse.status) {

          Alert.alert(
            'Success',
            'Recharge completed successfully.'
          );

          navigation.goBack();

        } else {

          Alert.alert(
            'Error',
            verifyResponse.message
          );

        }

        setLoading(false);

      })

      .catch(async error => {

        console.log(
          'PAYMENT FAILED:',
          error
        );

        await cancelInternetBillPayment({

          transaction_id:
            paymentSummary.transaction_id,

          reason_to_fail:
            error.description ||
            'Payment cancelled by user',

        });

        Alert.alert(
          'Cancelled',
          error.description ||
            'Payment cancelled by user'
        );

        setLoading(false);

      });

  } catch (e) {

    console.log(e);

    Alert.alert(
      'Error',
      e?.message || 'Something went wrong.'
    );

    setLoading(false);

  }

};

return (
  <SafeAreaView style={globalStyles.safeArea}>

    <AppHeader
      title="NT FTTH Recharge"
      navigation={navigation}
      showCart={false}
    />

    <View style={globalStyles.container}>

      <View style={styles.container}>

        <Text style={styles.label}>
          Subscriber Number
        </Text>

        <TextInput
          style={styles.input}
          placeholder="10000141001060"
          keyboardType="number-pad"
          maxLength={14}
          value={subscriberNumber}
          onChangeText={setSubscriberNumber}
        />

        <Text style={styles.label}>
          Amount (NPR)
        </Text>

        <TextInput
          style={styles.input}
          placeholder="100"
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
        />

        {!paymentSummary && (

<TouchableOpacity
    style={styles.button}
    onPress={rechargeNow}>

    <Text style={styles.buttonText}>
        Continue
    </Text>

</TouchableOpacity>

)}

        {paymentSummary && (

          <View style={styles.summaryContainer}>

            <Text style={styles.summaryTitle}>
              Payment Summary
            </Text>

            <SummaryRow
              title="Subscriber No."
              value={subscriberNumber}
            />

            <SummaryRow
              title="Recharge Amount"
              value={`NPR ${paymentSummary.amount_npr}`}
            />

            <SummaryRow
              title="Exchange Rate"
              value={paymentSummary.rate}
            />

            <SummaryRow
              title="Amount (INR)"
              value={`₹ ${paymentSummary.amount_inr}`}
            />

            <SummaryRow
              title="Platform Charge (6%)"
              value={`₹ ${paymentSummary.charge}`}
            />

            <View
              style={{
                borderTopWidth:1,
                borderColor:'#DDD',
                marginVertical:10,
              }}
            />

            <SummaryRow
              title="Total Payable"
              value={`₹ ${paymentSummary.final_amount}`}
            />

            <TouchableOpacity
              style={[
                styles.button,
                {marginTop:20},
              ]}
              onPress={proceedToPayment}>

              <Text style={styles.buttonText}>
                Proceed To Pay
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        backgroundColor:'#999',
                        marginTop:10,
                    },
                ]}
                onPress={() => setPaymentSummary(null)}>

                <Text style={styles.buttonText}>
                    Change Details
                </Text>

            </TouchableOpacity>

          </View>

        )}

        {loading && (

          <ActivityIndicator
            style={{marginTop:20}}
            size="large"
            color={colors.primary}
          />

        )}

      </View>

    </View>

  </SafeAreaView>
);
};
const SummaryRow = ({title, value}) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>
      {title}
    </Text>

    <Text style={styles.summaryValue}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({

  container: {
    padding: 15,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    color: '#333',
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
  },

  button: {
    marginTop: 25,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },

  summaryContainer: {
    marginTop: 25,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#222',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },

  summaryLabel: {
    flex: 1,
    fontSize: 15,
    color: '#555',
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    textAlign: 'right',
  },

});

export default NTFTTHScreen;