import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import {colors, globalStyles} from '../../styles/globalStyles';
import {
  getWorldLinkDetails,
  createInternetBillOrder,
  createInternetBillRazorpayOrder,
  verifyWorldLinkPayment,
  cancelInternetBillPayment,
} from '../../services/internetBillPaymentService';
import RazorpayCheckout from 'react-native-razorpay';
import {BASE_URL} from '../../network/apiClient';

const WorldLinkScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const [customer, setCustomer] = useState(null);

  const [packages, setPackages] = useState([]);

  const [selectedPackage, setSelectedPackage] = useState(null);

  const fetchDetails = async () => {
    if (username.trim() === '') {
      Alert.alert('Please enter WorldLink Username');
      return;
    }

    try {
      setLoading(true);

      const response = await getWorldLinkDetails({
        username: username.trim(),
    });

      console.log(response);

      if (response.status) {
        setCustomer(response);

        let packageList = [];

        if (
          response.package_options &&
          response.package_options.length > 0
        ) {
          packageList = response.package_options;
        } else if (
          response.available_renew_options &&
          response.available_renew_options.length > 0
        ) {
          packageList = response.available_renew_options;
        }

        setPackages(packageList);

        if (packageList.length > 0) {
          const currentPackage = packageList.find(
            item =>
              item.packageId ==
              (response.subscribed_package_id ||
                response.subscribedPackageId),
          );

          setSelectedPackage(currentPackage || packageList[0]);
        } else {
          setSelectedPackage(null);
        }
      } else {
        Alert.alert(response.message || 'Unable to fetch details');
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const payNow = async () => {

    try {

      setLoading(true);

      const response = await createInternetBillOrder({

        provider_name: "WorldLink",

        username: customer.username,

        customer_name: customer.full_name,

        session_id: customer.session_id,

        subscribed_package_id:
          customer.subscribed_package_id,

        selected_package_id:
          selectedPackage?.packageId,

        package_name:
          selectedPackage?.packageName,

        amount:
          selectedPackage?.packageRate ??
          customer.amount,

      });

      console.log("CREATE ORDER:", response);

      if (response.status) {

        // Alert.alert(
        //   "Success",
        //   response.message
        // );

        console.log(
          "Internet Transaction ID:",
          response.transaction_id
        );

        // Next Step
        // Create Razorpay Order
        const razorpayResponse = await createInternetBillRazorpayOrder({
          amount_inr: response.amount,
          transaction_id: response.transaction_id,
        });

        console.log('RAZORPAY ORDER:', razorpayResponse);

        if (!razorpayResponse.status) {
          Alert.alert('Error', razorpayResponse.message);
          return;
        }

        const options = {
        description: 'Internet Bill Payment',
        image: BASE_URL + '/logo/logo.png', // optional
        currency: razorpayResponse.currency,
        key: response.utility_razorpay_key_id, // from createInternetBillOrder.php
        amount: razorpayResponse.amount,
        order_id: razorpayResponse.order_id,
        name: 'Zepali',
        prefill: {
          name: customer.full_name,
        },
        theme: {
          color: colors.primary,
        },
      };

      try {

  const payment = await RazorpayCheckout.open(options);

  console.log('PAYMENT SUCCESS:', payment);

  const verifyResponse = await verifyWorldLinkPayment({

    transaction_id: response.transaction_id,

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
      verifyResponse.message,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );

  } else {

    Alert.alert(
      'Payment Failed',
      verifyResponse.message
    );

  }

} catch (error) {

  console.log('PAYMENT FAILED:', error);

  if (response?.transaction_id) {

    try {

      await cancelInternetBillPayment({
        transaction_id: response.transaction_id,
        reason_to_fail:
          error.description ||
          error.error?.description ||
          error.message ||
          'Payment cancelled by user',
      });

    } catch (e) {
      console.log('Cancel Update Error:', e);
    }

  }

  Alert.alert(
    'Payment Cancelled',
    error.description ||
    error.error?.description ||
    'Payment cancelled.'
  );

}

      } else {

        Alert.alert(
          "Error",
          response.message
        );

      }

    } catch (e) {

      console.log(e);

      Alert.alert(
        "Error",
        "Something went wrong."
      );

    } finally {

      setLoading(false);

    }

  };

  const renderPackage = ({item}) => {
    const selected =
      selectedPackage?.packageId === item.packageId;

    return (
      <TouchableOpacity
        style={[
          styles.packageCard,
          selected && styles.selectedCard,
        ]}
        onPress={() => setSelectedPackage(item)}>
        <View style={styles.radioOuter}>
          {selected && <View style={styles.radioInner} />}
        </View>

        <View style={{flex: 1}}>
          <Text style={styles.packageTitle}>
            {item.packageName}
          </Text>

          <Text style={styles.packagePrice}>
            Rs. {item.packageRate}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
        <AppHeader
        title="WorldLink Internet"
        navigation={navigation}
        showCart={false}
      />
    <View style={globalStyles.container}>
      

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{padding: 15, paddingBottom: 60}}>
        <Text style={styles.label}>
          WorldLink Username
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Username"
          value={username}
          autoCapitalize="none"
          onChangeText={setUsername}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={fetchDetails}>
          <Text style={styles.buttonText}>Fetch Details</Text>
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{marginTop: 20}}
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
                value={customer.full_name}
              />

              <Row
                title="Username"
                value={customer.username}
              />

              <Row
                title="Current Package"
                value={customer.subscribed_package_name}
              />

              <Row
                title="Package Type"
                value={customer.subscribed_package_type}
              />

              <Row
                title="Days Remaining"
                value={customer.days_remaining}
              />

              <Row
                title="Message"
                value={customer.message}
              />
            </View>

            {packages.length > 0 && (
              <>
                <Text style={styles.heading}>
                  Available Packages
                </Text>

                <FlatList
                  scrollEnabled={false}
                  data={packages}
                  keyExtractor={item =>
                    item.packageId.toString()
                  }
                  renderItem={renderPackage}
                />
              </>
            )}

            <View style={styles.amountCard}>
              <Text style={styles.amountTitle}>
                Total Amount
              </Text>

              <Text style={styles.amount}>
                Rs. {customer.amount}
              </Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={payNow}>
                <Text style={styles.buttonText}>Pay Now</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

const Row = ({title, value}) => (
  <View style={styles.row}>
    <Text style={styles.rowTitle}>{title}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

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
    top: 10,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.primary,
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

  packageCard: {
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

  packageTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },

  packagePrice: {
    fontSize: 14,
    marginTop: 5,
    color: '#666',
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
    color: '#555',
  },

  amount: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: 'bold',
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

export default WorldLinkScreen;