import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';

import AppHeader from '../../components/AppHeader';
import {globalStyles, colors} from '../../styles/globalStyles';

import {requestReturnAPI} from '../../services/orderService';

const ReturnOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {
  orderId,
  orderItemId,
  paymentMethod,
} = route.params;

const isOnlinePayment =
  paymentMethod === 'ONLINE';

  const [reason, setReason] = useState('');

  const [refundMethod, setRefundMethod] =
    useState('WALLET');

  const [upiId, setUpiId] = useState('');

  const [accountHolderName, setAccountHolderName] =
    useState('');

  const [bankName, setBankName] =
    useState('');

  const [accountNumber, setAccountNumber] =
    useState('');

  const [ifscCode, setIfscCode] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const submitReturnRequest = async () => {
    try {
      if (!reason.trim()) {
        Alert.alert(
          'Validation',
          'Please enter return reason',
        );
        return;
      }

      if (
            !isOnlinePayment &&
            refundMethod === 'UPI' &&
            !upiId.trim()
        ){
        Alert.alert(
          'Validation',
          'Please enter UPI ID',
        );
        return;
      }

      if (
        !isOnlinePayment &&
        refundMethod === 'BANK'
        ) {
        if (
          !accountHolderName.trim() ||
          !bankName.trim() ||
          !accountNumber.trim() ||
          !ifscCode.trim()
        ) {
          Alert.alert(
            'Validation',
            'Please enter complete bank details',
          );
          return;
        }
      }

      setLoading(true);

      const user =
        await AsyncStorage.getItem(
          'USER_DATA',
        );

      const parsedUser =
        JSON.parse(user);

      const response =
        await requestReturnAPI({

          order_id:
            orderId,

          order_item_id:
            orderItemId,

          customer_id:
            parsedUser.id,

          reason,

          refund_preference:
            isOnlinePayment
                ? 'ONLINE'
                : refundMethod,

          refund_upi_id:
            !isOnlinePayment &&
            refundMethod === 'UPI'
                ? upiId
                : '',

          account_holder_name:
            !isOnlinePayment &&
            refundMethod === 'BANK'
                ? accountHolderName
                : '',

          bank_name:
            !isOnlinePayment &&
            refundMethod === 'BANK'
                ? bankName
                : '',

          account_number:
            !isOnlinePayment &&
            refundMethod === 'BANK'
                ? accountNumber
                : '',

          ifsc_code:
            !isOnlinePayment &&
            refundMethod === 'BANK'
                ? ifscCode
                : '',
        });

      if (response?.status) {
        Alert.alert(
          'Success',
          response.message,
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.goBack(),
            },
          ],
        );
      } else {
        Alert.alert(
          'Error',
          response?.message ||
            'Unable to submit request',
        );
      }
    } catch (error) {
      console.log(
        'RETURN ERROR:',
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
    <SafeAreaView
      style={globalStyles.safeArea}>

      <AppHeader
        title="Return Order"
        onBackPress={() =>
          navigation.goBack()
        }
      />

      <ScrollView
        contentContainerStyle={
          styles.container
        }>

        {/* REASON */}

        <View style={styles.card}>

          <Text style={styles.label}>
            Reason for Return *
          </Text>

          <TextInput
            style={styles.textArea}
            placeholder="Enter reason"
            placeholderTextColor={colors.placeholderTextColor  || '#A1887F' }
            multiline
            value={reason}
            onChangeText={setReason}
          />

        </View>

        {/* REFUND METHOD */}

        {!isOnlinePayment ? (

        <View style={styles.card}>

        <Text style={styles.label}>
            Refund Method
        </Text>

        <TouchableOpacity
            style={styles.radioRow}
            onPress={() =>
            setRefundMethod('WALLET')
            }>

            <View
            style={[
                styles.radioOuter,
                refundMethod === 'WALLET' &&
                styles.radioSelected,
            ]}
            />

            <Text style={styles.radioText}>
            Wallet Credit
            </Text>

        </TouchableOpacity>

        <TouchableOpacity
            style={styles.radioRow}
            onPress={() =>
            setRefundMethod('UPI')
            }>

            <View
            style={[
                styles.radioOuter,
                refundMethod === 'UPI' &&
                styles.radioSelected,
            ]}
            />

            <Text style={styles.radioText}>
            UPI
            </Text>

        </TouchableOpacity>

        <TouchableOpacity
            style={styles.radioRow}
            onPress={() =>
            setRefundMethod('BANK')
            }>

            <View
            style={[
                styles.radioOuter,
                refundMethod === 'BANK' &&
                styles.radioSelected,
            ]}
            />

            <Text style={styles.radioText}>
            Bank Account
            </Text>

        </TouchableOpacity>

        </View>

        ) : (

        <View style={styles.card}>

        <Text style={styles.label}>
            Refund Information
        </Text>

        <Text
            style={{
            fontSize: 15,
            color: '#666',
            lineHeight: 22,
            }}>
            Refund will be credited to
            your original payment source
            after return approval.
        </Text>

        </View>

        )}

        {/* UPI */}

        {refundMethod ===
          'UPI' && (

          <View
            style={styles.card}>

            <Text
              style={
                styles.label
              }>
              UPI ID
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={upiId}
              onChangeText={
                setUpiId
              }
              placeholder="example@ybl"
              placeholderTextColor={colors.placeholderTextColor || '#A1887F' }
            />

          </View>
        )}

        {/* BANK */}

        {refundMethod ===
          'BANK' && (

          <View
            style={styles.card}>

            <TextInput
              style={
                styles.input
              }
              placeholder="Account Holder Name"
              placeholderTextColor={colors.placeholderTextColor || '#A1887F' }
              value={
                accountHolderName
              }
              onChangeText={
                setAccountHolderName
              }
            />

            <TextInput
              style={
                styles.input
              }
              placeholder="Bank Name"
              placeholderTextColor={colors.placeholderTextColor || '#A1887F' }
              value={bankName}
              onChangeText={
                setBankName
              }
            />

            <TextInput
              style={
                styles.input
              }
              placeholder="Account Number"
              placeholderTextColor={colors.placeholderTextColor || '#A1887F' }
              keyboardType="number-pad"
              value={
                accountNumber
              }
              onChangeText={
                setAccountNumber
              }
            />

            <TextInput
              style={
                styles.input
              }
              placeholder="IFSC Code"
              autoCapitalize="characters"
              placeholderTextColor={colors.placeholderTextColor || '#A1887F' }
              value={ifscCode}
              onChangeText={
                setIfscCode
              }
            />

          </View>
        )}

        <TouchableOpacity
          disabled={loading}
          style={styles.submitBtn}
          onPress={
            submitReturnRequest
          }>

          {loading ? (
            <ActivityIndicator
              color="#fff"
            />
          ) : (
            <Text
              style={
                styles.submitText
              }>
              Submit Return Request
            </Text>
          )}

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );
};

export default ReturnOrderScreen;

const styles = StyleSheet.create({

  container: {
    padding: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },

  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minHeight: 120,
    padding: 12,
    textAlignVertical: 'top',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 12,
  },

  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
  },

  radioSelected: {
    backgroundColor:
      colors.primary,
  },

  radioText: {
    fontSize: 15,
    color: '#333',
  },

  submitBtn: {
    backgroundColor:
      colors.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 30,
  },

  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

});