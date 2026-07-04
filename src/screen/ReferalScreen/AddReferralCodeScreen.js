import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import AppHeader from '../../components/AppHeader';
import {applyReferralCodeAPI} from '../../services/profileService';

const AddReferralCodeScreen = () => {

  const navigation = useNavigation();

  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const applyReferral = async () => {

    if (!referralCode.trim()) {

      Alert.alert(
        'Validation',
        'Please enter referral code.'
      );

      return;
    }

    try {

      setLoading(true);

      const response =
        await applyReferralCodeAPI({

          referral_code:
            referralCode.trim().toUpperCase(),

        });

      if (response?.status) {

        Alert.alert(

          'Success',

          response.message,

          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );

      } else {

        Alert.alert(
          'Error',
          response?.message || 'Invalid referral code'
        );
      }

    } catch (e) {
      if (e?.message?.includes('Network Error')|| e?.message?.includes('timeout')) {
                    Alert.alert('Connection error', 'Please check your connection');
                    return;
            }
      Alert.alert(
        'Error',
        'Something went wrong.'
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <SafeAreaView style={styles.container}>

      <AppHeader
        title="Referral Code"
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />

      <View style={styles.content}>

        <Text style={styles.heading}>
          Have a Referral Code?
        </Text>

        <Text style={styles.description}>
          Enter the referral code shared by your friend.
          Referral code can be applied only once.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Referral Code"
          value={referralCode}
          autoCapitalize="characters"
          onChangeText={setReferralCode}
          maxLength={20}
        />

        <TouchableOpacity
          style={styles.button}
          disabled={loading}
          onPress={applyReferral}>

          <Text style={styles.buttonText}>
            {loading ? 'Applying...' : 'Apply Referral Code'}
          </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
};

export default AddReferralCodeScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    padding: 20,
  },

  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 25,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
    marginBottom: 25,
  },

  button: {
    backgroundColor: '#087b92',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});