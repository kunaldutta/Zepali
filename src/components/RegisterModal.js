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

export default function RegisterModal({
  visible,
  name,
  email,
  setName,
  setEmail,
  onSubmit,
  onClose,
  loading
}) {

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

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Complete Profile</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Name"
               placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email (Optional)"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
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
    backgroundColor:'#007BFF',
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
    color:'#333'
  }

});