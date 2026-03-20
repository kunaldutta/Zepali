import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { useAddress } from '../../components/AddressContext';

const AddressListScreen = ({ route, navigation }) => {
  const userId = '16'; // Still hardcoded; consider making dynamic later
  const { cartItems, totalPrice } = route.params;
  const [addressCalled, setAddressCalled] = useState(false);

  // Get these from context
  const {
    addresses,
    fetchAddresses,
    addressloading,
    setGlobalAddressDetail,
  } = useAddress();

  const [updatingAddress, setUpdatingAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

useFocusEffect(

  useCallback(() => {
    const fetchData = async () => {
      // if (!addressCalled) {
        setAddressCalled(true);
        await fetchAddresses();
      // }
    };

    fetchData();
  }, [])
);

  // When addresses change, set selectedAddress to default or first
  React.useEffect(() => {
    if (addresses.length) {
      const defaultAddr = addresses.find(a => a.default_value === 'Y') || addresses[0];
      setSelectedAddress(defaultAddr?.id);
      setGlobalAddressDetail(defaultAddr);
    }
  }, [addresses]);

  const handleSelectAddress = (item) => {
    setSelectedAddress(item.id);
    Alert.alert(
      "Confirmation",
      "Would you like to make it default address?",
      [
        {
          text: "NO",
          onPress: () => {
            setGlobalAddressDetail(item);
            setSelectedAddress(item.id);
          },
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => updateDefaultAddress(item.id),
        },
      ],
      { cancelable: false }
    );
  };

  const updateDefaultAddress = async (id) => {
    setUpdatingAddress(true);
    try {
      const response = await fetch('https://developersdumka.in/ourmarket/Medicine/update_default_address.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_id: userId, address_id: id }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchAddresses();
      } else {
        Alert.alert('Error', data.message || 'Failed to update default address');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setUpdatingAddress(false);
    }
  };

  // ... Rest of your handlers (handleDeleteAddress, handleEditAddress, continuePlaceOrder, etc) remain same

  const handleDeleteAddress = async (address) => {
    
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const response = await axios.post(
                "https://developersdumka.in/ourmarket/Medicine/delete_address.php",
                { user_id: address.usr_id, address_id: address.id }
              );
              console.log('Deleting address:', response.data);
              if (response.data.success) {
                Alert.alert("Success", "Address deleted successfully");
                await fetchAddresses(); // Refresh the list
              } else {
                Alert.alert("Error", response.data.message || "Failed to delete address");
              }
            } catch (error) {
              Alert.alert("Error", error.response?.data?.error || "Network error");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };


  const handleEditAddress = (address) => {
    navigation.navigate('EditAddressScreen', { address });
  };
  const handlePlaceOrder = () => {
      //AddAddress
      setAddressCalled(false);
      navigation.navigate('AddAddress');
      // Alert.alert('Success', 'Proceeding with selected address.');
    };
    const continuePlaceOrder = () => {
      if (!selectedAddress) {
        Alert.alert('Error', 'Please select an address');
        return;
      }
    
      const selected = addresses.find(addr => addr.id === selectedAddress);
    
      if (!selected) {
        Alert.alert('Error', 'Selected address not found');
        return;
      }
    
      navigation.navigate('PurchaseReviewScreen', {
        cartItems,
        totalPrice,
        selectedAddress: selected, // pass selected address only
      });
    };
  if (addressloading && !updatingAddress) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#34495e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.containemain}>
          <View style={{height: '8%', width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ccc'}}>
                    <TouchableOpacity 
                      onPress={() => navigation.goBack()} 
                      style={styles.backButton}>
                      <Icon name="arrow-left" size={20} color="#fff" />
                    </TouchableOpacity>
                      <View style={{ 
                          height:'45%',
                          width: '75%',
                          alignItems: 'center',
                          alignContent:'center',}}>
                          <Text 
                              style={styles.headerTitle}
                          >
                              Select Address
                          </Text>
                      </View>
                  </View>
          {updatingAddress && (<View style={styles.centerIndicator}>
                                            <ActivityIndicator size="large" color="#34495e" />
                                        </View>)}
          <View style={{ height: '100%', width: '100%', backgroundColor: '#f8f9fa', top: 0 }}>
            <View style={{ padding: 10, height: '75%', overflow: 'visible' }}>
              
              <FlatList
                data={addresses}
                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelectAddress(item)}>
                    <Icon
                      name={selectedAddress === item.id ? "check-square" : "square-o"}
                      size={24}
                      color={selectedAddress === item.id ? "#009688" : "#000"}
                    />
                    <View style={styles.textContainer}>
                      <Text>Name: {item?.user_name}</Text>
                      <Text>Address: {item?.address_1}</Text>
                      {item?.address_2 !== 'NA' && (<Text>Address2: {item?.address_2}</Text>)}
                      {item?.land_mark && item.land_mark !== 'NA' && item.land_mark.trim() !== '' && (
                        <Text>Landmark: {item.land_mark}</Text>
                      )}
                      <Text>City: {item?.city}</Text>
                      <Text>State: {item?.state}</Text>
                      <Text>Zip Code: {item?.zip_code}</Text>
                      <Text>Contact Node: {item?.contact_no}</Text>
                    </View>
                    <View style={{height:'90%', top:0}}>
                    <TouchableOpacity onPress={() => handleDeleteAddress(item)}>
                                                <Icon name="trash" size={20} color="red" />
                                            </TouchableOpacity>
                    <TouchableOpacity style={{top:'30%'}} onPress={() => handleEditAddress(item)}>
                        <Icon name="edit" size={24} color="#3498db" />
                    </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
            <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
              <Text style={styles.buttonText}>Add New Address</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.placeOrderButton} onPress={continuePlaceOrder}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
  );
};

// Your styles...



const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 0,
    left: '2%',
    backgroundColor: '#f8f9fa',
    width: '96%',
  },
  itemContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  marginVertical: 8,
  marginHorizontal: 12,
  backgroundColor: '#fff',
  borderRadius: 10,
  shadowColor: '#000',
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 5, // For Android
},
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  placeOrderButton: {
    flexDirection: 'row',
    backgroundColor: '#34495e',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    width: '50%',
    left: '25%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  centerIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay
    zIndex: 10, // Ensure it appears above everything
  },
  headerTitle:{
        fontSize: 18,
        width:'100%',
        fontWeight: 'bold',
        textAlign: 'center',
        marginLeft: 10,
        flex: 1,
      },
});

export default AddressListScreen;