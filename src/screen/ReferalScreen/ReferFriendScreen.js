import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  StyleSheet,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import AppHeader from '../../components/AppHeader';
import {getReferralCodeAPI} from '../../services/profileService';

const ReferFriendScreen = () => {

  const navigation = useNavigation();

  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    loadReferralCode();
  }, []);

  const loadReferralCode = async () => {

    const response = await getReferralCodeAPI();

    if (response?.status) {
      setReferralCode(response.data.referral_code);
    }
  };

  const shareReferral = async () => {

    try {

      await Share.share({

        message:
`🎉 Join Zepali!

Use my referral code:

${referralCode}

When you complete your first successful purchase, both of us will receive 200 reward points (₹100).

Download Zepali today :
https://play.google.com/store/apps/details?id=net.zepali.app`

      });

    } catch (e) {
      console.log(e);
    }
  };

  return (

    <SafeAreaView style={styles.container}>

      <AppHeader
        title="Refer a Friend"
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />

      <View style={styles.content}>

        <Text style={styles.title}>
          Your Referral Code
        </Text>

        <View style={styles.codeBox}>
          <Text style={styles.code}>
            {referralCode}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={shareReferral}>

          <Text style={styles.buttonText}>
            Share Referral Code
          </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
};

export default ReferFriendScreen;

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:'#fff',
  },

  content:{
    padding:20,
    alignItems:'center',
    marginTop:30,
  },

  title:{
    fontSize:20,
    fontWeight:'700',
  },

  codeBox:{
    marginTop:25,
    borderWidth:2,
    borderStyle:'dashed',
    borderRadius:12,
    paddingVertical:20,
    paddingHorizontal:40,
  },

  code:{
    fontSize:28,
    fontWeight:'700',
    letterSpacing:2,
  },

  button:{
    marginTop:30,
    backgroundColor:'#8B4513',
    paddingVertical:14,
    paddingHorizontal:30,
    borderRadius:10,
  },

  buttonText:{
    color:'#fff',
    fontWeight:'700',
    fontSize:16,
  },

});