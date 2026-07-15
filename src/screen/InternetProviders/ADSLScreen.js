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

import AppHeader from '../../components/AppHeader';
import {colors, globalStyles} from '../../styles/globalStyles';
import {createADSLOrder, createInternetBillRazorpayOrder, verifyADSLPayment, cancelInternetBillPayment} from '../../services/internetBillPaymentService';
import RazorpayCheckout from 'react-native-razorpay';
import {BASE_URL} from '../../network/apiClient';

const ADSLScreen = ({navigation}) => {

  const [landlineNumber, setLandlineNumber] = useState('');

  const [amount, setAmount] = useState('');
  const [paymentSummary, setPaymentSummary] = useState(null);

  const [providerType, setProviderType] = useState('ADSL Unlimited');
  // ADSL Unlimited
  // ADSL Volume

  const [loading, setLoading] = useState(false);

  const proceedToPayment = async () => {
  try {
    setLoading(true);

    const razorpayResponse =
      await createInternetBillRazorpayOrder({
        transaction_id: paymentSummary.transaction_id,
        amount_inr: Number(paymentSummary.total_amount_inr),
      });

    console.log("RAZORPAY ORDER:", razorpayResponse);

    if (!razorpayResponse.status) {
      Alert.alert("Error", razorpayResponse.message);
      setLoading(false);
      return;
    }

    const options = {
      description: providerType,
      image: BASE_URL + "/logo/logo.png",
      currency: "INR",
      key: paymentSummary.razorpay_key,
      amount: razorpayResponse.amount,
      name: "Zepali",
      order_id: razorpayResponse.order_id,
      prefill: {},
      theme: {
        color: colors.primary,
      },
    };

    RazorpayCheckout.open(options)
      .then(async payment => {

        const verifyResponse = await verifyADSLPayment({
          transaction_id: paymentSummary.transaction_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_signature: payment.razorpay_signature,
        });

        if (verifyResponse.status) {
          Alert.alert(
            "Success",
            "Recharge submitted successfully."
          );

          navigation.goBack();
        } else {
          Alert.alert(
            "Error",
            verifyResponse.message
          );
        }

        setLoading(false);
      })
      .catch(async error => {

        await cancelInternetBillPayment({
          transaction_id: paymentSummary.transaction_id,
          reason_to_fail:
            error.description ||
            "Payment cancelled by user",
        });

        Alert.alert(
          "Cancelled",
          error.description ||
            "Payment cancelled by user"
        );

        setLoading(false);
      });

  } catch (e) {
    console.log(e);

    Alert.alert(
      "Error",
      e?.message || "Something went wrong."
    );

    setLoading(false);
  }
};
  const validate = () => {

    if (!landlineNumber.trim()) {

      Alert.alert(
        'Validation',
        'Please enter landline number.'
      );

      return false;
    }

    if (!/^[0-9]{8}$/.test(landlineNumber)) {

      Alert.alert(
        'Validation',
        'Landline number must be 8 digits.'
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
      rechargeAmount > 10000
    ) {

      Alert.alert(
        'Validation',
        'Amount should be between 10 and 10000.'
      );

      return false;
    }

    return true;
  };

  const rechargeNow = async () => {

  if (!validate()) {
    return;
  }

  try {

    setLoading(true);

    const response = await createADSLOrder({

      provider_name: providerType,

      username: landlineNumber,

      amount: Number(amount),

    });

    console.log("ADSL ORDER:", response);

    if (!response.status) {

      Alert.alert(
        "Error",
        response.message
      );
    setLoading(false);
      return;

    }

    /*
      Next Step

      Create Razorpay Order
    */
   setPaymentSummary(response);
    setLoading(false);
    return;
   


  } catch (e) {

  console.log(e);

  Alert.alert(
    "Error",
    e?.message || "Something went wrong."
  );

  setLoading(false);

}

};

  return (
    <SafeAreaView style={globalStyles.safeArea}>

      <AppHeader
        title="ADSL Recharge"
        navigation={navigation}
        showCart={false}
      />

      <View style={globalStyles.container}>

        <View style={styles.container}>

          <Text style={styles.label}>
            Provider
          </Text>

          <View style={styles.providerContainer}>

            <TouchableOpacity
              style={[
                styles.providerButton,
                providerType === 'ADSL Unlimited' &&
                  styles.selectedProvider,
              ]}
              onPress={() =>
                setProviderType('ADSL Unlimited')
              }>

              <Text
                style={[
                  styles.providerText,
                  providerType === 'ADSL Unlimited' &&
                    styles.selectedProviderText,
                ]}>
                Unlimited
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.providerButton,
                providerType === 'ADSL Volume' &&
                  styles.selectedProvider,
              ]}
              onPress={() =>
                setProviderType('ADSL Volume')
              }>

              <Text
                style={[
                  styles.providerText,
                  providerType === 'ADSL Volume' &&
                    styles.selectedProviderText,
                ]}>
                Volume
              </Text>

            </TouchableOpacity>

          </View>

          <Text style={styles.label}>
            Landline Number
          </Text>

          <TextInput
            style={styles.input}
            placeholder="15522942"
            keyboardType="number-pad"
            maxLength={8}
            value={landlineNumber}
            onChangeText={text => {
              setLandlineNumber(text);
              setPaymentSummary(null)
            }}
          />

          <Text style={styles.label}>
            Amount
          </Text>

          <TextInput
            style={styles.input}
            placeholder="500"
            keyboardType="number-pad"
            value={amount}
            onChangeText={text => {
              setAmount(text);
              setPaymentSummary(null)
            }}
          />
            {paymentSummary && (
                <View
                    style={{
                    marginTop: 20,
                    backgroundColor: "#FFF",
                    padding: 15,
                    borderRadius: 10,
                    elevation: 2,
                    }}>

                    <Text
                    style={{
                        fontSize: 18,
                        fontWeight: "700",
                        marginBottom: 15,
                    }}>
                    Payment Summary
                    </Text>

                    <SummaryRow
                    title="Recharge Amount (NPR)"
                    value={`Rs ${paymentSummary.amount_npr}`}
                    />

                    <SummaryRow
                    title="Amount (INR)"
                    value={`₹ ${paymentSummary.amount_inr}`}
                    />

                    <SummaryRow
                    title="Platform Charge"
                    value={`₹ ${paymentSummary.platform_charges}`}
                    />

                    <View
                    style={{
                        borderTopWidth: 1,
                        borderColor: "#DDD",
                        marginVertical: 10,
                    }}
                    />

                    <SummaryRow
                    title="Total Payable"
                    value={`₹ ${paymentSummary.total_amount_inr}`}
                    />

                    <TouchableOpacity
                    style={styles.button}
                    onPress={proceedToPayment}>

                    <Text style={styles.buttonText}>
                        Proceed to Pay
                    </Text>

                    </TouchableOpacity>

                </View>
                )}
                {!paymentSummary && (
          <TouchableOpacity
            style={styles.button}
            onPress={rechargeNow}>

            
              <Text style={styles.buttonText}>
                Continue
              </Text>
           

          </TouchableOpacity> )}

          {loading && (
            <ActivityIndicator
              style={{marginTop:20}}
              color={colors.primary}
              size="large"
            />
          )}

        </View>

      </View>

    </SafeAreaView>
  );
};
const SummaryRow = ({title, value}) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 6,
    }}>
    <Text>{title}</Text>
    <Text style={{fontWeight: "700"}}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({

  container:{
    padding:15,
  },

  label:{
    fontSize:15,
    fontWeight:'600',
    marginBottom:8,
    marginTop:15,
  },

  input:{
    height:50,
    borderWidth:1,
    borderColor:'#DDD',
    borderRadius:8,
    paddingHorizontal:15,
    backgroundColor:'#FFF',
  },

  providerContainer:{
    flexDirection:'row',
    justifyContent:'space-between',
  },

  providerButton:{
    flex:1,
    borderWidth:1,
    borderColor:'#DDD',
    borderRadius:8,
    paddingVertical:14,
    marginHorizontal:5,
    alignItems:'center',
    backgroundColor:'#FFF',
  },

  selectedProvider:{
    backgroundColor:colors.primary,
    borderColor:colors.primary,
  },

  providerText:{
    color:'#333',
    fontWeight:'600',
  },

  selectedProviderText:{
    color:'#FFF',
  },

  button:{
    marginTop:30,
    height:50,
    borderRadius:8,
    backgroundColor:colors.primary,
    justifyContent:'center',
    alignItems:'center',
  },

  buttonText:{
    color:'#FFF',
    fontWeight:'700',
    fontSize:16,
  },

});

export default ADSLScreen;