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

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../localization/i18n';

import {post} from '../network/apiService';
import API from '../network/apiEndpoints';

import auth from '@react-native-firebase/auth';

import RegisterModal from '../components/RegisterModal';
import LanguageModal from '../components/LanguageModal';

export default function Login() {

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [confirm, setConfirm] = useState(null);

  const [region, setRegion] = useState('IN');

  const [loading, setLoading] = useState(false); // OTP loading
  const [registerLoading, setRegisterLoading] = useState(false); // ✅ NEW

  const [error, setError] = useState('');

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadLanguage();
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
    setConfirm(null);
    setError('');
  };

  const sendOtp = async () => {

    setError('');

    if (!mobile || !validateMobile(mobile)) {
      setError(i18n.t('errorMobile'));
      return;
    }

    setLoading(true);

    try {
      const confirmation = await auth().signInWithPhoneNumber(getCountryCode() + mobile);
      setConfirm(confirmation);
      setShowOtpInput(true);
    } catch {
      Alert.alert('Error', 'OTP send failed');
    }

    setLoading(false);
  };

  const verifyOtp = async () => {

    if (!otp) {
      setError('Enter OTP');
      return;
    }

    setLoading(true);

    try {

      await confirm.confirm(otp);

      const json = await post(API.LOGIN, { mobile_no: mobile, country_code: getCountryCode() });

      if (json?.status) {
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(json.user));
        setShowLanguageModal(true);
      } else if (json.message?.toLowerCase().includes('not registered')) {
        setShowRegisterModal(true);
      } else {
        setError(json.message);
      }

    } catch {
      Alert.alert('Invalid OTP');
    }

    setLoading(false);
  };

  const registerUser = async () => {

  if (!name) return Alert.alert('Enter name');

  setRegisterLoading(true);

  try {

    const json = await post(API.REGISTER, {
      name,
      email,
      mobile_no: mobile,
      country_code: getCountryCode()   // ✅ ADD THIS
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

  const selectLanguage = async lang => {
    try {
      i18n.locale = lang;
      await AsyncStorage.setItem('appLanguage', lang);
      setShowLanguageModal(false);
      globalThis.refreshApp();
    } catch {
      Alert.alert('Error', 'Language change failed');
    }
  };

  return (

    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor:'#fff'}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >

        <Image
          source={require('../Assets/LoginLogo/login-logo.png')}
          style={styles.logo}
        />

        <Text style={styles.title}>{i18n.t('login')}</Text>

        <View style={styles.outerCard}>

          <View style={styles.card}>

            {!showOtpInput && (
              <View style={styles.tabs}>
                <TouchableOpacity
                  style={[styles.tab, region==='IN' && styles.activeTab]}
                  onPress={()=>setRegion('IN')}
                >
                  <Text style={[styles.tabText, region==='IN' && styles.activeTabText]}>
                    🇮🇳 India
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tab, region==='NP' && styles.activeTab]}
                  onPress={()=>setRegion('NP')}
                >
                  <Text style={[styles.tabText, region==='NP' && styles.activeTabText]}>
                    🇳🇵 Nepal
                  </Text>
                </TouchableOpacity>
              </View>
            )}

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
                  placeholderTextColor="#888"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                />
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                placeholderTextColor="#888"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
              />
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.button}
              onPress={showOtpInput ? verifyOtp : sendOtp}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff"/> :
                <Text style={styles.buttonText}>
                  {showOtpInput ? 'Verify OTP' : 'Send OTP'}
                </Text>}
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
        onSubmit={registerUser}
        onClose={()=>setShowRegisterModal(false)}
        loading={registerLoading}   // ✅ PASS
      />

      <LanguageModal visible={showLanguageModal} onSelect={selectLanguage} />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container:{
    flexGrow:1,
    justifyContent:'center',
    alignItems:'center',
    padding:20,
    backgroundColor:'#fff'
  },

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

  tab:{ flex:1, padding:10, borderRadius:10, backgroundColor:'#ddd', margin:4, alignItems:'center' },

  activeTab:{ backgroundColor:'#007BFF' },

  tabText:{ fontWeight:'600' },

  activeTabText:{ color:'#fff' },

  inputRow:{ flexDirection:'row', alignItems:'center', marginBottom:15 },

  code:{ marginRight:10, fontWeight:'600' },

  input:{ flex:1, height:48, borderWidth:1, borderColor:'#ccc', borderRadius:10, paddingHorizontal:10 },

  button:{ top:10, height:50, backgroundColor:'#007BFF', borderRadius:12, justifyContent:'center', alignItems:'center' },

  buttonText:{ color:'#fff', fontWeight:'600' },

  error:{ color:'red', marginBottom:10 },

  mobileText:{ marginBottom:5 },

  changeText:{ color:'#007BFF', marginBottom:10 }

});