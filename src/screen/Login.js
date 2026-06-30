import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import {globalStyles,colors} from '../../src/styles/globalStyles';
import DeviceInfo from 'react-native-device-info';
import { BASE_URL } from '../network/apiClient';

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../localization/i18n';

import {post} from '../network/apiService';
import API from '../network/apiEndpoints';
import messaging from '@react-native-firebase/messaging';
import { sendOtpApi, verifyOtpApi } from '../services/otpService';
import { getAppConfigAPI } from '../services/serviceApi';
import * as Keychain from 'react-native-keychain';

//import auth from '@react-native-firebase/auth';

import RegisterModal from '../components/RegisterModal';
import LanguageModal from '../components/LanguageModal';
import CityModal from '../components/CityModal';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function Login({navigation, route}) {

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  // ❌ removed confirm (not needed)

  const [region, setRegion] = useState('IN');

  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [error, setError] = useState('');

  // ✅ FIX: start with mobile screen
  const [showOtpInput, setShowOtpInput] = useState(false);

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [showCityModal, setShowCityModal] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fcmToken, setFcmToken] = useState('');
  const [uuid, setUuid] = useState('');
  const [appConfig, setAppConfig] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  // useEffect(() => {
  //   loadLanguage();
  //   loadAppConfig();
  // }, []);
  useEffect(() => {
      
      if (route?.params?.reopenRegisterModal) {
        
        setShowRegisterModal(true);

        if (route?.params?.mobile) {
          setMobile(route.params.mobile);
        }

        if (route?.params?.name) {
          setName(route.params.name);
        }

        if (route?.params?.email) {
          setEmail(route.params.email);
        }

        if (route?.params?.acceptedTerms) {
          setAcceptedTerms(route.params.acceptedTerms);
        }

        if (route?.params?.fcmToken) {
            setFcmToken(route.params.fcmToken);
          }

          if (route?.params?.uuid) {
            setUuid(route.params.uuid);
          }

      }

    }, [route?.params]);

  useEffect(() => {

  async function init() {

    try {

      // App Config
      const appConfigResponse = await getAppConfigAPI();


      if (appConfigResponse?.status) {

        const config = appConfigResponse.data;

        setAppConfig(config);

        await AsyncStorage.setItem(
          'APP_CONFIG',
          JSON.stringify(config)
        );

      }

      // Language
      await loadLanguage();

      // Device Info
      const uniqueId = await DeviceInfo.getUniqueId();

      setUuid(uniqueId);

      // Notification Permission
      const authStatus =
        await messaging().requestPermission();

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled && Platform.OS !== 'ios') {

        await messaging().registerDeviceForRemoteMessages();

        const token = await messaging().getToken();

        setFcmToken(token);

      }

    } catch (error) {

      console.log('INIT ERROR:', error);

    }

  }

  init();

}, []);

  const loadLanguage = async () => {
    const lang = await AsyncStorage.getItem('appLanguage');
    if (lang) i18n.locale = lang;
  };

  const getCountryCode = () => region === 'NP' ? '+977' : '+91';

  const validateMobile = m => /^[0-9]{10}$/.test(m);

  const goBackToMobile = () => {
    setShowOtpInput(false);
    setOtp('');

    setError('');
  };

  // ✅ SEND OTP
  const sendOtp = async () => {

    setError('');

    if (!mobile || !validateMobile(mobile)) {
      setError(i18n.t('errorMobile'));
      return;
    }

    setLoading(true);

    try {

      const response = await sendOtpApi({
        mobile_no: mobile,
        country_code: getCountryCode(),
      });


      if (response.status) {

        setShowOtpInput(true);

        Alert.alert(
          'Success',
          'OTP sent successfully',
        );

      } else {

        setError(response.message || 'Failed to send OTP');
      }

    } catch (error) {

      console.log(error);

      Alert.alert(
        'Error',
        'OTP send failed',
      );
    }

    setLoading(false);
  };

  // ✅ VERIFY OTP + LOGIN API
  const verifyOtp = async () => {

    if (!otp) {
      setError('Enter OTP');
      return;
    }

    setLoading(true);

    try {

      const otpResponse = await verifyOtpApi({
        mobile_no: mobile,
        country_code: getCountryCode(),
        otp: otp,
      });


      if (!otpResponse.status) {

        setError(otpResponse.message || 'Invalid OTP');

        setLoading(false);
        return;
      }

      // OTP VERIFIED
      const json = await post(API.LOGIN, {
        mobile_no: mobile,
        country_code: getCountryCode(),
        uuid: uuid,
        fcm_token: fcmToken,
      });
      console.log("LOGIN RESPONSE =", json);
      if (json?.status) {

        await AsyncStorage.setItem(
          'USER_DATA',
          JSON.stringify(json.user),
        );

        await Keychain.setGenericPassword(
          'zepali',
          JSON.stringify({
            access_token: json.access_token,
            refresh_token: json.refresh_token,
            expires_in: json.expires_in,
          })
        );

        setShowLanguageModal(true);

      } else if (
        json.message?.toLowerCase().includes('not registered')
      ) {

        setShowRegisterModal(true);

      } else {

        setError(json.message);
      }

    } catch (error) {

      console.log(error);

      Alert.alert(
        'Error',
        'OTP verification failed',
      );
    }

    setLoading(false);
  };
  
  const registerUser = async () => {

    if (!acceptedTerms) {

      Alert.alert(
        'Terms Required',
        'Please accept Terms & Conditions and Privacy Policy'
      );

      return;
    }

    if (!name) return Alert.alert('Enter name');

    setRegisterLoading(true);

    try {
      const json = await post(API.REGISTER, {
        name,
        email,
        mobile_no: mobile,
        country_code: getCountryCode(),
        uuid: uuid,
        fcm_token: fcmToken,
        accepted_terms_version: appConfig?.legal_version || '1.0',
      });

      if (json.status) {
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(json.user));
        setShowRegisterModal(false);
        setShowLanguageModal(true);
      } else {
        Alert.alert(json.message);
      }

    } catch {
      Alert.alert('Registration failed');
    }

    setRegisterLoading(false);
  };

  // const selectLanguage = async lang => {
  //   try {
  //     i18n.locale = lang;
  //     await AsyncStorage.setItem('appLanguage', lang);
  //     setShowLanguageModal(false);
  //     globalThis.refreshApp();
  //   } catch {
  //     Alert.alert('Error', 'Language change failed');
  //   }
  // };

  const selectLanguage = async lang => {
    try {

      i18n.locale = lang;

      await AsyncStorage.setItem('appLanguage', lang);

      setShowLanguageModal(false);


      setShowCityModal(true);

    } catch {

      Alert.alert('Error', 'Language change failed');

    }
  };

  const selectCity = async city => {

    await AsyncStorage.setItem(
      'SELECTED_CITY',
      JSON.stringify(city)
    );
    await AsyncStorage.setItem('selectedCity', JSON.stringify(city));
    setSelectedCity(city);

    setShowCityModal(false);

    globalThis.refreshApp();
  };

  const skipCity = () => {

    setShowCityModal(false);

    globalThis.refreshApp();
  };

  return (

    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor:colors.background}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : -50}
    >

      <ScrollView
        contentContainerStyle={globalStyles.container2}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >

        <Image
          source={require('../Assets/LoginLogo/login-logo.png')}
          style={styles.logo}
        />

        <Text style={styles.title}>{i18n.t('login')}</Text>

        <View style={styles.outerCard}>

          <View style={styles.card}>

            {showOtpInput && (
              <>
                <Text style={styles.mobileText}>
                  OTP sent to {getCountryCode()} {mobile}
                </Text>
                <TouchableOpacity onPress={goBackToMobile}>
                  <Text style={styles.changeText}>Change Number</Text>
                </TouchableOpacity>
              </>
            )}

            {!showOtpInput ? (
              <View style={styles.inputRow}>
                <Text style={styles.code}>{getCountryCode()}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter mobile number"
                  placeholderTextColor={colors.placeholderTextColor || '#A1887F'}
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                placeholderTextColor={colors.placeholderTextColor || '#A1887F'}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
              />
            )}

                        {showOtpInput && (

              <TouchableOpacity
                onPress={sendOtp}
                disabled={resendLoading}
                style={styles.resendContainer}
              >

                {resendLoading ? (

                  <ActivityIndicator size="small" />

                ) : (

                  <Text style={styles.resendText}>
                    Resend OTP
                  </Text>

                )}

              </TouchableOpacity>

            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            

            <TouchableOpacity
                style={[
                  globalStyles.button,
                  { top: 10 },
                  (
                    (!showOtpInput && mobile.length !== 10) ||
                    (showOtpInput && otp.length !== 4)
                  ) && { opacity: 0.5 }
                ]}
                onPress={showOtpInput ? verifyOtp : sendOtp}
                disabled={
                  loading ||
                  (!showOtpInput && mobile.length !== 10) ||
                  (showOtpInput && otp.length !== 4)
                }
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={globalStyles.buttonText}>
                    {showOtpInput ? 'Verify OTP' : 'Send OTP'}
                  </Text>
                )}
              </TouchableOpacity>

          </View>

        </View>

      </ScrollView>

      <RegisterModal
        visible={showRegisterModal}
        name={name}
        email={email}
        setName={setName}
        setEmail={setEmail}
        acceptedTerms={acceptedTerms}
        setAcceptedTerms={setAcceptedTerms}
        onSubmit={registerUser}
        onClose={() => setShowRegisterModal(false)}
        loading={registerLoading}
        navigation={navigation}
        onTermsPress={() => {
          setShowRegisterModal(false);
          navigation.navigate('WebViewScreen', {
            url: `${BASE_URL}/terms_condition/user_register_terms_condition_privacy.html`,
            mobile,
            fcmToken,
            uuid,
            name,
            email,
            acceptedTerms,
            fromScreen: 'register',
          });

        }}
      />

      <LanguageModal visible={showLanguageModal} onSelect={selectLanguage} />
      <CityModal
        visible={showCityModal}
        cities={cities}
        onSelect={selectCity}
        onSkip={skipCity}
        showSkip={false}
      />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  logo:{ width:160, height:160, marginBottom:10 },

  title:{ fontSize:26, fontWeight:'700', marginBottom:20 },

  outerCard:{
    width:'100%',
    backgroundColor:'#eaeaea',
    borderRadius:24,
    padding:10
  },

  card:{
    backgroundColor:'#f8f8f8',
    borderRadius:16,
    padding:30,
    elevation:5,
    shadowColor:'#4f6ae1',
    shadowOffset:{width:0, height:12},
    shadowOpacity:1.25,
    shadowRadius:3.84
  },

  tabs:{ flexDirection:'row', marginBottom:15 },

  inputRow:{ flexDirection:'row', alignItems:'center', marginBottom:15 },

  code:{ marginRight:10, fontWeight:'600' },

  input:{
    flex:1,
    height:48,
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:10,
    paddingHorizontal:10,
    color:'#000',          // <-- add this
    backgroundColor:'#fff' // <-- recommended
  },

  buttonText:{ color:'#fff', fontWeight:'600' },

  error:{ color:'red', marginBottom:10 },

  mobileText:{ marginBottom:5 },

  changeText:{ color:'#007BFF', marginBottom:10 },
  resendContainer:{
  alignSelf:'flex-end',
  marginBottom:10,
},

resendText:{
  color:'#007BFF',
  fontSize:14,
  fontWeight:'600',
}

});