import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  StyleSheet, SafeAreaView, ScrollView 
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import DefaultValueModal from './DefaultValueModal';

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

  const handleUpdateAddress = async () => {
    try {
      const response = await axios.post(
        'https://developersdumka.in/ourmarket/Medicine/update_addresses.php',
        {
          address_id: address.id,
          user_id: address.usr_id,
          user_name: userName,
          address_1: address1,
          address_2: address2,
          city,
          state,
          zip_code: zipCode,
          contact_no: contactNo || '', // Ensure it's included
          default_value: defaultValue,
          land_mark:landMark,
        }
      );
      console.log('response ====',response.data);
      if (response.data.success) {
        Alert.alert('Success', 'Address updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update address');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Network request failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={{ height: '5%', width: '100%', flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Add Address</Text>
              </View>
            </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.label}>User Name:</Text>
          <TextInput style={styles.input} value={userName} onChangeText={setUserName} />

          <Text style={styles.label}>Address 1:</Text>
          <TextInput style={styles.input} value={address1} onChangeText={setAddress1} />

          <Text style={styles.label}>Address 2:</Text>
          <TextInput style={styles.input} value={address2} onChangeText={setAddress2} />

          <Text style={styles.label}>City:</Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity} />

          <Text style={styles.label}>State:</Text>
          <TextInput style={styles.input} value={state} onChangeText={setState} />

          <Text style={styles.label}>Zip Code:</Text>
          <TextInput style={styles.input} value={zipCode} onChangeText={setZipCode} keyboardType="numeric" />

          <Text style={styles.label}>Landmark:</Text>
          <TextInput style={styles.input} value={landMark} onChangeText={setLandMark} />
          <Text style={styles.label}>Contact No:</Text>
          <TextInput style={styles.input} value={contactNo} onChangeText={setContactNo} />
        </ScrollView>

        {/* Set Default Address Button */}
        <TouchableOpacity style={styles.defaultAddressButton} onPress={() => {defaultValue !== 'Y' ? setModalVisible(true) : null}}>
          <Text style={styles.buttonText}>{defaultValue !== 'Y' ? 'Set Default Address' : 'Default Address'}</Text>
        </TouchableOpacity>

        {/* Update Button */}
        <TouchableOpacity style={styles.button} onPress={handleUpdateAddress}>
          <Text style={styles.buttonText}>Update Address</Text>
        </TouchableOpacity>
      </View>

      {/* Default Value Modal */}
      <DefaultValueModal 
        modalVisible={modalVisible} 
        setModalVisible={setModalVisible} 
        setUserData={(data) => setDefaultValue(data.default_value)} 
        userData={{ default_value: defaultValue }} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 20,
    backgroundColor: '#007BFF',
  },
  backButton: {
    backgroundColor: 'black',
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    left: 20,
  },
  headerContainer: {
    height: '60%',
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
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  defaultAddressButton: {
    backgroundColor: '#565a43',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditAddressScreen;
