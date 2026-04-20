import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import DefaultValueModal from './DefaultValueModal';

import { post } from '../../network/apiService';
import API from '../../network/apiEndpoints';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../localization/i18n';
import AppHeader from '../../components/AppHeader';
import { globalStyles, colors } from '../../styles/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateAddressAPI } from '../../services/productService'

const EditAddressScreen = ({ route, navigation }) => {
  const { address } = route.params;
  console.log("Editing address:", address);
  const [userName, setUserName] = useState(address.user_name);
  const [address1, setAddress1] = useState(address.address_1);
  const [address2, setAddress2] = useState(address.address_2);
  const [city, setCity] = useState(address.city);
  const [state, setState] = useState(address.state);
  const [zipCode, setZipCode] = useState(address.zip_code);
  const [landMark, setLandMark] = useState(address.land_mark);
  const [contactNo, setContactNo] = useState(address.contact_no);
  const [defaultValue, setDefaultValue] = useState(address.default_value || 'N');

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(address.latitude);
  const [longitude, setLongitude] = useState(address.longitude);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  
  useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', () => {
          setKeyboardVisible(true);
        });

        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
          setKeyboardVisible(false);
        });

        return () => {
          showSub.remove();
          hideSub.remove();
        };
    }, []);
  /* ✅ UPDATE ADDRESS */
 const handleUpdateAddress = async () => {
  try {
    setLoading(true);

    // ✅ Correct way to get user
    const userData = await AsyncStorage.getItem('USER_DATA');
    const parsedUser = userData ? JSON.parse(userData) : null;
    const userId = String(parsedUser?.id);

    if (!userId) {
      Alert.alert('Error', 'User not found');
      return;
    }
    
    

    const payload = {
      address_id: address.id, // verify this key
      user_id: userId,
      user_name: userName,
      address_1: address1,
      address_2: address2,
      city,
      state,
      zip_code: zipCode,
      contact_no: contactNo || '',
      default_value: defaultValue,
      latitude: latitude || '',
      longitude: longitude || '',
      land_mark: landMark,
    };

    console.log("Update payload:", payload);

    const response = await updateAddressAPI(payload);

    console.log("Update response:", response);

    if (response?.success) {
      Alert.alert('Success', 'Address updated successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', response?.message || 'Failed to update address');
    }

  } catch (error) {
    console.log("Update ERROR:", error);
    Alert.alert('Error', 'Network request failed');
  } finally {
    setLoading(false);
  }
};

  /* INPUT FIELD */
  const renderInput = (label, value, setter, keyboardType = 'default') => (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={globalStyles.input}
        value={value}
        onChangeText={setter}
        keyboardType={keyboardType}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
      {/* HEADER */}
      <AppHeader
        title={i18n.t('EDIT_ADDRESS') || 'EDIT ADDRESS'}
        onBackPress={() => navigation.goBack()}
      />

      {/* FORM */}
      <View style={styles.formContainer}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled">

          {renderInput('User Name', userName, setUserName)}
          {renderInput('Address 1', address1, setAddress1)}
          {renderInput('Address 2', address2, setAddress2)}
          {renderInput('City', city, setCity)}
          {renderInput('State', state, setState)}
          {renderInput('Zip Code', zipCode, setZipCode, 'numeric')}
          {renderInput('Landmark', landMark, setLandMark)}
          {renderInput('Contact No', contactNo, setContactNo, 'phone-pad')}

        </ScrollView>

        {/* DEFAULT BUTTON */}
        {!isKeyboardVisible && (
        <View style={{ padding: 15 }}>
            <TouchableOpacity
              style={styles.defaultAddressButton}
              onPress={() => {
                if (defaultValue !== 'Y') setModalVisible(true);
              }}
            >
          <Text style={styles.buttonText}>
            {defaultValue !== 'Y' ? 'Set Default Address' : 'Default Address'}
          </Text>
          </TouchableOpacity>

            {/* UPDATE BUTTON */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdateAddress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update Address</Text>
              )}
            </TouchableOpacity>
        </View>
      )}
      </View>

      {/* MODAL */}
      <DefaultValueModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        setUserData={(data) => setDefaultValue(data.default_value)}
        userData={{ default_value: defaultValue }}
      />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },

  backButton: {
    backgroundColor: 'black',
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },

  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },

  scrollContainer: {
    paddingBottom: 10,
  },

  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#555',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },

  defaultAddressButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  button: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EditAddressScreen;