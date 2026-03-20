import React, { useState } from 'react';
import { View, TextInput, Button, Alert, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Text, Modal } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import DefaultValueModal from './DefaultValueModal';

const AddAddress = ({ navigation }) => {
  const [userData, setUserData] = useState({
    user_id: '16',
    user_name: '',
    address_1: '',
    address_2: '',
    land_mark: '',
    contact_no: '',
    city: '',
    state: '',
    zip_code: '',
    default_value: 'N',
  });

  const [modalVisible, setModalVisible] = useState(false);

  const sendDataToServer = async () => {
    try {
      console.log("Sending Data:", userData);
      const response = await axios.post(
        'https://developersdumka.in/ourmarket/Medicine/add_addresses.php',
        userData, // No need to stringify
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response?.data?.success) {
        Alert.alert('Success', response?.data?.message);
      }
    } catch (error) {
      if (error.response) {
        console.error("Server Error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("No response received from server:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    }
  };

  const renderInput = (field, placeholder, keyboardType = 'default') => (
    <View style={styles.inputContainer}>
      {userData[field] ? <Text style={styles.label}>{placeholder}</Text> : null}
      <TextInput
        placeholder={placeholder}
        value={userData[field]}
        onChangeText={(text) => setUserData({ ...userData, [field]: text })}
        style={styles.input}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.containemain}>
      <View style={{left:0,height: '8%', width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ccc'}}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Add Address</Text>
        </View>
      </View>

      <View style={{ top: 10, height: '90%' }}>
        <ScrollView contentContainerStyle={styles.container}>
          {renderInput('user_name', 'Name')}
          {renderInput('address_1', 'Address Line 1')}
          {renderInput('address_2', 'Address Line 2')}
          {renderInput('land_mark', 'Landmark')}
          {renderInput('contact_no', 'Contact Number', 'phone-pad')}
          {renderInput('city', 'City')}
          {renderInput('state', 'State')}
          {renderInput('zip_code', 'Zip Code', 'numeric')}
        </ScrollView>

        <View
          style={{
            height: '18%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: 'white',
          }}
        >
          <Text style={styles.defaultlabel}>Default Address</Text>

          <TouchableOpacity style={styles.defauktAddressButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>
              {userData.default_value === 'Y' ? 'Yes' : 'No'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.placeOrderButton} onPress={sendDataToServer}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <DefaultValueModal modalVisible={modalVisible} setModalVisible={setModalVisible} setUserData={setUserData} userData={userData} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containemain: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    backgroundColor: 'black',
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  headerContainer: {
    height: '45%',
    width: '35%',
    left: '20%',
    alignItems: 'center',
    alignContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    width: '100%',
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 10,
    flex: 1,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  label: {
    alignSelf: 'flex-start',
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
  placeOrderButton: {
    flexDirection: 'row',
    backgroundColor: '#34495e',
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    marginBottom: 5,
  },
  defauktAddressButton: {
    flexDirection: 'row',
    backgroundColor: '#565a43',
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    marginBottom: 15,
  },
  defaultButtonText: {
    fontSize: 16,
    color: '#333',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddAddress;
