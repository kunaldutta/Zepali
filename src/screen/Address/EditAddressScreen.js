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
import CityModal from '../../components/CityModal';
import AreaModal from '../../components/AreaModal';
import {
  getCityPincodesAPI,
  getCitiesAPI,
} from '../../services/addressService';

const EditAddressScreen = ({ route, navigation }) => {
  const { address } = route.params;
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
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [areaModalVisible, setAreaModalVisible] = useState(false);

  const [selectedCityId, setSelectedCityId] = useState(null);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(address?.area);

  useEffect(() => {
    if (city) {
      loadCityId();
    }
  }, [city]);
  const loadCityId = async () => {
    try {

      const response = await getCitiesAPI();

      if (response.status) {

        const cityObj =
          response.cities.find(
            item =>
              item.city_name?.toLowerCase() ===
              city?.toLowerCase()
          );

        if (cityObj) {

          console.log(
            'CITY FOUND:',
            cityObj
          );

          setSelectedCityId(
            cityObj.id
          );
        }
      }

    } catch (e) {

      console.log(
        'CITY FIND ERROR',
        e
      );

    }
  };
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
  if (!/^\d{10}$/.test(contactNo)) {
    Alert.alert(
      'Validation',
      'Please enter a valid 10-digit contact number'
    );
    return;
  }
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


    const response = await updateAddressAPI(payload);


    if (response?.success) {
      
      Alert.alert(
              'Success',
              response?.message || 'User address updated successfully',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.pop(2);
                  },
                },
              ],
            );
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
  const renderInput = (
  label,
  value,
  setter,
  keyboardType = 'default'
) => {
  const isContactField = label === 'Contact No';

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={globalStyles.input}
        value={value}
        onChangeText={(text) => {
          if (isContactField) {
            setter(text.replace(/[^0-9]/g, ''));
          } else {
            setter(text);
          }
        }}
        keyboardType={keyboardType}
        maxLength={isContactField ? 10 : undefined}
      />
    </>
  );
};

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
          <Text style={styles.label}>City</Text>

          <TouchableOpacity
            onPress={() => setCityModalVisible(true)}
          >
            <View
              style={[
                globalStyles.input,
                {
                  justifyContent: 'center',
                  height: 50,
                },
              ]}
            >
              <Text>
                {city || 'Select City'}
              </Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.label}>State</Text>

            <TextInput
              editable={false}
              value={state}
              style={globalStyles.input}
            />
          <Text style={styles.label}>Zip Code</Text>

            <TouchableOpacity
              onPress={async () => {

                if (!selectedCityId) {
                  Alert.alert(
                    'Select City',
                    'Please select a city first'
                  );
                  return;
                }

                try {

                  const response =
                    await getCityPincodesAPI({
                      city_id: selectedCityId,
                    });

                  if (response.status) {

                    setAreas(
                      response.pincodes || []
                    );

                    setAreaModalVisible(true);
                  }

                } catch (e) {

                  console.log(e);

                }

              }}
            >
              <View
                style={[
                  globalStyles.input,
                  {
                    justifyContent: 'center',
                    height: 50,
                  },
                ]}
              >
                <Text>
                  {zipCode || 'Select Area'}
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.label}>Area</Text>

            <TextInput
              editable={false}
              value={selectedArea}
              style={globalStyles.input}
            />
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
      <CityModal
        visible={cityModalVisible}
        onSkip={() => setCityModalVisible(false)}
        showSkip={false}
        onSelect={async (item) => {

          setCityModalVisible(false);

          setCity(item.city_name);
          setState(item.state);
          setZipCode('');

          setSelectedCityId(item.id);

          try {

            const response =
              await getCityPincodesAPI({
                city_id: item.id,
              });

            if (response.status) {

              setAreas(
                response.pincodes || []
              );

              setAreaModalVisible(true);
            }

          } catch (e) {

            console.log(
              'PINCODE ERROR',
              e
            );
          }
        }}
      />
      <AreaModal
        visible={areaModalVisible}
        areas={areas}
        onSkip={() =>
          setAreaModalVisible(false)
        }
        onSelect={(item) => {

          setAreaModalVisible(false);
          setSelectedArea(item.area_name);
          setZipCode(
            item.pincode
          );

        }}
      />
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