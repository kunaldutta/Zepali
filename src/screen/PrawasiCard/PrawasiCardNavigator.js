import React, {useState, useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import i18n from '../../localization/i18n';
import {globalStyles, colors} from '../../styles/globalStyles';

import PageOne from './PageOne';
import PageTwo from './PageTwo';
import PageThree from './PageThree';
import ReviewPage from './ReviewPage';
import { View, Alert } from 'react-native';
import AsyncStorage
from '@react-native-async-storage/async-storage';
import {forceLogout} from '../../utils/authUtils'

import {
  validateUserAPI,
} from '../../services/prawasiServices';

const PrawasiCardNavigator = ({navigation}) => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Page 1
    profilePhoto: null,
    otp: '',
    nepalAddress: '',
    for_whom: '',
    fullName: '',
    mobile: '',
    address: '',
    companyName: '',
    profession: '',
    gender: '',
    dob: '',
    guardianName: '',
    guardianRelation: '',
    // Page 2
    idType: '',
    secondIdType: '',
    citizenshipNumber: '',
    frontImage: null,
    backImage: null,
    indiaAddressProofType: '',
    indiaAddressProofFront: null,
    indiaAddressProofBack: null,
    zipCode: '',

    // Jamani 1
    jamani1Name: '',
    jamani1Mobile: '',
    jamani1Citizenship: '',
    jamani1Image: null,
    jamani1ImageBack: null,
    jamani1Relation: '',
    applicationStatus: null,

    // Jamani 2
    jamani2Name: '',
    jamani2Mobile: '',
    jamani2Citizenship: '',
    jamani2Image: null,
    jamani2ImageBack: null,
    jamani2Relation: '',
    

    // Jamani 3
    jamani3Name: '',
    jamani3Mobile: '',
    jamani3Id: '',
    jamani3Image: null,
    jamani3ImageBack: null,
    jamani3Relation: '',

    // Review
    paymentStatus: null,
  });

  const updateForm = data => {
    setFormData(prev => ({
      ...prev,
      ...data,
    }));
  };
useEffect(() => {

  validateUser();

}, []);

  const validateUser = async () => {

    try {

      const user =
        await AsyncStorage.getItem(
          'USER_DATA'
        );

      const parsedUser =
        user
          ? JSON.parse(user)
          : null;

      console.log(
        'Parsed User ===',
        parsedUser
      );

      if (!parsedUser?.id) {

        Alert.alert(
          'Logged Out',
          'Please login again',
          [
            {
              text: 'OK',
              onPress: forceLogout,
            },
          ]
        );

        return;
      }

      const response =
        await validateUserAPI({
          user_id: parsedUser.id,
        });

      if (!response?.status) {

        console.log(
          'Error ====',
          response
        );

        Alert.alert(
          'Account Issue',
          response?.message ||
            'Please login again',
          [
            {
              text: 'OK',
              onPress: forceLogout,
            },
          ]
        );
      }

    } catch (error) {

      console.log(
        'validateUser error:',
        error
      );
    }
  };
  

  return (
    <SafeAreaView style={globalStyles.safeArea}>
        <AppHeader
        title={i18n.t('PRAWASI_CARD_APPLICATION') || 'PRAWASI CARD APPLICATION'}
        onBackPress={() => {
            if (step === 1) {
        navigation.goBack();
        } else {
        setStep(step - 1);
        }}}
        showCart={false}
      />
      <View style={{flex: 1, backgroundColor: colors.background, padding: 16}}>
      {step === 1 && (
        <PageOne
          formData={formData}
          updateForm={updateForm}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <PageTwo
          formData={formData}
          updateForm={updateForm}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <PageThree
          formData={formData}
          updateForm={updateForm}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <ReviewPage
          formData={formData}
          onBack={() => setStep(3)}
        />
      )}
      </View>
    </SafeAreaView>
  );
};

export default PrawasiCardNavigator;