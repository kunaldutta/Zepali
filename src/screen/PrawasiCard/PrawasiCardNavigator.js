import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import i18n from '../../localization/i18n';
import {globalStyles, colors} from '../../styles/globalStyles';

import PageOne from './PageOne';
import PageTwo from './PageTwo';
import PageThree from './PageThree';
import ReviewPage from './ReviewPage';
import { View } from 'react-native';

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