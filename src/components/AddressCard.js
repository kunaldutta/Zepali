import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles/globalStyles';

const AddressCard = ({ selectedAddress, onPress }) => {
    console.log('Selected Address ==')
  return (
    <TouchableOpacity style={styles.addressContainer} onPress={onPress}>
      
      <View style={styles.row}>
        
        <View style={{ flex: 1 }}>
          <Text style={styles.addressTitle}>
            📍 Delivery Address
          </Text>

          {selectedAddress ? (
            <>
              {/* <Text style={styles.addressName}>
                {selectedAddress.user_name}
              </Text> */}

              <Text style={styles.addressText} >
                {selectedAddress.user_name}, {selectedAddress.address_1}, {selectedAddress.address_2}
              </Text>

              {/* <Text style={styles.addressText}>
                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zip_code}
              </Text> */}

              <Text style={styles.addressPhone}>
                📞 {selectedAddress.contact_no}
              </Text>
            </>
          ) : (
            <Text style={styles.addAddressText}>
              + Add Delivery Address
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color="#555" />
      </View>

    </TouchableOpacity>
  );
};

export default AddressCard;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  addressContainer: {
    margin: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: '#fff',
    top:0 
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  addressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.text,
  },

  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },

  addressText: {
    fontSize: 13,
    color: '#555',
    height: 30,
  },

  addressPhone: {
    fontSize: 13,
    marginTop: 5,
    color: colors.text,
  },

  addAddressText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
});