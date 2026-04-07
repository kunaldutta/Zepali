import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddress } from '../../components/AddressContext';
import { post } from '../../network/apiService';
import API from '../../network/apiEndpoints';
import DefaultValueModal from './DefaultValueModal'
import { colors } from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import i18n from '../../localization/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AddressListScreen = ({ route, navigation }) => {

  const { cartItems, totalPrice } = route.params || {};

  const [defaultModalVisible, setDefaultModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updatingAddress, setUpdatingAddress] = useState(false);
  const [userId, setUserId] = useState(null);
  const { deleteAddress } = useAddress();

  const {
    addresses,
    fetchAddresses,
    addressLoading,
    selectedAddress,
    setSelectedAddress,
  } = useAddress();

  /* ✅ LOAD USER SAFELY */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("USER_DATA");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        if (parsedUser?.id) {
          setUserId(String(parsedUser.id));
        }
      } catch (err) {
        console.log("User load error:", err);
      }
    };

    loadUser();
  }, []);

  /* ================= FETCH ON FOCUS ================= */
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  /* ================= SELECT ADDRESS ================= */
  const handleSelectAddress = (item) => {
    setSelectedItem(item);
    setDefaultModalVisible(true);
  };

  const handleDefaultSelection = (data) => {
    if (!selectedItem) return;

    if (data.default_value === 'Y') {
      updateDefaultAddress(selectedItem);
    } else {
      setSelectedAddress(selectedItem);
      navigation.goBack();
    }

    setDefaultModalVisible(false);
  };

  /* ================= UPDATE DEFAULT ================= */
  const updateDefaultAddress = async (item) => {
    if (!userId) return;

    setUpdatingAddress(true);

    try {
      const response = await post(API.UPDATE_DEFAULT_ADDRESS, {
        user_id: userId,
        address_id: item.id,
      });

      if (response?.success) {
        await fetchAddresses();

        const updatedDefault =
          addresses.find(addr => addr.default_value === 'Y') || item;

        setSelectedAddress(updatedDefault);

        navigation.goBack();
      } else {
        Alert.alert('Error', response?.message || 'Failed to update');
      }
    } catch (error) {
      console.log("updateDefaultAddress ERROR:", error);
      Alert.alert('Error', 'Network error');
    } finally {
      setUpdatingAddress(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteAddress = (address) => {
  Alert.alert(
    "Delete Address",
    "Are you sure you want to delete this address?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const response = await deleteAddress(address); // ✅ use context

            if (response?.success) {
              Alert.alert("Success", "Address deleted");
            } else {
              Alert.alert("Error", response?.message || "Delete failed");
            }
          } catch (error) {
            console.log("Delete ERROR:", error);
            Alert.alert("Error", "Network error");
          }
        },
      },
    ]
    );
  };

  /* ================= EDIT ================= */
  const handleEditAddress = (address) => {
    navigation.navigate('EditAddressScreen', { address });
  };

  /* ================= ADD ================= */
  const handlePlaceOrder = () => {
    navigation.navigate('MapPicker');
  };

  /* ================= CONTINUE ================= */
  const continuePlaceOrder = () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select an address');
      return;
    }

    navigation.navigate('PurchaseReviewScreen', {
      cartItems,
      totalPrice,
      address: selectedAddress,
    });
  };

  return (
    <SafeAreaView style={styles.containemain}>

      <AppHeader
        title={i18n.t('ADDRESS') || 'ADDRESS'}
        onBackPress={() => navigation.goBack()}
      />

      {updatingAddress && (
        <View style={styles.centerIndicator}>
          <ActivityIndicator size="large" color="#34495e" />
        </View>
      )}

      <View style={{height:'72%', backgroundColor:colors.background}}>
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => handleSelectAddress(item)}
            >
              <Ionicons
                name={
                  selectedAddress?.id === item.id
                    ? "checkbox"
                    : "square-outline"
                }
                size={24}
                color={
                  selectedAddress?.id === item.id
                    ? "#009688"
                    : "#000"
                }
              />

              <View style={styles.textContainer}>
                <Text style={{ fontWeight: 'bold' }}>{item?.user_name}</Text>
                <Text>{item?.address_1}</Text>
                {item?.address_2 !== 'NA' && <Text>{item?.address_2}</Text>}
                {item?.land_mark && item.land_mark !== 'NA' && (
                  <Text>{item?.land_mark}</Text>
                )}
                <Text>{item?.city}, {item?.state}</Text>
                <Text>{item?.zip_code}</Text>
                <Text>{item?.contact_no}</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity style={{marginTop: 10, height:50, width:50, right:1, alignContent:'center', alignItems:'center'}} onPress={() => handleDeleteAddress(item)}>
                  <Ionicons name="trash" size={20} color="red" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ marginTop: 10, height:50, width:50, right:1, alignItems:'center' }}
                  onPress={() => handleEditAddress(item)}
                >
                  <Ionicons name="create-outline" size={22} color="#3498db" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />

        {(addressLoading && !updatingAddress) && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#34495e" />
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
        <Text style={styles.buttonText}>Add New Address</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.placeOrderButton} onPress={continuePlaceOrder}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <DefaultValueModal
        modalVisible={defaultModalVisible}
        setModalVisible={setDefaultModalVisible}
        userData={selectedItem || {}}
        setUserData={handleDefaultSelection}
      />

    </SafeAreaView>
  );
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  containemain: { flex: 1, backgroundColor: colors.safeAreaColor },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },

  backButton: {
    backgroundColor: 'black',
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },

  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    margin: 10,
    backgroundColor: colors.productColumnBackground,
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },

  textContainer: {
    flex: 1,
    marginLeft: 10,
  },

  placeOrderButton: {
    backgroundColor: '#34495e',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },

  centerIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
});

export default AddressListScreen;