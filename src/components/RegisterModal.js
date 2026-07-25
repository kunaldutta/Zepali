import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import {globalStyles,colors} from '../../src/styles/globalStyles';
import { BASE_URL } from '../network/apiEndpoints';

export default function RegisterModal({
  visible,
  name,
  email,
  setName,
  setEmail,
  acceptedTerms,
  setAcceptedTerms,
  onSubmit,
  onClose,
  loading,
  navigation,
  onTermsPress,
}) {
  const termsUrl = `${BASE_URL}/terms_condition/user_register_terms_condition_privacy.html`;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isEmailValid =
    email.trim() === '' || emailRegex.test(email.trim());

  const isSubmitDisabled =loading || !acceptedTerms || !isEmailValid;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>

          <View style={styles.modalBox}>


            <Text style={styles.modalTitle}>Complete Profile</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Name"
               placeholderTextColor={colors.placeholderTextColor || '#A1887F'}
              value={name}
              onChangeText={setName}
            />

            <TextInput
            style={[
              styles.input,
              email.trim() !== '' && !isEmailValid && styles.inputError
            ]}
            placeholder="Email (Optional)"
            placeholderTextColor={colors.placeholderTextColor || '#A1887F'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {email.trim() !== '' && !isEmailValid && (
            <Text style={styles.errorText}>
              Please enter a valid email address
            </Text>
          )}

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <Text style={styles.checkbox}>
                  {acceptedTerms ? '☑' : '☐'}
                </Text>

                <Text style={styles.termsText}>
                  I agree to the{' '}

                  <Text
                    style={styles.linkText}
                    onPress={onTermsPress}
                  >
                    Terms & Conditions
                  </Text>

                  {' '}and{' '}

                  <Text
                    style={styles.linkText}
                    onPress={() =>
                      navigation.navigate('WebViewScreen', {
                        url: termsUrl,
                      })
                    }
                  >
                    Privacy Policy
                  </Text>

                </Text>
              </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                isSubmitDisabled && { opacity: 0.5 }
              ]}
              onPress={onSubmit}
              disabled={isSubmitDisabled}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.secondary, marginTop: 10 }]}
              onPress={onClose}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>

          </View>

        </View>
      </TouchableWithoutFeedback>

    </Modal>
  );
}

const styles = StyleSheet.create({

  modalContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'rgba(0,0,0,0.4)'
  },

  modalBox:{
    width:300,
    backgroundColor:'#fff',
    borderRadius:12,
    padding:20,
    alignItems:'center',
    position:'relative'
  },

  modalTitle:{
    fontSize:18,
    fontWeight:'600',
    marginBottom:15,
    color:'#333'
  },

  input:{
    height:48,
    width:'100%',
    borderColor:'#ddd',
    borderWidth:1,
    borderRadius:8,
    paddingHorizontal:12,
    marginBottom:14,
    backgroundColor:'#fff'
  },

  button:{
    height:50,
    width:'100%',
    backgroundColor:colors.primary,
    borderRadius:10,
    justifyContent:'center',
    alignItems:'center'
  },

  buttonText:{
    color:'#fff',
    fontSize:16,
    fontWeight:'600'
  },

  closeButton:{
    position:'absolute',
    top:10,
    right:10,
    zIndex:10
  },

  closeText:{
    fontSize:18,
    fontWeight:'bold',
    color:'#40fafa'
  },
  checkboxContainer:{
      flexDirection:'row',
      alignItems:'flex-start',
      width:'100%',
      marginBottom:15
    },

    checkbox:{
      fontSize:22,
      marginRight:8
    },

    termsText:{
      flex:1,
      fontSize:13,
      color:'#444'
    },

    linkText:{
      color:'#007BFF',
      fontWeight:'600'
    },
    inputError: {
      borderColor: '#D32F2F',
    },

    errorText: {
      width: '100%',
      color: '#D32F2F',
      fontSize: 12,
      marginTop: -10,
      marginBottom: 10,
    },

});