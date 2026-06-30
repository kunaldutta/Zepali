import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  PermissionsAndroid,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../localization/i18n';
import AppHeader from '../../components/AppHeader';
import { globalStyles, colors } from '../../styles/globalStyles';
import { useAddress } from '../../components/AddressContext';
import DefaultValueModal from './DefaultValueModal';
import Geolocation from '@react-native-community/geolocation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CityModal from '../../components/CityModal';
import AreaModal from '../../components/AreaModal';
import {
  getCityPincodesAPI,
  getCitiesAPI,
} from '../../services/addressService';
import {forceLogout} from '../../utils/authUtils'


const AddAddress = ({ route, navigation }) => {
  const { addAddress } = useAddress();
  
  const {address_1, address_2, city, latitude, longitude, state, zip_code, area} = route.params || {};
  const [currentMapAddress, setCurrentMapAddress] = useState('')
  const [locationLoading, setLocationLoading] = useState(false);
  const [userData, setUserData] = useState({
    user_name: '',
    address_1: '',
    address_2: address_1 +  address_2,
    land_mark: '',
    contact_no: '',
    city: city,
    state: state,
    zip_code: zip_code,
    latitude: latitude,
    longitude: longitude,
    default_value: 'N',
    area: area,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const [areaModalVisible, setAreaModalVisible] = useState(false);

  const [selectedCityId, setSelectedCityId] = useState(null);

  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(area);

  /* ✅ LOAD USER (FIXED - moved from render) */
  useEffect(() => {
    if (userData.city) {
      loadCityId();
    }
  }, [userData.city]);

  const loadCityId = async () => {
    try {

      if (!userData?.city) {
        return;
      }


      const response = await getCitiesAPI();

      

      if (response?.status) {

        const cityObj = response.cities.find(
          item =>
            item.city_name?.trim().toLowerCase() ===
            userData.city?.trim().toLowerCase()
        );

        if (cityObj) {

          setSelectedCityId(cityObj.id);

        } else {

          setSelectedCityId(null);
        }
      }

    } catch (e) {

      console.log(
        'CITY FIND ERROR:',
        e
      );

      setSelectedCityId(null);
    }
  };
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("USER_DATA");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        if (parsedUser?.id) {
          setUserData(prev => ({
            ...prev,
          }));
        }
      } catch (err) {
        console.log("User load error:", err);
      }
    };

    loadUser();
  }, []);
  
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

  // ✅ LOCATION PERMISSION
const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

// ✅ GET CURRENT LOCATION
const getCurrentLocation = async () => {
  try {
    // ✅ Wait for UI frame to be ready (fix for Activity issue)
    await new Promise(resolve => setTimeout(resolve, 300));

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    setLocationLoading(true);

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        getAddressFromCoords(latitude, longitude);
        setLocationLoading(false);
      },
      async (error) => {
        console.log("DEVICE FAILED:", error.message);

        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();

          if (data?.latitude && data?.longitude) {
            getAddressFromCoords(data.latitude, data.longitude);
          } else {
            Alert.alert("Location Error", "Unable to fetch location");
          }
        } catch (e) {
          if (error?.message === 'No location provider available.') {
            Alert.alert("Location Error", "Please enable your location");
          } else {
            Alert.alert("Something went wrong", "Please check your internet connection");
          }
        } finally {
          setLocationLoading(false);
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      }
    );

  } catch (err) {
    console.log("LOCATION ERROR:", err);
    setLocationLoading(false);
  }
};

// ✅ GOOGLE GEOCODING
const GOOGLE_API_KEY = "AIzaSyASeQVPcvxEogcrrLg5MExUWcXAgYuJekY";

const getAddressFromCoords = async (lat, lng) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;


    const res = await fetch(url);
    const data = await res.json();


    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];
      let city = '', state = '', zip = '';

      result.address_components.forEach(comp => {
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
        if (comp.types.includes('postal_code')) zip = comp.long_name;
      });

      const fullAddress = result.formatted_address;
      const parts = fullAddress.split(',');

      // ✅ address_1 → first 2 parts
      const address1 = parts.slice(0, 2).join(',').trim();

      // ✅ address_2 → ONLY locality (3rd part)
      const address2 = parts.length > 2 ? parts[2].trim() : '';

    setUserData(prev => ({
      ...prev,
      address_1: address1,
      address_2: address2,
      city,
      state,
      zip_code: zip,
    }));

    } else {
      Alert.alert("Error", data.status);
    }

  } catch (e) {
    console.log("GEOCODE ERROR:", e);
  }
};
const openMapWithCurrentLocation = async () => {
  try {
    // ✅ FIX: wait for Activity to attach
    await new Promise(resolve => setTimeout(resolve, 300));

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        navigation.navigate('MapPicker', {
          latitude,
          longitude,
          onSelectLocation: (data) => {
            setUserData(prev => ({
              ...prev,
              ...data,
            }));
          },
        });
      },
      async (error) => {
        console.log("LOCATION ERROR:", error);

        // 🔥 fallback
        navigation.navigate('MapPicker', {
          latitude: 17.465809,
          longitude: 78.362732,
          onSelectLocation: (data) => {
            setUserData(prev => ({
              ...prev,
              ...data,
            }));
          },
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
      }
    );

  } catch (err) {
    console.log("MAP OPEN ERROR:", err);
  }
};
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
  /* ✅ ADD ADDRESS API */
  const sendDataToServer = async () => {
    if (!/^\d{10}$/.test(userData.contact_no)) {
    Alert.alert('Validation', 'Please enter a valid 10-digit contact number');
    return;
  }
  try {
    setLoading(true);


    const response = await addAddress(userData); // ✅ use context

    if (response?.success) {

      Alert.alert(
        'Success',
        response?.message || 'Address added successfully',
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
      if (!response?.status && response?.reason === 'Invalid User') {
          //need logout
          showInvalidUserAlert(response?.message)

          return;
      }
      Alert.alert('Error', response?.message || 'Something went wrong');
    }

  } catch (error) {
    console.log("Add Address ERROR:", error);
    Alert.alert('Error', 'Failed to add address');
  } finally {
    setLoading(false);
  }
};

  /* INPUT FIELD */
  const renderInput = (field, placeholder, keyboardType = 'default') => {

  const isMultiline = field === 'address_2';

  return (
    <View style={styles.inputContainer}>
      {userData[field] ? <Text style={styles.label}>{placeholder}</Text> : null}

      <TextInput
        style={[
          globalStyles.input,
          isMultiline && styles.multilineInput,
        ]}
        placeholder={placeholder}
        value={userData[field]}
        placeholderTextColor={colors.placeholderTextColor || '#A1887F'}
        onChangeText={(text) => {
          if (field === 'contact_no') {
            const numericText = text.replace(/[^0-9]/g, ''); // only digits
            setUserData({
              ...userData,
              [field]: numericText,
            });
          } else {
            setUserData({
              ...userData,
              [field]: text,
            });
          }
        }}
        keyboardType={keyboardType}
        maxLength={field === 'contact_no' ? 10 : undefined}
        multiline={isMultiline}
        numberOfLines={isMultiline ? 4 : 1}
        textAlignVertical={isMultiline ? 'top' : 'center'}
      />
    </View>
  );
};

  return (
    <SafeAreaView style={styles.containemain}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
    
    <View style={{ flex: 1 }}>

      {/* HEADER */}
      <AppHeader
        title={i18n.t('ADD_ADDRESS') || 'ADD ADDRESS'}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />

      {/* FORM */}
      <View style={{ flex: 1, backgroundColor: colors.background, }}>
        
        <ScrollView
          contentContainerStyle={[styles.container,{paddingBottom: isKeyboardVisible ? 300 : 150}]}
          keyboardShouldPersistTaps="handled"   // ✅ IMPORTANT
          showsVerticalScrollIndicator={false}
        >
          {renderInput('user_name', 'Name')}
          {renderInput('address_1', 'Building Name / Number')}
          {renderInput('address_2', 'Address Line 2')}
          {renderInput('land_mark', 'Landmark')}
          {renderInput('contact_no', 'Contact Number', 'phone-pad')}
          <View style={styles.inputContainer}>
              {userData.city ? (
                <Text style={styles.label}>City</Text>
              ) : null}

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
                    {userData.city || 'Select City'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          <View style={styles.inputContainer}>
            {userData.state ? (
              <Text style={styles.label}>State</Text>
            ) : null}

            <TextInput
              editable={false}
              value={userData.state}
              placeholder="State"
              style={globalStyles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            {userData.zip_code ? (
              <Text style={styles.label}>Zip Code</Text>
            ) : null}

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
                  {userData.zip_code || 'Select Area'}
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.label}>Area</Text>
          
                      <TextInput
                        editable={false}
                        value={selectedArea}
                        style={globalStyles.input}
                      />
          </View>
        </ScrollView>

        {/* FOOTER */}
        {!isKeyboardVisible && (<View style={styles.footer}>
          <Text style={styles.defaultlabel}>Default Address</Text>

          <TouchableOpacity
            style={styles.defauktAddressButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>
              {userData.default_value === 'Y' ? 'Yes' : 'No'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={sendDataToServer}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>)}

        {/* MODAL */}
        <DefaultValueModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          setUserData={setUserData}
          userData={userData}
        />
      </View>
      <CityModal
        visible={cityModalVisible}
        onSkip={() => setCityModalVisible(false)}
        showSkip={false} // ✅ hide skip for city selection
        onSelect={async (item) => {

          setCityModalVisible(false);

          setUserData(prev => ({
            ...prev,
            city: item.city_name,
            state: item.state,
            zip_code: '',
          }));

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
          setUserData(prev => ({
            ...prev,
            zip_code: item.pincode,
          }));
        }}
      />
    </View>

</KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* STYLES */
const styles = StyleSheet.create({
  containemain: {
    flex: 1,
    backgroundColor: colors.safeAreaColor,
  },
  multilineInput: {
  height: 70,
  paddingTop: 10, // makes typing start from top nicely
},
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },

  backButton: {
    backgroundColor: 'black',
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerContainer: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  container: {
    padding: 20,
    alignItems: 'center',
  },

  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },

  label: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#808988',
  },

  defaultlabel: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#808988',
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },

  footer: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: colors.safeAreaColor,
  },

  placeOrderButton: {
    backgroundColor: '#34495e',
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    marginBottom: 5,
  },

  defauktAddressButton: {
    backgroundColor: '#565a43',
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    marginBottom: 15,
  },

  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddAddress;